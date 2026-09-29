import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse, stringify} from 'yaml';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = resolve(repositoryRoot, 'docs/testing/component-test-inventory.yaml');
const componentRoot = resolve(repositoryRoot, 'src/app');
const statuses = ['pending', 'dedicated', 'host', 'e2e', 'abstract'];

const toRepositoryPath = (path) => relative(repositoryRoot, path).replaceAll('\\', '/');

function findComponentFiles(directory = componentRoot) {
  return readdirSync(directory, {withFileTypes: true})
    .flatMap((entry) => {
      const entryPath = resolve(directory, entry.name);
      return entry.isDirectory() ? findComponentFiles(entryPath) : [entryPath];
    })
    .filter((path) => path.endsWith('.component.ts') && !path.endsWith('.component.spec.ts'))
    .map(toRepositoryPath)
    .sort();
}

function readInventory() {
  if (!existsSync(inventoryPath)) {
    return {version: 1, ...Object.fromEntries(statuses.map((status) => [status, {}]))};
  }

  const source = readFileSync(inventoryPath, 'utf8');
  const inventory = parse(source);
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
    throw new Error('The component test inventory must be a YAML mapping.');
  }
  return inventory;
}

function entriesFor(inventory, status) {
  const entries = inventory[status];
  if (entries === undefined || entries === null) {
    return {};
  }
  if (typeof entries !== 'object' || Array.isArray(entries)) {
    throw new Error(`The '${status}' group must be a YAML mapping.`);
  }
  return entries;
}

function normalizeInventory(inventory) {
  const normalized = {version: 1};
  for (const status of statuses) {
    const entries = entriesFor(inventory, status);
    normalized[status] = Object.fromEntries(Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)));
  }
  return normalized;
}

function serializeInventory(inventory) {
  return stringify(normalizeInventory(inventory), {lineWidth: 0});
}

function collectClassifications(inventory) {
  const classifications = new Map();
  for (const status of statuses) {
    for (const [componentPath, metadata] of Object.entries(entriesFor(inventory, status))) {
      const existing = classifications.get(componentPath) ?? [];
      existing.push({status, metadata});
      classifications.set(componentPath, existing);
    }
  }
  return classifications;
}

function validateEvidence(status, componentPath, metadata, errors) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    errors.push(`${componentPath}: inventory metadata must be a mapping.`);
    return;
  }

  const evidenceFields = ['coveredBy', 'hostedBy', 'implementedBy'];
  for (const field of evidenceFields) {
    if (metadata[field] === undefined) {
      continue;
    }
    if (!Array.isArray(metadata[field]) || metadata[field].length === 0 || metadata[field].some((value) => typeof value !== 'string')) {
      errors.push(`${componentPath}: '${field}' must be a non-empty list of repository paths.`);
      continue;
    }
    for (const evidencePath of metadata[field]) {
      if (!existsSync(resolve(repositoryRoot, evidencePath))) {
        errors.push(`${componentPath}: referenced evidence does not exist: ${evidencePath}`);
      }
    }
  }

  if (status === 'dedicated' && !metadata.coveredBy?.length) {
    errors.push(`${componentPath}: dedicated components require 'coveredBy' evidence.`);
  }
  if (status === 'host' && !metadata.hostedBy?.length && !metadata.coveredBy?.length) {
    errors.push(`${componentPath}: host-covered components require 'hostedBy' or 'coveredBy' evidence.`);
  }
  if (status === 'e2e' && !metadata.coveredBy?.length) {
    errors.push(`${componentPath}: e2e-covered components require 'coveredBy' evidence.`);
  }
  if (status === 'abstract' && !metadata.implementedBy?.length && !metadata.coveredBy?.length) {
    errors.push(`${componentPath}: abstract components require 'implementedBy' or 'coveredBy' evidence.`);
  }
}

function printCounts(inventory) {
  const counts = Object.fromEntries(statuses.map((status) => [status, Object.keys(entriesFor(inventory, status)).length]));
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const width = Math.max(...statuses.map((status) => status.length));
  for (const status of statuses) {
    console.log(`${status.padEnd(width)}: ${String(counts[status]).padStart(3)}`);
  }
  console.log(`${'total'.padEnd(width)}: ${String(total).padStart(3)}`);
}

function sync() {
  const inventory = readInventory();
  for (const status of statuses) {
    inventory[status] = entriesFor(inventory, status);
  }

  const components = findComponentFiles();
  const discovered = new Set(components);
  const classifications = collectClassifications(inventory);
  const added = components.filter((componentPath) => !classifications.has(componentPath));
  const stale = [...classifications.keys()].filter((componentPath) => !discovered.has(componentPath)).sort();

  for (const componentPath of added) {
    inventory.pending[componentPath] = {};
  }
  writeFileSync(inventoryPath, serializeInventory(inventory), 'utf8');

  console.log(`Synchronized ${toRepositoryPath(inventoryPath)}.`);
  console.log(`Added to pending: ${added.length}`);
  for (const componentPath of added) {
    console.log(`  + ${componentPath}`);
  }
  if (stale.length > 0) {
    console.error(`Stale entries (resolve manually): ${stale.length}`);
    for (const componentPath of stale) {
      console.error(`  - ${componentPath}`);
    }
    process.exitCode = 1;
  }
  printCounts(inventory);
}

function check({failOnPending = false} = {}) {
  const inventory = readInventory();
  const errors = [];
  const expectedTopLevelKeys = new Set(['version', ...statuses]);
  const unexpectedKeys = Object.keys(inventory).filter((key) => !expectedTopLevelKeys.has(key));

  if (inventory.version !== 1) {
    errors.push(`Unsupported inventory version '${inventory.version ?? 'missing'}'; expected 1.`);
  }
  for (const key of unexpectedKeys) {
    errors.push(`Unexpected top-level inventory key: ${key}`);
  }

  const components = findComponentFiles();
  const discovered = new Set(components);
  const classifications = collectClassifications(inventory);

  for (const componentPath of components) {
    const matches = classifications.get(componentPath) ?? [];
    if (matches.length === 0) {
      errors.push(`Missing component: ${componentPath} (run component-tests:sync).`);
    } else if (matches.length > 1) {
      errors.push(`Component appears in multiple groups: ${componentPath} (${matches.map(({status}) => status).join(', ')}).`);
    }
  }

  for (const [componentPath, matches] of classifications) {
    if (!discovered.has(componentPath)) {
      errors.push(`Stale component entry: ${componentPath}.`);
    }
    for (const {status, metadata} of matches) {
      validateEvidence(status, componentPath, metadata, errors);
    }
  }

  if (failOnPending && Object.keys(entriesFor(inventory, 'pending')).length > 0) {
    errors.push("The 'pending' group must be empty for full component-test coverage.");
  }

  const source = readFileSync(inventoryPath, 'utf8');
  if (source !== serializeInventory(inventory)) {
    errors.push('Inventory ordering or formatting is not deterministic; run component-tests:sync.');
  }

  printCounts(inventory);
  if (errors.length > 0) {
    console.error(`\nComponent test inventory check failed with ${errors.length} error(s):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log('\nComponent test inventory is valid.');
}

const mode = process.argv[2];
if (mode === 'sync') {
  sync();
} else if (mode === 'check') {
  check({failOnPending: process.argv.includes('--fail-on-pending')});
} else {
  console.error('Usage: node scripts/component-test-inventory.mjs <sync|check> [--fail-on-pending]');
  process.exitCode = 1;
}

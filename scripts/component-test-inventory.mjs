import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse, stringify} from 'yaml';

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = resolve(dirname(scriptPath), '..');
const statuses = ['pending', 'dedicated', 'host', 'e2e', 'abstract'];

function entriesFor(inventory, status) {
  const entries = inventory[status];
  if (entries === undefined || entries === null) {
    return {};
  }
  if (typeof entries !== 'object' || Array.isArray(entries)) {
    throw new TypeError(`The '${status}' group must be a YAML mapping.`);
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

function validateDiscoveredComponents(components, classifications, errors) {
  for (const componentPath of components) {
    const matches = classifications.get(componentPath) ?? [];
    if (matches.length === 0) {
      errors.push(`Missing component: ${componentPath} (run component-tests:sync).`);
    } else if (matches.length > 1) {
      errors.push(`Component appears in multiple groups: ${componentPath} (${matches.map(({status}) => status).join(', ')}).`);
    }
  }
}

/**
 * Creates the inventory tool for the given repository root. All output goes through the injected logger and both
 * commands return the process exit code, so the tool can be used in-process (e.g. in tests) without side effects on `process`.
 */
export function createInventoryTool({repositoryRoot = defaultRepositoryRoot, logger = console} = {}) {
  const inventoryPath = resolve(repositoryRoot, 'docs/testing/component-test-inventory.yaml');
  const componentRoot = resolve(repositoryRoot, 'src/app');

  const toRepositoryPath = (path) => relative(repositoryRoot, path).replaceAll('\\', '/');

  function listFiles(directory) {
    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
      const entryPath = resolve(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    });
  }

  function findComponentFiles() {
    return listFiles(componentRoot)
      .filter((path) => path.endsWith('.component.ts') && !path.endsWith('.component.spec.ts'))
      .map(toRepositoryPath)
      .sort((left, right) => left.localeCompare(right));
  }

  function readInventory() {
    if (!existsSync(inventoryPath)) {
      return {version: 1, ...Object.fromEntries(statuses.map((status) => [status, {}]))};
    }

    const source = readFileSync(inventoryPath, 'utf8');
    const inventory = parse(source);
    if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
      throw new TypeError('The component test inventory must be a YAML mapping.');
    }
    return inventory;
  }

  function validateEvidencePaths(componentPath, field, evidence, errors) {
    if (evidence === undefined) {
      return;
    }
    if (!Array.isArray(evidence) || evidence.length === 0 || evidence.some((value) => typeof value !== 'string')) {
      errors.push(`${componentPath}: '${field}' must be a non-empty list of repository paths.`);
      return;
    }
    for (const evidencePath of evidence) {
      if (!existsSync(resolve(repositoryRoot, evidencePath))) {
        errors.push(`${componentPath}: referenced evidence does not exist: ${evidencePath}`);
      }
    }
  }

  function validateEvidence(status, componentPath, metadata, errors) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      errors.push(`${componentPath}: inventory metadata must be a mapping.`);
      return;
    }

    for (const field of ['coveredBy', 'hostedBy', 'implementedBy']) {
      validateEvidencePaths(componentPath, field, metadata[field], errors);
    }

    if (status === 'dedicated' && !metadata.coveredBy?.length) {
      errors.push(`${componentPath}: dedicated components require 'coveredBy' evidence.`);
    }
    if (status === 'dedicated') {
      const siblingSpecPath = componentPath.replace(/\.component\.ts$/, '.component.spec.ts');
      if (typeof metadata.coverage === 'string' && !metadata.coveredBy?.includes(siblingSpecPath)) {
        errors.push(`${componentPath}: dedicated coverage must reference its sibling spec: ${siblingSpecPath}`);
      }
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
      logger.log(`${status.padEnd(width)}: ${String(counts[status]).padStart(3)}`);
    }
    logger.log(`${'total'.padEnd(width)}: ${String(total).padStart(3)}`);
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
    const stale = [...classifications.keys()]
      .filter((componentPath) => !discovered.has(componentPath))
      .sort((left, right) => left.localeCompare(right));

    for (const componentPath of added) {
      inventory.pending[componentPath] = {};
    }
    writeFileSync(inventoryPath, serializeInventory(inventory), 'utf8');

    logger.log(`Synchronized ${toRepositoryPath(inventoryPath)}.`);
    logger.log(`Added to pending: ${added.length}`);
    for (const componentPath of added) {
      logger.log(`  + ${componentPath}`);
    }
    if (stale.length > 0) {
      logger.error(`Stale entries (resolve manually): ${stale.length}`);
      for (const componentPath of stale) {
        logger.error(`  - ${componentPath}`);
      }
    }
    printCounts(inventory);
    return stale.length > 0 ? 1 : 0;
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
    validateDiscoveredComponents(components, classifications, errors);

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
      logger.error(`\nComponent test inventory check failed with ${errors.length} error(s):`);
      for (const error of errors) {
        logger.error(`  - ${error}`);
      }
      return 1;
    }
    logger.log('\nComponent test inventory is valid.');
    return 0;
  }

  return {sync, check};
}

/** Runs the CLI with the given arguments (without node and script path) and returns the exit code. */
export function run(args, options = {}) {
  const [mode] = args;
  const tool = createInventoryTool(options);
  if (mode === 'sync') {
    return tool.sync();
  }
  if (mode === 'check') {
    return tool.check({failOnPending: args.includes('--fail-on-pending')});
  }
  (options.logger ?? console).error('Usage: node scripts/component-test-inventory.mjs <sync|check> [--fail-on-pending]');
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  process.exitCode = run(process.argv.slice(2));
}

import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';
import {parse, stringify} from 'yaml';
import {run} from './component-test-inventory.mjs';

const inventoryFile = 'docs/testing/component-test-inventory.yaml';
const componentA = 'src/app/a/a.component.ts';
const componentB = 'src/app/b/nested/b.component.ts';

describe('component-test-inventory', () => {
  let repositoryRoot;
  let logs;
  let errors;

  const logger = {
    log: (message) => logs.push(message),
    error: (message) => errors.push(message),
  };

  const writeRepositoryFile = (path, content = '') => {
    const absolutePath = join(repositoryRoot, path);
    mkdirSync(dirname(absolutePath), {recursive: true});
    writeFileSync(absolutePath, content, 'utf8');
  };

  const writeInventory = (inventory) => writeRepositoryFile(inventoryFile, stringify(inventory, {lineWidth: 0}));
  const readInventory = () => parse(readFileSync(join(repositoryRoot, inventoryFile), 'utf8'));
  const emptyGroups = {pending: {}, dedicated: {}, host: {}, e2e: {}, abstract: {}};
  const execute = (...args) => run(args, {repositoryRoot, logger});
  const allErrors = () => errors.join('\n');

  beforeEach(() => {
    repositoryRoot = mkdtempSync(join(tmpdir(), 'component-test-inventory-'));
    logs = [];
    errors = [];
  });

  afterEach(() => {
    rmSync(repositoryRoot, {recursive: true, force: true});
  });

  describe('run', () => {
    it('prints the usage and fails without a mode', () => {
      assert.equal(execute(), 1);
      assert.match(allErrors(), /Usage: node scripts\/component-test-inventory\.mjs/);
    });

    it('prints the usage and fails for an unknown mode', () => {
      assert.equal(execute('unknown'), 1);
      assert.match(allErrors(), /Usage:/);
    });
  });

  describe('sync', () => {
    it('creates a missing inventory with all discovered components as pending', () => {
      writeRepositoryFile(componentB);
      writeRepositoryFile(componentA);
      mkdirSync(join(repositoryRoot, 'docs/testing'), {recursive: true});

      assert.equal(execute('sync'), 0);

      assert.deepEqual(readInventory(), {version: 1, ...emptyGroups, pending: {[componentA]: {}, [componentB]: {}}});
      assert.ok(logs.includes('Added to pending: 2'));
      assert.ok(logs.includes(`  + ${componentA}`));
    });

    it('ignores spec files and non-component files', () => {
      writeRepositoryFile(componentA);
      writeRepositoryFile('src/app/a/a.component.spec.ts');
      writeRepositoryFile('src/app/a/a.service.ts');
      writeRepositoryFile('src/app/a/a.component.html');
      mkdirSync(join(repositoryRoot, 'docs/testing'), {recursive: true});

      assert.equal(execute('sync'), 0);

      assert.deepEqual(Object.keys(readInventory().pending), [componentA]);
    });

    it('keeps existing classifications and only adds unclassified components to pending', () => {
      writeRepositoryFile(componentA);
      writeRepositoryFile(componentB);
      writeRepositoryFile('src/app/a/a.component.spec.ts');
      writeInventory({
        version: 1,
        ...emptyGroups,
        dedicated: {[componentA]: {coveredBy: ['src/app/a/a.component.spec.ts']}},
      });

      assert.equal(execute('sync'), 0);

      const inventory = readInventory();
      assert.deepEqual(inventory.dedicated, {[componentA]: {coveredBy: ['src/app/a/a.component.spec.ts']}});
      assert.deepEqual(inventory.pending, {[componentB]: {}});
      assert.ok(logs.includes('Added to pending: 1'));
    });

    it('reports stale entries, keeps them and fails', () => {
      writeRepositoryFile(componentA);
      writeInventory({version: 1, ...emptyGroups, pending: {[componentA]: {}, 'src/app/gone/gone.component.ts': {}}});

      assert.equal(execute('sync'), 1);

      assert.match(allErrors(), /Stale entries \(resolve manually\): 1/);
      assert.match(allErrors(), /- src\/app\/gone\/gone\.component\.ts/);
      assert.ok('src/app/gone/gone.component.ts' in readInventory().pending);
    });

    it('writes a sorted, normalized inventory that is idempotent', () => {
      writeRepositoryFile(componentA);
      writeRepositoryFile(componentB);
      writeInventory({e2e: {}, pending: {[componentB]: {}, [componentA]: {}}, version: 1});

      assert.equal(execute('sync'), 0);
      const first = readFileSync(join(repositoryRoot, inventoryFile), 'utf8');
      assert.deepEqual(Object.keys(parse(first)), ['version', 'pending', 'dedicated', 'host', 'e2e', 'abstract']);
      assert.deepEqual(Object.keys(parse(first).pending), [componentA, componentB]);

      assert.equal(execute('sync'), 0);
      assert.equal(readFileSync(join(repositoryRoot, inventoryFile), 'utf8'), first);
    });

    it('rejects an inventory that is not a mapping', () => {
      writeRepositoryFile(inventoryFile, '- a\n- b\n');
      mkdirSync(join(repositoryRoot, 'src/app'), {recursive: true});

      assert.throws(() => execute('sync'), /must be a YAML mapping/);
    });

    it('rejects a group that is not a mapping', () => {
      writeInventory({version: 1, pending: ['a']});
      mkdirSync(join(repositoryRoot, 'src/app'), {recursive: true});

      assert.throws(() => execute('sync'), /The 'pending' group must be a YAML mapping/);
    });
  });

  describe('check', () => {
    it('passes for a complete, valid inventory', () => {
      writeRepositoryFile(componentA);
      writeRepositoryFile(componentB);
      writeRepositoryFile('src/app/a/a.component.spec.ts');
      writeInventory({
        version: 1,
        ...emptyGroups,
        dedicated: {[componentA]: {coveredBy: ['src/app/a/a.component.spec.ts']}},
        pending: {[componentB]: {}},
      });

      assert.equal(execute('check'), 0);

      assert.deepEqual(errors, []);
      assert.ok(logs.includes('\nComponent test inventory is valid.'));
      assert.ok(logs.includes('total    :   2'));
    });

    it('fails for a discovered component missing from the inventory', () => {
      writeRepositoryFile(componentA);
      writeInventory({version: 1, ...emptyGroups});

      assert.equal(execute('check'), 1);
      assert.match(allErrors(), new RegExp(`Missing component: ${componentA}`));
    });

    it('fails for a component classified in multiple groups', () => {
      writeRepositoryFile(componentA);
      writeRepositoryFile('e2e/a.spec.ts');
      writeInventory({version: 1, ...emptyGroups, pending: {[componentA]: {}}, e2e: {[componentA]: {coveredBy: ['e2e/a.spec.ts']}}});

      assert.equal(execute('check'), 1);
      assert.match(allErrors(), /appears in multiple groups: .*\(pending, e2e\)/);
    });

    it('fails for stale entries', () => {
      mkdirSync(join(repositoryRoot, 'src/app'), {recursive: true});
      writeInventory({version: 1, ...emptyGroups, pending: {'src/app/gone/gone.component.ts': {}}});

      assert.equal(execute('check'), 1);
      assert.match(allErrors(), /Stale component entry: src\/app\/gone\/gone\.component\.ts/);
    });

    it('fails for an unsupported version and unexpected top-level keys', () => {
      mkdirSync(join(repositoryRoot, 'src/app'), {recursive: true});
      writeInventory({version: 2, ...emptyGroups, extra: {}});

      assert.equal(execute('check'), 1);
      assert.match(allErrors(), /Unsupported inventory version '2'; expected 1/);
      assert.match(allErrors(), /Unexpected top-level inventory key: extra/);
    });

    it('fails for a missing version', () => {
      mkdirSync(join(repositoryRoot, 'src/app'), {recursive: true});
      writeInventory(emptyGroups);

      assert.equal(execute('check'), 1);
      assert.match(allErrors(), /Unsupported inventory version 'missing'/);
    });

    it('fails for non-deterministic ordering or formatting', () => {
      writeRepositoryFile(componentA);
      writeRepositoryFile(componentB);
      writeInventory({version: 1, ...emptyGroups, pending: {[componentB]: {}, [componentA]: {}}});

      assert.equal(execute('check'), 1);
      assert.match(allErrors(), /not deterministic; run component-tests:sync/);
    });

    describe('--fail-on-pending', () => {
      beforeEach(() => {
        writeRepositoryFile(componentA);
        writeInventory({version: 1, ...emptyGroups, pending: {[componentA]: {}}});
      });

      it('fails while components are pending', () => {
        assert.equal(execute('check', '--fail-on-pending'), 1);
        assert.match(allErrors(), /The 'pending' group must be empty/);
      });

      it('is ignored without the flag', () => {
        assert.equal(execute('check'), 0);
      });
    });

    describe('evidence', () => {
      const evidenceFile = 'src/app/a/a.component.spec.ts';
      const classify = (status, metadata) => {
        writeRepositoryFile(componentA);
        writeRepositoryFile(evidenceFile);
        writeInventory({version: 1, ...emptyGroups, [status]: {[componentA]: metadata}});
      };

      it('passes for existing evidence', () => {
        classify('dedicated', {coveredBy: [evidenceFile]});
        assert.equal(execute('check'), 0);
      });

      it('fails for evidence that does not exist', () => {
        classify('dedicated', {coveredBy: ['src/app/a/missing.spec.ts']});
        assert.equal(execute('check'), 1);
        assert.match(allErrors(), /referenced evidence does not exist: src\/app\/a\/missing\.spec\.ts/);
      });

      for (const evidence of [[], 'a string', [1], {key: 'value'}]) {
        it(`fails for malformed evidence ${JSON.stringify(evidence)}`, () => {
          classify('dedicated', {coveredBy: evidence});
          assert.equal(execute('check'), 1);
          assert.match(allErrors(), /'coveredBy' must be a non-empty list of repository paths/);
        });
      }

      it('fails for metadata that is not a mapping', () => {
        classify('dedicated', ['not', 'a', 'mapping']);
        assert.equal(execute('check'), 1);
        assert.match(allErrors(), /inventory metadata must be a mapping/);
      });

      it('allows pending components without evidence', () => {
        classify('pending', {});
        assert.equal(execute('check'), 0);
      });

      const requirements = [
        {
          status: 'dedicated',
          accepted: ['coveredBy'],
          rejected: ['hostedBy', 'implementedBy'],
          message: /dedicated components require 'coveredBy'/,
        },
        {status: 'host', accepted: ['hostedBy', 'coveredBy'], rejected: ['implementedBy'], message: /host-covered components require/},
        {
          status: 'e2e',
          accepted: ['coveredBy'],
          rejected: ['hostedBy', 'implementedBy'],
          message: /e2e-covered components require 'coveredBy'/,
        },
        {status: 'abstract', accepted: ['implementedBy', 'coveredBy'], rejected: ['hostedBy'], message: /abstract components require/},
      ];

      for (const {status, accepted, rejected, message} of requirements) {
        describe(`${status} status`, () => {
          it('fails without evidence', () => {
            classify(status, {});
            assert.equal(execute('check'), 1);
            assert.match(allErrors(), message);
          });

          for (const field of accepted) {
            it(`passes with '${field}'`, () => {
              classify(status, {[field]: [evidenceFile]});
              assert.equal(execute('check'), 0);
            });
          }

          for (const field of rejected) {
            it(`fails with only '${field}'`, () => {
              classify(status, {[field]: [evidenceFile]});
              assert.equal(execute('check'), 1);
              assert.match(allErrors(), message);
            });
          }
        });
      }
    });
  });
});

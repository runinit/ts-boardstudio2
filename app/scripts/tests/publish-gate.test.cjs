const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

test('CI verifies the whole workspace without deployment or package publication', () => {
  const root = path.join(__dirname, '../../..');
  const source = fs.readFileSync(path.join(root, '.github/workflows/check.yaml'), 'utf8');
  const { jobs } = yaml.load(source);
  const commands = jobs.check.steps.map((step) => step.run || '').join('\n');
  for (const command of ['install --frozen-lockfile', 'test:engine', 'test:footprints', 'test:release', 'precommit', 'run build', 'test:e2e']) {
    assert.ok(commands.includes(command), `Missing gate: ${command}`);
  }
  assert.doesNotMatch(source, /deploy-pages|upload-pages|pnpm publish|submodules:/);
  assert.equal(require('../../../package.json').private, true);
  assert.equal(require('../../package.json').private, true);
});

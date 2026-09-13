const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const root = path.join(__dirname, '../../..');
test('resolves engine and footprints from the shared workspace lockfile', () => {
  const pkg = require('../../package.json');
  const lock = yaml.load(fs.readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8'));
  assert.equal(pkg.dependencies.ergogen, 'workspace:@runinit/ergogen@*');
  assert.equal(lock.importers.app.dependencies.ergogen.version, 'link:../engine');
  assert.equal(lock.importers.app.devDependencies['@boardstudio/footprints'].version, 'link:../footprints');
  assert.equal(require('ergogen/package.json').name, '@runinit/ergogen');
  assert.equal(require('@boardstudio/footprints/package.json').name, '@boardstudio/footprints');
  assert.equal(fs.existsSync(path.join(root, 'app/.gitmodules')), false);
  for (const component of ['app', 'engine', 'footprints']) {
    assert.equal(fs.existsSync(path.join(root, component, 'pnpm-lock.yaml')), false);
  }
});

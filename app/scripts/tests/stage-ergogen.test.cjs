const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { stageErgogen } = require('../../patch/stage_ergogen');

test('stages a linked generator without changing its source', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ergogen-stage-test-'));
  try {
    const source = path.join(root, 'source');
    const installed = path.join(root, 'installed');
    fs.mkdirSync(path.join(source, 'src'), { recursive: true });
    fs.writeFileSync(path.join(source, 'src', 'ergogen.js'), 'original');
    fs.writeFileSync(path.join(source, 'package.json'), '{"version":"5.0.0"}');
    fs.mkdirSync(path.join(source, 'node_modules', 'fixture'), { recursive: true });
    fs.writeFileSync(path.join(source, 'node_modules', 'fixture', 'index.js'), 'module.exports = 42;');
    fs.symlinkSync(source, installed);
    const stage = stageErgogen(installed, root);
    assert.equal(require(path.join(stage, 'node_modules', 'fixture')), 42);
    assert.equal(fs.realpathSync(path.join(stage, 'node_modules')), path.join(source, 'node_modules'));
    fs.writeFileSync(path.join(stage, 'src', 'ergogen.js'), 'patched');
    assert.equal(fs.readFileSync(path.join(source, 'src', 'ergogen.js'), 'utf8'), 'original');
    assert.notEqual(fs.realpathSync(stage), fs.realpathSync(installed));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('builds outside the workspace using the resolved Rollup executable', () => {
  const { buildErgogen } = require('../../patch/stage_ergogen');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'engine-build-test-'));
  try {
    const source = path.join(root, 'source');
    fs.mkdirSync(path.join(source, 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(source, 'node_modules/rollup/dist/bin'), { recursive: true });
    fs.writeFileSync(path.join(source, 'scripts/build-schema.js'), '');
    fs.writeFileSync(path.join(source, 'node_modules/rollup/package.json'), '{"name":"rollup"}');
    fs.writeFileSync(path.join(source, 'node_modules/rollup/dist/bin/rollup'), "require('node:fs').writeFileSync('built', 'ok');");
    const stage = stageErgogen(source, root);
    buildErgogen(stage);
    assert.equal(fs.readFileSync(path.join(stage, 'built'), 'utf8'), 'ok');
    assert.equal(fs.existsSync(path.join(source, 'built')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

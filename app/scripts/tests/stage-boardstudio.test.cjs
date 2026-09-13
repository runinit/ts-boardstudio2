const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { stage } = require('../../patch/stage_boardstudio.cjs');

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boardstudio-'));
  fs.mkdirSync(path.join(root, 'manifest'));
  fs.mkdirSync(path.join(root, 'vendor', 'infused-kim'), { recursive: true });
  const files = {
    'switch_mx.js': 'module.exports = { body: () => "mx" };\n',
    'vendor/infused-kim/choc.js': 'module.exports = { body: () => "choc" };\n',
  };
  for (const [relative, content] of Object.entries(files)) {
    const file = path.join(root, relative);
    fs.writeFileSync(file, content);
  }
  const manifest = {
    schema: 1,
    footprints: {
      ceoloide: { 'switch_mx.js': hash(files['switch_mx.js']) },
      'infused-kim': {
        'vendor/infused-kim/choc.js': hash(files['vendor/infused-kim/choc.js']),
      },
    },
  };
  fs.writeFileSync(
    path.join(root, 'manifest', 'sources.json'),
    JSON.stringify(manifest)
  );
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'engine-'));
  fs.mkdirSync(path.join(output, 'src', 'footprints', 'bhkfp'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(output, 'src', 'footprints', 'bhkfp', 'keep.js'),
    'keep'
  );
  return { root, output };
}

test('stages verified modular sources and preserves native files', () => {
  const { root, output } = fixture();
  assert.deepEqual(stage(root, output), { ceoloide: 1, infusedKim: 1 });
  assert.equal(
    fs.readFileSync(
      path.join(output, 'src/footprints/ceoloide/switch_mx.js'),
      'utf8'
    ),
    'module.exports = { body: () => "mx" };\n'
  );
  assert.equal(
    fs.readFileSync(path.join(output, 'src/footprints/bhkfp/keep.js'), 'utf8'),
    'keep'
  );
});

test('rejects unlisted files before changing output', () => {
  const { root, output } = fixture();
  fs.writeFileSync(path.join(root, 'extra.js'), 'extra');
  assert.throws(() => stage(root, output), /manifest does not match/);
  assert.equal(
    fs.existsSync(path.join(output, 'src/footprints/ceoloide')),
    false
  );
});

test('rejects modified files before changing output', () => {
  const { root, output } = fixture();
  fs.appendFileSync(path.join(root, 'switch_mx.js'), 'changed');
  assert.throws(() => stage(root, output), /Hash mismatch/);
  assert.equal(
    fs.existsSync(path.join(output, 'src/footprints/ceoloide')),
    false
  );
});

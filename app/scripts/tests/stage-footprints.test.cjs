const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { stageFootprints } = require('../../patch/stage_footprints');

test('stages quoted namespaces and unquoted builtins without evaluating modules', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'footprints-stage-test-'));
  try {
    const directory = path.join(root, 'src/footprints');
    fs.mkdirSync(directory, { recursive: true });
    const source = 'throw new Error("must not evaluate footprint source");';
    fs.writeFileSync(path.join(directory, 'source.js'), source);
    fs.writeFileSync(path.join(directory, 'index.js'), `
throw new Error("must not evaluate registry");
module.exports = {
  alps: require('./source'),
  promicro : require("./source.js"),
  'ceoloide/switch_mx': require('./source'),
  "bhkfp/cap_0603": require('./source'),
  'infused-kimo/isde': require('./source'),
  // ignored: require('./absent'),
  dynamic: require(variable),
};`);
    const output = path.join(root, 'generated/footprints.json');
    stageFootprints(root, output);
    assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), {
      alps: source,
      promicro: source,
      'ceoloide/switch_mx': source,
      'bhkfp/cap_0603': source,
      'infused-kimo/isde': source,
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('stages every existing registered builtin and namespaced footprint', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'footprints-register-test-'));
  try {
    const directory = path.join(root, 'src/footprints');
    fs.mkdirSync(directory, { recursive: true });
    fs.copyFileSync(path.join(__dirname, '../../patch/footprints_index.js'),
      path.join(directory, 'index.js'));
    const manifest = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../../../footprints/manifest/sources.json'), 'utf8'));
    const names = [
      'alps', 'button', 'choc', 'chocmini', 'diode', 'jstph', 'jumper', 'mx',
      'oled', 'omron', 'pad', 'promicro', 'rgb', 'rotary', 'scrollwheel',
      'slider', 'trrs', 'via', 'bhkfp/cap_0603', 'bhkfp/thqwgd001c',
      ...Object.keys(manifest.footprints.ceoloide).map(file => `ceoloide/${path.basename(file, '.js')}`),
      ...Object.keys(manifest.footprints['infused-kim']).map(file => `infused-kim/${path.basename(file, '.js')}`),
    ];
    for (const name of names) {
      const file = path.join(directory, `${name}.js`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `source:${name}`);
    }
    const output = path.join(root, 'catalogue.json');
    stageFootprints(root, output);
    const catalogue = JSON.parse(fs.readFileSync(output, 'utf8'));
    assert.deepEqual(Object.keys(catalogue).sort(), [...names, 'infused-kimo/isde'].sort());
    for (const name of names) assert.equal(catalogue[name], `source:${name}`);
    assert.equal(catalogue['infused-kimo/isde'], catalogue['infused-kim/diode']);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

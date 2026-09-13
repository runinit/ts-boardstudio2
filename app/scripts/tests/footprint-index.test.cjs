const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('exposes the Infused-Kim diode under its library namespace', () => {
  const context = { module: { exports: {} }, require: (file) => file };
  const source = fs.readFileSync(
    path.join(__dirname, '../../patch/footprints_index.js'),
    'utf8'
  );
  vm.runInNewContext(source, context);

  assert.equal(
    context.module.exports['infused-kim/diode'],
    './infused-kim/diode.js'
  );
});

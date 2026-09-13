const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');

test('Infused-Kim point debugger emits parseable reference text', () => {
  const footprint = require(
    path.resolve(
      __dirname,
      '../../vendor/boardstudio-footprints/vendor/infused-kim/point_debugger.js'
    )
  );
  const source = footprint.body({
    at: '(at 1 2 0)',
    ref: 'P1',
    ref_hide: '',
    rot: 0,
    enabled: true,
  });
  assert.match(source, /\(fp_text reference P1 \(at 0 2\)/);
  assert.doesNotMatch(source, /P1"\(at/);
});

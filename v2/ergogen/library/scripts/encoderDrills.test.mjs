import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const footprint = require('../rotary_encoder_ec11_ec12.js');

for (const side of ['F', 'B']) {
  for (const angle of [0, 90]) {
    const params = {
      ...footprint.params, side, r: angle, at: `(at 0 0 ${angle})`,
      ref: 'RE1', ref_hide: '',
      A: '(net 1 "A")', B: '(net 2 "GND")', C: '(net 3 "C")',
      S1: '(net 4 "SW1")', S2: '(net 5 "SW2")',
    };
    const pads = source => source.split('\n').filter(line => /\(pad "(?:A|B|C|S1|S2)"/.test(line));
    const legacy = pads(footprint.body(params));
    assert.equal(legacy.length, 5);
    assert.ok(legacy.every(line => line.includes('(size 1.6 1.1) (drill oval 1 0.5)')));

    // Alps specifies five round signal holes; changing drills must retain nets and centers.
    const round = pads(footprint.body({ ...params, signal_hole_width: 1, signal_hole_height: 1 }));
    assert.equal(round.length, 5);
    assert.ok(round.every(line => line.includes('(size 1.6 1.6) (drill 1)')));
    const geometry = line => line.replace(/\(size [^)]*\) \(drill [^)]*\)/, '');
    assert.deepEqual(round.map(geometry), legacy.map(geometry));
    assert.throws(() => footprint.body({ ...params, signal_hole_width: 0 }), /signal hole/);
  }
}

// Imported assets can have spaces; KiCad requires one quoted filename token.
const filename = '/tmp/encoder models/EC11E-05SW.STEP';
const output = footprint.body({
  ...footprint.params, at: '(at 0 0)', r: 0, ref: 'RE1', ref_hide: '',
  encoder_3dmodel_filename: filename,
});
assert.ok(output.includes(`(model ${JSON.stringify(filename)}`));

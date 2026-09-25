import assert from 'node:assert/strict';
import fp from '../vendor/infused-kim/choc.js';
const params = { ...fp.params, at: '(at 0 0)', ref: 'SW1', ref_hide: '', rot: 0, from: { str: '(net 1 "from")' }, to: { str: '(net 2 "to")' } };
assert.match(fp.body(params), /\(model .*Choc_V1_Hotswap/);
const solder = fp.body({ ...params, hotswap: false, solder: true });
assert.doesNotMatch(solder, /\(model .*Choc_V1_Hotswap/);
assert.match(solder, /\(model .*Choc_V1_Switch/);
assert.match(solder, /\(model .*Choc_V1_Keycap/);

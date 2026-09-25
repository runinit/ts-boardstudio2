import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const net = { str: '(net 1 "signal")', name: 'signal', index: 1, toString() { return this.str; } };
let checked = 0;
const files = ['', 'vendor/infused-kim/'].flatMap(directory =>
  readdirSync(new URL(`../${directory}`, import.meta.url))
    .filter(name => name.endsWith('.js')).map(name => directory + name));
for (const file of files) {
  const fp = require(`../${file}`);
  const keys = Object.keys(fp.params).filter(key => key.endsWith('_3dmodel_filename'));
  if (!keys.length) { continue; }
  const params = Object.fromEntries(Object.entries(fp.params).map(([key, value]) => [key, value?.type === 'net' ? net : value]));
  Object.assign(params, { at: '(at 0 0 0)', r: 0, rot: 0, ref: 'QA1', ref_hide: '', from: net, to: net, P1: net, P2: net, P3: net, P4: net, local_net: () => net, eaxy: (x, y) => `${x} ${y}` });
  for (const key of keys) { params[key] = `/tmp/model folder/${key}.step`; }
  const output = fp.body(params);
  const models = output.split('\n').filter(line => /\(model\s/.test(line));
  assert.ok(models.length, `${file}: no models emitted`);
  for (const line of models) {
    assert.match(line, /\(model "\/tmp\/model folder\/[^"\n]+\.step"/, `${file}: filename must be one quoted token`);
    checked++;
  }
}
console.log(`Verified ${checked} model path tokens`);

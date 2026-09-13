import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { bindDefaults } from '../src/defaultModels.mjs';
const context = { module: { exports: {} } };
vm.runInNewContext(bindDefaults(
  await readFile(new URL('../switch_gateron_ks27_ks33.js', import.meta.url), 'utf8'),
  'ceoloide/switch_gateron_ks27_ks33',
), context);
const fp = context.module.exports;
assert.equal(fp.params.switch_3dmodel_filename, '${KIPRJMOD}/models/boardstudio/gdek/KS33.stp');

for (const side of ['F', 'B']) {
  for (const hotswap of [false, true]) {
    const p = {
      ...fp.params, side, hotswap, at: '(at 0 0)', r: 0,
      ref: 'SW1', ref_hide: '', from: { str: '(net 1 "in")' },
      to: { str: '(net 2 "out")' },
    };
    const back = side === 'B';
    const rotation = hotswap ? (back ? '180 0 0' : '0 180 0') : (back ? '0 0 180' : '0 0 0');
    const x = (back === hotswap) ? -60 : 60;
    const z = hotswap ? 1.65 : -3.25;
    const pcb = fp.body(p);
    assert.ok(pcb.includes(`(offset (xyz ${x} 0 ${z}))`));
    assert.ok(pcb.includes(`(rotate (xyz ${rotation}))`));
    const custom = fp.body({ ...p, switch_3dmodel_xyz_offset: [1, 2, 3], switch_3dmodel_xyz_rotation: [4, 5, 6] });
    assert.ok(custom.includes('(offset (xyz 1 2 3))'));
    assert.ok(custom.includes('(rotate (xyz 4 5 6))'));
  }
}

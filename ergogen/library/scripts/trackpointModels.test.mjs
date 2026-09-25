import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { bindDefaults } from '../src/defaultModels.mjs';
const context = { module: { exports: {} } };
vm.runInNewContext(bindDefaults(
  await readFile(new URL('../vendor/infused-kim/trackpoint_mount.js', import.meta.url), 'utf8'),
  'infused-kim/trackpoint_mount',
), context);
const fp = context.module.exports;
const params = { ...fp.params, at: '(at 0 0)', ref: 'TP1', ref_hide: '', rot: 0 };
assert.doesNotThrow(() => fp.body(params));
assert.throws(() => fp.body({ ...params, drill: 3.5 }), /extension requires a center drill of at least 5 mm/);
assert.doesNotThrow(() => fp.body({ ...params, drill: 3.5, tp_extension_3dmodel_filename: 'custom.step' }));
assert.doesNotThrow(() => fp.body({ ...params, drill: 3.5, tp_extension_3dmodel_filename: '' }));
assert.doesNotThrow(() => fp.body({ ...params, drill: 3.5, tp_extension_3dmodel_xyz_scale: [0.5, 0.5, 1] }));

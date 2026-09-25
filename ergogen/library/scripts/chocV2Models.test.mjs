import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {bindDefaults} from '../src/defaultModels.mjs';

const context = {module:{exports:{}}};
vm.runInNewContext(bindDefaults(await readFile(new URL('../switch_choc_v1_v2.js',import.meta.url),'utf8'),'ceoloide/switch_choc_v1_v2'),context);
const footprint=context.module.exports;
const params={...footprint.params,choc_v1_support:false,choc_v2_support:true,at:'(at 0 0)',r:0,ref:'SW1',ref_hide:'',from:{str:'(net 1 "input")'},to:{str:'(net 2 "output")'},eaxy:(x,y)=>`${x} ${y}`};
const output=footprint.body(params);
assert.match(output,/koktoh\/Choc_V2_Red\.step/);
assert.match(output,/Choc_V1_Hotswap\.step/);
assert.doesNotMatch(output,/Choc_V1_Switch|Keycap_MBK/);
assert.match(footprint.body({...params,switch_3dmodel_filename:'custom.step'}),/custom\.step/);
assert.doesNotMatch(footprint.body({...params,choc_v2_support:false}),/\(model/);

for (const changes of [
  {include_stabilizer_pad:false},
  {oval_stabilizer_pad:true},
  {center_hole_diameter:4.7},
]) {
  assert.throws(() => footprint.body({...params,...changes}), /round stabilizer hole/);
  assert.doesNotThrow(() => footprint.body({...params,...changes,switch_3dmodel_filename:'custom.step'}));
}
assert.doesNotThrow(() => footprint.body({...params,center_hole_diameter:4.8}));
assert.doesNotMatch(footprint.body({...params,hotswap:false,solder:true}), /Choc_V1_Hotswap/);
for (const [side,rotation] of [['F','180 0 0'],['B','0 180 0']]) {
  const rendered=footprint.body({...params,side});
  const model=rendered.slice(rendered.indexOf('(model "${KIPRJMOD}/models/boardstudio/koktoh/'));
  assert.ok(model.includes(`(rotate (xyz ${rotation}))`));
  assert.ok(model.includes('(offset (xyz 0 0 -1.6))'));
}
const custom=footprint.body({...params,switch_3dmodel_xyz_rotation:[10,20,30],switch_3dmodel_xyz_offset:[1,2,3]});
assert.ok(custom.includes('(rotate (xyz 10 20 30))'));
assert.ok(custom.includes('(offset (xyz 1 2 3))'));

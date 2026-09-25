import assert from 'node:assert/strict';
import footprint from '../switch_choc_v1_v2.js';
const base={...footprint.params,choc_v1_support:false,choc_v2_support:true,hotswap:true,solder:true,at:'(at 0 0)',r:0,ref:'SW1',ref_hide:'',from:{str:'(net 1 "input")'},to:{str:'(net 2 "output")'},eaxy:(x,y)=>`${x} ${y}`};
for(const side of ['F','B']) {
 const output=footprint.body({...base,side});
 assert.equal([...output.matchAll(/\(drill 1\.6\)/g)].length,2,`${side}: both mounting choices need a stabilizer hole`);
 assert.equal([...footprint.body({...base,side,solder:false}).matchAll(/\(drill 1\.6\)/g)].length,1);
}

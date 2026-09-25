import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const engine = require('../../engine/src/ergogen');
const { parse } = require('../../engine/src/templates/sexpr');
const child = (n, k) => n.find(x => Array.isArray(x) && x[0] === k);
const children = (n, k) => n.filter(x => Array.isArray(x) && x[0] === k);
const atom = x => x?.startsWith('"') ? JSON.parse(x) : x;
const vector = n => n.slice(1).map(Number);
const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.002;
let count = 0;
const failures = [];
async function generate(name, params, rotation) {
  engine.inject('footprint', 'refresh_switch', require(`../${name}.js`));
  const config = {schema:'ergogen/v1',layout:{objects:{key:{kind:'key',pcb:'main',placement:{at:[10,12,0],rotate:rotation},footprints:{switch:{what:'refresh_switch',params:{from:'FROM',to:'TO',...params}}}}}},designs:{regions:{board:{shape:{size:[80,60]}}},profiles:{board:{from:'regions.board'}}},pcbs:{main:{profile:'profiles.board'}}};
  const result = await engine.process(config, {debug:true});
  const nodes = parse(result.pcbs.main, 'native switch regression')[0];
  const fp = nodes.find(n => Array.isArray(n) && ['footprint','module'].includes(n[0]));
  const pads = children(fp, 'pad');
  const names = Object.fromEntries(pads.map(p => child(p,'net')).filter(Boolean).map(n => [n[1],atom(n[2])]));
  const net = n => names[child(n,'net')?.[1]] || atom(child(n,'net')?.[1]) || '';
  const origin = vector(child(fp,'at'));
  const rad = (origin[2] || 0) * Math.PI / 180;
  const world = p => {const [x,y] = vector(child(p,'at')); return [origin[0]+x*Math.cos(rad)+y*Math.sin(rad),origin[1]-x*Math.sin(rad)+y*Math.cos(rad)];};
  const contains = (pad, point) => {
    const center = world(pad), dx = point[0] - center[0], dy = point[1] - center[1];
    const local = [dx*Math.cos(rad)-dy*Math.sin(rad),dx*Math.sin(rad)+dy*Math.cos(rad)];
    const size = vector(child(pad,'size'));
    return Math.abs(local[0]) <= size[0]/2 + 0.002 && Math.abs(local[1]) <= size[1]/2 + 0.002;
  };
  return {pads, nodes, net, world, contains};
}
async function check(label, name, params, rotation, verify) {
  count++;
  try { verify(await generate(name, params, rotation)); }
  catch (error) { failures.push(`${label} r${rotation}: ${error.message}`); }
}
for (const rotation of [0,37,90]) {
  for (const name of ['switch_mx','switch_choc_v1_v2']) {
    for (const side of ['F','B']) for (const reversible of [false,true]) for (const hotswap_pads_same_side of [false,true]) for (const include_plated_holes of [false,true]) {
      await check('socket contacts',name,{side,reversible,hotswap_pads_same_side,include_plated_holes},rotation,({pads,net}) => {
        for (const layer of reversible ? ['F.Cu','B.Cu'] : [`${side}.Cu`]) {
          const contacts = pads.filter(p => p[2] === 'smd' && child(p,'layers').slice(1).map(atom).includes(layer));
          assert.deepEqual(new Set(contacts.map(net)),new Set(['FROM','TO']),`${name} ${JSON.stringify({side,reversible,hotswap_pads_same_side,include_plated_holes})} ${layer}`);
        }
      });
    }
    for (const side of ['F','B']) for (const reversible of [false,true]) for (const hotswap of [false,true]) {
      await check('solder contacts',name,{side,reversible,hotswap,solder:true},rotation,({pads,net}) => {
        const solder = pads.filter(p => p[2] === 'thru_hole' && ['1','2'].includes(atom(p[1])));
        assert.deepEqual(new Set(solder.map(net)),new Set(['FROM','TO']));
      });
    }
  }
  for (const same of [false,true]) for (const width of [1.6,2.6]) await check('route ownership','switch_mx',{reversible:true,hotswap_pads_same_side:same,outer_pad_width_front:width,outer_pad_width_back:width},rotation,({pads,nodes,net,contains}) => {
    const segments = children(nodes,'segment');
    const vias = children(nodes,'via');
    assert.ok(segments.length && vias.length);
    const copperPads = pads.filter(p => p[2] === 'smd');
    for (const pad of copperPads) assert.ok(segments.some(s => child(pad,'layers').slice(1).map(atom).includes(atom(child(s,'layer')[1])) && [vector(child(s,'start')),vector(child(s,'end'))].some(point => contains(pad,point))), 'socket contact must meet a route');
    for (const s of segments) {
      const points = [vector(child(s,'start')),vector(child(s,'end'))];
      const layer = atom(child(s,'layer')[1]);
      for (const pad of pads.filter(p => p[2] === 'smd' && child(p,'layers').slice(1).map(atom).includes(layer))) {
        if (points.some(p => contains(pad,p))) assert.equal(net(s),net(pad),'track meets unlike pad');
      }
      for (const other of segments.filter(o => atom(child(o,'layer')[1]) === layer)) {
        if (points.some(p => [vector(child(other,'start')),vector(child(other,'end'))].some(q => near(p,q)))) assert.equal(net(s),net(other),'mixed track junction');
      }
      for (const via of vias) if (points.some(p => near(p,vector(child(via,'at'))))) assert.equal(net(s),net(via),'mixed via junction');
    }
  });
  for (const include_plated_holes of [false,true]) for (const include_centerhole_net of [false,true]) for (const include_stabilizer_nets of [false,true]) {
    await check('mount net flags','switch_mx',{include_plated_holes,include_centerhole_net,include_stabilizer_nets,CENTERHOLE:'CENTER',LEFTSTAB:'LEFT',RIGHTSTAB:'RIGHT'},rotation,({pads,net}) => {
      const mounts = pads.filter(p => vector(child(p,'at'))[1] === 0);
      assert.equal(mounts.length,3);
      for (const pad of mounts) {
        const x = vector(child(pad,'at'))[0];
        assert.equal(net(pad),include_plated_holes && (x === 0 ? include_centerhole_net : include_stabilizer_nets) ? (x === 0 ? 'CENTER' : x > 0 ? 'RIGHT' : 'LEFT') : '');
      }
    });
  }
  for (const side of ['F','B']) await check('outer width','switch_mx',{side,outer_pad_width_front:1.6,outer_pad_width_back:2.0},rotation,({pads}) => {
    const pad = pads.find(p => p[2] === 'smd' && Math.abs(vector(child(p,'at'))[0]) > 6);
    const width = vector(child(pad,'size'))[0];
    assert.ok(Math.abs(width - (side === 'F' ? 1.6 : 2.0)) < 1e-8);
    assert.ok(Math.abs(Math.abs(vector(child(pad,'at'))[0]) - width/2 - 5.81) < 1e-8,'inner edge remains fixed');
  });
}
console.log(`${count} native engine-generated switch cases; ${failures.length} failures`);
for (const failure of failures) console.error(failure);
assert.equal(failures.length,0);

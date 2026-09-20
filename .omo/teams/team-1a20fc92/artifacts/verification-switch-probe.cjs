const fs = require('node:fs');
const crypto = require('node:crypto');
const root = process.cwd();
const footprintRoot = process.env.FOOTPRINT_ROOT || root + '/footprints';
const engine = require(root + '/engine/src/ergogen');
const {parse} = require(root + '/engine/src/templates/sexpr');
const child = (n, k) => n.find(x => Array.isArray(x) && x[0] === k);
const children = (n, k) => n.filter(x => Array.isArray(x) && x[0] === k);
const atom = x => x?.startsWith('"') ? JSON.parse(x) : x;
const vec = n => n.slice(1).map(Number);
const dist = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
function summarize(source) {
  const roots = parse(source, 'switch probe');
  const nodes = roots[0][0] === 'kicad_pcb' ? roots[0].filter(Array.isArray) : roots;
  const fp = nodes.find(n => ['footprint','module'].includes(n[0]));
  const netNames = Object.fromEntries(children(fp,'pad').map(p => child(p,'net')).filter(Boolean).filter(n=>n.length>2).map(n=>[n[1],atom(n[2])]));
  const netOf = n => {const value=child(n,'net')?.[1];return value ? (netNames[value] || atom(value)) : '';};
  const at = vec(child(fp,'at')); const rad = (at[2] || 0)*Math.PI/180;
  const global = ([x,y]) => [at[0]+x*Math.cos(rad)+y*Math.sin(rad),at[1]-x*Math.sin(rad)+y*Math.cos(rad)];
  const pads = children(fp,'pad').map(p => ({number:atom(p[1]),type:p[2],at:vec(child(p,'at')).slice(0,2),xy:global(vec(child(p,'at'))),layers:child(p,'layers').slice(1).map(atom),net:netOf(p)}));
  const segs = nodes.filter(n=>n[0]==='segment').map(n=>({a:vec(child(n,'start')),b:vec(child(n,'end')),layer:atom(child(n,'layer')[1]),net:netOf(n)}));
  const mismatches=[];
  for (const s of segs) for (const [end,pos] of [['start',s.a],['end',s.b]]) for (const p of pads) {
    if (p.type==='smd' && p.layers.includes(s.layer) && dist(pos,p.xy)<0.002 && p.net!==s.net) mismatches.push({layer:s.layer,pad:p.number,padAt:p.at,padNet:p.net,segmentNet:s.net,end});
  }
  let mixedJunctions=0;
  for (let i=0;i<segs.length;i++) for (let j=i+1;j<segs.length;j++) {
    const a=segs[i],b=segs[j];
    if(a.layer===b.layer && a.net!==b.net && [a.a,a.b].some(x=>[b.a,b.b].some(y=>dist(x,y)<0.002))) mixedJunctions++;
  }
  const smd=pads.filter(p=>p.type==='smd' && p.layers.some(l=>l.endsWith('.Cu'))).map(({number,at,layers,net})=>({number,at,layer:layers.find(l=>l.endsWith('.Cu')),net}));
  return {pads:pads.length,segments:segs.length,vias:nodes.filter(n=>n[0]==='via').length,smd,mismatches,mixedJunctions,socketHoles:pads.filter(p=>p.at[1]<-2 && p.type.includes('thru_hole')).map(({at,type,net})=>({at,type,net})),mountHoles:pads.filter(p=>p.at[1]===0 && p.type.includes('thru_hole')).map(({at,type,net})=>({at,type,net}))};
}
const cases = [
 ['mx_default_reversible','switch_mx',{reversible:true}],
 ['mx_same_side_reversible','switch_mx',{reversible:true,hotswap_pads_same_side:true}],
 ['mx_plated_reversible','switch_mx',{reversible:true,include_plated_holes:true}],
 ['mx_no_traces','switch_mx',{reversible:true,include_traces_vias:false}],
 ['mx_single_F','switch_mx',{side:'F'}], ['mx_single_B','switch_mx',{side:'B'}],
 ['mx_stab_flag','switch_mx',{include_plated_holes:true,include_stabilizer_nets:true}],
 ['mx_center_flag','switch_mx',{include_plated_holes:true,include_centerhole_net:true}],
 ['mx_both_flags','switch_mx',{include_plated_holes:true,include_centerhole_net:true,include_stabilizer_nets:true}],
 ['choc_B_same_single','switch_choc_v1_v2',{side:'B',hotswap_pads_same_side:true}],
 ['choc_B_default_single','switch_choc_v1_v2',{side:'B'}],
 ['choc_F_same_single','switch_choc_v1_v2',{side:'F',hotswap_pads_same_side:true}],
 ['choc_B_same_reversible','switch_choc_v1_v2',{side:'B',hotswap_pads_same_side:true,reversible:true}],
 ['choc_B_same_plated','switch_choc_v1_v2',{side:'B',hotswap_pads_same_side:true,include_plated_holes:true}],
 ['choc_default_reversible','switch_choc_v1_v2',{reversible:true}],
];
(async()=>{
 console.log(JSON.stringify({node:process.version,engine:engine.version,rotations:[0,37,90],files:Object.fromEntries(['switch_mx','switch_choc_v1_v2'].map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(footprintRoot+'/'+n+'.js')).digest('hex')]))}));
 for (const [label,name,params] of cases) {
   const outcomes=[];
   for (const rotation of [0,37,90]) {
     let emitted;
     const module=require(footprintRoot+'/'+name+'.js');
     engine.inject('footprint','probe',{...module,body:p=>(emitted=module.body(p))});
     const config={schema:'ergogen/v1',layout:{objects:{key:{kind:'key',pcb:'main',placement:{at:[10,12,0],rotate:rotation},footprints:{switch:{what:'probe',params:{from:'FROM',to:'TO',...params}}}}}},designs:{regions:{board:{shape:{size:[80,60]}}},profiles:{board:{from:'regions.board'}}},pcbs:{main:{profile:'profiles.board'}}};
     const result=await engine.process(config,{debug:true});
     const direct=summarize(emitted),native=summarize(result.pcbs.main);
     const inspection=engine.footprints.inspect(result.pcbs.main);
     if(JSON.stringify(direct)!==JSON.stringify(native)) throw new Error(label+' parser/native changed summary '+JSON.stringify({direct,native}));
     if(inspection.pads.length!==native.pads) throw new Error('inspect pad mismatch');
     outcomes.push({rotation,summary:native});
   }
   if(outcomes.some(o=>JSON.stringify(o.summary)!==JSON.stringify(outcomes[0].summary))) throw new Error(label+' rotation-dependent result');
   console.log(JSON.stringify({label,params,rotationsPass:[0,37,90],bodyEqualsNative:true,inspectPadCountPass:true,...outcomes[0].summary}));
 }
})().catch(e=>{console.error(e);process.exitCode=1});

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = process.cwd();
const engine = require(path.join(root, 'engine/src/ergogen'));
const input = require(path.join(root, 'engine/test/fixtures/native/matrix-outline-recovery.json'));
const records = {};
for (const [file, names] of Object.entries({'native/clearance': ['check'], 'designs/geometry': ['union','combine','close','offset','round','describe','requireContains'], io:['twodee']})) {
 const module = require(path.join(root, 'engine/src', file));
 for (const name of names) {
  const original = module[name]; if (!original) continue;
  module[name] = function(...args) { const begin=performance.now(); try {return original.apply(this,args)} finally {const r=records[`${file}.${name}`] ||= {count:0,ms:0};r.count++;r.ms+=performance.now()-begin;} };
 }
}
(async()=> {
 const analysisCache={}; const rows=[];
 for (const mode of ['layout','outline','analysis','cached-analysis']) {
  for(const key of Object.keys(records))delete records[key];
  const start=performance.now();
  const result=await engine.process(input,{analysis:true,analysisCache,svg:true,debug:true,...(mode==='layout'?{layoutOnly:true}:mode==='outline'?{outlineOnly:true}:{})});
  rows.push({mode,ms:performance.now()-start,records:structuredClone(records),outlines:crypto.createHash('sha256').update(JSON.stringify(result.outlines || {})).digest('hex'),features:crypto.createHash('sha256').update(JSON.stringify(result.designs?.features || {})).digest('hex')});
  if(mode==='outline')fs.writeFileSync(path.join(__dirname,'baseline-outline.json'),JSON.stringify({outlines:result.outlines,features:result.designs.features}));
 }
 console.log(JSON.stringify(rows,null,2));
})();

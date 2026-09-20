const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const engine = require(path.join(process.cwd(), 'engine/src/ergogen'));
const g = require(path.join(process.cwd(), 'engine/src/designs/geometry'));
const yaml = require(path.join(process.cwd(), 'engine/node_modules/js-yaml'));
const input = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../baseline/initial-source.yaml'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'profile60-3-result.json')));
(async () => {
 const rows=[];
 for(const move of [0,3]) {
  if(move)input.layout.objects.fingers_c10_r1.placement={at:[move,0,0]};
  else delete input.layout.objects.fingers_c10_r1.placement;
  const close=g.close;
  let reference;
  try {
   g.close=(model,radius)=>close(model,radius);
   reference=await engine.process(input,{analysis:true,debug:true,svg:true});
  }finally {g.close=close;}
  for(let sample=0;sample<3;sample++) {
   const preparedLayout=await engine.solveLayout(input);
   const settings={analysis:true,debug:true,svg:true,preparedLayout};
   let start=performance.now();const outline=await engine.process(input,{...settings,outlineOnly:true});const outlineMs=performance.now()-start;
   assert.deepEqual(outline.outlines,reference.outlines,'Memo preserves complete outline outputs');
   assert.deepEqual(outline.designs.features,reference.designs.features,'Memo preserves complete feature reports');
   if(move===3){
    assert.equal(outline.outlines.main_outline.svg,baseline.outlines.main_outline.svg);
    assert.equal(outline.outlines.main_outline.dxf,baseline.outlines.main_outline.dxf);
    assert.deepEqual(g.paths(outline.designs.features['profiles.main_outline'].model),g.paths(baseline.features['profiles.main_outline'].model));
   }
   start=performance.now();const analysis=await engine.process(input,settings);const analysisMs=performance.now()-start;
   assert.deepEqual(analysis,reference, 'Staged analysis preserves the full uncached result');
   if(move===3)assert.equal(analysis.outlines.main_outline.svg,baseline.outlines.main_outline.svg);
   if(sample===0)fs.writeFileSync(path.join(__dirname,`final60-${move}-output.json`),JSON.stringify(analysis));
   rows.push({move,sample,outlineMs,analysisMs,totalMs:outlineMs+analysisMs});
  }
 }
 console.log(JSON.stringify(rows,null,2));
})().catch(error=>{console.error(error);process.exitCode=1});

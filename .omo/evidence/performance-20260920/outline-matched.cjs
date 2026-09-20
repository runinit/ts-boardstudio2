const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const baseline = fs.readFileSync(path.join(__dirname, 'baseline-path.txt'),'utf8').trim();
const yaml = require(path.join(root, 'engine/node_modules/js-yaml'));
const source = yaml.safeLoad(fs.readFileSync(path.join(root, '.omo/ulw-research/20260920-154353/artifacts/fixture-60.yaml'),'utf8'));
source.layout.objects.fingers_c10_r1.placement = {at:[3,0,0]};
const engines = [baseline,root].map(p=>({engine:require(path.join(p,'engine/src/ergogen')),g:require(path.join(p,'engine/src/designs/geometry'))}));
const samples = [];
let expected;
async function run(which, warmup) {
  const {engine,g} = engines[which];
  const preparedLayout = await engine.solveLayout(source);
  const start = performance.now();
  const result = await engine.process(source,{analysis:true,outlineOnly:true,debug:true,svg:true,preparedLayout});
  const ms = performance.now()-start;
  const feature = result.designs.features['profiles.main_outline'];
  const contour = {paths:g.paths(feature.model),bounds:feature.bounds,contours:feature.contours,svg:result.outlines.main_outline.svg,dxf:result.outlines.main_outline.dxf};
  if (expected) assert.deepEqual(contour,expected); else expected=contour;
  if (!warmup) samples.push({variant:which?'after':'before',ms,sha256:crypto.createHash('sha256').update(JSON.stringify(contour)).digest('hex')});
}
(async()=>{
 await run(0,true); await run(1,true);
 for (const which of [0,1,1,0,0,1]) await run(which,false);
 fs.writeFileSync(path.join(__dirname,'outline-matched.json'),JSON.stringify({runtime:process.version,warmup:'one per variant',fixture:'fingers_c10_r1 +3mm',samples,parity:true},null,2));
 console.log(JSON.stringify(samples));
})().catch(error=>{console.error(error);process.exitCode=1});

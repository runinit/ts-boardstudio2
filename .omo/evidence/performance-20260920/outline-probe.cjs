const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const engine = require(path.join(root, 'engine/src/ergogen'));
const g = require(path.join(root, 'engine/src/designs/geometry'));
const m = require(path.join(root, 'engine/node_modules/makerjs'));
const yaml = require(path.join(root, 'engine/node_modules/js-yaml'));
const source = yaml.safeLoad(fs.readFileSync(path.join(root, '.omo/ulw-research/20260920-154353/artifacts/fixture-60.yaml'), 'utf8'));
source.layout.objects.fingers_c10_r1.placement = {at: [3, 0, 0]};
const original = m.model.outline;
const run = async inherited => {
  const calls = [];
  m.model.outline = function(model, distance, joints, inside, options) {
    const start = performance.now();
    const result = original(model, distance, joints, inside, inherited ? Object.create({farPoint: options.farPoint}) : options);
    calls.push({distance, inside, paths:g.paths(model).length, ms:performance.now()-start});
    return result;
  };
  try {
    const start = performance.now();
    const r = await engine.process(source, {analysis:true, outlineOnly:true, debug:true, svg:true});
    return {ms:performance.now()-start, calls, contour:{paths:g.paths(r.designs.features['profiles.main_outline'].model), svg:r.outlines.main_outline.svg, dxf:r.outlines.main_outline.dxf}};
  } finally {m.model.outline = original;}
};
(async () => {
  const before = await run(false);
  const after = await run(true);
  fs.writeFileSync(path.join(__dirname, 'outline-probe.json'), JSON.stringify({before,after},null,2));
  assert.deepEqual(after.contour, before.contour);
  console.log(JSON.stringify({before:before.ms,after:after.ms,parity:true,calls:after.calls}));
})().catch(e=>{console.error(e);process.exitCode=1});

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = createRequire(path.join(process.cwd(), 'package.json'));
const ts = root('./app/node_modules/typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);
const e = root('./engine/src/ergogen');
const sx = root('./engine/src/templates/sexpr');
const { identity } = root('./engine/src/native/pcbs');
const { parse, stringify } = root('./app/node_modules/yaml');
const { createInjectionModule } = root('./app/src/utils/injectionEvaluator.ts');
for (const [name, source] of Object.entries({ ...root('./app/.generated/footprints.json'), ...root('./app/src/catalogue/footprints.json') })) e.inject('footprint', name, createInjectionModule(source));
const { compileSetup, defaultSetup } = root('./app/src/utils/designSetup.ts');
const { addCluster, setValue } = root('./app/src/utils/studioSource.ts');
const { insertComponent } = root('./app/src/utils/componentPlacement.ts');
const { applyAssembly } = root('./app/src/utils/applyAssembly.ts');
const { syncControllerNets } = root('./app/src/utils/assemblyNets.ts');
const child = (node, key) => node.find(value => Array.isArray(value) && value[0] === key);
function pads(source, board, object, binding) {
  const ref = `X${identity(`${board}/${object}/${binding}`)}`;
  const boardNode = sx.parse(source, 'native proof')[0];
  const fp = boardNode.find(node => Array.isArray(node) && ['footprint', 'module'].includes(node[0]) && node.some(value => Array.isArray(value) && ((value[0] === 'property' && sx.value(value[1]) === 'Reference') || (value[0] === 'fp_text' && value[1] === 'reference')) && sx.value(value[2]) === ref));
  assert.ok(fp, `footprint ${ref}`);
  return fp.filter(node => Array.isArray(node) && node[0] === 'pad').map(pad => ({ number: sx.value(pad[1]), type: pad[2], net: child(pad, 'net') ? sx.value(child(pad, 'net').at(-1)) : '' }));
}
async function record(name, source, board = 'main') {
  const result = await e.process(source, { analysis: true });
  fs.writeFileSync(path.join(__dirname, `${name}.yaml`), source);
  fs.writeFileSync(path.join(__dirname, `${name}.kicad_pcb`), result.pcbs[board]);
  return { pcb: result.pcbs[board], findings: parse(source).meta?.studio?.electricalFindings || [] };
}
(async () => {
  const records = [];
  const base = stringify({ schema: 'ergogen/v1', layout: { objects: {} }, designs: { regions: { board: { shape: { size: [120, 80] } } }, profiles: { board: { from: 'regions.board' } } }, pcbs: { main: { profile: 'profiles.board' } } });
  const matrix = insertComponent(addCluster(base, 'fingers', 'columns', { columns: 2, rows: 1 }), 'mcu', 'promicro');
  const plain = await record('plain-matrix', matrix);
  const mcu = pads(plain.pcb, 'main', 'mcu', 'main');
  for (const net of ['fingers_c1', 'fingers_c2', 'fingers_r1']) assert.ok(mcu.some(pad => pad.net === net));
  assert.deepEqual(plain.findings, []);
  records.push({ case: 'plain-matrix', mcu, findings: plain.findings });
  const setup = { ...defaultSetup(), columns: 1, rows: 1, controller: 'promicro' }, key = 'fingers_c1_r1';
  for (const junction of ['CUSTOM', '{{name}}_CUSTOM']) {
    const wanted = junction.replace('{{name}}', key);
    let source = setValue(compileSetup(setup), ['layout', 'objects', key, 'footprints', 'switch', 'params', 'to'], junction);
    source = setValue(source, ['layout', 'objects', `${key}_diode`, 'footprints', 'main', 'params', 'from'], wanted);
    source = applyAssembly(source, [key], { ...setup, diode: false }, 'preserve');
    source = applyAssembly(source, [key], setup, 'preserve');
    const item = await record(junction === 'CUSTOM' ? 'custom-junction' : 'templated-junction', source);
    const sw = pads(item.pcb, 'main', key, 'switch'), diode = pads(item.pcb, 'main', `${key}_diode`, 'main');
    assert.ok(sw.some(pad => pad.net === wanted));
    assert.ok(diode.some(pad => pad.net === wanted));
    assert.deepEqual(item.findings, []);
    records.push({ case: junction, switch: sw, diode, findings: item.findings });
  }
  const inherited = parse(compileSetup(setup));
  inherited.parts.key.footprints = inherited.layout.objects[key].footprints;
  inherited.parts.key.footprints.switch.params.from = 'INHERITED_COL';
  delete inherited.layout.objects[key].footprints;
  const item = await record('inherited-wiring', applyAssembly(stringify(inherited), [key], setup, 'preserve'));
  const sw = pads(item.pcb, 'main', key, 'switch'), controller = pads(item.pcb, 'main', 'controller', 'main');
  assert.ok(sw.some(pad => pad.net === 'INHERITED_COL'));
  assert.ok(controller.some(pad => pad.net === 'INHERITED_COL'));
  assert.ok(item.findings.some(message => message.includes('INHERITED_COL')));
  records.push({ case: 'inherited', switch: sw, controller, findings: item.findings });
  const mirroredSetup = { ...setup, topology: 'mirrored', led: true, columns: 2 };
  const mirrored = await record('mirrored', syncControllerNets(compileSetup(mirroredSetup)), 'right');
  const mirroredMcu = pads(mirrored.pcb, 'right', 'right_controller', 'main');
  for (const net of ['right_C1', 'right_C2', 'right_R1', 'right_LED_DATA']) assert.ok(mirroredMcu.some(pad => pad.net === net), net);
  assert.deepEqual(mirrored.findings, []);
  records.push({ case: 'mirrored', controller: mirroredMcu, findings: mirrored.findings });
  fs.writeFileSync(path.join(__dirname, 'native.json'), JSON.stringify({ runtime: process.version, records }, null, 2));
  console.log(JSON.stringify({ runtime: process.version, cases: records.length, status: 'pass' }));
})().catch(error => { console.error(error); process.exitCode = 1; });

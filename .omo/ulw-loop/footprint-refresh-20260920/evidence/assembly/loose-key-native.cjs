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
const { addObject } = root('./app/src/utils/studioSource.ts');
(async () => {
  const inserted = addObject(compileSetup({ ...defaultSetup(), columns: 3, rows: 2, controller: 'promicro' }), 'extra', 'key');
  const source = setValue(setValue(inserted, ['designs'], {regions:{board:{shape:{size:[300,300]}}},profiles:{board:{from:'regions.board'}}}), ['pcbs','main','profile'], 'profiles.board');
  const result = await e.process(source, { analysis: true });
  const authored = parse(source).layout.objects.extra.properties;
  const effective = result.layout.objects.extra.properties;
  const contacts = pads(result.pcbs.main, 'main', 'extra', 'switch');
  const mcu = pads(result.pcbs.main, 'main', 'controller', 'main');
  assert.equal(authored.column_net, 'extra_c1');
  assert.equal(effective.column_net, 'extra_c1');
  assert.ok(contacts.some(pad => pad.net === 'extra_c1'));
  assert.ok(mcu.some(pad => pad.net === 'extra_c1'));
  const freeSource = `schema: ergogen/v1
layout:
  objects:
    free:
      kind: key
      pcb: main
      footprints:
        switch:
          what: mx
          params: {from: '{{column_net}}', to: '{{row_net}}'}
designs:
  regions:
    board: {shape: {size: [120, 80]}}
  profiles:
    board: {from: regions.board}
pcbs:
  main: {profile: profiles.board}
`;
  const free = await e.process(freeSource, { analysis: true });
  const freeContacts = pads(free.pcbs.main, 'main', 'free', 'switch');
  assert.equal(free.layout.objects.free.properties.column_net, 'free_column');
  assert.ok(freeContacts.some(pad => pad.net === 'free_column'));
  fs.writeFileSync(path.join(__dirname,'loose-key-native.json'), JSON.stringify({runtime:process.version, authored, effective, contacts, mcu, nativeImplicit:free.layout.objects.free.properties, freeContacts},null,2));
  console.log(JSON.stringify({runtime:process.version,managed:'extra_c1',nativeImplicit:'free_column',status:'pass'}));
})().catch(error => { console.error(error); process.exitCode=1; });

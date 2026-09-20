const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const rootRequire = createRequire(path.join(process.cwd(), 'package.json'));
const ts = rootRequire('./app/node_modules/typescript');
require.extensions['.ts'] = (m,f) => m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const e = rootRequire('./engine/src/ergogen');
const {parse,stringify} = rootRequire('./app/node_modules/yaml');
const sx = rootRequire('./engine/src/templates/sexpr');
const {createInjectionModule} = rootRequire('./app/src/utils/injectionEvaluator.ts');
for(const [name,source] of Object.entries({...rootRequire('./app/.generated/footprints.json'),...rootRequire('./app/src/catalogue/footprints.json')})) e.inject('footprint',name,createInjectionModule(source));
const {compileSetup,defaultSetup} = rootRequire('./app/src/utils/designSetup.ts');
const {createMatrix,addCluster} = rootRequire('./app/src/utils/studioSource.ts');
const {insertComponent} = rootRequire('./app/src/utils/componentPlacement.ts');
const {applyAssembly} = rootRequire('./app/src/utils/applyAssembly.ts');
const {syncControllerNets} = rootRequire('./app/src/utils/assemblyNets.ts');
const child=(n,k)=>n.find(x=>Array.isArray(x)&&x[0]===k);
function inventory(pcb){
 const board=sx.parse(pcb,'research')[0];
 return board.filter(n=>Array.isArray(n)&&['module','footprint'].includes(n[0])).map(fp=>({
 name:sx.value(fp[1]),reference:sx.value(fp.find(n=>Array.isArray(n)&&n[0]==='property'&&sx.value(n[1])==='Reference')?.[2]||fp.find(n=>Array.isArray(n)&&n[0]==='fp_text'&&n[1]==='reference')?.[2]||'""'),
 pads:fp.filter(n=>Array.isArray(n)&&n[0]==='pad').map(p=>({number:sx.value(p[1]),type:p[2],net:child(p,'net')?sx.value(child(p,'net').at(-1)):null}))}));
}
async function record(name,source){
 const r=await e.process(source,{analysis:true});
 const inv=inventory(r.pcbs.main);
 fs.writeFileSync(path.join(__dirname,`${name}.kicad_pcb`),r.pcbs.main);
 fs.writeFileSync(path.join(__dirname,`${name}.yaml`),source);
 const data={case:name,controllerParams:Object.values(parse(source).layout.objects).find(o=>o.footprints?.main?.what==='promicro')?.footprints.main.params,findings:r.layout?.findings||[],studioFindings:parse(source).meta?.studio?.electricalFindings||[],inventory:inv};
 console.log(JSON.stringify(data));
 return data;
}
(async()=>{
 console.log(JSON.stringify({runtime:process.version,scope:'current dirty worktree; source engine; staged footprints'}));
 const setup={...defaultSetup(),columns:2,rows:1,controller:'promicro',led:true};
 await record('baseline',compileSetup(setup));
 let plain=createMatrix('schema: ergogen/v1\nlayout: {objects: {}}\n',2,1);
 plain=insertComponent(plain,'mcu','promicro');
 await record('plain-matrix',plain);
 const authored = stringify({schema:'ergogen/v1',layout:{objects:{}},designs:{regions:{board:{shape:{size:[120,80]}}},profiles:{board:{from:'regions.board'}}},pcbs:{main:{profile:'profiles.board'}}});
 const added=insertComponent(addCluster(authored,'fingers','columns',{columns:2,rows:1}),'mcu','promicro');
 await record('ui-add-cluster',added);
 const single={...setup,columns:1,led:false},id='fingers_c1_r1';
 for(const mode of ['manual','properties','inherited']){
  const d=parse(compileSetup(single)),k=d.layout.objects[id];
  if(mode==='manual') k.footprints.switch.params.from='AUTH_COL';
  if(mode==='properties') Object.assign(k.properties,{column_net:'AUTH_COL',row_net:'AUTH_ROW'});
  if(mode==='inherited'){d.parts.key.footprints=structuredClone(k.footprints);d.parts.key.footprints.switch.params.from='INHERITED_COL';delete k.footprints;}
  await record(mode+'-before',stringify(d));
  await record(mode+'-after',applyAssembly(stringify(d),[id],single,'preserve'));
 }
 const d=parse(compileSetup(single));d.layout.objects[id].footprints.switch.params.to='CUSTOM';d.layout.objects[id+'_diode'].footprints.main.params.from='CUSTOM';
 const off=applyAssembly(stringify(d),[id],{...single,diode:false},'preserve');
 await record('diode-toggle',applyAssembly(off,[id],single,'preserve'));
 const bad=parse(compileSetup(single));bad.layout.objects[id+'_diode'].footprints.main.params.include_thru_hole_smd_pads=true;
 await record('diode-padless',stringify(bad));
 const m=parse(compileSetup(single));m.layout.objects.controller.footprints.main.params={orientation:'C1'};
 console.log(JSON.stringify({case:'nonpin-parameter',params:parse(syncControllerNets(stringify(m))).layout.objects.controller.footprints.main.params}));
 const input={schema:'ergogen/v1',layout:{objects:{c:{kind:'component',pcb:'main',footprints:{switch:{what:'mx',params:{from:'{{missing}}',to:'OK'}}}}}},designs:{regions:{board:{shape:{size:[80,60]}}},profiles:{board:{from:'regions.board'}}},pcbs:{main:{profile:'profiles.board'}}};
 await record('missing-template',stringify(input));
})().catch(err=>{console.error(err);process.exitCode=1;});

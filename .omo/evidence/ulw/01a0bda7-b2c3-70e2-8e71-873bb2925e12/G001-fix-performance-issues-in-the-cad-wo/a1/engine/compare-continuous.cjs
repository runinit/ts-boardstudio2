const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const {execFileSync}=require('node:child_process');
const root=process.cwd();
const mode=process.argv[2];
if(mode==='head'){
 const originals=new Map(['engine/src/ergogen.js','engine/src/designs/index.js','engine/src/designs/geometry.js'].map(file=>[path.join(root,file),execFileSync('git',['show',`HEAD:${file}`],{encoding:'utf8'})]));
 const loader=Module._extensions['.js'];
 Module._extensions['.js']=(module,file)=>originals.has(file)?module._compile(originals.get(file),file):loader(module,file);
}
const engine=require(path.join(root,'engine/src/ergogen'));
const raw=fs.readFileSync(process.argv[3],'utf8');
(async()=>{
 const start=performance.now();
 const preparedLayout=await engine.solveLayout(raw);
 const source=process.argv[4] === "raw" ? raw : require("./outline-utils.cjs").prepareOutlines(raw,preparedLayout.results.layout);
 fs.writeFileSync(path.join(__dirname,path.basename(process.argv[3])+"."+mode+(process.argv[4] === "raw" ? ".raw" : "")+".prepared.yaml"),source);
 try{
  const result=await engine.process(source,{preparedLayout,analysis:true,outlineOnly:true,debug:true,svg:true});
  console.log(JSON.stringify({mode,ms:performance.now()-start,ok:true,features:Object.fromEntries(Object.entries(result.designs.features).map(([id,feature])=>[id,{bounds:feature.bounds,contours:feature.contours}])),objects:result.layout.objects}));
 }catch(error){console.log(JSON.stringify({mode,ms:performance.now()-start,ok:false,message:error.message,diagnostics:error.diagnostics}));}
})().catch(error=>{console.error(error);process.exitCode=1});

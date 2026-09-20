const fs = require('node:fs');
const path = require('node:path');
const root=process.cwd();
const engine=require(path.join(root,'engine/src/ergogen'));
const yaml=require(path.join(root,'engine/node_modules/js-yaml'));
const m=require(path.join(root,'engine/node_modules/makerjs'));
const g=require(path.join(root,'engine/src/designs/geometry'));
const input=yaml.safeLoad(fs.readFileSync(path.join(__dirname,'../baseline/initial-source.yaml'),'utf8'));
const move=Number(process.argv[2] || 0);
if(move)input.layout.objects.fingers_c10_r1.placement={at:[move,0,0]};
const original=m.model.outline;
if(process.env.OFFSET_EXPERIMENT==='classifier'){
 const inside=m.measure.isPointInsideModel;
 m.measure.isPointInsideModel=(point,model,options)=>inside(point,model,Array.isArray(options)?{farPoint:[1234.1234,2143.56789]}:options);
}
let number=0;
m.model.outline=function(model,...args) {
 const id=++number;const count=g.paths(model).length; const start=performance.now();
 console.log(JSON.stringify({kind:'outline-start',id,paths:count,distance:args[0],inside:args[2]}));
 try{
  if(process.env.OFFSET_EXPERIMENT==='farpoint')Object.defineProperty(args[3],'farPoint',{value:[1234.1234,2143.56789],writable:true,enumerable:true,configurable:false});
  if(process.env.OFFSET_EXPERIMENT==='components'&&!args[2]) {
   const chains=m.model.findChains(model,{contain:true});
   if(chains.length>1&&chains.every(chain=>!chain.contains?.length))return g.union(chains.map(chain=>original.call(this,m.chain.toNewModel(chain),args[0],args[1],args[2],{farPoint:[1234.1234,2143.56789]})));
  }
  return original.call(this,model,...args)
 }finally{console.log(JSON.stringify({kind:'outline-end',id,ms:performance.now()-start}));}
};
for (const [file,names] of Object.entries({'designs/geometry':['close','offset','union'], 'native/clearance':['check']})) {
 const module=require(path.join(root,'engine/src',file));
 for(const name of names){const old=module[name];module[name]=function(...args){const start=performance.now();try{return old.apply(this,args)}finally{console.log(JSON.stringify({kind:`${file}.${name}`,ms:performance.now()-start}));}};}
}
(async()=>{
 const start=performance.now();const preparedLayout=await engine.solveLayout(input);console.log(JSON.stringify({kind:'layout',ms:performance.now()-start}));
 const outlineStart=performance.now(); const result=await engine.process(input,{analysis:true,outlineOnly:true,preparedLayout,debug:true,svg:true});
 fs.writeFileSync(path.join(__dirname,`profile60-${move}${process.env.OFFSET_EXPERIMENT ? '-'+process.env.OFFSET_EXPERIMENT : ''}-result.json`),JSON.stringify({outlines:result.outlines,features:result.designs.features}));
 console.log(JSON.stringify({kind:'outline-total',move,ms:performance.now()-outlineStart,calls:number}));
})().catch(error=>{console.error(error);process.exitCode=1});

const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const {chromium}=require(path.join(root,'app/node_modules/@playwright/test'));
const {createRequire}=require('node:module');
const viteRequire=createRequire(fs.realpathSync(path.join(root,'app/node_modules/vite/package.json')));
const esbuild=viteRequire('esbuild');
(async()=>{
 const bundle=await esbuild.build({entryPoints:[path.join(root,'app/src/utils/studioQueue.ts')],bundle:true,write:false,format:'iife',globalName:'queueModule',platform:'browser'});
 const browser=await chromium.launch({headless:true,channel:'chromium'});
 try {
  const page=await browser.newPage();
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  const result=await page.evaluate(async()=>{
   const {StudioQueue,SETTLE_MS}=queueModule;
   const actions=[];
   const replies=[];
   const url=URL.createObjectURL(new Blob([`onmessage=({data})=>{if(data.type==='studio'&&data.revision==='d')postMessage({type:'success',requestId:data.requestId,revision:data.revision,source:data.inputConfig});};`],{type:'text/javascript'}));
   let resolve;
   const completed=new Promise(r=>resolve=r);
   const queue=new StudioQueue(()=>{actions.push('worker created');return new Worker(url);},r=>{replies.push(r);resolve(r);});
   const request=revision=>({revision,source:revision});
   const wait=ms=>new Promise(r=>setTimeout(r,ms));
   let timeout;
   try {
    queue.schedule(request('a'));await wait(SETTLE_MS+20);
    queue.schedule(request('b'));actions.push('superseded a');queue.dispose();actions.push('cancelled during grace');
    queue.schedule(request('c'));await wait(SETTLE_MS+20);queue.schedule(request('d'));actions.push('superseded reused c with d');
    await Promise.race([completed,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('latest did not complete')),3000);})]);
    return {actions,replies};
   }finally{clearTimeout(timeout);queue.dispose();URL.revokeObjectURL(url);}
  });
  assert.equal(result.replies.length,1);assert.equal(result.replies[0].source,'d');
  fs.writeFileSync(path.join(__dirname,'queue-browser.json'),JSON.stringify({...result,cleanup:'queue workers terminated, blob URL revoked; browser closed in finally'},null,2));
  console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

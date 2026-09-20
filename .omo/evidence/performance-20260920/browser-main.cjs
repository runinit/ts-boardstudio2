const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {expect} = playwright;
const yaml = require(path.resolve(__dirname,'../../../app/node_modules/yaml'));
const root = path.resolve(__dirname,'../../..');
const baseline = fs.readFileSync(path.join(__dirname,'baseline-path.txt'),'utf8').trim();
const servers=[];
async function serve(port,dist) {
 const fd=fs.openSync(path.join(__dirname,`browser-server-${port}.log`),'w');
 const child=spawn(process.execPath,[path.join(root,'app/node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort','--outDir',dist],{cwd:path.join(root,'app'),stdio:['ignore',fd,fd]});
 servers.push({child,fd});
 for(let n=0;n<100;n++) {try {if((await fetch(`http://127.0.0.1:${port}/boardstudio/`)).ok)return;}catch{} await new Promise(r=>setTimeout(r,100));}
 throw new Error('Preview did not start');
}
(async()=>{
 let browser;
 const results=[];
 const checks=[];
 try {
  await serve(4182,path.join(baseline,'app/dist'));
  await serve(4183,path.join(root,'app/dist'));
  browser=await chromium.launch({headless:true,channel:'chromium'});
  const fixture=await readFile(fixturePath,'utf8');
  for(const variant of ['before','after','after','before','before','after']) {
   baseURL=`http://127.0.0.1:${variant==='before'?4182:4183}/boardstudio/`;
   const result=await sustainedDrag(browser,fixture,results.length);
   assert.equal(result.metrics.sourceChanged,true);
   assert.equal(result.metrics.polygonChanged,true);
   assert.deepEqual(result.problems,[]);
   assert.ok(result.raw.packets.some(p=>p.type==='success'));
   results.push({variant,...result});
   await writeFile(path.join(__dirname,"browser-samples.json"),JSON.stringify(results,null,2));
  }
  for (const result of results) {
   assert.equal(result.raw.final.polygon, results[0].raw.final.polygon);
   assert.deepEqual(yaml.parse(result.raw.final.source).layout, yaml.parse(results[0].raw.final.source).layout);
  }
  const med=(variant,field)=>results.filter(r=>r.variant===variant).map(r=>r.metrics[field]).sort((a,b)=>a-b)[1];
  const comparison={before:med('before','pointerUpToCommittedPolygonMs'),after:med('after','pointerUpToCommittedPolygonMs')};
  await writeFile(path.join(__dirname,'browser-comparison.json'),JSON.stringify(comparison,null,2));
  assert.ok(comparison.after < comparison.before, 'matched release median must improve');
  checks.push('Matched layout and final polygon parity across all six samples');
  baseURL='http://127.0.0.1:4183/boardstudio/';
  const {context,page,problems}=await newMeasuredPage(browser,fixture);
  try {
   const target=page.locator('[data-object="fingers_c1_r1"]');
   const initial=await source(page);
   const initialPolygon=await target.locator('polygon').getAttribute('points');
   const drag=async()=>{
    const box=await target.boundingBox(); assert.ok(box);
    const x=box.x+box.width/2,y=box.y+box.height/2;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-12,y,{steps:3});
   };
   await page.screenshot({path:path.join(__dirname,'qa-before.png')});
   await drag();await page.screenshot({path:path.join(__dirname,'qa-during.png')});
   await page.keyboard.press('Escape');await page.mouse.up();
   await expect(target).toHaveAttribute('transform','translate(0,0)');
   assert.equal(await source(page),initial); checks.push('Escape cancels without source change');
   await drag();await page.mouse.up();
   await expect.poll(()=>source(page)).not.toBe(initial);
   await expect(target.locator('polygon')).not.toHaveAttribute('points',initialPolygon);
   const first=await source(page);
   const pose=s=>yaml.parse(s).layout.objects.fingers_c1_r1.placement.override.at;
   assert.ok(pose(first)[0]<0);
   await drag();await page.mouse.up();
   await expect.poll(async()=>pose(await source(page))[0]).toBeLessThan(pose(first)[0]);
   checks.push('Re-grab commits cumulative snapped movement');
   await waitForReady(page);
   const second=await source(page);
   await page.getByRole('button',{name:'Undo project edit',exact:true}).click();
   await expect.poll(async()=>pose(await source(page))).toEqual(pose(first));
   await page.getByRole('button',{name:'Redo project edit',exact:true}).click();
   await expect.poll(async()=>pose(await source(page))).toEqual(pose(second));
   checks.push('Undo and redo preserve exact committed pose');
   await waitForReady(page);
   await page.screenshot({path:path.join(__dirname,'qa-after.png')});
   for(const width of [375,768,1280]) {
    await page.setViewportSize({width,height:900});
    await page.screenshot({path:path.join(__dirname,`qa-${width}.png`)});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   assert.deepEqual(problems,[]);checks.push('No page errors or horizontal overflow at 375/768/1280');
  } finally {await context.close();}
  await writeFile(path.join(__dirname,'browser-matched.json'),JSON.stringify({runtime:process.version,browser:browser.version(),results,checks},null,2));
  console.log(JSON.stringify({samples:results.map(r=>({variant:r.variant,metrics:r.metrics})),checks},null,2));
 } finally {
  if(browser) await browser.close();
  for(const {child,fd} of servers) {child.kill('SIGTERM');await new Promise(r=>{if(child.exitCode!==null)r();else child.once('exit',r);});fs.closeSync(fd);}
  await writeFile(path.join(__dirname,'browser-cleanup.json'),JSON.stringify({browserClosed:true,serversExited:servers.map(s=>({pid:s.child.pid,exitCode:s.child.exitCode,signal:s.child.signalCode}))},null,2));
 }
})().catch(e=>{console.error(e);process.exitCode=1});

/* Isolated real-browser trace for Board Studio's existing app/dist artifact. */
const playwright = require("/home/chris/projects/ts-boardstudio2/app/node_modules/@playwright/test");
const { chromium } = playwright;
const { readFile, writeFile } = require('node:fs/promises');

let baseURL = 'http://127.0.0.1:4182/boardstudio/';
const fixturePath = "/home/chris/projects/ts-boardstudio2/.omo/ulw-research/20260920-154353/artifacts/fixture-60.yaml";
const output = process.argv[2] || '/tmp/boardstudio-drag-runtime.HxnG8x/raw.json';
const repeats = Number(process.env.DRAG_REPEATS || 8);

function percentile(values, p) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  return sorted[Math.max(0, Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1))];
}
function summary(results) {
  const fields = [
    'pointerDownToFirstTransformMs',
    'firstMoveToFirstTransformMs',
    'pointerUpToPersistedMs',
    'pointerUpToWorkerRequestMs',
    'pointerUpToOutlineMs',
    'pointerUpToWorkerTerminalMs',
    'pointerUpToCommittedPolygonMs',
  ];
  const distributions = Object.fromEntries(
    fields.map((field) => {
      const values = results.map((r) => r.metrics[field]);
      return [field, { n: values.filter(Number.isFinite).length, min: percentile(values, 0), median: percentile(values, 0.5), p95: percentile(values, 0.95), max: percentile(values, 1) }];
    })
  );
  return { distributions, attempts: { total: results.length, sourceChanged: results.filter((r) => r.metrics.sourceChanged).length, workerTerminal: results.filter((r) => Number.isFinite(r.metrics.pointerUpToWorkerTerminalMs)).length, noSourceCommit: results.filter((r) => !r.metrics.sourceChanged).length } };
}

async function waitForReady(page) {
  await page.waitForSelector('[aria-label="Interactive board layout"] [data-object="fingers_c1_r1"]', { timeout: 60000 });
  await page.waitForFunction(() => ![...document.querySelectorAll('[role="status"]')].some((node) => /Updating (layout|outline)…/.test(node.textContent || '')), null, { timeout: 60000 });
}
async function source(page) {
  return page.evaluate(() => {
    const multi = JSON.parse(localStorage.getItem('ergogen:multi-config') || 'null');
    return multi?.configs?.find((config) => config.id === multi.activeConfigId)?.config ?? JSON.parse(localStorage.getItem('ergogen:config') || '""');
  });
}
async function setSnapMillimetres(page) {
  const trigger = page.getByRole('button', { name: 'Snapping settings', exact: true });
  await trigger.click();
  const field = page.getByLabel('Custom snap increment');
  await field.fill('1');
  await trigger.click();
}
async function arm(page, scenario) {
  await page.evaluate((scenario) => window.__dragProbe.arm(scenario), scenario);
}
async function collect(page, scenario) {
  return page.evaluate((scenario) => window.__dragProbe.collect(scenario), scenario);
}
async function waitForWorkerOrTimeout(page) {
  try {
    await page.waitForFunction(() => window.__dragProbe.workerSuccess(), null, { timeout: 7000 });
    return true;
  } catch {
    return false;
  }
}
async function newMeasuredPage(browser, fixture) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') problems.push(`console: ${message.text()}`); });
  await page.addInitScript(({ fixture }) => {
    localStorage.clear();
    localStorage.setItem('ergogen:config', JSON.stringify(fixture));
    const records = [];
    const state = { scenario: '', baselineSource: '', baselineTransform: '', baselinePolygon: '', events: [], frames: [], packets: [], tasks: [], loaf: [], armTime: 0 };
    const layout = () => document.querySelector('[aria-label="Interactive board layout"]');
    const target = () => layout()?.querySelector('[data-object="fingers_c1_r1"]');
    const currentSource = () => {
      const multi = JSON.parse(localStorage.getItem('ergogen:multi-config') || 'null');
      return multi?.configs?.find((config) => config.id === multi.activeConfigId)?.config ?? JSON.parse(localStorage.getItem('ergogen:config') || '""');
    };
    const snapshot = () => {
      const group = target();
      return { transform: group?.getAttribute('transform') || '', polygon: group?.querySelector('polygon')?.getAttribute('points') || '', source: currentSource(), status: [...document.querySelectorAll('[role="status"]')].map((node) => node.textContent || '').filter(Boolean) };
    };
    const addEvent = (event) => {
      if (!state.scenario) return;
      state.events.push({ type: event.type, time: event.timeStamp, performanceNow: performance.now(), x: event.clientX, y: event.clientY, pointerId: event.pointerId, altKey: event.altKey });
    };
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) document.addEventListener(type, addEvent, true);
    new PerformanceObserver((list) => state.tasks.push(...list.getEntries().map((entry) => ({ start: entry.startTime, duration: entry.duration })))).observe({ type: 'longtask', buffered: true });
    const supportedEntries = PerformanceObserver.supportedEntryTypes || [];
    if (supportedEntries.includes('long-animation-frame')) new PerformanceObserver((list) => state.loaf.push(...list.getEntries().map((entry) => ({ start: entry.startTime, duration: entry.duration, renderStart: entry.renderStart || null, styleAndLayoutStart: entry.styleAndLayoutStart || null, firstUIEventTimestamp: entry.firstUIEventTimestamp || null, blockingDuration: entry.blockingDuration || null })))).observe({ type: 'long-animation-frame', buffered: true });
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(url, options) {
        super(url, options);
        this.addEventListener('message', (event) => {
          if (!state.scenario || !event.data || typeof event.data !== 'object') return;
          const { type, requestId, revision, stage, source, error } = event.data;
          state.packets.push({ direction: 'reply', time: performance.now(), type, requestId, revision, stage, source, error });
        });
      }
      postMessage(message, options = []) {
        if (state.scenario && message && typeof message === 'object') {
          const { type, requestId, revision, inputConfig, source } = message;
          state.packets.push({ direction: 'request', time: performance.now(), type, requestId, revision, source: inputConfig || source });
        }
        return Array.isArray(options) ? super.postMessage(message, options) : super.postMessage(message, options);
      }
    };
    window.__dragProbe = {
      arm(scenario) {
        const value = snapshot();
        state.scenario = scenario;
        state.baselineSource = value.source;
        state.baselineTransform = value.transform;
        state.baselinePolygon = value.polygon;
        state.events = [];
        state.frames = [];
        state.packets = [];
        state.tasks = [];
        state.loaf = [];
        state.armTime = performance.now();
      },
      collect(scenario) {
        const end = performance.now();
        const value = snapshot();
        const result = { scenario, armTime: state.armTime, end, baseline: { source: state.baselineSource, transform: state.baselineTransform, polygon: state.baselinePolygon }, final: value, events: state.events, frames: state.frames, packets: state.packets, longTasks: state.tasks.filter((task) => task.start >= state.armTime && task.start <= end), longAnimationFrames: state.loaf.filter((entry) => entry.start >= state.armTime && entry.start <= end), performanceEntrySupport: { longAnimationFrame: supportedEntries.includes('long-animation-frame'), event: supportedEntries.includes('event') } };
        records.push(result);
        state.scenario = '';
        return result;
      },
      records,
      workerSuccess() {
        const request = state.packets.findLast((packet) => packet.direction === 'request' && packet.type === 'studio' && packet.source !== state.baselineSource);
        return !!request && state.packets.some((packet) => packet.direction === 'reply' && packet.requestId === request.requestId && packet.revision === request.revision && ['success', 'error'].includes(packet.type));
      },
    };
    const frame = () => {
      if (state.scenario) {
        const value = snapshot();
        const last = state.frames.at(-1);
        if (!last || last.transform !== value.transform || last.polygon !== value.polygon || last.source !== value.source) state.frames.push({ time: performance.now(), ...value });
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, { fixture });
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 120000 });
  await waitForReady(page);
  await page.getByRole('button', { name: 'Select Objects', exact: true }).click();
  await page.getByRole('button', { name: 'Select fingers_c1_r1', exact: true }).click();
  await setSnapMillimetres(page);
  return { context, page, problems };
}
function metrics(raw) {
  const event = (type) => raw.events.find((event) => event.type === type);
  const last = (type) => raw.events.filter((event) => event.type === type).at(-1);
  const down = event('pointerdown');
  const firstMove = raw.events.find((event) => event.type === 'pointermove' && down && event.time >= down.time);
  const up = last('pointerup');
  const transform = raw.frames.find((frame) => frame.transform !== raw.baseline.transform);
  const persisted = raw.frames.find((frame) => frame.source !== raw.baseline.source);
  const polygon = raw.frames.find((frame) => frame.polygon !== raw.baseline.polygon);
  const workerRequest = raw.packets.findLast((packet) => packet.direction === 'request' && packet.type === 'studio' && packet.source !== raw.baseline.source);
  const matched = workerRequest ? raw.packets.filter((packet) => packet.requestId === workerRequest.requestId && packet.revision === workerRequest.revision) : [];
  const outline = matched.find((packet) => packet.stage === 'outline');
  const success = matched.find((packet) => packet.direction === 'reply' && packet.type === 'success');
  return {
    eventCounts: Object.fromEntries(['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].map((type) => [type, raw.events.filter((event) => event.type === type).length])),
    pointerDownToFirstTransformMs: down && transform ? transform.time - down.time : null,
    firstMoveToFirstTransformMs: firstMove && transform ? transform.time - firstMove.time : null,
    moveToNextTransformMs: raw.events.filter((event) => event.type === 'pointermove' && down && event.time >= down.time).map((event) => {
      const next = raw.frames.find((frame) => frame.time >= event.time && frame.transform !== raw.baseline.transform);
      return next ? next.time - event.time : null;
    }),
    pointerUpToPersistedMs: up && persisted ? persisted.time - up.time : null,
    pointerUpToWorkerRequestMs: up && workerRequest ? workerRequest.time - up.time : null,
    pointerUpToOutlineMs: up && outline ? outline.time - up.time : null,
    pointerUpToWorkerTerminalMs: up && (success || matched.find((packet) => packet.type === 'error')) ? (success || matched.find((packet) => packet.type === 'error')).time - up.time : null,
    pointerUpToCommittedPolygonMs: up && polygon ? polygon.time - up.time : null,
    sourceChanged: raw.final.source !== raw.baseline.source,
    transformChanged: raw.frames.some((frame) => frame.transform !== raw.baseline.transform),
    polygonChanged: raw.frames.some((frame) => frame.polygon !== raw.baseline.polygon),
  };
}
async function sustainedDrag(browser, fixture, index) {
  const { context, page, problems } = await newMeasuredPage(browser, fixture);
  try {
    const target = page.locator('[data-object="fingers_c1_r1"]');
    const box = await target.boundingBox();
    if (!box) throw new Error('no target box');
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await arm(page, `sustained-${index}`);
    await page.mouse.move(x, y);
    await page.mouse.down();
    const offsets = [
      ...Array.from({ length: 18 }, (_, index) => -(index + 1) * 8),
      ...Array.from({ length: 18 }, (_, index) => -144 + ((index + 1) * 132) / 18),
    ];
    for (const offset of offsets) await page.mouse.move(x + offset, y);
    await page.mouse.up();
    await page.waitForFunction(() => {
      const probe = window.__dragProbe;
      const group = document.querySelector('[data-object="fingers_c1_r1"]');
      return probe && group && JSON.parse(localStorage.getItem('ergogen:multi-config') || 'null');
    });
    const workerSuccessObserved = await waitForWorkerOrTimeout(page);
    const raw = await collect(page, `sustained-${index}`);
    return { scenario: `sustained-${index}`, raw, metrics: metrics(raw), workerSuccessObserved, problems };
  } finally { await context.close(); }
}
async function scenario(browser, fixture, name, action) {
  const { context, page, problems } = await newMeasuredPage(browser, fixture);
  try {
    const value = await action(page);
    const workerSuccessObserved = name !== 'pointercancel' ? await waitForWorkerOrTimeout(page) : false;
    const raw = await collect(page, name);
    return { scenario: name, raw, metrics: metrics(raw), workerSuccessObserved, value, problems };
  } finally { await context.close(); }
}
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

/* Isolated real-browser trace for Board Studio's existing app/dist artifact. */
const playwright = require('/home/chris/projects/ts-boardstudio2/app/node_modules/@playwright/test');
const { chromium } = playwright;
const { readFile, writeFile } = require('node:fs/promises');

const baseURL = process.env.DRAG_BASE_URL || 'http://127.0.0.1:4181/boardstudio/';
const fixturePath =
  __dirname + '/fixture.yaml';
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

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const out = __dirname;
(async () => {
  const fixture = await readFile(fixturePath, 'utf8');
  await writeFile(out + '/fixture.yaml', fixture);
  const log = fs.openSync(out + '/server.log', 'w');
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4181', '--strictPort'], { cwd: '/home/chris/projects/ts-boardstudio2/app', stdio: ['ignore', log, log] });
  let browser;
  let cleanup = { serverPid: server.pid, browserClosed: false, serverExited: false };
  try {
    for (let n = 0; n < 100; n++) {
      try { const response = await fetch(baseURL); if (response.ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ headless: true, channel: 'chromium' });
    const { context, page, problems } = await newMeasuredPage(browser, fixture);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
    const target = page.locator('[data-object="fingers_c1_r1"]');
    const box = await target.boundingBox();
    if (!box) throw new Error('No target box');
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await arm(page, 'release-profile');
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (const offset of [-10, -20, -30, -40, -50, -60]) await page.mouse.move(x + offset, y);
    const profileStart = await page.evaluate(() => performance.now());
    await cdp.send('Profiler.start');
    await page.mouse.up();
    const workerSuccessObserved = await waitForWorkerOrTimeout(page);
    await page.waitForFunction(() => {
      const r = window.__dragProbe.records;
      return !!document.querySelector('[data-object="fingers_c1_r1"]');
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const profileEnd = await page.evaluate(() => performance.now());
    const { profile } = await cdp.send('Profiler.stop');
    await writeFile(out + '/release.cpuprofile', JSON.stringify(profile));
    const raw = await collect(page, 'release-profile');
    const report = { generatedAt: new Date().toISOString(), runtime: process.version, browser: browser.version(), baseURL, fixturePath, profileStart, profileEnd, raw, metrics: metrics(raw), workerSuccessObserved, problems };
    await writeFile(out + '/raw.json', JSON.stringify(report, null, 2));
    await page.screenshot({ path: out + '/after.png', fullPage: true });
    if (!report.metrics.sourceChanged || !report.metrics.polygonChanged) throw new Error('Drag did not commit source and polygon');
    console.log(JSON.stringify({ metrics: report.metrics, problems, profileStart, profileEnd }, null, 2));
    await context.close();
  } finally {
    if (browser) { await browser.close(); cleanup.browserClosed = true; }
    server.kill('SIGTERM');
    await new Promise(resolve => { if (server.exitCode !== null) resolve(); else server.once('exit', resolve); });
    cleanup.serverExited = true;
    fs.closeSync(log);
    await writeFile(out + '/cleanup.json', JSON.stringify(cleanup, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const appRequire = Module.createRequire(path.join(process.cwd(), 'app/package.json'));
const { chromium, expect } = appRequire('@playwright/test');
const ts = appRequire('typescript');
const evidence = __dirname;
const baseline = new Module(path.join(process.cwd(), 'app/e2e/utils/baseline-studio.cjs'));
baseline.filename = baseline.id;
baseline.paths = Module._nodeModulePaths(path.dirname(baseline.filename));
baseline._compile(ts.transpileModule(fs.readFileSync(path.join(evidence, 'base-studio.txt'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, baseline.filename);
const { openInspector, openCode } = baseline.exports;

(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const scenario of ['responsive', 'settings']) {
      const context = await browser.newContext({ viewport: scenario === 'responsive' ? { width: 375, height: 667 } : { width: 1280, height: 720 } });
      await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
      const page = await context.newPage();
      page.setDefaultTimeout(5000);
      try {
        await page.goto('http://127.0.0.1:4184/boardstudio/new');
        // Bypass only obsolete creation actions: assert the app-created default draft.
        await expect(page).toHaveURL('http://127.0.0.1:4184/boardstudio/');
        await expect(page.getByRole('region', { name: 'Board Studio' })).toBeVisible();
        await expect(page.getByRole('button', { name: /^Select fingers_c\d+_r\d+$/ })).toHaveCount(20);
        const result = { scenario, route: page.url(), keys: 20, baselineHelper: true };
        if (scenario === 'responsive') {
          await expect(page.getByRole('group', { name: 'Interactive board layout' })).toBeVisible();
          await openInspector(page);
          await expect(page.getByRole('complementary', { name: 'Design inspector' })).toBeVisible();
          await page.getByRole('button', { name: 'Close inspector', exact: true }).click();
          result.codeButtons = await page.getByRole('button', { name: 'Code', exact: true }).count();
          try { await openCode(page); result.failureReproduced = false; }
          catch (error) { result.failureReproduced = /name: 'Code'/.test(error.message); result.error = error.message; }
        } else {
          await page.getByRole('button', { name: 'Settings', exact: true }).click();
          const settings = page.getByRole('dialog', { name: 'Project settings' });
          await expect(settings).toBeVisible();
          result.offlineAppTextCount = await settings.getByText('Offline App', { exact: true }).count();
          result.dialogText = await settings.innerText();
          try { await expect(settings.getByText('Offline App', { exact: true })).toBeVisible(); result.failureReproduced = false; }
          catch (error) { result.failureReproduced = result.offlineAppTextCount === 0; result.error = error.message; }
        }
        await page.screenshot({ path: path.join(evidence, `${scenario}.png`) });
        results.push(result);
      } finally {
        await context.tracing.stop({ path: path.join(evidence, `${scenario}-trace.zip`) });
        await context.close();
      }
    }
    fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify(results, null, 2));
    if (results.length !== 2 || results.some(result => !result.failureReproduced)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

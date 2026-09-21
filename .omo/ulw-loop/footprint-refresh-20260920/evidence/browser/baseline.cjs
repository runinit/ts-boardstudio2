const { chromium, expect } = require(process.cwd() + '/app/node_modules/@playwright/test');
const fs = require('fs');
const dir = '.omo/ulw-loop/footprint-refresh-20260920/evidence/browser';
const events = [];
const widths = [1280, 768, 375];
(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();
  page.on('pageerror', e => events.push({ kind: 'pageerror', message: e.message }));
  page.on('requestfailed', req => events.push({ kind: 'requestfailed', url: req.url(), error: req.failure() }));
  const capture = async name => {
    await page.screenshot({ path: `${dir}/${name}.png` });
    events.push({ kind: 'capture', name, viewport: page.viewportSize(), text: await page.locator('body').innerText(),
      overflow: await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth })) });
  };
  try {
    await page.addInitScript(() => localStorage.setItem('ergogen:config', JSON.stringify('schema: ergogen/v1\nlayout: {}\n')));
    await page.goto('http://127.0.0.1:43179/boardstudio/');
    await page.getByRole('button', { name: 'Part library', exact: true }).click();
    await page.getByLabel('Search footprints', { exact: true }).waitFor();
    for (const name of ['switch_choc_v1_v2', 'switch_mx', 'mcu_nice_nano']) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.getByRole('button', { name: `ceoloide/${name} · Bundled`, exact: true }).click();
      await page.getByRole('button', { name: 'Pads & nets', exact: true }).click();
      await expect(page.getByText('Inspecting footprint…', { exact: true })).toBeHidden({ timeout: 60000 });
      await expect(page.getByText(/[1-9]\d* pads · duplicate numbers share a net\./)).toBeVisible({ timeout: 60000 });
      await page.getByRole('button', { name: '2D', exact: true }).click();
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const previewClose = page.getByRole('button', { name: 'Close inspector', exact: true });
        if (await previewClose.isVisible()) await previewClose.click();
        await capture(`${name}-${width}-preview`);
        const inspector = page.getByRole('button', { name: 'Inspector', exact: true });
        if (await inspector.isVisible()) await inspector.click();
        const summary = page.getByText('Parameters & source', { exact: true });
        if (await summary.isVisible()) {
          const open = await summary.evaluate(node => node.parentElement.open);
          if (!open) await summary.click();
          await page.getByLabel('side', { exact: true }).scrollIntoViewIfNeeded();
          await capture(`${name}-${width}-settings`);
          await summary.click();
        } else events.push({ kind: 'missing-settings', name, width });
        const close = page.getByRole('button', { name: 'Close inspector', exact: true });
        if (await close.isVisible()) await close.click();
      }
    }
  } finally {
    fs.writeFileSync(`${dir}/actions.json`, JSON.stringify(events, null, 2));
    await context.tracing.stop({ path: `${dir}/baseline-trace.zip` });
    await context.close();
    await browser.close();
  }
})().catch(error => { fs.writeFileSync(`${dir}/failure.txt`, String(error)); console.error(error); process.exitCode = 1; });

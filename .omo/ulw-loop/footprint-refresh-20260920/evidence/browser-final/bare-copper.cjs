const { chromium, expect } = require(process.cwd() + '/app/node_modules/@playwright/test');
const { PNG } = require(process.cwd() + '/node_modules/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/lib/utilsBundle.js');
const fs = require('fs');
const dir = '.omo/ulw-loop/footprint-refresh-20260920/evidence/browser-final';
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.addInitScript(() => localStorage.setItem('ergogen:config', JSON.stringify('schema: ergogen/v1\nlayout: {}\n')));
    await page.goto('http://127.0.0.1:43181/boardstudio/');
    await page.getByRole('button', { name: 'Part library', exact: true }).click();
    await page.getByRole('button', { name: 'ceoloide/mcu_nice_nano · Bundled', exact: true }).click();
    const ready = async () => {
      await expect(page.getByText('Inspecting footprint…', { exact: true })).toBeHidden({ timeout: 90000 });
      await expect(page.getByRole('button', { name: 'Save footprint', exact: true })).toBeEnabled({ timeout: 90000 });
    };
    await ready();
    await page.getByRole('checkbox', { name: 'reversible', exact: true }).check();
    await ready();
    await page.getByRole('combobox', { name: 'side', exact: true }).selectOption('B');
    await ready();
    const filename = page.getByLabel('mcu_3dmodel_filename', { exact: true });
    await filename.fill('');
    await filename.press('Tab');
    await ready();
    await page.getByRole('button', { name: '3D', exact: true }).click();
    await expect.poll(async () => {
      const image = PNG.sync.read(await page.locator('[aria-label="Footprint preview"] canvas').first().screenshot());
      let copper = 0;
      for (let i = 0; i < image.data.length; i += 4) if (image.data[i] > 90 && image.data[i] > image.data[i + 2] * 1.4) copper++;
      return copper;
    }, { timeout: 90000 }).toBeGreaterThan(1000);
    await page.screenshot({ path: `${dir}/mcu-nice-nano-3d-bare-copper.png` });
    fs.writeFileSync(`${dir}/bare-copper.json`, JSON.stringify({ params: { side: 'B', reversible: true, mcu_3dmodel_filename: '' }, errors, text: await page.locator('body').innerText() }, null, 2));
  } finally { await page.context().close(); await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

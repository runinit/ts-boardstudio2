const { chromium, expect } = require(process.cwd() + '/app/node_modules/@playwright/test');
const fs = require('fs');
const { PNG } = require(process.cwd() + '/node_modules/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/lib/utilsBundle.js');
const dir = '.omo/ulw-loop/footprint-refresh-20260920/evidence/browser-final';
const log = [];
(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => log.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) log.push({ type: 'console', level: message.type(), message: message.text() }); });
  page.on('requestfailed', request => log.push({ type: 'requestfailed', url: request.url(), error: request.failure() }));
  const svg = () => page.getByRole('img', { name: /^Footprint pads and geometry,/ });
  const ready = async () => {
    await expect(page.getByText('Inspecting footprint…', { exact: true })).toBeHidden({ timeout: 90000 });
    await expect(page.getByRole('group', { name: 'Footprint settings' })).toBeAttached();
  };
  const openInspector = async () => {
    const button = page.getByRole('button', { name: 'Inspector', exact: true });
    if (await button.isVisible()) await button.click();
  };
  const closeInspector = async () => {
    const button = page.getByRole('button', { name: 'Close inspector', exact: true });
    if (await button.isVisible()) await button.click();
  };
  const open = async name => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('button', { name: `ceoloide/${name} · Bundled`, exact: true }).click();
    await ready();
    await page.getByRole('button', { name: 'Pads & nets', exact: true }).click();
    await expect(svg()).toBeVisible();
  };
  const bool = async (name, value) => {
    await page.getByRole('checkbox', { name, exact: true }).setChecked(value);
    await ready();
  };
  const field = async (name, value) => {
    const input = page.getByLabel(name, { exact: true });
    await input.fill(String(value));
    await input.press('Tab');
    await ready();
  };
  const capture = async name => {
    if (name.includes('-3d')) {
      await expect.poll(async () => {
        const canvas = page.locator('[aria-label="Footprint preview"] canvas').first();
        const image = PNG.sync.read(await canvas.screenshot());
        let bright = 0;
        for (let i = 0; i < image.data.length; i += 4) {
          if (image.data[i] > 90 && image.data[i + 1] > 90 && image.data[i + 2] > 90) bright++;
        }
        return bright;
      }, { timeout: 90000, message: '3D model/copper must be composited before capture' }).toBeGreaterThan(1000);
    }
    await page.screenshot({ path: `${dir}/${name}.png` });
    const state = await page.evaluate(() => {
      const svg = document.querySelector('svg[aria-label^="Footprint pads and geometry,"]');
      return { width: innerWidth, bodyWidth: document.body.scrollWidth,
        svgLabel: svg?.getAttribute('aria-label'), pads: svg?.querySelectorAll('g[data-layer]').length,
        drills: Array.from(svg?.querySelectorAll('title') || []).filter(t => /hole|drill/i.test(t.textContent)).length,
        polygons: svg?.querySelectorAll('g[data-layer] path').length };
    });
    log.push({ type: 'capture', name, state, text: await page.locator('body').innerText() });
  };
  const responsive = async name => {
    for (const width of [1280, 768, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await closeInspector();
      await capture(`${name}-${width}`);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
  };
  try {
    await page.addInitScript(() => localStorage.setItem('ergogen:config', JSON.stringify('schema: ergogen/v1\nlayout: {}\n')));
    await page.goto('http://127.0.0.1:43181/boardstudio/');
    await page.getByRole('button', { name: 'Part library', exact: true }).click();
    await page.getByLabel('Search footprints', { exact: true }).waitFor();
    let noticeChecked = false;
    for (const name of ['switch_choc_v1_v2', 'switch_mx', 'mcu_nice_nano']) {
      await open(name);
      if (name === 'switch_choc_v1_v2') {
        for (const [parameter, malformed] of [['pcb_thickness', ''], ['hotswap_3dmodel_xyz_scale', '[broken']]) {
          const input = page.getByLabel(parameter, { exact: true });
          const original = await input.inputValue();
          await input.fill(malformed);
          await input.press('Tab');
          await expect(input).toHaveAttribute('aria-invalid', 'true');
          await expect(page.getByRole('button', { name: 'Save footprint', exact: true })).toBeDisabled();
          await expect(svg().locator('g[data-layer]')).toHaveCount(0);
          await input.scrollIntoViewIfNeeded();
          await capture('invalid-' + parameter);
          await input.fill(original);
          await input.press('Tab');
          await ready();
          await expect(input).toHaveAttribute('aria-invalid', 'false');
          await expect(svg().locator('g[data-layer]').first()).toBeVisible();
        }
      }
      for (const reversible of [false, true]) for (const side of ['F', 'B']) {
        await bool('reversible', reversible);
        await page.getByRole('combobox', { name: 'side', exact: true }).selectOption(side);
        await ready();
        await expect(svg()).toHaveAttribute('aria-label', `Footprint pads and geometry, ${side === 'F' ? 'front' : 'back'} copper`);
        await expect(svg().locator('g[data-layer]').first()).toBeVisible();
        await responsive(`${name}-${side}-${reversible ? 'reversible' : 'single'}`);
      }
      await page.getByRole('button', { name: '3D models', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Save footprint', exact: true })).toBeEnabled({ timeout: 120000 });
      await capture(`${name}-3d`);
      if (!noticeChecked) {
        const notice = page.locator('[aria-label="Footprint preview"]').first().getByText('Preview limitations', { exact: true });
        await expect(notice).toBeVisible();
        await expect(notice.locator('..')).not.toHaveAttribute('open', '');
        await capture('notice-collapsed-3d');
        await notice.click();
        await expect(notice.locator('..')).toHaveAttribute('open', '');
        await capture('notice-expanded-3d');
        await notice.click();
        await expect(notice.locator('..')).not.toHaveAttribute('open', '');
        noticeChecked = true;
      }
      if (name !== 'mcu_nice_nano') {
        await field('pcb_thickness', '2');
        await expect(page.getByRole('button', { name: 'Save footprint', exact: true })).toBeEnabled({ timeout: 120000 });
        await capture(`${name}-3d-thickness2`);
      } else {
        await bool('reverse_mount', true);
        await expect(page.getByRole('button', { name: 'Save footprint', exact: true })).toBeEnabled({ timeout: 120000 });
        await capture(`${name}-3d-reverse-mount`);
      }
    }
    await open('switch_gateron_ks27_ks33');
    await bool('hotswap', false);
    await bool('solder', true);
    await bool('reversible', true);
    await bool('include_custom_solder_pads', true);
    await expect(svg().locator('g[data-layer] path').first()).toBeVisible();
    await responsive('gateron-custom-solder');
    await open('diode_tht_sod123');
    await bool('reversible', false);
    await bool('include_tht', false);
    await bool('include_thru_hole_smd_pads', true);
    await expect(page.getByRole('alert').filter({ hasText: 'include_thru_hole_smd_pads requires reversible' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save footprint', exact: true })).toBeDisabled();
    await expect(svg().locator('g[data-layer]')).toHaveCount(0);
    for (const width of [1280, 768, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await openInspector();
      await page.getByRole('alert').filter({ hasText: 'include_thru_hole_smd_pads requires reversible' }).scrollIntoViewIfNeeded();
      await capture(`diode-invalid-${width}`);
      await closeInspector();
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await bool('reversible', true);
    await expect(page.getByRole('alert').filter({ hasText: 'include_thru_hole_smd_pads requires reversible' })).toHaveCount(0);
    await expect(svg().locator('g[data-layer]').first()).toBeVisible();
    await capture('diode-recovered');
    log.push({ type: 'complete', success: true });
  } catch (error) {
    log.push({ type: 'failure', message: String(error) });
    await capture('failure');
    throw error;
  } finally {
    fs.writeFileSync(`${dir}/actions.json`, JSON.stringify(log, null, 2));
    await context.tracing.stop({ path: `${dir}/trace.zip` });
    await context.close();
    await browser.close();
    fs.writeFileSync(`${dir}/browser-cleanup.txt`, 'Context and headed Chromium closed in finally.\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

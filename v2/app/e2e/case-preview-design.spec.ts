import { expect, test } from '@playwright/test';

for (const theme of ['dark', 'light'] as const) {
  test(`${theme} Case preview uses one set of working 3D controls across viewport sizes`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.addInitScript((value) => localStorage.setItem('boardstudio:v2:theme', value), theme);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.getByRole('treeitem', { name: 'Case', exact: true }).click();
    await expect(page.getByText('Preview current', { exact: true })).toBeVisible({ timeout: 45_000 });
    await expect(page.locator('.wb-case-preview canvas')).toBeVisible();

    // Case owns the camera: no duplicate 2D zoom, axes, scale or snap claims.
    await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Zoom out', exact: true })).toHaveCount(1);
    await expect(page.locator('.wb-canvas-watermark, .wb-axis-indicator, .wb-canvas-scale')).toHaveCount(0);
    await expect(page.getByText('Geometry snap on', { exact: true })).toHaveCount(0);
    const controls = page.locator('footer').getByRole('group', { name: '3D view controls' });
    const fit = controls.getByRole('button', { name: 'Fit preview', exact: true });
    await expect(fit).toBeEnabled();
    const zoom = controls.getByLabel('Preview zoom', { exact: true });
    await expect(zoom).toHaveText('100%');
    const initial = await page.locator('.wb-case-preview canvas').screenshot();
    await controls.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await expect(zoom).toHaveText('120%');
    const enlarged = await page.locator('.wb-case-preview canvas').screenshot();
    expect(enlarged.equals(initial)).toBe(false);
    await fit.focus();
    await page.keyboard.press('Enter');
    await expect(zoom).toHaveText('100%');

    for (const [size, width, height] of [['desktop', 1280, 900], ['wide', 1672, 941], ['narrow', 390, 844]] as const) {
      await page.setViewportSize({ width, height });
      await fit.click();
      await expect(zoom).toHaveText('100%');
      const bounds = await controls.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByText('Visual preview · not clearance proof', { exact: true })).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${size}-case.png`), animations: 'disabled' });
    }
  });
}

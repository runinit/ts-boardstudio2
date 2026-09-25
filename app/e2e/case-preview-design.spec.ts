import { expect, test } from '@playwright/test';

for (const theme of ['dark', 'light'] as const) {
  test(`${theme} Case preview uses one set of working 3D controls across viewport sizes`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript((value) => localStorage.setItem('boardstudio:v2:theme', value), theme);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.getByRole('treeitem', { name: 'Case', exact: true }).click();
    await expect(page.getByText('Preview current', { exact: true })).toBeVisible({ timeout: 45_000 });
    await expect(page.locator('.wb-assembly-scene canvas')).toBeVisible();

    // Case owns the camera: no duplicate 2D zoom, axes, scale or snap claims.
    await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Zoom out', exact: true })).toHaveCount(0);
    await expect(page.locator('.wb-canvas-watermark, .wb-axis-indicator, .wb-canvas-scale')).toHaveCount(0);
    await expect(page.getByText('Geometry snap on', { exact: true })).toHaveCount(0);
    const controls = page.getByRole('group', { name: 'Assembly camera' });
    const fit = controls.getByRole('button', { name: 'Fit', exact: true });
    await expect(fit).toBeEnabled();
    await controls.getByRole('button', { name: 'Top', exact: true }).click();
    const initial = await page.locator('.wb-assembly-scene canvas').screenshot();
    await controls.getByRole('button', { name: 'Bottom', exact: true }).click();
    const flipped = await page.locator('.wb-assembly-scene canvas').screenshot();
    expect(flipped.equals(initial)).toBe(false);
    await fit.focus();
    await page.keyboard.press('Enter');

    for (const [size, width, height] of [['desktop', 1280, 900], ['wide', 1672, 941], ['narrow', 390, 844]] as const) {
      await page.setViewportSize({ width, height });
      await fit.click();
      const bounds = await controls.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByLabel('Complete PCB assembly preview')).toBeVisible();
    }
  });
}

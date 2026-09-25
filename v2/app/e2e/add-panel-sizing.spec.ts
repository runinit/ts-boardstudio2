import { expect, test } from '@playwright/test';

test('Add panel icons stay compact in pinned and narrow drawers', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('treeitem', { name: /^Column 1/ }).click();
  await page.getByRole('button', { name: 'Add object', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Add', exact: true });
  for (const width of [1440, 600]) {
    await page.setViewportSize({ width, height: 1000 });
    if (width < 700) {
      await page.getByRole('button', { name: 'Objects', exact: true }).click();
      await page.getByRole('button', { name: 'Add object', exact: true }).click();
    }
    await expect(panel).toBeVisible();
    const sizes = await panel.locator('button svg').evaluateAll((icons) => icons.map((icon) => ({ width: icon.getBoundingClientRect().width, height: icon.getBoundingClientRect().height })));
    expect(sizes.length).toBeGreaterThan(4);
    for (const size of sizes) {
      expect(size.width).toBeGreaterThan(0);
      expect(size.width).toBeLessThanOrEqual(20);
      expect(size.height).toBeLessThanOrEqual(20);
    }
    for (const name of ['Matrix…', 'Add row', 'Add column', 'Browse all parts']) {
      const button = panel.getByRole('button', { name, exact: true });
      expect((await button.boundingBox())!.height).toBeLessThanOrEqual(80);
    }
  }
});

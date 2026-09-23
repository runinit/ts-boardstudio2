import { expect, test } from '@playwright/test';

test('canvas wheel zoom keeps the page fixed', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByRole('application', { name: /Board layout canvas/ });
  const before = await canvas.getAttribute('viewBox');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => canvas.getAttribute('viewBox')).not.toBe(before);

  const scroll = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
    height: document.scrollingElement!.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(scroll.x).toBe(0);
  expect(scroll.y).toBe(0);
  expect(scroll.height).toBeLessThanOrEqual(scroll.viewportHeight);
});

test('inspector fits a narrow effective viewport without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 576 });
  await page.goto('/');
  await page.getByRole('button', { name: /^SW1, MX switch/ }).click();

  const inspector = page.locator('.wb-inspector-content');
  const width = await inspector.evaluate((element) => ({
    content: element.scrollWidth,
    viewport: element.clientWidth,
  }));
  expect(width.content).toBeLessThanOrEqual(width.viewport + 1);

  await inspector.hover();
  await page.mouse.wheel(0, 300);
  await expect.poll(() => inspector.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});

test('selection controls fit when page zoom narrows the workspace', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 576 });
  await page.goto('/');

  const controls = await page.locator('.wb-selection-pills').evaluate((element) => ({
    content: element.scrollWidth,
    viewport: element.clientWidth,
  }));
  expect(controls.content).toBeLessThanOrEqual(controls.viewport + 1);
});

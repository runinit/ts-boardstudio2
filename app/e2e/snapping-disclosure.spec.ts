import { test, expect } from '@playwright/test';
import { compileSetup, defaultSetup } from '../src/utils/designSetup';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';

const READY_TIMEOUT = 60000;
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
  { width: 844, height: 390 },
]) {
  test(`snapping folds below its tool and fits at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(READY_TIMEOUT);
    await page.setViewportSize(viewport);
    const source = compileSetup({
      ...defaultSetup(),
      columns: 3,
      rows: 3,
      diode: false,
    });
    await page.addInitScript(
      ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
      { key: CONFIG_LOCAL_STORAGE_KEY, source }
    );
    await page.goto('./');
    const canvas = page.getByRole('group', {
      name: 'Interactive board layout',
    });
    await expect(canvas).toBeVisible({ timeout: READY_TIMEOUT });
    const tools = page.getByRole('toolbar', {
      name: 'Canvas tools',
      exact: true,
    });
    const snapping = tools.getByRole('button', {
      name: 'Snapping',
      exact: true,
    });
    const arrow = tools.getByRole('button', {
      name: 'Snapping settings',
      exact: true,
    });
    const panel = page.getByRole('region', {
      name: 'Snapping settings',
      exact: true,
    });
    await expect(
      page.getByRole('button', { name: 'Snapping', exact: true })
    ).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: 'Canvas options', exact: true })
    ).toHaveCount(0);
    await expect(arrow).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await arrow.scrollIntoViewIfNeeded();
    const toolBox = (await snapping.boundingBox())!;
    const arrowBox = (await arrow.boundingBox())!;
    expect(arrowBox.y).toBeGreaterThanOrEqual(toolBox.y + toolBox.height);
    expect(arrowBox.x).toBe(toolBox.x);
    await expect(arrow).toBeInViewport();
    const closedWidth = (await tools.boundingBox())!.width;
    const closedHeight = await tools.evaluate(
      (element) => element.scrollHeight
    );
    await arrow.click();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS('position', 'static');
    await expect
      .poll(async () => (await tools.boundingBox())!.width)
      .toBe(closedWidth);
    await expect
      .poll(() => tools.evaluate((element) => element.scrollHeight))
      .toBeGreaterThan(closedHeight);
    await expect
      .poll(async () => {
        const bounds = (await canvas.locator('..').boundingBox())!;
        const menu = (await panel.boundingBox())!;
        const camera = (await page
          .getByRole('toolbar', { name: 'View controls' })
          .boundingBox())!;
        return (
          menu.width >= 240 &&
          menu.height > 0 &&
          menu.x >= bounds.x &&
          menu.y >= bounds.y &&
          menu.x + menu.width <= bounds.x + bounds.width &&
          menu.y + menu.height <= bounds.y + bounds.height &&
          (menu.y + menu.height <= camera.y || menu.x + menu.width <= camera.x)
        );
      })
      .toBe(true);
    const expandedArrow = (await arrow.boundingBox())!;
    const expandedPanel = (await panel.boundingBox())!;
    expect(expandedPanel.x).toBe(expandedArrow.x);
    expect(expandedPanel.y).toBeGreaterThanOrEqual(
      expandedArrow.y + expandedArrow.height
    );
    if (viewport.width === 1440) {
      const heights = await arrow.evaluate(async (button) => {
        const slide = button.nextElementSibling!;
        await Promise.all(
          slide.getAnimations().map((animation) => animation.finished)
        );
        const samples = [slide.getBoundingClientRect().height];
        (button as HTMLButtonElement).click();
        const start = performance.now();
        while (performance.now() - start < 300) {
          await new Promise(requestAnimationFrame);
          samples.push(slide.getBoundingClientRect().height);
        }
        return samples;
      });
      expect(heights.at(-1)).toBe(0);
      expect(Math.max(...heights)).toBeLessThanOrEqual(heights[0] + 1);
      expect(heights.some((height) => height > 0 && height < heights[0])).toBe(
        true
      );
      await arrow.click();
    }
    await expect
      .poll(() =>
        panel.evaluate((element) => element.scrollWidth - element.clientWidth)
      )
      .toBe(0);
    await panel.getByRole('checkbox', { name: 'Footprint origins' }).check();
    const custom = panel.getByLabel('Custom snap increment');
    await custom.fill('1.5');
    await custom.press('Escape');
    await expect(panel).toBeHidden();
    await expect(arrow).toBeFocused();
    await snapping.click();
    await expect(snapping).toHaveAttribute('aria-pressed', 'false');
    await arrow.click();
    await expect(panel.getByLabel('Custom snap increment')).toHaveValue('1.5');
    await expect(
      panel.getByRole('checkbox', { name: 'Footprint origins' })
    ).toBeChecked();
    await expect(
      panel.getByRole('button', { name: 'Snap increment 0.25u' })
    ).toBeDisabled();
    await panel
      .getByRole('button', { name: 'Close snapping settings' })
      .click();
    await expect(panel).toBeHidden();
    await expect(arrow).toBeFocused();
  });
}

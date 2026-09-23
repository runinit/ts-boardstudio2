import { expect, test } from '@playwright/test';
import { compileSetup, defaultSetup } from '../src/utils/designSetup';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { readSource } from './utils/studio';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`keeps contextual editing usable at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize(viewport);
    await page.route('http://localhost:8400/**', (route) => route.abort());
    const source = compileSetup({
      ...defaultSetup(),
      columns: 5,
      rows: 4,
      diode: false,
    });
    await page.addInitScript(
      ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
      { key: CONFIG_LOCAL_STORAGE_KEY, source }
    );
    await page.goto('./');
    await expect(
      page.getByRole('button', { name: 'Generate project', exact: true })
    ).toBeEnabled({ timeout: 60000 });
    await page.screenshot({
      path: `../.omo/evidence/stitch-ui/design-${viewport.width}.png`,
    });
    await page
      .getByRole('button', { name: 'Select Rows', exact: true })
      .click();
    await page.locator('[data-object]').first().click();
    const tray = page.getByTestId('selection-quick-actions');
    await expect(tray).toBeVisible();
    await tray.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations().map((animation) => animation.finished)
      );
    });
    await expect(
      tray.getByRole('button', { name: 'Close selection actions' })
    ).toBeInViewport();
    expect(
      await tray.evaluate(
        (element) => element.scrollWidth <= element.clientWidth
      )
    ).toBe(true);
    await page.screenshot({
      path: `../.omo/evidence/stitch-ui/selection-${viewport.width}.png`,
    });
    const before = await readSource(page);
    await tray
      .getByRole('textbox', { name: 'Relative x', exact: true })
      .fill('2');
    await tray
      .getByRole('button', { name: 'Apply relative adjustment' })
      .click();
    await expect(
      page.getByRole('button', { name: 'Undo project edit' })
    ).toBeEnabled();
    expect(await readSource(page)).not.toBe(before);
    await expect(
      page.getByRole('button', { name: 'Generate project', exact: true })
    ).toBeEnabled();
    await tray.getByRole('button', { name: 'Open Inspector' }).click();
    const inspector = page.getByRole('complementary', {
      name: 'Design inspector',
    });
    await expect(inspector).toBeVisible();
    await inspector.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations().map((animation) => animation.finished)
      );
    });
    await page.screenshot({
      path: `../.omo/evidence/stitch-ui/inspector-${viewport.width}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
}

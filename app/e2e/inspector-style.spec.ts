import { test, expect } from '@playwright/test';
import { compileSetup, defaultSetup } from '../src/utils/designSetup';
import { setValue } from '../src/utils/studioSource';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';

const READY_TIMEOUT = 120000;
const GRAPHITE_PANEL = 'rgb(40, 47, 55)';
const DRAFT_BLUE = 'rgb(121, 183, 212)';
const LONG_LABEL =
  'A long custom key label that must remain readable in the Inspector';

for (const axis of ['Column', 'Row']) {
  for (const width of [1440, 390]) {
    test(`${axis} Inspector keeps its palette and key actions usable at ${width}px`, async ({
      page,
    }) => {
      test.setTimeout(READY_TIMEOUT);
      await page.setViewportSize({ width, height: 1000 });
      const source = setValue(
        compileSetup({
          ...defaultSetup(),
          columns: 3,
          rows: 4,
          diode: false,
        }),
        ['layout', 'objects', 'fingers_c1_r1', 'label'],
        LONG_LABEL
      );
      await page.addInitScript(
        ({ key, source }) => {
          localStorage.setItem(key, JSON.stringify(source));
        },
        { key: CONFIG_LOCAL_STORAGE_KEY, source }
      );
      await page.goto('./');
      const key = page.locator('[data-object="fingers_c1_r1"]');
      await expect(key).toBeVisible({ timeout: READY_TIMEOUT });
      await page
        .getByRole('button', { name: `Select ${axis}s`, exact: true })
        .click();
      await key.focus();
      await key.press('Enter');
      const trigger = page.getByRole('button', {
        name: 'Inspector',
        exact: true,
      });
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.click();
      const properties = page.locator('.studio-properties');
      await expect(properties).toHaveCSS('background-color', GRAPHITE_PANEL);
      await expect(
        page.getByRole('button', { name: 'Design', exact: true })
      ).toHaveCSS('color', DRAFT_BLUE);
      await properties
        .locator('summary')
        .filter({ hasText: `${axis} keys` })
        .click();
      const keys = properties.getByRole('list', { name: `${axis} keys` });
      await expect(keys.getByRole('listitem')).toHaveCount(
        axis === 'Column' ? 4 : 3
      );
      const first = keys.getByRole('listitem').first();
      const remove = first.getByRole('button', {
        name: 'Remove fingers_c1_r1',
      });
      const select = first.getByRole('button', {
        name: new RegExp(`${axis === 'Column' ? 'Row' : 'Column'} 1`),
      });
      await remove.scrollIntoViewIfNeeded();
      await expect(remove).toBeInViewport();
      const bounds = await first.boundingBox();
      const removeBounds = await remove.boundingBox();
      expect(removeBounds!.x + removeBounds!.width).toBeLessThanOrEqual(
        bounds!.x + bounds!.width
      );
      expect(
        await properties.evaluate(
          (element) => element.scrollWidth <= element.clientWidth
        )
      ).toBe(true);
      await select.click();
      await expect(
        properties.getByRole('textbox', { name: 'Label', exact: true })
      ).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Switching away unmounts the axis editor; returning keeps its disclosure open.
      if (width < 1050) {
        await page
          .getByRole('button', { name: 'Close inspector', exact: true })
          .click();
      } else {
        await trigger.click();
      }
      await page
        .getByRole('button', { name: `Select ${axis}s`, exact: true })
        .click();
      await key.focus();
      await key.press('Enter');
      await trigger.click();
      await expect(keys).toBeVisible();
    });
  }
}

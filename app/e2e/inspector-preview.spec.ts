import { test, expect } from '@playwright/test';
import { compileSetup, defaultSetup } from '../src/utils/designSetup';
import {
  CONFIG_LOCAL_STORAGE_KEY,
  MULTI_CONFIG_STORAGE_KEY,
} from '../src/context/constants';

const READY_TIMEOUT = 120000;

for (const width of [320, 390, 844]) {
  test(`Inspector preview retains draft, focus and scroll at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(READY_TIMEOUT);
    await page.setViewportSize({ width, height: width === 844 ? 500 : 900 });
    const source = compileSetup({
      ...defaultSetup(),
      columns: 3,
      rows: 4,
      diode: false,
    });
    await page.addInitScript(
      ({ key, source }) => {
        localStorage.setItem(key, JSON.stringify(source));
      },
      { key: CONFIG_LOCAL_STORAGE_KEY, source }
    );
    await page.goto('./');
    const key = page.locator('[data-object="fingers_c1_r1"]');
    await expect(key).toBeVisible({ timeout: READY_TIMEOUT });
    const inspector = page.getByRole('button', {
      name: 'Inspector',
      exact: true,
    });
    await expect(inspector).toHaveAttribute('aria-expanded', 'false');
    await inspector.click();
    await expect(
      page.getByRole('button', { name: 'Preview board', exact: true })
    ).toBeVisible();
    await expect(page.getByLabel('Current selection')).toHaveText(
      'Matrix fingers · 12 keys'
    );
    await page
      .getByRole('button', { name: 'Close inspector', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Project actions', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Design setup', exact: true })
      .click();
    const draftName = page.getByRole('textbox', {
      name: 'Design name',
      exact: true,
    });
    await draftName.fill('Unapplied board draft');
    const pane = page.getByRole('complementary', { name: 'Design inspector' });
    const properties = pane.locator('.studio-properties');
    await properties.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const scroll = await properties.evaluate((element) => element.scrollTop);
    expect(scroll).toBeGreaterThan(0);

    await page
      .getByRole('button', { name: 'Preview board', exact: true })
      .click();
    await expect(pane).toBeHidden();
    await expect(key).toBeVisible();
    const back = page.getByRole('button', {
      name: 'Return to Inspector',
      exact: true,
    });
    await expect(back).toBeFocused();
    // Peeking does not apply a staged setup edit.
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        MULTI_CONFIG_STORAGE_KEY
      )
    ).not.toContain('Unapplied board draft');
    await back.click();
    await expect(draftName).toHaveValue('Unapplied board draft');
    await expect(draftName).toBeFocused();
    expect(await properties.evaluate((element) => element.scrollTop)).toBe(
      scroll
    );
    await page.keyboard.press('Escape');
    await expect(inspector).toHaveAttribute('aria-expanded', 'false');
    await expect(inspector).toBeFocused();
  });
}

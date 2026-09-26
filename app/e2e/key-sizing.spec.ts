import { expect, test } from '@playwright/test';
import { chooseScope } from './selection';

test('key size sliders support wide and tall keys, rows and columns, undo and reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const key = page.getByRole('button', { name: /^SW1, MX switch/ });
  await key.click();
  await expect(page.getByRole('combobox', { name: 'Key Assembly', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Diode on selected key' })).toHaveCount(0);
  const width = page.getByRole('slider', { name: 'Key width' });
  await width.focus();
  await width.press('Home');
  await width.press('ArrowRight');
  await width.press('ArrowRight');
  await expect(key.locator('.wb-keycap-overlay > rect').first()).toHaveAttribute('width', '27.575000000000003');
  await page.getByRole('button', { name: 'Tall', exact: true }).click();
  await expect(key.locator('.wb-keycap-overlay > rect').first()).toHaveAttribute('height', '27.575000000000003');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(key.locator('.wb-keycap-overlay > rect').first()).toHaveAttribute('width', '27.575000000000003');
  await chooseScope(page, 'row');
  await width.focus();
  await width.press('End');
  await expect(page.locator('.wb-scene-part.is-selected .wb-keycap-overlay > rect:first-child')).toHaveCount(5);
  await expect(page.locator('.wb-scene-part.is-selected .wb-keycap-overlay > rect:first-child').first()).toHaveAttribute('width', '132.35');
  for (const cap of await page.locator('.wb-scene-part.is-selected .wb-keycap-overlay > rect:first-child').all()) {
    expect(Number(await cap.getAttribute('width'))).toBeCloseTo(132.35);
  }
  await chooseScope(page, 'column');
  const height = page.getByRole('slider', { name: 'Key height' });
  await height.focus();
  await height.press('Home');
  await height.press('ArrowRight');
  await expect(page.locator('.wb-scene-part.is-selected .wb-keycap-overlay > rect:first-child').first()).toHaveAttribute('height', '22.8125');
  for (const cap of await page.locator('.wb-scene-part.is-selected .wb-keycap-overlay > rect:first-child').all()) {
    expect(Number(await cap.getAttribute('height'))).toBeCloseTo(22.8125);
  }
  await expect(page.getByRole('button', { name: /^SW6, MX switch/ }).locator('.wb-keycap-overlay > rect').first()).toHaveAttribute('width', '18');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.screenshot({ path: '.impeccable/review/key-size-desktop.png', animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.impeccable/review/key-size-mobile.png', animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  await expect(page.getByRole('button', { name: /^SW1, MX switch/ }).locator('.wb-keycap-overlay > rect').first()).toHaveAttribute('height', '22.8125');
});

import { expect, test } from '@playwright/test';

test('shows live generated footprint geometry in the library workspace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Parts' }).click();
  await page.getByRole('listbox', { name: 'Footprint library' }).getByRole('option', { name: /RGB LED/ }).click();

  const workspace = page.getByRole('region', { name: 'Parts canvas' });
  const preview = workspace.getByRole('img', { name: 'Footprint preview' });
  await expect(preview).toBeVisible();
  await expect(workspace.locator('.wb-canvas')).toBeHidden();
  await expect(preview.locator('line')).toHaveCount(0);

  await page.getByRole('checkbox', { name: 'Reversible footprint' }).check();
  await page.getByRole('checkbox', { name: 'Include traces and vias' }).check();
  await expect(preview.locator('line')).toHaveCount(4);
  await expect(preview.locator('circle')).toHaveCount(4);

  await page.getByRole('checkbox', { name: 'Include traces and vias' }).uncheck();
  await expect(preview.locator('line')).toHaveCount(0);
});

test('updates MX solder geometry before applying generator settings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Parts' }).click();
  const preview = page.getByRole('region', { name: 'Parts canvas' }).getByRole('img', { name: 'Footprint preview' });
  const pad = preview.locator('rect').first();
  const initialWidth = await pad.getAttribute('width');

  await page.getByRole('spinbutton', { name: 'Pad size' }).fill('0');
  await expect(page.getByRole('alert')).toContainText('Pad size must be greater than zero');
  await expect(page.getByRole('button', { name: 'Apply generator settings' })).toBeDisabled();
  await expect(pad).toHaveAttribute('width', initialWidth!);

  await page.getByRole('spinbutton', { name: 'Pad size' }).fill('2.8');
  await expect(pad).toHaveAttribute('width', '2.8');
  await expect(pad).not.toHaveAttribute('width', initialWidth!);
  await page.getByRole('button', { name: 'Apply generator settings' }).click();
  await page.getByRole('tab', { name: 'Design' }).click();
  await page.getByRole('tab', { name: 'Parts' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Pad size' })).toHaveValue('2.8');
  await expect(preview.locator('rect').first()).toHaveAttribute('width', '2.8');
});

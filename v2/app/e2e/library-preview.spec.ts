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

test('standard parts use their footprint defaults without pad tuning', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Parts' }).click();
  const preview = page.getByRole('region', { name: 'Parts canvas' }).getByRole('img', { name: 'Footprint preview' });
  const pad = preview.locator('rect').first();
  const initialWidth = await pad.getAttribute('width');
  await expect(page.getByRole('spinbutton', { name: /Pad (size|spacing|drill)/ })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Custom component definition editor' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '+ New script' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Place component', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Design' }).click();
  await page.getByRole('tab', { name: 'Parts' }).click();
  await expect(preview.locator('rect').first()).toHaveAttribute('width', initialWidth!);
});

test('RGB assembly companion keeps its customized generated copper geometry', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Parts' }).click();
  const library = page.getByRole('listbox', { name: 'Footprint library' });
  await library.getByRole('option', { name: /RGB LED/ }).click();
  const preview = page.getByRole('region', { name: 'Parts canvas' }).getByRole('img', { name: 'Footprint preview' });
  await page.getByRole('checkbox', { name: 'Reversible footprint' }).check();
  await page.getByRole('checkbox', { name: 'Include traces and vias' }).check();
  await expect(preview.locator('line')).toHaveCount(4);
  await expect(preview.locator('circle.wb-preview-via')).toHaveCount(4);
  await page.getByRole('button', { name: 'Apply generator settings' }).click();

  await page.getByRole('listbox', { name: 'Key assemblies' }).getByRole('option', { name: 'MX RGB', exact: true }).click();
  await expect(preview.locator('line')).toHaveCount(4);
  await expect(preview.locator('circle.wb-preview-via')).toHaveCount(4);
});

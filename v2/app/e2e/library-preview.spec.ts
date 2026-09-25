import { expect, test } from '@playwright/test';

test('preview layers and part visibility change only the drawing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Parts' }).click();
  await page.getByRole('listbox', { name: 'Footprint library' }).getByRole('option', { name: /RGB LED/ }).click();

  const preview = page.getByRole('img', { name: 'Footprint preview' });
  const layers = page.getByRole('region', { name: 'Preview layers' });
  const revision = await page.locator('.wb-root').getAttribute('data-revision');
  const padCount = await preview.locator('.wb-preview-pad').count();
  expect(padCount).toBeGreaterThan(0);

  await layers.getByRole('button', { name: 'Hide Pad numbers' }).click();
  await expect(preview.locator('.wb-preview-pad-label')).toHaveCount(0);
  await layers.getByRole('button', { name: 'Show Pad numbers' }).click();
  await expect(preview.locator('.wb-preview-pad-label')).toHaveCount(padCount);

  await layers.getByRole('button', { name: /Hide part RGB LED/ }).click();
  await expect(preview.locator('.wb-preview-pad')).toHaveCount(0);
  await layers.getByRole('button', { name: /Show part RGB LED/ }).click();
  await expect(preview.locator('.wb-preview-pad')).toHaveCount(padCount);
  await expect(page.locator('.wb-root')).toHaveAttribute('data-revision', revision!);
});

test('named footprint graphics layers can be hidden independently', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Parts' }).click();
  await page.getByRole('listbox', { name: 'Footprint library' }).getByRole('option', { name: /switch choc v1 v2/ }).click();

  const layers = page.getByRole('region', { name: 'Preview layers' });
  const preview = page.getByRole('img', { name: 'Footprint preview' });
  const layer = await preview.locator('.wb-ergogen-drawing [data-layer]').first().getAttribute('data-layer');
  expect(layer).toBeTruthy();
  const graphics = preview.locator(`[data-layer="${layer}"]`);
  const before = await graphics.count();
  expect(before).toBeGreaterThan(0);
  const pads = preview.locator('.wb-preview-pad');
  const padCount = await pads.count();
  await layers.getByRole('button', { name: 'Hide B.Cu' }).click();
  await expect(pads).toHaveCount(0);
  await expect(graphics).toHaveCount(before);
  await layers.getByRole('button', { name: 'Show B.Cu' }).click();
  await expect(pads).toHaveCount(padCount);
  await layers.getByRole('button', { name: `Hide ${layer}` }).click();
  await expect(graphics).toHaveCount(0);
  await layers.getByRole('button', { name: `Show ${layer}` }).click();
  await expect(graphics).toHaveCount(before);
});

test('assembly companions can be hidden without hiding the switch', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Parts' }).click();
  await page.getByRole('button', { name: 'Objects', exact: true }).click();
  await page.getByRole('listbox', { name: 'Key assemblies' }).getByRole('option', { name: 'MX RGB', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();

  const preview = page.getByRole('img', { name: 'Footprint preview' });
  const layers = page.getByRole('region', { name: 'Preview layers' });
  const before = await preview.locator('.wb-preview-pad').count();
  await layers.getByRole('button', { name: 'Hide part RGB LED' }).click();
  const remaining = await preview.locator('.wb-preview-pad').count();
  expect(remaining).toBeGreaterThan(0);
  expect(remaining).toBeLessThan(before);
  await expect(layers.getByRole('button', { name: 'Show part RGB LED' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

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

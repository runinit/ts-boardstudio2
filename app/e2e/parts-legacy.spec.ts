import { expect, test } from '@playwright/test';
import { builtinDefinitions } from '@boardstudio/v2-kicad';
import { zipSync, strToU8 } from 'fflate';
import { demoProject } from '../src/demo';

test('a user-owned legacy LED remains editable with live reversible copper geometry', async ({ page }) => {
  const document = demoProject();
  document.definitions.push({ ...builtinDefinitions().find(item => item.id === 'rgb-led')!, id: 'custom-legacy-led', name: 'Saved RGB LED' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Project', exact: true }).click();
  await page.locator('.wb-project-file-input').setInputFiles({ name: 'legacy-led.boardstudio', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'project.json': strToU8(JSON.stringify(document)) })) });
  await page.getByRole('tab', { name: 'Parts', exact: true }).click();
  await page.getByRole('option', { name: 'Saved RGB LED', exact: true }).click();
  const preview = page.getByRole('img', { name: 'Footprint preview' });
  await page.getByRole('checkbox', { name: 'Reversible footprint', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Include traces and vias', exact: true }).check();
  await expect(preview.locator('.wb-preview-copper')).toHaveCount(4);
  await expect(preview.locator('.wb-preview-via')).toHaveCount(4);
  await page.getByRole('checkbox', { name: 'Include traces and vias', exact: true }).uncheck();
  await expect(preview.locator('.wb-preview-copper')).toHaveCount(0);
  await expect(preview.locator('.wb-preview-via')).toHaveCount(0);
});

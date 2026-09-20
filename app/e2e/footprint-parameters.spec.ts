import { readFileSync } from 'node:fs';
import JSZip from 'jszip';
import { test, expect } from '@playwright/test';
import { studio, openLibrary } from './utils/studio';
import BHK from '../src/examples/bhk';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';

const source =
  'module.exports={params:{side:"F",reversible:false,width:1,offset:[0,0]},body:p=>`(module "Settings" (layer ${p.side}.Cu) ${p.at} (pad 1 smd rect (at ${p.offset[0]} 0) (size ${p.width} 1) (layers ${p.side}.Cu)) ${p.reversible ? "(pad 2 smd rect (at 0 2) (size 1 1) (layers B.Cu))" : ""})`}';
test('regenerates footprint settings and reopens saved defaults', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1487, height: 1058 });
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: CONFIG_LOCAL_STORAGE_KEY, value: BHK.value }
  );
  await page.goto('./');
  await expect(studio(page)).toBeVisible();
  await openLibrary(page);
  const dialog = studio(page);
  await dialog.getByLabel('Import footprint files').setInputFiles({
    name: 'Settings.js',
    mimeType: 'text/javascript',
    buffer: Buffer.from(source),
  });
  await dialog
    .getByRole('button', { name: 'Prepare selected', exact: true })
    .click();
  await dialog
    .getByRole('button', { name: 'Review Settings.js', exact: true })
    .click();
  await expect(
    dialog.getByRole('group', { name: 'Footprint settings' })
  ).toBeVisible();
  await dialog
    .getByRole('combobox', { name: 'side', exact: true })
    .selectOption('B');
  await dialog
    .getByRole('checkbox', { name: 'reversible', exact: true })
    .check();
  await dialog
    .getByRole('spinbutton', { name: 'width', exact: true })
    .fill('3');
  await dialog
    .getByRole('spinbutton', { name: 'width', exact: true })
    .press('Tab');
  await dialog
    .getByRole('button', { name: 'Pads & nets', exact: true })
    .click();
  await expect(
    dialog.getByText('2 pads · duplicate numbers share a net.')
  ).toBeVisible();
  await expect(
    dialog.getByLabel('Footprint pads and geometry, back copper')
  ).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Save footprint', exact: true })
    .click();
  await expect(dialog.getByText(/Saved revision 1/)).toBeVisible();
  await dialog.getByText('Source & export', { exact: true }).click();
  const exporting = page.waitForEvent('download');
  await dialog
    .getByRole('button', { name: 'Export footprint ZIP', exact: true })
    .click();
  await (await exporting).saveAs('test-results/footprint-parameters.zip');
  const archive = await JSZip.loadAsync(
    readFileSync('test-results/footprint-parameters.zip')
  );
  const manifest = archive.file('footprint-library.json');
  if (!manifest) throw new Error('Missing footprint library snapshot');
  expect(JSON.parse(await manifest.async('string'))).toMatchObject({
    entries: [
      {
        parameters: { side: 'B', reversible: true, width: 3 },
        origin: { original: source },
      },
    ],
  });
  const usage = archive.file('usage.yaml');
  expect(await usage?.async('string')).toContain('width: 3');
  await page.screenshot({
    path: 'test-results/footprint-parameters-desktop.png',
  });
  await page.reload();
  await expect(studio(page)).toBeVisible();
  await openLibrary(page);
  await studio(page)
    .getByRole('button', { name: 'Settings Custom · revision 1', exact: true })
    .click();
  await expect(
    studio(page).getByRole('checkbox', { name: 'reversible', exact: true })
  ).toBeChecked();
  await expect(
    studio(page).getByRole('combobox', { name: 'side', exact: true })
  ).toHaveValue('B');
  await expect(
    studio(page).getByRole('spinbutton', { name: 'width', exact: true })
  ).toHaveValue('3');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'test-results/footprint-parameters-mobile.png',
  });
});

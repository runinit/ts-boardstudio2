import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { installProbe, settle, verifyComponentMove } from './utils/studioPerformance';
test('owned diode move persists through undo redo and reload', async ({ page }) => {
  test.setTimeout(120000);
  const output = resolve(process.env.PERF_OUTPUT!);
  await mkdir(output, { recursive: true });
  const source = await readFile(process.env.PERF_SOURCE!, 'utf8');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width:1440, height:1000 });
  await installProbe(page, source);
  await page.goto('./');
  await settle(page);
  await page.getByRole('button', {name:'Select Objects', exact:true}).click();
  await verifyComponentMove(page, output);
  expect(errors).toEqual([]);
});

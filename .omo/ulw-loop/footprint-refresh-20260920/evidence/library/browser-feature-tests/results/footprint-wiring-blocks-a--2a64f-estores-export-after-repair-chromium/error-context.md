# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footprint-wiring.spec.ts >> blocks a raw diode junction break and restores export after repair
- Location: e2e/footprint-wiring.spec.ts:8:5

# Error details

```
Error: Timeout 5000ms exceeded while waiting on the predicate
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { compileSetup, defaultSetup } from '../src/utils/designSetup';
  3  | import { setValue } from '../src/utils/studioSource';
  4  | import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
  5  | import { openCode, openExport, readSource } from './utils/studio';
  6  | 
  7  | const TIMEOUT = 60000;
  8  | test('blocks a raw diode junction break and restores export after repair', async ({
  9  |   page,
  10 | }, testInfo) => {
  11 |   test.setTimeout(120000);
  12 |   // This bounded fixture isolates electrical readiness from the setup's physical qualification reminder.
  13 |   const clean = setValue(
  14 |     compileSetup({
  15 |       ...defaultSetup(),
  16 |       columns: 1,
  17 |       rows: 1,
  18 |       controller: 'promicro',
  19 |     }),
  20 |     ['meta', 'studio', 'findings'],
  21 |     []
  22 |   );
  23 |   const broken = setValue(
  24 |     clean,
  25 |     [
  26 |       'layout',
  27 |       'objects',
  28 |       'fingers_c1_r1_diode',
  29 |       'footprints',
  30 |       'main',
  31 |       'params',
  32 |       'from',
  33 |     ],
  34 |     'RAW_BREAK'
  35 |   );
  36 |   await page.addInitScript(
  37 |     ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  38 |     {
  39 |       key: CONFIG_LOCAL_STORAGE_KEY,
  40 |       source: clean,
  41 |     }
  42 |   );
  43 |   await page.goto('./');
  44 |   await openExport(page);
  45 |   const download = page.getByRole('button', {
  46 |     name: 'Download PCB and outlines ZIP',
  47 |     exact: true,
  48 |   });
  49 |   await expect(download).toBeEnabled({ timeout: TIMEOUT });
  50 | 
  51 |   await openCode(page);
  52 |   const editor = page.getByRole('textbox', { name: 'Editor content' });
  53 |   await editor.focus();
  54 |   await editor.press('ControlOrMeta+KeyA');
  55 |   await page.keyboard.insertText(broken);
> 56 |   await expect.poll(() => readSource(page)).toBe(broken);
     |   ^ Error: Timeout 5000ms exceeded while waiting on the predicate
  57 |   await openExport(page);
  58 |   await expect(download).toBeDisabled();
  59 |   const status = page.getByRole('status', { name: 'Project status' });
  60 |   await expect(status).toContainText('Layout positions current', {
  61 |     timeout: TIMEOUT,
  62 |   });
  63 |   await expect(download).toBeDisabled();
  64 |   await status.getByRole('button', { name: /^Review \d+ blockers?$/ }).click();
  65 |   const findings = page.getByRole('region', { name: 'Project findings' });
  66 |   await expect(findings).toContainText('RAW_BREAK');
  67 |   await page.screenshot({
  68 |     path: testInfo.outputPath('raw-wiring-blocked.png'),
  69 |     fullPage: true,
  70 |   });
  71 |   await findings.getByRole('button', { name: 'Close findings' }).click();
  72 | 
  73 |   await openCode(page);
  74 |   await editor.focus();
  75 |   await editor.press('ControlOrMeta+KeyA');
  76 |   await page.keyboard.insertText(clean);
  77 |   await expect.poll(() => readSource(page)).toBe(clean);
  78 |   await openExport(page);
  79 |   await expect(download).toBeEnabled({ timeout: TIMEOUT });
  80 |   await expect(status).toContainText('Layout positions current');
  81 |   await page.screenshot({
  82 |     path: testInfo.outputPath('raw-wiring-repaired.png'),
  83 |     fullPage: true,
  84 |   });
  85 | });
  86 | 
```
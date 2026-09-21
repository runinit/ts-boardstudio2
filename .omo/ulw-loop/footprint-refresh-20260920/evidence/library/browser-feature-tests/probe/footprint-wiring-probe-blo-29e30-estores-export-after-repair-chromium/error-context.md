# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footprint-wiring-probe.spec.ts >> blocks a raw diode junction break and restores export after repair
- Location: e2e/footprint-wiring-probe.spec.ts:9:5

# Error details

```
Error: Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - alert
  - alert
```

# Test source

```ts
  1  | import { writeFileSync } from 'node:fs';
  2  | import { expect, test } from '@playwright/test';
  3  | import { compileSetup, defaultSetup } from '../src/utils/designSetup';
  4  | import { setValue } from '../src/utils/studioSource';
  5  | import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
  6  | import { openCode, openExport, readSource } from './utils/studio';
  7  | 
  8  | const TIMEOUT = 60000;
  9  | test('blocks a raw diode junction break and restores export after repair', async ({
  10 |   page,
  11 | }, testInfo) => {
  12 |   test.setTimeout(120000);
  13 |   const pageErrors: string[] = [];
  14 |   page.on('pageerror', error => pageErrors.push(error.message));
  15 |   // This bounded fixture isolates electrical readiness from the setup's physical qualification reminder.
  16 |   const clean = setValue(
  17 |     compileSetup({
  18 |       ...defaultSetup(),
  19 |       columns: 1,
  20 |       rows: 1,
  21 |       controller: 'promicro',
  22 |     }),
  23 |     ['meta', 'studio', 'findings'],
  24 |     []
  25 |   );
  26 |   const broken = setValue(
  27 |     clean,
  28 |     [
  29 |       'layout',
  30 |       'objects',
  31 |       'fingers_c1_r1_diode',
  32 |       'footprints',
  33 |       'main',
  34 |       'params',
  35 |       'from',
  36 |     ],
  37 |     'RAW_BREAK'
  38 |   );
  39 |   await page.addInitScript(
  40 |     ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  41 |     {
  42 |       key: CONFIG_LOCAL_STORAGE_KEY,
  43 |       source: clean,
  44 |     }
  45 |   );
  46 |   await page.goto('./');
  47 |   await openExport(page);
  48 |   const download = page.getByRole('button', {
  49 |     name: 'Download PCB and outlines ZIP',
  50 |     exact: true,
  51 |   });
  52 |   await expect(download).toBeEnabled({ timeout: TIMEOUT });
  53 | 
  54 |   await openCode(page);
  55 |   const editor = page.getByRole('textbox', { name: 'Editor content' });
  56 |   await editor.focus();
  57 |   await editor.press('ControlOrMeta+KeyA');
  58 |   await page.keyboard.insertText(broken);
> 59 |   try { await expect.poll(() => readSource(page)).toBe(broken); } catch (error) {
     |         ^ Error: Timeout 5000ms exceeded while waiting on the predicate
  60 |     const saved = await readSource(page);
  61 |     const models = await page.evaluate(() => (window as Window & { monaco: { editor: { getModels(): { getValue(): string }[] } } }).monaco.editor.getModels().map(model => model.getValue()));
  62 |     writeFileSync(testInfo.outputPath('source-state.json'), JSON.stringify({ expected: broken, saved, models, pageErrors }, null, 2));
  63 |     await page.screenshot({ path: testInfo.outputPath('source-state.png') });
  64 |     throw error;
  65 |   }
  66 |   await openExport(page);
  67 |   await expect(download).toBeDisabled();
  68 |   const status = page.getByRole('status', { name: 'Project status' });
  69 |   await expect(status).toContainText('Layout positions current', {
  70 |     timeout: TIMEOUT,
  71 |   });
  72 |   await expect(download).toBeDisabled();
  73 |   await status.getByRole('button', { name: /^Review \d+ blockers?$/ }).click();
  74 |   const findings = page.getByRole('region', { name: 'Project findings' });
  75 |   await expect(findings).toContainText('RAW_BREAK');
  76 |   await page.screenshot({
  77 |     path: testInfo.outputPath('raw-wiring-blocked.png'),
  78 |     fullPage: true,
  79 |   });
  80 |   await findings.getByRole('button', { name: 'Close findings' }).click();
  81 | 
  82 |   await openCode(page);
  83 |   await editor.focus();
  84 |   await editor.press('ControlOrMeta+KeyA');
  85 |   await page.keyboard.insertText(clean);
  86 |   await expect.poll(() => readSource(page)).toBe(clean);
  87 |   await openExport(page);
  88 |   await expect(download).toBeEnabled({ timeout: TIMEOUT });
  89 |   await expect(status).toContainText('Layout positions current');
  90 |   await page.screenshot({
  91 |     path: testInfo.outputPath('raw-wiring-repaired.png'),
  92 |     fullPage: true,
  93 |   });
  94 | });
  95 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-performance.spec.ts >> measures real keyboard editing response and source correctness
- Location: e2e/studio-performance.spec.ts:24:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('button', { name: /^Select fingers_c\d+_r\d+$/ })
Expected: 60
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByRole('button', { name: /^Select fingers_c\d+_r\d+$/ })
    9 × locator resolved to 0 elements
      - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - link "Go to home page" [ref=e8] [cursor=pointer]:
          - /url: /boardstudio/
          - img "Board Studio logo" [ref=e9]
        - generic [ref=e10] [cursor=pointer]: Board Studio
      - button "Close navigation panel" [ref=e11] [cursor=pointer]:
        - img [ref=e12]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - button "New" [ref=e17] [cursor=pointer]:
          - img [ref=e18]
          - generic [ref=e19]: New
        - button "Import" [ref=e20] [cursor=pointer]:
          - img [ref=e21]
          - generic [ref=e25]: Import
        - button "Download All" [ref=e26] [cursor=pointer]:
          - img [ref=e27]
          - generic [ref=e30]: Download All
      - generic [ref=e31]:
        - img
        - textbox "Search configurations" [ref=e32]:
          - /placeholder: Search configurations...
      - generic [ref=e33]:
        - generic [ref=e34]: Saved Configurations
        - generic [ref=e35]: "1"
      - generic [ref=e37]:
        - button "Legacy Config" [ref=e38] [cursor=pointer]:
          - img [ref=e39]
          - generic [ref=e42]: Legacy Config
        - generic [ref=e43]:
          - button "Rename configuration Legacy Config" [ref=e44] [cursor=pointer]:
            - img [ref=e45]
          - button "Duplicate configuration Legacy Config" [ref=e48] [cursor=pointer]:
            - img [ref=e49]
          - button "Delete configuration Legacy Config" [ref=e52] [cursor=pointer]:
            - img [ref=e53]
    - generic [ref=e57]:
      - button "Open documentation" [ref=e58] [cursor=pointer]:
        - img [ref=e59]
        - generic [ref=e62]: Docs
      - button "Join the Discord community" [ref=e63] [cursor=pointer]:
        - img [ref=e64]
      - button "View Ergogen Web UI 0.20.0 on GitHub" [ref=e66] [cursor=pointer]:
        - img [ref=e67]
        - generic [ref=e69]:
          - generic [ref=e70]: Web UI
          - generic [ref=e71]: 0.20.0
      - button "View Ergogen 6.0.0-develop on GitHub" [ref=e72] [cursor=pointer]:
        - img [ref=e73]
        - generic [ref=e75]:
          - generic [ref=e76]: Ergogen
          - generic [ref=e77]: 6.0.0-develop
  - region "Board Studio" [ref=e79]:
    - generic [ref=e80]:
      - button "Projects" [ref=e81] [cursor=pointer]:
        - img [ref=e82]
      - heading "Board Studio / Legacy Config" [level=1] [ref=e84]
      - generic [ref=e85]: Autosaved
      - button "Generate project" [ref=e86] [cursor=pointer]:
        - img [ref=e87]
        - generic [ref=e90]: Generate 3D
      - generic [ref=e92]:
        - button "Code" [ref=e93] [cursor=pointer]:
          - img [ref=e94]
          - text: Code
        - button "Design setup" [ref=e98] [cursor=pointer]
        - button "Install app" [ref=e99] [cursor=pointer]:
          - img [ref=e100]
          - text: Install App
        - button "Settings" [ref=e103] [cursor=pointer]:
          - img [ref=e104]
    - navigation "Design workflow" [ref=e107]:
      - button "Design" [ref=e108] [cursor=pointer]:
        - img [ref=e109]
        - text: Design
      - button "PCB" [ref=e114] [cursor=pointer]:
        - img [ref=e115]
        - text: PCB
      - button "Case" [ref=e118] [cursor=pointer]:
        - img [ref=e119]
        - text: Case
      - button "Export" [ref=e122] [cursor=pointer]:
        - img [ref=e123]
        - text: Export
      - generic [ref=e126]:
        - button "Undo project edit" [disabled] [ref=e127]:
          - img [ref=e128]
        - button "Redo project edit" [disabled] [ref=e131]:
          - img [ref=e132]
        - button "Inspector" [ref=e135] [cursor=pointer]:
          - img [ref=e136]
          - text: Inspector
        - button "Part library" [ref=e137] [cursor=pointer]:
          - img [ref=e138]
          - text: Part library
    - main [ref=e144]:
      - generic [ref=e145]:
        - heading "Build your layout" [level=2] [ref=e146]
        - paragraph [ref=e147]: Place keys and hardware using the design’s spacing.
        - generic [ref=e148]:
          - button "Add matrix" [ref=e149] [cursor=pointer]
          - button "Add column" [ref=e150] [cursor=pointer]
          - button "Add key" [ref=e151] [cursor=pointer]
          - button "Add component" [ref=e152] [cursor=pointer]
      - generic "Outline controls" [ref=e153]:
        - generic [ref=e154]:
          - checkbox "Automatic outline" [checked] [ref=e155]
          - text: Automatic outline
      - generic [ref=e156]:
        - toolbar "Canvas tools" [ref=e157]:
          - generic [ref=e158]:
            - button "Select Objects" [pressed] [ref=e159] [cursor=pointer]:
              - img [ref=e160]
            - button "Select Columns" [ref=e162] [cursor=pointer]:
              - img [ref=e163]
            - button "Select Rows" [ref=e165] [cursor=pointer]:
              - img [ref=e166]
            - button "Select Matrices" [ref=e168] [cursor=pointer]:
              - img [ref=e169]
            - button "Pan" [ref=e171] [cursor=pointer]:
              - img [ref=e172]
          - toolbar "Snapping" [ref=e177]:
            - button "Snapping" [pressed] [ref=e178] [cursor=pointer]:
              - img [ref=e179]
            - button "Snapping settings" [ref=e183] [cursor=pointer]:
              - img [ref=e184]
            - region [ref=e186]:
              - generic [ref=e187]:
                - strong [ref=e188]: Snapping
                - button [ref=e189] [cursor=pointer]:
                  - img [ref=e190]
              - group [ref=e193]:
                - button [ref=e194] [cursor=pointer]: 1u
                - button [ref=e195] [cursor=pointer]: ½u
                - button [pressed] [ref=e196] [cursor=pointer]: ¼u
                - button [ref=e197] [cursor=pointer]: ⅛u
              - generic [ref=e198]:
                - generic [ref=e199]:
                  - checkbox [checked] [ref=e200]
                  - text: Grid
                - generic [ref=e201]:
                  - checkbox [checked] [ref=e202]
                  - text: Centers
                - generic [ref=e203]:
                  - checkbox [ref=e204]
                  - text: Origins
                - generic [ref=e205]:
                  - checkbox [checked] [ref=e206]
                  - text: Edges
              - generic [ref=e207]:
                - text: Increment · mm
                - spinbutton [ref=e208]
              - generic [ref=e209]:
                - text: Edge gap · mm
                - spinbutton [ref=e210]: "2"
              - group [ref=e211]:
                - generic [ref=e212] [cursor=pointer]: Alt bypasses snapping · Help
        - toolbar "View controls" [ref=e213]:
          - button "Side" [ref=e214] [cursor=pointer]
          - button "Fit layout" [ref=e215] [cursor=pointer]:
            - img [ref=e216]
          - button "Zoom out" [ref=e221] [cursor=pointer]:
            - img [ref=e222]
          - generic [ref=e223]: 100%
          - button "Zoom in" [ref=e224] [cursor=pointer]:
            - img [ref=e225]
        - group "Interactive board layout" [ref=e226]
    - status "Project status" [ref=e228]:
      - generic [ref=e229]: Layout positions current · 0 keys
      - button "View findings" [ref=e230] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { mkdir, readFile, writeFile } from 'node:fs/promises';
  3   | import { resolve } from 'node:path';
  4   | import { parse } from 'yaml';
  5   | import {
  6   |   installProbe,
  7   |   createMeasurement,
  8   |   settle,
  9   |   measurePreparation,
  10  |   measureFrozenRebuild,
  11  |   performanceFixture,
  12  |   verifyComponentMove,
  13  | } from './utils/studioPerformance';
  14  | import { openInspector, readSource } from './utils/studio';
  15  | const output = resolve(process.env.PERF_OUTPUT || 'test-results/performance');
  16  | const rows = Number(process.env.PERF_NATIVE_ROWS || 6);
  17  | const columns = Number(process.env.PERF_COLUMNS || 10);
  18  | const total = rows * columns;
  19  | const lastKey = `Select fingers_c${columns}_r1`;
  20  | const key = (page: Page) =>
  21  |   page.getByRole('button', { name: lastKey, exact: true });
  22  | const keys = (page: Page) =>
  23  |   page.getByRole('button', { name: /^Select fingers_c\d+_r\d+$/ });
  24  | test('measures real keyboard editing response and source correctness', async ({
  25  |   page,
  26  | }) => {
  27  |   const initial = process.env.PERF_SOURCE
  28  |     ? await readFile(process.env.PERF_SOURCE, 'utf8')
  29  |     : performanceFixture(columns, rows);
  30  |   test.setTimeout(600000);
  31  |   page.setDefaultTimeout(15000);
  32  |   await mkdir(output, { recursive: true });
  33  |   await writeFile(resolve(output, 'initial-source.yaml'), initial);
  34  |   const errors: string[] = [];
  35  |   const results: unknown[] = [];
  36  |   page.on('pageerror', (error) => errors.push(error.message));
  37  |   page.on('console', (message) => {
  38  |     if (message.type() === 'error') errors.push(message.text());
  39  |   });
  40  |   await page.setViewportSize({ width: 1440, height: 1000 });
  41  |   await installProbe(page, initial);
  42  |   try {
  43  |     await page.goto('./');
> 44  |     await expect(keys(page)).toHaveCount(total);
      |                              ^ Error: expect(locator).toHaveCount(expected) failed
  45  |     await settle(page);
  46  |     await page
  47  |       .getByRole('button', { name: 'Select Objects', exact: true })
  48  |       .click();
  49  |     await key(page).click();
  50  |     await page
  51  |       .getByRole('button', { name: 'Snapping settings', exact: true })
  52  |       .click();
  53  |     await page.getByLabel('Custom snap increment').fill('1');
  54  |     await page
  55  |       .getByRole('button', { name: 'Snapping settings', exact: true })
  56  |       .click();
  57  |     await page.screenshot({ path: resolve(output, 'before.png') });
  58  |     const measure = createMeasurement(page, output, results, errors);
  59  |     for (
  60  |       let repeat = 0;
  61  |       repeat < Number(process.env.PERF_REPEATS || 1);
  62  |       repeat++
  63  |     ) {
  64  |       await measure(
  65  |         `nudge-${repeat}`,
  66  |         'keydown',
  67  |         () => key(page).press('ArrowRight'),
  68  |         async () => {
  69  |           await expect
  70  |             .poll(
  71  |               async () =>
  72  |                 parse(await readSource(page)).layout.objects[
  73  |                   `fingers_c${columns}_r1`
  74  |                 ].placement.override.at
  75  |             )
  76  |             .toEqual([repeat + 1, 0, 0]);
  77  |         }
  78  |       );
  79  |     }
  80  |     await measureFrozenRebuild(page, output, results);
  81  |     if (process.env.PERF_REBUILD_ONLY === '1') {
  82  |       expect(errors).toEqual([]);
  83  |       return;
  84  |     }
  85  |     for (
  86  |       let repeat = 0;
  87  |       repeat < Number(process.env.PERF_REPEATS || 1);
  88  |       repeat++
  89  |     ) {
  90  |       const before = parse(await readSource(page)).layout.objects[
  91  |         `fingers_c${columns}_r1`
  92  |       ].placement.override.at;
  93  |       const box = await key(page).boundingBox();
  94  |       if (!box) throw new Error('Selected key has no rendered bounds');
  95  |       await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  96  |       await page.mouse.down();
  97  |       await measure(
  98  |         `drag-${repeat}`,
  99  |         'pointermove',
  100 |         async () => {
  101 |           await page.mouse.move(
  102 |             box.x + box.width / 2 + 12,
  103 |             box.y + box.height / 2,
  104 |             { steps: 3 }
  105 |           );
  106 |           await page.mouse.up();
  107 |         },
  108 |         async () => {
  109 |           await expect
  110 |             .poll(
  111 |               async () =>
  112 |                 parse(await readSource(page)).layout.objects[
  113 |                   `fingers_c${columns}_r1`
  114 |                 ].placement.override.at[0]
  115 |             )
  116 |             .toBeGreaterThan(before[0]);
  117 |         }
  118 |       );
  119 |     }
  120 |     await openInspector(page);
  121 |     await page
  122 |       .getByRole('button', { name: `fingers ${total} keys`, exact: true })
  123 |       .click();
  124 |     for (const dimension of ['columns', 'rows']) {
  125 |       const field = page.getByLabel(`Matrix ${dimension}`, { exact: true });
  126 |       const base = dimension === 'columns' ? columns : rows;
  127 |       for (
  128 |         let repeat = 0;
  129 |         repeat < Number(process.env.PERF_REPEATS || 1);
  130 |         repeat++
  131 |       ) {
  132 |         for (const delta of [1, 0]) {
  133 |           await field.fill(String(base + delta));
  134 |           const count =
  135 |             dimension === 'columns'
  136 |               ? (base + delta) * rows
  137 |               : (base + delta) * columns;
  138 |           if (!delta)
  139 |             await measurePreparation(
  140 |               page,
  141 |               field,
  142 |               results,
  143 |               `remove-${dimension}-${repeat}`
  144 |             );
```
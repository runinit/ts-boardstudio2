# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bhk-matrix.spec.ts >> edits BHK rows and columns at 390px
- Location: e2e/bhk-matrix.spec.ts:9:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.fill: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByLabel('Relative x', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - link "Go to home page" [ref=e7] [cursor=pointer]:
          - /url: /boardstudio/
          - img "Board Studio logo" [ref=e8]
        - generic [ref=e9] [cursor=pointer]: Board Studio
      - button "Close navigation panel" [ref=e10] [cursor=pointer]:
        - img [ref=e11]
    - generic [ref=e14]:
      - generic [ref=e15]:
        - button "New" [ref=e16] [cursor=pointer]:
          - img [ref=e17]
          - generic [ref=e18]: New
        - button "Import" [ref=e19] [cursor=pointer]:
          - img [ref=e20]
          - generic [ref=e24]: Import
        - button "Download All" [ref=e25] [cursor=pointer]:
          - img [ref=e26]
          - generic [ref=e29]: Download All
      - generic [ref=e30]:
        - img
        - textbox "Search configurations" [ref=e31]:
          - /placeholder: Search configurations...
      - generic [ref=e32]:
        - generic [ref=e33]: Saved Configurations
        - generic [ref=e34]: "1"
      - generic [ref=e36]:
        - button "BHK" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e41]: BHK
        - generic [ref=e42]:
          - button "Rename configuration BHK" [ref=e43] [cursor=pointer]:
            - img [ref=e44]
          - button "Duplicate configuration BHK" [ref=e47] [cursor=pointer]:
            - img [ref=e48]
          - button "Delete configuration BHK" [ref=e51] [cursor=pointer]:
            - img [ref=e52]
    - generic [ref=e56]:
      - button "Open documentation" [ref=e57] [cursor=pointer]:
        - img [ref=e58]
        - generic [ref=e61]: Docs
      - button "Join the Discord community" [ref=e62] [cursor=pointer]:
        - img [ref=e63]
      - button "View Ergogen Web UI 0.20.0 on GitHub" [ref=e65] [cursor=pointer]:
        - img [ref=e66]
        - generic [ref=e68]:
          - generic [ref=e69]: Web UI
          - generic [ref=e70]: 0.20.0
      - button "View Ergogen 6.0.0-develop on GitHub" [ref=e71] [cursor=pointer]:
        - img [ref=e72]
        - generic [ref=e74]:
          - generic [ref=e75]: Ergogen
          - generic [ref=e76]: 6.0.0-develop
  - region "Board Studio" [ref=e78]:
    - generic [ref=e79]:
      - button "Projects" [ref=e80] [cursor=pointer]:
        - img [ref=e81]
      - heading "BHK" [level=1] [ref=e83]
      - button "Generate project" [ref=e84] [cursor=pointer]:
        - img [ref=e85]
        - generic [ref=e88]: Generate 3D
      - button "Project actions" [ref=e90] [cursor=pointer]:
        - img [ref=e91]
    - navigation "Design workflow" [ref=e95]:
      - button "Design" [ref=e96] [cursor=pointer]
      - button "PCB" [ref=e97] [cursor=pointer]
      - button "Case" [ref=e98] [cursor=pointer]
      - button "Export" [ref=e99] [cursor=pointer]
      - generic [ref=e100]:
        - button "Undo project edit" [disabled] [ref=e101]:
          - img [ref=e102]
        - button "Redo project edit" [disabled] [ref=e105]:
          - img [ref=e106]
        - button "Inspector" [expanded] [ref=e109] [cursor=pointer]:
          - img [ref=e110]
          - text: Inspector
        - button "Part library" [ref=e111] [cursor=pointer]:
          - img [ref=e112]
          - text: Part library
    - generic [ref=e117]:
      - complementary "Design inspector" [ref=e118]:
        - generic [ref=e119]:
          - generic [ref=e120]:
            - paragraph [ref=e121]: Row r4 · matrix · 6 keys
            - button "Preview board" [ref=e122] [cursor=pointer]:
              - img [ref=e123]
              - text: Preview board
            - button "Close inspector" [ref=e126] [cursor=pointer]:
              - img [ref=e127]
          - group "Inspector view" [ref=e130]:
            - button "Browse objects" [ref=e131] [cursor=pointer]
            - button "Edit properties" [pressed] [ref=e132] [cursor=pointer]
        - group [ref=e134]:
          - generic "Selection" [ref=e135] [cursor=pointer]
          - heading "Row 2" [level=2] [ref=e136]
          - paragraph [ref=e137]: matrix · r4. Changes affect every key in this row.
          - group [ref=e138]:
            - generic "Row keys" [active] [ref=e139] [cursor=pointer]
            - list "Row keys" [ref=e140]:
              - listitem [ref=e141]:
                - button "Column 1 matrix_c1_r4" [ref=e142] [cursor=pointer]:
                  - generic [ref=e143]: Column 1
                  - generic [ref=e144]: matrix_c1_r4
                - button "Remove matrix_c1_r4" [ref=e145] [cursor=pointer]:
                  - img [ref=e146]
              - listitem [ref=e149]:
                - button "Column 2 matrix_c2_r4" [ref=e150] [cursor=pointer]:
                  - generic [ref=e151]: Column 2
                  - generic [ref=e152]: matrix_c2_r4
                - button "Remove matrix_c2_r4" [ref=e153] [cursor=pointer]:
                  - img [ref=e154]
              - listitem [ref=e157]:
                - button "Column 3 matrix_c3_r4" [ref=e158] [cursor=pointer]:
                  - generic [ref=e159]: Column 3
                  - generic [ref=e160]: matrix_c3_r4
                - button "Remove matrix_c3_r4" [ref=e161] [cursor=pointer]:
                  - img [ref=e162]
              - listitem [ref=e165]:
                - button "Column 4 matrix_c4_r4" [ref=e166] [cursor=pointer]:
                  - generic [ref=e167]: Column 4
                  - generic [ref=e168]: matrix_c4_r4
                - button "Remove matrix_c4_r4" [ref=e169] [cursor=pointer]:
                  - img [ref=e170]
              - listitem [ref=e173]:
                - button "Column 5 matrix_c5_r4" [ref=e174] [cursor=pointer]:
                  - generic [ref=e175]: Column 5
                  - generic [ref=e176]: matrix_c5_r4
                - button "Remove matrix_c5_r4" [ref=e177] [cursor=pointer]:
                  - img [ref=e178]
              - listitem [ref=e181]:
                - button "Column 6 matrix_c6_r4" [ref=e182] [cursor=pointer]:
                  - generic [ref=e183]: Column 6
                  - generic [ref=e184]: matrix_c6_r4
                - button "Remove matrix_c6_r4" [ref=e185] [cursor=pointer]:
                  - img [ref=e186]
              - listitem [ref=e189]:
                - button "Add key in column 7" [ref=e190] [cursor=pointer]
          - group [ref=e191]:
            - generic "Matrix actions" [ref=e192] [cursor=pointer]
      - main [ref=e193]:
        - generic "Outline controls" [ref=e194]:
          - generic [ref=e195]:
            - checkbox "Automatic outline" [checked] [ref=e196]
            - text: Automatic outline
        - generic [ref=e197]:
          - toolbar "Canvas tools" [ref=e198]:
            - generic [ref=e199]:
              - button "Select Objects" [ref=e200] [cursor=pointer]:
                - img [ref=e201]
              - button "Select Columns" [ref=e203] [cursor=pointer]:
                - img [ref=e204]
              - button "Select Rows" [pressed] [ref=e206] [cursor=pointer]:
                - img [ref=e207]
              - button "Select Matrices" [ref=e209] [cursor=pointer]:
                - img [ref=e210]
              - button "Pan" [ref=e212] [cursor=pointer]:
                - img [ref=e213]
            - toolbar "Snapping" [ref=e218]:
              - button "Snapping" [pressed] [ref=e219] [cursor=pointer]:
                - img [ref=e220]
              - button "Snapping settings" [ref=e224] [cursor=pointer]:
                - img [ref=e225]
              - region [ref=e227]:
                - generic [ref=e228]:
                  - strong [ref=e229]: Snapping
                  - button [ref=e230] [cursor=pointer]:
                    - img [ref=e231]
                - group [ref=e234]:
                  - button [ref=e235] [cursor=pointer]: 1u
                  - button [ref=e236] [cursor=pointer]: ½u
                  - button [pressed] [ref=e237] [cursor=pointer]: ¼u
                  - button [ref=e238] [cursor=pointer]: ⅛u
                - generic [ref=e239]:
                  - generic [ref=e240]:
                    - checkbox [checked] [ref=e241]
                    - text: Grid
                  - generic [ref=e242]:
                    - checkbox [checked] [ref=e243]
                    - text: Centers
                  - generic [ref=e244]:
                    - checkbox [ref=e245]
                    - text: Origins
                  - generic [ref=e246]:
                    - checkbox [checked] [ref=e247]
                    - text: Edges
                - generic [ref=e248]:
                  - text: Increment · mm
                  - spinbutton [ref=e249]
                - generic [ref=e250]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e251]: "2"
                - group [ref=e252]:
                  - generic [ref=e253] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e254] [cursor=pointer]:
              - img [ref=e255]
          - toolbar "View controls" [ref=e258]:
            - button "Side" [ref=e259] [cursor=pointer]
            - button "Fit layout" [ref=e260] [cursor=pointer]:
              - img [ref=e261]
            - button "Zoom out" [ref=e266] [cursor=pointer]:
              - img [ref=e267]
            - generic [ref=e268]: 100%
            - button "Zoom in" [ref=e269] [cursor=pointer]:
              - img [ref=e270]
          - group "Interactive board layout" [ref=e271]:
            - button "Select matrix_c5_r4" [pressed] [ref=e273]
            - button "Select matrix_c1_r4" [pressed] [ref=e276]
            - button "Select matrix_c1_r3" [ref=e279]
            - button "Select matrix_c1_r2" [ref=e281]
            - button "Select matrix_c1_r1" [ref=e283]
            - button "Select matrix_c2_r4" [pressed] [ref=e285]
            - button "Select matrix_c2_r3" [ref=e288]
            - button "Select matrix_c2_r2" [ref=e290]
            - button "Select matrix_c2_r1" [ref=e292]
            - button "Select matrix_c3_r5" [ref=e294]
            - button "Select matrix_c3_r4" [pressed] [ref=e296]
            - button "Select matrix_c3_r3" [ref=e299]
            - button "Select matrix_c3_r2" [ref=e301]
            - button "Select matrix_c3_r1" [ref=e303]
            - button "Select matrix_c4_r5" [ref=e305]
            - button "Select matrix_c4_r4" [pressed] [ref=e307]
            - button "Select matrix_c4_r3" [ref=e310]
            - button "Select matrix_c4_r2" [ref=e312]
            - button "Select matrix_c4_r1" [ref=e314]
            - button "Select matrix_c5_r3" [ref=e316]
            - button "Select matrix_c5_r2" [ref=e318]
            - button "Select matrix_c5_r1" [ref=e320]
            - button "Select matrix_c6_r4" [pressed] [ref=e322]
            - button "Select matrix_c6_r3" [ref=e325]
            - button "Select matrix_c6_r2" [ref=e327]
            - button "Select matrix_c6_r1" [ref=e329]
            - button "Select matrix_c7_r2" [ref=e331]
            - button "Select matrix_c7_r1" [ref=e333]
            - button "Select thumbfan_c1_r2" [ref=e335]
            - button "Select thumbfan_c2_r2" [ref=e337]
            - button "Select thumbfan_c2_r1" [ref=e339]
            - button "Select thumbfan_c3_r2" [ref=e341]
            - button "Select thumbfan_c3_r1" [ref=e343]
            - button "Select mcu" [ref=e345]
            - button "Select display" [ref=e347]
            - button "Select scrollwheel" [ref=e349]
            - button "Select board_zone_gnd"
            - button "Select power_switch" [ref=e351]
            - button "Select reset_button" [ref=e353]
    - status "Project status" [ref=e355]:
      - generic [ref=e356]: Layout positions current · 33 keys
      - button "Review 5 findings" [ref=e357] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { parse } from 'yaml';
  3   | import { studio, readSource } from './utils/studio';
  4   |
  5   | for (const viewport of [
  6   |   { width: 1440, height: 900 },
  7   |   { width: 390, height: 844 },
  8   | ]) {
  9   |   test(`edits BHK rows and columns at ${viewport.width}px`, async ({
  10  |     page,
  11  |   }) => {
  12  |     test.setTimeout(90000);
  13  |     await page.setViewportSize(viewport);
  14  |     await page.goto('./import');
  15  |     await page.getByLabel('Load BHK example', { exact: true }).click();
  16  |     await expect(studio(page)).toBeVisible();
  17  |     await expect(
  18  |       page.getByRole('button', { name: 'Select matrix_c4_r4', exact: true })
  19  |     ).toBeVisible();
  20  |     const before = parse(await readSource(page));
  21  |     await page
  22  |       .getByRole('button', { name: 'Select Rows', exact: true })
  23  |       .click();
  24  |     await page
  25  |       .getByRole('button', { name: 'Select matrix_c4_r4', exact: true })
  26  |       .click();
  27  |     if (
  28  |       await page.getByRole('button', { name: 'Inspector', exact: true }).count()
  29  |     ) {
  30  |       await page
  31  |         .getByRole('button', { name: 'Inspector', exact: true })
  32  |         .click();
  33  |     }
  34  |     await expect(
  35  |       page.getByRole('heading', { name: 'Row 2', exact: true })
  36  |     ).toBeVisible();
  37  |     const inspector = page.getByRole('complementary', {
  38  |       name: 'Design inspector',
  39  |     });
  40  |     const rowKeysSummary = inspector
  41  |       .locator('summary')
  42  |       .filter({ hasText: /^Row keys$/ });
  43  |     const rowKeys = rowKeysSummary.locator('..');
  44  |     await rowKeysSummary.click();
  45  |     await expect(rowKeys).toHaveJSProperty('open', true);
  46  |     const addKey = rowKeys.getByRole('button', {
  47  |       name: 'Add key in column 7',
  48  |       exact: true,
  49  |     });
  50  |     await expect(addKey).toBeVisible();
  51  |     await expect(addKey).toBeEnabled();
> 52  |     await page.getByLabel('Relative x', { exact: true }).fill('1');
      |                                                          ^ Error: locator.fill: Test timeout of 90000ms exceeded.
  53  |     await page
  54  |       .getByRole('button', { name: 'Apply relative adjustment' })
  55  |       .click();
  56  |     await expect
  57  |       .poll(
  58  |         async () =>
  59  |           parse(await readSource(page)).layout.objects.matrix_c1_r4.placement
  60  |             ?.override?.at?.[0]
  61  |       )
  62  |       .toBe(1);
  63  |     const after = parse(await readSource(page));
  64  |     for (const [id, item] of Object.entries(before.layout.objects)) {
  65  |       expect(after.layout.objects[id].properties).toEqual(
  66  |         (item as { properties?: unknown }).properties
  67  |       );
  68  |     }
  69  |     expect(after.layout.objects.matrix_c7_r4).toBeUndefined();
  70  |     expect(after.layout.objects.matrix_c1_r3.placement).toBeUndefined();
  71  |     await addKey.click();
  72  |     await expect
  73  |       .poll(
  74  |         async () =>
  75  |           parse(await readSource(page)).layout.objects.matrix_c7_r4?.cell
  76  |       )
  77  |       .toEqual(['c7', 'r4']);
  78  |     const filled = parse(await readSource(page)).layout.objects.matrix_c7_r4;
  79  |     expect(filled.properties).toMatchObject({
  80  |       column_net: 'c7',
  81  |       row_net: 'r4',
  82  |     });
  83  |     expect(filled.pcb).toBe('bhk_pcb');
  84  |     await page
  85  |       .getByRole('button', { name: 'Undo project edit', exact: true })
  86  |       .click();
  87  |     await expect
  88  |       .poll(
  89  |         async () => parse(await readSource(page)).layout.objects.matrix_c7_r4
  90  |       )
  91  |       .toBeUndefined();
  92  |     await page
  93  |       .getByRole('button', { name: 'Undo project edit', exact: true })
  94  |       .click();
  95  |     await expect
  96  |       .poll(async () => parse(await readSource(page)).layout.objects)
  97  |       .toEqual(before.layout.objects);
  98  |     if (
  99  |       await page
  100 |         .getByRole('button', { name: 'Close inspector', exact: true })
  101 |         .count()
  102 |     ) {
  103 |       await page
  104 |         .getByRole('button', { name: 'Close inspector', exact: true })
  105 |         .click();
  106 |     }
  107 |     await page
  108 |       .getByRole('button', { name: 'Select Columns', exact: true })
  109 |       .click();
  110 |     await page
  111 |       .getByRole('button', { name: 'Select matrix_c3_r4', exact: true })
  112 |       .click();
  113 |     if (
  114 |       await page.getByRole('button', { name: 'Inspector', exact: true }).count()
  115 |     ) {
  116 |       await page
  117 |         .getByRole('button', { name: 'Inspector', exact: true })
  118 |         .click();
  119 |     }
  120 |     await expect(
  121 |       page.getByLabel('Column stagger', { exact: true })
  122 |     ).toHaveValue('ky / 4');
  123 |     await page.screenshot({
  124 |       path: test.info().outputPath(`bhk-matrix-${viewport.width}.png`),
  125 |     });
  126 |     expect(
  127 |       await page.evaluate(
  128 |         () => document.documentElement.scrollWidth <= innerWidth
  129 |       )
  130 |     ).toBe(true);
  131 |   });
  132 | }
  133 |
```
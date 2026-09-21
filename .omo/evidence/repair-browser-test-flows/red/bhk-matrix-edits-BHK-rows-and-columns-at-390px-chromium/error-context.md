# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bhk-matrix.spec.ts >> edits BHK rows and columns at 390px
- Location: e2e/bhk-matrix.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Add key in column 7' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Add key in column 7' })

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
            - button "Close inspector" [active] [ref=e126] [cursor=pointer]:
              - img [ref=e127]
          - group "Inspector view" [ref=e130]:
            - button "Browse objects" [ref=e131] [cursor=pointer]
            - button "Edit properties" [pressed] [ref=e132] [cursor=pointer]
        - group [ref=e134]:
          - generic "Selection" [ref=e135] [cursor=pointer]
          - heading "Row 2" [level=2] [ref=e136]
          - paragraph [ref=e137]: matrix · r4. Changes affect every key in this row.
          - group [ref=e138]:
            - generic "Row keys" [ref=e139] [cursor=pointer]
          - group [ref=e140]:
            - generic "Matrix actions" [ref=e141] [cursor=pointer]
      - main [ref=e142]:
        - generic "Outline controls" [ref=e143]:
          - generic [ref=e144]:
            - checkbox "Automatic outline" [checked] [ref=e145]
            - text: Automatic outline
        - generic [ref=e146]:
          - toolbar "Canvas tools" [ref=e147]:
            - generic [ref=e148]:
              - button "Select Objects" [ref=e149] [cursor=pointer]:
                - img [ref=e150]
              - button "Select Columns" [ref=e152] [cursor=pointer]:
                - img [ref=e153]
              - button "Select Rows" [pressed] [ref=e155] [cursor=pointer]:
                - img [ref=e156]
              - button "Select Matrices" [ref=e158] [cursor=pointer]:
                - img [ref=e159]
              - button "Pan" [ref=e161] [cursor=pointer]:
                - img [ref=e162]
            - toolbar "Snapping" [ref=e167]:
              - button "Snapping" [pressed] [ref=e168] [cursor=pointer]:
                - img [ref=e169]
              - button "Snapping settings" [ref=e173] [cursor=pointer]:
                - img [ref=e174]
              - region [ref=e176]:
                - generic [ref=e177]:
                  - strong [ref=e178]: Snapping
                  - button [ref=e179] [cursor=pointer]:
                    - img [ref=e180]
                - group [ref=e183]:
                  - button [ref=e184] [cursor=pointer]: 1u
                  - button [ref=e185] [cursor=pointer]: ½u
                  - button [pressed] [ref=e186] [cursor=pointer]: ¼u
                  - button [ref=e187] [cursor=pointer]: ⅛u
                - generic [ref=e188]:
                  - generic [ref=e189]:
                    - checkbox [checked] [ref=e190]
                    - text: Grid
                  - generic [ref=e191]:
                    - checkbox [checked] [ref=e192]
                    - text: Centers
                  - generic [ref=e193]:
                    - checkbox [ref=e194]
                    - text: Origins
                  - generic [ref=e195]:
                    - checkbox [checked] [ref=e196]
                    - text: Edges
                - generic [ref=e197]:
                  - text: Increment · mm
                  - spinbutton [ref=e198]
                - generic [ref=e199]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e200]: "2"
                - group [ref=e201]:
                  - generic [ref=e202] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e203] [cursor=pointer]:
              - img [ref=e204]
          - toolbar "View controls" [ref=e207]:
            - button "Side" [ref=e208] [cursor=pointer]
            - button "Fit layout" [ref=e209] [cursor=pointer]:
              - img [ref=e210]
            - button "Zoom out" [ref=e215] [cursor=pointer]:
              - img [ref=e216]
            - generic [ref=e217]: 100%
            - button "Zoom in" [ref=e218] [cursor=pointer]:
              - img [ref=e219]
          - group "Interactive board layout" [ref=e220]:
            - button "Select matrix_c5_r4" [pressed] [ref=e222]
            - button "Select matrix_c1_r4" [pressed] [ref=e225]
            - button "Select matrix_c1_r3" [ref=e228]
            - button "Select matrix_c1_r2" [ref=e230]
            - button "Select matrix_c1_r1" [ref=e232]
            - button "Select matrix_c2_r4" [pressed] [ref=e234]
            - button "Select matrix_c2_r3" [ref=e237]
            - button "Select matrix_c2_r2" [ref=e239]
            - button "Select matrix_c2_r1" [ref=e241]
            - button "Select matrix_c3_r5" [ref=e243]
            - button "Select matrix_c3_r4" [pressed] [ref=e245]
            - button "Select matrix_c3_r3" [ref=e248]
            - button "Select matrix_c3_r2" [ref=e250]
            - button "Select matrix_c3_r1" [ref=e252]
            - button "Select matrix_c4_r5" [ref=e254]
            - button "Select matrix_c4_r4" [pressed] [ref=e256]
            - button "Select matrix_c4_r3" [ref=e259]
            - button "Select matrix_c4_r2" [ref=e261]
            - button "Select matrix_c4_r1" [ref=e263]
            - button "Select matrix_c5_r3" [ref=e265]
            - button "Select matrix_c5_r2" [ref=e267]
            - button "Select matrix_c5_r1" [ref=e269]
            - button "Select matrix_c6_r4" [pressed] [ref=e271]
            - button "Select matrix_c6_r3" [ref=e274]
            - button "Select matrix_c6_r2" [ref=e276]
            - button "Select matrix_c6_r1" [ref=e278]
            - button "Select matrix_c7_r2" [ref=e280]
            - button "Select matrix_c7_r1" [ref=e282]
            - button "Select thumbfan_c1_r2" [ref=e284]
            - button "Select thumbfan_c2_r2" [ref=e286]
            - button "Select thumbfan_c2_r1" [ref=e288]
            - button "Select thumbfan_c3_r2" [ref=e290]
            - button "Select thumbfan_c3_r1" [ref=e292]
            - button "Select mcu" [ref=e294]
            - button "Select display" [ref=e296]
            - button "Select scrollwheel" [ref=e298]
            - button "Select board_zone_gnd"
            - button "Select power_switch" [ref=e300]
            - button "Select reset_button" [ref=e302]
    - status "Project status" [ref=e304]:
      - generic [ref=e305]: Layout positions current · 33 keys
      - button "Review 5 findings" [ref=e306] [cursor=pointer]
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
  37  |     await expect(
  38  |       page.getByRole('button', { name: 'Add key in column 7' })
> 39  |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  40  |     await page.getByLabel('Relative x', { exact: true }).fill('1');
  41  |     await page
  42  |       .getByRole('button', { name: 'Apply relative adjustment' })
  43  |       .click();
  44  |     await expect
  45  |       .poll(
  46  |         async () =>
  47  |           parse(await readSource(page)).layout.objects.matrix_c1_r4.placement
  48  |             ?.override?.at?.[0]
  49  |       )
  50  |       .toBe(1);
  51  |     const after = parse(await readSource(page));
  52  |     for (const [id, item] of Object.entries(before.layout.objects)) {
  53  |       expect(after.layout.objects[id].properties).toEqual(
  54  |         (item as { properties?: unknown }).properties
  55  |       );
  56  |     }
  57  |     expect(after.layout.objects.matrix_c7_r4).toBeUndefined();
  58  |     expect(after.layout.objects.matrix_c1_r3.placement).toBeUndefined();
  59  |     await page.getByRole('button', { name: 'Add key in column 7' }).click();
  60  |     await expect
  61  |       .poll(
  62  |         async () =>
  63  |           parse(await readSource(page)).layout.objects.matrix_c7_r4?.cell
  64  |       )
  65  |       .toEqual(['c7', 'r4']);
  66  |     const filled = parse(await readSource(page)).layout.objects.matrix_c7_r4;
  67  |     expect(filled.properties).toMatchObject({
  68  |       column_net: 'c7',
  69  |       row_net: 'r4',
  70  |     });
  71  |     expect(filled.pcb).toBe('bhk_pcb');
  72  |     await page
  73  |       .getByRole('button', { name: 'Undo project edit', exact: true })
  74  |       .click();
  75  |     await expect
  76  |       .poll(
  77  |         async () => parse(await readSource(page)).layout.objects.matrix_c7_r4
  78  |       )
  79  |       .toBeUndefined();
  80  |     await page
  81  |       .getByRole('button', { name: 'Undo project edit', exact: true })
  82  |       .click();
  83  |     await expect
  84  |       .poll(async () => parse(await readSource(page)).layout.objects)
  85  |       .toEqual(before.layout.objects);
  86  |     if (
  87  |       await page
  88  |         .getByRole('button', { name: 'Close inspector', exact: true })
  89  |         .count()
  90  |     ) {
  91  |       await page
  92  |         .getByRole('button', { name: 'Close inspector', exact: true })
  93  |         .click();
  94  |     }
  95  |     await page
  96  |       .getByRole('button', { name: 'Select Columns', exact: true })
  97  |       .click();
  98  |     await page
  99  |       .getByRole('button', { name: 'Select matrix_c3_r4', exact: true })
  100 |       .click();
  101 |     if (
  102 |       await page.getByRole('button', { name: 'Inspector', exact: true }).count()
  103 |     ) {
  104 |       await page
  105 |         .getByRole('button', { name: 'Inspector', exact: true })
  106 |         .click();
  107 |     }
  108 |     await expect(
  109 |       page.getByLabel('Column stagger', { exact: true })
  110 |     ).toHaveValue('ky / 4');
  111 |     await page.screenshot({
  112 |       path: test.info().outputPath(`bhk-matrix-${viewport.width}.png`),
  113 |     });
  114 |     expect(
  115 |       await page.evaluate(
  116 |         () => document.documentElement.scrollWidth <= innerWidth
  117 |       )
  118 |     ).toBe(true);
  119 |   });
  120 | }
  121 |
```
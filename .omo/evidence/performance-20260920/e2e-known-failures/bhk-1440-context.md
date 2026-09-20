# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bhk-matrix.spec.ts >> edits BHK rows and columns at 1440px
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
        - button "BHK" [ref=e38] [cursor=pointer]:
          - img [ref=e39]
          - generic [ref=e42]: BHK
        - generic [ref=e43]:
          - button "Rename configuration BHK" [ref=e44] [cursor=pointer]:
            - img [ref=e45]
          - button "Duplicate configuration BHK" [ref=e48] [cursor=pointer]:
            - img [ref=e49]
          - button "Delete configuration BHK" [ref=e52] [cursor=pointer]:
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
      - heading "Board Studio / BHK" [level=1] [ref=e84]
      - generic [ref=e85]: Autosaved
      - button "Generate project" [disabled] [ref=e86]:
        - img [ref=e87]
        - generic [ref=e90]: Generate 3D
      - generic [ref=e92]:
        - button "Code" [ref=e93] [cursor=pointer]:
          - img [ref=e94]
          - text: Code
        - button "Edit key assembly" [ref=e98] [cursor=pointer]
        - button "Design setup" [ref=e99] [cursor=pointer]
        - button "Install app" [ref=e100] [cursor=pointer]:
          - img [ref=e101]
          - text: Install App
        - button "Settings" [ref=e104] [cursor=pointer]:
          - img [ref=e105]
    - navigation "Design workflow" [ref=e108]:
      - button "Design" [ref=e109] [cursor=pointer]:
        - img [ref=e110]
        - text: Design
      - button "PCB" [ref=e115] [cursor=pointer]:
        - img [ref=e116]
        - text: PCB
      - button "Case" [ref=e119] [cursor=pointer]:
        - img [ref=e120]
        - text: Case
      - button "Export" [ref=e123] [cursor=pointer]:
        - img [ref=e124]
        - text: Export
      - generic [ref=e127]:
        - button "Undo project edit" [disabled] [ref=e128]:
          - img [ref=e129]
        - button "Redo project edit" [disabled] [ref=e132]:
          - img [ref=e133]
        - button "Inspector" [expanded] [active] [ref=e136] [cursor=pointer]:
          - img [ref=e137]
          - text: Inspector
        - button "Part library" [ref=e138] [cursor=pointer]:
          - img [ref=e139]
          - text: Part library
    - generic [ref=e144]:
      - complementary "Design inspector" [ref=e145]:
        - generic [ref=e146]:
          - group [ref=e147]:
            - generic "Objects" [ref=e148] [cursor=pointer]
            - button "Add" [ref=e150] [cursor=pointer]:
              - img [ref=e151]
              - text: Add
            - group [ref=e152]:
              - generic "Layout defaults" [ref=e153] [cursor=pointer]
              - option "Custom"
              - option "MX 1u" [selected]
              - option "MX 1.25u"
              - option "MX 1.5u"
              - option "MX 1.75u"
              - option "MX 2u"
              - option "MX 2.25u"
              - option "MX 2.75u"
              - option "MX 6.25u"
              - option "MX 7u"
              - option "MX 1.25u · tall"
              - option "MX 1.5u · tall"
              - option "MX 2u · tall"
            - tree "Layout clusters" [ref=e154]:
              - treeitem "matrix 28 keys" [expanded] [ref=e155]:
                - generic [ref=e156]:
                  - button "Collapse matrix 28 keys" [ref=e157] [cursor=pointer]:
                    - img [ref=e158]
                  - button "matrix 28 keys" [ref=e160] [cursor=pointer]:
                    - generic [ref=e161]: matrix 28 keys
                - group [ref=e162]:
                  - treeitem "Column 1 · c1" [ref=e163]:
                    - generic [ref=e164]:
                      - button "Expand Column 1 · c1" [ref=e165] [cursor=pointer]:
                        - img [ref=e166]
                      - button "Column 1 · c1" [ref=e168] [cursor=pointer]:
                        - generic [ref=e169]: c1
                  - treeitem "Column 2 · c2" [ref=e170]:
                    - generic [ref=e171]:
                      - button "Expand Column 2 · c2" [ref=e172] [cursor=pointer]:
                        - img [ref=e173]
                      - button "Column 2 · c2" [ref=e175] [cursor=pointer]:
                        - generic [ref=e176]: c2
                  - treeitem "Column 3 · c3" [ref=e177]:
                    - generic [ref=e178]:
                      - button "Expand Column 3 · c3" [ref=e179] [cursor=pointer]:
                        - img [ref=e180]
                      - button "Column 3 · c3" [ref=e182] [cursor=pointer]:
                        - generic [ref=e183]: c3
                  - treeitem "Column 4 · c4" [ref=e184]:
                    - generic [ref=e185]:
                      - button "Expand Column 4 · c4" [ref=e186] [cursor=pointer]:
                        - img [ref=e187]
                      - button "Column 4 · c4" [ref=e189] [cursor=pointer]:
                        - generic [ref=e190]: c4
                  - treeitem "Column 5 · c5" [ref=e191]:
                    - generic [ref=e192]:
                      - button "Expand Column 5 · c5" [ref=e193] [cursor=pointer]:
                        - img [ref=e194]
                      - button "Column 5 · c5" [ref=e196] [cursor=pointer]:
                        - generic [ref=e197]: c5
                  - treeitem "Column 6 · c6" [ref=e198]:
                    - generic [ref=e199]:
                      - button "Expand Column 6 · c6" [ref=e200] [cursor=pointer]:
                        - img [ref=e201]
                      - button "Column 6 · c6" [ref=e203] [cursor=pointer]:
                        - generic [ref=e204]: c6
                  - treeitem "Column 7 · c7" [ref=e205]:
                    - generic [ref=e206]:
                      - button "Expand Column 7 · c7" [ref=e207] [cursor=pointer]:
                        - img [ref=e208]
                      - button "Column 7 · c7" [ref=e210] [cursor=pointer]:
                        - generic [ref=e211]: c7
                  - treeitem "Row 1 · r5" [ref=e212]:
                    - generic [ref=e213]:
                      - button "Expand Row 1 · r5" [ref=e214] [cursor=pointer]:
                        - img [ref=e215]
                      - button "Row 1 · r5" [ref=e217] [cursor=pointer]:
                        - generic [ref=e218]: r5
                  - treeitem "Row 2 · r4" [selected] [ref=e219]:
                    - generic [ref=e220]:
                      - button "Expand Row 2 · r4" [ref=e221] [cursor=pointer]:
                        - img [ref=e222]
                      - button "Row 2 · r4" [pressed] [ref=e224] [cursor=pointer]:
                        - generic [ref=e225]: r4
                  - treeitem "Row 3 · r3" [ref=e226]:
                    - generic [ref=e227]:
                      - button "Expand Row 3 · r3" [ref=e228] [cursor=pointer]:
                        - img [ref=e229]
                      - button "Row 3 · r3" [ref=e231] [cursor=pointer]:
                        - generic [ref=e232]: r3
                  - treeitem "Row 4 · r2" [ref=e233]:
                    - generic [ref=e234]:
                      - button "Expand Row 4 · r2" [ref=e235] [cursor=pointer]:
                        - img [ref=e236]
                      - button "Row 4 · r2" [ref=e238] [cursor=pointer]:
                        - generic [ref=e239]: r2
                  - treeitem "Row 5 · r1" [ref=e240]:
                    - generic [ref=e241]:
                      - button "Expand Row 5 · r1" [ref=e242] [cursor=pointer]:
                        - img [ref=e243]
                      - button "Row 5 · r1" [ref=e245] [cursor=pointer]:
                        - generic [ref=e246]: r1
              - treeitem "thumbfan 5 keys" [ref=e247]:
                - generic [ref=e248]:
                  - button "Expand thumbfan 5 keys" [ref=e249] [cursor=pointer]:
                    - img [ref=e250]
                  - button "thumbfan 5 keys" [ref=e252] [cursor=pointer]:
                    - generic [ref=e253]: thumbfan 5 keys
              - treeitem "electronics 0 keys" [ref=e254]:
                - generic [ref=e255]:
                  - button "Expand electronics 0 keys" [ref=e256] [cursor=pointer]:
                    - img [ref=e257]
                  - button "electronics 0 keys" [ref=e259] [cursor=pointer]:
                    - generic [ref=e260]: electronics 0 keys
            - group [ref=e261]:
              - generic "Components and free objects" [ref=e262] [cursor=pointer]
          - group [ref=e263]:
            - generic "Design" [ref=e264] [cursor=pointer]
            - button "Parameters" [ref=e265] [cursor=pointer]:
              - img [ref=e266]
              - text: Parameters
            - button "Constraints" [ref=e271] [cursor=pointer]:
              - img [ref=e272]
              - text: Constraints
            - group [ref=e276]:
              - generic "Mounting layers" [ref=e277] [cursor=pointer]
            - button "bhk Outline" [ref=e278] [cursor=pointer]:
              - text: bhk
              - generic [ref=e279]: Outline
            - button "Rebuild board outline" [ref=e280] [cursor=pointer]
            - button "Sketches" [ref=e282] [cursor=pointer]
        - group [ref=e284]:
          - generic "Selection" [ref=e285] [cursor=pointer]
          - heading "Row 2" [level=2] [ref=e286]
          - paragraph [ref=e287]: matrix · r4. Changes affect every key in this row.
          - group [ref=e288]:
            - generic "Row keys" [ref=e289] [cursor=pointer]
          - group [ref=e290]:
            - generic "Matrix actions" [ref=e291] [cursor=pointer]
      - main [ref=e292]:
        - generic "Outline controls" [ref=e293]:
          - generic [ref=e294]:
            - checkbox "Automatic outline" [checked] [ref=e295]
            - text: Automatic outline
          - status [ref=e296]: Updating outline…
        - status [ref=e297]: Updating layout…
        - generic [ref=e298]:
          - toolbar "Canvas tools" [ref=e299]:
            - generic [ref=e300]:
              - button "Select Objects" [ref=e301] [cursor=pointer]:
                - img [ref=e302]
              - button "Select Columns" [ref=e304] [cursor=pointer]:
                - img [ref=e305]
              - button "Select Rows" [pressed] [ref=e307] [cursor=pointer]:
                - img [ref=e308]
              - button "Select Matrices" [ref=e310] [cursor=pointer]:
                - img [ref=e311]
              - button "Pan" [ref=e313] [cursor=pointer]:
                - img [ref=e314]
            - toolbar "Snapping" [ref=e319]:
              - button "Snapping" [pressed] [ref=e320] [cursor=pointer]:
                - img [ref=e321]
              - button "Snapping settings" [ref=e325] [cursor=pointer]:
                - img [ref=e326]
              - region [ref=e328]:
                - generic [ref=e329]:
                  - strong [ref=e330]: Snapping
                  - button [ref=e331] [cursor=pointer]:
                    - img [ref=e332]
                - group [ref=e335]:
                  - button [ref=e336] [cursor=pointer]: 1u
                  - button [ref=e337] [cursor=pointer]: ½u
                  - button [pressed] [ref=e338] [cursor=pointer]: ¼u
                  - button [ref=e339] [cursor=pointer]: ⅛u
                - generic [ref=e340]:
                  - generic [ref=e341]:
                    - checkbox [checked] [ref=e342]
                    - text: Grid
                  - generic [ref=e343]:
                    - checkbox [checked] [ref=e344]
                    - text: Centers
                  - generic [ref=e345]:
                    - checkbox [ref=e346]
                    - text: Origins
                  - generic [ref=e347]:
                    - checkbox [checked] [ref=e348]
                    - text: Edges
                - generic [ref=e349]:
                  - text: Increment · mm
                  - spinbutton [ref=e350]
                - generic [ref=e351]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e352]: "2"
                - group [ref=e353]:
                  - generic [ref=e354] [cursor=pointer]: Alt bypasses snapping · Help
          - toolbar "View controls" [ref=e355]:
            - button "Side" [ref=e356] [cursor=pointer]
            - button "Fit layout" [ref=e357] [cursor=pointer]:
              - img [ref=e358]
            - button "Zoom out" [ref=e363] [cursor=pointer]:
              - img [ref=e364]
            - generic [ref=e365]: 100%
            - button "Zoom in" [ref=e366] [cursor=pointer]:
              - img [ref=e367]
          - group "Interactive board layout" [ref=e368]:
            - button "Select matrix_c5_r4" [pressed] [ref=e370]
            - button "Select matrix_c1_r4" [pressed] [ref=e373]
            - button "Select matrix_c1_r3" [ref=e376]
            - button "Select matrix_c1_r2" [ref=e378]
            - button "Select matrix_c1_r1" [ref=e380]
            - button "Select matrix_c2_r4" [pressed] [ref=e382]
            - button "Select matrix_c2_r3" [ref=e385]
            - button "Select matrix_c2_r2" [ref=e387]
            - button "Select matrix_c2_r1" [ref=e389]
            - button "Select matrix_c3_r5" [ref=e391]
            - button "Select matrix_c3_r4" [pressed] [ref=e393]
            - button "Select matrix_c3_r3" [ref=e396]
            - button "Select matrix_c3_r2" [ref=e398]
            - button "Select matrix_c3_r1" [ref=e400]
            - button "Select matrix_c4_r5" [ref=e402]
            - button "Select matrix_c4_r4" [pressed] [ref=e404]
            - button "Select matrix_c4_r3" [ref=e407]
            - button "Select matrix_c4_r2" [ref=e409]
            - button "Select matrix_c4_r1" [ref=e411]
            - button "Select matrix_c5_r3" [ref=e413]
            - button "Select matrix_c5_r2" [ref=e415]
            - button "Select matrix_c5_r1" [ref=e417]
            - button "Select matrix_c6_r4" [pressed] [ref=e419]
            - button "Select matrix_c6_r3" [ref=e422]
            - button "Select matrix_c6_r2" [ref=e424]
            - button "Select matrix_c6_r1" [ref=e426]
            - button "Select matrix_c7_r2" [ref=e428]
            - button "Select matrix_c7_r1" [ref=e430]
            - button "Select thumbfan_c1_r2" [ref=e432]
            - button "Select thumbfan_c2_r2" [ref=e434]
            - button "Select thumbfan_c2_r1" [ref=e436]
            - button "Select thumbfan_c3_r2" [ref=e438]
            - button "Select thumbfan_c3_r1" [ref=e440]
            - button "Select mcu" [ref=e442]
            - button "Select display" [ref=e444]
            - button "Select scrollwheel" [ref=e446]
            - button "Select board_zone_gnd"
            - button "Select power_switch" [ref=e448]
            - button "Select reset_button" [ref=e450]
    - status "Project status" [ref=e452]:
      - generic [ref=e453]: Updating layout… · 33 keys
      - button "Review 5 findings" [ref=e454] [cursor=pointer]
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

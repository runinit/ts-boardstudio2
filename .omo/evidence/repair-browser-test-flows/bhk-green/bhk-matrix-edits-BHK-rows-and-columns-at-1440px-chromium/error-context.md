# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bhk-matrix.spec.ts >> edits BHK rows and columns at 1440px
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
      - button "Generate project" [ref=e86] [cursor=pointer]:
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
        - button "Inspector" [expanded] [ref=e136] [cursor=pointer]:
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
            - generic "Row keys" [active] [ref=e289] [cursor=pointer]
            - list "Row keys" [ref=e290]:
              - listitem [ref=e291]:
                - button "Column 1 matrix_c1_r4" [ref=e292] [cursor=pointer]:
                  - generic [ref=e293]: Column 1
                  - generic [ref=e294]: matrix_c1_r4
                - button "Remove matrix_c1_r4" [ref=e295] [cursor=pointer]:
                  - img [ref=e296]
              - listitem [ref=e299]:
                - button "Column 2 matrix_c2_r4" [ref=e300] [cursor=pointer]:
                  - generic [ref=e301]: Column 2
                  - generic [ref=e302]: matrix_c2_r4
                - button "Remove matrix_c2_r4" [ref=e303] [cursor=pointer]:
                  - img [ref=e304]
              - listitem [ref=e307]:
                - button "Column 3 matrix_c3_r4" [ref=e308] [cursor=pointer]:
                  - generic [ref=e309]: Column 3
                  - generic [ref=e310]: matrix_c3_r4
                - button "Remove matrix_c3_r4" [ref=e311] [cursor=pointer]:
                  - img [ref=e312]
              - listitem [ref=e315]:
                - button "Column 4 matrix_c4_r4" [ref=e316] [cursor=pointer]:
                  - generic [ref=e317]: Column 4
                  - generic [ref=e318]: matrix_c4_r4
                - button "Remove matrix_c4_r4" [ref=e319] [cursor=pointer]:
                  - img [ref=e320]
              - listitem [ref=e323]:
                - button "Column 5 matrix_c5_r4" [ref=e324] [cursor=pointer]:
                  - generic [ref=e325]: Column 5
                  - generic [ref=e326]: matrix_c5_r4
                - button "Remove matrix_c5_r4" [ref=e327] [cursor=pointer]:
                  - img [ref=e328]
              - listitem [ref=e331]:
                - button "Column 6 matrix_c6_r4" [ref=e332] [cursor=pointer]:
                  - generic [ref=e333]: Column 6
                  - generic [ref=e334]: matrix_c6_r4
                - button "Remove matrix_c6_r4" [ref=e335] [cursor=pointer]:
                  - img [ref=e336]
              - listitem [ref=e339]:
                - button "Add key in column 7" [ref=e340] [cursor=pointer]
          - group [ref=e341]:
            - generic "Matrix actions" [ref=e342] [cursor=pointer]
      - main [ref=e343]:
        - generic "Outline controls" [ref=e344]:
          - generic [ref=e345]:
            - checkbox "Automatic outline" [checked] [ref=e346]
            - text: Automatic outline
        - generic [ref=e347]:
          - toolbar "Canvas tools" [ref=e348]:
            - generic [ref=e349]:
              - button "Select Objects" [ref=e350] [cursor=pointer]:
                - img [ref=e351]
              - button "Select Columns" [ref=e353] [cursor=pointer]:
                - img [ref=e354]
              - button "Select Rows" [pressed] [ref=e356] [cursor=pointer]:
                - img [ref=e357]
              - button "Select Matrices" [ref=e359] [cursor=pointer]:
                - img [ref=e360]
              - button "Pan" [ref=e362] [cursor=pointer]:
                - img [ref=e363]
            - toolbar "Snapping" [ref=e368]:
              - button "Snapping" [pressed] [ref=e369] [cursor=pointer]:
                - img [ref=e370]
              - button "Snapping settings" [ref=e374] [cursor=pointer]:
                - img [ref=e375]
              - region [ref=e377]:
                - generic [ref=e378]:
                  - strong [ref=e379]: Snapping
                  - button [ref=e380] [cursor=pointer]:
                    - img [ref=e381]
                - group [ref=e384]:
                  - button [ref=e385] [cursor=pointer]: 1u
                  - button [ref=e386] [cursor=pointer]: ½u
                  - button [pressed] [ref=e387] [cursor=pointer]: ¼u
                  - button [ref=e388] [cursor=pointer]: ⅛u
                - generic [ref=e389]:
                  - generic [ref=e390]:
                    - checkbox [checked] [ref=e391]
                    - text: Grid
                  - generic [ref=e392]:
                    - checkbox [checked] [ref=e393]
                    - text: Centers
                  - generic [ref=e394]:
                    - checkbox [ref=e395]
                    - text: Origins
                  - generic [ref=e396]:
                    - checkbox [checked] [ref=e397]
                    - text: Edges
                - generic [ref=e398]:
                  - text: Increment · mm
                  - spinbutton [ref=e399]
                - generic [ref=e400]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e401]: "2"
                - group [ref=e402]:
                  - generic [ref=e403] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e404] [cursor=pointer]:
              - img [ref=e405]
          - toolbar "View controls" [ref=e408]:
            - button "Side" [ref=e409] [cursor=pointer]
            - button "Fit layout" [ref=e410] [cursor=pointer]:
              - img [ref=e411]
            - button "Zoom out" [ref=e416] [cursor=pointer]:
              - img [ref=e417]
            - generic [ref=e418]: 100%
            - button "Zoom in" [ref=e419] [cursor=pointer]:
              - img [ref=e420]
          - group "Interactive board layout" [ref=e421]:
            - button "Select matrix_c5_r4" [pressed] [ref=e423]
            - button "Select matrix_c1_r4" [pressed] [ref=e426]
            - button "Select matrix_c1_r3" [ref=e429]
            - button "Select matrix_c1_r2" [ref=e431]
            - button "Select matrix_c1_r1" [ref=e433]
            - button "Select matrix_c2_r4" [pressed] [ref=e435]
            - button "Select matrix_c2_r3" [ref=e438]
            - button "Select matrix_c2_r2" [ref=e440]
            - button "Select matrix_c2_r1" [ref=e442]
            - button "Select matrix_c3_r5" [ref=e444]
            - button "Select matrix_c3_r4" [pressed] [ref=e446]
            - button "Select matrix_c3_r3" [ref=e449]
            - button "Select matrix_c3_r2" [ref=e451]
            - button "Select matrix_c3_r1" [ref=e453]
            - button "Select matrix_c4_r5" [ref=e455]
            - button "Select matrix_c4_r4" [pressed] [ref=e457]
            - button "Select matrix_c4_r3" [ref=e460]
            - button "Select matrix_c4_r2" [ref=e462]
            - button "Select matrix_c4_r1" [ref=e464]
            - button "Select matrix_c5_r3" [ref=e466]
            - button "Select matrix_c5_r2" [ref=e468]
            - button "Select matrix_c5_r1" [ref=e470]
            - button "Select matrix_c6_r4" [pressed] [ref=e472]
            - button "Select matrix_c6_r3" [ref=e475]
            - button "Select matrix_c6_r2" [ref=e477]
            - button "Select matrix_c6_r1" [ref=e479]
            - button "Select matrix_c7_r2" [ref=e481]
            - button "Select matrix_c7_r1" [ref=e483]
            - button "Select thumbfan_c1_r2" [ref=e485]
            - button "Select thumbfan_c2_r2" [ref=e487]
            - button "Select thumbfan_c2_r1" [ref=e489]
            - button "Select thumbfan_c3_r2" [ref=e491]
            - button "Select thumbfan_c3_r1" [ref=e493]
            - button "Select mcu" [ref=e495]
            - button "Select display" [ref=e497]
            - button "Select scrollwheel" [ref=e499]
            - button "Select board_zone_gnd"
            - button "Select power_switch" [ref=e501]
            - button "Select reset_button" [ref=e503]
    - status "Project status" [ref=e505]:
      - generic [ref=e506]: Layout positions current · 33 keys
      - button "Review 5 findings" [ref=e507] [cursor=pointer]
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
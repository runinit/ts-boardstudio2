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
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Select matrix_c4_r4', exact: true })
    - locator resolved to <g tabindex="0" role="button" aria-pressed="false" data-object="matrix_c4_r4" transform="translate(0,0)" aria-label="Select matrix_c4_r4" aria-describedby="studio-matrix_c4_r4-cell">…</g>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <small>Relative to current placement, in the parent’s ax…</small> from <aside id="studio-inspector" data-pane="properties" class="sc-laROWl fnzRvT" aria-label="Design inspector">…</aside> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <small>Relative to current placement, in the parent’s ax…</small> from <aside id="studio-inspector" data-pane="properties" class="sc-laROWl fnzRvT" aria-label="Design inspector">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    13 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <small>Relative to current placement, in the parent’s ax…</small> from <aside id="studio-inspector" data-pane="properties" class="sc-laROWl fnzRvT" aria-label="Design inspector">…</aside> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    153 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <summary>Relative adjustments</summary> from <aside id="studio-inspector" data-pane="properties" class="sc-laROWl fnzRvT" aria-label="Design inspector">…</aside> subtree intercepts pointer events
      - retrying click action
        - waiting 500ms

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
        - button "Undo project edit" [ref=e101] [cursor=pointer]:
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
            - paragraph [ref=e121]: Key matrix_c1_r4
            - button "Preview board" [ref=e122] [cursor=pointer]:
              - img [ref=e123]
              - text: Preview board
            - button "Close inspector" [ref=e126] [cursor=pointer]:
              - img [ref=e127]
          - group "Inspector view" [ref=e130]:
            - button "Browse objects" [ref=e131] [cursor=pointer]
            - button "Edit properties" [pressed] [ref=e132] [cursor=pointer]
        - generic [ref=e133]:
          - region "Selection relationships" [ref=e134]:
            - heading "Align and constrain" [level=3] [ref=e135]
            - text: Choose an alignment, then click an object or guide on the canvas.
            - generic [ref=e136]:
              - button "Align vertically" [ref=e137] [cursor=pointer]
              - button "Align horizontally" [ref=e138] [cursor=pointer]
            - generic [ref=e139]:
              - generic [ref=e140]: Center distance
              - generic [ref=e141]:
                - textbox "Center distance" [ref=e143]: 0.5u
                - text: Expression = 9.5 mm
            - button "Set distance" [ref=e145] [cursor=pointer]
          - group [ref=e146]:
            - generic "Selection" [ref=e147] [cursor=pointer]
            - heading "matrix_c1_r4" [level=2] [ref=e148]
            - group "Selection adjustments" [ref=e149]:
              - generic [ref=e150]: Selection adjustments
              - generic [ref=e151]:
                - generic [ref=e152]: Key size
                - combobox "Selection key size" [ref=e153]:
                  - option "Custom / mixed" [selected]
                  - option "MX 1u"
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
              - generic [ref=e154]:
                - generic [ref=e155]: Align X
                - combobox "Horizontal alignment" [ref=e156]:
                  - option "Auto (make room)" [selected]
                  - option "Left"
                  - option "Centre"
                  - option "Right"
              - generic [ref=e157]:
                - generic [ref=e158]: Align Y
                - combobox "Vertical alignment" [ref=e159]:
                  - option "Top" [selected]
                  - option "Centre"
                  - option "Bottom"
              - group [ref=e160]:
                - generic "Relative adjustments" [ref=e161] [cursor=pointer]
                - generic [ref=e162]:
                  - text: Relative to current placement, in the parent’s axes.
                  - generic [ref=e163]:
                    - generic [ref=e164]:
                      - generic [ref=e165]: Relative x
                      - generic [ref=e166]:
                        - textbox "Relative x" [ref=e168]: "0"
                        - text: = 0 mm
                    - generic [ref=e169]:
                      - generic [ref=e170]: Relative y
                      - generic [ref=e171]:
                        - textbox "Relative y" [ref=e173]: "0"
                        - text: = 0 mm
                    - generic [ref=e174]:
                      - generic [ref=e175]: Relative rotation
                      - generic [ref=e176]:
                        - textbox "Relative rotation" [ref=e178]: "0"
                        - text: = 0 °
                  - button "Apply relative adjustment" [active] [ref=e179] [cursor=pointer]
            - generic [ref=e180]:
              - generic [ref=e181]: Label
              - textbox "Label" [ref=e182]: matrix_c1_r4
            - text: key
            - heading "Placement" [level=3] [ref=e183]
            - generic [ref=e184]:
              - generic [ref=e185]: X
              - generic [ref=e186]:
                - textbox "X" [ref=e188]: "1"
                - text: = 1 mm
            - generic [ref=e189]:
              - generic [ref=e190]: "Y"
              - generic [ref=e191]:
                - textbox "Y" [ref=e193]: "0"
                - text: = 0 mm
            - generic [ref=e194]:
              - generic [ref=e195]: Z
              - generic [ref=e196]:
                - textbox "Z" [ref=e198]: "0"
                - text: = 0 mm
            - generic [ref=e199]:
              - generic [ref=e200]: Rotation
              - generic [ref=e201]:
                - textbox "Rotation" [ref=e203]: "0"
                - text: = 0 °
            - group [ref=e204]:
              - generic "Advanced placement" [ref=e205] [cursor=pointer]
              - option "None" [selected]
              - option "world"
              - option "clusters.matrix"
              - option "clusters.thumbfan"
              - option "clusters.electronics"
              - option "matrix_c1_r4"
              - option "matrix_c1_r3"
              - option "matrix_c1_r2"
              - option "matrix_c1_r1"
              - option "matrix_c2_r4"
              - option "matrix_c2_r3"
              - option "matrix_c2_r2"
              - option "matrix_c2_r1"
              - option "matrix_c3_r5"
              - option "matrix_c3_r4"
              - option "matrix_c3_r3"
              - option "matrix_c3_r2"
              - option "matrix_c3_r1"
              - option "matrix_c4_r5"
              - option "matrix_c4_r4"
              - option "matrix_c4_r3"
              - option "matrix_c4_r2"
              - option "matrix_c4_r1"
              - option "matrix_c5_r4"
              - option "matrix_c5_r3"
              - option "matrix_c5_r2"
              - option "matrix_c5_r1"
              - option "matrix_c6_r4"
              - option "matrix_c6_r3"
              - option "matrix_c6_r2"
              - option "matrix_c6_r1"
              - option "matrix_c7_r2"
              - option "matrix_c7_r1"
              - option "thumbfan_c1_r2"
              - option "thumbfan_c2_r2"
              - option "thumbfan_c2_r1"
              - option "thumbfan_c3_r2"
              - option "thumbfan_c3_r1"
              - option "mcu"
              - option "display"
              - option "scrollwheel"
              - option "board_zone_gnd"
              - option "power_switch"
              - option "reset_button"
              - option "None" [selected]
              - option "world"
              - option "electronics"
              - option "display_support"
              - option "floor"
            - group [ref=e206]:
              - generic "Part and board" [ref=e207] [cursor=pointer]
              - option "None"
              - option "key" [selected]
              - option "controller"
              - option "display"
              - option "scrollwheel"
              - option "key_rotated"
              - option "power_switch"
              - option "reset_button"
              - option "None"
              - option "bhk_pcb" [selected]
            - generic [ref=e208]:
              - generic [ref=e209]: Key size preset
              - combobox "Key size preset" [ref=e210]:
                - option "Custom" [selected]
                - option "MX 1u"
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
            - text: Keycap envelope in mm. Switch opening stays unchanged.
            - generic [ref=e211]:
              - generic [ref=e212]: Key width
              - generic [ref=e213]:
                - textbox "Key width" [ref=e215]: "22.5"
                - text: = 22.5 mm
            - generic [ref=e216]:
              - generic [ref=e217]: Key depth
              - generic [ref=e218]:
                - textbox "Key depth" [ref=e220]: "18"
                - text: = 18 mm
            - group [ref=e221]:
              - generic "Wiring overrides · automatic by default" [ref=e222] [cursor=pointer]
            - generic [ref=e223]:
              - button "Duplicate" [ref=e224] [cursor=pointer]:
                - img [ref=e225]
                - text: Duplicate
              - button "Delete" [ref=e228] [cursor=pointer]:
                - img [ref=e229]
                - text: Delete
      - main [ref=e232]:
        - generic "Outline controls" [ref=e233]:
          - generic [ref=e234]:
            - checkbox "Automatic outline" [checked] [ref=e235]
            - text: Automatic outline
        - generic [ref=e236]:
          - toolbar "Canvas tools" [ref=e237]:
            - generic [ref=e238]:
              - button "Select Objects" [ref=e239] [cursor=pointer]:
                - img [ref=e240]
              - button "Select Columns" [ref=e242] [cursor=pointer]:
                - img [ref=e243]
              - button "Select Rows" [pressed] [ref=e245] [cursor=pointer]:
                - img [ref=e246]
              - button "Select Matrices" [ref=e248] [cursor=pointer]:
                - img [ref=e249]
              - button "Pan" [ref=e251] [cursor=pointer]:
                - img [ref=e252]
            - toolbar "Snapping" [ref=e257]:
              - button "Snapping" [pressed] [ref=e258] [cursor=pointer]:
                - img [ref=e259]
              - button "Snapping settings" [ref=e263] [cursor=pointer]:
                - img [ref=e264]
              - region [ref=e266]:
                - generic [ref=e267]:
                  - strong [ref=e268]: Snapping
                  - button [ref=e269] [cursor=pointer]:
                    - img [ref=e270]
                - group [ref=e273]:
                  - button [ref=e274] [cursor=pointer]: 1u
                  - button [ref=e275] [cursor=pointer]: ½u
                  - button [pressed] [ref=e276] [cursor=pointer]: ¼u
                  - button [ref=e277] [cursor=pointer]: ⅛u
                - generic [ref=e278]:
                  - generic [ref=e279]:
                    - checkbox [checked] [ref=e280]
                    - text: Grid
                  - generic [ref=e281]:
                    - checkbox [checked] [ref=e282]
                    - text: Centers
                  - generic [ref=e283]:
                    - checkbox [ref=e284]
                    - text: Origins
                  - generic [ref=e285]:
                    - checkbox [checked] [ref=e286]
                    - text: Edges
                - generic [ref=e287]:
                  - text: Increment · mm
                  - spinbutton [ref=e288]
                - generic [ref=e289]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e290]: "2"
                - group [ref=e291]:
                  - generic [ref=e292] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e293] [cursor=pointer]:
              - img [ref=e294]
          - toolbar "View controls" [ref=e297]:
            - button "Side" [ref=e298] [cursor=pointer]
            - button "Fit layout" [ref=e299] [cursor=pointer]:
              - img [ref=e300]
            - button "Zoom out" [ref=e305] [cursor=pointer]:
              - img [ref=e306]
            - generic [ref=e307]: 100%
            - button "Zoom in" [ref=e308] [cursor=pointer]:
              - img [ref=e309]
          - group "Interactive board layout" [ref=e310]:
            - button "Select matrix_c5_r4" [ref=e312]
            - button "Select matrix_c1_r4" [pressed] [ref=e314]
            - button "Select matrix_c1_r3" [ref=e317]
            - button "Select matrix_c1_r2" [ref=e319]
            - button "Select matrix_c1_r1" [ref=e321]
            - button "Select matrix_c2_r4" [ref=e323]
            - button "Select matrix_c2_r3" [ref=e325]
            - button "Select matrix_c2_r2" [ref=e327]
            - button "Select matrix_c2_r1" [ref=e329]
            - button "Select matrix_c3_r5" [ref=e331]
            - button "Select matrix_c3_r4" [ref=e333]
            - button "Select matrix_c3_r3" [ref=e335]
            - button "Select matrix_c3_r2" [ref=e337]
            - button "Select matrix_c3_r1" [ref=e339]
            - button "Select matrix_c4_r5" [ref=e341]
            - button "Select matrix_c4_r4" [ref=e343]
            - button "Select matrix_c4_r3" [ref=e345]
            - button "Select matrix_c4_r2" [ref=e347]
            - button "Select matrix_c4_r1" [ref=e349]
            - button "Select matrix_c5_r3" [ref=e351]
            - button "Select matrix_c5_r2" [ref=e353]
            - button "Select matrix_c5_r1" [ref=e355]
            - button "Select matrix_c6_r4" [ref=e357]
            - button "Select matrix_c6_r3" [ref=e359]
            - button "Select matrix_c6_r2" [ref=e361]
            - button "Select matrix_c6_r1" [ref=e363]
            - button "Select matrix_c7_r2" [ref=e365]
            - button "Select matrix_c7_r1" [ref=e367]
            - button "Select thumbfan_c1_r2" [ref=e369]
            - button "Select thumbfan_c2_r2" [ref=e371]
            - button "Select thumbfan_c2_r1" [ref=e373]
            - button "Select thumbfan_c3_r2" [ref=e375]
            - button "Select thumbfan_c3_r1" [ref=e377]
            - button "Select mcu" [ref=e379]
            - button "Select display" [ref=e381]
            - button "Select scrollwheel" [ref=e383]
            - button "Select board_zone_gnd"
            - button "Select power_switch" [ref=e385]
            - button "Select reset_button" [ref=e387]
    - status "Project status" [ref=e389]:
      - generic [ref=e390]: Layout positions current · 33 keys
      - button "Review 5 findings" [ref=e391] [cursor=pointer]
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
  52  |     await inspector
  53  |       .getByRole('button', {
  54  |         name: 'Column 1 matrix_c1_r4',
  55  |         exact: true,
  56  |       })
  57  |       .click();
  58  |     await inspector
  59  |       .locator('summary')
  60  |       .filter({ hasText: /^Relative adjustments$/ })
  61  |       .click();
  62  |     await page.getByLabel('Relative x', { exact: true }).fill('1');
  63  |     await page
  64  |       .getByRole('button', { name: 'Apply relative adjustment' })
  65  |       .click();
  66  |     await expect
  67  |       .poll(
  68  |         async () =>
  69  |           parse(await readSource(page)).layout.objects.matrix_c1_r4.placement
  70  |             ?.override?.at?.[0]
  71  |       )
  72  |       .toBe(1);
  73  |     const after = parse(await readSource(page));
  74  |     for (const [id, item] of Object.entries(before.layout.objects)) {
  75  |       expect(after.layout.objects[id].properties).toEqual(
  76  |         (item as { properties?: unknown }).properties
  77  |       );
  78  |     }
  79  |     expect(after.layout.objects.matrix_c7_r4).toBeUndefined();
  80  |     expect(after.layout.objects.matrix_c1_r3.placement).toBeUndefined();
  81  |     await page
  82  |       .getByRole('button', { name: 'Select matrix_c4_r4', exact: true })
> 83  |       .click();
      |        ^ Error: locator.click: Test timeout of 90000ms exceeded.
  84  |     await expect(
  85  |       page.getByRole('heading', { name: 'Row 2', exact: true })
  86  |     ).toBeVisible();
  87  |     if ((await rowKeys.getAttribute('open')) !== '') {
  88  |       await rowKeysSummary.click();
  89  |     }
  90  |     await expect(rowKeys).toHaveJSProperty('open', true);
  91  |     await expect(addKey).toBeVisible();
  92  |     await expect(addKey).toBeEnabled();
  93  |     await addKey.click();
  94  |     await expect
  95  |       .poll(
  96  |         async () =>
  97  |           parse(await readSource(page)).layout.objects.matrix_c7_r4?.cell
  98  |       )
  99  |       .toEqual(['c7', 'r4']);
  100 |     const filled = parse(await readSource(page)).layout.objects.matrix_c7_r4;
  101 |     expect(filled.properties).toMatchObject({
  102 |       column_net: 'c7',
  103 |       row_net: 'r4',
  104 |     });
  105 |     expect(filled.pcb).toBe('bhk_pcb');
  106 |     await page
  107 |       .getByRole('button', { name: 'Undo project edit', exact: true })
  108 |       .click();
  109 |     await expect
  110 |       .poll(
  111 |         async () => parse(await readSource(page)).layout.objects.matrix_c7_r4
  112 |       )
  113 |       .toBeUndefined();
  114 |     await page
  115 |       .getByRole('button', { name: 'Undo project edit', exact: true })
  116 |       .click();
  117 |     await expect
  118 |       .poll(async () => parse(await readSource(page)).layout.objects)
  119 |       .toEqual(before.layout.objects);
  120 |     if (
  121 |       await page
  122 |         .getByRole('button', { name: 'Close inspector', exact: true })
  123 |         .count()
  124 |     ) {
  125 |       await page
  126 |         .getByRole('button', { name: 'Close inspector', exact: true })
  127 |         .click();
  128 |     }
  129 |     await page
  130 |       .getByRole('button', { name: 'Select Columns', exact: true })
  131 |       .click();
  132 |     await page
  133 |       .getByRole('button', { name: 'Select matrix_c3_r4', exact: true })
  134 |       .click();
  135 |     if (
  136 |       await page.getByRole('button', { name: 'Inspector', exact: true }).count()
  137 |     ) {
  138 |       await page
  139 |         .getByRole('button', { name: 'Inspector', exact: true })
  140 |         .click();
  141 |     }
  142 |     await expect(
  143 |       page.getByLabel('Column stagger', { exact: true })
  144 |     ).toHaveValue('ky / 4');
  145 |     await page.screenshot({
  146 |       path: test.info().outputPath(`bhk-matrix-${viewport.width}.png`),
  147 |     });
  148 |     expect(
  149 |       await page.evaluate(
  150 |         () => document.documentElement.scrollWidth <= innerWidth
  151 |       )
  152 |     ).toBe(true);
  153 |   });
  154 | }
  155 |
```
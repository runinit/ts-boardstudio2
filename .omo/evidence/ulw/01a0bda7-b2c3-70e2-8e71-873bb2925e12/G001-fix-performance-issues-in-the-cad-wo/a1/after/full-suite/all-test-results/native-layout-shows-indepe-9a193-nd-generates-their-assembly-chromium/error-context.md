# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-layout.spec.ts >> shows independent floor and PCB layers in side view and generates their assembly
- Location: e2e/native-layout.spec.ts:157:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('= 2.5 mm', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('= 2.5 mm', { exact: true })

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
        - generic [ref=e35]: "2"
      - generic [ref=e36]:
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
        - generic [ref=e56]:
          - button "Native layout" [ref=e57] [cursor=pointer]:
            - img [ref=e58]
            - generic [ref=e61]: Native layout
          - generic [ref=e62]:
            - button "Rename configuration Native layout" [ref=e63] [cursor=pointer]:
              - img [ref=e64]
            - button "Duplicate configuration Native layout" [ref=e67] [cursor=pointer]:
              - img [ref=e68]
            - button "Delete configuration Native layout" [ref=e71] [cursor=pointer]:
              - img [ref=e72]
    - generic [ref=e76]:
      - button "Open documentation" [ref=e77] [cursor=pointer]:
        - img [ref=e78]
        - generic [ref=e81]: Docs
      - button "Join the Discord community" [ref=e82] [cursor=pointer]:
        - img [ref=e83]
      - button "View Ergogen Web UI 0.20.0 on GitHub" [ref=e85] [cursor=pointer]:
        - img [ref=e86]
        - generic [ref=e88]:
          - generic [ref=e89]: Web UI
          - generic [ref=e90]: 0.20.0
      - button "View Ergogen 6.0.0-develop on GitHub" [ref=e91] [cursor=pointer]:
        - img [ref=e92]
        - generic [ref=e94]:
          - generic [ref=e95]: Ergogen
          - generic [ref=e96]: 6.0.0-develop
  - region "Board Studio" [ref=e98]:
    - generic [ref=e99]:
      - button "Projects" [ref=e100] [cursor=pointer]:
        - img [ref=e101]
      - heading "Board Studio / Legacy Config" [level=1] [ref=e103]
      - generic [ref=e104]: Autosaved
      - button "Generate project" [ref=e105] [cursor=pointer]:
        - img [ref=e106]
        - generic [ref=e109]: Generate 3D
      - generic [ref=e111]:
        - button "Code" [ref=e112] [cursor=pointer]:
          - img [ref=e113]
          - text: Code
        - button "Design setup" [ref=e117] [cursor=pointer]
        - button "Install app" [ref=e118] [cursor=pointer]:
          - img [ref=e119]
          - text: Install App
        - button "Settings" [ref=e122] [cursor=pointer]:
          - img [ref=e123]
    - navigation "Design workflow" [ref=e126]:
      - button "Design" [ref=e127] [cursor=pointer]:
        - img [ref=e128]
        - text: Design
      - button "PCB" [ref=e133] [cursor=pointer]:
        - img [ref=e134]
        - text: PCB
      - button "Case" [ref=e137] [cursor=pointer]:
        - img [ref=e138]
        - text: Case
      - button "Export" [ref=e141] [cursor=pointer]:
        - img [ref=e142]
        - text: Export
      - generic [ref=e145]:
        - button "Undo project edit" [disabled] [ref=e146]:
          - img [ref=e147]
        - button "Redo project edit" [disabled] [ref=e150]:
          - img [ref=e151]
        - button "Inspector" [expanded] [ref=e154] [cursor=pointer]:
          - img [ref=e155]
          - text: Inspector
        - button "Part library" [ref=e156] [cursor=pointer]:
          - img [ref=e157]
          - text: Part library
    - generic [ref=e162]:
      - complementary "Design inspector" [ref=e163]:
        - generic [ref=e164]:
          - group [ref=e165]:
            - generic "Objects" [ref=e166] [cursor=pointer]
            - button "Add" [ref=e168] [cursor=pointer]:
              - img [ref=e169]
              - text: Add
            - group [ref=e170]:
              - generic "Layout defaults" [ref=e171] [cursor=pointer]
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
            - tree "Layout clusters" [ref=e172]:
              - treeitem "fingers 4 keys" [expanded] [ref=e173]:
                - generic [ref=e174]:
                  - button "Collapse fingers 4 keys" [ref=e175] [cursor=pointer]:
                    - img [ref=e176]
                  - button "fingers 4 keys" [ref=e178] [cursor=pointer]:
                    - generic [ref=e179]: fingers 4 keys
                - group [ref=e180]:
                  - treeitem "Column 1 · outer" [ref=e181]:
                    - generic [ref=e182]:
                      - button "Expand Column 1 · outer" [ref=e183] [cursor=pointer]:
                        - img [ref=e184]
                      - button "Column 1 · outer" [ref=e186] [cursor=pointer]:
                        - generic [ref=e187]: outer
                  - treeitem "Column 2 · inner" [ref=e188]:
                    - generic [ref=e189]:
                      - button "Expand Column 2 · inner" [ref=e190] [cursor=pointer]:
                        - img [ref=e191]
                      - button "Column 2 · inner" [ref=e193] [cursor=pointer]:
                        - generic [ref=e194]: inner
                  - treeitem "Row 1 · home" [ref=e195]:
                    - generic [ref=e196]:
                      - button "Expand Row 1 · home" [ref=e197] [cursor=pointer]:
                        - img [ref=e198]
                      - button "Row 1 · home" [ref=e200] [cursor=pointer]:
                        - generic [ref=e201]: home
                  - treeitem "Row 2 · top" [ref=e202]:
                    - generic [ref=e203]:
                      - button "Expand Row 2 · top" [ref=e204] [cursor=pointer]:
                        - img [ref=e205]
                      - button "Row 2 · top" [ref=e207] [cursor=pointer]:
                        - generic [ref=e208]: top
              - treeitem "electronics 0 keys" [ref=e209]:
                - generic [ref=e210]:
                  - button "Expand electronics 0 keys" [ref=e211] [cursor=pointer]:
                    - img [ref=e212]
                  - button "electronics 0 keys" [ref=e214] [cursor=pointer]:
                    - generic [ref=e215]: electronics 0 keys
            - group [ref=e216]:
              - generic "Components and free objects" [ref=e217] [cursor=pointer]
          - group [ref=e218]:
            - generic "Design" [ref=e219] [cursor=pointer]
            - button "Parameters" [ref=e220] [cursor=pointer]:
              - img [ref=e221]
              - text: Parameters
            - button "Constraints" [ref=e226] [cursor=pointer]:
              - img [ref=e227]
              - text: Constraints
            - group [ref=e231]:
              - generic "Mounting layers" [ref=e232] [cursor=pointer]
            - button "board Outline" [ref=e233] [cursor=pointer]:
              - text: board
              - generic [ref=e234]: Outline
            - button "Rebuild board outline" [ref=e235] [cursor=pointer]
            - button "Sketches" [ref=e237] [cursor=pointer]
        - generic [ref=e238]:
          - region "Selection relationships" [ref=e239]:
            - heading "Align and constrain" [level=3] [ref=e240]
            - text: Choose an alignment, then click an object or guide on the canvas.
            - generic [ref=e241]:
              - button "Align vertically" [ref=e242] [cursor=pointer]
              - button "Align horizontally" [ref=e243] [cursor=pointer]
            - generic [ref=e244]:
              - generic [ref=e245]: Center distance
              - generic [ref=e246]:
                - textbox "Center distance" [ref=e248]: 0.5u
                - text: Expression = 9.5 mm
            - button "Set distance" [ref=e250] [cursor=pointer]
          - group [ref=e251]:
            - generic "Selection" [ref=e252] [cursor=pointer]
            - heading "battery" [level=2] [ref=e253]
            - group "Selection adjustments" [ref=e254]:
              - generic [ref=e255]: Selection adjustments
              - group [ref=e256]:
                - generic "Relative adjustments" [ref=e257] [cursor=pointer]
            - generic [ref=e258]:
              - generic [ref=e259]: Label
              - textbox "Label" [ref=e260]: battery
            - text: component
            - heading "Placement" [level=3] [ref=e261]
            - generic [ref=e262]:
              - generic [ref=e263]: X
              - generic [ref=e264]:
                - textbox "X" [ref=e266]: "10"
                - text: = 10 mm
            - generic [ref=e267]:
              - generic [ref=e268]: "Y"
              - generic [ref=e269]:
                - textbox "Y" [ref=e271]: "8"
                - text: = 8 mm
            - generic [ref=e272]:
              - generic [ref=e273]: Z
              - generic [ref=e274]:
                - textbox "Z" [ref=e276]: "0.5"
                - text: = 0.5 mm
            - generic [ref=e277]:
              - generic [ref=e278]: Rotation
              - generic [ref=e279]:
                - textbox "Rotation" [ref=e281]: "0"
                - text: = 0 °
            - group [ref=e282]:
              - generic "Advanced placement" [ref=e283] [cursor=pointer]
              - option "None" [selected]
              - option "world"
              - option "clusters.fingers"
              - option "clusters.electronics"
              - option "outer_home"
              - option "outer_top"
              - option "inner_home"
              - option "inner_top"
              - option "mcu"
              - option "screen"
              - option "battery"
              - option "None"
              - option "floor" [selected]
              - option "world"
              - option "switches"
            - group [ref=e284]:
              - generic "Part and board" [ref=e285] [cursor=pointer]
              - option "None"
              - option "battery" [selected]
              - option "mx"
              - option "controller"
              - option "display"
              - option "None" [selected]
              - option "main"
            - heading "Physical envelope" [level=3] [ref=e286]
            - generic [ref=e287]:
              - generic [ref=e288]: Body width
              - generic [ref=e289]:
                - textbox "Body width" [ref=e291]: "20"
                - text: = 20 mm
            - generic [ref=e292]:
              - generic [ref=e293]: Body depth
              - generic [ref=e294]:
                - textbox "Body depth" [ref=e296]: "28"
                - text: = 28 mm
            - generic [ref=e297]:
              - generic [ref=e298]: Body bottom
              - generic [ref=e299]:
                - textbox "Body bottom" [ref=e301]: "0"
                - text: = 0 mm
            - generic [ref=e302]:
              - generic [ref=e303]: Body top
              - generic [ref=e304]:
                - textbox "Body top" [ref=e306]: "3"
                - text: = 3 mm
            - text: Height limits are relative to the part origin. Mounting offset is separate.
            - heading "Vertical stacking" [level=3] [ref=e307]
            - generic [ref=e308]:
              - generic [ref=e309]: Above
              - combobox "Above" [ref=e310]:
                - option "None" [selected]
                - option "outer_home.body.top"
                - option "outer_top.body.top"
                - option "inner_home.body.top"
                - option "inner_top.body.top"
                - option "mcu.body.top"
                - option "screen.body.top"
            - generic [ref=e311]:
              - generic [ref=e312]: Below
              - combobox "Below" [ref=e313]:
                - option "None" [selected]
                - option "outer_home.body.bottom"
                - option "outer_top.body.bottom"
                - option "inner_home.body.bottom"
                - option "inner_top.body.bottom"
                - option "mcu.body.bottom"
                - option "screen.body.bottom"
            - generic [ref=e314]:
              - generic [ref=e315]: Stack gap
              - generic [ref=e316]:
                - textbox "Stack gap" [ref=e318]: "0"
                - text: = 0 mm
            - heading "Footprint" [level=3] [ref=e319]
            - generic [ref=e320]:
              - generic [ref=e321]: Provider
              - textbox "Provider" [ref=e322]
            - generic [ref=e323]:
              - button "Duplicate" [ref=e324] [cursor=pointer]:
                - img [ref=e325]
                - text: Duplicate
              - button "Delete" [ref=e328] [cursor=pointer]:
                - img [ref=e329]
                - text: Delete
      - main [ref=e332]:
        - generic "Outline controls" [ref=e333]:
          - generic [ref=e334]:
            - checkbox "Automatic outline" [checked] [ref=e335]
            - text: Automatic outline
        - generic [ref=e336]:
          - toolbar "Canvas tools" [ref=e337]:
            - generic [ref=e338]:
              - button "Select Objects" [ref=e339] [cursor=pointer]:
                - img [ref=e340]
              - button "Select Columns" [ref=e342] [cursor=pointer]:
                - img [ref=e343]
              - button "Select Rows" [ref=e345] [cursor=pointer]:
                - img [ref=e346]
              - button "Select Matrices" [pressed] [ref=e348] [cursor=pointer]:
                - img [ref=e349]
              - button "Pan" [ref=e351] [cursor=pointer]:
                - img [ref=e352]
            - toolbar "Snapping" [ref=e357]:
              - button "Snapping" [pressed] [ref=e358] [cursor=pointer]:
                - img [ref=e359]
              - button "Snapping settings" [ref=e363] [cursor=pointer]:
                - img [ref=e364]
              - region [ref=e366]:
                - generic [ref=e367]:
                  - strong [ref=e368]: Snapping
                  - button [ref=e369] [cursor=pointer]:
                    - img [ref=e370]
                - group [ref=e373]:
                  - button [ref=e374] [cursor=pointer]: 1u
                  - button [ref=e375] [cursor=pointer]: ½u
                  - button [pressed] [ref=e376] [cursor=pointer]: ¼u
                  - button [ref=e377] [cursor=pointer]: ⅛u
                - generic [ref=e378]:
                  - generic [ref=e379]:
                    - checkbox [checked] [ref=e380]
                    - text: Grid
                  - generic [ref=e381]:
                    - checkbox [checked] [ref=e382]
                    - text: Centers
                  - generic [ref=e383]:
                    - checkbox [ref=e384]
                    - text: Origins
                  - generic [ref=e385]:
                    - checkbox [checked] [ref=e386]
                    - text: Edges
                - generic [ref=e387]:
                  - text: Increment · mm
                  - spinbutton [ref=e388]
                - generic [ref=e389]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e390]: "2"
                - group [ref=e391]:
                  - generic [ref=e392] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e393] [cursor=pointer]:
              - img [ref=e394]
          - toolbar "View controls" [ref=e397]:
            - button "2D" [ref=e398] [cursor=pointer]
            - button "Fit layout" [ref=e399] [cursor=pointer]:
              - img [ref=e400]
            - button "Zoom out" [ref=e405] [cursor=pointer]:
              - img [ref=e406]
            - generic [ref=e407]: 100%
            - button "Zoom in" [ref=e408] [cursor=pointer]:
              - img [ref=e409]
          - group "Interactive board layout" [ref=e410]:
            - button "Select outer_home" [ref=e412]
            - button "Select outer_top" [ref=e414]
            - button "Select inner_home" [ref=e416]
            - button "Select inner_top" [ref=e418]
            - button "Select mcu" [ref=e420]
            - button "Select screen" [ref=e422]
            - button "Select battery" [active] [pressed] [ref=e424]
    - status "Project status" [ref=e427]:
      - generic [ref=e428]: Layout positions current · 4 keys
      - button "View findings" [ref=e429] [cursor=pointer]
```

# Test source

```ts
  69  | const openLayout = async (page: Page) => {
  70  |   await expect(studio(page)).toBeVisible();
  71  |   await expect(
  72  |     page.getByRole('group', { name: 'Interactive board layout' })
  73  |   ).toBeVisible();
  74  | };
  75  | 
  76  | test('edits local key overrides, preserves arrangements, and enforces locks', async ({
  77  |   page,
  78  | }) => {
  79  |   await load(page, Columns.value);
  80  |   await openLayout(page);
  81  |   await page
  82  |     .getByRole('button', { name: 'Select Objects', exact: true })
  83  |     .click();
  84  |   await page
  85  |     .getByRole('button', { name: 'Select outer_home', exact: true })
  86  |     .click();
  87  |   await page.getByLabel('X', { exact: true }).fill('5');
  88  |   await page.getByLabel('X', { exact: true }).press('Tab');
  89  |   await expect
  90  |     .poll(
  91  |       async () =>
  92  |         parse(await source(page)).layout.objects.outer_home.placement?.override
  93  |           ?.at?.[0]
  94  |     )
  95  |     .toBe(5);
  96  |   expect(parse(await source(page)).layout.clusters).toEqual(
  97  |     parse(Columns.value).layout.clusters
  98  |   );
  99  |   await expect(page.getByLabel('Locked', { exact: true })).toBeEnabled();
  100 |   await page.getByLabel('Locked', { exact: true }).check();
  101 |   await expect(page.getByLabel('X', { exact: true })).toBeDisabled();
  102 |   await page.screenshot({
  103 |     path: test.info().outputPath('native-layout-top.png'),
  104 |   });
  105 |   await page.getByLabel('Locked', { exact: true }).uncheck();
  106 |   await expect(page.getByLabel('X', { exact: true })).toBeEnabled();
  107 |   await expect(
  108 |     page.getByRole('status').filter({ hasText: /Layout resolved/ })
  109 |   ).toBeVisible();
  110 |   const beforeMove = await source(page);
  111 |   const key = page.getByRole('button', {
  112 |     name: 'Select outer_home',
  113 |     exact: true,
  114 |   });
  115 |   await key.focus();
  116 |   await key.press('ArrowRight');
  117 |   await expect
  118 |     .poll(
  119 |       async () =>
  120 |         parse(await source(page)).layout.objects.outer_home.placement.override
  121 |           .at[0]
  122 |     )
  123 |     .toBe(6);
  124 |   await page.getByRole('button', { name: 'Undo project edit' }).click();
  125 |   await expect.poll(() => source(page)).toBe(beforeMove);
  126 |   await expect(page.getByLabel('X', { exact: true })).toHaveValue('5');
  127 |   await expect(page.getByLabel('X', { exact: true })).toBeEnabled();
  128 |   await expect(
  129 |     page.getByRole('status').filter({ hasText: /Layout resolved/ })
  130 |   ).toBeVisible();
  131 |   await page
  132 |     .getByRole('button', { name: 'Select Objects', exact: true })
  133 |     .click();
  134 |   // This test exercises free placement, independent of spacing constraints.
  135 |   await page.keyboard.down('Alt');
  136 |   const box = (await key.boundingBox())!;
  137 |   await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  138 |   await page.mouse.down();
  139 |   await page.mouse.move(
  140 |     box.x + box.width / 2 + 18,
  141 |     box.y + box.height / 2 - 12,
  142 |     { steps: 4 }
  143 |   );
  144 |   await page.mouse.up();
  145 |   await page.keyboard.up('Alt');
  146 |   await expect.poll(() => source(page)).not.toBe(beforeMove);
  147 |   const movedX = parse(await source(page)).layout.objects.outer_home.placement
  148 |     .override.at[0];
  149 |   await expect(page.getByLabel('X', { exact: true })).toHaveValue(
  150 |     String(movedX)
  151 |   );
  152 |   await expect(page.getByLabel('X', { exact: true })).toBeEnabled();
  153 |   await page.getByRole('button', { name: 'Undo project edit' }).click();
  154 |   await expect.poll(() => source(page)).toBe(beforeMove);
  155 | });
  156 | 
  157 | test('shows independent floor and PCB layers in side view and generates their assembly', async ({
  158 |   page,
  159 | }) => {
  160 |   await load(page, Stack.value);
  161 |   await openLayout(page);
  162 |   await page.getByRole('button', { name: 'Side', exact: true }).click();
  163 |   await page
  164 |     .getByRole('button', { name: 'Select battery', exact: true })
  165 |     .click();
  166 |   await expect(page.getByLabel('Mounting layer', { exact: true })).toHaveValue(
  167 |     'floor'
  168 |   );
> 169 |   await expect(page.getByText('= 2.5 mm', { exact: true })).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  170 |   await page
  171 |     .getByRole('button', { name: 'Select screen', exact: true })
  172 |     .press('Enter');
  173 |   await expect(page.getByLabel('Mounting layer', { exact: true })).toHaveValue(
  174 |     'switches'
  175 |   );
  176 |   await expect(page.getByText('= 12.6 mm', { exact: true })).toBeVisible();
  177 |   await page.screenshot({
  178 |     path: test.info().outputPath('native-layout-side.png'),
  179 |   });
  180 |   await openCase(page);
  181 |   const dialog = page.getByRole('region', { name: 'Case designer' });
  182 |   await expect(
  183 |     page.getByRole('button', { name: 'Generate project', exact: true })
  184 |   ).toBeEnabled({ timeout: TIMEOUT });
  185 |   await page
  186 |     .getByRole('button', { name: 'Generate project', exact: true })
  187 |     .click();
  188 |   await expect(
  189 |     dialog.getByRole('status').filter({ hasText: /Current geometry/ })
  190 |   ).toBeVisible({ timeout: TIMEOUT });
  191 |   await dialog.getByRole('button', { name: 'assembled', exact: true }).click();
  192 |   await expect(dialog.getByLabel('3D assembly preview')).toHaveAttribute(
  193 |     'data-rendered',
  194 |     'true',
  195 |     { timeout: TIMEOUT }
  196 |   );
  197 |   await page.screenshot({
  198 |     path: test.info().outputPath('native-stack-assembly.png'),
  199 |   });
  200 |   await expect(
  201 |     dialog.getByRole('treeitem', { name: 'battery (1)', exact: true })
  202 |   ).toBeVisible();
  203 |   await expect(
  204 |     dialog.getByText(/Current geometry · 7 components/)
  205 |   ).toBeVisible();
  206 | });
  207 | 
  208 | test('preserves a legacy source while rejecting generation', async ({
  209 |   page,
  210 | }) => {
  211 |   const legacy = '# Preserve this source\npoints: {zones: {key: {}}}\n';
  212 |   await load(page, legacy);
  213 |   await expect(
  214 |     page.getByText(/This engine accepts schema: ergogen\/v1 only/).first()
  215 |   ).toBeVisible({ timeout: TIMEOUT });
  216 |   expect(await source(page)).toBe(legacy);
  217 |   await expect(
  218 |     page.getByTestId('downloads-container-main-kicad_pcb-download')
  219 |   ).toHaveCount(0);
  220 | });
  221 | 
  222 | test('moves an alias from its existing offset and restores the alias with undo', async ({
  223 |   page,
  224 | }) => {
  225 |   const original = `schema: ergogen/v1
  226 | layout:
  227 |   objects:
  228 |     original: &key {kind: key, envelopes: {pcb: {size: [18, 18]}}, placement: {override: {at: [10, 0, 0]}}}
  229 |     copy: *key # preserve alias
  230 | `;
  231 |   await load(page, original);
  232 |   await openLayout(page);
  233 |   await page.getByRole('button', { name: 'Select copy', exact: true }).click();
  234 |   await expect(page.getByLabel('X', { exact: true })).toHaveValue('10');
  235 |   await page.getByLabel('X', { exact: true }).fill('12');
  236 |   await page.getByLabel('X', { exact: true }).press('Tab');
  237 |   await expect
  238 |     .poll(
  239 |       async () =>
  240 |         parse(await source(page)).layout.objects.copy.placement.override.at[0]
  241 |     )
  242 |     .toBe(12);
  243 |   await expect(page.getByLabel('X', { exact: true })).toHaveValue('12');
  244 |   await expect(page.getByLabel('X', { exact: true })).toBeEnabled();
  245 |   expect(
  246 |     parse(await source(page)).layout.objects.original.placement.override.at[0]
  247 |   ).toBe(10);
  248 |   await page.getByRole('button', { name: 'Undo project edit' }).click();
  249 |   await expect.poll(() => source(page)).toBe(original);
  250 | });
  251 | 
  252 | test('grows an onboarding matrix and adds an owned thumb assembly', async ({
  253 |   page,
  254 | }) => {
  255 |   await load(
  256 |     page,
  257 |     compileSetup({ ...defaultSetup(), columns: 2, rows: 1, led: true })
  258 |   );
  259 |   await page
  260 |     .getByRole('button', { name: 'fingers 2 keys', exact: true })
  261 |     .click();
  262 |   await page.getByLabel('Matrix columns').fill('3');
  263 |   await page.getByLabel('Matrix columns').press('Tab');
  264 |   await expect
  265 |     .poll(
  266 |       async () =>
  267 |         parse(await source(page)).layout.objects.fingers_c3_r1_diode?.footprints
  268 |           .main.params.to
  269 |     )
```
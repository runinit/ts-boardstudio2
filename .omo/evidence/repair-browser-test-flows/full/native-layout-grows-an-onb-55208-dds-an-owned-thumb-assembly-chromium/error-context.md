# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-layout.spec.ts >> grows an onboarding matrix and adds an owned thumb assembly
- Location: e2e/native-layout.spec.ts:252:5

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('status').filter({ hasText: /Layout resolved/ })
Expected: visible
Timeout: 120000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 120000ms
  - waiting for getByRole('status').filter({ hasText: /Layout resolved/ })

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
        - button "Edit key assembly" [ref=e117] [cursor=pointer]
        - button "Design setup" [ref=e118] [cursor=pointer]
        - button "Install app" [ref=e119] [cursor=pointer]:
          - img [ref=e120]
          - text: Install App
        - button "Settings" [ref=e123] [cursor=pointer]:
          - img [ref=e124]
    - navigation "Design workflow" [ref=e127]:
      - button "Design" [ref=e128] [cursor=pointer]:
        - img [ref=e129]
        - text: Design
      - button "PCB" [ref=e134] [cursor=pointer]:
        - img [ref=e135]
        - text: PCB
      - button "Case" [ref=e138] [cursor=pointer]:
        - img [ref=e139]
        - text: Case
      - button "Export" [ref=e142] [cursor=pointer]:
        - img [ref=e143]
        - text: Export
      - generic [ref=e146]:
        - button "Undo project edit" [ref=e147] [cursor=pointer]:
          - img [ref=e148]
        - button "Redo project edit" [disabled] [ref=e151]:
          - img [ref=e152]
        - button "Inspector" [expanded] [ref=e155] [cursor=pointer]:
          - img [ref=e156]
          - text: Inspector
        - button "Part library" [ref=e157] [cursor=pointer]:
          - img [ref=e158]
          - text: Part library
    - generic [ref=e163]:
      - complementary "Design inspector" [ref=e164]:
        - generic [ref=e165]:
          - group [ref=e166]:
            - generic "Objects" [ref=e167] [cursor=pointer]
            - button "Add" [ref=e169] [cursor=pointer]:
              - img [ref=e170]
              - text: Add
            - group [ref=e171]:
              - generic "Layout defaults" [ref=e172] [cursor=pointer]
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
            - tree "Layout clusters" [ref=e173]:
              - treeitem "fingers 3 keys" [expanded] [ref=e174]:
                - generic [ref=e175]:
                  - button "Collapse fingers 3 keys" [ref=e176] [cursor=pointer]:
                    - img [ref=e177]
                  - button "fingers 3 keys" [ref=e179] [cursor=pointer]:
                    - generic [ref=e180]: fingers 3 keys
                - group [ref=e181]:
                  - treeitem "Column 1 · c1" [ref=e182]:
                    - generic [ref=e183]:
                      - button "Expand Column 1 · c1" [ref=e184] [cursor=pointer]:
                        - img [ref=e185]
                      - button "Column 1 · c1" [ref=e187] [cursor=pointer]:
                        - generic [ref=e188]: c1
                  - treeitem "Column 2 · c2" [ref=e189]:
                    - generic [ref=e190]:
                      - button "Expand Column 2 · c2" [ref=e191] [cursor=pointer]:
                        - img [ref=e192]
                      - button "Column 2 · c2" [ref=e194] [cursor=pointer]:
                        - generic [ref=e195]: c2
                  - treeitem "Column 3 · c3" [ref=e196]:
                    - generic [ref=e197]:
                      - button "Expand Column 3 · c3" [ref=e198] [cursor=pointer]:
                        - img [ref=e199]
                      - button "Column 3 · c3" [ref=e201] [cursor=pointer]:
                        - generic [ref=e202]: c3
                  - treeitem "Row 1 · r1" [ref=e203]:
                    - generic [ref=e204]:
                      - button "Expand Row 1 · r1" [ref=e205] [cursor=pointer]:
                        - img [ref=e206]
                      - button "Row 1 · r1" [ref=e208] [cursor=pointer]:
                        - generic [ref=e209]: r1
              - treeitem "thumbs 3 keys" [expanded] [selected] [ref=e210]:
                - generic [ref=e211]:
                  - button "Collapse thumbs 3 keys" [ref=e212] [cursor=pointer]:
                    - img [ref=e213]
                  - button "thumbs 3 keys" [pressed] [ref=e215] [cursor=pointer]:
                    - generic [ref=e216]: thumbs 3 keys
                - group [ref=e217]:
                  - treeitem "thumbs_0" [ref=e218]:
                    - generic [ref=e219]:
                      - button "Expand thumbs_0" [ref=e220] [cursor=pointer]:
                        - img [ref=e221]
                      - button "thumbs_0" [ref=e223] [cursor=pointer]:
                        - generic [ref=e224]: thumbs_0
                  - treeitem "thumbs_1" [ref=e225]:
                    - generic [ref=e226]:
                      - button "Expand thumbs_1" [ref=e227] [cursor=pointer]:
                        - img [ref=e228]
                      - button "thumbs_1" [ref=e230] [cursor=pointer]:
                        - generic [ref=e231]: thumbs_1
                  - treeitem "thumbs_2" [ref=e232]:
                    - generic [ref=e233]:
                      - button "Expand thumbs_2" [ref=e234] [cursor=pointer]:
                        - img [ref=e235]
                      - button "thumbs_2" [ref=e237] [cursor=pointer]:
                        - generic [ref=e238]: thumbs_2
            - group [ref=e239]:
              - generic "Components and free objects" [ref=e240] [cursor=pointer]
          - group [ref=e241]:
            - generic "Design" [ref=e242] [cursor=pointer]
            - button "Parameters" [ref=e243] [cursor=pointer]:
              - img [ref=e244]
              - text: Parameters
            - button "Constraints" [ref=e249] [cursor=pointer]:
              - img [ref=e250]
              - text: Constraints
            - group [ref=e254]:
              - generic "Mounting layers" [ref=e255] [cursor=pointer]
            - button "main Outline" [ref=e256] [cursor=pointer]:
              - text: main
              - generic [ref=e257]: Outline
            - button "Rebuild board outline" [ref=e258] [cursor=pointer]
            - button "Sketches" [ref=e260] [cursor=pointer]
        - group [ref=e262]:
          - generic "Selection" [ref=e263] [cursor=pointer]
          - heading "thumbs" [level=2] [ref=e264]
          - group "Selection adjustments" [ref=e265]:
            - generic [ref=e266]: Selection adjustments
            - generic [ref=e267]:
              - generic [ref=e268]: Key size
              - combobox "Selection key size" [ref=e269]:
                - option "Custom / mixed"
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
            - generic [ref=e270]:
              - generic [ref=e271]: Align X
              - combobox "Horizontal alignment" [ref=e272]:
                - option "Auto (make room)" [selected]
                - option "Left"
                - option "Centre"
                - option "Right"
            - generic [ref=e273]:
              - generic [ref=e274]: Align Y
              - combobox "Vertical alignment" [ref=e275]:
                - option "Top" [selected]
                - option "Centre"
                - option "Bottom"
            - group [ref=e276]:
              - generic "Relative adjustments" [ref=e277] [cursor=pointer]
          - generic [ref=e278]:
            - generic [ref=e279]: Label
            - textbox "Label" [ref=e280]: thumbs
          - text: arc arrangement
          - group [ref=e281]:
            - generic "Cluster defaults" [ref=e282] [cursor=pointer]
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
          - heading "Arc arrangement" [level=3] [ref=e283]
          - generic [ref=e284]:
            - generic [ref=e285]: Radius
            - generic [ref=e286]:
              - textbox "Radius" [ref=e288]: "45"
              - text: = 45 mm
          - generic [ref=e289]:
            - generic [ref=e290]: Start angle
            - generic [ref=e291]:
              - textbox "Start angle" [ref=e293]: "-15"
              - text: = -15 °
          - generic [ref=e294]:
            - generic [ref=e295]: Angular step
            - generic [ref=e296]:
              - textbox "Angular step" [ref=e298]: "30"
              - text: = 30 mm
          - generic [ref=e299]:
            - generic [ref=e300]: Key count
            - spinbutton "Arc key count" [ref=e301]: "3"
          - heading "Placement" [level=3] [ref=e302]
          - generic [ref=e303]:
            - generic [ref=e304]: X
            - generic [ref=e305]:
              - textbox "X" [ref=e307]: "85.1"
              - text: = 85.1 mm
          - generic [ref=e308]:
            - generic [ref=e309]: "Y"
            - generic [ref=e310]:
              - textbox "Y" [ref=e312]: "-5"
              - text: = -5 mm
          - generic [ref=e313]:
            - generic [ref=e314]: Z
            - generic [ref=e315]:
              - textbox "Z" [ref=e317]: "0"
              - text: = 0 mm
          - generic [ref=e318]:
            - generic [ref=e319]: Rotation
            - generic [ref=e320]:
              - textbox "Rotation" [ref=e322]: "0"
              - text: = 0 °
          - group [ref=e323]:
            - generic "Advanced placement" [ref=e324] [cursor=pointer]
            - option "None" [selected]
            - option "world"
            - option "fingers"
            - option "thumbs"
            - option "fingers_c1_r1"
            - option "fingers_c1_r1_diode"
            - option "fingers_c1_r1_led"
            - option "fingers_c2_r1"
            - option "fingers_c2_r1_diode"
            - option "fingers_c2_r1_led"
            - option "fingers_c3_r1"
            - option "fingers_c3_r1_diode"
            - option "fingers_c3_r1_led"
            - option "thumbs_0"
            - option "thumbs_1"
            - option "thumbs_2"
            - option "thumbs_0_diode"
            - option "thumbs_0_led"
            - option "thumbs_1_diode"
            - option "thumbs_1_led"
            - option "thumbs_2_diode"
            - option "thumbs_2_led"
            - option "None"
            - option "main" [selected]
            - option "world"
          - generic [ref=e325]:
            - button "Duplicate" [ref=e326] [cursor=pointer]:
              - img [ref=e327]
              - text: Duplicate
            - button "Delete" [ref=e330] [cursor=pointer]:
              - img [ref=e331]
              - text: Delete
      - main [ref=e334]:
        - generic "Outline controls" [ref=e335]:
          - generic [ref=e336]:
            - checkbox "Automatic outline" [checked] [ref=e337]
            - text: Automatic outline
        - generic [ref=e338]:
          - toolbar "Canvas tools" [ref=e339]:
            - generic [ref=e340]:
              - button "Select Objects" [ref=e341] [cursor=pointer]:
                - img [ref=e342]
              - button "Select Columns" [ref=e344] [cursor=pointer]:
                - img [ref=e345]
              - button "Select Rows" [ref=e347] [cursor=pointer]:
                - img [ref=e348]
              - button "Select Matrices" [pressed] [ref=e350] [cursor=pointer]:
                - img [ref=e351]
              - button "Pan" [ref=e353] [cursor=pointer]:
                - img [ref=e354]
            - toolbar "Snapping" [ref=e359]:
              - button "Snapping" [pressed] [ref=e360] [cursor=pointer]:
                - img [ref=e361]
              - button "Snapping settings" [ref=e365] [cursor=pointer]:
                - img [ref=e366]
              - region [ref=e368]:
                - generic [ref=e369]:
                  - strong [ref=e370]: Snapping
                  - button [ref=e371] [cursor=pointer]:
                    - img [ref=e372]
                - group [ref=e375]:
                  - button [ref=e376] [cursor=pointer]: 1u
                  - button [ref=e377] [cursor=pointer]: ½u
                  - button [pressed] [ref=e378] [cursor=pointer]: ¼u
                  - button [ref=e379] [cursor=pointer]: ⅛u
                - generic [ref=e380]:
                  - generic [ref=e381]:
                    - checkbox [checked] [ref=e382]
                    - text: Grid
                  - generic [ref=e383]:
                    - checkbox [checked] [ref=e384]
                    - text: Centers
                  - generic [ref=e385]:
                    - checkbox [ref=e386]
                    - text: Origins
                  - generic [ref=e387]:
                    - checkbox [checked] [ref=e388]
                    - text: Edges
                - generic [ref=e389]:
                  - text: Increment · mm
                  - spinbutton [ref=e390]
                - generic [ref=e391]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e392]: "2"
                - group [ref=e393]:
                  - generic [ref=e394] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e395] [cursor=pointer]:
              - img [ref=e396]
          - toolbar "View controls" [ref=e399]:
            - button "Side" [ref=e400] [cursor=pointer]
            - button "Fit layout" [ref=e401] [cursor=pointer]:
              - img [ref=e402]
            - button "Zoom out" [ref=e407] [cursor=pointer]:
              - img [ref=e408]
            - generic [ref=e409]: 100%
            - button "Zoom in" [ref=e410] [cursor=pointer]:
              - img [ref=e411]
          - group "Interactive board layout" [ref=e412]:
            - button "Select fingers_c1_r1" [ref=e414]
            - button "Select fingers_c1_r1_diode" [ref=e416]
            - button "Select fingers_c1_r1_led" [ref=e418]
            - button "Select fingers_c2_r1" [ref=e420]
            - button "Select fingers_c2_r1_diode" [ref=e422]
            - button "Select fingers_c2_r1_led" [ref=e424]
            - button "Select fingers_c3_r1" [ref=e426]
            - button "Select fingers_c3_r1_diode" [ref=e428]
            - button "Select fingers_c3_r1_led" [ref=e430]
            - button "Select thumbs_0" [pressed] [ref=e432]
            - button "Select thumbs_1" [pressed] [ref=e435]
            - button "Select thumbs_2" [pressed] [ref=e438]
            - button "Select thumbs_0_diode" [pressed] [ref=e441]
            - button "Select thumbs_0_led" [pressed] [ref=e444]
            - button "Select thumbs_1_diode" [pressed] [ref=e447]
            - button "Select thumbs_1_led" [pressed] [ref=e450]
            - button "Select thumbs_2_diode" [pressed] [ref=e453]
            - button "Select thumbs_2_led" [pressed] [ref=e456]
    - status "Project status" [ref=e459]:
      - generic [ref=e460]: Layout positions current · 6 keys
      - button "Review 3 blockers" [ref=e461] [cursor=pointer]
```

# Test source

```ts
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
  270 |     .toBe('R1');
  271 |   await page.getByRole('button', { name: 'Add', exact: true }).click();
  272 |   await page.getByLabel('New item kind').selectOption('arc');
  273 |   await page.getByLabel('New item name').fill('thumbs');
  274 |   await page.getByRole('button', { name: 'Create', exact: true }).click();
  275 |   await expect(
  276 |     page.getByRole('button', { name: 'thumbs 3 keys', exact: true })
  277 |   ).toBeVisible();
  278 |   await expect
  279 |     .poll(
  280 |       async () =>
  281 |         parse(await source(page)).layout.objects.thumbs_0_led?.properties.owner
  282 |     )
  283 |     .toBe('thumbs_0');
  284 |   await expect(
  285 |     page.getByRole('status').filter({ hasText: /Layout resolved/ })
> 286 |   ).toBeVisible({ timeout: TIMEOUT });
      |     ^ Error: expect(locator).toBeVisible() failed
  287 |   await page.screenshot({
  288 |     path: test.info().outputPath('onboarding-growth.png'),
  289 |   });
  290 | });
  291 | test('cancels, confirms and undoes removal of an edited column', async ({
  292 |   page,
  293 | }) => {
  294 |   const initial = setValue(
  295 |     compileSetup({ ...defaultSetup(), columns: 2, rows: 1, led: true }),
  296 |     ['layout', 'objects', 'fingers_c2_r1', 'placement'],
  297 |     { override: { at: [2, 0, 0] } }
  298 |   );
  299 |   await load(page, initial);
  300 |   await page
  301 |     .getByRole('button', { name: 'fingers 2 keys', exact: true })
  302 |     .click();
  303 |   const columns = page.getByLabel('Matrix columns');
  304 |   await columns.fill('1');
  305 |   await columns.press('Tab');
  306 |   const review = page.getByRole('dialog', { name: 'Review matrix resize' });
  307 |   await expect(review).toBeVisible();
  308 |   expect(await source(page)).toBe(initial);
  309 |   await review.getByRole('button', { name: 'Cancel', exact: true }).click();
  310 |   await expect(columns).toHaveValue('2');
  311 |   expect(await source(page)).toBe(initial);
  312 |   await columns.fill('1');
  313 |   await columns.press('Tab');
  314 |   await page.screenshot({ path: test.info().outputPath('resize-review.png') });
  315 |   await review.getByRole('button', { name: 'Remove keys and resize' }).click();
  316 |   await expect
  317 |     .poll(async () => parse(await source(page)).layout.objects.fingers_c2_r1)
  318 |     .toBeUndefined();
  319 |   expect(
  320 |     parse(await source(page)).layout.objects.fingers_c2_r1_led
  321 |   ).toBeUndefined();
  322 |   await page.getByRole('button', { name: 'Undo project edit' }).click();
  323 |   await expect.poll(() => source(page)).toBe(initial);
  324 | });
  325 | test('repairs a published setup draft on a narrow screen without touching custom nets', async ({
  326 |   page,
  327 | }) => {
  328 |   await page.setViewportSize({ width: 390, height: 844 });
  329 |   const initial = setValue(
  330 |     setupBaseline({ ...defaultSetup(), columns: 2, rows: 1, led: true }, 1),
  331 |     [
  332 |       'layout',
  333 |       'objects',
  334 |       'fingers_c2_r1_led',
  335 |       'footprints',
  336 |       'main',
  337 |       'params',
  338 |       'P4',
  339 |     ],
  340 |     'CUSTOM'
  341 |   );
  342 |   await load(page, initial);
  343 |   await expect
  344 |     .poll(async () => parse(await source(page)).meta.studio.setupRevision)
  345 |     .toBe(2);
  346 |   const doc = parse(await source(page));
  347 |   expect(doc.layout.objects.fingers_c1_r1_led.footprints.main.params.P4).toBe(
  348 |     'LED_DATA'
  349 |   );
  350 |   expect(doc.layout.objects.fingers_c2_r1_led.footprints.main.params.P4).toBe(
  351 |     'CUSTOM'
  352 |   );
  353 |   expect(doc.designs.regions.main.envelope).toBe('keycap');
  354 |   await page.reload();
  355 |   await expect(studio(page)).toBeVisible();
  356 |   expect(
  357 |     parse(await source(page)).layout.objects.fingers_c2_r1_led.footprints.main
  358 |       .params.P4
  359 |   ).toBe('CUSTOM');
  360 | });
  361 |
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-layout.spec.ts >> edits local key overrides, preserves arrangements, and enforces locks
- Location: e2e/native-layout.spec.ts:76:5

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.check: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByLabel('Locked', { exact: true })
    - locator resolved to <input type="checkbox" aria-label="Locked"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    220 × waiting for element to be visible, enabled and stable
        - element is not visible
      - retrying click action
        - waiting 500ms

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
              - treeitem "fingers 4 keys" [expanded] [ref=e174]:
                - generic [ref=e175]:
                  - button "Collapse fingers 4 keys" [ref=e176] [cursor=pointer]:
                    - img [ref=e177]
                  - button "fingers 4 keys" [ref=e179] [cursor=pointer]:
                    - generic [ref=e180]: fingers 4 keys
                - group [ref=e181]:
                  - treeitem "Column 1 · outer" [expanded] [ref=e182]:
                    - generic [ref=e183]:
                      - button "Collapse Column 1 · outer" [ref=e184] [cursor=pointer]:
                        - img [ref=e185]
                      - button "Column 1 · outer" [ref=e187] [cursor=pointer]:
                        - generic [ref=e188]: outer
                    - group [ref=e189]:
                      - treeitem "outer_home" [selected] [ref=e190] [cursor=pointer]:
                        - generic [ref=e191]: home
                      - treeitem "outer_top" [ref=e192] [cursor=pointer]:
                        - generic [ref=e193]: top
                  - treeitem "Column 2 · inner" [ref=e194]:
                    - generic [ref=e195]:
                      - button "Expand Column 2 · inner" [ref=e196] [cursor=pointer]:
                        - img [ref=e197]
                      - button "Column 2 · inner" [ref=e199] [cursor=pointer]:
                        - generic [ref=e200]: inner
                  - treeitem "Row 1 · home" [expanded] [ref=e201]:
                    - generic [ref=e202]:
                      - button "Collapse Row 1 · home" [ref=e203] [cursor=pointer]:
                        - img [ref=e204]
                      - button "Row 1 · home" [ref=e206] [cursor=pointer]:
                        - generic [ref=e207]: home
                    - group
                  - treeitem "Row 2 · top" [ref=e208]:
                    - generic [ref=e209]:
                      - button "Expand Row 2 · top" [ref=e210] [cursor=pointer]:
                        - img [ref=e211]
                      - button "Row 2 · top" [ref=e213] [cursor=pointer]:
                        - generic [ref=e214]: top
            - group [ref=e215]:
              - generic "Components and free objects" [ref=e216] [cursor=pointer]
          - group [ref=e217]:
            - generic "Design" [ref=e218] [cursor=pointer]
            - button "Parameters" [ref=e219] [cursor=pointer]:
              - img [ref=e220]
              - text: Parameters
            - button "Constraints" [ref=e225] [cursor=pointer]:
              - img [ref=e226]
              - text: Constraints
            - group [ref=e230]:
              - generic "Mounting layers" [ref=e231] [cursor=pointer]
            - button "board Outline" [ref=e232] [cursor=pointer]:
              - text: board
              - generic [ref=e233]: Outline
            - button "Rebuild board outline" [ref=e234] [cursor=pointer]
            - button "Sketches" [ref=e236] [cursor=pointer]
        - generic [ref=e237]:
          - region "Selection relationships" [ref=e238]:
            - heading "Align and constrain" [level=3] [ref=e239]
            - text: Choose an alignment, then click an object or guide on the canvas.
            - generic [ref=e240]:
              - button "Align vertically" [ref=e241] [cursor=pointer]
              - button "Align horizontally" [ref=e242] [cursor=pointer]
            - generic [ref=e243]:
              - generic [ref=e244]: Center distance
              - generic [ref=e245]:
                - textbox "Center distance" [ref=e247]: 0.5u
                - text: Expression = 9.5 mm
            - button "Set distance" [ref=e249] [cursor=pointer]
          - group [ref=e250]:
            - generic "Selection" [ref=e251] [cursor=pointer]
            - heading "outer_home" [level=2] [ref=e252]
            - group "Selection adjustments" [ref=e253]:
              - generic [ref=e254]: Selection adjustments
              - generic [ref=e255]:
                - generic [ref=e256]: Key size
                - combobox "Selection key size" [ref=e257]:
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
              - generic [ref=e258]:
                - generic [ref=e259]: Align X
                - combobox "Horizontal alignment" [ref=e260]:
                  - option "Auto (make room)" [selected]
                  - option "Left"
                  - option "Centre"
                  - option "Right"
              - generic [ref=e261]:
                - generic [ref=e262]: Align Y
                - combobox "Vertical alignment" [ref=e263]:
                  - option "Top" [selected]
                  - option "Centre"
                  - option "Bottom"
              - group [ref=e264]:
                - generic "Relative adjustments" [ref=e265] [cursor=pointer]
            - generic [ref=e266]:
              - generic [ref=e267]: Label
              - textbox "Label" [ref=e268]: outer_home
            - text: key
            - heading "Placement" [level=3] [ref=e269]
            - generic [ref=e270]:
              - generic [ref=e271]: X
              - generic [ref=e272]:
                - textbox "X" [ref=e274]: "5"
                - text: = 5 mm
            - generic [ref=e275]:
              - generic [ref=e276]: "Y"
              - generic [ref=e277]:
                - textbox "Y" [active] [ref=e279]: "0"
                - text: = 0 mm
            - generic [ref=e280]:
              - generic [ref=e281]: Z
              - generic [ref=e282]:
                - textbox "Z" [ref=e284]: "0"
                - text: = 0 mm
            - generic [ref=e285]:
              - generic [ref=e286]: Rotation
              - generic [ref=e287]:
                - textbox "Rotation" [ref=e289]: "0"
                - text: = 0 °
            - group [ref=e290]:
              - generic "Advanced placement" [ref=e291] [cursor=pointer]
              - option "None" [selected]
              - option "world"
              - option "clusters.fingers"
              - option "outer_home"
              - option "outer_top"
              - option "inner_home"
              - option "inner_top"
              - option "None" [selected]
              - option "world"
              - option "switches"
            - group [ref=e292]:
              - generic "Part and board" [ref=e293] [cursor=pointer]
              - option "None"
              - option "mx" [selected]
              - option "None"
              - option "main" [selected]
            - generic [ref=e294]:
              - generic [ref=e295]: Key size preset
              - combobox "Key size preset" [ref=e296]:
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
            - text: Keycap envelope in mm. Switch opening stays unchanged.
            - generic [ref=e297]:
              - generic [ref=e298]: Key width
              - generic [ref=e299]:
                - textbox "Key width" [ref=e301]: "18"
                - text: = 18 mm
            - generic [ref=e302]:
              - generic [ref=e303]: Key depth
              - generic [ref=e304]:
                - textbox "Key depth" [ref=e306]: "18"
                - text: = 18 mm
            - group [ref=e307]:
              - generic "Wiring overrides · automatic by default" [ref=e308] [cursor=pointer]
            - generic [ref=e309]:
              - button "Duplicate" [ref=e310] [cursor=pointer]:
                - img [ref=e311]
                - text: Duplicate
              - button "Delete" [ref=e314] [cursor=pointer]:
                - img [ref=e315]
                - text: Delete
      - main [ref=e318]:
        - generic "Outline controls" [ref=e319]:
          - generic [ref=e320]:
            - checkbox "Automatic outline" [checked] [ref=e321]
            - text: Automatic outline
        - generic [ref=e322]:
          - toolbar "Canvas tools" [ref=e323]:
            - generic [ref=e324]:
              - button "Select Objects" [pressed] [ref=e325] [cursor=pointer]:
                - img [ref=e326]
              - button "Select Columns" [ref=e328] [cursor=pointer]:
                - img [ref=e329]
              - button "Select Rows" [ref=e331] [cursor=pointer]:
                - img [ref=e332]
              - button "Select Matrices" [ref=e334] [cursor=pointer]:
                - img [ref=e335]
              - button "Pan" [ref=e337] [cursor=pointer]:
                - img [ref=e338]
            - toolbar "Snapping" [ref=e343]:
              - button "Snapping" [pressed] [ref=e344] [cursor=pointer]:
                - img [ref=e345]
              - button "Snapping settings" [ref=e349] [cursor=pointer]:
                - img [ref=e350]
              - region [ref=e352]:
                - generic [ref=e353]:
                  - strong [ref=e354]: Snapping
                  - button [ref=e355] [cursor=pointer]:
                    - img [ref=e356]
                - group [ref=e359]:
                  - button [ref=e360] [cursor=pointer]: 1u
                  - button [ref=e361] [cursor=pointer]: ½u
                  - button [pressed] [ref=e362] [cursor=pointer]: ¼u
                  - button [ref=e363] [cursor=pointer]: ⅛u
                - generic [ref=e364]:
                  - generic [ref=e365]:
                    - checkbox [checked] [ref=e366]
                    - text: Grid
                  - generic [ref=e367]:
                    - checkbox [checked] [ref=e368]
                    - text: Centers
                  - generic [ref=e369]:
                    - checkbox [ref=e370]
                    - text: Origins
                  - generic [ref=e371]:
                    - checkbox [checked] [ref=e372]
                    - text: Edges
                - generic [ref=e373]:
                  - text: Increment · mm
                  - spinbutton [ref=e374]
                - generic [ref=e375]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e376]: "2"
                - group [ref=e377]:
                  - generic [ref=e378] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e379] [cursor=pointer]:
              - img [ref=e380]
          - toolbar "View controls" [ref=e383]:
            - button "Side" [ref=e384] [cursor=pointer]
            - button "Fit layout" [ref=e385] [cursor=pointer]:
              - img [ref=e386]
            - button "Zoom out" [ref=e391] [cursor=pointer]:
              - img [ref=e392]
            - generic [ref=e393]: 100%
            - button "Zoom in" [ref=e394] [cursor=pointer]:
              - img [ref=e395]
          - group "Interactive board layout" [ref=e396]:
            - button "Select outer_home" [pressed] [ref=e398]
            - button "Select outer_top" [ref=e401]
            - button "Select inner_home" [ref=e403]
            - button "Select inner_top" [ref=e405]
    - status "Project status" [ref=e407]:
      - generic [ref=e408]: Layout positions current · 4 keys
      - button "View findings" [ref=e409] [cursor=pointer]
```

# Test source

```ts
  1   | import { studio, openCase, readSource, openInspector } from './utils/studio';
  2   | import {
  3   |   CONFIG_LOCAL_STORAGE_KEY,
  4   |   MULTI_CONFIG_STORAGE_KEY,
  5   | } from '../src/context/constants';
  6   | import { storageKey } from '../src/utils/storageKey';
  7   | import { expect, test, Page } from '@playwright/test';
  8   | import Stack from '../src/examples/physical-stack';
  9   | import Columns from '../src/examples/columns';
  10  | import { parse } from 'yaml';
  11  | import { compileSetup, defaultSetup } from '../src/utils/designSetup';
  12  | import { setupBaseline } from '../src/utils/setupRepair';
  13  | import { setValue } from '../src/utils/studioSource';
  14  | 
  15  | const TIMEOUT = 120000;
  16  | test.setTimeout(TIMEOUT);
  17  | const source = readSource;
  18  | const load = async (page: Page, config: string) => {
  19  |   await page.addInitScript(
  20  |     ({ config, configKey, multiKey, settingsKey }) => {
  21  |       localStorage.setItem(configKey, JSON.stringify(config));
  22  |       if (config.startsWith('schema: ergogen/v1')) {
  23  |         const id = 'native-test';
  24  |         const timestamp = new Date().toISOString();
  25  |         localStorage.setItem(
  26  |           multiKey,
  27  |           JSON.stringify({
  28  |             version: 2,
  29  |             activeConfigId: id,
  30  |             configs: [
  31  |               {
  32  |                 id,
  33  |                 name: 'Native layout',
  34  |                 config,
  35  |                 createdAt: timestamp,
  36  |                 updatedAt: timestamp,
  37  |               },
  38  |             ],
  39  |           })
  40  |         );
  41  |       }
  42  |       localStorage.setItem(
  43  |         settingsKey,
  44  |         JSON.stringify({
  45  |           autoGen: false,
  46  |           autoGen3D: false,
  47  |           debug: true,
  48  |           sendUsageMetrics: false,
  49  |         })
  50  |       );
  51  |     },
  52  |     {
  53  |       config,
  54  |       configKey: CONFIG_LOCAL_STORAGE_KEY,
  55  |       multiKey: MULTI_CONFIG_STORAGE_KEY,
  56  |       settingsKey: storageKey('ergogen:settings'),
  57  |     }
  58  |   );
  59  |   await page.goto('./');
  60  |   await expect(
  61  |     config.includes('ergogen/v1')
  62  |       ? studio(page)
  63  |       : page.getByTestId('config-editor')
  64  |   ).toBeVisible();
  65  |   if (config.includes('ergogen/v1')) {
  66  |     await openInspector(page);
  67  |   }
  68  | };
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
> 100 |   await page.getByLabel('Locked', { exact: true }).check();
      |                                                    ^ Error: locator.check: Test timeout of 120000ms exceeded.
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
  169 |   await expect(page.getByText('= 2.5 mm', { exact: true })).toBeVisible();
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
```
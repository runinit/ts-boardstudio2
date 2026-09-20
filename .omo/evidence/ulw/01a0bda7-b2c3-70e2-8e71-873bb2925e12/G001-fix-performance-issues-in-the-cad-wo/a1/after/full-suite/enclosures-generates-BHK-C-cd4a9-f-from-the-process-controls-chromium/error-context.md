# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: enclosures.spec.ts >> generates BHK CNC relief from the process controls
- Location: e2e/enclosures.spec.ts:281:5

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'Case designer' }).getByRole('status').filter({ hasText: /Current geometry/ })
Expected: visible
Timeout: 90000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 90000ms
  - waiting for getByRole('region', { name: 'Case designer' }).getByRole('status').filter({ hasText: /Current geometry/ })

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
      - button "Generate project" [disabled] [ref=e86]:
        - img [ref=e87]
        - generic [ref=e90]: Generating…
      - button "Cancel generation" [ref=e91] [cursor=pointer]
      - generic [ref=e93]:
        - button "Code" [ref=e94] [cursor=pointer]:
          - img [ref=e95]
          - text: Code
        - button "Edit key assembly" [ref=e99] [cursor=pointer]
        - button "Design setup" [ref=e100] [cursor=pointer]
        - button "Install app" [ref=e101] [cursor=pointer]:
          - img [ref=e102]
          - text: Install App
        - button "Settings" [ref=e105] [cursor=pointer]:
          - img [ref=e106]
    - navigation "Design workflow" [ref=e109]:
      - button "Design" [ref=e110] [cursor=pointer]:
        - img [ref=e111]
        - text: Design
      - button "PCB" [ref=e116] [cursor=pointer]:
        - img [ref=e117]
        - text: PCB
      - button "Case" [ref=e120] [cursor=pointer]:
        - img [ref=e121]
        - text: Case
      - button "Export" [ref=e124] [cursor=pointer]:
        - img [ref=e125]
        - text: Export
      - generic [ref=e128]:
        - button "Undo project edit" [ref=e129] [cursor=pointer]:
          - img [ref=e130]
        - button "Redo project edit" [disabled] [ref=e133]:
          - img [ref=e134]
        - button "Part library" [ref=e137] [cursor=pointer]:
          - img [ref=e138]
          - text: Part library
    - region "Case designer" [ref=e143]:
      - generic [ref=e144]:
        - complementary "Assembly panel" [ref=e145]:
          - button "Close assembly tree" [ref=e146] [cursor=pointer]
          - heading "Assembly" [level=2] [ref=e147]
          - paragraph [ref=e148]: bhk
          - tree "Assembly" [ref=e149]:
            - generic [ref=e151]:
              - treeitem "Case shell" [level=1] [ref=e152] [cursor=pointer]:
                - img [ref=e153]
                - generic [ref=e156]: Case shell
              - button "Hide Case shell" [ref=e157] [cursor=pointer]:
                - img [ref=e158]
            - generic [ref=e162]:
              - treeitem "Top frame" [level=1] [ref=e163] [cursor=pointer]:
                - img [ref=e164]
                - generic [ref=e167]: Top frame
              - button "Hide Top frame" [ref=e168] [cursor=pointer]:
                - img [ref=e169]
            - generic [ref=e173]:
              - treeitem "Plate" [level=1] [ref=e174] [cursor=pointer]:
                - img [ref=e175]
                - generic [ref=e179]: Plate
              - button "Hide Plate" [ref=e180] [cursor=pointer]:
                - img [ref=e181]
            - generic [ref=e185]:
              - treeitem "PCB" [level=1] [ref=e186] [cursor=pointer]:
                - img [ref=e187]
                - generic [ref=e193]: PCB
              - button "Hide PCB" [ref=e194] [cursor=pointer]:
                - img [ref=e195]
            - generic [ref=e198]:
              - generic [ref=e199]:
                - button "Collapse Components (39)" [ref=e200] [cursor=pointer]:
                  - img [ref=e201]
                - treeitem "Components (39)" [expanded] [level=1] [ref=e203] [cursor=pointer]:
                  - img [ref=e204]
                  - generic [ref=e207]: Components
                  - generic [ref=e208]: "39"
                - button "Hide Components (39)" [ref=e209] [cursor=pointer]:
                  - img [ref=e210]
              - group [ref=e213]:
                - generic [ref=e215]:
                  - button "Expand component (1)" [ref=e216] [cursor=pointer]:
                    - img [ref=e217]
                  - treeitem "component (1)" [level=2] [ref=e219] [cursor=pointer]:
                    - img [ref=e220]
                    - generic [ref=e223]: component
                    - generic [ref=e224]: "1"
                  - button "Hide component (1)" [ref=e225] [cursor=pointer]:
                    - img [ref=e226]
                - generic [ref=e230]:
                  - button "Expand display (1)" [ref=e231] [cursor=pointer]:
                    - img [ref=e232]
                  - treeitem "display (1)" [level=2] [ref=e234] [cursor=pointer]:
                    - img [ref=e235]
                    - generic [ref=e238]: display
                    - generic [ref=e239]: "1"
                  - button "Hide display (1)" [ref=e240] [cursor=pointer]:
                    - img [ref=e241]
                - generic [ref=e245]:
                  - button "Expand key_rotated (18)" [ref=e246] [cursor=pointer]:
                    - img [ref=e247]
                  - treeitem "key_rotated (18)" [level=2] [ref=e249] [cursor=pointer]:
                    - img [ref=e250]
                    - generic [ref=e253]: key_rotated
                    - generic [ref=e254]: "18"
                  - button "Hide key_rotated (18)" [ref=e255] [cursor=pointer]:
                    - img [ref=e256]
                - generic [ref=e260]:
                  - button "Expand key (15)" [ref=e261] [cursor=pointer]:
                    - img [ref=e262]
                  - treeitem "key (15)" [level=2] [ref=e264] [cursor=pointer]:
                    - img [ref=e265]
                    - generic [ref=e268]: key
                    - generic [ref=e269]: "15"
                  - button "Hide key (15)" [ref=e270] [cursor=pointer]:
                    - img [ref=e271]
                - generic [ref=e275]:
                  - button "Expand controller (1)" [ref=e276] [cursor=pointer]:
                    - img [ref=e277]
                  - treeitem "controller (1)" [level=2] [ref=e279] [cursor=pointer]:
                    - img [ref=e280]
                    - generic [ref=e283]: controller
                    - generic [ref=e284]: "1"
                  - button "Hide controller (1)" [ref=e285] [cursor=pointer]:
                    - img [ref=e286]
                - generic [ref=e290]:
                  - button "Expand power_switch (1)" [ref=e291] [cursor=pointer]:
                    - img [ref=e292]
                  - treeitem "power_switch (1)" [level=2] [ref=e294] [cursor=pointer]:
                    - img [ref=e295]
                    - generic [ref=e298]: power_switch
                    - generic [ref=e299]: "1"
                  - button "Hide power_switch (1)" [ref=e300] [cursor=pointer]:
                    - img [ref=e301]
                - generic [ref=e305]:
                  - button "Expand reset_button (1)" [ref=e306] [cursor=pointer]:
                    - img [ref=e307]
                  - treeitem "reset_button (1)" [level=2] [ref=e309] [cursor=pointer]:
                    - img [ref=e310]
                    - generic [ref=e313]: reset_button
                    - generic [ref=e314]: "1"
                  - button "Hide reset_button (1)" [ref=e315] [cursor=pointer]:
                    - img [ref=e316]
                - generic [ref=e320]:
                  - button "Expand scrollwheel (1)" [ref=e321] [cursor=pointer]:
                    - img [ref=e322]
                  - treeitem "scrollwheel (1)" [level=2] [ref=e324] [cursor=pointer]:
                    - img [ref=e325]
                    - generic [ref=e328]: scrollwheel
                    - generic [ref=e329]: "1"
                  - button "Hide scrollwheel (1)" [ref=e330] [cursor=pointer]:
                    - img [ref=e331]
            - generic [ref=e335]:
              - button "Expand Hardware" [ref=e336] [cursor=pointer]:
                - img [ref=e337]
              - treeitem "Hardware" [level=1] [ref=e339] [cursor=pointer]:
                - img [ref=e340]
                - generic [ref=e342]: Hardware
              - button "Hide Hardware" [ref=e343] [cursor=pointer]:
                - img [ref=e344]
          - group [ref=e347]:
            - generic "Case setup" [ref=e348] [cursor=pointer]
            - navigation "Case tools" [ref=e349]:
              - button "Layout" [ref=e350] [cursor=pointer]
              - button "Manufacturing" [ref=e351] [cursor=pointer]
              - button "Mounting" [ref=e352] [cursor=pointer]
              - button "Enclosure" [ref=e353] [cursor=pointer]
              - button "Components" [ref=e354] [cursor=pointer]
              - button "Hardware" [ref=e355] [cursor=pointer]
              - button "Review" [ref=e356] [cursor=pointer]
        - generic "Contextual inspector" [ref=e357]:
          - button "Close inspector" [ref=e358] [cursor=pointer]
          - heading "Manufacturing" [level=2] [ref=e359]
          - paragraph [ref=e360]: Choose a process for each part. The JLCCNC preset uses depth-dependent tooling. Supplier minimums differ from our case defaults.
          - paragraph [ref=e361]:
            - link "JLCCNC design guidance" [ref=e362] [cursor=pointer]:
              - /url: https://jlccnc.com/help/article/cnc-machining-design-guideline
          - paragraph [ref=e363]: CNC adds corner relief using each part’s cutter diameter when you generate. Required openings stay clear; walls, plate webs, and mounting posts are checked before relief is applied.
          - group "bottom" [ref=e364]:
            - generic [ref=e365]: bottom
            - generic [ref=e366]:
              - generic [ref=e367]: bottom process
              - 'button "Help: bottom process" [ref=e369] [cursor=pointer]': "?"
              - combobox "bottom process" [ref=e370]:
                - option "Choose…"
                - option "fdm"
                - option "cnc" [selected]
            - generic [ref=e371]:
              - generic [ref=e372]: bottom material
              - 'button "Help: bottom material" [ref=e374] [cursor=pointer]': "?"
              - textbox "bottom material" [ref=e375]
            - generic [ref=e376]:
              - generic [ref=e377]: bottom minimum wall (mm)
              - 'button "Help: bottom minimum wall (mm)" [ref=e379] [cursor=pointer]': "?"
              - textbox "bottom minimum wall (mm)" [ref=e380]: "2"
            - generic [ref=e381]:
              - generic [ref=e382]: bottom cutter diameter (mm)
              - 'button "Help: bottom cutter diameter (mm)" [ref=e384] [cursor=pointer]': "?"
              - textbox "bottom cutter diameter (mm)" [ref=e385]: "3"
            - generic [ref=e386]:
              - generic [ref=e387]: bottom usable cutter reach (mm)
              - 'button "Help: bottom usable cutter reach (mm)" [ref=e389] [cursor=pointer]': "?"
              - textbox "bottom usable cutter reach (mm)" [ref=e390]: "25"
            - generic [ref=e391]:
              - generic [ref=e392]: bottom drill diameter (mm)
              - 'button "Help: bottom drill diameter (mm)" [ref=e394] [cursor=pointer]': "?"
              - textbox "bottom drill diameter (mm)" [ref=e395]
            - group "bottom machining setups" [ref=e396]:
              - generic [ref=e397]:
                - text: bottom machining setups
                - 'button "Help: bottom machining setups" [ref=e399] [cursor=pointer]': "?"
              - generic [ref=e401]:
                - checkbox "top" [checked] [ref=e402]
                - text: top
              - generic [ref=e404]:
                - checkbox "bottom" [checked] [ref=e405]
                - text: bottom
              - generic [ref=e407]:
                - checkbox "left" [ref=e408]
                - text: left
              - generic [ref=e410]:
                - checkbox "right" [ref=e411]
                - text: right
              - generic [ref=e413]:
                - checkbox "front" [ref=e414]
                - text: front
              - generic [ref=e416]:
                - checkbox "back" [ref=e417]
                - text: back
            - generic [ref=e418]:
              - generic [ref=e419]: bottom stock X (mm)
              - 'button "Help: bottom stock X (mm)" [ref=e421] [cursor=pointer]': "?"
              - textbox "bottom stock X (mm)" [ref=e422]: "300"
            - generic [ref=e423]:
              - generic [ref=e424]: bottom stock Y (mm)
              - 'button "Help: bottom stock Y (mm)" [ref=e426] [cursor=pointer]': "?"
              - textbox "bottom stock Y (mm)" [ref=e427]: "300"
            - generic [ref=e428]:
              - generic [ref=e429]: bottom stock Z (mm)
              - 'button "Help: bottom stock Z (mm)" [ref=e431] [cursor=pointer]': "?"
              - textbox "bottom stock Z (mm)" [ref=e432]: "30"
            - paragraph [ref=e433]: Setup names refer to the unrotated part. Side openings need an accessible side setup.
          - group "top" [ref=e434]:
            - generic [ref=e435]: top
            - generic [ref=e436]:
              - generic [ref=e437]: top process
              - 'button "Help: top process" [ref=e439] [cursor=pointer]': "?"
              - combobox "top process" [ref=e440]:
                - option "Choose…"
                - option "fdm"
                - option "cnc" [selected]
            - generic [ref=e441]:
              - generic [ref=e442]: top material
              - 'button "Help: top material" [ref=e444] [cursor=pointer]': "?"
              - textbox "top material" [ref=e445]
            - generic [ref=e446]:
              - generic [ref=e447]: top minimum wall (mm)
              - 'button "Help: top minimum wall (mm)" [ref=e449] [cursor=pointer]': "?"
              - textbox "top minimum wall (mm)" [ref=e450]: "2"
            - generic [ref=e451]:
              - generic [ref=e452]: top cutter diameter (mm)
              - 'button "Help: top cutter diameter (mm)" [ref=e454] [cursor=pointer]': "?"
              - textbox "top cutter diameter (mm)" [ref=e455]: "3"
            - generic [ref=e456]:
              - generic [ref=e457]: top usable cutter reach (mm)
              - 'button "Help: top usable cutter reach (mm)" [ref=e459] [cursor=pointer]': "?"
              - textbox "top usable cutter reach (mm)" [ref=e460]: "25"
            - generic [ref=e461]:
              - generic [ref=e462]: top drill diameter (mm)
              - 'button "Help: top drill diameter (mm)" [ref=e464] [cursor=pointer]': "?"
              - textbox "top drill diameter (mm)" [ref=e465]
            - group "top machining setups" [ref=e466]:
              - generic [ref=e467]:
                - text: top machining setups
                - 'button "Help: top machining setups" [ref=e469] [cursor=pointer]': "?"
              - generic [ref=e471]:
                - checkbox "top" [checked] [ref=e472]
                - text: top
              - generic [ref=e474]:
                - checkbox "bottom" [checked] [ref=e475]
                - text: bottom
              - generic [ref=e477]:
                - checkbox "left" [ref=e478]
                - text: left
              - generic [ref=e480]:
                - checkbox "right" [ref=e481]
                - text: right
              - generic [ref=e483]:
                - checkbox "front" [ref=e484]
                - text: front
              - generic [ref=e486]:
                - checkbox "back" [ref=e487]
                - text: back
            - generic [ref=e488]:
              - generic [ref=e489]: top stock X (mm)
              - 'button "Help: top stock X (mm)" [ref=e491] [cursor=pointer]': "?"
              - textbox "top stock X (mm)" [ref=e492]: "300"
            - generic [ref=e493]:
              - generic [ref=e494]: top stock Y (mm)
              - 'button "Help: top stock Y (mm)" [ref=e496] [cursor=pointer]': "?"
              - textbox "top stock Y (mm)" [ref=e497]: "300"
            - generic [ref=e498]:
              - generic [ref=e499]: top stock Z (mm)
              - 'button "Help: top stock Z (mm)" [ref=e501] [cursor=pointer]': "?"
              - textbox "top stock Z (mm)" [ref=e502]: "30"
            - paragraph [ref=e503]: Setup names refer to the unrotated part. Side openings need an accessible side setup.
          - group "plate" [ref=e504]:
            - generic [ref=e505]: plate
            - generic [ref=e506]:
              - generic [ref=e507]: plate process
              - 'button "Help: plate process" [ref=e509] [cursor=pointer]': "?"
              - combobox "plate process" [ref=e510]:
                - option "Choose…"
                - option "fdm"
                - option "cnc" [selected]
            - generic [ref=e511]:
              - generic [ref=e512]: plate material
              - 'button "Help: plate material" [ref=e514] [cursor=pointer]': "?"
              - textbox "plate material" [ref=e515]
            - generic [ref=e516]:
              - generic [ref=e517]: plate minimum wall (mm)
              - 'button "Help: plate minimum wall (mm)" [ref=e519] [cursor=pointer]': "?"
              - textbox "plate minimum wall (mm)" [ref=e520]: "0.8"
            - generic [ref=e521]:
              - generic [ref=e522]: plate cutter diameter (mm)
              - 'button "Help: plate cutter diameter (mm)" [ref=e524] [cursor=pointer]': "?"
              - textbox "plate cutter diameter (mm)" [ref=e525]: "1"
            - generic [ref=e526]:
              - generic [ref=e527]: plate usable cutter reach (mm)
              - 'button "Help: plate usable cutter reach (mm)" [ref=e529] [cursor=pointer]': "?"
              - textbox "plate usable cutter reach (mm)" [ref=e530]: "25"
            - generic [ref=e531]:
              - generic [ref=e532]: plate drill diameter (mm)
              - 'button "Help: plate drill diameter (mm)" [ref=e534] [cursor=pointer]': "?"
              - textbox "plate drill diameter (mm)" [ref=e535]
            - group "plate machining setups" [ref=e536]:
              - generic [ref=e537]:
                - text: plate machining setups
                - 'button "Help: plate machining setups" [ref=e539] [cursor=pointer]': "?"
              - generic [ref=e541]:
                - checkbox "top" [checked] [ref=e542]
                - text: top
              - generic [ref=e544]:
                - checkbox "bottom" [checked] [ref=e545]
                - text: bottom
              - generic [ref=e547]:
                - checkbox "left" [ref=e548]
                - text: left
              - generic [ref=e550]:
                - checkbox "right" [ref=e551]
                - text: right
              - generic [ref=e553]:
                - checkbox "front" [ref=e554]
                - text: front
              - generic [ref=e556]:
                - checkbox "back" [ref=e557]
                - text: back
            - generic [ref=e558]:
              - generic [ref=e559]: plate stock X (mm)
              - 'button "Help: plate stock X (mm)" [ref=e561] [cursor=pointer]': "?"
              - textbox "plate stock X (mm)" [ref=e562]: "300"
            - generic [ref=e563]:
              - generic [ref=e564]: plate stock Y (mm)
              - 'button "Help: plate stock Y (mm)" [ref=e566] [cursor=pointer]': "?"
              - textbox "plate stock Y (mm)" [ref=e567]: "300"
            - generic [ref=e568]:
              - generic [ref=e569]: plate stock Z (mm)
              - 'button "Help: plate stock Z (mm)" [ref=e571] [cursor=pointer]': "?"
              - textbox "plate stock Z (mm)" [ref=e572]: "30"
            - paragraph [ref=e573]: Setup names refer to the unrotated part. Side openings need an accessible side setup.
        - generic [ref=e574]:
          - generic [ref=e575]:
            - button "plan" [pressed] [ref=e576] [cursor=pointer]: 2D
            - button "assembled" [ref=e577] [cursor=pointer]
            - button "exploded" [ref=e578] [cursor=pointer]
            - button "section" [ref=e579] [cursor=pointer]
            - button "part" [ref=e580] [cursor=pointer]
            - generic [ref=e581]: bhk · bottom
          - status [ref=e582]: Updating geometry…
          - generic [ref=e583]:
            - generic [ref=e584]:
              - strong [ref=e585]: Mounting plan
              - 'button "Help: Mounting system" [ref=e587] [cursor=pointer]': "?"
              - button "Select" [pressed] [ref=e588] [cursor=pointer]
              - button "Add gasket" [ref=e589] [cursor=pointer]
              - button "Add mount" [ref=e590] [cursor=pointer]
              - button "Pan" [ref=e591] [cursor=pointer]
              - button "Zoom in mounting plan" [ref=e592] [cursor=pointer]: +
              - button "Zoom out mounting plan" [ref=e593] [cursor=pointer]: −
              - button "Fit plan" [ref=e594] [cursor=pointer]
            - paragraph [ref=e595]: Drag contacts; scroll or pinch to zoom. Use Pan to move the view.
            - paragraph [ref=e596]: Outline · PCB · switch openings · mounting features — 193.4 × 154.4 mm
            - img "Interactive mounting plan" [ref=e597]
      - generic [ref=e750]:
        - status [ref=e751]: Generating… · 39 components · PCB 1.6 mm
        - button "Review 0 blockers · 5 checks" [ref=e752] [cursor=pointer]
        - button "Cancel generation" [ref=e753] [cursor=pointer]
```

# Test source

```ts
  1   | import { studio, openCase, openExport, readSource } from './utils/studio';
  2   | import { parse } from 'yaml';
  3   | import { test, expect, Page } from '@playwright/test';
  4   | import { readFileSync } from 'node:fs';
  5   | import JSZip from 'jszip';
  6   | import gasketCase from './fixtures/gasket-case';
  7   | import BHKLayout from '../src/examples/bhk';
  8   | 
  9   | import source from './fixtures/native-grid';
  10  | const GEOMETRY_TIMEOUT = 90000;
  11  | const saved = readSource;
  12  | const load = async (page: Page, config: string) => {
  13  |   await page.addInitScript((config) => {
  14  |     const preview = location.pathname.startsWith('/ergogen-gui-preview/');
  15  |     localStorage.setItem(
  16  |       preview ? 'preview:ergogen:config' : 'ergogen:config',
  17  |       JSON.stringify(config)
  18  |     );
  19  |     if (preview) {
  20  |       localStorage.setItem('ergogen:config', 'production-sentinel');
  21  |     }
  22  |   }, config);
  23  |   await page.goto('./');
  24  |   await expect(studio(page)).toBeVisible();
  25  |   await page.evaluate(() => navigator.serviceWorker.ready);
  26  | };
  27  | const open = async (page: Page) => {
  28  |   await openCase(page);
  29  |   return page.getByRole('region', { name: 'Case designer' });
  30  | };
  31  | const choose = async (page: Page) => {
  32  |   const dialog = page.getByRole('region', { name: 'Case designer' });
  33  |   await dialog.getByRole('button', { name: 'Layout', exact: true }).click();
  34  |   if (await dialog.getByLabel('Switch family', { exact: true }).count()) {
  35  |     await dialog
  36  |       .getByLabel('Switch family', { exact: true })
  37  |       .selectOption('mx');
  38  |   }
  39  |   await dialog
  40  |     .getByLabel('Mounting system', { exact: true })
  41  |     .selectOption('gasket');
  42  |   await expect(
  43  |     dialog.getByRole('button', { name: /^gasket gasket_/ }).first()
  44  |   ).toBeVisible({ timeout: 30000 });
  45  | };
  46  | const ready = async (page: Page) => {
  47  |   const dialog = page.getByRole('region', { name: 'Case designer' });
  48  |   await expect(
  49  |     page.getByRole('button', { name: 'Generate project', exact: true })
  50  |   ).toBeEnabled({ timeout: GEOMETRY_TIMEOUT });
  51  |   await page
  52  |     .getByRole('button', { name: 'Generate project', exact: true })
  53  |     .click();
  54  |   await expect(
  55  |     dialog.getByRole('status').filter({ hasText: /Current geometry/ })
> 56  |   ).toBeVisible({ timeout: GEOMETRY_TIMEOUT });
      |     ^ Error: expect(locator).toBeVisible() failed
  57  |   await expect(dialog.getByRole('alert')).toHaveCount(0);
  58  |   await dialog.getByRole('button', { name: 'assembled', exact: true }).click();
  59  |   await expect(dialog.getByLabel('3D assembly preview')).toHaveAttribute(
  60  |     'data-rendered',
  61  |     'true'
  62  |   );
  63  | };
  64  | 
  65  | test.setTimeout(180000);
  66  | 
  67  | test('autosaves gasket case edits, restores them with undo and exports solids', async ({
  68  |   page,
  69  | }) => {
  70  |   await load(page, source);
  71  |   let dialog = await open(page);
  72  |   await choose(page);
  73  |   const original = await saved(page);
  74  |   await dialog.getByRole('button', { name: 'Enclosure', exact: true }).click();
  75  |   await dialog.getByLabel('Wall thickness (mm)', { exact: true }).fill('4');
  76  |   await dialog.getByLabel('Wall thickness (mm)', { exact: true }).press('Tab');
  77  |   await page
  78  |     .getByRole('navigation', { name: 'Design workflow' })
  79  |     .getByRole('button', { name: 'Design', exact: true })
  80  |     .click();
  81  |   expect(parse(await saved(page)).designs.assemblies.case.wall).toBe(4);
  82  |   await page.getByRole('button', { name: 'Undo project edit' }).click();
  83  |   await expect.poll(() => saved(page)).toBe(original);
  84  | 
  85  |   dialog = await open(page);
  86  |   await choose(page);
  87  |   await dialog
  88  |     .getByRole('button', { name: 'Manufacturing', exact: true })
  89  |     .click();
  90  |   for (const part of ['bottom', 'top', 'plate']) {
  91  |     await dialog
  92  |       .getByLabel(`${part} process`, { exact: true })
  93  |       .selectOption('fdm');
  94  |   }
  95  |   await ready(page);
  96  |   await dialog.getByRole('button', { name: 'section', exact: true }).click();
  97  |   await dialog
  98  |     .locator('summary')
  99  |     .filter({ hasText: 'Preview displacement' })
  100 |     .click();
  101 |   await dialog.getByLabel('Suspension travel').fill('0.1');
  102 |   await dialog.getByLabel('Lateral travel').fill('0.05');
  103 |   await dialog.getByRole('button', { name: 'Review', exact: true }).click();
  104 |   const exportView = await openExport(page);
  105 |   await exportView
  106 |     .getByRole('checkbox', { name: /I reviewed dimensions/ })
  107 |     .check();
  108 |   await expect(
  109 |     exportView.getByRole('button', { name: 'Download case ZIP' })
  110 |   ).toBeEnabled({ timeout: 90000 });
  111 |   const downloading = page.waitForEvent('download');
  112 |   await exportView.getByRole('button', { name: 'Download case ZIP' }).click();
  113 |   const download = await downloading;
  114 |   const zip = await JSZip.loadAsync(readFileSync((await download.path())!));
  115 |   const names = Object.keys(zip.files);
  116 |   const assembly = names.find((name) => name.endsWith('/case_assembly.step'));
  117 |   expect(assembly).toBeTruthy();
  118 |   expect(await zip.file(assembly!)!.async('string')).toContain(
  119 |     'MANIFOLD_SOLID_BREP'
  120 |   );
  121 |   expect(names.some((name) => name.endsWith('/case_plate.dxf'))).toBe(true);
  122 |   await page
  123 |     .getByRole('navigation', { name: 'Design workflow' })
  124 |     .getByRole('button', { name: 'Design', exact: true })
  125 |     .click();
  126 |   await expect(dialog).not.toBeVisible();
  127 |   expect(await saved(page)).toContain('# Keep the original layout');
  128 |   expect(parse(await saved(page)).designs.assemblies.case.mounting).toBe(
  129 |     'gasket'
  130 |   );
  131 | });
  132 | 
  133 | test('reopens a gasket enclosure offline without touching production storage', async ({
  134 |   page,
  135 |   context,
  136 | }) => {
  137 |   await load(page, gasketCase);
  138 |   let dialog = await open(page);
  139 |   await ready(page);
  140 |   await dialog.getByRole('button', { name: 'section', exact: true }).click();
  141 |   await page.screenshot({
  142 |     path: 'test-results/gasket-enclosure-section.png',
  143 |     fullPage: true,
  144 |   });
  145 |   await dialog.getByRole('button', { name: 'part', exact: true }).click();
  146 |   await dialog.getByRole('button', { name: 'bottom', exact: true }).click();
  147 |   await page.screenshot({
  148 |     path: 'test-results/gasket-enclosure-bottom.png',
  149 |     fullPage: true,
  150 |   });
  151 |   await page
  152 |     .getByRole('navigation', { name: 'Design workflow' })
  153 |     .getByRole('button', { name: 'Design', exact: true })
  154 |     .click();
  155 |   await page.waitForFunction(async () => {
  156 |     const keys = await caches.keys();
```
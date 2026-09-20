# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout-units.spec.ts >> sets up an empty board, edits stagger, inserts and aligns an encoder
- Location: e2e/layout-units.spec.ts:14:5

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'New native design', exact: true })

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
        - button "Keyboard" [ref=e38] [cursor=pointer]:
          - img [ref=e39]
          - generic [ref=e42]: Keyboard
        - generic [ref=e43]:
          - button "Rename configuration Keyboard" [ref=e44] [cursor=pointer]:
            - img [ref=e45]
          - button "Duplicate configuration Keyboard" [ref=e48] [cursor=pointer]:
            - img [ref=e49]
          - button "Delete configuration Keyboard" [ref=e52] [cursor=pointer]:
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
      - heading "Board Studio / Keyboard" [level=1] [ref=e84]
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
        - button "Inspector" [ref=e136] [cursor=pointer]:
          - img [ref=e137]
          - text: Inspector
        - button "Part library" [ref=e138] [cursor=pointer]:
          - img [ref=e139]
          - text: Part library
    - main [ref=e145]:
      - generic "Outline controls" [ref=e146]:
        - generic [ref=e147]:
          - checkbox "Automatic outline" [checked] [ref=e148]
          - text: Automatic outline
      - generic [ref=e149]:
        - toolbar "Canvas tools" [ref=e150]:
          - generic [ref=e151]:
            - button "Select Objects" [ref=e152] [cursor=pointer]:
              - img [ref=e153]
            - button "Select Columns" [ref=e155] [cursor=pointer]:
              - img [ref=e156]
            - button "Select Rows" [ref=e158] [cursor=pointer]:
              - img [ref=e159]
            - button "Select Matrices" [pressed] [ref=e161] [cursor=pointer]:
              - img [ref=e162]
            - button "Pan" [ref=e164] [cursor=pointer]:
              - img [ref=e165]
          - toolbar "Snapping" [ref=e170]:
            - button "Snapping" [pressed] [ref=e171] [cursor=pointer]:
              - img [ref=e172]
            - button "Snapping settings" [ref=e176] [cursor=pointer]:
              - img [ref=e177]
            - region [ref=e179]:
              - generic [ref=e180]:
                - strong [ref=e181]: Snapping
                - button [ref=e182] [cursor=pointer]:
                  - img [ref=e183]
              - group [ref=e186]:
                - button [ref=e187] [cursor=pointer]: 1u
                - button [ref=e188] [cursor=pointer]: ½u
                - button [pressed] [ref=e189] [cursor=pointer]: ¼u
                - button [ref=e190] [cursor=pointer]: ⅛u
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - checkbox [checked] [ref=e193]
                  - text: Grid
                - generic [ref=e194]:
                  - checkbox [checked] [ref=e195]
                  - text: Centers
                - generic [ref=e196]:
                  - checkbox [ref=e197]
                  - text: Origins
                - generic [ref=e198]:
                  - checkbox [checked] [ref=e199]
                  - text: Edges
              - generic [ref=e200]:
                - text: Increment · mm
                - spinbutton [ref=e201]
              - generic [ref=e202]:
                - text: Edge gap · mm
                - spinbutton [ref=e203]: "2"
              - group [ref=e204]:
                - generic [ref=e205] [cursor=pointer]: Alt bypasses snapping · Help
          - button "Delete selection" [ref=e206] [cursor=pointer]:
            - img [ref=e207]
        - toolbar "View controls" [ref=e210]:
          - button "Side" [ref=e211] [cursor=pointer]
          - button "Fit layout" [ref=e212] [cursor=pointer]:
            - img [ref=e213]
          - button "Zoom out" [ref=e218] [cursor=pointer]:
            - img [ref=e219]
          - generic [ref=e220]: 100%
          - button "Zoom in" [ref=e221] [cursor=pointer]:
            - img [ref=e222]
        - group "Interactive board layout" [ref=e223]:
          - button "Select fingers_c1_r1" [pressed] [ref=e225]
          - button "Select fingers_c1_r1_diode" [pressed] [ref=e228]
          - button "Select fingers_c1_r2" [pressed] [ref=e231]
          - button "Select fingers_c1_r2_diode" [pressed] [ref=e234]
          - button "Select fingers_c1_r3" [pressed] [ref=e237]
          - button "Select fingers_c1_r3_diode" [pressed] [ref=e240]
          - button "Select fingers_c1_r4" [pressed] [ref=e243]
          - button "Select fingers_c1_r4_diode" [pressed] [ref=e246]
          - button "Select fingers_c2_r1" [pressed] [ref=e249]
          - button "Select fingers_c2_r1_diode" [pressed] [ref=e252]
          - button "Select fingers_c2_r2" [pressed] [ref=e255]
          - button "Select fingers_c2_r2_diode" [pressed] [ref=e258]
          - button "Select fingers_c2_r3" [pressed] [ref=e261]
          - button "Select fingers_c2_r3_diode" [pressed] [ref=e264]
          - button "Select fingers_c2_r4" [pressed] [ref=e267]
          - button "Select fingers_c2_r4_diode" [pressed] [ref=e270]
          - button "Select fingers_c3_r1" [pressed] [ref=e273]
          - button "Select fingers_c3_r1_diode" [pressed] [ref=e276]
          - button "Select fingers_c3_r2" [pressed] [ref=e279]
          - button "Select fingers_c3_r2_diode" [pressed] [ref=e282]
          - button "Select fingers_c3_r3" [pressed] [ref=e285]
          - button "Select fingers_c3_r3_diode" [pressed] [ref=e288]
          - button "Select fingers_c3_r4" [pressed] [ref=e291]
          - button "Select fingers_c3_r4_diode" [pressed] [ref=e294]
          - button "Select fingers_c4_r1" [pressed] [ref=e297]
          - button "Select fingers_c4_r1_diode" [pressed] [ref=e300]
          - button "Select fingers_c4_r2" [pressed] [ref=e303]
          - button "Select fingers_c4_r2_diode" [pressed] [ref=e306]
          - button "Select fingers_c4_r3" [pressed] [ref=e309]
          - button "Select fingers_c4_r3_diode" [pressed] [ref=e312]
          - button "Select fingers_c4_r4" [pressed] [ref=e315]
          - button "Select fingers_c4_r4_diode" [pressed] [ref=e318]
          - button "Select fingers_c5_r1" [pressed] [ref=e321]
          - button "Select fingers_c5_r1_diode" [pressed] [ref=e324]
          - button "Select fingers_c5_r2" [pressed] [ref=e327]
          - button "Select fingers_c5_r2_diode" [pressed] [ref=e330]
          - button "Select fingers_c5_r3" [pressed] [ref=e333]
          - button "Select fingers_c5_r3_diode" [pressed] [ref=e336]
          - button "Select fingers_c5_r4" [pressed] [ref=e339]
          - button "Select fingers_c5_r4_diode" [pressed] [ref=e342]
    - status "Project status" [ref=e345]:
      - generic [ref=e346]: Layout positions current · 20 keys
      - button "Review 2 blockers" [ref=e347] [cursor=pointer]
```

# Test source

```ts
  1   | import { readFile } from 'node:fs/promises';
  2   | import JSZip from 'jszip';
  3   | import { test, expect } from '@playwright/test';
  4   | import { parse } from 'yaml';
  5   | import { readSource, studio, openInspector, openExport } from './utils/studio';
  6   | import { createBoard } from '../src/utils/boardDefaults';
  7   | import { addCluster, setValue } from '../src/utils/studioSource';
  8   | import { defaultSetup } from '../src/utils/designSetup';
  9   | import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
  10  | 
  11  | test.setTimeout(120000);
  12  | const capture = (name: string) => `docs/design-qa/layout-usability/${name}.png`;
  13  | 
  14  | test('sets up an empty board, edits stagger, inserts and aligns an encoder', async ({
  15  |   page,
  16  | }) => {
  17  |   const errors: string[] = [];
  18  |   page.on('pageerror', (error) => errors.push(error.message));
  19  |   await page.setViewportSize({ width: 1440, height: 1000 });
  20  |   await page.goto('./new');
  21  |   await page
  22  |     .getByRole('button', { name: 'New native design', exact: true })
> 23  |     .click();
      |      ^ Error: locator.click: Test timeout of 120000ms exceeded.
  24  |   await expect(
  25  |     page.getByRole('region', { name: 'Design setup panel' })
  26  |   ).toBeVisible();
  27  |   await expect(
  28  |     page.getByRole('group', { name: 'Interactive board layout' })
  29  |   ).toBeVisible();
  30  |   await page.getByLabel('Horizontal pitch', { exact: true }).fill('19');
  31  |   await page.getByLabel('Horizontal pitch', { exact: true }).press('Enter');
  32  |   await page.getByLabel('Vertical pitch', { exact: true }).fill('17');
  33  |   await page.getByLabel('Vertical pitch', { exact: true }).press('Enter');
  34  |   await expect(
  35  |     page.getByRole('status').filter({ hasText: 'Layout resolved' })
  36  |   ).toBeVisible();
  37  |   await page.screenshot({ path: capture('desktop-setup') });
  38  |   await page.getByRole('tab', { name: 'Key assembly', exact: true }).click();
  39  |   await expect(
  40  |     page
  41  |       .getByRole('img', { name: 'Key assembly footprint editor' })
  42  |       .locator('polygon')
  43  |       .first()
  44  |   ).toBeVisible();
  45  |   await page.screenshot({ path: capture('desktop-assembly') });
  46  |   await page
  47  |     .getByRole('button', { name: 'Generate sample', exact: true })
  48  |     .click();
  49  |   const sample = page.getByRole('button', { name: 'Download KiCad sample' });
  50  |   await expect(sample).toBeEnabled({ timeout: 60000 });
  51  |   const downloaded = page.waitForEvent('download');
  52  |   await sample.click();
  53  |   await (await downloaded).saveAs('/tmp/layout-usability-pcb-sample.zip');
  54  |   await page.getByRole('tab', { name: 'Stackup', exact: true }).click();
  55  |   await page.getByRole('button', { name: 'Plate foam', exact: true }).click();
  56  |   await expect(page.getByText(/2.4 mm remaining space/)).toBeVisible();
  57  |   await page.screenshot({ path: capture('desktop-stack') });
  58  |   await page.getByRole('button', { name: 'Apply setup', exact: true }).click();
  59  |   await expect(
  60  |     page.getByRole('region', { name: 'Design setup panel' })
  61  |   ).toBeHidden();
  62  |   let data = parse(await readSource(page));
  63  |   expect(data.layout.objects).toEqual({});
  64  |   expect(data.units).toMatchObject({ u: 19, v: 17 });
  65  |   await page.getByRole('button', { name: 'Add matrix', exact: true }).click();
  66  |   await page.getByLabel('New item name').fill('fingers');
  67  |   await page.getByLabel('New matrix columns').fill('3');
  68  |   await page.getByLabel('New matrix rows').fill('2');
  69  |   await page.getByRole('button', { name: 'Create', exact: true }).click();
  70  |   const key = page.locator('[data-object="fingers_c2_r1"]');
  71  |   await expect(key).toBeVisible({ timeout: 60000 });
  72  |   await page
  73  |     .getByRole('button', { name: 'Select Columns', exact: true })
  74  |     .click();
  75  |   await key.click();
  76  |   const stagger = page.getByLabel('Column stagger', { exact: true });
  77  |   await expect(stagger).toBeVisible();
  78  |   await stagger.fill('0.5v');
  79  |   await stagger.press('Enter');
  80  |   await expect
  81  |     .poll(
  82  |       async () =>
  83  |         parse(await readSource(page)).layout.clusters.fingers.arrangement
  84  |           .stagger.c2
  85  |     )
  86  |     .toBe('0.5v');
  87  |   await page
  88  |     .getByRole('button', { name: 'Snap increment 0.125u', exact: true })
  89  |     .click();
  90  |   await page
  91  |     .getByRole('button', { name: 'Increase Column stagger', exact: true })
  92  |     .click();
  93  |   await expect
  94  |     .poll(
  95  |       async () =>
  96  |         parse(await readSource(page)).layout.clusters.fingers.arrangement
  97  |           .stagger.c2
  98  |     )
  99  |     .toBe('(0.5v) + 0.125v');
  100 |   await expect(
  101 |     page.getByRole('status').filter({ hasText: 'Layout resolved' })
  102 |   ).toBeVisible();
  103 |   await page.screenshot({ path: capture('desktop-stagger') });
  104 |   const panel = await openInspector(page);
  105 |   await panel.getByRole('button', { name: 'Add', exact: true }).click();
  106 |   await page.getByLabel('New item kind').selectOption('component');
  107 |   await page.getByLabel('Component catalogue').selectOption('encoder');
  108 |   await page.getByLabel('New item name').fill('encoder');
  109 |   await page.getByRole('button', { name: 'Create', exact: true }).click();
  110 |   await expect(page.locator('[data-object="encoder"]')).toBeVisible({
  111 |     timeout: 60000,
  112 |   });
  113 |   await page
  114 |     .getByRole('button', { name: 'Align vertically', exact: true })
  115 |     .click();
  116 |   await page
  117 |     .getByRole('button', { name: 'Align to Column 2 · fingers', exact: true })
  118 |     .click();
  119 |   await expect
  120 |     .poll(
  121 |       async () =>
  122 |         Object.values(parse(await readSource(page)).layout.constraints || {})
  123 |           .length
```
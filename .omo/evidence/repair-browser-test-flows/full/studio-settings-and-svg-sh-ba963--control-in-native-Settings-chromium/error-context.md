# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-settings-and-svg.spec.ts >> shows the Offline App control in native Settings
- Location: e2e/studio-settings-and-svg.spec.ts:5:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Project settings' }).getByText('Offline App', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Project settings' }).getByText('Offline App', { exact: true })

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
    - dialog "Project settings" [ref=e80]:
      - generic [ref=e81]:
        - heading "Settings" [level=2] [ref=e82]
        - button "Close settings" [active] [ref=e84] [cursor=pointer]
      - paragraph [ref=e85]: Layout updates automatically. Generate builds 3D outputs.
      - heading "Privacy" [level=4] [ref=e86]
      - generic [ref=e88]:
        - generic [ref=e89] [cursor=pointer]:
          - generic [ref=e90]: Send Usage Metrics
          - generic [ref=e91]: Help improve Board Studio by sharing anonymous usage statistics.
        - checkbox "Send usage metrics" [checked] [ref=e94]
      - group [ref=e97]:
        - generic "Advanced libraries" [ref=e98] [cursor=pointer]
    - generic [ref=e99]:
      - button "Projects" [ref=e100] [cursor=pointer]:
        - img [ref=e101]
      - heading "Board Studio / Keyboard" [level=1] [ref=e103]
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
        - button "Undo project edit" [disabled] [ref=e147]:
          - img [ref=e148]
        - button "Redo project edit" [disabled] [ref=e151]:
          - img [ref=e152]
        - button "Inspector" [ref=e155] [cursor=pointer]:
          - img [ref=e156]
          - text: Inspector
        - button "Part library" [ref=e157] [cursor=pointer]:
          - img [ref=e158]
          - text: Part library
    - main [ref=e164]:
      - generic "Outline controls" [ref=e165]:
        - generic [ref=e166]:
          - checkbox "Automatic outline" [checked] [ref=e167]
          - text: Automatic outline
      - generic [ref=e168]:
        - toolbar "Canvas tools" [ref=e169]:
          - generic [ref=e170]:
            - button "Select Objects" [ref=e171] [cursor=pointer]:
              - img [ref=e172]
            - button "Select Columns" [ref=e174] [cursor=pointer]:
              - img [ref=e175]
            - button "Select Rows" [ref=e177] [cursor=pointer]:
              - img [ref=e178]
            - button "Select Matrices" [pressed] [ref=e180] [cursor=pointer]:
              - img [ref=e181]
            - button "Pan" [ref=e183] [cursor=pointer]:
              - img [ref=e184]
          - toolbar "Snapping" [ref=e189]:
            - button "Snapping" [pressed] [ref=e190] [cursor=pointer]:
              - img [ref=e191]
            - button "Snapping settings" [ref=e195] [cursor=pointer]:
              - img [ref=e196]
            - region [ref=e198]:
              - generic [ref=e199]:
                - strong [ref=e200]: Snapping
                - button [ref=e201] [cursor=pointer]:
                  - img [ref=e202]
              - group [ref=e205]:
                - button [ref=e206] [cursor=pointer]: 1u
                - button [ref=e207] [cursor=pointer]: ½u
                - button [pressed] [ref=e208] [cursor=pointer]: ¼u
                - button [ref=e209] [cursor=pointer]: ⅛u
              - generic [ref=e210]:
                - generic [ref=e211]:
                  - checkbox [checked] [ref=e212]
                  - text: Grid
                - generic [ref=e213]:
                  - checkbox [checked] [ref=e214]
                  - text: Centers
                - generic [ref=e215]:
                  - checkbox [ref=e216]
                  - text: Origins
                - generic [ref=e217]:
                  - checkbox [checked] [ref=e218]
                  - text: Edges
              - generic [ref=e219]:
                - text: Increment · mm
                - spinbutton [ref=e220]
              - generic [ref=e221]:
                - text: Edge gap · mm
                - spinbutton [ref=e222]: "2"
              - group [ref=e223]:
                - generic [ref=e224] [cursor=pointer]: Alt bypasses snapping · Help
          - button "Delete selection" [ref=e225] [cursor=pointer]:
            - img [ref=e226]
        - toolbar "View controls" [ref=e229]:
          - button "Side" [ref=e230] [cursor=pointer]
          - button "Fit layout" [ref=e231] [cursor=pointer]:
            - img [ref=e232]
          - button "Zoom out" [ref=e237] [cursor=pointer]:
            - img [ref=e238]
          - generic [ref=e239]: 100%
          - button "Zoom in" [ref=e240] [cursor=pointer]:
            - img [ref=e241]
        - group "Interactive board layout" [ref=e242]:
          - button "Select fingers_c1_r1" [pressed] [ref=e244]
          - button "Select fingers_c1_r1_diode" [pressed] [ref=e247]
          - button "Select fingers_c1_r2" [pressed] [ref=e250]
          - button "Select fingers_c1_r2_diode" [pressed] [ref=e253]
          - button "Select fingers_c1_r3" [pressed] [ref=e256]
          - button "Select fingers_c1_r3_diode" [pressed] [ref=e259]
          - button "Select fingers_c1_r4" [pressed] [ref=e262]
          - button "Select fingers_c1_r4_diode" [pressed] [ref=e265]
          - button "Select fingers_c2_r1" [pressed] [ref=e268]
          - button "Select fingers_c2_r1_diode" [pressed] [ref=e271]
          - button "Select fingers_c2_r2" [pressed] [ref=e274]
          - button "Select fingers_c2_r2_diode" [pressed] [ref=e277]
          - button "Select fingers_c2_r3" [pressed] [ref=e280]
          - button "Select fingers_c2_r3_diode" [pressed] [ref=e283]
          - button "Select fingers_c2_r4" [pressed] [ref=e286]
          - button "Select fingers_c2_r4_diode" [pressed] [ref=e289]
          - button "Select fingers_c3_r1" [pressed] [ref=e292]
          - button "Select fingers_c3_r1_diode" [pressed] [ref=e295]
          - button "Select fingers_c3_r2" [pressed] [ref=e298]
          - button "Select fingers_c3_r2_diode" [pressed] [ref=e301]
          - button "Select fingers_c3_r3" [pressed] [ref=e304]
          - button "Select fingers_c3_r3_diode" [pressed] [ref=e307]
          - button "Select fingers_c3_r4" [pressed] [ref=e310]
          - button "Select fingers_c3_r4_diode" [pressed] [ref=e313]
          - button "Select fingers_c4_r1" [pressed] [ref=e316]
          - button "Select fingers_c4_r1_diode" [pressed] [ref=e319]
          - button "Select fingers_c4_r2" [pressed] [ref=e322]
          - button "Select fingers_c4_r2_diode" [pressed] [ref=e325]
          - button "Select fingers_c4_r3" [pressed] [ref=e328]
          - button "Select fingers_c4_r3_diode" [pressed] [ref=e331]
          - button "Select fingers_c4_r4" [pressed] [ref=e334]
          - button "Select fingers_c4_r4_diode" [pressed] [ref=e337]
          - button "Select fingers_c5_r1" [pressed] [ref=e340]
          - button "Select fingers_c5_r1_diode" [pressed] [ref=e343]
          - button "Select fingers_c5_r2" [pressed] [ref=e346]
          - button "Select fingers_c5_r2_diode" [pressed] [ref=e349]
          - button "Select fingers_c5_r3" [pressed] [ref=e352]
          - button "Select fingers_c5_r3_diode" [pressed] [ref=e355]
          - button "Select fingers_c5_r4" [pressed] [ref=e358]
          - button "Select fingers_c5_r4_diode" [pressed] [ref=e361]
    - status "Project status" [ref=e364]:
      - generic [ref=e365]: Layout positions current · 20 keys
      - button "Review 2 blockers" [ref=e366] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { createDraft, openExport } from './utils/studio';
  3  | import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
  4  |
  5  | test('shows the Offline App control in native Settings', async ({ page }) => {
  6  |   await page.goto('./new');
  7  |   await createDraft(page);
  8  |   await page.getByRole('button', { name: 'Settings', exact: true }).click();
  9  |
  10 |   const settings = page.getByRole('dialog', { name: 'Project settings' });
  11 |   await expect(settings).toBeVisible();
  12 |   await expect(
  13 |     settings.getByText('Offline App', { exact: true })
> 14 |   ).toBeVisible();
     |     ^ Error: expect(locator).toBeVisible() failed
  15 |   await expect(
  16 |     settings.locator(
  17 |       '[data-testid="pwa-unavailable-button"], [data-testid="pwa-install-button"], [data-testid="pwa-installed-button"]'
  18 |     )
  19 |   ).toHaveCount(1);
  20 | });
  21 |
  22 | test('uploads an SVG outline and generates its output', async ({ page }) => {
  23 |   await page.addInitScript(
  24 |     ({ key }) => {
  25 |       localStorage.setItem(
  26 |         key,
  27 |         'schema: ergogen/v1\nlayout: {}\ndesigns:\n  regions:\n    svg:\n      outline: uploaded_outline\n  profiles:\n    board:\n      from: regions.svg\n'
  28 |       );
  29 |     },
  30 |     { key: CONFIG_LOCAL_STORAGE_KEY }
  31 |   );
  32 |   await page.goto('./');
  33 |   await page.getByRole('button', { name: 'Settings', exact: true }).click();
  34 |
  35 |   await page.getByText('Advanced libraries', { exact: true }).click();
  36 |   const library = page.getByRole('dialog', { name: 'Project settings' });
  37 |   await library.getByTestId('tab-outlines').click();
  38 |   const chooser = page.waitForEvent('filechooser');
  39 |   await library.getByTestId('load-outline-files').click();
  40 |   await (
  41 |     await chooser
  42 |   ).setFiles({
  43 |     name: 'uploaded_outline.svg',
  44 |     mimeType: 'image/svg+xml',
  45 |     buffer: Buffer.from(
  46 |       '<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 10 0 L 10 10 Z"/></svg>'
  47 |     ),
  48 |   });
  49 |
  50 |   await expect(
  51 |     library.getByText('uploaded_outline', { exact: true })
  52 |   ).toBeVisible();
  53 |   await page.getByRole('button', { name: 'Close settings' }).click();
  54 |   await openExport(page);
  55 |   await expect(
  56 |     page.getByRole('button', { name: 'uploaded_outline · SVG', exact: true })
  57 |   ).toBeEnabled();
  58 |   await expect(
  59 |     page.getByRole('button', { name: 'Download PCB and outlines ZIP' })
  60 |   ).toBeEnabled();
  61 | });
  62 |
```
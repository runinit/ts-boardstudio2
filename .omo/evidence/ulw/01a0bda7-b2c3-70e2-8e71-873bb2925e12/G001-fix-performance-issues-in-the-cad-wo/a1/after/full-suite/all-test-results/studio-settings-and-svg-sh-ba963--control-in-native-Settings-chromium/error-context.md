# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-settings-and-svg.spec.ts >> shows the Offline App control in native Settings
- Location: e2e/studio-settings-and-svg.spec.ts:5:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
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
  1   | import { expect, Page } from '@playwright/test';
  2   | 
  3   | export const studio = (page: Page) =>
  4   |   page.getByRole('region', { name: 'Board Studio' });
  5   | 
  6   | export async function openCode(page: Page) {
  7   |   await expect(studio(page)).toBeVisible();
  8   |   if (!(await page.getByLabel('Project YAML', { exact: true }).count())) {
  9   |     await page.getByRole('button', { name: 'Code', exact: true }).click();
  10  |   }
  11  |   await expect(page.getByLabel('Project YAML', { exact: true })).toBeVisible();
  12  |   await page.waitForFunction(
  13  |     () =>
  14  |       !!(
  15  |         window as Window & { monaco?: { editor: { getModels(): unknown[] } } }
  16  |       ).monaco?.editor.getModels().length
  17  |   );
  18  | }
  19  | 
  20  | // Inspect the portable saved source, including edits made while Code is closed.
  21  | export const readSource = (page: Page): Promise<string> =>
  22  |   page.evaluate(() => {
  23  |     const prefix = location.pathname.startsWith('/ergogen-gui-preview/')
  24  |       ? 'preview:'
  25  |       : '';
  26  |     const saved = JSON.parse(
  27  |       localStorage.getItem(prefix + 'ergogen:multi-config') || 'null'
  28  |     );
  29  |     return (
  30  |       saved?.configs?.find(
  31  |         (config: { id: string; config: string }) =>
  32  |           config.id === saved.activeConfigId
  33  |       )?.config ??
  34  |       JSON.parse(localStorage.getItem(prefix + 'ergogen:config') || '""')
  35  |     );
  36  |   });
  37  | 
  38  | export async function openCase(page: Page) {
  39  |   await studio(page)
  40  |     .getByRole('navigation', { name: 'Design workflow' })
  41  |     .getByRole('button', { name: 'Case', exact: true })
  42  |     .click();
  43  |   const designer = page.getByRole('region', { name: 'Case designer' });
  44  |   await expect(designer).toBeVisible();
  45  |   const create = designer.getByRole('button', {
  46  |     name: 'Create case',
  47  |     exact: true,
  48  |   });
  49  |   if (await create.count()) {
  50  |     await create.click();
  51  |   }
  52  |   return designer;
  53  | }
  54  | 
  55  | export async function openExport(page: Page) {
  56  |   await studio(page)
  57  |     .getByRole('navigation', { name: 'Design workflow' })
  58  |     .getByRole('button', { name: 'Export', exact: true })
  59  |     .click();
  60  |   return studio(page).getByRole('main');
  61  | }
  62  | 
  63  | export async function openLibrary(page: Page) {
  64  |   await studio(page)
  65  |     .getByRole('navigation', { name: 'Design workflow' })
  66  |     .getByRole('button', { name: 'Design', exact: true })
  67  |     .click();
  68  |   await page.getByRole('button', { name: 'Part library', exact: true }).click();
  69  |   await expect(page.getByLabel('Import footprint files')).toBeAttached();
  70  |   return studio(page);
  71  | }
  72  | 
  73  | export async function createDraft(page: Page) {
  74  |   await page
  75  |     .getByRole('button', { name: 'New native design', exact: true })
> 76  |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  77  |   await page.getByRole('button', { name: 'Apply setup', exact: true }).click();
  78  |   await expect(studio(page)).toBeVisible();
  79  | }
  80  | 
  81  | export async function openInspector(page: Page) {
  82  |   const trigger = page.getByRole('button', { name: 'Inspector', exact: true });
  83  |   if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
  84  |     await trigger.click();
  85  |   }
  86  |   const panel = page.getByRole('complementary', { name: 'Design inspector' });
  87  |   const browse = panel.getByRole('button', {
  88  |     name: 'Browse objects',
  89  |     exact: true,
  90  |   });
  91  |   if (await browse.isVisible()) {
  92  |     await browse.click();
  93  |   }
  94  |   for (const name of ['Objects', 'Selection', 'Design']) {
  95  |     const heading = panel.getByText(name, { selector: 'summary', exact: true });
  96  |     if (
  97  |       !(await heading.evaluate(
  98  |         (node) => (node.parentElement as HTMLDetailsElement).open
  99  |       ))
  100 |     ) {
  101 |       await heading.click();
  102 |     }
  103 |   }
  104 |   return panel;
  105 | }
  106 | 
```
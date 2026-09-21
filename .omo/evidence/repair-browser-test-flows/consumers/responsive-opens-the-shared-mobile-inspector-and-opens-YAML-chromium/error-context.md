# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> opens the shared mobile inspector and opens YAML
- Location: e2e/responsive.spec.ts:4:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Code', exact: true })

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
        - button "Keyboard" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e41]: Keyboard
        - generic [ref=e42]:
          - button "Rename configuration Keyboard" [ref=e43] [cursor=pointer]:
            - img [ref=e44]
          - button "Duplicate configuration Keyboard" [ref=e47] [cursor=pointer]:
            - img [ref=e48]
          - button "Delete configuration Keyboard" [ref=e51] [cursor=pointer]:
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
      - heading "Keyboard" [level=1] [ref=e83]
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
        - button "Undo project edit" [disabled] [ref=e101]:
          - img [ref=e102]
        - button "Redo project edit" [disabled] [ref=e105]:
          - img [ref=e106]
        - button "Inspector" [active] [ref=e109] [cursor=pointer]:
          - img [ref=e110]
          - text: Inspector
        - button "Part library" [ref=e111] [cursor=pointer]:
          - img [ref=e112]
          - text: Part library
    - main [ref=e118]:
      - generic "Outline controls" [ref=e119]:
        - generic [ref=e120]:
          - checkbox "Automatic outline" [checked] [ref=e121]
          - text: Automatic outline
      - generic [ref=e122]:
        - toolbar "Canvas tools" [ref=e123]:
          - generic [ref=e124]:
            - button "Select Objects" [ref=e125] [cursor=pointer]:
              - img [ref=e126]
            - button "Select Columns" [ref=e128] [cursor=pointer]:
              - img [ref=e129]
            - button "Select Rows" [ref=e131] [cursor=pointer]:
              - img [ref=e132]
            - button "Select Matrices" [pressed] [ref=e134] [cursor=pointer]:
              - img [ref=e135]
            - button "Pan" [ref=e137] [cursor=pointer]:
              - img [ref=e138]
          - toolbar "Snapping" [ref=e143]:
            - button "Snapping" [pressed] [ref=e144] [cursor=pointer]:
              - img [ref=e145]
            - button "Snapping settings" [ref=e149] [cursor=pointer]:
              - img [ref=e150]
            - region [ref=e152]:
              - generic [ref=e153]:
                - strong [ref=e154]: Snapping
                - button [ref=e155] [cursor=pointer]:
                  - img [ref=e156]
              - group [ref=e159]:
                - button [ref=e160] [cursor=pointer]: 1u
                - button [ref=e161] [cursor=pointer]: ½u
                - button [pressed] [ref=e162] [cursor=pointer]: ¼u
                - button [ref=e163] [cursor=pointer]: ⅛u
              - generic [ref=e164]:
                - generic [ref=e165]:
                  - checkbox [checked] [ref=e166]
                  - text: Grid
                - generic [ref=e167]:
                  - checkbox [checked] [ref=e168]
                  - text: Centers
                - generic [ref=e169]:
                  - checkbox [ref=e170]
                  - text: Origins
                - generic [ref=e171]:
                  - checkbox [checked] [ref=e172]
                  - text: Edges
              - generic [ref=e173]:
                - text: Increment · mm
                - spinbutton [ref=e174]
              - generic [ref=e175]:
                - text: Edge gap · mm
                - spinbutton [ref=e176]: "2"
              - group [ref=e177]:
                - generic [ref=e178] [cursor=pointer]: Alt bypasses snapping · Help
          - button "Delete selection" [ref=e179] [cursor=pointer]:
            - img [ref=e180]
        - toolbar "View controls" [ref=e183]:
          - button "Side" [ref=e184] [cursor=pointer]
          - button "Fit layout" [ref=e185] [cursor=pointer]:
            - img [ref=e186]
          - button "Zoom out" [ref=e191] [cursor=pointer]:
            - img [ref=e192]
          - generic [ref=e193]: 100%
          - button "Zoom in" [ref=e194] [cursor=pointer]:
            - img [ref=e195]
        - group "Interactive board layout" [ref=e196]:
          - button "Select fingers_c1_r1" [pressed] [ref=e198]
          - button "Select fingers_c1_r1_diode" [pressed] [ref=e201]
          - button "Select fingers_c1_r2" [pressed] [ref=e204]
          - button "Select fingers_c1_r2_diode" [pressed] [ref=e207]
          - button "Select fingers_c1_r3" [pressed] [ref=e210]
          - button "Select fingers_c1_r3_diode" [pressed] [ref=e213]
          - button "Select fingers_c1_r4" [pressed] [ref=e216]
          - button "Select fingers_c1_r4_diode" [pressed] [ref=e219]
          - button "Select fingers_c2_r1" [pressed] [ref=e222]
          - button "Select fingers_c2_r1_diode" [pressed] [ref=e225]
          - button "Select fingers_c2_r2" [pressed] [ref=e228]
          - button "Select fingers_c2_r2_diode" [pressed] [ref=e231]
          - button "Select fingers_c2_r3" [pressed] [ref=e234]
          - button "Select fingers_c2_r3_diode" [pressed] [ref=e237]
          - button "Select fingers_c2_r4" [pressed] [ref=e240]
          - button "Select fingers_c2_r4_diode" [pressed] [ref=e243]
          - button "Select fingers_c3_r1" [pressed] [ref=e246]
          - button "Select fingers_c3_r1_diode" [pressed] [ref=e249]
          - button "Select fingers_c3_r2" [pressed] [ref=e252]
          - button "Select fingers_c3_r2_diode" [pressed] [ref=e255]
          - button "Select fingers_c3_r3" [pressed] [ref=e258]
          - button "Select fingers_c3_r3_diode" [pressed] [ref=e261]
          - button "Select fingers_c3_r4" [pressed] [ref=e264]
          - button "Select fingers_c3_r4_diode" [pressed] [ref=e267]
          - button "Select fingers_c4_r1" [pressed] [ref=e270]
          - button "Select fingers_c4_r1_diode" [pressed] [ref=e273]
          - button "Select fingers_c4_r2" [pressed] [ref=e276]
          - button "Select fingers_c4_r2_diode" [pressed] [ref=e279]
          - button "Select fingers_c4_r3" [pressed] [ref=e282]
          - button "Select fingers_c4_r3_diode" [pressed] [ref=e285]
          - button "Select fingers_c4_r4" [pressed] [ref=e288]
          - button "Select fingers_c4_r4_diode" [pressed] [ref=e291]
          - button "Select fingers_c5_r1" [pressed] [ref=e294]
          - button "Select fingers_c5_r1_diode" [pressed] [ref=e297]
          - button "Select fingers_c5_r2" [pressed] [ref=e300]
          - button "Select fingers_c5_r2_diode" [pressed] [ref=e303]
          - button "Select fingers_c5_r3" [pressed] [ref=e306]
          - button "Select fingers_c5_r3_diode" [pressed] [ref=e309]
          - button "Select fingers_c5_r4" [pressed] [ref=e312]
          - button "Select fingers_c5_r4_diode" [pressed] [ref=e315]
    - status "Project status" [ref=e318]:
      - generic [ref=e319]: Layout positions current · 20 keys
      - button "Review 2 blockers" [ref=e320] [cursor=pointer]
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
> 9   |     await page.getByRole('button', { name: 'Code', exact: true }).click();
      |                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  74  |   await expect(page).toHaveURL('./');
  75  |   await expect(studio(page)).toBeVisible();
  76  |   await expect(
  77  |     page.getByRole('button', { name: /^Select fingers_c\d+_r\d+$/ })
  78  |   ).toHaveCount(20);
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
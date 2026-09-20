# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-workflow.spec.ts >> keeps navigation, selection and camera through Settings without editing source
- Location: e2e/studio-workflow.spec.ts:15:5

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Settings', exact: true })

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
        - button "Legacy Config" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e41]: Legacy Config
        - generic [ref=e42]:
          - button "Rename configuration Legacy Config" [ref=e43] [cursor=pointer]:
            - img [ref=e44]
          - button "Duplicate configuration Legacy Config" [ref=e47] [cursor=pointer]:
            - img [ref=e48]
          - button "Delete configuration Legacy Config" [ref=e51] [cursor=pointer]:
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
      - heading "Legacy Config" [level=1] [ref=e83]
      - button "Generate project" [ref=e84] [cursor=pointer]:
        - img [ref=e85]
        - generic [ref=e88]: Generate 3D
      - button "Project actions" [ref=e90] [cursor=pointer]:
        - img [ref=e91]
    - navigation "Design workflow" [ref=e95]:
      - button "Design" [ref=e96] [cursor=pointer]
      - button "PCB" [ref=e97] [cursor=pointer]
      - button "Case" [ref=e98] [cursor=pointer]
      - button "Export" [active] [ref=e99] [cursor=pointer]
      - generic [ref=e100]:
        - button "Undo project edit" [disabled] [ref=e101]:
          - img [ref=e102]
        - button "Redo project edit" [disabled] [ref=e105]:
          - img [ref=e106]
        - button "Part library" [ref=e109] [cursor=pointer]:
          - img [ref=e110]
          - text: Part library
    - main [ref=e115]:
      - heading "Export project" [level=2] [ref=e116]
      - paragraph [ref=e117]: PCB and outline files match the current project.
      - heading "Editable project" [level=3] [ref=e118]
      - generic [ref=e119]:
        - button "Download YAML" [ref=e120] [cursor=pointer]
        - button "Download project ZIP" [ref=e121] [cursor=pointer]
        - button "Share source link" [ref=e122] [cursor=pointer]
      - paragraph [ref=e123]: The project ZIP includes custom footprints and imported assets. Source links contain YAML and footprints.
      - heading "PCB and outlines" [level=3] [ref=e124]
      - button "Download PCB and outlines ZIP" [ref=e126] [cursor=pointer]
      - button "main · KiCad PCB" [ref=e128] [cursor=pointer]
      - generic [ref=e129]:
        - button "board · DXF" [ref=e130] [cursor=pointer]
        - button "board · SVG" [ref=e131] [cursor=pointer]
      - heading "Case parts" [level=3] [ref=e132]
      - paragraph [ref=e133]: Create a case to generate enclosure files.
      - button "Review case and manufacturing" [ref=e134] [cursor=pointer]
      - generic [ref=e135]:
        - checkbox "I reviewed dimensions, hardware and manufacturing findings." [disabled] [ref=e136]
        - text: I reviewed dimensions, hardware and manufacturing findings.
      - button "Download case ZIP" [disabled] [ref=e138]
      - paragraph [ref=e139]: Physical fit requires a fabricated prototype.
    - status "Project status" [ref=e140]:
      - generic [ref=e141]: 3D preview not generated · 4 keys
      - button "View findings" [ref=e142] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import Columns from '../src/examples/columns';
  3   | import Stack from '../src/examples/physical-stack';
  4   | import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
  5   | import {
  6   |   studio,
  7   |   openCase,
  8   |   openExport,
  9   |   openLibrary,
  10  |   readSource,
  11  | } from './utils/studio';
  12  | 
  13  | test.setTimeout(120000);
  14  | 
  15  | test('keeps navigation, selection and camera through Settings without editing source', async ({
  16  |   page,
  17  | }) => {
  18  |   await page.addInitScript(
  19  |     ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  20  |     { key: CONFIG_LOCAL_STORAGE_KEY, source: Columns.value }
  21  |   );
  22  |   await page.goto('./');
  23  |   const workflow = studio(page).getByRole('navigation', {
  24  |     name: 'Design workflow',
  25  |   });
  26  |   await expect(
  27  |     workflow.getByRole('button', { name: /^(Design|PCB|Case|Export)$/ })
  28  |   ).toHaveText(['Design', 'PCB', 'Case', 'Export']);
  29  |   await expect(
  30  |     page.getByRole('button', { name: 'Select outer_home', exact: true })
  31  |   ).toBeVisible();
  32  |   await page
  33  |     .getByRole('button', { name: 'Select outer_home', exact: true })
  34  |     .click();
  35  |   await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  36  |   const canvas = page.getByRole('group', { name: 'Interactive board layout' });
  37  |   const camera = await canvas.getAttribute('viewBox');
  38  |   const before = await readSource(page);
  39  |   await page.getByRole('button', { name: 'Settings', exact: true }).click();
  40  |   const settings = page.getByRole('dialog', { name: 'Project settings' });
  41  |   await expect(settings).toBeVisible();
  42  |   await expect(page.getByRole('banner')).toHaveCount(0);
  43  |   await expect(
  44  |     settings.getByText('Footprint code', { exact: true })
  45  |   ).toHaveCount(0);
  46  |   await settings.getByRole('button', { name: 'Close settings' }).click();
  47  |   await expect(
  48  |     page.getByRole('button', { name: 'Settings', exact: true })
  49  |   ).toBeFocused();
  50  |   await expect(
  51  |     page.getByRole('button', { name: 'Select outer_home', exact: true })
  52  |   ).toHaveAttribute('aria-pressed', 'true');
  53  |   await expect(canvas).toHaveAttribute('viewBox', camera!);
  54  |   expect(await readSource(page)).toBe(before);
  55  | 
  56  |   await workflow.getByRole('button', { name: 'Case', exact: true }).click();
  57  |   await expect(
  58  |     page.getByRole('button', { name: 'Create case', exact: true })
  59  |   ).toBeVisible();
  60  |   expect(await readSource(page)).toBe(before);
  61  |   await page.getByRole('button', { name: 'Settings', exact: true }).click();
  62  |   await settings.press('Escape');
  63  |   await expect(
  64  |     workflow.getByRole('button', { name: 'Case', exact: true })
  65  |   ).toHaveAttribute('aria-current', 'step');
  66  |   expect(await readSource(page)).toBe(before);
  67  | 
  68  |   await page.setViewportSize({ width: 390, height: 844 });
  69  |   await workflow.getByRole('button', { name: 'Export', exact: true }).click();
  70  |   await expect(
  71  |     page.getByRole('button', { name: 'Download YAML' })
  72  |   ).toBeVisible();
  73  |   await page.screenshot({ path: test.info().outputPath('export-narrow.png') });
> 74  |   await page.getByRole('button', { name: 'Settings', exact: true }).click();
      |                                                                     ^ Error: locator.click: Test timeout of 120000ms exceeded.
  75  |   await expect(
  76  |     settings.getByRole('button', { name: 'Close settings' })
  77  |   ).toBeInViewport();
  78  |   await page.screenshot({
  79  |     path: test.info().outputPath('settings-narrow.png'),
  80  |   });
  81  |   await settings.getByRole('button', { name: 'Close settings' }).click();
  82  |   await workflow.getByRole('button', { name: 'Design', exact: true }).click();
  83  |   await page.screenshot({ path: test.info().outputPath('design-narrow.png') });
  84  | });
  85  | 
  86  | test('retains generated case outputs across Code, library and Export', async ({
  87  |   page,
  88  | }) => {
  89  |   await page.addInitScript(
  90  |     ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  91  |     { key: CONFIG_LOCAL_STORAGE_KEY, source: Stack.value }
  92  |   );
  93  |   await page.goto('./');
  94  |   let designer = await openCase(page);
  95  |   await designer
  96  |     .getByRole('button', { name: 'Manufacturing', exact: true })
  97  |     .click();
  98  |   for (const part of ['bottom', 'top', 'plate']) {
  99  |     await designer
  100 |       .getByLabel(`${part} process`, { exact: true })
  101 |       .selectOption('fdm');
  102 |   }
  103 |   const generate = page.getByRole('button', {
  104 |     name: 'Generate project',
  105 |     exact: true,
  106 |   });
  107 |   await expect(generate).toBeEnabled({ timeout: 90000 });
  108 |   await expect(
  109 |     designer.getByRole('button', { name: 'Generate', exact: true })
  110 |   ).toHaveCount(0);
  111 |   await generate.click();
  112 |   await expect(
  113 |     designer.getByRole('status').filter({ hasText: /Current geometry/ })
  114 |   ).toBeVisible({ timeout: 90000 });
  115 |   await page.getByRole('button', { name: 'Code', exact: true }).click();
  116 |   await page.getByRole('button', { name: 'Code', exact: true }).click();
  117 |   await expect(
  118 |     designer.getByRole('status').filter({ hasText: /Current geometry/ })
  119 |   ).toBeVisible();
  120 | 
  121 |   await openLibrary(page);
  122 |   const outputs = await openExport(page);
  123 |   await outputs
  124 |     .getByRole('checkbox', { name: /I reviewed dimensions/ })
  125 |     .check();
  126 |   await expect(
  127 |     outputs.getByRole('button', { name: 'Download case ZIP' })
  128 |   ).toBeEnabled();
  129 |   await outputs
  130 |     .getByRole('button', { name: 'Review case and manufacturing' })
  131 |     .click();
  132 |   designer = page.getByRole('region', { name: 'Case designer' });
  133 |   await expect(
  134 |     designer.getByRole('status').filter({ hasText: /Current geometry/ })
  135 |   ).toBeVisible();
  136 |   await designer
  137 |     .getByRole('button', { name: 'assembled', exact: true })
  138 |     .click();
  139 |   await expect(designer.getByLabel('3D assembly preview')).toHaveAttribute(
  140 |     'data-rendered',
  141 |     'true'
  142 |   );
  143 |   await designer
  144 |     .getByRole('button', { name: 'Enclosure', exact: true })
  145 |     .click();
  146 |   await designer.getByLabel('Wall thickness (mm)', { exact: true }).fill('3.2');
  147 |   await designer
  148 |     .getByLabel('Wall thickness (mm)', { exact: true })
  149 |     .press('Tab');
  150 |   await openExport(page);
  151 |   await expect(
  152 |     outputs.getByRole('button', { name: 'Download case ZIP' })
  153 |   ).toBeDisabled();
  154 |   await expect(
  155 |     outputs.getByRole('button', { name: 'Download PCB and outlines ZIP' })
  156 |   ).toBeEnabled({ timeout: 90000 });
  157 | });
  158 | 
```
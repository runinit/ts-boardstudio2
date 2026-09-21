# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workbench.spec.ts >> uses complete mobile drawers at 320px
- Location: e2e/workbench.spec.ts:87:7

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator: getByRole('button', { name: 'Code', exact: true })
Expected: in viewport
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeInViewport" with timeout 5000ms
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
      - button "Export" [ref=e99] [cursor=pointer]
      - generic [ref=e100]:
        - button "Undo project edit" [disabled] [ref=e101]:
          - img [ref=e102]
        - button "Redo project edit" [disabled] [ref=e105]:
          - img [ref=e106]
    - generic [ref=e109]:
      - generic [ref=e110]:
        - heading "Part library" [level=2] [ref=e111]
        - button "Back to design" [ref=e112] [cursor=pointer]
      - generic [ref=e113]:
        - main [ref=e114]:
          - generic [ref=e115]:
            - button "Catalog" [ref=e116] [cursor=pointer]
            - button "Inspector" [ref=e117] [cursor=pointer]
            - button "3D" [pressed] [ref=e118] [cursor=pointer]
            - button "2D" [ref=e119] [cursor=pointer]
            - button "Move" [pressed] [ref=e120] [cursor=pointer]
            - button "Rotate" [ref=e121] [cursor=pointer]
            - button "Scale" [ref=e122] [cursor=pointer]
            - button "Front side" [ref=e123] [cursor=pointer]
          - generic "Footprint preview" [ref=e124]
        - complementary "Footprint inspector" [ref=e128]:
          - generic [ref=e129]:
            - button "Close inspector" [active] [ref=e130] [cursor=pointer]
            - heading "ceoloide/battery_connector_molex_pico_ezmate_1x02" [level=2] [ref=e131]
            - paragraph [ref=e132]: Unsaved changes
            - generic [ref=e133]:
              - button "Save footprint" [ref=e134] [cursor=pointer]
              - button "Undo footprint edit" [disabled] [ref=e135]:
                - img [ref=e136]
                - text: Undo
          - generic [ref=e139]:
            - button "3D models" [pressed] [ref=e140] [cursor=pointer]
            - button "Pads & nets" [ref=e141] [cursor=pointer]
          - generic [ref=e142]:
            - generic [ref=e143]:
              - text: Model
              - combobox "Active model" [ref=e144]:
                - option "1. Molex_Ezmate_Pico_Socket_2pin.step" [selected]
                - option "2. Molex_Ezmate_Pico_Cable_2pin.step"
            - generic [ref=e145]:
              - button "Add models" [ref=e146] [cursor=pointer]
              - button "Replace" [ref=e147] [cursor=pointer]
              - button "Remove" [ref=e148] [cursor=pointer]
            - paragraph [ref=e149]: STEP, STL or VRML · original files are retained.
            - group "Position (mm)" [ref=e150]:
              - generic [ref=e151]: Position (mm)
              - generic [ref=e152]:
                - generic [ref=e153]:
                  - text: X
                  - spinbutton "Model offset X" [ref=e154]: "0"
                - generic [ref=e155]:
                  - text: "Y"
                  - spinbutton "Model offset Y" [ref=e156]: "0"
                - generic [ref=e157]:
                  - text: Z
                  - spinbutton "Model offset Z" [ref=e158]: "1.4"
            - group "Rotation (°)" [ref=e159]:
              - generic [ref=e160]: Rotation (°)
              - generic [ref=e161]:
                - generic [ref=e162]:
                  - text: X
                  - spinbutton "Model rotate X" [ref=e163]: "-90"
                - generic [ref=e164]:
                  - text: "Y"
                  - spinbutton "Model rotate Y" [ref=e165]: "0"
                - generic [ref=e166]:
                  - text: Z
                  - spinbutton "Model rotate Z" [ref=e167]: "0"
            - group "Scale" [ref=e168]:
              - generic [ref=e169]: Scale
              - generic [ref=e170]:
                - generic [ref=e171]:
                  - text: X
                  - spinbutton "Model scale X" [ref=e172]: "1"
                - generic [ref=e173]:
                  - text: "Y"
                  - spinbutton "Model scale Y" [ref=e174]: "1"
                - generic [ref=e175]:
                  - text: Z
                  - spinbutton "Model scale Z" [ref=e176]: "1"
            - paragraph [ref=e177]: Origin (0, 0, 0) is marked by the axes. Drag the matching canvas controls to align the model.
            - group [ref=e178]:
              - generic "KiCad reference or public URL" [ref=e179] [cursor=pointer]
          - group [ref=e180]:
            - generic "Parameters & source" [ref=e181] [cursor=pointer]
          - paragraph [ref=e182]: 0 linked placements · 0 projects
    - status "Project status" [ref=e183]:
      - generic [ref=e184]: Layout positions current · 4 keys
      - button "View findings" [ref=e185] [cursor=pointer]
```

# Test source

```ts
  33  |   await page.addInitScript(
  34  |     ({ key, source }) => {
  35  |       localStorage.setItem(key, JSON.stringify(source));
  36  |     },
  37  |     { key: CONFIG_LOCAL_STORAGE_KEY, source: columns.value }
  38  |   );
  39  |   await page.goto('./');
  40  |   await openLibrary(page);
  41  |   const capacitor = page.getByRole('button', { name: /^bhkfp\/cap_0603/ });
  42  |   await capacitor.click();
  43  |   const offset = page.getByRole('spinbutton', {
  44  |     name: 'Model offset X',
  45  |     exact: true,
  46  |   });
  47  |   await offset.fill('4');
  48  |   await offset.blur();
  49  |   await page
  50  |     .getByRole('button', { name: /^ceoloide\/diode_tht_sod123/ })
  51  |     .click();
  52  |   await capacitor.click();
  53  |   await expect(offset).toHaveValue('4');
  54  |   await page
  55  |     .getByRole('button', { name: 'Undo footprint edit', exact: true })
  56  |     .click();
  57  |   await expect(offset).toHaveValue('0');
  58  | });
  59  |
  60  | test('retains the part editor draft when returning from board editing', async ({
  61  |   page,
  62  | }) => {
  63  |   await page.setViewportSize({ width: 1440, height: 1000 });
  64  |   await page.addInitScript(
  65  |     ({ key, source }) => {
  66  |       localStorage.setItem(key, JSON.stringify(source));
  67  |     },
  68  |     { key: CONFIG_LOCAL_STORAGE_KEY, source: columns.value }
  69  |   );
  70  |   await page.goto('./');
  71  |   await openLibrary(page);
  72  |   await page.getByRole('button', { name: /^bhkfp\/cap_0603/ }).click();
  73  |   const offset = page.getByRole('spinbutton', {
  74  |     name: 'Model offset X',
  75  |     exact: true,
  76  |   });
  77  |   await offset.fill('4');
  78  |   await offset.blur();
  79  |   await page
  80  |     .getByRole('button', { name: 'Back to design', exact: true })
  81  |     .click();
  82  |   await page.getByRole('button', { name: 'Part library', exact: true }).click();
  83  |   await expect(offset).toHaveValue('4');
  84  | });
  85  |
  86  | for (const width of [320, 390]) {
  87  |   test(`uses complete mobile drawers at ${width}px`, async ({ page }) => {
  88  |     await page.setViewportSize({ width, height: 844 });
  89  |     await page.addInitScript(
  90  |       ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  91  |       { key: CONFIG_LOCAL_STORAGE_KEY, source: columns.value }
  92  |     );
  93  |     await page.goto('./');
  94  |     await page.getByRole('button', { name: 'Inspector', exact: true }).click();
  95  |     const board = page.getByRole('complementary', { name: 'Design inspector' });
  96  |     await expect(board).toBeVisible();
  97  |     expect((await board.boundingBox())?.width).toBeCloseTo(width);
  98  |     await expect(board.getByLabel('Current selection')).toBeVisible();
  99  |     await board.getByRole('button', { name: 'Close inspector' }).click();
  100 |     await openLibrary(page);
  101 |     await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  102 |     const catalog = page.getByRole('complementary', {
  103 |       name: 'Footprint library catalog',
  104 |     });
  105 |     expect((await catalog.boundingBox())?.width).toBeCloseTo(width);
  106 |     await catalog
  107 |       .getByRole('button', { name: /^ceoloide\/battery_connector_molex/ })
  108 |       .click();
  109 |     const inspector = page.getByRole('complementary', {
  110 |       name: 'Footprint inspector',
  111 |     });
  112 |     expect((await inspector.boundingBox())?.width).toBeCloseTo(width);
  113 |     const heading = inspector.getByRole('heading', { level: 2 });
  114 |     await expect(heading).toBeInViewport();
  115 |     const bounds = await heading.boundingBox();
  116 |     expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  117 |     await expect(
  118 |       inspector.getByRole('button', { name: 'Close inspector' })
  119 |     ).toBeInViewport();
  120 |     expect(
  121 |       await page.evaluate(() => document.documentElement.scrollWidth)
  122 |     ).toBe(width);
  123 |     for (const name of [
  124 |       'Projects',
  125 |       'Undo project edit',
  126 |       'Redo project edit',
  127 |       'Code',
  128 |       'Generate project',
  129 |       'Settings',
  130 |     ]) {
  131 |       await expect(
  132 |         page.getByRole('button', { name, exact: true })
> 133 |       ).toBeInViewport();
      |         ^ Error: expect(locator).toBeInViewport() failed
  134 |     }
  135 |   });
  136 | }
  137 |
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout-units.spec.ts >> keeps setup and the layout usable at 390px
- Location: e2e/layout-units.spec.ts:145:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'Design setup panel' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('region', { name: 'Design setup panel' })

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
        - button "Inspector" [ref=e109] [cursor=pointer]:
          - img [ref=e110]
          - text: Inspector
        - button "Part library" [ref=e111] [cursor=pointer]:
          - img [ref=e112]
          - text: Part library
    - main [ref=e118]:
      - generic [ref=e119]:
        - heading "Build your layout" [level=2] [ref=e120]
        - paragraph [ref=e121]: Place keys and hardware using the design’s spacing.
        - generic [ref=e122]:
          - button "Add matrix" [ref=e123] [cursor=pointer]
          - button "Add column" [ref=e124] [cursor=pointer]
          - button "Add key" [ref=e125] [cursor=pointer]
          - button "Add component" [ref=e126] [cursor=pointer]
      - generic "Outline controls" [ref=e127]:
        - generic [ref=e128]:
          - checkbox "Automatic outline" [checked] [ref=e129]
          - text: Automatic outline
      - generic [ref=e130]:
        - toolbar "Canvas tools" [ref=e131]:
          - generic [ref=e132]:
            - button "Select Objects" [pressed] [ref=e133] [cursor=pointer]:
              - img [ref=e134]
            - button "Select Columns" [ref=e136] [cursor=pointer]:
              - img [ref=e137]
            - button "Select Rows" [ref=e139] [cursor=pointer]:
              - img [ref=e140]
            - button "Select Matrices" [ref=e142] [cursor=pointer]:
              - img [ref=e143]
            - button "Pan" [ref=e145] [cursor=pointer]:
              - img [ref=e146]
          - toolbar "Snapping" [ref=e151]:
            - button "Snapping" [pressed] [ref=e152] [cursor=pointer]:
              - img [ref=e153]
            - button "Snapping settings" [ref=e157] [cursor=pointer]:
              - img [ref=e158]
            - region [ref=e160]:
              - generic [ref=e161]:
                - strong [ref=e162]: Snapping
                - button [ref=e163] [cursor=pointer]:
                  - img [ref=e164]
              - group [ref=e167]:
                - button [ref=e168] [cursor=pointer]: 1u
                - button [ref=e169] [cursor=pointer]: ½u
                - button [pressed] [ref=e170] [cursor=pointer]: ¼u
                - button [ref=e171] [cursor=pointer]: ⅛u
              - generic [ref=e172]:
                - generic [ref=e173]:
                  - checkbox [checked] [ref=e174]
                  - text: Grid
                - generic [ref=e175]:
                  - checkbox [checked] [ref=e176]
                  - text: Centers
                - generic [ref=e177]:
                  - checkbox [ref=e178]
                  - text: Origins
                - generic [ref=e179]:
                  - checkbox [checked] [ref=e180]
                  - text: Edges
              - generic [ref=e181]:
                - text: Increment · mm
                - spinbutton [ref=e182]
              - generic [ref=e183]:
                - text: Edge gap · mm
                - spinbutton [ref=e184]: "2"
              - group [ref=e185]:
                - generic [ref=e186] [cursor=pointer]: Alt bypasses snapping · Help
        - toolbar "View controls" [ref=e187]:
          - button "Side" [ref=e188] [cursor=pointer]
          - button "Fit layout" [ref=e189] [cursor=pointer]:
            - img [ref=e190]
          - button "Zoom out" [ref=e195] [cursor=pointer]:
            - img [ref=e196]
          - generic [ref=e197]: 100%
          - button "Zoom in" [ref=e198] [cursor=pointer]:
            - img [ref=e199]
        - group "Interactive board layout" [ref=e200]
    - status "Project status" [ref=e202]:
      - generic [ref=e203]: Layout positions current · 0 keys
      - button "View findings" [ref=e204] [cursor=pointer]
```

# Test source

```ts
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
  124 |     )
  125 |     .toBe(1);
  126 |   await page.screenshot({ path: capture('desktop-alignment') });
  127 |   data = parse(await readSource(page));
  128 |   expect(Object.values(data.layout.constraints)[0]).toMatchObject({
  129 |     type: 'aligned',
  130 |     axis: 'y',
  131 |     refs: ['encoder.center', 'columns.fingers.c2'],
  132 |   });
  133 |   await page.getByRole('button', { name: /Remove relationship/ }).click();
  134 |   await expect
  135 |     .poll(
  136 |       async () =>
  137 |         Object.keys(parse(await readSource(page)).layout.constraints || {})
  138 |           .length
  139 |     )
  140 |     .toBe(0);
  141 |   expect(errors).toEqual([]);
  142 | });
  143 |
  144 | for (const width of [320, 390]) {
  145 |   test(`keeps setup and the layout usable at ${width}px`, async ({ page }) => {
  146 |     await page.setViewportSize({ width, height: 844 });
  147 |     await page.addInitScript(
  148 |       ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  149 |       { key: CONFIG_LOCAL_STORAGE_KEY, source: createBoard() }
  150 |     );
  151 |     await page.goto('./');
  152 |     await expect(
  153 |       page.getByRole('region', { name: 'Design setup panel' })
> 154 |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  155 |     await expect(
  156 |       page.getByRole('status').filter({ hasText: 'Layout resolved' })
  157 |     ).toBeVisible();
  158 |     await page.screenshot({ path: capture(`mobile-${width}-setup`) });
  159 |     await page.getByRole('tab', { name: 'Key assembly', exact: true }).click();
  160 |     await expect(
  161 |       page
  162 |         .getByRole('img', { name: 'Key assembly footprint editor' })
  163 |         .locator('polygon')
  164 |         .first()
  165 |     ).toBeVisible();
  166 |     await page.screenshot({ path: capture(`mobile-${width}-assembly`) });
  167 |     await page.getByRole('tab', { name: 'Stackup', exact: true }).click();
  168 |     await page.screenshot({ path: capture(`mobile-${width}-stack`) });
  169 |     expect(
  170 |       await page.evaluate(
  171 |         () => document.documentElement.scrollWidth <= innerWidth
  172 |       )
  173 |     ).toBe(true);
  174 |     await page
  175 |       .getByRole('button', { name: 'Apply setup', exact: true })
  176 |       .click();
  177 |     const close = page.getByRole('button', {
  178 |       name: 'Close inspector',
  179 |       exact: true,
  180 |     });
  181 |     if (await close.isVisible()) {
  182 |       await close.click();
  183 |     }
  184 |     await expect(studio(page)).toBeVisible();
  185 |     await expect(
  186 |       page.getByRole('status').filter({ hasText: 'Layout resolved' })
  187 |     ).toBeVisible();
  188 |     await page.screenshot({ path: capture(`mobile-${width}-canvas`) });
  189 |   });
  190 | }
  191 |
  192 | test('snaps a component to a column center and optionally keeps the alignment', async ({
  193 |   page,
  194 | }) => {
  195 |   let source = addCluster(
  196 |     createBoard({ ...defaultSetup(), diode: false, pitch: 19 }),
  197 |     'fingers',
  198 |     'columns',
  199 |     { columns: 2, rows: 2 }
  200 |   );
  201 |   source = setValue(source, ['meta', 'studio', 'openSetup'], false);
  202 |   source = setValue(source, ['layout', 'objects', 'encoder'], {
  203 |     kind: 'component',
  204 |     pcb: 'main',
  205 |     layer: 'main',
  206 |     placement: { at: [33, 60, 0] },
  207 |     envelopes: { body: { size: [12, 12], height: [0, 10], at: [2, 0, 0] } },
  208 |   });
  209 |   await page.addInitScript(
  210 |     ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  211 |     { key: CONFIG_LOCAL_STORAGE_KEY, source }
  212 |   );
  213 |   await page.setViewportSize({ width: 1440, height: 1000 });
  214 |   await page.goto('./');
  215 |   await expect(
  216 |     page.getByRole('status').filter({ hasText: 'Layout resolved' })
  217 |   ).toBeVisible();
  218 |   await openExport(page);
  219 |   await expect(
  220 |     page.getByRole('button', { name: 'main · KiCad PCB' })
  221 |   ).toBeEnabled();
  222 |   await studio(page)
  223 |     .getByRole('navigation', { name: 'Design workflow' })
  224 |     .getByRole('button', { name: 'Design', exact: true })
  225 |     .click();
  226 |   const points = await page
  227 |     .getByRole('group', { name: 'Interactive board layout' })
  228 |     .evaluate((svg) => {
  229 |       const matrix = (svg as SVGSVGElement).getScreenCTM()!;
  230 |       return [
  231 |         [35, -60],
  232 |         [19, -60],
  233 |       ].map(([x, y]) => {
  234 |         const point = new DOMPoint(x, y).matrixTransform(matrix);
  235 |         return { x: point.x, y: point.y };
  236 |       });
  237 |     });
  238 |   await page.mouse.move(points[0].x, points[0].y);
  239 |   await page.mouse.down();
  240 |   await page.mouse.move(points[1].x, points[1].y, { steps: 12 });
  241 |   await page.mouse.up();
  242 |   const keep = page.getByRole('button', {
  243 |     name: /Keep relationship · Center alignment · Column 2/,
  244 |   });
  245 |   await expect(keep).toBeVisible();
  246 |   const temporary = parse(await readSource(page));
  247 |   expect(Object.keys(temporary.layout.constraints || {})).toHaveLength(0);
  248 |   await keep.click();
  249 |   await expect
  250 |     .poll(
  251 |       async () =>
  252 |         Object.values(parse(await readSource(page)).layout.constraints || {})
  253 |           .length
  254 |     )
```
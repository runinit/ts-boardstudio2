# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-consolidation.spec.ts >> retains an edge relationship only after the snapped drop
- Location: e2e/settings-consolidation.spec.ts:133:5

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator: getByRole('button', { name: /Keep relationship · Edge offset/ })
Expected: enabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeEnabled" with timeout 5000ms
  - waiting for getByRole('button', { name: /Keep relationship · Edge offset/ })
    3 × locator resolved to <button disabled>…</button>
      - unexpected value "disabled"

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
      - button "Generate project" [ref=e86] [cursor=pointer]:
        - img [ref=e87]
        - generic [ref=e90]: Generate 3D
      - generic [ref=e92]:
        - button "Code" [ref=e93] [cursor=pointer]:
          - img [ref=e94]
          - text: Code
        - button "Design setup" [ref=e98] [cursor=pointer]
        - button "Install app" [ref=e99] [cursor=pointer]:
          - img [ref=e100]
          - text: Install App
        - button "Settings" [ref=e103] [cursor=pointer]:
          - img [ref=e104]
    - navigation "Design workflow" [ref=e107]:
      - button "Design" [ref=e108] [cursor=pointer]:
        - img [ref=e109]
        - text: Design
      - button "PCB" [ref=e114] [cursor=pointer]:
        - img [ref=e115]
        - text: PCB
      - button "Case" [ref=e118] [cursor=pointer]:
        - img [ref=e119]
        - text: Case
      - button "Export" [ref=e122] [cursor=pointer]:
        - img [ref=e123]
        - text: Export
      - generic [ref=e126]:
        - button "Undo project edit" [ref=e127] [cursor=pointer]:
          - img [ref=e128]
        - button "Redo project edit" [disabled] [ref=e131]:
          - img [ref=e132]
        - button "Inspector" [ref=e135] [cursor=pointer]:
          - img [ref=e136]
          - text: Inspector
        - button "Part library" [ref=e137] [cursor=pointer]:
          - img [ref=e138]
          - text: Part library
    - main [ref=e144]:
      - generic "Outline controls" [ref=e145]:
        - generic [ref=e146]:
          - checkbox "Automatic outline" [checked] [ref=e147]
          - text: Automatic outline
      - generic [ref=e148]:
        - toolbar "Canvas tools" [ref=e149]:
          - generic [ref=e150]:
            - button "Select Objects" [ref=e151] [cursor=pointer]:
              - img [ref=e152]
            - button "Select Columns" [ref=e154] [cursor=pointer]:
              - img [ref=e155]
            - button "Select Rows" [ref=e157] [cursor=pointer]:
              - img [ref=e158]
            - button "Select Matrices" [pressed] [ref=e160] [cursor=pointer]:
              - img [ref=e161]
            - button "Pan" [ref=e163] [cursor=pointer]:
              - img [ref=e164]
          - toolbar "Snapping" [ref=e169]:
            - button "Snapping" [pressed] [ref=e170] [cursor=pointer]:
              - img [ref=e171]
            - button "Snapping settings" [ref=e175] [cursor=pointer]:
              - img [ref=e176]
            - region [ref=e178]:
              - generic [ref=e179]:
                - strong [ref=e180]: Snapping
                - button [ref=e181] [cursor=pointer]:
                  - img [ref=e182]
              - group [ref=e185]:
                - button [ref=e186] [cursor=pointer]: 1u
                - button [ref=e187] [cursor=pointer]: ½u
                - button [pressed] [ref=e188] [cursor=pointer]: ¼u
                - button [ref=e189] [cursor=pointer]: ⅛u
              - generic [ref=e190]:
                - generic [ref=e191]:
                  - checkbox [ref=e192]
                  - text: Grid
                - generic [ref=e193]:
                  - checkbox [ref=e194]
                  - text: Centers
                - generic [ref=e195]:
                  - checkbox [ref=e196]
                  - text: Origins
                - generic [ref=e197]:
                  - checkbox [checked] [ref=e198]
                  - text: Edges
              - generic [ref=e199]:
                - text: Increment · mm
                - spinbutton [ref=e200]
              - generic [ref=e201]:
                - text: Edge gap · mm
                - spinbutton [ref=e202]: "2"
              - group [ref=e203]:
                - generic [ref=e204] [cursor=pointer]: Alt bypasses snapping · Help
          - button "Delete selection" [ref=e205] [cursor=pointer]:
            - img [ref=e206]
        - toolbar "View controls" [ref=e209]:
          - button "Side" [ref=e210] [cursor=pointer]
          - button "Fit layout" [ref=e211] [cursor=pointer]:
            - img [ref=e212]
          - button "Zoom out" [ref=e217] [cursor=pointer]:
            - img [ref=e218]
          - generic [ref=e219]: 82%
          - button "Zoom in" [ref=e220] [cursor=pointer]:
            - img [ref=e221]
        - group "Interactive board layout" [ref=e222]:
          - button "Select fingers_c1_r1" [ref=e224]
          - button "Select follower" [active] [pressed] [ref=e226]
    - status "Project status" [ref=e229]:
      - generic [ref=e230]: Layout positions current · 1 key
      - button "View findings" [ref=e231] [cursor=pointer]
```

# Test source

```ts
  88  |   await page
  89  |     .getByRole('button', { name: 'Apply assembly', exact: true })
  90  |     .click();
  91  |   await expect
  92  |     .poll(
  93  |       async () =>
  94  |         !!parse(await readSource(page)).layout.objects.fingers_c1_r1_diode
  95  |     )
  96  |     .toBe(false);
  97  |   await page
  98  |     .getByRole('button', { name: 'Select Objects', exact: true })
  99  |     .click();
  100 |   await page.locator('[data-object="fingers_c1_r1"]').click();
  101 |   await page
  102 |     .getByRole('button', { name: 'Edit key assembly', exact: true })
  103 |     .click();
  104 |   await page
  105 |     .getByRole('checkbox', { name: 'SK6812 MINI-E LED', exact: true })
  106 |     .check();
  107 |   await page
  108 |     .getByRole('button', { name: 'Apply assembly', exact: true })
  109 |     .click();
  110 |   await expect
  111 |     .poll(
  112 |       async () =>
  113 |         !!parse(await readSource(page)).layout.objects.fingers_c1_r1_led
  114 |     )
  115 |     .toBe(true);
  116 |   await page
  117 |     .getByRole('button', { name: 'Edit key assembly', exact: true })
  118 |     .click();
  119 |   await page
  120 |     .getByRole('button', { name: 'Reset to inherited', exact: true })
  121 |     .click();
  122 |   await expect
  123 |     .poll(
  124 |       async () =>
  125 |         !!parse(await readSource(page)).layout.objects.fingers_c1_r1_led
  126 |     )
  127 |     .toBe(false);
  128 |   const data = parse(await readSource(page));
  129 |   expect(data.layout.objects.fingers_c1_r1_diode).toBeUndefined();
  130 |   expect(data.layout.objects.fingers_c2_r1_diode).toBeDefined();
  131 | });
  132 |
  133 | test('retains an edge relationship only after the snapped drop', async ({
  134 |   page,
  135 | }) => {
  136 |   let source = addCluster(
  137 |     createBoard({ ...defaultSetup(), diode: false }),
  138 |     'fingers',
  139 |     'columns'
  140 |   );
  141 |   source = setValue(source, ['meta', 'studio', 'openSetup'], false);
  142 |   source = setValue(source, ['layout', 'objects', 'follower'], {
  143 |     kind: 'component',
  144 |     pcb: 'main',
  145 |     layer: 'main',
  146 |     placement: { at: [40, 0, 0] },
  147 |     envelopes: { body: { size: [12, 12], height: [0, 2] } },
  148 |   });
  149 |   await open(page, source);
  150 |   const toolbar = page.getByRole('toolbar', { name: 'Snapping', exact: true });
  151 |   await toolbar
  152 |     .getByRole('button', { name: 'Snapping settings', exact: true })
  153 |     .click();
  154 |   await toolbar.getByRole('checkbox', { name: 'Center guides' }).uncheck();
  155 |   await toolbar.getByRole('checkbox', { name: 'Increment grid' }).uncheck();
  156 |   await expect(toolbar.getByLabel('Snap edge gap')).toHaveValue('2');
  157 |   await expect(
  158 |     page.getByRole('button', { name: 'Canvas options', exact: true })
  159 |   ).toHaveCount(0);
  160 |   await toolbar.getByRole('button', { name: 'Snapping', exact: true }).click();
  161 |   await expect(
  162 |     toolbar.getByRole('button', { name: 'Snap increment 0.25u' })
  163 |   ).toBeDisabled();
  164 |   await toolbar.getByRole('button', { name: 'Snapping', exact: true }).click();
  165 |   await page.screenshot({ path: capture('desktop-snapping') });
  166 |   await toolbar
  167 |     .getByRole('button', { name: 'Snapping settings', exact: true })
  168 |     .click();
  169 |   const points = await page
  170 |     .getByRole('group', { name: 'Interactive board layout' })
  171 |     .evaluate((svg) => {
  172 |       const matrix = (svg as SVGSVGElement).getScreenCTM()!;
  173 |       return [
  174 |         [40, 0],
  175 |         [17, 0],
  176 |       ].map(([x, y]) => {
  177 |         const p = new DOMPoint(x, y).matrixTransform(matrix);
  178 |         return { x: p.x, y: p.y };
  179 |       });
  180 |     });
  181 |   await page.mouse.move(points[0].x, points[0].y);
  182 |   await page.mouse.down();
  183 |   await page.mouse.move(points[1].x, points[1].y, { steps: 12 });
  184 |   await page.mouse.up();
  185 |   const keep = page.getByRole('button', {
  186 |     name: /Keep relationship · Edge offset/,
  187 |   });
> 188 |   await expect(keep).toBeEnabled();
      |                      ^ Error: expect(locator).toBeEnabled() failed
  189 |   expect(
  190 |     parse(await readSource(page)).layout.objects.follower.placement.ref
  191 |   ).toBeUndefined();
  192 |   await keep.click();
  193 |   await expect
  194 |     .poll(
  195 |       async () =>
  196 |         parse(await readSource(page)).layout.objects.follower.placement.ref
  197 |     )
  198 |     .toBe('fingers_c1_r1');
  199 |   await page
  200 |     .getByRole('button', { name: 'Select Objects', exact: true })
  201 |     .click();
  202 |   const key = page.locator('[data-object="fingers_c1_r1"]');
  203 |   await key.click();
  204 |   await key.press('ArrowRight');
  205 |   await expect
  206 |     .poll(
  207 |       async () =>
  208 |         resolve(parse(await readSource(page))).objects.follower.position[0]
  209 |     )
  210 |     .toBeCloseTo(17 + 19.05 / 4);
  211 | });
  212 |
  213 | test('shares mechanical stack editing between Case and Design setup', async ({
  214 |   page,
  215 | }) => {
  216 |   await open(page, board());
  217 |   const designer = await openCase(page);
  218 |   await designer.getByRole('button', { name: 'Mounting', exact: true }).click();
  219 |   await designer.getByLabel('PCB to plate gap', { exact: true }).fill('4');
  220 |   await designer.getByLabel('PCB to plate gap', { exact: true }).press('Enter');
  221 |   await expect
  222 |     .poll(async () => parse(await readSource(page)).units.plate_gap)
  223 |     .toBe(4);
  224 |   await expect(
  225 |     designer.getByLabel('Plate underside height', { exact: true })
  226 |   ).toContainText('11.6 mm');
  227 |   await designer
  228 |     .getByRole('region', { name: 'Stack dimensions', exact: true })
  229 |     .scrollIntoViewIfNeeded();
  230 |   await page.screenshot({ path: capture('desktop-case-stack') });
  231 |   await studio(page)
  232 |     .getByRole('navigation', { name: 'Design workflow' })
  233 |     .getByRole('button', { name: 'Design', exact: true })
  234 |     .click();
  235 |   await page.getByRole('button', { name: 'Design setup', exact: true }).click();
  236 |   await page.getByRole('tab', { name: 'Stackup', exact: true }).click();
  237 |   await expect(
  238 |     page.getByLabel('Plate underside height', { exact: true })
  239 |   ).toContainText('11.6 mm');
  240 |   await page.getByLabel('PCB to plate gap', { exact: true }).fill('5.4');
  241 |   await page.getByLabel('PCB to plate gap', { exact: true }).press('Enter');
  242 |   await page
  243 |     .getByRole('region', { name: 'Stack dimensions', exact: true })
  244 |     .scrollIntoViewIfNeeded();
  245 |   await page.screenshot({ path: capture('desktop-setup-stack') });
  246 |   await page.getByRole('button', { name: 'Apply setup', exact: true }).click();
  247 |   await openCase(page);
  248 |   await designer.getByRole('button', { name: 'Mounting', exact: true }).click();
  249 |   await expect(
  250 |     designer.getByLabel('Plate underside height', { exact: true })
  251 |   ).toContainText('13 mm');
  252 | });
  253 |
  254 | for (const width of [320, 390]) {
  255 |   test(`keeps consolidated controls usable at ${width}px`, async ({ page }) => {
  256 |     await open(page, board(), width);
  257 |     const close = page.getByRole('button', {
  258 |       name: 'Close inspector',
  259 |       exact: true,
  260 |     });
  261 |     if (await close.isVisible()) {
  262 |       await close.click();
  263 |     }
  264 |     const toolbar = page.getByRole('toolbar', {
  265 |       name: 'Snapping',
  266 |       exact: true,
  267 |     });
  268 |     await toolbar
  269 |       .getByRole('button', { name: 'Snapping settings', exact: true })
  270 |       .click();
  271 |     const menu = await toolbar
  272 |       .getByRole('region', { name: 'Snapping settings', exact: true })
  273 |       .boundingBox();
  274 |     expect(menu!.x).toBeGreaterThanOrEqual(0);
  275 |     expect(menu!.x + menu!.width).toBeLessThanOrEqual(width);
  276 |     await page.screenshot({ path: capture(`mobile-${width}-snapping`) });
  277 |     await toolbar
  278 |       .getByRole('button', { name: 'Snapping settings', exact: true })
  279 |       .click();
  280 |     await page
  281 |       .getByRole('button', { name: 'Design setup', exact: true })
  282 |       .click();
  283 |     await page.getByRole('tab', { name: 'Key assembly', exact: true }).click();
  284 |     await expect(
  285 |       page
  286 |         .getByRole('img', { name: 'Key assembly footprint editor' })
  287 |         .locator('polygon')
  288 |         .first()
```
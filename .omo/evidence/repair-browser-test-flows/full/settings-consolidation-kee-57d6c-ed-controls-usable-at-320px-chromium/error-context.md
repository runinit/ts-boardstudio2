# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-consolidation.spec.ts >> keeps consolidated controls usable at 320px
- Location: e2e/settings-consolidation.spec.ts:255:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Design setup', exact: true })

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
            - button "Snapping settings" [active] [ref=e149] [cursor=pointer]:
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
          - button "Select fingers_c1_r2" [pressed] [ref=e201]
          - button "Select fingers_c2_r1" [pressed] [ref=e204]
          - button "Select fingers_c2_r2" [pressed] [ref=e207]
          - button "Select fingers_c1_r1_diode" [pressed] [ref=e210]
          - button "Select fingers_c1_r2_diode" [pressed] [ref=e213]
          - button "Select fingers_c2_r1_diode" [pressed] [ref=e216]
          - button "Select fingers_c2_r2_diode" [pressed] [ref=e219]
    - status "Project status" [ref=e222]:
      - generic [ref=e223]: Layout positions current · 4 keys
      - button "View findings" [ref=e224] [cursor=pointer]
```

# Test source

```ts
  182 |   await page.mouse.down();
  183 |   await page.mouse.move(points[1].x, points[1].y, { steps: 12 });
  184 |   await page.mouse.up();
  185 |   const keep = page.getByRole('button', {
  186 |     name: /Keep relationship · Edge offset/,
  187 |   });
  188 |   await expect(keep).toBeEnabled();
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
> 282 |       .click();
      |        ^ Error: locator.click: Test timeout of 120000ms exceeded.
  283 |     await page.getByRole('tab', { name: 'Key assembly', exact: true }).click();
  284 |     await expect(
  285 |       page
  286 |         .getByRole('img', { name: 'Key assembly footprint editor' })
  287 |         .locator('polygon')
  288 |         .first()
  289 |     ).toBeVisible();
  290 |     await page.screenshot({ path: capture(`mobile-${width}-assembly`) });
  291 |     await page.getByRole('tab', { name: 'Stackup', exact: true }).click();
  292 |     await page
  293 |       .getByRole('region', { name: 'Stack dimensions', exact: true })
  294 |       .scrollIntoViewIfNeeded();
  295 |     await page.screenshot({ path: capture(`mobile-${width}-stack`) });
  296 |     await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  297 |     if (await close.isVisible()) {
  298 |       await close.click();
  299 |     }
  300 |     await page
  301 |       .getByRole('button', { name: 'Select Objects', exact: true })
  302 |       .click();
  303 |     await page.locator('[data-object="fingers_c1_r1"]').click();
  304 |     await page
  305 |       .getByRole('button', { name: 'Edit key assembly', exact: true })
  306 |       .click();
  307 |     const scope = page.getByLabel('Assembly scope');
  308 |     await expect(scope).toHaveValue('3');
  309 |     await expect(scope.locator('option')).toHaveCount(4);
  310 |     for (const value of ['0', '1', '2', '3']) {
  311 |       await scope.selectOption(value);
  312 |       await expect(scope).toHaveValue(value);
  313 |     }
  314 |     await scope.scrollIntoViewIfNeeded();
  315 |     await page.screenshot({ path: capture(`mobile-${width}-assembly-scope`) });
  316 |
  317 |     expect(
  318 |       await page.evaluate(
  319 |         () => document.documentElement.scrollWidth <= innerWidth
  320 |       )
  321 |     ).toBe(true);
  322 |   });
  323 | }
  324 |
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout-units.spec.ts >> shows named material layers and gap fit in setup
- Location: e2e/layout-units.spec.ts:327:5

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('tab', { name: 'Stackup', exact: true })

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
          - button "Select keys_c1_r1" [pressed] [ref=e225]
          - button "Select keys_c1_r2" [pressed] [ref=e228]
          - button "Select keys_c2_r1" [pressed] [ref=e231]
          - button "Select keys_c2_r2" [pressed] [ref=e234]
    - status "Project status" [ref=e237]:
      - generic [ref=e238]: Layout positions current · 4 keys
      - button "View findings" [ref=e239] [cursor=pointer]
```

# Test source

```ts
  263 |     'fingers',
  264 |     'columns',
  265 |     { columns: 2, rows: 2 }
  266 |   );
  267 |   source = setValue(source, ['meta', 'studio', 'openSetup'], false);
  268 |   source = setValue(source, ['designs', 'stackups', 'main', 'layers'], {
  269 |     foam: {
  270 |       label: 'Plate foam',
  271 |       material: 'foam',
  272 |       lower: 'pcb.top',
  273 |       upper: 'plate.bottom',
  274 |       thickness: 3,
  275 |     },
  276 |     silicone: {
  277 |       label: 'Silicone sheet',
  278 |       material: 'silicone',
  279 |       lower: 'pcb.top',
  280 |       upper: 'plate.bottom',
  281 |       thickness: 4,
  282 |     },
  283 |   });
  284 |   await page.addInitScript(
  285 |     ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  286 |     { key: CONFIG_LOCAL_STORAGE_KEY, source }
  287 |   );
  288 |   await page.setViewportSize({ width: 1440, height: 1000 });
  289 |   await page.goto('./');
  290 |   await expect(
  291 |     page.getByRole('status').filter({ hasText: 'Layout resolved' })
  292 |   ).toBeVisible();
  293 |   await openExport(page);
  294 |   const foam = page.getByRole('button', { name: 'Download Plate foam DXF' });
  295 |   await expect(foam).toBeEnabled({ timeout: 60000 });
  296 |   await expect(
  297 |     page.getByRole('button', { name: 'Download Silicone sheet DXF' })
  298 |   ).toBeDisabled();
  299 |   const downloaded = page.waitForEvent('download');
  300 |   await foam.click();
  301 |   await (await downloaded).saveAs('/tmp/layout-plate-foam.dxf');
  302 |   await expect(
  303 |     page.getByRole('button', { name: 'main · KiCad PCB' })
  304 |   ).toBeEnabled();
  305 |   await page.screenshot({ path: capture('desktop-material-export') });
  306 |   const bundle = page.waitForEvent('download');
  307 |   await page
  308 |     .getByRole('button', { name: 'Download PCB and outlines ZIP', exact: true })
  309 |     .click();
  310 |   await (await bundle).saveAs('/tmp/layout-materials.zip');
  311 |   const zip = await JSZip.loadAsync(
  312 |     await readFile('/tmp/layout-materials.zip')
  313 |   );
  314 |   const metadata = JSON.parse(
  315 |     await zip.file('outputs/material-layers.json')!.async('string')
  316 |   );
  317 |   expect(metadata.units).toBe('mm');
  318 |   expect(metadata.stackups.main.layers.foam).toMatchObject({
  319 |     stock: 3,
  320 |     installed: 3,
  321 |     status: 'ready',
  322 |   });
  323 |   expect(metadata.stackups.main.layers.silicone.status).toBe('interference');
  324 |   expect(zip.file('outputs/outlines/main_foam.dxf')).not.toBeNull();
  325 | });
  326 | 
  327 | test('shows named material layers and gap fit in setup', async ({ page }) => {
  328 |   let source = addCluster(
  329 |     createBoard({ ...defaultSetup(), diode: false }),
  330 |     'keys',
  331 |     'columns',
  332 |     { columns: 2, rows: 2 }
  333 |   );
  334 |   source = setValue(source, ['designs', 'stackups', 'main', 'layers'], {
  335 |     foam: {
  336 |       label: 'Plate foam',
  337 |       material: 'foam',
  338 |       lower: 'pcb.top',
  339 |       upper: 'plate.bottom',
  340 |       thickness: 1,
  341 |     },
  342 |     silicone: {
  343 |       label: 'Silicone sheet',
  344 |       material: 'silicone',
  345 |       lower: 'pcb.top',
  346 |       upper: 'plate.bottom',
  347 |       thickness: 1,
  348 |     },
  349 |     gasket: {
  350 |       label: 'Gasket pads',
  351 |       material: 'gasket',
  352 |       lower: 'pcb.top',
  353 |       upper: 'plate.bottom',
  354 |       thickness: 1,
  355 |     },
  356 |   });
  357 |   await page.addInitScript(
  358 |     ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  359 |     { key: CONFIG_LOCAL_STORAGE_KEY, source }
  360 |   );
  361 |   await page.setViewportSize({ width: 1440, height: 1000 });
  362 |   await page.goto('./');
> 363 |   await page.getByRole('tab', { name: 'Stackup', exact: true }).click();
      |                                                                 ^ Error: locator.click: Test timeout of 120000ms exceeded.
  364 |   await expect(
  365 |     page.getByRole('button', {
  366 |       name: /Silicone sheet · silicone · 1 mm · Fits gap/,
  367 |     })
  368 |   ).toBeVisible();
  369 |   await page.screenshot({ path: capture('desktop-material-section') });
  370 | });
  371 | 
```
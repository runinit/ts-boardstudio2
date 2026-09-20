# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footprint-library.spec.ts >> assigns a model to a native BHK controller and exports the object binding
- Location: e2e/footprint-library.spec.ts:244:5

# Error details

```
TimeoutError: locator.selectOption: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('region', { name: 'Case designer' }).getByLabel('top process', { exact: true })
    - locator resolved to <select id=":r4e:" aria-label="top process">…</select>
  - attempting select option action
    - waiting for element to be visible and enabled

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
      - button "Generate project" [disabled] [ref=e86]:
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
        - button "Undo project edit" [ref=e128] [cursor=pointer]:
          - img [ref=e129]
        - button "Redo project edit" [disabled] [ref=e132]:
          - img [ref=e133]
        - button "Part library" [ref=e136] [cursor=pointer]:
          - img [ref=e137]
          - text: Part library
    - region "Case designer" [ref=e142]:
      - tooltip "Adjust manufacturing for the selected case. Review the 2D plan and generated assembly after changing it."
      - generic [ref=e143]:
        - complementary "Assembly panel" [ref=e144]:
          - button "Close assembly tree" [ref=e145] [cursor=pointer]
          - heading "Assembly" [level=2] [ref=e146]
          - paragraph [ref=e147]: bhk
          - tree "Assembly" [ref=e148]:
            - generic [ref=e150]:
              - treeitem "Case shell" [level=1] [ref=e151] [cursor=pointer]:
                - img [ref=e152]
                - generic [ref=e155]: Case shell
              - button "Hide Case shell" [ref=e156] [cursor=pointer]:
                - img [ref=e157]
            - generic [ref=e161]:
              - treeitem "Top frame" [level=1] [ref=e162] [cursor=pointer]:
                - img [ref=e163]
                - generic [ref=e166]: Top frame
              - button "Hide Top frame" [ref=e167] [cursor=pointer]:
                - img [ref=e168]
            - generic [ref=e172]:
              - treeitem "Plate" [level=1] [ref=e173] [cursor=pointer]:
                - img [ref=e174]
                - generic [ref=e178]: Plate
              - button "Hide Plate" [ref=e179] [cursor=pointer]:
                - img [ref=e180]
            - generic [ref=e184]:
              - treeitem "PCB" [level=1] [ref=e185] [cursor=pointer]:
                - img [ref=e186]
                - generic [ref=e192]: PCB
              - button "Hide PCB" [ref=e193] [cursor=pointer]:
                - img [ref=e194]
            - generic [ref=e197]:
              - generic [ref=e198]:
                - button "Collapse Components (39)" [ref=e199] [cursor=pointer]:
                  - img [ref=e200]
                - treeitem "Components (39)" [expanded] [level=1] [ref=e202] [cursor=pointer]:
                  - img [ref=e203]
                  - generic [ref=e206]: Components
                  - generic [ref=e207]: "39"
                - button "Hide Components (39)" [ref=e208] [cursor=pointer]:
                  - img [ref=e209]
              - group [ref=e212]:
                - generic [ref=e214]:
                  - button "Expand component (1)" [ref=e215] [cursor=pointer]:
                    - img [ref=e216]
                  - treeitem "component (1)" [level=2] [ref=e218] [cursor=pointer]:
                    - img [ref=e219]
                    - generic [ref=e222]: component
                    - generic [ref=e223]: "1"
                  - button "Hide component (1)" [ref=e224] [cursor=pointer]:
                    - img [ref=e225]
                - generic [ref=e229]:
                  - button "Expand display (1)" [ref=e230] [cursor=pointer]:
                    - img [ref=e231]
                  - treeitem "display (1)" [level=2] [ref=e233] [cursor=pointer]:
                    - img [ref=e234]
                    - generic [ref=e237]: display
                    - generic [ref=e238]: "1"
                  - button "Hide display (1)" [ref=e239] [cursor=pointer]:
                    - img [ref=e240]
                - generic [ref=e244]:
                  - button "Expand key_rotated (18)" [ref=e245] [cursor=pointer]:
                    - img [ref=e246]
                  - treeitem "key_rotated (18)" [level=2] [ref=e248] [cursor=pointer]:
                    - img [ref=e249]
                    - generic [ref=e252]: key_rotated
                    - generic [ref=e253]: "18"
                  - button "Hide key_rotated (18)" [ref=e254] [cursor=pointer]:
                    - img [ref=e255]
                - generic [ref=e259]:
                  - button "Expand key (15)" [ref=e260] [cursor=pointer]:
                    - img [ref=e261]
                  - treeitem "key (15)" [level=2] [ref=e263] [cursor=pointer]:
                    - img [ref=e264]
                    - generic [ref=e267]: key
                    - generic [ref=e268]: "15"
                  - button "Hide key (15)" [ref=e269] [cursor=pointer]:
                    - img [ref=e270]
                - generic [ref=e273]:
                  - generic [ref=e274]:
                    - button "Collapse controller (1)" [ref=e275] [cursor=pointer]:
                      - img [ref=e276]
                    - treeitem "controller (1)" [expanded] [level=2] [ref=e278] [cursor=pointer]:
                      - img [ref=e279]
                      - generic [ref=e282]: controller
                      - generic [ref=e283]: "1"
                    - button "Hide controller (1)" [ref=e284] [cursor=pointer]:
                      - img [ref=e285]
                  - group [ref=e288]:
                    - generic [ref=e290]:
                      - treeitem "mcu" [level=3] [selected] [ref=e291] [cursor=pointer]:
                        - img [ref=e292]
                        - generic [ref=e295]: mcu
                      - button "Hide mcu" [ref=e296] [cursor=pointer]:
                        - img [ref=e297]
                - generic [ref=e301]:
                  - button "Expand power_switch (1)" [ref=e302] [cursor=pointer]:
                    - img [ref=e303]
                  - treeitem "power_switch (1)" [level=2] [ref=e305] [cursor=pointer]:
                    - img [ref=e306]
                    - generic [ref=e309]: power_switch
                    - generic [ref=e310]: "1"
                  - button "Hide power_switch (1)" [ref=e311] [cursor=pointer]:
                    - img [ref=e312]
                - generic [ref=e316]:
                  - button "Expand reset_button (1)" [ref=e317] [cursor=pointer]:
                    - img [ref=e318]
                  - treeitem "reset_button (1)" [level=2] [ref=e320] [cursor=pointer]:
                    - img [ref=e321]
                    - generic [ref=e324]: reset_button
                    - generic [ref=e325]: "1"
                  - button "Hide reset_button (1)" [ref=e326] [cursor=pointer]:
                    - img [ref=e327]
                - generic [ref=e331]:
                  - button "Expand scrollwheel (1)" [ref=e332] [cursor=pointer]:
                    - img [ref=e333]
                  - treeitem "scrollwheel (1)" [level=2] [ref=e335] [cursor=pointer]:
                    - img [ref=e336]
                    - generic [ref=e339]: scrollwheel
                    - generic [ref=e340]: "1"
                  - button "Hide scrollwheel (1)" [ref=e341] [cursor=pointer]:
                    - img [ref=e342]
            - generic [ref=e346]:
              - button "Expand Hardware" [ref=e347] [cursor=pointer]:
                - img [ref=e348]
              - treeitem "Hardware" [level=1] [ref=e350] [cursor=pointer]:
                - img [ref=e351]
                - generic [ref=e353]: Hardware
              - button "Hide Hardware" [ref=e354] [cursor=pointer]:
                - img [ref=e355]
          - group [ref=e358]:
            - generic "Case setup" [ref=e359] [cursor=pointer]
            - navigation "Case tools" [ref=e360]:
              - button "Layout" [ref=e361] [cursor=pointer]
              - button "Manufacturing" [active] [ref=e362] [cursor=pointer]
              - button "Mounting" [ref=e363] [cursor=pointer]
              - button "Enclosure" [ref=e364] [cursor=pointer]
              - button "Components" [ref=e365] [cursor=pointer]
              - button "Hardware" [ref=e366] [cursor=pointer]
              - button "Review" [ref=e367] [cursor=pointer]
        - generic "Contextual inspector" [ref=e368]:
          - button "Close inspector" [ref=e369] [cursor=pointer]
          - heading "Manufacturing" [level=2] [ref=e370]
          - paragraph [ref=e371]: Choose a process for each part. The JLCCNC preset uses depth-dependent tooling. Supplier minimums differ from our case defaults.
          - paragraph [ref=e372]:
            - link "JLCCNC design guidance" [ref=e373] [cursor=pointer]:
              - /url: https://jlccnc.com/help/article/cnc-machining-design-guideline
          - paragraph [ref=e374]: CNC adds corner relief using each part’s cutter diameter when you generate. Required openings stay clear; walls, plate webs, and mounting posts are checked before relief is applied.
          - group "bottom" [ref=e375]:
            - generic [ref=e376]: bottom
            - generic [ref=e377]:
              - generic [ref=e378]: bottom process
              - 'button "Help: bottom process" [ref=e380] [cursor=pointer]': "?"
              - combobox "bottom process" [ref=e381]:
                - option "Choose…"
                - option "fdm" [selected]
                - option "cnc"
            - generic [ref=e382]:
              - generic [ref=e383]: bottom material
              - 'button "Help: bottom material" [ref=e385] [cursor=pointer]': "?"
              - textbox "bottom material" [ref=e386]
            - generic [ref=e387]:
              - generic [ref=e388]: bottom minimum wall (mm)
              - 'button "Help: bottom minimum wall (mm)" [ref=e390] [cursor=pointer]': "?"
              - textbox "bottom minimum wall (mm)" [ref=e391]: "1.2"
            - generic [ref=e392]:
              - generic [ref=e393]: bottom nozzle width (mm)
              - 'button "Help: bottom nozzle width (mm)" [ref=e395] [cursor=pointer]': "?"
              - textbox "bottom nozzle width (mm)" [ref=e396]: "0.4"
            - generic [ref=e397]:
              - generic [ref=e398]: bottom layer height (mm)
              - 'button "Help: bottom layer height (mm)" [ref=e400] [cursor=pointer]': "?"
              - textbox "bottom layer height (mm)" [ref=e401]: "0.2"
            - generic [ref=e402]:
              - generic [ref=e403]: bottom print orientation
              - 'button "Help: bottom print orientation" [ref=e405] [cursor=pointer]': "?"
              - combobox "bottom print orientation" [ref=e406]:
                - option "interior-up" [selected]
                - option "interior-down"
                - option "side"
            - generic [ref=e407]:
              - generic [ref=e408]: bottom build X (mm)
              - 'button "Help: bottom build X (mm)" [ref=e410] [cursor=pointer]': "?"
              - textbox "bottom build X (mm)" [ref=e411]: "220"
            - generic [ref=e412]:
              - generic [ref=e413]: bottom build Y (mm)
              - 'button "Help: bottom build Y (mm)" [ref=e415] [cursor=pointer]': "?"
              - textbox "bottom build Y (mm)" [ref=e416]: "220"
            - generic [ref=e417]:
              - generic [ref=e418]: bottom build Z (mm)
              - 'button "Help: bottom build Z (mm)" [ref=e420] [cursor=pointer]': "?"
              - textbox "bottom build Z (mm)" [ref=e421]: "250"
            - generic [ref=e422]:
              - generic [ref=e423]: bottom supports
              - 'button "Help: bottom supports" [ref=e425] [cursor=pointer]': "?"
              - combobox "bottom supports" [ref=e426]:
                - option "allowed" [selected]
                - option "avoid"
          - group "top" [ref=e427]:
            - generic [ref=e428]: top
            - generic [ref=e429]:
              - generic [ref=e430]: top process
              - 'button "Help: top process" [ref=e432] [cursor=pointer]': "?"
              - combobox "top process" [ref=e433]:
                - option "Choose…"
                - option "fdm" [selected]
                - option "cnc"
            - generic [ref=e434]:
              - generic [ref=e435]: top material
              - 'button "Help: top material" [ref=e437] [cursor=pointer]': "?"
              - textbox "top material" [ref=e438]
            - generic [ref=e439]:
              - generic [ref=e440]: top minimum wall (mm)
              - 'button "Help: top minimum wall (mm)" [ref=e442] [cursor=pointer]': "?"
              - textbox "top minimum wall (mm)" [ref=e443]: "1.2"
            - generic [ref=e444]:
              - generic [ref=e445]: top nozzle width (mm)
              - 'button "Help: top nozzle width (mm)" [ref=e447] [cursor=pointer]': "?"
              - textbox "top nozzle width (mm)" [ref=e448]: "0.4"
            - generic [ref=e449]:
              - generic [ref=e450]: top layer height (mm)
              - 'button "Help: top layer height (mm)" [ref=e452] [cursor=pointer]': "?"
              - textbox "top layer height (mm)" [ref=e453]: "0.2"
            - generic [ref=e454]:
              - generic [ref=e455]: top print orientation
              - 'button "Help: top print orientation" [ref=e457] [cursor=pointer]': "?"
              - combobox "top print orientation" [ref=e458]:
                - option "interior-up" [selected]
                - option "interior-down"
                - option "side"
            - generic [ref=e459]:
              - generic [ref=e460]: top build X (mm)
              - 'button "Help: top build X (mm)" [ref=e462] [cursor=pointer]': "?"
              - textbox "top build X (mm)" [ref=e463]: "220"
            - generic [ref=e464]:
              - generic [ref=e465]: top build Y (mm)
              - 'button "Help: top build Y (mm)" [ref=e467] [cursor=pointer]': "?"
              - textbox "top build Y (mm)" [ref=e468]: "220"
            - generic [ref=e469]:
              - generic [ref=e470]: top build Z (mm)
              - 'button "Help: top build Z (mm)" [ref=e472] [cursor=pointer]': "?"
              - textbox "top build Z (mm)" [ref=e473]: "250"
            - generic [ref=e474]:
              - generic [ref=e475]: top supports
              - 'button "Help: top supports" [ref=e477] [cursor=pointer]': "?"
              - combobox "top supports" [ref=e478]:
                - option "allowed" [selected]
                - option "avoid"
          - group "plate" [ref=e479]:
            - generic [ref=e480]: plate
            - generic [ref=e481]:
              - generic [ref=e482]: plate process
              - 'button "Help: plate process" [ref=e484] [cursor=pointer]': "?"
              - combobox "plate process" [ref=e485]:
                - option "Choose…" [selected]
                - option "fdm"
                - option "cnc"
            - generic [ref=e486]:
              - generic [ref=e487]: plate material
              - 'button "Help: plate material" [ref=e489] [cursor=pointer]': "?"
              - textbox "plate material" [ref=e490]
            - generic [ref=e491]:
              - generic [ref=e492]: plate minimum wall (mm)
              - 'button "Help: plate minimum wall (mm)" [ref=e494] [cursor=pointer]': "?"
              - textbox "plate minimum wall (mm)" [ref=e495]: "1.2"
            - generic [ref=e496]:
              - generic [ref=e497]: plate nozzle width (mm)
              - 'button "Help: plate nozzle width (mm)" [ref=e499] [cursor=pointer]': "?"
              - textbox "plate nozzle width (mm)" [ref=e500]: "0.4"
            - generic [ref=e501]:
              - generic [ref=e502]: plate layer height (mm)
              - 'button "Help: plate layer height (mm)" [ref=e504] [cursor=pointer]': "?"
              - textbox "plate layer height (mm)" [ref=e505]: "0.2"
            - generic [ref=e506]:
              - generic [ref=e507]: plate print orientation
              - 'button "Help: plate print orientation" [ref=e509] [cursor=pointer]': "?"
              - combobox "plate print orientation" [ref=e510]:
                - option "interior-up" [selected]
                - option "interior-down"
                - option "side"
            - generic [ref=e511]:
              - generic [ref=e512]: plate build X (mm)
              - 'button "Help: plate build X (mm)" [ref=e514] [cursor=pointer]': "?"
              - textbox "plate build X (mm)" [ref=e515]: "220"
            - generic [ref=e516]:
              - generic [ref=e517]: plate build Y (mm)
              - 'button "Help: plate build Y (mm)" [ref=e519] [cursor=pointer]': "?"
              - textbox "plate build Y (mm)" [ref=e520]: "220"
            - generic [ref=e521]:
              - generic [ref=e522]: plate build Z (mm)
              - 'button "Help: plate build Z (mm)" [ref=e524] [cursor=pointer]': "?"
              - textbox "plate build Z (mm)" [ref=e525]: "250"
            - generic [ref=e526]:
              - generic [ref=e527]: plate supports
              - 'button "Help: plate supports" [ref=e529] [cursor=pointer]': "?"
              - combobox "plate supports" [ref=e530]:
                - option "allowed" [selected]
                - option "avoid"
        - generic [ref=e531]:
          - generic [ref=e532]:
            - button "plan" [pressed] [ref=e533] [cursor=pointer]: 2D
            - button "assembled" [ref=e534] [cursor=pointer]
            - button "exploded" [ref=e535] [cursor=pointer]
            - button "section" [ref=e536] [cursor=pointer]
            - button "part" [ref=e537] [cursor=pointer]
            - generic [ref=e538]: bhk · bottom
          - generic [ref=e539]:
            - generic [ref=e540]:
              - strong [ref=e541]: Mounting plan
              - 'button "Help: Mounting system" [ref=e543] [cursor=pointer]': "?"
              - button "Select" [pressed] [ref=e544] [cursor=pointer]
              - button "Add gasket" [ref=e545] [cursor=pointer]
              - button "Add mount" [ref=e546] [cursor=pointer]
              - button "Pan" [ref=e547] [cursor=pointer]
              - button "Zoom in mounting plan" [ref=e548] [cursor=pointer]: +
              - button "Zoom out mounting plan" [ref=e549] [cursor=pointer]: −
              - button "Fit plan" [ref=e550] [cursor=pointer]
            - paragraph [ref=e551]: Drag contacts; scroll or pinch to zoom. Use Pan to move the view.
            - paragraph [ref=e552]: Outline · PCB · switch openings · mounting features — 193.4 × 154.4 mm
            - img "Interactive mounting plan" [ref=e553]
          - paragraph [ref=e706]: "Selected feature: board.components.mcu"
      - generic [ref=e707]:
        - status [ref=e708]: Case needs regeneration · 39 components · PCB 1.6 mm
        - button "Review 0 blockers · 5 checks" [ref=e709] [cursor=pointer]
```

# Test source

```ts
  179 |   await exportView
  180 |     .getByRole('button', { name: 'Download case ZIP', exact: true })
  181 |     .click();
  182 |   const download = await downloading;
  183 |   await download.saveAs('test-results/cad-portable-project.zip');
  184 |   const exported = await JSZip.loadAsync(
  185 |     readFileSync('test-results/cad-portable-project.zip')
  186 |   );
  187 |   const manifest = JSON.parse(
  188 |     await exported.file('footprint-library.json')!.async('string')
  189 |   );
  190 |   expect(manifest.entries).toHaveLength(1);
  191 |   expect(manifest.entries[0].models[0].offset[2]).toBe(1);
  192 |   const config = await exported.file('config.yaml')!.async('string');
  193 |   expect(config).toContain('# preserve this comment');
  194 |   expect(config).toContain('from: GND');
  195 |   expect(
  196 |     await exported.file('outputs/pcbs/board.kicad_pcb')!.async('string')
  197 |   ).toContain('${KIPRJMOD}/models/');
  198 |   expect(
  199 |     Object.keys(exported.files).some(
  200 |       (path) =>
  201 |         path.startsWith('outputs/pcbs/models/') && path.endsWith('.step')
  202 |     )
  203 |   ).toBe(true);
  204 |   // A fresh browser profile adopts the ZIP snapshot and can generate without a network.
  205 |   const offlineContext = await browser.newContext();
  206 |   const offlinePage = await offlineContext.newPage();
  207 |   await offlinePage.goto(new URL('./import', page.url()).href);
  208 |   await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  209 |   await offlinePage.reload();
  210 |   await expect(offlinePage.getByTestId('welcome-page-wrapper')).toBeVisible();
  211 |   await offlineContext.setOffline(true);
  212 |   try {
  213 |     await offlinePage
  214 |       .getByTestId('local-file-input')
  215 |       .setInputFiles('test-results/cad-portable-project.zip');
  216 |     await expect(studio(offlinePage)).toBeVisible();
  217 |     await openCase(offlinePage);
  218 |     const reopened = offlinePage.getByRole('region', { name: 'Case designer' });
  219 |     await offlinePage
  220 |       .getByRole('button', { name: 'Generate project', exact: true })
  221 |       .click();
  222 |     await expect(
  223 |       reopened.getByRole('status').filter({ hasText: /Current geometry/ })
  224 |     ).toBeVisible({ timeout: 90000 });
  225 |     await openLibrary(offlinePage);
  226 |     await studio(offlinePage)
  227 |       .getByRole('button', {
  228 |         name: `${manifest.entries[0].name} Custom · revision 1`,
  229 |         exact: true,
  230 |       })
  231 |       .click();
  232 |     await expect(
  233 |       studio(offlinePage).getByRole('spinbutton', {
  234 |         name: 'Model offset Z',
  235 |         exact: true,
  236 |       })
  237 |     ).toHaveValue('1');
  238 |   } finally {
  239 |     await offlineContext.close();
  240 |   }
  241 |   expect(errors).toEqual([]);
  242 | });
  243 | 
  244 | test('assigns a model to a native BHK controller and exports the object binding', async ({
  245 |   page,
  246 | }) => {
  247 |   const config = parseDocument(BHK.value);
  248 | 
  249 |   await page.setViewportSize({ width: 1487, height: 1058 });
  250 |   await page.addInitScript(
  251 |     ({ source, key }) => localStorage.setItem(key, JSON.stringify(source)),
  252 |     { source: config.toString(), key: CONFIG_LOCAL_STORAGE_KEY }
  253 |   );
  254 |   await page.goto('./');
  255 |   await expect(studio(page)).toBeVisible();
  256 |   await openCase(page);
  257 |   const dialog = page.getByRole('region', { name: 'Case designer' });
  258 |   await dialog
  259 |     .getByRole('treeitem', { name: 'controller (1)', exact: true })
  260 |     .click();
  261 |   await dialog
  262 |     .getByLabel('Component footprint', { exact: true })
  263 |     .selectOption('mcu');
  264 |   await dialog
  265 |     .getByLabel('Upload 3D models')
  266 |     .setInputFiles(`${fixture}${footprintName}.step`);
  267 |   await expect(dialog.getByLabel('Active model')).toContainText(footprintName, {
  268 |     timeout: 90000,
  269 |   });
  270 |   await expect(
  271 |     dialog.getByRole('button', { name: 'Replace', exact: true })
  272 |   ).toBeEnabled();
  273 |   await dialog
  274 |     .getByRole('button', { name: 'Manufacturing', exact: true })
  275 |     .click();
  276 |   for (const part of ['bottom', 'top', 'plate']) {
  277 |     await dialog
  278 |       .getByLabel(`${part} process`, { exact: true })
> 279 |       .selectOption('fdm');
      |        ^ TimeoutError: locator.selectOption: Timeout 15000ms exceeded.
  280 |   }
  281 |   await dialog
  282 |     .getByRole('treeitem', { name: 'controller (1)', exact: true })
  283 |     .click();
  284 |   await page
  285 |     .getByRole('button', { name: 'Generate project', exact: true })
  286 |     .click();
  287 |   await expect(
  288 |     dialog.getByRole('status').filter({ hasText: /Current geometry/ })
  289 |   ).toBeVisible({ timeout: 90000 });
  290 |   await dialog.getByRole('button', { name: 'exploded', exact: true }).click();
  291 |   await expect(dialog.getByLabel('3D assembly preview')).toHaveAttribute(
  292 |     'data-rendered',
  293 |     'true'
  294 |   );
  295 |   await expect(dialog.getByLabel('Model alignment inset')).toBeVisible();
  296 |   await expect(dialog.getByLabel('Model alignment inset')).not.toContainText(
  297 |     'Error:'
  298 |   );
  299 |   await expect(
  300 |     dialog.getByText(/mcu · controller ·.*model associated/)
  301 |   ).toBeVisible({ timeout: 30000 });
  302 |   const beforeSource = await readSource(page);
  303 |   const beforeDrag = parse(beforeSource).layout.objects.mcu.models;
  304 |   await dialog.getByLabel('Active model').selectOption('0');
  305 |   const inset = dialog.getByLabel('Model alignment inset');
  306 |   await inset.screenshot({ path: 'test-results/inset-before-drag.png' });
  307 |   const bounds = await inset.boundingBox();
  308 |   expect(bounds).not.toBeNull();
  309 |   // The fixed BHK view places the model's blue Z handle at its upper-right corner.
  310 |   const handle = {
  311 |     x: bounds!.x + bounds!.width * 0.6,
  312 |     y: bounds!.y + bounds!.height * 0.62,
  313 |   };
  314 |   await page.mouse.move(handle.x, handle.y);
  315 |   await inset.screenshot({ path: 'test-results/inset-hover.png' });
  316 |   await page.mouse.click(handle.x, handle.y);
  317 |   await inset.screenshot({ path: 'test-results/inset-click.png' });
  318 |   expect(await readSource(page)).toBe(beforeSource);
  319 |   await page.mouse.down();
  320 |   await page.mouse.move(handle.x, handle.y - 14, { steps: 8 });
  321 |   await page.mouse.up();
  322 |   await inset.screenshot({ path: 'test-results/inset-after-drag.png' });
  323 |   await expect
  324 |     .poll(
  325 |       async () =>
  326 |         parse(await readSource(page)).layout.objects.mcu.models[0].offset
  327 |     )
  328 |     .not.toEqual(beforeDrag[0].offset);
  329 |   const afterDrag = parse(await readSource(page)).layout.objects.mcu.models;
  330 |   // All pointer steps must contribute to the drag, not just its first frame.
  331 |   expect(
  332 |     Math.abs(afterDrag[0].offset[2] - beforeDrag[0].offset[2])
  333 |   ).toBeGreaterThan(3);
  334 |   expect(afterDrag[0].frame).toEqual(beforeDrag[0].frame);
  335 |   expect(afterDrag[0].path).toEqual(beforeDrag[0].path);
  336 |   expect(afterDrag[0].asset).toEqual(beforeDrag[0].asset);
  337 |   expect(afterDrag[1]).toEqual(beforeDrag[1]);
  338 |   await page
  339 |     .getByRole('button', { name: 'Undo project edit', exact: true })
  340 |     .click();
  341 |   await expect
  342 |     .poll(async () => parse(await readSource(page)).layout.objects.mcu.models)
  343 |     .toEqual(beforeDrag);
  344 |   await page
  345 |     .getByRole('button', { name: 'Generate project', exact: true })
  346 |     .click();
  347 |   await expect(
  348 |     dialog.getByRole('status').filter({ hasText: /Current geometry/ })
  349 |   ).toBeVisible({ timeout: 90000 });
  350 |   await page.setViewportSize({ width: 1487, height: 1058 });
  351 |   await page.mouse.move(0, 0);
  352 |   await page.screenshot({ path: 'test-results/cad-bhk-desktop.png' });
  353 |   await page.setViewportSize({ width: 390, height: 844 });
  354 |   await dialog
  355 |     .getByRole('button', { name: 'Close inspector', exact: true })
  356 |     .click();
  357 |   await page.mouse.move(0, 0);
  358 |   await page.screenshot({ path: 'test-results/cad-bhk-narrow.png' });
  359 |   await page.setViewportSize({ width: 1487, height: 1058 });
  360 |   await dialog.getByRole('button', { name: 'Review', exact: true }).click();
  361 |   const exportView = await openExport(page);
  362 |   await exportView
  363 |     .getByRole('checkbox', { name: /I reviewed dimensions/ })
  364 |     .check();
  365 |   const download = page.waitForEvent('download');
  366 |   await exportView
  367 |     .getByRole('button', { name: 'Download case ZIP', exact: true })
  368 |     .click();
  369 |   await (await download).saveAs('test-results/cad-bhk-project.zip');
  370 |   const zip = await JSZip.loadAsync(
  371 |     readFileSync('test-results/cad-bhk-project.zip')
  372 |   );
  373 |   const source = parse(await zip.file('config.yaml')!.async('string'));
  374 |   expect(
  375 |     Object.values(source.layout.objects).filter(
  376 |       (item) => (item as { models?: unknown }).models
  377 |     )
  378 |   ).toHaveLength(1);
  379 |   expect(zip.file('outputs/pcbs/bhk_pcb.kicad_pcb')).not.toBeNull();
```
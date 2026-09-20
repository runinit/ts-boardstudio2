# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footprint-library.spec.ts >> imports a KiCad bundle, aligns models, links placements, and exports a portable project
- Location: e2e/footprint-library.spec.ts:71:5

# Error details

```
Test timeout of 240000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'Case designer' }).getByRole('status').filter({ hasText: /Current geometry/ })
Expected: visible
Timeout: 90000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 90000ms
  - waiting for getByRole('region', { name: 'Case designer' }).getByRole('status').filter({ hasText: /Current geometry/ })

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
        - button "Part library" [ref=e135] [cursor=pointer]:
          - img [ref=e136]
          - text: Part library
    - main [ref=e141]:
      - heading "Export project" [level=2] [ref=e142]
      - paragraph [ref=e143]: PCB and outline files match the current project.
      - heading "Editable project" [level=3] [ref=e144]
      - generic [ref=e145]:
        - button "Download YAML" [ref=e146] [cursor=pointer]
        - button "Download project ZIP" [ref=e147] [cursor=pointer]
        - button "Share source link" [ref=e148] [cursor=pointer]
      - paragraph [ref=e149]: The project ZIP includes custom footprints and imported assets. Source links contain YAML and footprints.
      - heading "PCB and outlines" [level=3] [ref=e150]
      - button "Download PCB and outlines ZIP" [ref=e152] [cursor=pointer]
      - button "board · KiCad PCB" [ref=e154] [cursor=pointer]
      - generic [ref=e155]:
        - button "board · DXF" [ref=e156] [cursor=pointer]
        - button "board · SVG" [ref=e157] [cursor=pointer]
      - heading "Case parts" [level=3] [ref=e158]
      - paragraph [ref=e159]: Generated case files match the current project.
      - button "Review case and manufacturing" [ref=e160] [cursor=pointer]
      - generic [ref=e161]:
        - checkbox "I reviewed dimensions, hardware and manufacturing findings." [checked] [ref=e162]
        - text: I reviewed dimensions, hardware and manufacturing findings.
      - button "Download case ZIP" [active] [ref=e164] [cursor=pointer]
      - paragraph [ref=e165]: Physical fit requires a fabricated prototype.
    - status "Project status" [ref=e166]:
      - generic [ref=e167]: 3D preview current · 0 keys
      - button "View findings" [ref=e168] [cursor=pointer]
```

# Test source

```ts
  124 |   await dialog.getByText('Parameters & source', { exact: true }).click();
  125 |   const exportingFootprint = page.waitForEvent('download');
  126 |   await dialog
  127 |     .getByRole('button', { name: 'Export footprint ZIP', exact: true })
  128 |     .click();
  129 |   await (await exportingFootprint).saveAs('test-results/footprint-library.zip');
  130 |   await dialog
  131 |     .getByRole('button', { name: 'Preview in case', exact: true })
  132 |     .click();
  133 |   dialog = page.getByRole('region', { name: 'Case designer' });
  134 |   await expect(
  135 |     dialog.getByRole('treeitem', { name: 'capacitor (4)', exact: true })
  136 |   ).toBeVisible({ timeout: 30000 });
  137 |   await dialog.getByRole('button', { name: 'Layout', exact: true }).click();
  138 |   await dialog
  139 |     .getByLabel('Mounting system', { exact: true })
  140 |     .selectOption('gasket');
  141 |   await expect(
  142 |     dialog.getByLabel('Mounting system', { exact: true })
  143 |   ).toHaveValue('gasket');
  144 |   await expect(
  145 |     dialog.getByLabel('Mounting system', { exact: true })
  146 |   ).toHaveValue('gasket');
  147 |   await page
  148 |     .getByRole('button', { name: 'Generate project', exact: true })
  149 |     .click();
  150 |   await expect(
  151 |     dialog.getByText(
  152 |       /Current geometry|Generation needs attention. Open Review for grouped findings./,
  153 |       {}
  154 |     )
  155 |   ).toBeVisible({ timeout: 90000 });
  156 |   if (await dialog.getByRole('alert').count()) {
  157 |     await dialog.getByRole('button', { name: 'Review', exact: true }).click();
  158 |     throw new Error(
  159 |       await dialog.getByRole('region', { name: 'Grouped findings' }).innerText()
  160 |     );
  161 |   }
  162 |   await expect(
  163 |     dialog.getByRole('status').filter({ hasText: /Current geometry/ })
  164 |   ).toBeVisible({ timeout: 90000 });
  165 |   await dialog.getByRole('button', { name: 'assembled', exact: true }).click();
  166 |   await expect(dialog.getByLabel('3D assembly preview')).toHaveAttribute(
  167 |     'data-rendered',
  168 |     'true'
  169 |   );
  170 |   await dialog.getByRole('button', { name: 'Review', exact: true }).click();
  171 |   const exportView = await openExport(page);
  172 |   await exportView
  173 |     .getByRole('checkbox', { name: /I reviewed dimensions/ })
  174 |     .check();
  175 |   await expect(
  176 |     exportView.getByRole('button', { name: 'Download case ZIP', exact: true })
  177 |   ).toBeEnabled();
  178 |   const downloading = page.waitForEvent('download');
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
> 224 |     ).toBeVisible({ timeout: 90000 });
      |       ^ Error: expect(locator).toBeVisible() failed
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
  279 |       .selectOption('fdm');
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
```
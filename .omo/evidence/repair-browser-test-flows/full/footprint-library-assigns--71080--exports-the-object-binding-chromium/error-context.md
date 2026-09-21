# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footprint-library.spec.ts >> assigns a model to a native BHK controller and exports the object binding
- Location: e2e/footprint-library.spec.ts:244:5

# Error details

```
TimeoutError: page.waitForEvent: Timeout 15000ms exceeded while waiting for event "download"
=========================== logs ===========================
waiting for event "download"
============================================================
```

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('region', { name: 'Board Studio' }).getByRole('main').getByRole('button', { name: 'Download case ZIP', exact: true })
    - locator resolved to <button>Download case ZIP</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action

```

# Test source

```ts
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
> 368 |     .click();
      |      ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
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
  380 | });
  381 |
```
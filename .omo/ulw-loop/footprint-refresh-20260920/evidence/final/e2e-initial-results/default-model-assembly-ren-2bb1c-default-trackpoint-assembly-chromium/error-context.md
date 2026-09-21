# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: default-model-assembly.spec.ts >> renders the default trackpoint assembly
- Location: e2e/default-model-assembly.spec.ts:216:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'Case designer' }).getByRole('status').filter({ hasText: /Current geometry/ })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 180000ms
  - waiting for getByRole('region', { name: 'Case designer' }).getByRole('status').filter({ hasText: /Current geometry/ })

```

# Test source

```ts
  132 |       )
  133 |       .replace('size: [30, 30]', 'size: [50, 50]'),
  134 |   },
  135 | ]) {
  136 |   test(`builds a native assembly from the default ${sample.name} model`, async ({
  137 |     page,
  138 |   }) => {
  139 |     const file = readdirSync('dist/assets').find((name) =>
  140 |       /^ergogen\.worker-.*\.js$/.test(name)
  141 |     );
  142 |     expect(file).toBeTruthy();
  143 |     await page.goto('./');
  144 |     const result = await page.evaluate(
  145 |       ({ file, source, timeout }) =>
  146 |         new Promise<{
  147 |           error?: string;
  148 |           models?: { frame?: number[]; path: string }[];
  149 |           volume?: number;
  150 |           meshBytes?: number;
  151 |         }>((resolve, reject) => {
  152 |           const worker = new Worker(new URL(`assets/${file}`, location.href), {
  153 |             type: 'module',
  154 |           });
  155 |           const timer = setTimeout(() => {
  156 |             worker.terminate();
  157 |             reject(new Error('Native model generation timed out'));
  158 |           }, timeout);
  159 |           worker.onerror = (event) => {
  160 |             clearTimeout(timer);
  161 |             worker.terminate();
  162 |             reject(new Error(event.message));
  163 |           };
  164 |           worker.onmessage = ({ data }) => {
  165 |             clearTimeout(timer);
  166 |             worker.terminate();
  167 |             const solid = data.results?.solids?.case_components_native_reset;
  168 |             resolve({
  169 |               error: data.error,
  170 |               models:
  171 |                 data.results?.designs?.boards?.case?.components?.[0]?.models,
  172 |               volume: solid?.volume,
  173 |               meshBytes: solid?.stl?.byteLength,
  174 |             });
  175 |           };
  176 |           worker.postMessage({
  177 |             type: 'generate',
  178 |             inputConfig: source,
  179 |             assets: {},
  180 |             requestId: 'default-model-test',
  181 |           });
  182 |         }),
  183 |       { file, source: sample.source, timeout: WORKER_TIMEOUT_MS }
  184 |     );
  185 |     expect(result.error).toBeUndefined();
  186 |     expect(result.models).toHaveLength('count' in sample ? sample.count : 1);
  187 |     expect(result.models![0].frame).toHaveLength(16);
  188 |     expect(result.models![0].path).toContain(sample.model);
  189 |     if (sample.name === 'Choc-solder') {
  190 |       expect(result.models!.map((model) => model.path).join(' ')).not.toContain(
  191 |         'Hotswap'
  192 |       );
  193 |     }
  194 |     expect(result.volume).toBeGreaterThan(0);
  195 |     const measured = measuredModels[sample.name];
  196 |     expect(Math.abs(result.volume! / measured.volume - 1)).toBeLessThan(
  197 |       MAX_VOLUME_RELATIVE_ERROR
  198 |     );
  199 |     for (const model of measured.models) {
  200 |       const bytes = readFileSync(
  201 |         `public/footprint-models/boardstudio/${model.path}`
  202 |       );
  203 |       expect(createHash('sha256').update(bytes).digest('hex')).toBe(
  204 |         model.sha256
  205 |       );
  206 |     }
  207 |     expect(
  208 |       result
  209 |         .models!.map(({ path }) =>
  210 |           path.replace('${KIPRJMOD}/models/boardstudio/', '')
  211 |         )
  212 |         .sort()
  213 |     ).toEqual(measured.models.map(({ path }) => path).sort());
  214 |     expect(result.meshBytes).toBeGreaterThan(84);
  215 |   });
  216 |   test(`renders the default ${sample.name} assembly`, async ({
  217 |     page,
  218 |   }, testInfo) => {
  219 |     await page.setViewportSize({ width: 1487, height: 1058 });
  220 |     await page.addInitScript(
  221 |       ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
  222 |       { key: CONFIG_LOCAL_STORAGE_KEY, source: sample.source }
  223 |     );
  224 |     await page.goto('./');
  225 |     await expect(studio(page)).toBeVisible();
  226 |     const designer = await openCase(page);
  227 |     await page
  228 |       .getByRole('button', { name: 'Generate project', exact: true })
  229 |       .click();
  230 |     await expect(
  231 |       designer.getByRole('status').filter({ hasText: /Current geometry/ })
> 232 |     ).toBeVisible({ timeout: WORKER_TIMEOUT_MS });
      |       ^ Error: expect(locator).toBeVisible() failed
  233 |     await designer
  234 |       .getByRole('button', { name: 'exploded', exact: true })
  235 |       .click();
  236 |     await expect(designer.getByLabel('3D assembly preview')).toHaveAttribute(
  237 |       'data-rendered',
  238 |       'true'
  239 |     );
  240 |     for (const name of ['Case shell', 'Top frame', 'Plate', 'PCB']) {
  241 |       await designer
  242 |         .getByRole('button', { name: `Hide ${name}`, exact: true })
  243 |         .click();
  244 |     }
  245 |     await page.mouse.move(0, 0);
  246 |     await page.screenshot({
  247 |       path: testInfo.outputPath('default-assembly.png'),
  248 |     });
  249 |   });
  250 | }
  251 | 
```
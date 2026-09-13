import { expect, test, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const WORKER_TIMEOUT_MS = 120000;
test.setTimeout(240000);

function modelFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return modelFiles(path);
    }
    return /\.(step|stp|wrl|stl)$/i.test(entry.name) ? [path] : [];
  });
}

test('imports real WRL, STEP, and STP models in the worker', async ({
  page,
}, testInfo) => {
  const workerFile = readdirSync('dist/assets').find((name) =>
    /^model\.worker-.*\.js$/.test(name)
  );
  expect(workerFile).toBeTruthy();
  const inputs = [
    {
      name: 'switch.wrl',
      source:
        '#VRML V2.0 utf8\nShape { appearance Appearance { material Material { diffuseColor 1 0 0 } } geometry IndexedFaceSet { coord Coordinate { point [0 0 0, 1 0 0, 0 1 1] } coordIndex [0, 1, 2, -1] } }',
    },
    {
      name: 'C_0603_1608Metric.step',
      source: readFileSync(
        'e2e/fixtures/footprint-library/C_0603_1608Metric.step',
        'utf8'
      ),
    },
    {
      name: 'SW_Cherry_MX_PCB.stp',
      source: readFileSync('public/components/SW_Cherry_MX_PCB.stp', 'utf8'),
    },
    ...['SMD_0805_Resistor.step', 'SMD_0805_Capacitor.step'].map((name) => ({
      name,
      source: readFileSync(
        `public/footprint-models/boardstudio/infused-kim/${name}`,
        'utf8'
      ),
    })),
    ...['PJ-320A.step', 'SK6812MINI-E v1.step'].map((name) => ({
      name,
      source: readFileSync(
        `public/footprint-models/boardstudio/keebio/${name}`,
        'utf8'
      ),
    })),
    {
      name: 'OLED-Module-with-Pins.step',
      source: readFileSync(
        'public/footprint-models/boardstudio/foostan/OLED-Module-with-Pins.step',
        'utf8'
      ),
    },
    ...[
      'Panasonic_EVQPUJ_EVQPUA.step',
      'Panasonic_EVQPUL_EVQPUC.step',
      'JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal.step',
    ].map((name) => ({
      name,
      source: readFileSync(
        `public/footprint-models/boardstudio/kicad/${name}`,
        'utf8'
      ),
    })),
  ];
  inputs.push({
    name: 'C_0603_1608Metric.wrl',
    source: readFileSync(
      'e2e/fixtures/footprint-library/C_0603_1608Metric.wrl',
      'utf8'
    ),
  });
  await page.goto('./');
  const results = await importModels(page, workerFile!, inputs);

  for (const result of results) {
    expect(result.error, result.name).toBeUndefined();
    expect(result.bounds[1][2], result.name).toBeGreaterThan(
      result.bounds[0][2]
    );
    expect(result.stl, result.name).toMatch(/^base64:/);
    expect(result.vrml, result.name).toContain('#VRML V2.0 utf8');
  }
  await testInfo.attach('model-imports.json', {
    body: JSON.stringify(
      results.map(({ name, bounds, stl, vrml }) => ({
        name,
        bounds,
        stlLength: stl.length,
        vrmlLength: vrml.length,
      })),
      null,
      2
    ),
    contentType: 'application/json',
  });
  // These models share the footprint's 1.25 x 2 mm body and Y-axis terminals.
  for (const result of results.slice(3, 5)) {
    const [min, max] = result.bounds;
    expect(max[0] - min[0], result.name).toBeCloseTo(1.25, 4);
    expect(max[1] - min[1], result.name).toBeCloseTo(2, 4);
    expect(Math.abs((max[0] + min[0]) / 2), result.name).toBeLessThan(0.02);
    expect(Math.abs((max[1] + min[1]) / 2), result.name).toBeLessThan(0.02);
    expect(min[2], result.name).toBeGreaterThanOrEqual(0);
  }
  const realWrl = results.find(
    (result) => result.name === 'C_0603_1608Metric.wrl'
  )!;
  const realStep = results.find(
    (result) => result.name === 'C_0603_1608Metric.step'
  )!;
  for (let axis = 0; axis < 3; axis++) {
    expect(realWrl.bounds[1][axis] - realWrl.bounds[0][axis]).toBeCloseTo(
      realStep.bounds[1][axis] - realStep.bounds[0][axis],
      1
    );
  }
  for (const extent of results[0].bounds[1]) {
    expect(extent).toBeCloseTo(2.54, 5);
  }
  expect(results[2].bounds[1][0] - results[2].bounds[0][0]).toBeCloseTo(
    15.6,
    1
  );
});

// Candidate paths can be unrelated models; validate each independently.
for (const path of process.env.QA_MODEL_PATH?.split(',') ?? []) {
  test(`imports candidate ${path.split('/').pop()}`, async ({
    page,
  }, testInfo) => {
    const workerFile = readdirSync('dist/assets').find((name) =>
      /^model\.worker-.*\.js$/.test(name)
    );
    expect(workerFile).toBeTruthy();
    await page.goto('./');
    const [result] = await importModels(page, workerFile!, [
      {
        name: path.split('/').pop()!,
        source: readFileSync(path, 'utf8'),
      },
    ]);
    expect(result.error).toBeUndefined();
    expect(result.bounds.flat().every(Number.isFinite)).toBe(true);
    expect(result.stl).toMatch(/^base64:/);
    if (process.env.QA_MAX_TRIANGLES) {
      const bytes = Buffer.from(result.stl.slice('base64:'.length), 'base64');
      expect(bytes.readUInt32LE(80)).toBeLessThan(
        Number(process.env.QA_MAX_TRIANGLES)
      );
    }
    expect(result.vrml).toContain('#VRML V2.0 utf8');
    await testInfo.attach('candidate.json', {
      body: JSON.stringify({
        name: result.name,
        bounds: result.bounds,
        stlLength: result.stl.length,
        vrmlLength: result.vrml.length,
      }),
      contentType: 'application/json',
    });
  });
}

async function importModels(
  page: Page,
  workerFile: string,
  inputs: { name: string; source: string }[]
) {
  return page.evaluate(
    async ({ workerFile, inputs, timeout }) => {
      const results = [];
      for (const input of inputs) {
        const result = await new Promise<{
          error?: string;
          bounds: number[][];
          stl: string;
          vrml: string;
        }>((resolve, reject) => {
          const worker = new Worker(
            new URL(`assets/${workerFile}`, location.href),
            { type: 'module' }
          );
          const timer = setTimeout(() => {
            worker.terminate();
            reject(new Error(`Timed out importing ${input.name}`));
          }, timeout);
          worker.onerror = (event) => {
            clearTimeout(timer);
            worker.terminate();
            reject(new Error(event.message));
          };
          worker.onmessage = ({ data }) => {
            clearTimeout(timer);
            worker.terminate();
            resolve(data);
          };
          worker.postMessage(input);
        });
        results.push({ name: input.name, ...result });
      }
      return results;
    },
    { workerFile, inputs, timeout: WORKER_TIMEOUT_MS }
  );
}

// Each asset gets its own deadline and result; a slow model cannot hide the rest.
const bundledRoot = 'public/footprint-models';
for (const path of modelFiles(bundledRoot).sort()) {
  const name = relative(bundledRoot, path);
  test(`imports bundled ${name}`, async ({ page }, testInfo) => {
    const workerFile = readdirSync('dist/assets').find((name) =>
      /^model\.worker-.*\.js$/.test(name)
    );
    expect(workerFile).toBeTruthy();
    await page.goto('./');
    const [result] = await importModels(page, workerFile!, [
      {
        name,
        source: /\.stl$/i.test(path)
          ? `base64:${readFileSync(path).toString('base64')}`
          : readFileSync(path, 'utf8'),
      },
    ]);
    expect(result.error, name).toBeUndefined();
    for (let axis = 0; axis < 3; axis++) {
      expect(Number.isFinite(result.bounds[0][axis]), name).toBe(true);
      expect(Number.isFinite(result.bounds[1][axis]), name).toBe(true);
      expect(result.bounds[1][axis], name).toBeGreaterThan(
        result.bounds[0][axis]
      );
    }
    expect(result.stl, name).toMatch(/^base64:/);
    const stl = Buffer.from(result.stl.slice('base64:'.length), 'base64');
    const stlHeaderBytes = 84;
    const stlTriangleBytes = 50;
    expect(stl.length, name).toBeGreaterThan(stlHeaderBytes);
    const triangles = stl.readUInt32LE(stlHeaderBytes - 4);
    if (name === 'boardstudio/koktoh/Choc_V2_Red.step') {
      // The spring previously expanded this preview to 1.2 million triangles.
      const maxSwitchTriangles = 250000;
      expect(triangles).toBeLessThan(maxSwitchTriangles);
      for (const [index, expected] of [
        -7.5, -7.5, -3.3, 7.5, 7.5, 8.6,
      ].entries()) {
        expect(result.bounds.flat()[index]).toBeCloseTo(expected, 2);
      }
    }
    expect(stl.length, name).toBe(
      stlHeaderBytes + triangles * stlTriangleBytes
    );
    expect(result.vrml, name).toContain('#VRML V2.0 utf8');
    await testInfo.attach('model-import.json', {
      body: JSON.stringify({ name, bounds: result.bounds, triangles }),
      contentType: 'application/json',
    });
  });
}

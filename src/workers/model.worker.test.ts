import { afterEach, expect, it, vi } from 'vitest';
import { assetBytes } from '../utils/caseAssets';
import { STLLoader } from 'three-stdlib';
afterEach(() => vi.unstubAllGlobals());
it('converts KiCad VRML into visible millimetre triangles', async () => {
  const scope = {
    postMessage: vi.fn(),
    onmessage: null as null | ((event: unknown) => Promise<void>),
  };
  vi.stubGlobal('self', scope);
  vi.resetModules();
  await import('./model.worker');
  await scope.onmessage!({
    data: {
      name: 'test.wrl',
      source:
        '#VRML V2.0 utf8\nTransform { translation 1 2 3 children [ Shape { geometry Box { size 2 4 6 } } ] }',
    },
  });
  const result = scope.postMessage.mock.calls[0][0];
  expect(result.error).toBeUndefined();
  expect(result.bounds[1][2]).toBeCloseTo(15.24);
  const geometry = new STLLoader().parse(
    assetBytes(result.stl).buffer as ArrayBuffer
  );
  expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
  geometry.dispose();
});

it('accepts VRML filenames with URL fragments', async () => {
  const scope = {
    postMessage: vi.fn(),
    onmessage: null as null | ((event: unknown) => Promise<void>),
  };
  vi.stubGlobal('self', scope);
  vi.resetModules();
  await import('./model.worker');

  await scope.onmessage!({
    data: {
      name: 'switch.wrl?download=1',
      source:
        '#VRML V2.0 utf8\nShape { appearance Appearance { material Material { diffuseColor 1 0 0 } } geometry Box { size 1 1 1 } }',
    },
  });

  expect(scope.postMessage.mock.calls[0][0].error).toBeUndefined();
  expect(scope.postMessage.mock.calls[0][0].bounds[1][0]).toBeCloseTo(1.27);
});

it('imports KiCad StepUp material names containing hyphens', async () => {
  const scope = {
    postMessage: vi.fn(),
    onmessage: null as null | ((event: unknown) => Promise<void>),
  };
  vi.stubGlobal('self', scope);
  vi.resetModules();
  await import('./model.worker');
  await scope.onmessage!({
    data: {
      name: 'capacitor.wrl',
      source:
        '#VRML V2.0 utf8\nShape { appearance Appearance { material DEF PIN-01 Material { diffuseColor 0.8 0.8 0.8 } } }\nShape { appearance Appearance { material USE PIN-01 } geometry Box { size 1 2 3 } }',
    },
  });
  const result = scope.postMessage.mock.calls[0][0];
  expect(result.error).toBeUndefined();
  expect(result.bounds[1][2] - result.bounds[0][2]).toBeCloseTo(7.62);
});

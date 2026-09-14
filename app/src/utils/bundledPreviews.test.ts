import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { bundledPreviews } from './bundledPreviews';

const name = 'boardstudio/test/part.step';
const path = '${KIPRJMOD}/models/' + name;
const workers: {
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
  onmessage?: (event: { data: unknown }) => void;
}[] = [];
let dispatchError = '';
beforeEach(() => {
  workers.length = 0;
  dispatchError = '';
  vi.stubGlobal(
    'Worker',
    vi.fn(function () {
      const worker = {
        postMessage: vi.fn(() => {
          if (dispatchError) {
            throw new Error(dispatchError);
          }
        }),
        terminate: vi.fn(),
      };
      workers.push(worker);
      return worker;
    })
  );
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

it('terminates a preview worker when message dispatch fails', async () => {
  dispatchError = 'Cannot clone model';
  await expect(
    bundledPreviews([path], { [name]: 'owned' }, new AbortController().signal)
  ).rejects.toThrow(dispatchError);
  expect(workers[0].terminate).toHaveBeenCalledOnce();
});

it('cancels an active conversion and preserves owned model bytes', async () => {
  const controller = new AbortController();
  const pending = bundledPreviews(
    [path],
    { [name]: 'owned' },
    controller.signal
  );
  const rejected = expect(pending).rejects.toThrow('Selection changed');
  await vi.waitFor(() => expect(workers).toHaveLength(1));
  expect(workers[0].postMessage).toHaveBeenCalledWith({
    name,
    source: 'owned',
  });
  expect(fetch).not.toHaveBeenCalled();
  controller.abort(new Error('Selection changed'));
  await rejected;
  expect(workers[0].terminate).toHaveBeenCalledOnce();
});

it('reuses a matching cached conversion without starting a worker', async () => {
  const metadata = JSON.stringify({ source: 'owned', stl: 'cached' });
  const assets = { [name]: 'owned', [`__model_${name}.json`]: metadata };
  expect(
    await bundledPreviews([path], assets, new AbortController().signal)
  ).toEqual(assets);
  expect(workers).toHaveLength(0);
  expect(fetch).not.toHaveBeenCalled();
});

it('loads the official STEP preview for a KiCad WRL reference automatically', async () => {
  const reference =
    '${KICAD10_3DMODEL_DIR}/Capacitor_SMD.3dshapes/C_0603_1608Metric.wrl';
  vi.mocked(fetch).mockResolvedValue(new Response('ISO-10303-21;'));
  const pending = bundledPreviews(
    [reference],
    {},
    new AbortController().signal
  );
  await vi.waitFor(() => expect(workers).toHaveLength(1));
  expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain(
    'C_0603_1608Metric.step'
  );
  expect(workers[0].postMessage).toHaveBeenCalledWith({
    name: 'C_0603_1608Metric.step',
    source: 'ISO-10303-21;',
  });
  workers[0].onmessage?.({
    data: {
      stl: 'mesh',
      vrml: '#VRML V2.0 utf8',
      bounds: [
        [0, 0, 0],
        [1, 1, 1],
      ],
    },
  });
  const previews = await pending;
  const { modelPreview } = await import('./cachedModelPreview');
  expect(
    JSON.parse(modelPreview({ path: reference }, previews)!)
  ).toMatchObject({ stl: 'mesh' });
  // STEP bytes must never masquerade as an authored WRL asset.
  expect(previews[reference]).toBeUndefined();
});

it('uses owned WRL bytes before requesting an official counterpart', async () => {
  const reference = '${KICAD10_3DMODEL_DIR}/part.wrl';
  const pending = bundledPreviews(
    [reference],
    { [reference]: '#VRML owned' },
    new AbortController().signal
  );
  await vi.waitFor(() => expect(workers).toHaveLength(1));
  expect(fetch).not.toHaveBeenCalled();
  expect(workers[0].postMessage).toHaveBeenCalledWith({
    name: reference,
    source: '#VRML owned',
  });
  workers[0].onmessage?.({ data: { stl: 'owned mesh' } });
  expect(JSON.parse((await pending)[`__model_${reference}.json`]).stl).toBe(
    'owned mesh'
  );
});

it('falls back to the official WRL when its STEP counterpart is unavailable', async () => {
  const reference = '${KICAD10_3DMODEL_DIR}/part.wrl';
  const NOT_FOUND = 404;
  vi.mocked(fetch)
    .mockResolvedValueOnce(new Response('', { status: NOT_FOUND }))
    .mockResolvedValueOnce(new Response('#VRML V2.0 utf8'));
  const pending = bundledPreviews(
    [reference],
    {},
    new AbortController().signal
  );
  await vi.waitFor(() => expect(workers).toHaveLength(1));
  expect(workers[0].postMessage).toHaveBeenCalledWith({
    name: 'part.wrl',
    source: '#VRML V2.0 utf8',
  });
  workers[0].onmessage?.({ data: { stl: 'fallback mesh' } });
  expect(JSON.parse((await pending)[`__model_${reference}.json`]).stl).toBe(
    'fallback mesh'
  );
});

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

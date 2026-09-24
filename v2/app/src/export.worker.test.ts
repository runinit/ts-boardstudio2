import { afterEach, describe, expect, it, vi } from 'vitest';

const { init, artifactRequest, archiveRequest } = vi.hoisted(() => ({
  init: vi.fn(),
  artifactRequest: vi.fn(),
  archiveRequest: vi.fn(),
}));

vi.mock('../../core/pkg/boardstudio_core.js', () => ({
  default: init,
  artifact_request: artifactRequest,
  archive_request: archiveRequest,
}));

type WorkerDispatch = {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
});

describe('export worker WASM initialization', () => {
  it('retries initialization after reporting the first request error', async () => {
    init.mockRejectedValueOnce(new Error('temporary WASM startup failure')).mockResolvedValueOnce(undefined);
    artifactRequest.mockReturnValue(JSON.stringify({ id: 'second', kind: 'compile-footprints', result: [] }));
    const worker: WorkerDispatch = { onmessage: null, postMessage: vi.fn() };
    vi.stubGlobal('self', worker);

    await import('./export.worker.ts');
    const dispatch = (id: string) => worker.onmessage?.({
      data: { id, kind: 'artifact', request: { id, kind: 'compile-footprints', jobs: [] } },
    } as MessageEvent);

    dispatch('first');
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledTimes(1));
    expect(worker.postMessage).toHaveBeenNthCalledWith(1, {
      id: 'first', kind: 'error', message: 'temporary WASM startup failure',
    });

    dispatch('second');
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledTimes(2));
    expect(init).toHaveBeenCalledTimes(2);
    expect(artifactRequest).toHaveBeenCalledTimes(1);
    expect(worker.postMessage).toHaveBeenNthCalledWith(2, {
      id: 'second', kind: 'compile-footprints', result: [],
    }, []);
  });
});

it('retries failed initialization for archive requests and transfers owned result bytes', async () => {
  init.mockRejectedValueOnce(new Error('temporary archive startup failure')).mockResolvedValueOnce(undefined);
  const bytes = new Uint8Array([80, 75]);
  archiveRequest.mockReturnValue([JSON.stringify({ kind: 'packed' }), [bytes]]);
  const worker: WorkerDispatch = { onmessage: null, postMessage: vi.fn() };
  vi.stubGlobal('self', worker);
  await import('./export.worker.ts');
  const dispatch = (id: string) => worker.onmessage?.({ data: { id, kind: 'archive', request: { kind: 'pack-files', entries: [] }, buffers: [] } } as MessageEvent);
  dispatch('first');
  await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledTimes(1));
  expect(worker.postMessage).toHaveBeenNthCalledWith(1, { id: 'first', kind: 'error', message: 'temporary archive startup failure' });
  dispatch('second');
  await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledTimes(2));
  expect(init).toHaveBeenCalledTimes(2);
  expect(worker.postMessage).toHaveBeenNthCalledWith(2, { id: 'second', kind: 'archive', reply: { kind: 'packed', bytes } }, [bytes.buffer]);
});

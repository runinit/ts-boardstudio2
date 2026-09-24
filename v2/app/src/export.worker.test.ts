import { afterEach, describe, expect, it, vi } from 'vitest';

const { init, artifactRequest } = vi.hoisted(() => ({
  init: vi.fn(),
  artifactRequest: vi.fn(),
}));

vi.mock('../../core/pkg/boardstudio_core.js', () => ({
  default: init,
  artifact_request: artifactRequest,
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

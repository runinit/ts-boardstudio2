import { act, renderHook } from '@testing-library/react';
import { useStudio } from './useStudio';
import { SETTLE_MS } from '../utils/studioQueue';
const mocks = vi.hoisted(() => ({ create: vi.fn(), resolve: vi.fn() }));
vi.mock('../workers/workerFactory', () => ({
  createErgogenWorker: mocks.create,
}));
vi.mock('ergogen/src/native/draft', () => ({ resolveLayout: mocks.resolve }));
vi.mock('./useFootprintLibrary', () => ({
  useFootprintLibrary: () => ({ entries: [] }),
}));
vi.mock('../utils/footprintLibrary', () => ({ libraryAssets: () => ({}) }));
const source = 'schema: ergogen/v1\nlayout: {objects: {}}';
function setup() {
  const worker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null as ((event: { data: unknown }) => void) | null,
  };
  mocks.create.mockReturnValue(worker);
  mocks.resolve.mockImplementation((value) => ({
    objects: { draft: { position: [Object.keys(value).length, 0, 0] } },
    findings: [],
  }));
  const session = {
    source,
    injections: [],
    assets: {},
    revision: 0,
    action: 'restore' as 'restore' | 'edit' | 'amend',
    amend: vi.fn(() => true),
    edit: vi.fn(),
  };
  const hook = renderHook((props) => useStudio(props), {
    initialProps: session,
  });
  return { worker, session, ...hook };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});
afterEach(() => vi.useRealTimers());
it('draws each draft immediately and does not rewrite an opened document', () => {
  const { result, worker, session, rerender, unmount } = setup();
  expect(result.current.report?.objects.draft.position[0]).toBe(2);
  act(() => vi.advanceTimersByTime(SETTLE_MS));
  expect(worker.postMessage.mock.calls[0][0].outline).toBe('keep');
  rerender({
    ...session,
    source: source + '\nunits: {pitch: 19}',
    revision: 1,
    action: 'edit',
  });
  expect(result.current.report?.objects.draft.position[0]).toBe(3);
  expect(session.amend).not.toHaveBeenCalled();
  unmount();
});
it('ignores an obsolete success after undo even when source matches again', () => {
  const { worker, session, rerender, unmount } = setup();
  act(() => vi.advanceTimersByTime(SETTLE_MS));
  const sent = worker.postMessage.mock.calls[0][0];
  rerender({ ...session, source: source + '\n', revision: 1, action: 'edit' });
  rerender({ ...session, revision: 2, action: 'restore' });
  act(() =>
    worker.onmessage?.({
      data: {
        type: 'success',
        requestId: sent.requestId,
        revision: sent.revision,
        source: 'obsolete',
        results: {},
      },
    })
  );
  expect(session.amend).not.toHaveBeenCalled();
  unmount();
});
it('keeps the last outline during updates and amends only a completed request', () => {
  const { result, worker, session, rerender, unmount } = setup();
  act(() => vi.advanceTimersByTime(SETTLE_MS));
  const sent = worker.postMessage.mock.calls[0][0];
  const designs = { features: { 'profiles.main': { model: { paths: {} } } } };
  act(() =>
    worker.onmessage?.({
      data: {
        type: 'success',
        requestId: sent.requestId,
        revision: sent.revision,
        results: { designs },
        source,
      },
    })
  );
  rerender({ ...session, source: source + '\n', revision: 1, action: 'edit' });
  expect(result.current.analysis.result?.designs).toEqual(designs);
  act(() => vi.advanceTimersByTime(SETTLE_MS));
  const next = worker.postMessage.mock.calls.at(-1)![0];
  expect(next.outline).toBe('rebuild');
  act(() =>
    worker.onmessage?.({
      data: {
        type: 'success',
        requestId: next.requestId,
        revision: next.revision,
        results: { designs },
        source: 'generated',
      },
    })
  );
  expect(session.amend).toHaveBeenCalledWith(1, source + '\n', 'generated');
  unmount();
});

it('rejects a result after switching projects with identical source', () => {
  const { worker, session, rerender, unmount } = setup();
  act(() => vi.advanceTimersByTime(SETTLE_MS));
  const sent = worker.postMessage.mock.calls[0][0];
  rerender({ ...session, ...{ project: 'different-project' } });
  act(() =>
    worker.onmessage?.({
      data: {
        type: 'success',
        requestId: sent.requestId,
        revision: sent.revision,
        source: 'obsolete',
        results: {},
      },
    })
  );
  expect(session.amend).not.toHaveBeenCalled();
  unmount();
});

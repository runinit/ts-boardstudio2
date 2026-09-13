import { StudioQueue, SETTLE_MS, SUPERSEDE_MS } from './studioQueue';

const request = (revision: string) => ({ revision, source: revision });
const workers: ReturnType<typeof worker>[] = [];
function worker() {
  return {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null as ((event: { data: unknown }) => void) | null,
    onerror: null,
  };
}
function setup() {
  const publish = vi.fn();
  const queue = new StudioQueue(() => {
    const next = worker();
    workers.push(next);
    return next as unknown as Worker;
  }, publish);
  return { queue, publish };
}
beforeEach(() => {
  vi.useFakeTimers();
  workers.length = 0;
});
afterEach(() => vi.useRealTimers());
it('coalesces edits and ignores all obsolete staged replies', () => {
  const { queue, publish } = setup();
  queue.schedule(request('a'));
  vi.advanceTimersByTime(SETTLE_MS);
  const first = workers[0].postMessage.mock.calls[0][0];
  queue.schedule(request('b'));
  queue.schedule(request('c'));
  workers[0].onmessage?.({
    data: {
      type: 'stage',
      stage: 'layout',
      requestId: first.requestId,
      revision: 'a',
      results: {},
    },
  });
  expect(publish).not.toHaveBeenCalled();
  vi.advanceTimersByTime(SETTLE_MS);
  workers[0].onmessage?.({
    data: { type: 'superseded', requestId: first.requestId, revision: 'a' },
  });
  expect(workers[0].postMessage.mock.calls.at(-1)?.[0].inputConfig).toBe('c');
  queue.dispose();
});
it('replaces a blocked worker only after its grace period', () => {
  const { queue } = setup();
  queue.schedule(request('a'));
  vi.advanceTimersByTime(SETTLE_MS);
  queue.schedule(request('b'));
  vi.advanceTimersByTime(SUPERSEDE_MS - 1);
  expect(workers[0].terminate).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(workers[0].terminate).toHaveBeenCalledOnce();
  expect(workers[1].postMessage.mock.calls[0][0].inputConfig).toBe('b');
  queue.dispose();
});
it('rejects replies with mismatched revisions and retains a reusable worker', () => {
  const { queue, publish } = setup();
  queue.schedule(request('a'));
  vi.advanceTimersByTime(SETTLE_MS);
  const message = workers[0].postMessage.mock.calls[0][0];
  workers[0].onmessage?.({
    data: {
      type: 'success',
      requestId: message.requestId,
      revision: 'different',
      results: {},
    },
  });
  expect(publish).not.toHaveBeenCalled();
  workers[0].onmessage?.({
    data: {
      type: 'success',
      requestId: message.requestId,
      revision: 'a',
      results: {},
    },
  });
  expect(publish).toHaveBeenCalledOnce();
  queue.schedule(request('b'));
  vi.advanceTimersByTime(SETTLE_MS);
  expect(workers).toHaveLength(1);
  queue.dispose();
});

import { afterEach, expect, test, vi } from 'vitest';
import { emptyProject } from '@boardstudio/v2-contracts';
import type { CoreReply, SceneDelta } from '@boardstudio/v2-contracts';
import { CoreClient } from './CoreClient';

const workers: FakeWorker[] = [];

class FakeWorker {
  onmessage: ((event: MessageEvent<CoreReply>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  sent: unknown[] = [];

  constructor() {
    workers.push(this);
  }

  postMessage(request: unknown): void {
    this.sent.push(request);
  }

  terminate(): void {}

  reply(reply: CoreReply): void {
    this.onmessage?.({ data: reply } as MessageEvent<CoreReply>);
  }

  fail(): void {
    this.onerror?.({ preventDefault() {} } as ErrorEvent);
  }
}

const scene: SceneDelta = {
  revision: 0,
  transactionId: 'test',
  changedIds: [],
  transforms: [],
  contours: [],
  boardContours: [],
  boardReadiness: [],
  findings: [],
  readiness: { layout: true, outline: false, pcb: false, case: false },
};

afterEach(() => {
  workers.length = 0;
  vi.unstubAllGlobals();
});

test('restores the committed document after a preview crashes the worker', async () => {
  vi.stubGlobal('Worker', FakeWorker);
  const client = new CoreClient();
  const committed = emptyProject('project', 'Committed');
  const preview = { ...committed, name: 'Uncommitted preview' };

  const opening = client.request({ id: 'open', kind: 'open', document: committed });
  workers[0].reply({ id: 'open', kind: 'scene', scene, document: committed });
  await opening;

  const pending = client.request({
    id: 'preview',
    kind: 'edit',
    command: { baseRevision: 0, phase: 'preview', transactionId: 'drag', targetIds: [], operation: { kind: 'replace-document', document: preview } },
  });
  workers[0].reply({ id: 'preview', kind: 'preview', scene });
  await pending;
  workers[0].fail();

  expect(workers[1].sent).toEqual([{ id: expect.any(String), kind: 'open', document: committed }]);
  client.close();
});

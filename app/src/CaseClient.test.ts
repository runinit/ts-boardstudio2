import { afterEach, expect, test, vi } from 'vitest';
import type { CaseResult, PreparedCaseAssemblyIR } from '@boardstudio/v2-contracts';
import type { StepModel } from '@boardstudio/v2-cad';
import { CaseClient } from './CaseClient';

const workers: FakeWorker[] = [];

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  sent: { message: unknown; transfer?: Transferable[] }[] = [];

  constructor() { workers.push(this); }
  postMessage(message: unknown, transfer?: Transferable[]): void { this.sent.push({ message, transfer }); }
  terminate(): void {}
  reply(data: unknown): void { this.onmessage?.({ data } as MessageEvent); }
  fail(): void { this.onerror?.({ preventDefault() {} } as ErrorEvent); }
}

afterEach(() => {
  workers.length = 0;
  vi.unstubAllGlobals();
});

test('keeps the prepared case worker protocol and transfers STEP and mesh buffers', async () => {
  vi.stubGlobal('Worker', FakeWorker);
  const client = new CaseClient();
  const ir = { revision: 3, bodies: [] } as PreparedCaseAssemblyIR;
  const pending = client.request(ir);
  const request = workers[0].sent[0].message as { id: string; kind: string; ir: PreparedCaseAssemblyIR };
  expect(request).toMatchObject({ kind: 'case', ir });

  const result: CaseResult = {
    revision: 3,
    step: new Uint8Array([1, 2]),
    mesh: { positions: new Float32Array([0, 1, 2]), normals: new Float32Array([0, 0, 1]) },
  };
  workers[0].reply({ id: request.id, kind: 'case', result });
  await expect(pending).resolves.toBe(result);
  client.close();
});

test('transfers a private copy when importing a STEP model', async () => {
  vi.stubGlobal('Worker', FakeWorker);
  const client = new CaseClient();
  const source = new Uint8Array([1, 2, 3]);
  const pending = client.requestModel(source);
  const sent = workers[0].sent[0];
  const request = sent.message as { id: string; kind: string; bytes: Uint8Array };
  expect(request.kind).toBe('model');
  expect(request.bytes).not.toBe(source);
  expect(sent.transfer).toEqual([request.bytes.buffer]);

  const result = { mesh: { positions: new Float32Array([0]), normals: new Float32Array([1]) }, bounds: { min: [0, 0, 0], max: [0, 0, 0] } } as StepModel;
  workers[0].reply({ id: request.id, kind: 'model', result });
  await expect(pending).resolves.toBe(result);
  expect(source).toEqual(new Uint8Array([1, 2, 3]));
  client.close();
});

test('rejects pending CAD work when its worker fails and serves later work on the replacement', async () => {
  vi.stubGlobal('Worker', FakeWorker);
  const client = new CaseClient();
  const pending = client.request({ revision: 4, bodies: [] } as PreparedCaseAssemblyIR);
  workers[0].fail();

  await expect(pending).rejects.toThrow('CAD worker failed and restarted');
  expect(workers).toHaveLength(2);

  const later = client.request({ revision: 5, bodies: [] } as PreparedCaseAssemblyIR);
  const nextRequest = workers[1].sent[0].message as { id: string; kind: string; ir: PreparedCaseAssemblyIR };
  expect(nextRequest).toMatchObject({ kind: 'case', ir: { revision: 5 } });
  const result = { revision: 5 } as CaseResult;
  workers[1].reply({ id: nextRequest.id, kind: 'case', result });
  await expect(later).resolves.toBe(result);
  client.close();
});

import { afterEach, expect, test, vi } from 'vitest';
import type { ArtifactReply, PartDefinition } from '@boardstudio/v2-contracts';
import { ExportClient } from './ExportClient';

const workers: FakeWorker[] = [];

class FakeWorker {
  onmessage: ((event: MessageEvent<ArtifactReply>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  sent: { id: string; request: { id: string } }[] = [];

  constructor() { workers.push(this); }
  postMessage(message: { id: string; request: { id: string } }): void { this.sent.push(message); }
  terminate(): void {}
  reply(reply: ArtifactReply): void { this.onmessage?.({ data: reply } as MessageEvent<ArtifactReply>); }
}

const definition = (id: string): PartDefinition => ({ id, name: id, kind: 'custom', pads: [], courtyard: [] });
const job = (id: string) => ({ id, definition: definition(id), parameters: {}, side: 'front' as const });

afterEach(() => {
  workers.length = 0;
  vi.unstubAllGlobals();
});

test('deduplicates in-flight footprint compilation and resolves out-of-order replies by request id', async () => {
  vi.stubGlobal('Worker', FakeWorker);
  vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValueOnce('a').mockReturnValueOnce('b') });
  const client = new ExportClient();
  const first = client.compile([job('first')]);
  const duplicate = client.compile([job('first')]);
  const second = client.compile([job('second')]);

  expect(workers[0].sent).toHaveLength(2);
  workers[0].reply({ id: 'b', kind: 'compile-footprints', result: [{ definition: definition('second'), geometry: { side: 'front', pads: [], courtyard: [], traces: [], vias: [] }, diagnostics: [], previewSvg: null }] });
  workers[0].reply({ id: 'a', kind: 'compile-footprints', result: [{ definition: definition('first'), geometry: { side: 'front', pads: [], courtyard: [], traces: [], vias: [] }, diagnostics: [], previewSvg: null }] });
  await expect(second).resolves.toMatchObject([{ definition: { id: 'second' } }]);
  await expect(first).resolves.toMatchObject([{ definition: { id: 'first' } }]);
  await expect(duplicate).resolves.toMatchObject([{ definition: { id: 'first' } }]);
  client.close();
});

test('rejects pending artifact promises when the client closes', async () => {
  vi.stubGlobal('Worker', FakeWorker);
  vi.stubGlobal('crypto', { randomUUID: () => 'pending' });
  const client = new ExportClient();
  const pending = client.compile([job('first')]);
  client.close();
  await expect(pending).rejects.toThrow('Export worker was closed');
});

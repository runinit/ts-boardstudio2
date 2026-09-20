import { writeFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';

type Packet = {
  direction: 'request' | 'reply';
  time: number;
  type: string;
  requestId: string;
  revision: string;
  source?: string;
  stage?: string;
  error?: string;
};
declare global {
  interface Window {
    studioPackets: Packet[];
  }
}

export async function installWorkerProbe(page: Page) {
  await page.addInitScript(() => {
    window.studioPackets = [];
    const record = (message: unknown, direction: Packet['direction']) => {
      if (
        typeof message !== 'object' ||
        message === null ||
        !('requestId' in message) ||
        typeof message.requestId !== 'string' ||
        !('revision' in message) ||
        typeof message.revision !== 'string' ||
        !('type' in message) ||
        typeof message.type !== 'string'
      )
        return;
      const source =
        direction === 'request' && 'inputConfig' in message
          ? message.inputConfig
          : 'source' in message
            ? message.source
            : undefined;
      window.studioPackets.push({
        direction,
        time: performance.now(),
        type: message.type,
        requestId: message.requestId,
        revision: message.revision,
        source: typeof source === 'string' ? source : undefined,
        stage:
          'stage' in message && typeof message.stage === 'string'
            ? message.stage
            : undefined,
        error:
          'error' in message && typeof message.error === 'string'
            ? message.error
            : undefined,
      });
    };
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        this.addEventListener('message', (event) =>
          record(event.data, 'reply')
        );
      }
      postMessage(message: unknown, transfer: Transferable[]): void;
      postMessage(message: unknown, options?: StructuredSerializeOptions): void;
      postMessage(
        message: unknown,
        options: Transferable[] | StructuredSerializeOptions = []
      ): void {
        record(message, 'request');
        if (Array.isArray(options)) super.postMessage(message, options);
        else super.postMessage(message, options);
      }
    };
  });
}

export async function waitForStudio(page: Page, source: string, after: number) {
  await page.waitForFunction(
    ({ source, after }) => {
      const request = window.studioPackets.findLast(
        (packet) =>
          packet.direction === 'request' &&
          packet.type === 'studio' &&
          packet.source === source &&
          packet.time >= after
      );
      return (
        request &&
        window.studioPackets.some(
          (packet) =>
            packet.direction === 'reply' &&
            packet.requestId === request.requestId &&
            packet.revision === request.revision &&
            ['success', 'error'].includes(packet.type)
        )
      );
    },
    { source, after },
    { timeout: 60000 }
  );
  const packets = await page.evaluate(
    ({ source, after }) => {
      const request = window.studioPackets.findLast(
        (packet) =>
          packet.direction === 'request' &&
          packet.type === 'studio' &&
          packet.source === source &&
          packet.time >= after
      );
      if (!request) return [];
      return window.studioPackets.filter(
        (packet) =>
          packet.requestId === request.requestId &&
          packet.revision === request.revision
      );
    },
    { source, after }
  );
  const request = packets.find((packet) => packet.direction === 'request');
  const outline = packets.find((packet) => packet.stage === 'outline');
  const success = packets.find((packet) => packet.type === 'success');
  if (!request || !outline || !success)
    throw new Error(JSON.stringify(packets));
  return {
    requestId: request.requestId,
    revision: request.revision,
    outlineStageMs: outline.time - after,
    publishedSuccessMs: success.time - after,
    requestToOutlineMs: outline.time - request.time,
    requestToSuccessMs: success.time - request.time,
  };
}

export async function writeWorkerPackets(
  page: Page,
  path: string,
  requestId: string,
  revision: string
) {
  const packets = await page.evaluate(
    ({ requestId, revision }) =>
      window.studioPackets.filter(
        (packet) =>
          packet.requestId === requestId && packet.revision === revision
      ),
    { requestId, revision }
  );
  await writeFile(path, JSON.stringify(packets, null, 2));
}

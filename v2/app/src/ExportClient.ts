import type { ExportReply, ExportRequest } from './export.worker';

export class ExportClient {
  private worker: Worker;
  private pending = new Map<string, { resolve: (reply: Extract<ExportReply, { kind: 'file' }>) => void; reject: (error: Error) => void }>();

  constructor() {
    this.worker = this.start();
  }

  private start(): Worker {
    const worker = new Worker(new URL('./export.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<ExportReply>) => {
      const pending = this.pending.get(event.data.id);
      if (!pending) {
        return;
      }
      this.pending.delete(event.data.id);
      if (event.data.kind === 'error') {
        pending.reject(new Error(event.data.message));
        return;
      }
      pending.resolve(event.data);
    };
    worker.onerror = () => {
      for (const pending of this.pending.values()) {
        pending.reject(new Error('Export worker failed and restarted'));
      }
      this.pending.clear();
      worker.terminate();
      this.worker = this.start();
    };
    return worker;
  }

  request(input: Omit<ExportRequest, 'id'>): Promise<Extract<ExportReply, { kind: 'file' }>> {
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const transfers = [...new Set(Object.values(input.files).map((bytes) => bytes.buffer))];
      this.worker.postMessage({ ...input, id }, transfers);
    });
  }

  close(): void {
    this.worker.terminate();
    this.pending.clear();
  }
}

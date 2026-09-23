import type { CoreReply, CoreRequest, ProjectDoc } from '@boardstudio/v2-contracts';

export class CoreClient {
  private worker: Worker;

  private pending = new Map<string, { resolve: (reply: CoreReply) => void; persist: boolean }>();
  private snapshot?: ProjectDoc;

  constructor() {
    this.worker = this.start();
  }

  private start(): Worker {
    const worker = new Worker(new URL('./core.worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event: MessageEvent<CoreReply>) => {
      const pending = this.pending.get(event.data.id);

      if (!pending) {
        return;
      }

      this.pending.delete(event.data.id);

      if (pending.persist && event.data.kind === 'scene') {
        this.snapshot = event.data.document;
      }

      pending.resolve(event.data);
    };

    worker.onerror = (event) => {
      event.preventDefault();

      for (const [id, pending] of this.pending) {
        pending.resolve({ id, kind: 'error', message: 'Core worker failed and restarted', revision: this.snapshot?.revision ?? 0 });
      }

      this.pending.clear();
      worker.terminate();
      this.worker = this.start();

      if (this.snapshot) {
        this.worker.postMessage({ id: crypto.randomUUID(), kind: 'open', document: this.snapshot });
      }
    };

    return worker;
  }

  request(request: CoreRequest): Promise<CoreReply> {
    return new Promise((resolve) => {
      const persist = request.kind !== 'edit' || request.command.phase === 'commit';

      this.pending.set(request.id, { resolve, persist });
      this.worker.postMessage(request);
    });
  }

  close(): void {
    this.worker.terminate();
    this.pending.clear();
  }
}

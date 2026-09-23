import type { CaseAssemblyIR, CaseResult } from '@boardstudio/v2-contracts';
import type { StepModel } from '@boardstudio/v2-cad';

type CaseReply =
  | { id: string; kind: 'case'; result: CaseResult }
  | { id: string; kind: 'model'; result: StepModel }
  | { id: string; kind: 'error'; message: string; revision: number };

export class CaseClient {
  private worker: Worker;

  private pending = new Map<string, (reply: CaseReply) => void>();

  constructor() {
    this.worker = this.start();
  }

  private start(): Worker {
    const worker = new Worker(new URL('./case.worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event: MessageEvent<CaseReply>) => {
      const resolve = this.pending.get(event.data.id);

      if (!resolve) {
        return;
      }

      this.pending.delete(event.data.id);
      resolve(event.data);
    };

    worker.onerror = (event) => {
      event.preventDefault();

      for (const [id, resolve] of this.pending) {
        resolve({ id, kind: 'error', message: 'CAD worker failed and restarted', revision: 0 });
      }

      this.pending.clear();
      worker.terminate();
      this.worker = this.start();
    };

    return worker;
  }

  request(ir: CaseAssemblyIR): Promise<CaseResult> {
    const id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      this.pending.set(id, (reply) => {
        if (reply.kind === 'error') {
          reject(new Error(reply.message));
          return;
        }

        if (reply.kind !== 'case') {
          reject(new Error('Unexpected CAD worker response'));
          return;
        }

        resolve(reply.result);
      });

      this.worker.postMessage({ id, kind: 'case', ir });
    });
  }

  requestModel(bytes: Uint8Array): Promise<StepModel> {
    const id = crypto.randomUUID();
    const owned = new Uint8Array(bytes);

    return new Promise((resolve, reject) => {
      this.pending.set(id, (reply) => {
        if (reply.kind === 'error') {
          reject(new Error(reply.message));
          return;
        }

        if (reply.kind !== 'model') {
          reject(new Error('Unexpected CAD worker response'));
          return;
        }

        resolve(reply.result);
      });

      this.worker.postMessage({ id, kind: 'model', bytes: owned }, [owned.buffer]);
    });
  }

  close(): void {
    this.worker.terminate();
    this.pending.clear();
  }
}

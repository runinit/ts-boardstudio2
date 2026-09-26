import type { CaseResult, PreparedCaseAssemblyIR } from '@boardstudio/v2-contracts';
import type { StepModel, CadProgress, CasePreviewResult } from '@boardstudio/v2-cad';

type CaseReply =
  | { id: string; kind: 'progress'; progress: CadProgress }
  | { id: string; kind: 'preview'; result: CasePreviewResult }
  | { id: string; kind: 'case'; result: CaseResult }
  | { id: string; kind: 'model'; result: StepModel }
  | { id: string; kind: 'error'; message: string; revision: number };

export class CaseClient {
  private worker: Worker;

  private progress = new Map<string, (value: CadProgress) => void>();
  private closed = false;

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

      if (event.data.kind === 'progress') {
        this.progress.get(event.data.id)?.(event.data.progress);
        return;
      }
      this.progress.delete(event.data.id);
      this.pending.delete(event.data.id);
      resolve(event.data);
    };

    worker.onerror = (event) => {
      event.preventDefault();
      if (this.closed || worker !== this.worker) return;

      for (const [id, resolve] of this.pending) {
        resolve({ id, kind: 'error', message: 'CAD worker failed and restarted', revision: 0 });
      }

      this.pending.clear();
      this.progress.clear();
      worker.terminate();
      this.worker = this.start();
    };

    return worker;
  }

  request(ir: PreparedCaseAssemblyIR): Promise<CaseResult> {
    if (this.closed) return Promise.reject(new Error('CAD client is closed'));
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

  preview(ir: PreparedCaseAssemblyIR, onProgress: (value: CadProgress) => void): Promise<CasePreviewResult> {
    if (this.closed) return Promise.reject(new Error('CAD client is closed'));
    const id = crypto.randomUUID();
    this.progress.set(id, progress => { if (progress.revision === ir.revision) onProgress(progress); });
    return new Promise((resolve, reject) => {
      this.pending.set(id, reply => {
        if (reply.kind === 'error') reject(new Error(reply.message));
        else if (reply.kind === 'preview' && reply.result.revision === ir.revision) resolve(reply.result);
        else reject(new Error('Unexpected or stale CAD preview response'));
      });
      this.worker.postMessage({ id, kind: 'preview', ir });
    });
  }

  cancel(): void {
    if (this.closed) return;
    this.worker.terminate();
    for (const [id, settle] of this.pending) settle({ id, kind: 'error', message: 'CAD generation cancelled; retry any pending model import', revision: 0 });
    this.pending.clear();
    this.progress.clear();
    this.worker = this.start();
  }

  requestModel(bytes: Uint8Array): Promise<StepModel> {
    if (this.closed) return Promise.reject(new Error('CAD client is closed'));
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
    this.closed = true;
    this.worker.terminate();
    for (const [id, settle] of this.pending) settle({ id, kind: 'error', message: 'CAD client closed', revision: 0 });
    this.pending.clear();
    this.progress.clear();
  }
}

import type { ArtifactReply, ArtifactRequest, CompiledFootprint, FootprintCompileJob } from '@boardstudio/v2-contracts';
import type { ExportReply, ExportRequest } from './export.worker';

type WithoutId<T> = T extends { id: string } ? Omit<T, 'id'> : never;
type ArtifactOperation = WithoutId<ArtifactRequest>;

export class ExportClient {
  private worker: Worker;
  private pending = new Map<string, {
    resolve: (reply: ExportReply | ArtifactReply) => void;
    reject: (error: Error) => void;
  }>();
  private compiled = new Map<string, Promise<CompiledFootprint[]>>();

  constructor() {
    this.worker = this.start();
  }

  private start(): Worker {
    const worker = new Worker(new URL('./export.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<ExportReply | ArtifactReply>) => {
      const reply = event.data;
      const pending = this.pending.get(reply.id);
      if (!pending) return;
      this.pending.delete(reply.id);
      if (reply.kind === 'error') {
        pending.reject(new Error('message' in reply ? reply.message : reply.error.message));
        return;
      }
      pending.resolve(reply);
    };
    worker.onerror = () => {
      for (const pending of this.pending.values()) pending.reject(new Error('Export worker failed and restarted'));
      this.pending.clear();
      worker.terminate();
      this.worker = this.start();
    };
    return worker;
  }

  request(input: Omit<ExportRequest, 'id'>): Promise<Extract<ExportReply, { kind: 'file' }>> {
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (reply: ExportReply | ArtifactReply) => void, reject });
      const transfers = [...new Set(Object.values(input.files).map((bytes) => bytes.buffer))];
      this.worker.postMessage({ ...input, id }, transfers);
    });
  }

  artifact(input: ArtifactOperation): Promise<ArtifactReply> {
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (reply: ExportReply | ArtifactReply) => void, reject });
      this.worker.postMessage({ id, kind: 'artifact', request: { ...input, id } });
    });
  }

  compile(jobs: FootprintCompileJob[]): Promise<CompiledFootprint[]> {
    const key = JSON.stringify(jobs);
    const cached = this.compiled.get(key);
    if (cached) return cached;
    const result = this.artifact({ kind: 'compile-footprints', jobs }).then((reply) => {
      if (reply.kind !== 'compile-footprints') throw new Error('Expected Rust footprint compilation');
      return reply.result;
    }).catch((error: unknown) => {
      this.compiled.delete(key);
      throw error;
    });
    this.compiled.set(key, result);
    if (this.compiled.size > 64) this.compiled.delete(this.compiled.keys().next().value!);
    return result;
  }

  close(): void {
    this.worker.terminate();
    for (const pending of this.pending.values()) pending.reject(new Error('Export worker was closed'));
    this.pending.clear();
    this.compiled.clear();
  }
}

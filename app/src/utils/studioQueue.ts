import type { Results } from '../types/results';
import type { CaseFinding } from '../hooks/useCasePreview';

export const SETTLE_MS = 180;
export const SUPERSEDE_MS = 1000;
export type StudioRequest = {
  revision: string;
  source: string;
  injections?: string[][];
  assets?: Record<string, string>;
  outline?: 'keep' | 'rebuild' | 'freeze';
};
export type StudioReply = {
  type: 'stage' | 'success' | 'error' | 'superseded';
  stage?: 'layout' | 'outline';
  requestId: string;
  revision: string;
  results?: Results;
  source?: string;
  error?: string;
  diagnostics?: CaseFinding[];
};

// Keep one in-flight request and one replaceable draft; a stuck solve gets a grace period.
export class StudioQueue {
  private worker: Worker | null = null;
  private latest = '';
  private pending: StudioRequest | null = null;
  private running: { id: string; revision: string } | null = null;
  private settle?: ReturnType<typeof setTimeout>;
  private grace?: ReturnType<typeof setTimeout>;
  private serial = 0;
  private ready = false;
  private injections = '';

  constructor(
    private create: () => Worker | null,
    private publish: (reply: StudioReply) => void
  ) {}

  schedule(request: StudioRequest) {
    this.latest = request.revision;
    this.pending = request;
    this.ready = false;
    clearTimeout(this.settle);
    this.settle = setTimeout(() => {
      this.ready = true;
      this.start();
    }, SETTLE_MS);
    if (!this.running || this.running.revision === request.revision) {
      return;
    }
    this.worker?.postMessage({ type: 'supersede', revision: request.revision });
    if (this.grace) {
      return;
    }
    this.grace = setTimeout(() => {
      this.worker?.terminate();
      this.worker = null;
      this.running = null;
      this.grace = undefined;
      this.start();
    }, SUPERSEDE_MS);
  }

  private start() {
    if (this.running || !this.pending || !this.ready) {
      return;
    }
    const request = this.pending;
    this.pending = null;
    const injections = JSON.stringify(request.injections);
    if (this.worker && injections !== this.injections) {
      this.worker.terminate();
      this.worker = null;
    }
    this.injections = injections;
    const worker = this.worker || this.create();
    this.worker = worker;
    const requestId = `studio-${++this.serial}`;
    if (!worker) {
      this.publish({
        type: 'error',
        requestId,
        revision: request.revision,
        error: 'Could not start geometry worker. Retry outline.',
      });
      return;
    }
    this.running = { id: requestId, revision: request.revision };
    worker.onmessage = ({ data }: MessageEvent<StudioReply>) => {
      if (
        this.worker !== worker ||
        data.requestId !== this.running?.id ||
        data.revision !== this.running.revision
      ) {
        return;
      }
      if (data.revision === this.latest && data.type !== 'superseded') {
        this.publish(data);
      }
      if (data.type === 'stage') {
        return;
      }
      this.running = null;
      clearTimeout(this.grace);
      this.grace = undefined;
      this.start();
    };
    worker.onerror = (event) => {
      if (this.worker !== worker) {
        return;
      }
      if (this.latest === request.revision) {
        this.publish({
          type: 'error',
          requestId,
          revision: request.revision,
          error: event.message || 'Geometry worker failed. Retry outline.',
        });
      }
      worker.terminate();
      this.worker = null;
      this.running = null;
      clearTimeout(this.grace);
      this.grace = undefined;
      this.start();
    };
    worker.postMessage({
      type: 'studio',
      inputConfig: request.source,
      injectionInput: request.injections,
      assets: request.assets,
      outline: request.outline || 'keep',
      revision: request.revision,
      requestId,
      options: { debug: true },
    });
  }

  dispose() {
    clearTimeout(this.settle);
    clearTimeout(this.grace);
    this.worker?.terminate();
    this.worker = null;
    this.running = null;
    this.pending = null;
    this.latest = '';
  }
}

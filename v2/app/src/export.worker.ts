import type {
  ArtifactReply,
  ArtifactRequest,
  Contour,
  ErgogenJobResult,
  ExportPlan,
  ExportTarget,
  ProjectDoc,
  ReservedNet,
} from '@boardstudio/v2-contracts';
import { exportErgogenForms } from '@boardstudio/v2-kicad';
import init, { artifact_request } from '../../core/pkg/boardstudio_core.js';
import { strToU8, zipSync } from 'fflate';

export type ExportRequest = {
  id: string;
  kind: 'project' | 'footprints' | 'kicad' | 'outline';
  document: ProjectDoc;
  boardId?: string;
  contours?: Contour[];
  outlineFormat?: 'svg' | 'dxf';
  paths: [string, string][];
  files: Record<string, Uint8Array>;
};
export type ExportReply =
  | { id: string; kind: 'file'; filename: string; bytes: Uint8Array; mediaType: string }
  | { id: string; kind: 'error'; message: string };
export type ExportWorkerRequest = ExportRequest | { id: string; kind: 'artifact'; request: ArtifactRequest };
export type ExportWorkerReply = ExportReply | ArtifactReply;

let ready: Promise<unknown> | undefined;
let queue = Promise.resolve();

function artifact(request: ArtifactRequest): ArtifactReply {
  const reply = JSON.parse(artifact_request(JSON.stringify(request))) as ArtifactReply;
  if (reply.kind === 'error') throw new Error(reply.error.message);
  return reply;
}

function netAllocator(initial: ReservedNet[], nextIndex: number): {
  lookup: (name: string) => number;
  snapshot: () => ReservedNet[];
} {
  const nets = initial.map((net) => ({ ...net }));
  return {
    lookup(name) {
      const existing = nets.find((net) => net.name === name);
      if (existing) return existing.index;
      const net = { name, index: nextIndex++ };
      nets.push(net);
      return net.index;
    },
    snapshot: () => nets.map((net) => ({ ...net })),
  };
}

function formsSource(forms: { footprints: string[]; objects: string[] }): string {
  return [...forms.footprints, ...forms.objects].join('\n');
}

function runErgogenJobs(plan: ExportPlan, paths: ReadonlyMap<string, string>): ErgogenJobResult[] {
  const allocator = netAllocator(plan.reservedNets, plan.nextNetIndex);
  return plan.jobs.map((job) => {
    const standalone = plan.target.kind === 'standalone-footprints';
    const forms = exportErgogenForms(job.definition, standalone ? undefined : job.part, paths, standalone ? () => 0 : allocator.lookup);
    return {
      snapshotToken: plan.snapshotToken,
      revision: plan.revision,
      jobId: job.jobId,
      source: formsSource(forms),
      nets: allocator.snapshot(),
    };
  });
}

function prepareRequest(request: ExportRequest, target: ExportTarget): ArtifactReply {
  return artifact({
    id: request.id,
    kind: 'prepare-export',
    request: {
      snapshotToken: crypto.randomUUID(),
      expectedRevision: request.document.revision,
      document: request.document,
      target,
      contours: request.contours ?? [],
      modelPaths: Object.fromEntries(request.paths),
    },
  });
}

function finishRequest(request: ExportRequest, plan: ExportPlan, paths: ReadonlyMap<string, string>): ArtifactReply {
  return artifact({
    id: request.id,
    kind: 'finish-export',
    request: { plan, results: runErgogenJobs(plan, paths) },
  });
}

function build(request: ExportRequest): ExportReply {
  const paths = new Map(request.paths);
  const files = request.files;

  if (request.kind === 'project') {
    files['project.json'] = strToU8(JSON.stringify(request.document));
    return { id: request.id, kind: 'file', filename: `${request.document.name}.boardstudio`, bytes: zipSync(files), mediaType: 'application/zip' };
  }

  if (request.kind === 'outline') {
    const board = request.document.boards.find((entry) => entry.id === request.boardId);
    if (!board || !request.contours || !request.outlineFormat) throw new Error('Select a resolved board before outline export');
    const reply = artifact({
      id: request.id,
      kind: 'export-outline',
      request: {
        filename: `${request.document.name}.${request.outlineFormat}`,
        board,
        contours: request.contours,
        format: request.outlineFormat,
      },
    });
    if (reply.kind !== 'export-outline') throw new Error('Expected Rust outline export');
    const format = request.outlineFormat === 'svg' ? 'image/svg+xml' : 'application/dxf';
    return { id: request.id, kind: 'file', filename: reply.result.filename, bytes: strToU8(reply.result.content), mediaType: format };
  }

  if (request.kind === 'footprints') {
    const definitionIds = request.document.definitions.map((definition) => definition.id);
    const prepared = prepareRequest(request, { kind: 'standalone-footprints', definitionIds });
    if (prepared.kind !== 'prepare-export') throw new Error('Expected Rust export preparation');
    const exported = finishRequest(request, prepared.result, paths);
    if (exported.kind !== 'finish-export') throw new Error('Expected Rust footprint export');
    for (const file of exported.result.files) {
      const path = `BoardStudio.pretty/${file.filename}`;
      if (files[path]) throw new Error(`Footprint filename repeats: ${file.filename}`);
      files[path] = strToU8(file.content);
    }

    files['fp-lib-table'] = strToU8('(fp_lib_table (lib (name "BoardStudio") (type "KiCad") (uri "${KIPRJMOD}/BoardStudio.pretty") (options "") (descr "")))\n');
    const skippedUtilities = exported.result.skippedUtilities ?? [];
    const utilityNotice = [
      'Standalone footprint libraries contain footprints only.',
      'Generated board routing and graphics are included by placed board export.',
      ...(skippedUtilities.length ? ['', 'Generators skipped from this standalone footprint library:', ...skippedUtilities.map((name) => `- ${name}`)] : []),
      '',
    ].join('\n');
    files['BOARD-UTILITIES.txt'] = strToU8(utilityNotice);
    return { id: request.id, kind: 'file', filename: `${request.document.name}-footprints.zip`, bytes: zipSync(files), mediaType: 'application/zip' };
  }

  const board = request.document.boards.find((entry) => entry.id === request.boardId);
  if (!board || !request.contours) throw new Error('Select a resolved board before export');
  const prepared = prepareRequest(request, { kind: 'board', boardId: board.id });
  if (prepared.kind !== 'prepare-export') throw new Error('Expected Rust export preparation');
  const exported = finishRequest(request, prepared.result, paths);
  if (exported.kind !== 'finish-export') throw new Error('Expected Rust board export');
  const boardFile = exported.result.files[0];
  if (!boardFile) throw new Error('Rust returned no board file');
  if (paths.size === 0) return { id: request.id, kind: 'file', filename: boardFile.filename, bytes: strToU8(boardFile.content), mediaType: 'text/plain' };
  files[boardFile.filename] = strToU8(boardFile.content);
  return { id: request.id, kind: 'file', filename: `${board.name}-kicad.zip`, bytes: zipSync(files), mediaType: 'application/zip' };
}

async function handle(message: ExportWorkerRequest): Promise<ExportWorkerReply> {
  ready ??= init();
  try {
    await ready;
  } catch (cause) {
    ready = undefined;
    throw cause;
  }
  if (message.kind === 'artifact') return artifact(message.request);
  return build(message);
}

self.onmessage = (event: MessageEvent<ExportWorkerRequest>) => {
  const message = event.data;
  queue = queue.then(async () => {
    try {
      const reply = await handle(message);
      self.postMessage(reply, reply.kind === 'file' ? [reply.bytes.buffer] : []);
    } catch (cause) {
      self.postMessage({ id: message.id, kind: 'error', message: cause instanceof Error ? cause.message : String(cause) });
    }
  });
};

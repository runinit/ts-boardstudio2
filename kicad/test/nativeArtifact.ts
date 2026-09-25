import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { CompiledFootprint, Contour, PartDefinition, Part, ProjectDoc, Side } from '../../contracts/src/index.ts';
import { exportErgogenForms } from '../src/index.ts';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const driver = process.env.BOARDSTUDIO_ARTIFACT_DRIVER
  ?? resolve(packageRoot, '../core/target/debug/examples/artifact_request');

export type NativeArtifactReply = { id: string; kind: string; result?: unknown; error?: { message: string } };

export function nativeArtifact<T extends NativeArtifactReply = NativeArtifactReply>(request: object): T {
  const process = spawnSync(driver, { input: `${JSON.stringify(request)}\n`, encoding: 'utf8' });
  if (process.error) throw process.error;
  if (process.status !== 0) throw new Error(process.stderr || `Native artifact driver exited with ${process.status}`);
  const output = process.stdout.trim().split('\n').at(-1);
  if (!output) throw new Error('Native artifact driver returned no reply');
  const reply = JSON.parse(output) as T;
  if (reply.kind === 'error') throw new Error(reply.error?.message ?? 'Rust artifact request failed');
  return reply;
}

export type NativeExportPlan = {
  snapshotToken: string;
  revision: number;
  target: { kind: 'board'; boardId: string } | { kind: 'standalone-footprints'; definitionIds: string[] };
  jobs: { jobId: string; definition: PartDefinition; part: Part }[];
  reservedNets: { name: string; index: number }[];
  nextNetIndex: number;
};

export type NativeExportArtifact = { files: { filename: string; content: string }[]; skippedUtilities: string[] };

export function prepareNativeExport(
  document: ProjectDoc,
  target: NativeExportPlan['target'],
  contours: Contour[] = [],
  modelPaths: ReadonlyMap<string, string> = new Map(),
  id = 'native-export',
): NativeExportPlan {
  const reply = nativeArtifact<{ id: string; kind: string; result: NativeExportPlan }>({
    id: `${id}:prepare`, kind: 'prepare-export', request: {
      snapshotToken: `${id}:snapshot`, expectedRevision: document.revision, document, target, contours,
      modelPaths: Object.fromEntries(modelPaths),
    },
  });
  return reply.result;
}

export function finishNativeExport(
  plan: NativeExportPlan,
  modelPaths: ReadonlyMap<string, string> = new Map(),
  id = 'native-export',
): NativeExportArtifact {
  let nets = plan.reservedNets.map((net) => ({ ...net }));
  let next = plan.nextNetIndex;
  const lookup = (name: string): number => {
    const known = nets.find((net) => net.name === name);
    if (known) return known.index;
    const created = { name, index: next++ };
    nets.push(created);
    return created.index;
  };
  const standalone = plan.target.kind === 'standalone-footprints';
  const results = plan.jobs.map((job) => {
    const forms = exportErgogenForms(job.definition, standalone ? undefined : job.part, modelPaths, standalone ? () => 0 : lookup);
    const result = {
      snapshotToken: plan.snapshotToken,
      revision: plan.revision,
      jobId: job.jobId,
      source: [...forms.footprints, ...forms.objects].join('\n'),
      nets: nets.map((net) => ({ ...net })),
    };
    return result;
  });
  const reply = nativeArtifact<{ id: string; kind: string; result: NativeExportArtifact }>({
    id: `${id}:finish`, kind: 'finish-export', request: { plan, results },
  });
  return reply.result;
}

export function exportNativeBoard(
  document: ProjectDoc,
  boardId: string,
  contours: Contour[],
  modelPaths: ReadonlyMap<string, string> = new Map(),
  id = 'native-board',
): string {
  const plan = prepareNativeExport(document, { kind: 'board', boardId }, contours, modelPaths, id);
  const artifact = finishNativeExport(plan, modelPaths, id);
  const file = artifact.files.find((entry) => entry.filename === `${document.boards.find((board) => board.id === boardId)?.name}.kicad_pcb`);
  if (!file) throw new Error(`Native artifact omitted board ${boardId}`);
  return file.content;
}

export function exportNativeFootprint(
  document: ProjectDoc,
  definitionId: string,
  modelPaths: ReadonlyMap<string, string> = new Map(),
  id = 'native-footprint',
): { filename: string; content: string } {
  const plan = prepareNativeExport(document, { kind: 'standalone-footprints', definitionIds: [definitionId] }, [], modelPaths, id);
  const artifact = finishNativeExport(plan, modelPaths, id);
  const file = artifact.files[0];
  if (!file) throw new Error(`Native artifact omitted footprint ${definitionId}`);
  return file;
}

export function importNativeFootprint(source: string, definitionId: string): PartDefinition {
  const reply = nativeArtifact<{ id: string; kind: string; result: { definition: PartDefinition } }>({
    id: `import:${definitionId}`, kind: 'import-footprint', definitionId, source,
  });
  return reply.result.definition;
}

export function compileNativeFootprint(
  definition: PartDefinition,
  side: Side = 'front',
  parameters: Record<string, unknown> = definition.generator?.parameters ?? {},
): CompiledFootprint {
  const reply = nativeArtifact<{ id: string; kind: string; result: CompiledFootprint[] }>({
    id: `compile:${definition.id}:${side}`, kind: 'compile-footprints', jobs: [{
      id: definition.id, definition, parameters, side,
    }],
  });
  const compiled = reply.result[0];
  if (!compiled) throw new Error(`Native compiler omitted footprint ${definition.id}`);
  return compiled;
}

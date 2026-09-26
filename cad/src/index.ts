import type { CaseResult, PreparedCaseAssemblyIR, PreparedCaseIR } from '@boardstudio/v2-contracts';

const MAX_STEP_BYTES = 32 * 1024 * 1024;

let kernel: Promise<typeof import('../wasm/pkg/boardstudio_cadrum_wasm.js')> | undefined;

/** Loads the local Cadrum WASM only when CAD is first requested. */
async function getKernel(): Promise<typeof import('../wasm/pkg/boardstudio_cadrum_wasm.js')> {
  if (!kernel) {
    kernel = (async () => {
      const bindings = await import('../wasm/pkg/boardstudio_cadrum_wasm.js');
      const node = (globalThis as { process?: { versions?: { node?: string } } }).process?.versions?.node;
      if (node) {
        const { readFile } = await import('node:fs/promises');
        await bindings.default({
          module_or_path: await readFile(new URL('../wasm/pkg/boardstudio_cadrum_wasm_bg.wasm', import.meta.url)),
        });
      } else {
        await bindings.default();
      }
      return bindings;
    })().catch((cause) => {
      kernel = undefined;
      throw cause;
    });
  }

  return kernel;
}

/** Builds one revisioned case body; call from a dedicated CAD worker. */
export async function buildCase(ir: PreparedCaseIR): Promise<CaseResult> {
  if (ir.regions.length === 0) throw new Error('Case requires at least one prepared region');
  const cadrum = await getKernel();
  return cadrum.build_case(ir) as CaseResult;
}

/** Exports all bodies as one STEP compound and one combined mesh. */
export async function buildAssembly(ir: PreparedCaseAssemblyIR): Promise<CaseResult> {
  if (ir.bodies.length === 0) throw new Error('Case assembly requires at least one body');
  for (const body of ir.bodies) {
    if (body.revision !== ir.revision) throw new Error('Case assembly contains a stale body revision');
    if (body.regions.length === 0) throw new Error('Case requires at least one prepared region');
  }

  const cadrum = await getKernel();
  return cadrum.export_cached_assembly(ir, ir.bodies.map(bodyKey)) as CaseResult;
}

export interface StepModel {
  mesh: CaseResult['mesh'];
  bounds: { min: [number, number, number]; max: [number, number, number] };
}

/** Imports a bounded STEP file into the CAD kernel and tessellates its shape. */
export async function readStepModel(bytes: Uint8Array): Promise<StepModel> {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0 || bytes.byteLength > MAX_STEP_BYTES) {
    throw new Error('STEP import failed: invalid file size');
  }

  const cadrum = await getKernel();
  return cadrum.read_step_model(bytes) as StepModel;
}

export type CadProgress = { revision: number; stage: 'loading' | 'building' | 'tessellating'; completed: number; total: number; body?: string; region?: number };
export type CasePreviewResult = Omit<CaseResult, 'step'>;

function bodyKey(ir: PreparedCaseIR): string {
  const { id: _id, name: _name, ...geometry } = ir.body;
  return JSON.stringify({ body: geometry, regions: ir.regions });
}

export async function previewAssembly(ir: PreparedCaseAssemblyIR, progress: (value: CadProgress) => void): Promise<CasePreviewResult> {
  if (!ir.bodies.length) throw new Error('Case assembly requires at least one body');
  const base = { revision: ir.revision, total: ir.bodies.length };
  progress({ ...base, stage: 'loading', completed: 0 });
  const cadrum = await getKernel();
  const bodies: NonNullable<CaseResult['bodies']> = [];
  for (const body of ir.bodies) {
    if (body.revision !== ir.revision) throw new Error('Case assembly contains a stale body revision');
    const notify = (stage: 'building' | 'tessellating', region = 0) => progress({ ...base, stage, body: body.body.name, region, completed: bodies.length });
    notify('building');
    const mesh = cadrum.preview_body(body, bodyKey(body), notify) as CaseResult['mesh'];
    bodies.push({ id: body.body.id, name: body.body.name, ...mesh });
    progress({ ...base, stage: 'tessellating', body: body.body.name, completed: bodies.length });
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  const count = bodies.reduce((sum, body) => sum + body.positions.length, 0);
  const positions = new Float32Array(count);
  const normals = new Float32Array(count);
  let offset = 0;
  for (const body of bodies) { positions.set(body.positions, offset); normals.set(body.normals, offset); offset += body.positions.length; }
  return { revision: ir.revision, bodies, mesh: { positions, normals } };
}

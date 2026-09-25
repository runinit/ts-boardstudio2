import type { CaseResult, PreparedCaseAssemblyIR, PreparedCaseIR, PreparedCaseRegion, Vec2 } from '@boardstudio/v2-contracts';
import type { OpenCascadeInstance, TopoDS_Shape } from 'libcascade';

const MESH_DEFLECTION_MM = 0.1;
const MESH_ANGLE_RAD = 0.5;
const MAX_STEP_BYTES = 32 * 1024 * 1024;

let instance: Promise<OpenCascadeInstance> | undefined;
let exportSequence = 0;

/** Loads one single-thread CAD kernel only when a case is requested. */
async function getKernel(): Promise<OpenCascadeInstance> {
  if (!instance) {
    instance = (async () => {
      const { createInstance } = await import('libcascade/single/init');
      const node = (globalThis as { process?: { versions?: { node?: string } } }).process?.versions?.node;
      if (node) {
        return createInstance();
      }
      const wasm = await import('libcascade/single/wasm?url');
      return createInstance({ locateFile: () => wasm.default });
    })().catch((cause) => {
      instance = undefined;
      throw cause;
    });
  }

  return instance;
}

function makePrism(oc: OpenCascadeInstance, points: Vec2[], z: number, depth: number): TopoDS_Shape {
  // Closed polygon wires stay analytic BRep edges through STEP export.
  using polygon = new oc.BRepBuilderAPI_MakePolygon();
  for (const point of points) {
    using vertex = new oc.gp_Pnt(point.x, point.y, z);
    polygon.Add(vertex);
  }
  polygon.Close();
  using face = new oc.BRepBuilderAPI_MakeFace(polygon.Wire(), true);
  if (!face.IsDone()) {
    throw new Error('OpenCascade could not construct a case face');
  }
  using vector = new oc.gp_Vec(0, 0, depth);
  using prism = new oc.BRepPrimAPI_MakePrism(face.Face(), vector, false, true);
  if (!prism.IsDone()) {
    throw new Error('OpenCascade could not extrude a case face');
  }
  return prism.Shape();
}

function makeCylinder(oc: OpenCascadeInstance, at: Vec2, z: number, diameter: number, height: number): TopoDS_Shape {
  using origin = new oc.gp_Pnt(at.x, at.y, z);
  using direction = new oc.gp_Dir(0, 0, 1);
  using axis = new oc.gp_Ax2(origin, direction);
  using cylinder = new oc.BRepPrimAPI_MakeCylinder(axis, diameter / 2, height);
  return cylinder.Shape();
}

function cutShape(oc: OpenCascadeInstance, shape: TopoDS_Shape, tool: TopoDS_Shape): TopoDS_Shape {
  using cut = new oc.BRepAlgoAPI_Cut(shape, tool);
  cut.Build();
  if (!cut.IsDone()) {
    throw new Error('OpenCascade could not subtract a case feature');
  }
  return cut.Shape();
}

function fuseShape(oc: OpenCascadeInstance, shape: TopoDS_Shape, tool: TopoDS_Shape): TopoDS_Shape {
  using fuse = new oc.BRepAlgoAPI_Fuse(shape, tool);
  fuse.Build();
  if (!fuse.IsDone()) {
    throw new Error('OpenCascade could not join a case feature');
  }
  return fuse.Shape();
}

function makeRegion(oc: OpenCascadeInstance, body: PreparedCaseIR['body'], region: PreparedCaseRegion): TopoDS_Shape {
  const { outer, holes } = region;
  let shape = makePrism(oc, outer, body.z ?? 0, body.thickness + (body.kind === 'plate' ? 0 : body.wallHeight ?? 0));
  const baseZ = body.z ?? 0;
  const wallHeight = body.kind === 'plate' ? 0 : body.wallHeight ?? 0;
  const totalHeight = body.thickness + wallHeight;

  for (const hole of holes) {
    shape = cutShape(oc, shape, makePrism(oc, hole, baseZ, totalHeight));
  }

  if (body.kind !== 'plate') {
    const cavityZ = body.kind === 'tray' ? baseZ + body.thickness : baseZ;
    for (const cavity of region.cavities) {
      shape = cutShape(oc, shape, makePrism(oc, cavity, cavityZ, wallHeight));
    }

    for (const gasket of region.gaskets) {
      const depth = body.gasket!.depth;
      const grooveZ = body.kind === 'tray' ? baseZ + totalHeight - depth : baseZ;
      let groove = makePrism(oc, gasket.outer, grooveZ, depth);
      for (const hole of gasket.holes) {
        groove = cutShape(oc, groove, makePrism(oc, hole, grooveZ, depth));
      }
      shape = cutShape(oc, shape, groove);
    }
  }

  for (const mount of region.mounts) {
    if (mount.kind === 'boss') {
      const bossZ = body.kind === 'lid'
        ? baseZ + wallHeight - mount.height!
        : baseZ + body.thickness;
      shape = fuseShape(oc, shape, makeCylinder(oc, mount.at, bossZ, mount.bossDiameter!, mount.height!));
    }
    shape = cutShape(oc, shape, makeCylinder(oc, mount.at, baseZ, mount.holeDiameter, totalHeight));
  }

  return shape;
}

function writeStep(oc: OpenCascadeInstance, shape: TopoDS_Shape, path: string): Uint8Array {
  using writer = new oc.STEPControl_Writer();
  using progress = new oc.Message_ProgressRange();
  const status = oc.IFSelect_ReturnStatus.IFSelect_RetDone;
  const transfer = writer.Transfer(shape, oc.STEPControl_StepModelType.STEPControl_AsIs, true, progress);
  if (transfer !== status || writer.Write(path) !== status) {
    throw new Error('OpenCascade STEP export failed');
  }
  return oc.FS.readFile(path) as Uint8Array;
}

function readMesh(oc: OpenCascadeInstance, shape: TopoDS_Shape, path: string): CaseResult['mesh'] {
  // STL is tessellated from the exact BRep used by the STEP writer.
  using mesh = new oc.BRepMesh_IncrementalMesh(shape, MESH_DEFLECTION_MM, false, MESH_ANGLE_RAD, false);
  using writer = new oc.StlAPI_Writer();
  using progress = new oc.Message_ProgressRange();
  if (!writer.Write(shape, path, progress)) {
    throw new Error('OpenCascade mesh export failed');
  }

  const stl = new TextDecoder().decode(oc.FS.readFile(path) as Uint8Array);
  const positions: number[] = [];
  const normals: number[] = [];
  let normal: number[] = [0, 0, 1];
  for (const line of stl.split('\n')) {
    const words = line.trim().split(/\s+/);
    if (words[0] === 'facet' && words[1] === 'normal') {
      normal = words.slice(2, 5).map(Number);
    }
    if (words[0] === 'vertex') {
      positions.push(...words.slice(1, 4).map(Number));
      normals.push(...normal);
    }
  }
  if (positions.length === 0 || positions.length !== normals.length) {
    throw new Error('OpenCascade returned an empty case mesh');
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
}

function makeAssembly(oc: OpenCascadeInstance, ir: PreparedCaseAssemblyIR, meshes: NonNullable<CaseResult['bodies']>): TopoDS_Shape {
  using builder = new oc.BRep_Builder();
  const compound = new oc.TopoDS_Compound();
  builder.MakeCompound(compound);

  try {
    for (const body of ir.bodies) {
      using bodyShape = new oc.TopoDS_Compound();
      builder.MakeCompound(bodyShape);
      for (const region of body.regions) {
        using shape = makeRegion(oc, body.body, region);
        builder.Add(bodyShape, shape);
      }
      builder.Add(compound, bodyShape);
      const path = `/body-${++exportSequence}.stl`;
      try { meshes.push({ id: body.body.id, name: body.body.name, ...readMesh(oc, bodyShape, path) }); }
      finally { try { oc.FS.unlink(path); } catch { /* Writer may not have created a file. */ } }
    }
    return compound;
  } catch (error) {
    compound.delete();
    throw error;
  }
}

function exportShape(oc: OpenCascadeInstance, shape: TopoDS_Shape, revision: number): CaseResult {
  const stem = `/case-${++exportSequence}`;
  const stepPath = `${stem}.step`;
  const meshPath = `${stem}.stl`;

  try {
    const step = writeStep(oc, shape, stepPath);
    const mesh = readMesh(oc, shape, meshPath);
    return { revision, step, mesh };
  } finally {
    shape.delete();
    for (const path of [stepPath, meshPath]) {
      try {
        oc.FS.unlink(path);
      } catch {
        // The writer may have failed before creating its output.
      }
    }
  }
}

/** Builds one revisioned case body; call from a dedicated CAD worker. */
export async function buildCase(ir: PreparedCaseIR): Promise<CaseResult> {
  if (ir.regions.length === 0) throw new Error('Case requires at least one prepared region');
  const oc = await getKernel();
  using builder = new oc.BRep_Builder();
  const compound = new oc.TopoDS_Compound();
  builder.MakeCompound(compound);
  for (const region of ir.regions) {
    using shape = makeRegion(oc, ir.body, region);
    builder.Add(compound, shape);
  }
  const shape = compound;
  return exportShape(oc, shape, ir.revision);
}

/** Exports all bodies as one STEP compound and one combined mesh. */
export async function buildAssembly(ir: PreparedCaseAssemblyIR): Promise<CaseResult> {
  if (ir.bodies.length === 0) {
    throw new Error('Case assembly requires at least one body');
  }
  for (const body of ir.bodies) {
    if (body.revision !== ir.revision) throw new Error('Case assembly contains a stale body revision');
    if (body.regions.length === 0) throw new Error('Case requires at least one prepared region');
  }
  const oc = await getKernel();
  const bodies: NonNullable<CaseResult['bodies']> = [];
  const shape = makeAssembly(oc, ir, bodies);
  return { ...exportShape(oc, shape, ir.revision), bodies };
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

  const oc = await getKernel();
  const stem = `/import-${++exportSequence}`;
  const stepPath = `${stem}.step`;
  const meshPath = `${stem}.stl`;

  try {
    oc.FS.writeFile(stepPath, bytes);
    using reader = new oc.STEPControl_Reader();
    if (reader.ReadFile(stepPath) !== oc.IFSelect_ReturnStatus.IFSelect_RetDone || reader.TransferRoots() < 1) {
      throw new Error('STEP import failed: unreadable shape');
    }

    using shape = reader.OneShape();
    if (shape.IsNull()) {
      throw new Error('STEP import failed: empty shape');
    }

    using box = new oc.Bnd_Box();
    oc.BRepBndLib.AddOptimal(shape, box, false, false);
    const min: [number, number, number] = [box.GetXMin(), box.GetYMin(), box.GetZMin()];
    const max: [number, number, number] = [box.GetXMax(), box.GetYMax(), box.GetZMax()];
    if (box.IsVoid() || [...min, ...max].some((value) => !Number.isFinite(value))) {
      throw new Error('STEP import failed: invalid bounds');
    }

    const mesh = readMesh(oc, shape, meshPath);
    if (mesh.positions.some((value) => !Number.isFinite(value)) ||
      mesh.normals.some((value) => !Number.isFinite(value))) {
      throw new Error('STEP import failed: invalid mesh');
    }
    return { mesh, bounds: { min, max } };
  } finally {
    for (const path of [stepPath, meshPath]) {
      try {
        oc.FS.unlink(path);
      } catch {
        // A failed import may not create either file.
      }
    }
  }
}

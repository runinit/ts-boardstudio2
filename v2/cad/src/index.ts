import type { CaseAssemblyIR, CaseIR, CaseResult, Contour, Vec2 } from '@boardstudio/v2-contracts';
import type { OpenCascadeInstance, TopoDS_Shape } from 'libcascade';
import ClipperLib from 'clipper-lib';

const MESH_DEFLECTION_MM = 0.1;
const MESH_ANGLE_RAD = 0.5;
const EPSILON = 1e-7;
const CLIPPER_SCALE = 1_000;
const CLIPPER_MITER_LIMIT = 4;
const MAX_CLIPPER_COORD = 1_000_000_000;
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
    })();
  }

  return instance;
}

function signedArea(points: Vec2[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

function cleanPoints(contour: Contour): Vec2[] {
  const points = contour.points.filter((point, index) => {
    const prev = contour.points[(index + contour.points.length - 1) % contour.points.length];
    return Math.hypot(point.x - prev.x, point.y - prev.y) > EPSILON;
  });
  if (points.length < 3 || Math.abs(signedArea(points)) < EPSILON) {
    throw new Error('Case contour has fewer than three non-collinear points');
  }
  if (points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
    throw new Error('Case contour contains a non-finite coordinate');
  }
  return points;
}

function contains(points: Vec2[], point: Vec2): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i];
    const b = points[j];
    if ((a.y > point.y) !== (b.y > point.y)) {
      const crossing = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
      if (point.x < crossing) {
        inside = !inside;
      }
    }
  }
  return inside;
}

type Ring = { hole: boolean; points: Vec2[] };

function offsetContours(contours: Ring[], distance: number): Ring[] {
  if (distance === 0) {
    return contours;
  }

  const offset = new ClipperLib.ClipperOffset(CLIPPER_MITER_LIMIT);
  for (const contour of contours) {
    // Clipper uses opposite winding for holes; one offset then preserves topology.
    const ordered = signedArea(contour.points) * (contour.hole ? -1 : 1) > 0
      ? contour.points : [...contour.points].reverse();
    const path = ordered.map((point) => {
      const x = Math.round(point.x * CLIPPER_SCALE);
      const y = Math.round(point.y * CLIPPER_SCALE);
      if (Math.abs(x) > MAX_CLIPPER_COORD || Math.abs(y) > MAX_CLIPPER_COORD) {
        throw new Error('Case coordinate exceeds the offset range');
      }
      return { X: x, Y: y };
    });
    offset.AddPath(path, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
  }

  const tree = new ClipperLib.PolyTree();
  offset.Execute(tree, distance * CLIPPER_SCALE);
  const rings: Ring[] = [];
  const visit = (node: ClipperLib.PolyNode): void => {
    for (const child of node.Childs()) {
      const points = child.Contour().map((point) => ({
        x: point.X / CLIPPER_SCALE, y: point.Y / CLIPPER_SCALE,
      }));
      if (points.length >= 3) {
        rings.push({ hole: child.IsHole(), points });
      }
      visit(child);
    }
  };
  visit(tree);
  return rings;
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

function makeShape(oc: OpenCascadeInstance, ir: CaseIR): TopoDS_Shape {
  const rings = offsetContours(ir.contours.map((contour) => ({
    hole: contour.hole,
    points: cleanPoints(contour),
  })), ir.body.clearance);
  const outers = rings.filter((ring) => !ring.hole);
  const holes = rings.filter((ring) => ring.hole);
  if (outers.length === 0) {
    throw new Error('Case requires at least one outer contour');
  }

  using builder = new oc.BRep_Builder();
  const compound = new oc.TopoDS_Compound();
  builder.MakeCompound(compound);

  const body = ir.body;
  const baseZ = body.z ?? 0;
  const wallHeight = body.kind === 'plate' ? 0 : body.wallHeight ?? 0;
  const totalHeight = body.thickness + wallHeight;

  for (const outer of outers) {
    let shape = makePrism(oc, outer.points, baseZ, totalHeight);
    for (const hole of holes) {
      if (!contains(outer.points, hole.points[0])) {
        continue;
      }
      const tool = makePrism(oc, hole.points, baseZ, totalHeight);
      shape = cutShape(oc, shape, tool);
    }

    if (body.kind !== 'plate') {
      const wall = body.wallThickness!;
      const cavityZ = body.kind === 'tray' ? baseZ + body.thickness : baseZ;
      const cavities = offsetContours([{ hole: false, points: outer.points }], -wall);
      for (const cavity of cavities.filter((ring) => !ring.hole)) {
        shape = cutShape(oc, shape, makePrism(oc, cavity.points, cavityZ, wallHeight));
      }

      if (body.gasket) {
        const { inset, width, depth } = body.gasket;
        const grooveOuters = offsetContours([{ hole: false, points: outer.points }], -inset);
        const grooveInners = offsetContours([{ hole: false, points: outer.points }], -(inset + width));
        const grooveZ = body.kind === 'tray' ? baseZ + totalHeight - depth : baseZ;
        for (const grooveOuter of grooveOuters.filter((ring) => !ring.hole)) {
          let groove = makePrism(oc, grooveOuter.points, grooveZ, depth);
          for (const grooveInner of grooveInners.filter((ring) => !ring.hole)) {
            if (contains(grooveOuter.points, grooveInner.points[0])) {
              groove = cutShape(oc, groove, makePrism(oc, grooveInner.points, grooveZ, depth));
            }
          }
          shape = cutShape(oc, shape, groove);
        }
      }
    }

    for (const mount of body.mounts ?? []) {
      if (!contains(outer.points, mount.at)) {
        continue;
      }
      if (mount.kind === 'boss') {
        const bossZ = body.kind === 'lid'
          ? baseZ + wallHeight - mount.height!
          : baseZ + body.thickness;
        shape = fuseShape(oc, shape, makeCylinder(oc, mount.at, bossZ, mount.bossDiameter!, mount.height!));
      }
      shape = cutShape(oc, shape, makeCylinder(oc, mount.at, baseZ, mount.holeDiameter, totalHeight));
    }
    builder.Add(compound, shape);
  }

  return compound;
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

function validateCase(ir: CaseIR): void {
  if (!Number.isFinite(ir.body.thickness) || ir.body.thickness <= 0) {
    throw new Error('Case thickness must be positive');
  }
  if (!Number.isFinite(ir.body.clearance) || ir.body.clearance < 0) {
    throw new Error('Case clearance must be non-negative');
  }
  if (ir.body.kind !== 'plate') {
    const { wallHeight, wallThickness, gasket } = ir.body;
    if (!wallHeight || !wallThickness || wallHeight <= 0 || wallThickness <= 0) {
      throw new Error('Tray and lid require positive wall height and thickness');
    }
    if (gasket && (
      gasket.inset < 0 || gasket.width <= 0 || gasket.depth <= 0 ||
      gasket.inset + gasket.width >= wallThickness || gasket.depth >= wallHeight
    )) {
      throw new Error('Gasket groove must fit within the wall rim');
    }
  }
  for (const mount of ir.body.mounts ?? []) {
    if (!Number.isFinite(mount.holeDiameter) || mount.holeDiameter <= 0) {
      throw new Error('Mount hole diameter must be positive');
    }
    if (mount.kind === 'boss' && (
      !mount.bossDiameter || !mount.height ||
      mount.bossDiameter <= mount.holeDiameter || mount.height <= 0
    )) {
      throw new Error('Boss diameter and height must exceed its hole and zero');
    }
  }
}

function makeAssembly(oc: OpenCascadeInstance, ir: CaseAssemblyIR): TopoDS_Shape {
  using builder = new oc.BRep_Builder();
  const compound = new oc.TopoDS_Compound();
  builder.MakeCompound(compound);

  try {
    for (const body of ir.bodies) {
      using shape = makeShape(oc, body);
      builder.Add(compound, shape);
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
export async function buildCase(ir: CaseIR): Promise<CaseResult> {
  validateCase(ir);
  const oc = await getKernel();
  const shape = makeShape(oc, ir);
  return exportShape(oc, shape, ir.revision);
}

/** Exports all bodies as one STEP compound and one combined mesh. */
export async function buildAssembly(ir: CaseAssemblyIR): Promise<CaseResult> {
  if (ir.bodies.length === 0) {
    throw new Error('Case assembly requires at least one body');
  }
  for (const body of ir.bodies) {
    if (body.revision !== ir.revision) {
      throw new Error('Case assembly contains a stale body revision');
    }
    validateCase(body);
  }
  const oc = await getKernel();
  const shape = makeAssembly(oc, ir);
  return exportShape(oc, shape, ir.revision);
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

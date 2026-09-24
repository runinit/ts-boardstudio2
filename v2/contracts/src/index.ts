/** All document coordinates are millimetres in a right-handed, Y-up frame. */
export type Id = string;
export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type Pose2 = { at: Vec2; rotation: number };

export type Material = {
  id: Id;
  name: string;
  thickness: number;
};

export type Pad = {
  id: Id;
  number: string;
  at: Vec2;
  size: Vec2;
  shape: 'circle' | 'oval' | 'rect' | 'roundrect';
  drill?: number;
  plated?: boolean;
  side?: 'front' | 'back';
  rotation?: number;
  netId?: Id;
};

export type PartDefinition = {
  id: Id;
  name: string;
  kind: 'switch' | 'controller' | 'connector' | 'encoder' | 'passive' | 'custom' | 'utility';
  keycap?: Vec2;
  /** Tracks whether automatically derived definition envelopes may follow generator edits. */
  envelopeSource?: { courtyard?: 'generated' | 'authored'; keycap?: 'generated' | 'authored' };
  /** Generator net parameter names grouped by stable footprint pad IDs. */
  terminals?: Record<string, Id[]>;
  /** Logical matrix row and column terminals for keyboard switch definitions. */
  matrixTerminals?: { row: string; column: string };
  envelopeNotice?: string;
  courtyard: Vec2[];
  pads: Pad[];
  model?: { assetId: Id; offset: Vec3; rotation: Vec3; scale: Vec3 };
  models?: { assetId: Id; offset: Vec3; rotation: Vec3; scale: Vec3 }[];
  generator?: {
    source: string;
    version: string;
    parameters: Record<string, JsonValue>;
  };
};

export type Part = {
  keycap?: Vec2;
  outline?: { excluded?: boolean; margin?: number };
  id: Id;
  definitionId: Id;
  reference: string;
  pose: Pose2;
  side: 'front' | 'back';
  locked?: boolean;
  properties?: Record<string, string | number>;
  generatorParameters?: Record<string, JsonValue>;
};

export type Net = { id: Id; name: string; pins: { partId: Id; padId: Id }[] };
export type CopperTrace = {
  id: Id;
  start: Vec2;
  end: Vec2;
  width: number;
  layer: 'front' | 'back';
  netId?: Id;
};
export type CopperVia = {
  id: Id;
  at: Vec2;
  size: number;
  drill: number;
  netId?: Id;
};
export type Matrix = {
  id: Id;
  name?: string;
  boardId?: Id;
  rows: number;
  columns: number;
  pitch: Vec2;
  origin: Vec2;
  definitionId: Id;
  partIds: Id[];
  mirror?: 'none' | 'x' | 'y';
  rotation?: number;
  edgeGap?: Vec2;
  diodes?: boolean;
  diodeDirection?: 'row2col' | 'col2row';
  rowOffsets?: Vec2[];
  columnOffsets?: Vec2[];
  columnStaggers?: number[];
  columnSplays?: number[];
  cells?: MatrixCell[];
};

export type MatrixCell = {
  row: number;
  column: number;
  enabled: boolean;
  diode?: boolean;
  definitionId?: Id;
  variant?: string;
  offset?: Vec2;
  rotation?: number;
  assemblies?: MatrixAssembly[];
};

export type MatrixAssembly = {
  id: Id;
  definitionId: Id;
  offset: Vec2;
  rotation?: number;
  side?: 'front' | 'back';
};

export type Constraint =
  | { id: Id; kind: 'offset'; sourcePartId: Id; targetPartId: Id; offset: Vec2; rotation: number }
  | { id: Id; kind: 'mirror'; sourcePartId: Id; targetPartId: Id; axis: 'vertical' | 'horizontal'; coordinate: number };

export type OutlineSettings = { corners: 'sharp' | 'fillet' | 'chamfer'; size: number; bridgeWidth: number };
export const defaultOutlineSettings: OutlineSettings = { corners: 'fillet', size: 2, bridgeWidth: 10 };

export type OutlineFeature =
  | { id: Id; kind: 'polygon'; points: Vec2[]; operation: 'add' | 'subtract' }
  | { id: Id; kind: 'rect'; center: Vec2; size: Vec2; radius: number; operation: 'add' | 'subtract' }
  | { id: Id; kind: 'part-envelope'; settings?: OutlineSettings; partIds: Id[]; margin: number; operation: 'add' | 'subtract' };

export type Board = {
  id: Id;
  name: string;
  outlineIds: Id[];
  partIds: Id[];
  netIds: Id[];
  thickness: number;
  traces?: CopperTrace[];
  vias?: CopperVia[];
};

export type CaseBody = {
  id: Id;
  name: string;
  boardId: Id;
  kind: 'plate' | 'tray' | 'lid';
  thickness: number;
  clearance: number;
  materialId?: Id;
  z?: number;
  wallHeight?: number;
  wallThickness?: number;
  mounts?: {
    id: Id;
    at: Vec2;
    kind: 'hole' | 'boss';
    holeDiameter: number;
    bossDiameter?: number;
    height?: number;
  }[];
  gasket?: { inset: number; width: number; depth: number };
};

export type Asset = {
  id: Id;
  name: string;
  mediaType: string;
  sha256: string;
  license?: string;
  source?: string;
};

export type Script = { id: Id; name: string; source: string; enabled: boolean };

export type ProjectDoc = {
  format: 'boardstudio/v2';
  id: Id;
  name: string;
  revision: number;
  parameters: Record<string, number | string>;
  definitions: PartDefinition[];
  parts: Part[];
  matrices: Matrix[];
  constraints: Constraint[];
  nets: Net[];
  outline: OutlineFeature[];
  boards: Board[];
  caseBodies: CaseBody[];
  materials: Material[];
  assets: Asset[];
  scripts: Script[];
};

export type EditPhase = 'preview' | 'commit';
export type EditOperation =
  | { kind: 'move-parts'; positions: { id: Id; at: Vec2 }[] }
  | { kind: 'set-outline'; feature: OutlineFeature }
  | { kind: 'add-part'; part: Part; boardId?: Id }
  | { kind: 'remove-parts'; ids: Id[] }
  | { kind: 'remove-matrix'; id: Id }
  | { kind: 'set-net'; net: Net }
  | { kind: 'set-case'; body: CaseBody }
  | { kind: 'set-matrix'; matrix: Matrix; definitions?: PartDefinition[] }
  | { kind: 'set-constraint'; constraint: Constraint }
  | { kind: 'remove-constraint'; id: Id }
  | { kind: 'replace-document'; document: ProjectDoc };

export type EditCommand = {
  baseRevision: number;
  transactionId: Id;
  phase: EditPhase;
  targetIds: Id[];
  operation: EditOperation;
};

export type Contour = { points: Vec2[]; hole: boolean };
export type Finding = {
  id: Id;
  severity: 'error' | 'warning' | 'info';
  scope: 'layout' | 'outline' | 'pcb' | 'case';
  message: string;
  targetIds: Id[];
};

export type Readiness = { layout: boolean; outline: boolean; pcb: boolean; case: boolean };
export type SceneDelta = {
  revision: number;
  transactionId: Id;
  changedIds: Id[];
  transforms: { id: Id; pose: Pose2 }[];
  contours: Contour[];
  boardContours: { boardId: Id; contours: Contour[] }[];
  boardReadiness: { boardId: Id; outline: boolean; pcb: boolean; case: boolean }[];
  findings: Finding[];
  readiness: Readiness;
};

export type CaseIR = {
  revision: number;
  body: CaseBody;
  contours: Contour[];
};

export type CaseAssemblyIR = { revision: number; bodies: CaseIR[] };

export type CaseResult = {
  revision: number;
  step: Uint8Array;
  mesh: { positions: Float32Array; normals: Float32Array };
};

export type CoreRequest = (
  | { id: Id; kind: 'open'; document: ProjectDoc }
  | { id: Id; kind: 'edit'; command: EditCommand }
  | { id: Id; kind: 'undo' | 'redo' }
  | { id: Id; kind: 'snapshot' }
) & { diagnostics?: true };

export type CoreTiming = { wasmMs: number; parseMs: number };

export type CoreReply =
  | { id: Id; kind: 'preview'; scene: SceneDelta; timing?: CoreTiming }
  | { id: Id; kind: 'scene'; scene: SceneDelta; document: ProjectDoc; timing?: CoreTiming }
  | { id: Id; kind: 'error'; message: string; revision: number; timing?: CoreTiming };

export const emptyProject = (id: Id, name: string): ProjectDoc => ({
  format: 'boardstudio/v2',
  id,
  name,
  revision: 0,
  parameters: {},
  definitions: [],
  parts: [],
  matrices: [],
  constraints: [],
  nets: [],
  outline: [],
  boards: [],
  caseBodies: [],
  materials: [],
  assets: [],
  scripts: [],
});

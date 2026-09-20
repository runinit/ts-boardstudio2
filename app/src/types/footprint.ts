export type Vec3 = [number, number, number];
export type FootprintParameter = {
  readonly type: string;
  readonly value: unknown;
  readonly choices?: readonly string[];
};
export type FootprintParameters = Readonly<Record<string, FootprintParameter>>;
export type ModelBinding = {
  path: string;
  asset?: string;
  offset: Vec3;
  rotate: Vec3;
  scale: Vec3;
  sourceUrl?: string;
  hash?: string;
  metadata?: string[];
  frame?: number[];
  footprintKey?: string;
  footprintReference?: string;
};
export type FootprintTarget = {
  index?: number;
  count?: number;
  name?: string;
  reference?: string;
  id?: string;
};
export type FootprintInfo = {
  name?: string;
  at?: number[];
  side?: 'F' | 'B';
  targets: FootprintTarget[];
  pads: {
    index: number;
    number: string;
    type: string;
    shape: string;
    at: number[];
    size: number[];
    layers: string[];
    mechanical: boolean;
    drill?: string;
    roundrect?: number;
    polygons?: number[][][];
    polygonWidths?: number[];
    anchor?: 'rect' | 'circle';
    drillSize?: number[];
    drillOffset?: number[];
    unsupportedGeometry?: string[];
    chamferRatio?: number;
    chamfer?: string[];
  }[];
  zones?: {
    kind: 'keepout' | 'zone';
    layers: string[];
    polygons: number[][][];
  }[];
  tracks?: {
    type: 'segment' | 'arc';
    start: number[];
    end: number[];
    mid: number[];
    width: number;
    layer: string;
  }[];
  vias?: { at: number[]; size: number; drill: number; layers: string[] }[];
  nets: {
    number: string;
    mappingKey?: string;
    parameter: string;
    pads: number[];
  }[];
  models: ModelBinding[];
  graphics: {
    type: string;
    layer: string;
    start: number[];
    end: number[];
    mid: number[];
    center: number[];
    points: number[][];
  }[];
  diagnostics: { code: string; severity: string; message: string }[];
};
export type LibraryEntry = {
  id: string;
  alias: string;
  name: string;
  revision: number;
  origin: {
    kind: 'kicad' | 'ergogen';
    original: string;
    url?: string;
    hash?: string;
  };
  module: string;
  resolved: string;
  mapping: Record<string, string>;
  parameters?: Record<string, unknown>;
  models: ModelBinding[];
  modelMode: 'preserve' | 'replace';
  target?: FootprintTarget;
  assets: Record<string, string>;
  updatedAt?: string;
};

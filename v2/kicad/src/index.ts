import type {
  Board,
  Contour,
  CopperTrace,
  CopperVia,
  Id,
  Net,
  Pad,
  Part,
  PartDefinition,
  ProjectDoc,
  Vec2,
} from '../../contracts/src/index.ts';
import { compileFootprint } from './footprint.ts';

const FILE_VERSION = 20241229;
const EDGE_WIDTH = 0.05;
const COURTYARD_WIDTH = 0.05;
const TEXT_STROKE = 0.15;
const TEXT_SIZE = 1;
const MAX_COORD = 1_000_000;

export type ExportedBoard = { filename: string; content: string };
export type ExportedFootprint = { filename: string; content: string };

export class KiCadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KiCadError';
  }
}

const quote = (value: string): string => {
  if (/[\x00-\x1f]/u.test(value)) {
    throw new KiCadError('KiCad text contains a control character');
  }

  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
};

const num = (value: number): string => {
  if (!Number.isFinite(value) || Math.abs(value) > MAX_COORD) {
    throw new KiCadError(`Invalid KiCad coordinate: ${value}`);
  }

  return Object.is(value, -0) ? '0' : Number(value.toFixed(6)).toString();
};

const xy = (point: Vec2): string => `${num(point.x)} ${num(-point.y)}`;

const safeName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]+/gu, '_').replace(/^\.+/u, '').slice(0, 80) || 'board';

// Deterministic IDs keep KiCad object identity stable across repeated exports.
const uuid = (value: string): string => {
  const words = [0x811c9dc5, 0x91f832ec, 0xd1f5ab43, 0x67ed3a21];

  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    for (let i = 0; i < words.length; i += 1) {
      words[i] = Math.imul(words[i] ^ (code + i), 0x01000193) >>> 0;
    }
  }

  const hex = words.map((word) => word.toString(16).padStart(8, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const assertUnique = (items: { id: Id }[], label: string): void => {
  const ids = new Set<string>();

  for (const item of items) {
    if (!item.id || ids.has(item.id)) {
      throw new KiCadError(`Duplicate or empty ${label} ID: ${item.id}`);
    }
    ids.add(item.id);
  }
};

const assertFootprint = (definition: PartDefinition): void => {
  assertUnique(definition.pads, 'pad');

  for (const point of definition.courtyard) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new KiCadError(`Invalid courtyard coordinate: ${definition.id}`);
    }
  }

  const numbers = new Set<string>();
  for (const pad of definition.pads) {
    if ((!pad.number.trim() && pad.plated !== false) || (pad.number.trim() && numbers.has(pad.number))) {
      throw new KiCadError(`Duplicate or empty pad number: ${pad.number}`);
    }
    if (pad.number.trim()) {
      numbers.add(pad.number);
    }

    if (!Number.isFinite(pad.at.x) || !Number.isFinite(pad.at.y)
      || !Number.isFinite(pad.size.x) || pad.size.x <= 0
      || !Number.isFinite(pad.size.y) || pad.size.y <= 0
      || (pad.drill !== undefined && (!Number.isFinite(pad.drill) || pad.drill <= 0))) {
      throw new KiCadError(`Invalid pad geometry: ${pad.id}`);
    }
  }
};

const padNetIds = (doc: ProjectDoc, board: Board): Map<string, Id> => {
  const lookup = new Map<string, Id>();
  const parts = new Set(board.partIds);
  const nets = new Map(doc.nets.map((net) => [net.id, net]));

  for (const id of board.netIds) {
    const net = nets.get(id);
    if (!net) {
      throw new KiCadError(`Board references missing net ${id}`);
    }

    for (const pin of net.pins) {
      if (!parts.has(pin.partId)) {
        throw new KiCadError(`Net ${id} references part outside board: ${pin.partId}`);
      }

      const key = `${pin.partId}\u0000${pin.padId}`;
      const previous = lookup.get(key);
      if (previous && previous !== id) {
        throw new KiCadError(`Pad ${pin.padId} belongs to two nets`);
      }
      lookup.set(key, id);
    }
  }

  return lookup;
};

const layers = (back: boolean, through: boolean): string => {
  if (through) {
    return '"*.Cu" "*.Mask"';
  }

  return back ? '"B.Cu" "B.Paste" "B.Mask"' : '"F.Cu" "F.Paste" "F.Mask"';
};

const padText = (pad: Pad, net: { index: number; name: string } | undefined, scope: string, back = false): string => {
  if (pad.size.x <= 0 || pad.size.y <= 0 || (pad.drill !== undefined && pad.drill <= 0)) {
    throw new KiCadError(`Invalid pad dimensions: ${pad.id}`);
  }

  const through = pad.drill !== undefined;
  const type = through ? (pad.plated === false ? 'np_thru_hole' : 'thru_hole') : 'smd';
  const shape = pad.shape;
  const drill = through ? ` (drill ${num(pad.drill!)})` : '';
  const radius = shape === 'roundrect' ? ' (roundrect_rratio 0.25)' : '';
  const netText = net ? ` (net ${net.index} ${quote(net.name)})` : '';

  const padBack = pad.side ? pad.side === 'back' : back;
  const layerText = pad.plated === false ? '"*.Cu" "*.Mask"' : layers(padBack, through);
  const rotation = pad.rotation ? ` ${num(-pad.rotation)}` : '';
  return `(pad ${quote(pad.number)} ${type} ${shape} (at ${xy(pad.at)}${rotation}) (size ${num(pad.size.x)} ${num(pad.size.y)})${drill} (layers ${layerText})${radius}${netText} (uuid ${quote(uuid(`${scope}:pad:${pad.id}`))}))`;
};

const courtyardText = (points: readonly Readonly<Vec2>[], scope: string, back = false): string[] => {
  if (points.length < 3) {
    throw new KiCadError(`Footprint ${scope} needs a courtyard polygon`);
  }

  const layer = back ? 'B.CrtYd' : 'F.CrtYd';
  return points.map((point, index) => {
    const end = points[(index + 1) % points.length];
    return `(fp_line (start ${xy(point)}) (end ${xy(end)}) (stroke (width ${num(COURTYARD_WIDTH)}) (type solid)) (layer ${quote(layer)}) (uuid ${quote(uuid(`${scope}:courtyard:${index}`))}))`;
  });
};

const modelText = (definition: PartDefinition, models: ReadonlyMap<Id, string>): string => {
  if (!definition.model) {
    return '';
  }

  const path = models.get(definition.model.assetId);
  if (!path || path.startsWith('/') || path.includes('..') || path.includes('\\') || /^[a-z]+:/iu.test(path)) {
    throw new KiCadError(`Model ${definition.model.assetId} needs a safe relative path`);
  }

  const { offset, rotation, scale } = definition.model;
  return `(model ${quote(`\${KIPRJMOD}/${path}`)} (offset (xyz ${num(offset.x)} ${num(-offset.y)} ${num(offset.z)})) (scale (xyz ${num(scale.x)} ${num(scale.y)} ${num(scale.z)})) (rotate (xyz ${num(rotation.x)} ${num(rotation.y)} ${num(-rotation.z)})))`;
};

const footprintText = (
  definition: PartDefinition,
  scope: string,
  part: Part | undefined,
  nets: Map<string, { index: number; name: string }>,
  models: ReadonlyMap<Id, string>,
): string => {
  assertFootprint(definition);
  const back = part?.side === 'back';
  const geometry = compileFootprint(definition, back ? 'back' : 'front');
  const layer = back ? 'B.Cu' : 'F.Cu';
  const refLayer = back ? 'B.SilkS' : 'F.SilkS';
  const fabLayer = back ? 'B.Fab' : 'F.Fab';
  const name = safeName(definition.name);
  const at = part ? ` (at ${xy(part.pose.at)} ${num(-part.pose.rotation)})` : '';
  const reference = part?.reference || 'REF**';
  const referenceY = Math.max(0, ...geometry.courtyard.map((point) => Math.abs(point.y))) + 2;
  const mirrorText = back ? ' (justify mirror)' : '';
  const hideReference = definition.generator?.source === 'builtin:rgb-led' || definition.generator?.source === 'builtin:matrix-diode';
  const referenceProp = `(property "Reference" ${quote(reference)} (at 0 ${num(referenceY)} 0) (layer ${quote(refLayer)})${hideReference ? ' (hide yes)' : ''} (effects (font (size ${TEXT_SIZE} ${TEXT_SIZE}) (thickness ${TEXT_STROKE}))${mirrorText}))`;
  const valueProp = `(property "Value" ${quote(definition.name)} (at 0 -2 0) (layer ${quote(fabLayer)}) (effects (font (size ${TEXT_SIZE} ${TEXT_SIZE}) (thickness ${TEXT_STROKE}))${mirrorText}))`;
  const pads = geometry.pads.map((pad) => padText(pad, nets.get(`${part?.id}\u0000${pad.id}`), scope, back));
  const courtyard = courtyardText(geometry.courtyard, scope, back);
  const model = modelText(definition, models);
  const localCopper = part ? [] : [
    ...geometry.traces.map((trace) => `(fp_line (start ${xy(trace.start)}) (end ${xy(trace.end)}) (stroke (width ${num(trace.width)}) (type solid)) (layer ${quote(trace.layer === 'front' ? 'F.Cu' : 'B.Cu')}) (uuid ${quote(uuid(`${scope}:trace:${trace.id}`))}))`),
    ...geometry.vias.map((via) => {
      const source = geometry.pads.find((pad) => pad.id === via.padId);
      if (!source) {
        throw new KiCadError(`Via ${via.id} references missing pad`);
      }
      return padText({ id: via.id, number: source.number, at: via.at, size: { x: via.size, y: via.size }, shape: 'circle', drill: via.drill }, undefined, scope);
    }),
  ];

  return `(footprint ${quote(name)} (layer ${quote(layer)})${at} (uuid ${quote(uuid(scope))})
    ${referenceProp}
    ${valueProp}
    ${courtyard.join('\n    ')}
    ${pads.join('\n    ')}
    ${localCopper.join('\n    ')}
    ${model}
  )`;
};

export const exportFootprint = (
  definition: PartDefinition,
  models: ReadonlyMap<Id, string> = new Map(),
): string => {
  return `${footprintText(definition, `definition:${definition.id}`, undefined, new Map(), models)}\n`;
};

export const exportFootprintFile = (
  definition: PartDefinition,
  models: ReadonlyMap<Id, string> = new Map(),
): ExportedFootprint => ({
  filename: `${safeName(definition.name)}.kicad_mod`,
  content: exportFootprint(definition, models),
});

const edgeText = (contours: Contour[], scope: string): string[] => {
  if (!contours.length) {
    throw new KiCadError('Board outline has no resolved contours');
  }

  const lines: string[] = [];
  for (let contourIndex = 0; contourIndex < contours.length; contourIndex += 1) {
    const contour = contours[contourIndex];
    if (contour.points.length < 3) {
      throw new KiCadError('Board contour needs at least three points');
    }

    for (let i = 0; i < contour.points.length; i += 1) {
      const start = contour.points[i];
      const end = contour.points[(i + 1) % contour.points.length];
      if (start.x === end.x && start.y === end.y) {
        continue;
      }

      lines.push(`(gr_line (start ${xy(start)}) (end ${xy(end)}) (stroke (width ${num(EDGE_WIDTH)}) (type solid)) (layer "Edge.Cuts") (uuid ${quote(uuid(`${scope}:edge:${contourIndex}:${i}`))}))`);
    }
  }

  return lines;
};

const copperText = (board: Board, netIndex: ReadonlyMap<Id, { index: number; name: string }>): string[] => {
  const traces = board.traces ?? [];
  const vias = board.vias ?? [];
  assertUnique([...traces, ...vias], 'copper');

  const netNumber = (netId: Id | undefined): number => {
    if (!netId) {
      return 0;
    }
    const net = netIndex.get(netId);
    if (!net) {
      throw new KiCadError(`Copper references a net outside board: ${netId}`);
    }
    return net.index;
  };

  const segment = (trace: CopperTrace): string => {
    if (trace.width <= 0 || (trace.start.x === trace.end.x && trace.start.y === trace.end.y)) {
      throw new KiCadError(`Invalid trace geometry: ${trace.id}`);
    }
    const layer = trace.layer === 'front' ? 'F.Cu' : 'B.Cu';
    return `(segment (start ${xy(trace.start)}) (end ${xy(trace.end)}) (width ${num(trace.width)}) (layer ${quote(layer)}) (net ${netNumber(trace.netId)}) (uuid ${quote(uuid(`${board.id}:trace:${trace.id}`))}))`;
  };

  const via = (entry: CopperVia): string => {
    if (entry.size <= 0 || entry.drill <= 0 || entry.drill >= entry.size) {
      throw new KiCadError(`Invalid via geometry: ${entry.id}`);
    }
    return `(via (at ${xy(entry.at)}) (size ${num(entry.size)}) (drill ${num(entry.drill)}) (layers "F.Cu" "B.Cu") (net ${netNumber(entry.netId)}) (uuid ${quote(uuid(`${board.id}:via:${entry.id}`))}))`;
  };

  return [...traces.map(segment), ...vias.map(via)];
};

export const exportBoard = (
  doc: ProjectDoc,
  boardId: Id,
  contours: Contour[],
  revision: number,
  models: ReadonlyMap<Id, string> = new Map(),
): ExportedBoard => {
  if (doc.format !== 'boardstudio/v2' || doc.revision !== revision) {
    throw new KiCadError('Export requires a committed current v2 revision');
  }

  const board = doc.boards.find((entry) => entry.id === boardId);
  if (!board || board.thickness <= 0) {
    throw new KiCadError(`Missing board or invalid thickness: ${boardId}`);
  }

  assertUnique(doc.definitions, 'definition');
  assertUnique(doc.parts, 'part');
  assertUnique(doc.nets, 'net');
  const definitions = new Map(doc.definitions.map((item) => [item.id, item]));
  const parts = new Map(doc.parts.map((item) => [item.id, item]));
  const allNets = new Map(doc.nets.map((item) => [item.id, item]));
  const pinNets = padNetIds(doc, board);
  const netIndex = new Map<Id, { index: number; name: string }>();

  board.netIds.forEach((id, index) => {
    const net = allNets.get(id)!;
    netIndex.set(id, { index: index + 1, name: net.name });
  });

  const footprints = board.partIds.map((id) => {
    const part = parts.get(id);
    const definition = part && definitions.get(part.definitionId);
    if (!part || !definition) {
      throw new KiCadError(`Missing part or definition: ${id}`);
    }

    const map = new Map<string, { index: number; name: string }>();
    const geometry = compileFootprint(definition, part.side);
    for (const pad of geometry.pads) {
      const explicit = pinNets.get(`${id}\u0000${pad.id}`);
      const authored = definition.pads.find((entry) => entry.id === pad.id)?.netId;
      const selected = explicit ?? authored;
      if (explicit && authored && explicit !== authored) {
        throw new KiCadError(`Conflicting net for ${id}/${pad.id}`);
      }
      if (selected) {
        const net = netIndex.get(selected);
        if (!net) {
          throw new KiCadError(`Pad ${id}/${pad.id} references a net outside board`);
        }
        map.set(`${id}\u0000${pad.id}`, net);
      }
    }

    for (const key of pinNets.keys()) {
      if (key.startsWith(`${id}\u0000`) && !geometry.pads.some((pad) => key === `${id}\u0000${pad.id}`)) {
        throw new KiCadError(`Net references missing pad on part ${id}`);
      }
    }

    return footprintText(definition, `${board.id}:part:${id}`, part, map, models);
  });

  const edges = edgeText(contours, board.id);
  const generatedTraces: CopperTrace[] = [];
  const generatedVias: CopperVia[] = [];
  for (const id of board.partIds) {
    const part = parts.get(id)!;
    const definition = definitions.get(part.definitionId)!;
    const geometry = compileFootprint(definition, part.side);
    const angle = part.pose.rotation * Math.PI / 180;
    const at = (point: Vec2): Vec2 => {
      const x = part.side === 'back' ? -point.x : point.x;
      return {
        x: part.pose.at.x + x * Math.cos(angle) - point.y * Math.sin(angle),
        y: part.pose.at.y + x * Math.sin(angle) + point.y * Math.cos(angle),
      };
    };
    const netId = (padId: string): Id | undefined => pinNets.get(`${id}\u0000${padId}`)
      ?? definition.pads.find((pad) => pad.id === padId)?.netId;
    for (const trace of geometry.traces) {
      generatedTraces.push({ id: `${id}:${trace.id}`, start: at(trace.start), end: at(trace.end), width: trace.width, layer: part.side === 'back' ? 'back' : trace.layer, netId: netId(trace.padId) });
    }
    for (const via of geometry.vias) {
      generatedVias.push({ id: `${id}:${via.id}`, at: at(via.at), size: via.size, drill: via.drill, netId: netId(via.padId) });
    }
  }
  const copper = copperText({ ...board, traces: [...(board.traces ?? []), ...generatedTraces], vias: [...(board.vias ?? []), ...generatedVias] }, netIndex);
  const nets = board.netIds.map((id) => {
    const net = netIndex.get(id)!;
    return `(net ${net.index} ${quote(net.name)})`;
  });

  const content = `(kicad_pcb (version ${FILE_VERSION}) (generator "BoardStudio")
  (general (thickness ${num(board.thickness)}))
  (paper "A4")
  (layers (0 "F.Cu" signal) (31 "B.Cu" signal) (44 "Edge.Cuts" user) (46 "B.CrtYd" user) (47 "F.CrtYd" user) (48 "B.Fab" user) (49 "F.Fab" user))
  (net 0 "")
  ${nets.join('\n  ')}
  ${footprints.join('\n  ')}
  ${copper.join('\n  ')}
  ${edges.join('\n  ')}
)\n`;

  return { filename: `${safeName(board.name)}.kicad_pcb`, content };
};

export const serializeBoard = (doc: ProjectDoc, contours: Contour[], boardId: Id): string =>
  exportBoard(doc, boardId, contours, doc.revision).content;

export { importFootprint } from './import.ts';
export { compileFootprint, previewFootprint } from './footprint.ts';
export type { FootprintIR } from './footprint.ts';
export { builtinDefinitions } from './builtins.ts';

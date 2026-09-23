import type { Id, Pad, PartDefinition, Vec2 } from '../../contracts/src/index.ts';
import { KiCadError } from './index.ts';

type SExpr = string | SExpr[];

const tokenize = (source: string): string[] => {
  const tokens: string[] = [];
  const pattern = /\s*(\(|\)|"(?:\\.|[^"\\])*"|[^\s()]+)/guy;
  let offset = 0;

  while (offset < source.length) {
    pattern.lastIndex = offset;
    const match = pattern.exec(source);
    if (!match) {
      if (/^\s*$/u.test(source.slice(offset))) {
        break;
      }
      throw new KiCadError(`Invalid footprint syntax at byte ${offset}`);
    }
    tokens.push(match[1]);
    offset = pattern.lastIndex;
  }

  return tokens;
};

const parse = (tokens: string[]): SExpr => {
  let cursor = 0;

  const read = (): SExpr => {
    const token = tokens[cursor++];
    if (token === undefined) {
      throw new KiCadError('Unexpected end of footprint');
    }
    if (token === ')') {
      throw new KiCadError('Unexpected closing parenthesis');
    }
    if (token !== '(') {
      return token.startsWith('"') ? JSON.parse(token) as string : token;
    }

    const children: SExpr[] = [];
    while (tokens[cursor] !== ')') {
      children.push(read());
    }
    cursor += 1;
    return children;
  };

  const tree = read();
  if (cursor !== tokens.length) {
    throw new KiCadError('Footprint contains trailing forms');
  }
  return tree;
};

const children = (node: SExpr, name: string): SExpr[][] => {
  if (!Array.isArray(node)) {
    return [];
  }
  return node.filter((child): child is SExpr[] => Array.isArray(child) && child[0] === name);
};

const field = (node: SExpr, name: string): SExpr[] | undefined => children(node, name)[0];

const scalar = (node: SExpr | undefined, label: string): string => {
  if (typeof node !== 'string') {
    throw new KiCadError(`Footprint needs ${label}`);
  }
  return node;
};

const coordinate = (node: SExpr | undefined, label: string): number => {
  const value = Number(scalar(node, label));
  if (!Number.isFinite(value)) {
    throw new KiCadError(`Invalid ${label}`);
  }
  return value;
};

const position = (node: SExpr[], label: string): Vec2 => {
  const y = -coordinate(node[2], `${label} Y`);
  return {
    x: coordinate(node[1], `${label} X`),
    y: Object.is(y, -0) ? 0 : y,
  };
};

const samePoint = (left: Vec2, right: Vec2): boolean => left.x === right.x && left.y === right.y;

const readCourtyard = (tree: SExpr[]): Vec2[] => {
  const geometry = ['fp_line', 'fp_arc', 'fp_circle', 'fp_poly', 'fp_rect'];
  const lines: { start: Vec2; end: Vec2 }[] = [];

  for (const kind of geometry) {
    for (const item of children(tree, kind)) {
      if (field(item, 'layer')?.[1] !== 'F.CrtYd') {
        continue;
      }
      if (kind !== 'fp_line') {
        throw new KiCadError(`Unsupported courtyard ${kind}`);
      }
      const start = field(item, 'start');
      const end = field(item, 'end');
      if (!start || !end) {
        throw new KiCadError('Courtyard line needs start and end points');
      }
      lines.push({ start: position(start, 'courtyard'), end: position(end, 'courtyard') });
    }
  }

  if (lines.length < 3) {
    throw new KiCadError('Footprint needs a front courtyard polygon');
  }

  const points = [lines[0].start, lines[0].end];
  const remaining = lines.slice(1);
  while (remaining.length) {
    const next = remaining.findIndex((line) => samePoint(line.start, points[points.length - 1]));
    if (next < 0) {
      throw new KiCadError('Disconnected courtyard lines');
    }
    points.push(remaining.splice(next, 1)[0].end);
  }

  if (!samePoint(points[0], points[points.length - 1])) {
    throw new KiCadError('Open courtyard polygon');
  }
  points.pop();
  if (new Set(points.map((point) => `${point.x},${point.y}`)).size !== points.length) {
    throw new KiCadError('Courtyard has repeated vertices');
  }
  return points;
};

const readPad = (node: SExpr[], index: number): Pad => {
  const number = scalar(node[1], 'pad number');
  const kind = scalar(node[2], 'pad type');
  const shape = scalar(node[3], 'pad shape');
  if (!['smd', 'thru_hole'].includes(kind) || !['circle', 'oval', 'rect', 'roundrect'].includes(shape)) {
    throw new KiCadError(`Unsupported pad ${number}: ${kind} ${shape}`);
  }

  const at = field(node, 'at');
  const size = field(node, 'size');
  if (!at || !size || at.length > 4) {
    throw new KiCadError(`Unsupported pad position: ${number}`);
  }
  if (at.length === 4 && coordinate(at[3], 'pad rotation') !== 0) {
    throw new KiCadError(`Unsupported pad rotation: ${number}`);
  }

  const layers = field(node, 'layers');
  const expectedLayers = kind === 'thru_hole'
    ? ['*.Cu', '*.Mask']
    : ['F.Cu', 'F.Paste', 'F.Mask'];
  if (!layers || layers.length !== expectedLayers.length + 1
    || expectedLayers.some((layer, layerIndex) => layers[layerIndex + 1] !== layer)) {
    throw new KiCadError(`Unsupported pad layers: ${number}`);
  }
  const omittedFeatures = ['solder_mask_margin', 'solder_paste_margin', 'solder_paste_margin_ratio', 'clearance', 'thermal_bridge_width', 'thermal_gap', 'options', 'primitives', 'chamfer_ratio', 'rect_delta'];
  if (omittedFeatures.some((feature) => field(node, feature))) {
    throw new KiCadError(`Unsupported pad feature: ${number}`);
  }
  const radius = field(node, 'roundrect_rratio');
  if (shape === 'roundrect' && (!radius || coordinate(radius[1], 'roundrect radius') !== 0.25)) {
    throw new KiCadError(`Unsupported pad roundrect radius: ${number}`);
  }

  const drill = field(node, 'drill');
  const pad: Pad = {
    id: `pad-${index}`,
    number,
    at: position(at, 'pad position'),
    size: { x: coordinate(size[1], 'pad width'), y: coordinate(size[2], 'pad height') },
    shape: shape as Pad['shape'],
  };
  if (kind === 'thru_hole') {
    if (!drill || drill.length !== 2) {
      throw new KiCadError(`Unsupported drill on pad ${number}`);
    }
    pad.drill = coordinate(drill[1], 'drill');
  }
  return pad;
};

/** Import static pad and courtyard geometry; reject features this model cannot preserve. */
export const importFootprint = (source: string, id: Id): PartDefinition => {
  const tree = parse(tokenize(source));
  if (!Array.isArray(tree) || !['footprint', 'module'].includes(String(tree[0]))) {
    throw new KiCadError('Expected a KiCad footprint');
  }

  const name = scalar(tree[1], 'footprint name');
  if (children(tree, 'model').length) {
    throw new KiCadError('Footprint has unsupported model references; import model assets separately');
  }
  if (children(tree, 'zone').length || children(tree, 'pad').some((pad) => field(pad, 'custom'))) {
    throw new KiCadError('Footprint has unsupported zones or custom pads');
  }

  const pads = children(tree, 'pad').map(readPad);
  const courtyard = readCourtyard(tree);

  return { id, name, kind: 'custom', courtyard, pads };
};

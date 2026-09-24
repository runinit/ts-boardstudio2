import type { Pad, PartDefinition, Vec2 } from '../../contracts/src/index.ts';

type Params = Record<string, number | string | boolean>;
export type LocalTrace = { id: string; start: Vec2; end: Vec2; width: number; padId: string; layer: 'front' | 'back' };
export type LocalVia = { id: string; at: Vec2; size: number; drill: number; padId: string };
export type BuiltinGeometry = { pads: Pad[]; courtyard: Vec2[]; traces: LocalTrace[]; vias: LocalVia[] };

const VERSION = '1';
const MIN_HOLE_CLEARANCE = 0.2;
const BOX = (half: number): Vec2[] => [
  { x: -half, y: -half }, { x: half, y: -half },
  { x: half, y: half }, { x: -half, y: half },
];

const numberParam = (params: Params, key: string, fallback: number): number => {
  const value = params[key] ?? fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${key} footprint setting`);
  }
  return value;
};

const boolParam = (params: Params, key: string, fallback: boolean): boolean => {
  const value = params[key] ?? fallback;
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid ${key} footprint setting`);
  }
  return value;
};

const pad = (id: string, number: string, x: number, y: number, size: number, drill?: number): Pad => ({
  id, number, at: { x, y }, size: { x: size, y: size }, shape: 'circle', ...(drill ? { drill } : {}),
});

const assertMountClearance = (pads: Pad[]): void => {
  const holes = pads.filter((entry) => entry.plated === false && entry.drill);
  for (const contact of pads.filter((entry) => entry.number)) {
    for (const hole of holes) {
      const dx = Math.abs(contact.at.x - hole.at.x);
      const dy = Math.abs(contact.at.y - hole.at.y);
      const halfX = contact.size.x / 2;
      const halfY = contact.size.y / 2;
      const distance = contact.shape === 'circle'
        ? Math.hypot(dx, dy) - Math.max(halfX, halfY)
        : Math.hypot(Math.max(0, dx - halfX), Math.max(0, dy - halfY));
      if (distance - hole.drill! / 2 < MIN_HOLE_CLEARANCE) {
        throw new Error(`Pad ${contact.number} overlaps mounting hole ${hole.id}`);
      }
    }
  }
};

const switchGeometry = (family: 'mx' | 'choc', hotswap: boolean, params: Params): BuiltinGeometry => {
  const nominalSpacing = family === 'mx' ? (hotswap ? 12.952 : 6.35) : (hotswap ? 11.55 : 5);
  const spacing = numberParam(params, 'padSpacing', nominalSpacing);
  const drill = numberParam(params, 'padDrill', family === 'mx' ? 1.4986 : 1.27);
  const size = numberParam(params, 'padSize', hotswap ? 2.6 : family === 'mx' ? 2.286 : 2.032);
  if (!hotswap && size <= drill) {
    throw new Error('Switch pad size must exceed its drill');
  }
  const reversible = boolParam(params, 'reversible', false);
  const includeCopper = boolParam(params, 'includeTracesVias', false);
  const contacts = family === 'mx'
    ? hotswap
      ? [{ x: 7.11, y: -2.54 }, { x: -5.842, y: -5.08 }]
      : [{ x: -2.54, y: -5.08 }, { x: 3.81, y: -2.54 }]
    : hotswap
      ? [{ x: 3.275, y: -5.95 }, { x: -8.275, y: -3.75 }]
      : [{ x: -5, y: -3.8 }, { x: 0, y: -5.9 }];
  const offset = spacing - nominalSpacing;
  contacts[1].x += Math.sign(contacts[1].x - contacts[0].x) * offset;
  const pads: Pad[] = contacts.map((at, index) => ({
    id: index === 0 ? 'one' : 'two',
    number: String(index + 1),
    at,
    size: { x: size, y: hotswap ? (family === 'mx' ? 2.5 : 2.6) : size },
    shape: hotswap ? 'rect' : 'circle',
    ...(hotswap ? {} : { drill }),
  }));
  const center = family === 'mx' ? 4.1 : 3.4;
  const stabilizer = family === 'mx' ? 1.9 : 1.5;
  const stabilizerX = family === 'mx' ? 5.08 : 5.5;
  pads.push(
    { ...pad('center', '', 0, 0, center, center), plated: false },
    { ...pad('left-stabilizer', '', -stabilizerX, 0, stabilizer, stabilizer), plated: false },
    { ...pad('right-stabilizer', '', stabilizerX, 0, stabilizer, stabilizer), plated: false },
  );
  if (hotswap) {
    const holes = family === 'mx'
      ? [{ x: -2.54, y: -5.08 }, { x: 3.81, y: -2.54 }]
      : [{ x: 0, y: -5.95 }, { x: -5, y: -3.75 }];
    holes.forEach((at, index) => pads.push({ ...pad(`socket-hole-${index}`, '', at.x, at.y, 3, 3), plated: false }));
  }
  assertMountClearance(pads);
  const traces: LocalTrace[] = [];
  const vias: LocalVia[] = [];

  if (reversible && hotswap && includeCopper) {
    const width = numberParam(params, 'traceWidth', 0.25);
    const viaSize = numberParam(params, 'viaSize', 0.8);
    const viaDrill = numberParam(params, 'viaDrill', 0.4);
    if (viaDrill >= viaSize) {
      throw new Error('Via drill must be smaller than via size');
    }
    for (const source of pads.filter((entry) => entry.number)) {
      const at = { x: source.at.x + Math.sign(source.at.x) * 1.8, y: source.at.y };
      traces.push({ id: `route-${source.id}`, start: source.at, end: at, width, padId: source.id, layer: 'front' });
      vias.push({ id: `via-${source.id}`, at, size: viaSize, drill: viaDrill, padId: source.id });
    }
  }

  const courtyard = family === 'choc' && hotswap
    ? [{ x: -10, y: -8 }, { x: 8, y: -8 }, { x: 8, y: 8 }, { x: -10, y: 8 }]
    : BOX(family === 'mx' ? 9 : 8);
  return { pads, courtyard, traces, vias };
};

const diodeGeometry = (): BuiltinGeometry => ({
  pads: [
    { id: 'anode', number: '1', at: { x: -2, y: 0 }, size: { x: 1.2, y: 1.4 }, shape: 'rect' },
    { id: 'cathode', number: '2', at: { x: 2, y: 0 }, size: { x: 1.2, y: 1.4 }, shape: 'rect' },
  ],
  courtyard: [{ x: -3, y: -1.5 }, { x: 3, y: -1.5 }, { x: 3, y: 1.5 }, { x: -3, y: 1.5 }],
  traces: [],
  vias: [],
});

const rgbGeometry = (params: Params): BuiltinGeometry => {
  const spacing = numberParam(params, 'padSpacing', 5.4);
  const width = numberParam(params, 'padSize', 1.1);
  const reversible = boolParam(params, 'reversible', false);
  const includeCopper = boolParam(params, 'includeTracesVias', false);
  const pads = [
    pad('vdd', '1', spacing / 2, 0.7, width),
    pad('dout', '2', spacing / 2, -0.7, width),
    pad('gnd', '3', -spacing / 2, -0.7, width),
    pad('din', '4', -spacing / 2, 0.7, width),
  ];
  const traces: LocalTrace[] = [];
  const vias: LocalVia[] = [];
  if (reversible && includeCopper) {
    const traceWidth = numberParam(params, 'traceWidth', 0.25);
    const viaSize = numberParam(params, 'viaSize', 0.8);
    const viaDrill = numberParam(params, 'viaDrill', 0.4);
    if (viaDrill >= viaSize) {
      throw new Error('Via drill must be smaller than via size');
    }
    for (const source of pads) {
      const at = { x: source.at.x + Math.sign(source.at.x) * 1.8, y: source.at.y };
      traces.push({ id: `route-${source.id}`, start: source.at, end: at, width: traceWidth, padId: source.id, layer: 'front' });
      vias.push({ id: `via-${source.id}`, at, size: viaSize, drill: viaDrill, padId: source.id });
    }
  }
  return { pads, courtyard: BOX(4.5), traces, vias };
};

export function builtinGeometry(source: string, params: Params): BuiltinGeometry | undefined {
  switch (source) {
    case 'builtin:mx-switch': return switchGeometry('mx', false, params);
    case 'builtin:choc-switch': return switchGeometry('choc', false, params);
    case 'builtin:mx-hotswap': return switchGeometry('mx', true, params);
    case 'builtin:choc-hotswap': return switchGeometry('choc', true, params);
    case 'builtin:rgb-led': return rgbGeometry(params);
    case 'builtin:matrix-diode': return diodeGeometry();
    default: return undefined;
  }
}

export function builtinDefinitions(): PartDefinition[] {
  return ([
    ['mx-switch', 'MX switch', 'builtin:mx-switch', 'switch'],
    ['choc-switch', 'Choc switch', 'builtin:choc-switch', 'switch'],
    ['mx-hotswap', 'MX hotswap socket', 'builtin:mx-hotswap', 'connector'],
    ['choc-hotswap', 'Choc hotswap socket', 'builtin:choc-hotswap', 'connector'],
    ['rgb-led', 'RGB LED', 'builtin:rgb-led', 'passive'],
    ['matrix-diode', 'Matrix diode', 'builtin:matrix-diode', 'passive'],
  ] as const).map(([id, name, source, kind]) => {
    const geometry = builtinGeometry(source, {})!;
    return { id, name, kind, ...(kind === 'switch' ? { keycap: { x: 18, y: 18 } } : {}), pads: geometry.pads, courtyard: geometry.courtyard, generator: { source, version: VERSION, parameters: {} } };
  });
}

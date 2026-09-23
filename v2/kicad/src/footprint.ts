import type { Pad, PartDefinition, Vec2 } from '../../contracts/src/index.ts';
import { builtinGeometry } from './builtins.ts';
import type { LocalTrace, LocalVia } from './builtins.ts';

export type FootprintPad = Readonly<Omit<Pad, 'netId'>>;
export type FootprintIR = Readonly<{
  side: 'front' | 'back';
  courtyard: readonly Readonly<Vec2>[];
  pads: readonly FootprintPad[];
  traces: readonly Readonly<LocalTrace>[];
  vias: readonly Readonly<LocalVia>[];
}>;

const cache = new Map<string, FootprintIR>();
const MAX_CACHE_ENTRIES = 256;

const sortedParameters = (parameters: Record<string, number | string | boolean>) =>
  Object.fromEntries(Object.entries(parameters).sort(([left], [right]) => left.localeCompare(right)));

// Placement and net labels are applied after geometry compilation.
export function compileFootprint(definition: PartDefinition, side: 'front' | 'back' = 'front'): FootprintIR {
  const generator = definition.generator;
  if (generator?.source.startsWith('builtin:') && generator.version !== '1') {
    throw new Error(`Unsupported built-in footprint version: ${generator.version}`);
  }
  const generated = generator ? builtinGeometry(generator.source, generator.parameters) : undefined;
  if (generator?.source.startsWith('builtin:') && !generated) {
    throw new Error(`Unknown built-in footprint: ${generator.source}`);
  }
  const geometry = generated ?? { pads: definition.pads, courtyard: definition.courtyard, traces: [], vias: [] };
  const key = JSON.stringify({
    source: generator?.source ?? definition.id,
    version: generator?.version ?? 'authored',
    parameters: sortedParameters(generator?.parameters ?? {}),
    side,
    courtyard: generated ? undefined : geometry.courtyard,
    pads: generated ? undefined : geometry.pads.map(({ netId: _netId, ...pad }) => pad),
  });
  const previous = cache.get(key);
  if (previous) {
    return previous;
  }

  const ir: FootprintIR = Object.freeze({
    side,
    courtyard: Object.freeze(geometry.courtyard.map((point) => Object.freeze({ ...point }))),
    pads: Object.freeze(geometry.pads.map(({ netId: _netId, ...pad }) => Object.freeze({
      ...pad,
      at: Object.freeze({ ...pad.at }),
      size: Object.freeze({ ...pad.size }),
    }))),
    traces: Object.freeze(geometry.traces.map((trace) => Object.freeze({ ...trace, start: Object.freeze({ ...trace.start }), end: Object.freeze({ ...trace.end }) }))),
    vias: Object.freeze(geometry.vias.map((via) => Object.freeze({ ...via, at: Object.freeze({ ...via.at }) }))),
  });
  cache.set(key, ir);
  if (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value!);
  }
  return ir;
}

const escapeXml = (value: string): string => value.replace(/[&<>"']/gu, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]!);

// The SVG and KiCad serializer consume the same normalized coordinates.
export function previewFootprint(ir: FootprintIR): string {
  const points = [...ir.courtyard, ...ir.pads.flatMap((pad) => [
    { x: pad.at.x - pad.size.x / 2, y: pad.at.y - pad.size.y / 2 },
    { x: pad.at.x + pad.size.x / 2, y: pad.at.y + pad.size.y / 2 },
  ]), ...ir.traces.flatMap((trace) => [trace.start, trace.end]), ...ir.vias.flatMap((via) => [
    { x: via.at.x - via.size / 2, y: via.at.y - via.size / 2 },
    { x: via.at.x + via.size / 2, y: via.at.y + via.size / 2 },
  ])];
  const minX = Math.min(0, ...points.map((point) => point.x)) - 1;
  const maxX = Math.max(0, ...points.map((point) => point.x)) + 1;
  const minY = Math.min(0, ...points.map((point) => point.y)) - 1;
  const maxY = Math.max(0, ...points.map((point) => point.y)) + 1;
  const courtyard = ir.courtyard.map((point) => `${point.x},${-point.y}`).join(' ');
  const pads = ir.pads.map((pad) => {
    const x = pad.at.x - pad.size.x / 2;
    const y = -pad.at.y - pad.size.y / 2;
    const radius = pad.shape === 'circle' ? pad.size.x / 2 : pad.shape === 'oval' ? Math.min(pad.size.x, pad.size.y) / 2 : pad.shape === 'roundrect' ? Math.min(pad.size.x, pad.size.y) / 4 : 0;
    return `<rect x="${x}" y="${y}" width="${pad.size.x}" height="${pad.size.y}" rx="${radius}" fill="#bd8e52"/><title>${escapeXml(pad.number)}</title>`;
  }).join('');
  const traces = ir.traces.map((trace) => `<line x1="${trace.start.x}" y1="${-trace.start.y}" x2="${trace.end.x}" y2="${-trace.end.y}" stroke="#bd8e52" stroke-width="${trace.width}"/>`).join('');
  const vias = ir.vias.map((via) => `<circle cx="${via.at.x}" cy="${-via.at.y}" r="${via.size / 2}" fill="none" stroke="#bd8e52" stroke-width="0.2"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${-maxY} ${maxX - minX} ${maxY - minY}" role="img" aria-label="Footprint preview"><polygon points="${courtyard}" fill="none" stroke="#527d76" stroke-width="0.2"/>${traces}${vias}${pads}</svg>`;
}

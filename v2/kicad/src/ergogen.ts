import type { Id, Part, PartDefinition } from '../../contracts/src/index.ts';
import { child, modelAssetId, render, serialize, value } from '@boardstudio/v2-ergogen';
import type { Expression } from '@boardstudio/v2-ergogen';

const children = (node: Expression[], name: string): Expression[][] =>
  node.filter((entry): entry is Expression[] => Array.isArray(entry) && entry[0] === name);

function upgradeArcs(form: Expression[]): void {
  for (const entry of form) {
    if (!Array.isArray(entry)) continue;
    if (entry[0] === 'fp_arc' || entry[0] === 'gr_arc') {
      const center = child(entry, 'start');
      const start = child(entry, 'end');
      const sweep = child(entry, 'angle');
      if (center && start && sweep) {
        const cx = Number(value(center[1]));
        const cy = Number(value(center[2]));
        const dx = Number(value(start[1])) - cx;
        const dy = Number(value(start[2])) - cy;
        const angle = Number(value(sweep[1])) * Math.PI / 180;
        if (![cx, cy, dx, dy, angle].every(Number.isFinite)) throw new Error('Invalid Ergogen arc');
        const point = (portion: number): Expression[] => {
          const rotation = angle * portion;
          const x = cx + dx * Math.cos(rotation) - dy * Math.sin(rotation);
          const y = cy + dx * Math.sin(rotation) + dy * Math.cos(rotation);
          return [portion === 0.5 ? 'mid' : 'end', String(Number(x.toFixed(6))), String(Number(y.toFixed(6)))];
        };
        center[1] = start[1];
        center[2] = start[2];
        entry.splice(entry.indexOf(start), 0, point(0.5));
        start[1] = point(1)[1];
        start[2] = point(1)[2];
        entry.splice(entry.indexOf(sweep), 1);
      }
    }
    upgradeArcs(entry);
  }
}

function modelPaths(form: Expression[], paths: ReadonlyMap<Id, string>): void {
  for (const model of children(form, 'model')) {
    const original = value(model[1]);
    const id = modelAssetId(original);
    const path = (id && paths.get(id)) || paths.get(original);
    if (!path || path.startsWith('/') || path.includes('..') || path.includes('\\') || /^[a-z]+:/iu.test(path)) {
      throw new Error(`Ergogen model has no safe exported path: ${original}`);
    }
    model[1] = `\u0000\${KIPRJMOD}/${path}`;
  }
}

export function exportErgogenForms(
  definition: PartDefinition,
  part: Part | undefined,
  paths: ReadonlyMap<Id, string>,
  netIndex: (name: string) => number = () => 0,
): { footprints: string[]; objects: string[] } {
  const forms = render(definition, { part, netIndex });
  const footprints: string[] = [];
  const objects: string[] = [];
  for (const form of forms) {
    upgradeArcs(form);
    const kind = value(form[0]);
    if (kind === 'footprint' || kind === 'module') {
      modelPaths(form, paths);
      if (kind === 'module') form[0] = 'footprint';
      footprints.push(serialize(form));
    } else if (['segment', 'via', 'zone', 'gr_text', 'gr_line', 'gr_arc', 'gr_circle', 'gr_poly', 'gr_rect'].includes(kind)) {
      if (!part) throw new Error(`Ergogen ${kind} requires a placed part`);
      objects.push(serialize(form));
    } else {
      throw new Error(`Unsupported Ergogen output form: ${kind}`);
    }
  }
  return { footprints, objects };
}

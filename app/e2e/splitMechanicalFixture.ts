import { demoProject } from '../src/demo';
import { createMechanicalConfiguration } from '../src/mechanicalPresets';
import type { ProjectDoc } from '@boardstudio/v2-contracts';

export function splitFixture(): ProjectDoc {
  const doc = demoProject();
  doc.id = 'split-test'; doc.name = 'Split generation fixture';
  doc.parts = []; doc.matrices = []; doc.layouts = []; doc.nets = []; doc.outline = []; doc.caseBodies = [];
  doc.definitions = doc.definitions.map(definition => ({ ...definition, model: undefined, models: [] }));
  for (const [half, mirrored] of [['left', false], ['right', true]] as const) {
    const ids: string[] = [];
    for (let row = 0; row < 5; row++) for (let column = 0; column < 7; column++) {
      const x = 15 + column * 19, y = 15 + row * 19;
      for (const [suffix, definitionId, dy] of [['switch', 'mx-hotswap', 0], ['diode', 'matrix-diode', 6]] as const) {
        if (mirrored && suffix === 'diode') continue;
        const id = `${half}-${row}-${column}-${suffix}`; ids.push(id);
        doc.parts.push({ id, definitionId, reference: id, side: suffix === 'switch' ? 'back' : 'front', pose: { at: { x: mirrored ? 305 - x : x, y: y + dy }, rotation: 0 } });
      }
    }
    doc.layouts.push({ id: half, name: `${half} half`, boardId: 'main-board', matrixId: half, partIds: ids.filter(id => id.endsWith('-diode')), ...(mirrored ? { mirrorLink: { sourceId: 'left', axisX: 152.5 } } : {}) });
    doc.matrices.push({ id: half, boardId: 'main-board', rows: 5, columns: 7, pitch: { x: 19, y: 19 }, origin: { x: mirrored ? 290 : 15, y: 15 }, definitionId: 'mx-hotswap', partIds: ids.filter(id => id.endsWith('-switch')), mirror: mirrored ? 'x' : 'none' });
    const x = mirrored ? 160 : 0;
    doc.outline.push({ id: `${half}-outline`, kind: 'polygon', operation: 'add', points: [{ x, y: 0 }, { x: x + 145, y: 0 }, { x: x + 145, y: 105 }, { x, y: 105 }] });
  }
  doc.boards[0].partIds = doc.parts.map(part => part.id);
  doc.boards[0].outlineIds = doc.outline.map(outline => outline.id);
  doc.boards[0].netIds = [];
  doc.mechanical = createMechanicalConfiguration(doc, 'main-board');
  return doc;
}


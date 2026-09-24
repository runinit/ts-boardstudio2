import { expect, test } from 'vitest';
import type { Part, PartDefinition } from '../../../contracts/src/index';
import { alignmentDelta, snapPart } from './placementGeometry';
const definition: PartDefinition = { id: 'switch', name: 'Switch', kind: 'switch', pads: [], keycap: { x: 18, y: 18 }, courtyard: [] };
const definitions = new Map([[definition.id, definition]]);
const part = (id: string, x: number, rotation = 0): Part => ({ id, reference: id, definitionId: 'switch', pose: { at: { x, y: 0 }, rotation }, side: 'front' });
test('19 mm pitch with an 18 mm key envelope snaps to a 1 mm gap', () => {
  const snap = snapPart(part('moving', 19.6), [part('fixed', 0)], definitions, 1, 1);
  expect(snap?.at.x).toBe(19);
  expect(snap?.label).toContain('gap 1.00 mm');
});
test('does not interpret rotated bounding boxes as physical edges for gap snapping', () => {
  const snap = snapPart(part('moving', 23.3279, 30), [part('fixed', 0)], definitions, .5, 1);
  expect(snap?.label ?? '').not.toContain('gap');
});
test('aligns unequal-sized bounds to a fixed reference', () => {
  expect(alignmentDelta([{ x: 10, y: 3 }, { x: 20, y: 8 }], [{ x: -4, y: -2 }, { x: 4, y: 2 }], 'x', 'center')).toEqual({ x: -15, y: 0 });
});

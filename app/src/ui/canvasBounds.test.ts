import { expect, test } from 'vitest';
import { getBounds } from './canvasBounds';
import type { Part } from '../../../contracts/src/index';

test('a distant object does not include the empty origin in fit bounds', () => {
 const part = { id: 'p', pose: { at: { x: 400, y: 300 }, rotation: 0 } } as Part;
 const bounds = getBounds(new Map(), [part], [], [], new Map());
 expect((bounds.minX + bounds.maxX) / 2).toBe(400);
 expect((bounds.minY + bounds.maxY) / 2).toBe(300);
});

test('bounds include rotated keycap dimensions and have finite empty defaults', () => {
 const part = { id: 'p', definitionId: 'd', pose: { at: { x: 0, y: 0 }, rotation: 90 }, keycap: { x: 40, y: 20 } } as Part;
 const definition = { id: 'd', name: 'Switch', kind: 'switch', courtyard: [], pads: [] } as import('../../../contracts/src/index').PartDefinition;
 const bounds = getBounds(new Map(), [part], [], [], new Map(), new Map([['d', definition]]));
 expect(bounds.width).toBeCloseTo(44);
 expect(bounds.height).toBeCloseTo(64);
 expect(getBounds(new Map(), [], [], [], new Map()).width).toBeGreaterThan(0);
});

test('fit preserves aspect ratio and leaves controls clear of selected geometry', async () => {
 const { aspectBounds, fitCamera, cameraBounds } = await import('./canvasBounds');
 const base = aspectBounds(getBounds(new Map(), [], [], [], new Map()), 390, 744);
 const target = { minX: 200, maxX: 250, minY: 100, maxY: 180, width: 50, height: 80 };
 const fit = fitCamera(base, target, 390, 744, 90, 180);
 const view = cameraBounds(base, fit.zoom, fit.pan);
 expect(view.width / view.height).toBeCloseTo(390 / 744);
 expect((view.maxY - target.maxY) / view.height * 744).toBeGreaterThanOrEqual(89.99);
 expect((target.minY - view.minY) / view.height * 744).toBeGreaterThanOrEqual(179.99);
});

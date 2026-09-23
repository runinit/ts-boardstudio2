import { expect, it } from 'vitest';
import type { Contour } from '@boardstudio/v2-contracts';
import { outlineDxf, outlineSvg } from './outlineExport';

const contours: Contour[] = [
  { hole: false, points: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 10 }, { x: 0, y: 10 }] },
  { hole: true, points: [{ x: 5, y: 2 }, { x: 5, y: 8 }, { x: 15, y: 8 }, { x: 15, y: 2 }] },
];

it('exports both outer and hole paths from the same contour set', () => {
  expect(outlineSvg(contours)).toContain('viewBox="0 -10 20 10"');
  expect(outlineSvg(contours)).toContain('M 5 -2');
  expect(outlineDxf(contours)).toContain('8\nHOLE\n90\n4');
});

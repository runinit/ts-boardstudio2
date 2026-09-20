import { expect, it } from 'vitest';
import type { FootprintInfo } from '../types/footprint';
import {
  drillOutline,
  padContours,
  padHasCopper,
  padShapeGeometry,
} from './footprintPadGeometry';
const pad: FootprintInfo['pads'][number] = {
  index: 0,
  number: '1',
  type: 'thru_hole',
  shape: 'rect',
  at: [0, 0],
  size: [4, 4],
  layers: ['*.Cu'],
  mechanical: false,
  drillSize: [2, 2],
};
it('leaves the drilled area out of the actual triangulated copper', () => {
  // Given: a square plated pad around a round drill.
  // When: building the actual Three.js mesh used by the preview.
  const geometry = padShapeGeometry(pad);
  const vertices = geometry.getAttribute('position');
  const indices = geometry.index;
  let area = 0;
  for (let i = 0; indices && i < indices.count; i += 3) {
    const [a, b, c] = [
      indices.getX(i),
      indices.getX(i + 1),
      indices.getX(i + 2),
    ].map((index) => [vertices.getX(index), vertices.getY(index)]);
    area +=
      Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) /
      2;
  }
  // Then: the triangulation subtracts the drill instead of drawing a solid pad.
  expect(area).toBeCloseTo(16 - 32 * Math.sin(Math.PI / 32), 5);
  geometry.dispose();
});
it('keeps an offset oval drill and the chosen copper layer distinct', () => {
  // Given: an offset slot and an NPTH hole carrying KiCad wildcard layers.
  // When: preparing the slot contour and choosing front copper.
  const hole = drillOutline({
    ...pad,
    drillSize: [3, 1],
    drillOffset: [0.2, -0.3],
  });
  // Then: the capsule has the requested extents and NPTH is never copper.
  expect(Math.max(...hole.map((point) => point[0]))).toBeCloseTo(1.7);
  expect(Math.min(...hole.map((point) => point[1]))).toBeCloseTo(-0.8);
  expect(padHasCopper({ ...pad, type: 'np_thru_hole' }, 'F')).toBe(false);
  expect(padHasCopper({ ...pad, type: 'smd', layers: ['B.Cu'] }, 'F')).toBe(
    false
  );
  expect(padHasCopper(pad, 'B')).toBe(true);
});
it('retains custom polygon outlines, stroke width and an independent anchor', () => {
  // Given: a stroked custom pad whose anchor lies outside its polygon.
  const custom = {
    ...pad,
    type: 'smd',
    shape: 'custom',
    size: [0.2, 0.2],
    drillSize: undefined,
    anchor: 'rect' as const,
    polygons: [
      [
        [2, 0],
        [3, 0],
        [3, 1],
      ],
    ],
    polygonWidths: [0.2],
  };
  // When: collecting its filled copper contours.
  const contours = padContours(custom);
  // Then: polygon, anchor and the three rounded edge strokes all survive.
  expect(contours).toHaveLength(5);
  expect(Math.min(...contours.flat().map((point) => point[0]))).toBeCloseTo(
    -0.1
  );
  expect(Math.max(...contours.flat().map((point) => point[0]))).toBeCloseTo(
    3.1
  );
  expect(padContours({ ...custom, unsupportedGeometry: ['gr_curve'] })).toEqual(
    []
  );
});

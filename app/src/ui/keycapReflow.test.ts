import { describe, expect, it } from 'vitest';
import { findKeycapOverlaps, keycapReflowDeltas, type KeycapPlacement, type KeycapResize } from './keycapReflow';

const key = (column: number, atX = column * 19.05, atY = 0): KeycapPlacement => ({
  id: `key-${column}`,
  reference: `SW${column + 1}`,
  matrixId: 'matrix-a',
  row: 0,
  column,
  at: { x: atX, y: atY },
  rotation: 0,
  size: { x: 18.05, y: 18.05 },
});

const resize = (placement: KeycapPlacement, width: number, height = placement.size.y): KeycapResize => ({
  ...placement,
  nextSize: { x: width, y: height },
  axisX: { x: 1, y: 0 },
  axisY: { x: 0, y: 1 },
});

describe('keycap reflow', () => {
  it('moves row neighbors outward on growth and inward on shrink', () => {
    const placements = Array.from({ length: 5 }, (_, column) => key(column));
    const grow = keycapReflowDeltas([resize(placements[2], 37.1)], placements);
    expect(grow.get(placements[1].id)?.x).toBeCloseTo(-9.525);
    expect(grow.get(placements[3].id)?.x).toBeCloseTo(9.525);
    expect(grow.get(placements[4].id)?.x).toBeCloseTo(9.525);
    expect(grow.has(placements[2].id)).toBe(false);

    const shrink = keycapReflowDeltas([resize(placements[2], 9)], placements);
    expect(shrink.get(placements[1].id)?.x).toBeCloseTo(4.525);
    expect(shrink.get(placements[3].id)?.x).toBeCloseTo(-4.525);
  });

  it('reflows selected keys around their unchanged group center', () => {
    const placements = [key(0), key(1), key(2), key(3)];
    const deltas = keycapReflowDeltas([
      resize(placements[1], 28.05),
      resize(placements[2], 28.05),
    ], placements);

    expect((deltas.get(placements[1].id)?.x ?? 0) + (deltas.get(placements[2].id)?.x ?? 0)).toBeCloseTo(0);
    expect(deltas.get(placements[0].id)?.x).toBeCloseTo(-10);
    expect(deltas.get(placements[3].id)?.x).toBeCloseTo(10);
  });

  it('reflows column neighbors using the matrix row direction', () => {
    const upper = { ...key(1, 19.05, 0), id: 'upper', row: 0 };
    const resized = { ...key(1, 19.05, 19.05), id: 'resized', row: 1 };
    const lower = { ...key(1, 19.05, 38.1), id: 'lower', row: 2 };
    const deltas = keycapReflowDeltas([resize(resized, resized.size.x, 37.1)], [upper, resized, lower]);

    expect(deltas.get(upper.id)?.y).toBeCloseTo(-9.525);
    expect(deltas.get(lower.id)?.y).toBeCloseTo(9.525);
  });
});

describe('keycap overlaps', () => {
  it('reports rotated overlaps and ignores keycaps that only touch', () => {
    const first = { ...key(0), size: { x: 10, y: 2 }, rotation: 45 };
    const touching = { ...key(1, 10 * Math.SQRT1_2, 10 * Math.SQRT1_2), size: { x: 10, y: 2 }, rotation: 45 };
    const overlapping = { ...key(2, 0, 2), size: { x: 10, y: 2 }, rotation: 45 };

    expect(findKeycapOverlaps([first, touching])).toEqual([]);
    expect(findKeycapOverlaps([first, overlapping])).toHaveLength(1);
  });
});

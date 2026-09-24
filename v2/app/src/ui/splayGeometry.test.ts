import { expect, test } from 'vitest';
import { demoProject } from '../demo';
import { matrixPosition, splayOriginWorld, withSplayOrigin, withSplayAngle } from './matrixGeometry';

test('moving a splay origin preserves every key position through mirror and rotation', () => {
  const matrix = { ...demoProject().matrices[0], rotation: 31, columnSplays: [9, 17, -4] };
  const origin = { x: 37, y: -43 };
  const next = withSplayOrigin(matrix, 1, origin);
  expect(splayOriginWorld(next, 1).x).toBeCloseTo(origin.x, 8);
  expect(splayOriginWorld(next, 1).y).toBeCloseTo(origin.y, 8);
  for (let row = 0; row < matrix.rows; row++) for (let col = 0; col < matrix.columns; col++) {
    const before = matrixPosition(matrix, row, col);
    const after = matrixPosition(next, row, col);
    expect(after.x).toBeCloseTo(before.x, 8);
    expect(after.y).toBeCloseTo(before.y, 8);
  }
});

test('splaying only this column leaves every other column fixed', () => {
  const matrix = { ...demoProject().matrices[0], rotation: 21, columnSplays: [12, 8] };
  const next = withSplayAngle(matrix, 1, 29, 'column');
  for (let col = 0; col < matrix.columns; col++) {
    const before = matrixPosition(matrix, 1, col);
    const after = matrixPosition(next, 1, col);
    if (col === 1) expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(1);
    else { expect(after.x).toBeCloseTo(before.x, 8); expect(after.y).toBeCloseTo(before.y, 8); }
  }
});

test('a custom origin is the stationary point during a subsequent splay', () => {
  const matrix = { ...demoProject().matrices[0], mirror: 'none' as const, rotation: 0, origin: { x: 0, y: 0 }, columnStaggers: [], columnSplays: [] };
  const next = withSplayAngle(withSplayOrigin(matrix, 1, { x: 0, y: -20 }), 1, 90, 'following');
  const before = matrixPosition(matrix, 0, 1);
  const after = matrixPosition(next, 0, 1);
  expect(after.x).toBeCloseTo(-before.y - 20);
  expect(after.y).toBeCloseTo(before.x - 20);
});

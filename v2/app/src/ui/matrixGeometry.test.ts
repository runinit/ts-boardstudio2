import { expect, test } from 'vitest';
import { matrixSceneAdapter } from './matrixGeometry';

test('indexes Rust matrix scene cells and column bases', () => {
  const pose = { at: { x: 12, y: -4 }, rotation: 17 };
  const adapter = matrixSceneAdapter({ matrixId: 'm', cells: [{ row: 1, column: 2, enabled: false, pose }], columns: [{ column: 2, axisX: { x: 0, y: 1 }, axisY: { x: -1, y: 0 } }] });
  expect(adapter.pose(1, 2)).toEqual(pose);
  expect(adapter.member(1, 2)).toBeUndefined();
  expect(adapter.basis(2)?.axisY).toEqual({ x: -1, y: 0 });
  expect(adapter.pose(0, 0)).toBeUndefined();
});

test('keeps member identities and disabled cell poses from Rust', () => {
  const adapter = matrixSceneAdapter({ matrixId: 'm', cells: [{ row: 0, column: 0, enabled: true, memberId: 'legacy-key', pose: { at: { x: 1, y: 2 }, rotation: 0 } }, { row: 0, column: 1, enabled: false, pose: { at: { x: 20, y: 2 }, rotation: 5 } }], columns: [] });
  expect(adapter.member(0, 0)).toBe('legacy-key');
  expect(adapter.pose(0, 1)?.at).toEqual({ x: 20, y: 2 });
});

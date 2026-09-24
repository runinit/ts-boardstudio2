import { expect, test } from 'vitest';
import { demoProject } from '../demo';
import { cellPose, matrixMembers, matrixPosition } from './matrixGeometry';
import type { Matrix, Part } from '../../../contracts/src/index';

test('starter metadata and every member agree without changing saved positions', () => {
  const doc = demoProject();
  const matrix = doc.matrices[0];
  const members = matrixMembers(matrix);
  const parts = new Map(doc.parts.map((part) => [part.id, part]));
  for (let row = 0; row < matrix.rows; row++) for (let column = 0; column < matrix.columns; column++) {
    const part = parts.get(members.get(`${row}:${column}`)!)!;
    expect(matrixPosition(matrix, row, column)).toEqual(part.pose.at);
    expect(cellPose(matrix, row, column, undefined, members, parts)).toEqual(part.pose);
  }
});

test('old projects resolve overlays against member poses rather than inconsistent metadata', () => {
  const doc = demoProject();
  delete doc.matrices[0].mirror;
  const before = JSON.stringify(doc);
  const matrix = doc.matrices[0];
  const members = matrixMembers(matrix);
  const parts = new Map(doc.parts.map((part) => [part.id, part]));
  expect(cellPose(matrix, 2, 4, undefined, members, parts)).toEqual(doc.parts[14].pose);
  expect(JSON.stringify(doc)).toBe(before);
});

test('transformed sparse matrices align moved members and disabled slots', () => {
  const matrix: Matrix = { id: 'm', rows: 2, columns: 2, definitionId: 'switch', pitch: { x: 19, y: 19 }, origin: { x: 5, y: -8 }, rotation: 35, mirror: 'x', rowOffsets: [{ x: 0, y: 0 }, { x: 3, y: -2 }], columnOffsets: [{ x: 0, y: 4 }], cells: [{ row: 1, column: 1, enabled: false, offset: { x: 2, y: 1 }, rotation: 7 }], partIds: ['matrix/m/r0c0', 'matrix/m/r0c1', 'matrix/m/r1c0'] };
  const members = matrixMembers(matrix);
  const parts = new Map<string, Part>();
  for (const [key, id] of members) {
    const [row, column] = key.split(':').map(Number);
    parts.set(id, { id, definitionId: 'switch', reference: id, side: 'front', pose: { at: matrixPosition(matrix, row, column), rotation: 35 } });
  }
  const disabled = matrix.cells![0];
  expect(cellPose(matrix, 1, 1, disabled, members, parts)).toEqual({ at: matrixPosition(matrix, 1, 1, disabled), rotation: 42 });
  parts.get('matrix/m/r0c0')!.pose = { at: { x: 28, y: 17 }, rotation: 83 };
  expect(cellPose(matrix, 0, 0, undefined, members, parts)).toEqual(parts.get('matrix/m/r0c0')!.pose);
});

test('mixed legacy and generated members retain row-major identity after resizing', () => {
  const matrix = demoProject().matrices[0];
  matrix.columns = 6;
  matrix.partIds = ['switch-0-0', 'switch-0-1', 'switch-0-2', 'switch-0-3', 'switch-0-4', 'matrix/matrix/r0c5', ...matrix.partIds.slice(5, 10), 'matrix/matrix/r1c5', ...matrix.partIds.slice(10), 'matrix/matrix/r2c5'];
  expect(matrixMembers(matrix).get('1:0')).toBe('switch-1-0');
  expect(matrixMembers(matrix).get('2:5')).toBe('matrix/matrix/r2c5');
});

test('disabled rows in old negative-Y projects interpolate the saved member frame', () => {
  const doc = demoProject();
  const matrix = doc.matrices[0];
  delete matrix.mirror;
  matrix.cells = Array.from({ length: 5 }, (_, column) => ({ row: 1, column, enabled: false }));
  matrix.partIds = matrix.partIds.filter((id) => !id.startsWith('switch-1-'));
  const parts = new Map(doc.parts.filter((part) => matrix.partIds.includes(part.id)).map((part) => [part.id, part]));
  expect(cellPose(matrix, 1, 2, matrix.cells[2], matrixMembers(matrix), parts).at).toEqual({ x: 38.1, y: -19.05 });
});

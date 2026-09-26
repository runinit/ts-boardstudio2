import { expect, it } from 'vitest';
import { demoProject } from '../demo';
import { resizeMatrix } from './matrixResize';

it('extends preset assemblies without copying a key’s local edits or changing existing cells', () => {
  const base = demoProject().matrices[0];
  const matrix = { ...base, rows: 1, columns: 1, definitionId: 'snapshot/switch', diodes: false, cells: [{ row: 0, column: 0, enabled: false, definitionId: 'snapshot/switch', variant: 'preset/mx-rgb/north', rotation: 195, offset: { x: 2, y: 3 }, diode: false, assembliesLocal: true, assemblies: [{ id: 'led', definitionId: 'snapshot/led', offset: { x: 0, y: -4.75 }, side: 'back' as const }] }] };
  const next = resizeMatrix(matrix, 2, 2);
  expect(next.cells![0]).toEqual(matrix.cells[0]);
  expect(next.cells![3]).toMatchObject({ row: 1, column: 1, enabled: true, definitionId: 'snapshot/switch', rotation: 180, assemblies: matrix.cells[0].assemblies });
  expect(next.cells![3].offset).toBeUndefined();
  expect(next.cells![3].assemblies).not.toBe(matrix.cells[0].assemblies);
  expect(matrix.cells).toHaveLength(1);
  expect(resizeMatrix(next, 1, 1).cells).toEqual(matrix.cells);
});

it('keeps legacy and custom sparse matrices on their existing default behavior', () => {
  const matrix = { ...demoProject().matrices[0], rows: 1, columns: 1, cells: [{ row: 0, column: 0, enabled: false }] };
  expect(resizeMatrix(matrix, 2, 2).cells).toEqual(matrix.cells);
});

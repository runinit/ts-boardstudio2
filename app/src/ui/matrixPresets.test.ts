import { expect, it } from 'vitest';
import { demoProject } from '../demo';
import { matrixPresetDefinitions, type MatrixPresetId } from './assemblyCatalog';
import { matrixWithPreset } from './matrixPresets';

const cases = (Object.keys(matrixPresetDefinitions) as MatrixPresetId[]).flatMap(id =>
  (['south', 'north'] as const).map(orientation => ({ id, orientation })));

it.each(cases)('$id $orientation preserves layout identity and is idempotent', ({ id, orientation }) => {
  const original = demoProject().matrices[0];
  const matrix = { ...original, cells: [{ row: 0, column: 0, enabled: false, rotation: 23, offset: { x: 2, y: 3 } }] };
  expect(Object.keys(matrixPresetDefinitions)).toHaveLength(8);
  const first = matrixWithPreset(matrix, id, orientation);
  expect(matrixWithPreset(first.matrix, id, orientation)).toEqual(first);
  const restored = matrixWithPreset(first.matrix, id, 'south');
  expect(restored.matrix).toMatchObject({ id: original.id, partIds: original.partIds });
  expect(restored.matrix.cells[0]).toMatchObject({ enabled: false, rotation: 23, offset: { x: 2, y: 3 } });
  expect(first.definitions[0].generator?.source).toBe(matrixPresetDefinitions[id].definitionId.slice('ergogen:'.length));
  expect(first.matrix.cells[0].assemblies).toHaveLength(matrixPresetDefinitions[id].led ? 2 : 1);
});

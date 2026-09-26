import type { MatrixPresetId } from './assemblyCatalog';
import type { Matrix } from '@boardstudio/v2-contracts';
import { catalogue as ergogenCatalogue } from '@boardstudio/v2-ergogen';
import { assemblyPreset, type SwitchOrientation } from './assemblyPresets';
import { matrixWithAssembly } from './assemblyPlacement';

export const matrixWithPreset = (matrix: Matrix, presetId: MatrixPresetId, orientation: SwitchOrientation = 'south') => {
  const definitions = ergogenCatalogue();
  const assembly = assemblyPreset(presetId, definitions, orientation);
  assembly.id = `preset-${presetId}-${orientation}`;
  const prepared = { ...matrix, cells: matrix.cells?.map(cell => ({ ...cell,
    rotation: (cell.rotation ?? 0) - (cell.variant?.startsWith('preset/') && cell.variant.endsWith('/north') ? 180 : 0),
  })) };
  const result = matrixWithAssembly(prepared, assembly, definitions, 0);
  return { ...result, matrix: { ...result.matrix, cells: result.matrix.cells.map(cell => ({ ...cell, variant: `preset/${presetId}/${orientation}` })) } };
};



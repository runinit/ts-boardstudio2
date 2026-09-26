import { expect, it } from 'vitest';
import { catalogue } from '@boardstudio/v2-ergogen';
import type { CompiledFootprint, PartDefinition } from '@boardstudio/v2-contracts';
import { libraryPreviewFor, libraryPreviewsToCompile } from './libraryPreview';

it('compiles authored and imported parts without substituting a catalog fallback', () => {
  const definition: PartDefinition = { id: 'custom', name: 'Custom', kind: 'custom', pads: [], courtyard: [] };
  expect(libraryPreviewsToCompile([definition, definition])).toEqual([definition]);
  expect(libraryPreviewFor(definition, [])).toBeUndefined();
  const compiled: CompiledFootprint = { definition, geometry: { side: 'front', pads: [], courtyard: [], traces: [], vias: [] }, diagnostics: [], previewSvg: null };
  expect(libraryPreviewFor(definition, [compiled])).toBe(compiled);
  expect(libraryPreviewsToCompile([{ ...definition, kicadSource: {formatVersion: 1, source: '(footprint Custom)'} }])).toHaveLength(1);
});

it('uses the active generator pipeline for canonical library parts', () => {
  expect(libraryPreviewsToCompile(catalogue())).toEqual([]);
});

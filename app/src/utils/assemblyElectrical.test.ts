import { expect, it } from 'vitest';
import { inheritedBinding } from './assemblyElectrical';
import type { StudioDoc } from './studioSource';

it('keeps inherited rotation when an instance overrides only footprint translation', () => {
  const data: StudioDoc = {
    schema: 'ergogen/v1',
    layout: {},
    parts: {
      key: {
        footprints: {
          switch: {
            what: 'mx',
            placement: { at: [0, 0, 0], rotate: 25 },
            params: { from: 'COL', to: 'ROW' },
          },
        },
      },
    },
  };
  const binding = inheritedBinding(
    data,
    { part: 'key', footprints: { switch: { placement: { at: [2, 3, 0] } } } },
    'switch'
  );
  expect(binding.placement).toEqual({ at: [2, 3, 0], rotate: 25 });
});

it('keeps inherited electrical bindings with an instance reference shortcut', () => {
  const data: StudioDoc = {
    schema: 'ergogen/v1',
    layout: {},
    parts: {
      key: {
        footprints: {
          switch: {
            what: 'mx',
            reference: 'BASE',
            params: { from: '{{column_net}}', to: '{{row_net}}' },
          },
        },
      },
    },
  };
  const binding = inheritedBinding(
    data,
    { part: 'key', footprints: { switch: 'SW99' } },
    'switch'
  );
  expect(binding).toMatchObject({
    reference: 'SW99',
    params: { from: '{{column_net}}', to: '{{row_net}}' },
  });
});

it('retains declared matrix nets on a non-key component', async () => {
  const { effectiveElectrical, matrixElectrical } =
    await import('./assemblyElectrical');
  const objects = effectiveElectrical(
    'schema: ergogen/v1\nlayout:\n  objects:\n    component:\n      kind: component\n      properties: {column_net: AUX_COL, row_net: AUX_ROW}\n'
  );
  expect(Array.from(matrixElectrical(objects).nets)).toEqual([
    'AUX_COL',
    'AUX_ROW',
  ]);
});

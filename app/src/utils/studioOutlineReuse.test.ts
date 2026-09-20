import { prepareOutlines } from './studioOutline';
import { createMatrix, getValue, readStudio, setValue } from './studioSource';

const matrix = () =>
  createMatrix(
    '# retained outline comment\nschema: ergogen/v1\nlayout: {objects: {}}\n',
    2,
    2
  );

it('reuses managed region identities across repeated automatic rebuilds', () => {
  // Given: the first rebuild records Studio ownership references.
  const initial = prepareOutlines(matrix());
  const ids = Object.keys(readStudio(initial).designs?.regions || {});

  // When: subsequent layout edits repeatedly prepare the same managed outline.
  let result = initial;
  for (let index = 0; index < 5; index++) result = prepareOutlines(result);

  // Then: ownership records do not turn the managed region into a shared recipe.
  expect(Object.keys(readStudio(result).designs?.regions || {})).toEqual(ids);
  expect(
    getValue(result, ['meta', 'studio', 'outline', 'managed', 'main'])
  ).toEqual(
    getValue(initial, ['meta', 'studio', 'outline', 'managed', 'main'])
  );
  expect(result.startsWith('# retained outline comment\n')).toBe(true);
});

it.each(['shared', 'custom'] as const)(
  'preserves %s regions while subsequent managed rebuilds remain bounded',
  (kind) => {
    // Given: a formerly automatic region gains a real consumer or authored selector.
    const initial = prepareOutlines(matrix());
    const id = Object.keys(readStudio(initial).designs?.regions || {})[0];
    const source =
      kind === 'shared'
        ? setValue(initial, ['designs', 'profiles', 'other'], {
            from: `regions.${id}`,
          })
        : setValue(
            initial,
            ['designs', 'regions', id, 'select', 'cluster'],
            'fingers'
          );
    const preserved = getValue(source, ['designs', 'regions', id]);

    // When: a replacement automatic recipe is created and then rebuilt again.
    const first = prepareOutlines(source);
    const result = prepareOutlines(first);

    // Then: real shared/authored recipes retain their identity; the new automatic one is reused.
    expect(getValue(result, ['designs', 'regions', id])).toEqual(preserved);
    expect(Object.keys(readStudio(result).designs?.regions || {})).toEqual(
      Object.keys(readStudio(first).designs?.regions || {})
    );
    if (kind === 'shared')
      expect(getValue(result, ['designs', 'profiles', 'other', 'from'])).toBe(
        `regions.${id}`
      );
  }
);

it('retains a region referenced by another board ownership record', () => {
  // Given: another ownership record still names the current region.
  const initial = prepareOutlines(matrix());
  const id = Object.keys(readStudio(initial).designs?.regions || {})[0];
  const source = setValue(
    initial,
    ['meta', 'studio', 'outline', 'managed', 'other'],
    [`regions.${id}`]
  );

  // When: only the main outline is rebuilt.
  const result = prepareOutlines(source);

  // Then: the exemption is limited to the rebuilt board's own ownership record.
  expect(getValue(result, ['designs', 'regions', id])).toEqual(
    getValue(source, ['designs', 'regions', id])
  );
  expect(
    getValue(result, ['designs', 'boundaries', 'main_edge', 'from'])
  ).not.toContain(`regions.${id}`);
});

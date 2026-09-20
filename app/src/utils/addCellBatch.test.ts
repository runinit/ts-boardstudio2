import {
  addCell,
  addCluster,
  addObject,
  readStudio,
  removeObject,
  setValue,
} from './studioSource';
import { applyKeyDefaults } from './keyOptions';
import { compileSetup, defaultSetup } from './designSetup';

const parsing = vi.hoisted(() => ({ calls: 0 }));
vi.mock('yaml', async (importOriginal) => {
  const actual = await importOriginal<typeof import('yaml')>();
  return {
    ...actual,
    parseDocument: (...args: Parameters<typeof actual.parseDocument>) => {
      parsing.calls++;
      return actual.parseDocument(...args);
    },
  };
});

it.each(['native', 'legacy'] as const)(
  'fills only the requested %s cell with its exact defaults and free identity',
  (kind) => {
    // Given: two holes, a conflicting name, and explicit column defaults.
    let source =
      kind === 'native'
        ? compileSetup({ ...defaultSetup(), columns: 2, rows: 2 })
        : addCluster(
            '# preserved cell comment\nschema: ergogen/v1\nlayout: {objects: {}}\n',
            'fingers',
            'columns',
            { columns: 2, rows: 2 }
          );
    source = removeObject(
      removeObject(source, 'objects', 'fingers_c1_r1'),
      'objects',
      'fingers_c2_r2'
    );
    source = setValue(source, ['layout', 'objects', 'fingers_c2_r2'], {
      kind: 'anchor',
      label: 'reserved identity',
    });
    source = setValue(source, ['meta', 'studio', 'columns', 'fingers', 'c2'], {
      size: [23, 19],
      diodeAt: [2, -6, 0],
      led: true,
    });
    const original = readStudio(source);
    let reference = addObject(
      source,
      'fingers_c2_r2_2',
      'key',
      undefined,
      'defer'
    );
    reference = setValue(
      reference,
      ['layout', 'objects', 'fingers_c2_r2_2', 'cluster'],
      'fingers'
    );
    reference = setValue(
      reference,
      ['layout', 'objects', 'fingers_c2_r2_2', 'cell'],
      ['c2', 'r2']
    );
    const expected = readStudio(applyKeyDefaults(reference, 'fingers_c2_r2_2'));
    parsing.calls = 0;

    // When: the selected empty cell is inserted.
    const result = addCell(source, 'fingers', 'c2', 'r2');
    const parseCount = parsing.calls;
    const actual = readStudio(result);

    // Then: full ownership/options/net output matches the prior public composition.
    expect(actual).toEqual(expected);
    expect(readStudio(source)).toEqual(original);
    expect(actual.layout.objects?.fingers_c1_r1).toBeUndefined();
    expect(actual.layout.objects?.fingers_c2_r2_2).toMatchObject({
      kind: 'key',
      cell: ['c2', 'r2'],
      envelopes: { keycap: { size: [23, 19] } },
    });
    if (kind === 'legacy')
      expect(result.startsWith('# preserved cell comment\n')).toBe(true);
    expect(parseCount).toBeLessThanOrEqual(kind === 'native' ? 7 : 3);
  }
);

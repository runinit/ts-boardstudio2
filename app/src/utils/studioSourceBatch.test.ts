import { ResizeReview } from './resizeReview';
import { compileSetup, defaultSetup } from './designSetup';
import {
  addCluster,
  addObject,
  readStudio,
  resizeCluster,
  setValue,
} from './studioSource';

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

it('adds a row with native electronics without reparsing for every default field', () => {
  // Given: a generated board whose existing key and project comment must survive.
  const source =
    '# authored project comment\n' +
    compileSetup({
      ...defaultSetup(),
      columns: 3,
      rows: 2,
    });
  const original = readStudio(source).layout.objects?.fingers_c1_r1;
  parsing.calls = 0;

  // When: one row creates three keys and their owned diodes.
  const result = resizeCluster(source, 'fingers', { rows: ['r1', 'r2', 'r3'] });
  const parseCount = parsing.calls;
  const objects = readStudio(result).layout.objects || {};

  // Then: authored state, identities, matrix nets and ownership are preserved.
  expect(result.startsWith('# authored project comment\n')).toBe(true);
  expect(objects.fingers_c1_r1).toEqual(original);
  expect(
    Object.values(objects).filter((item) => item.kind === 'key')
  ).toHaveLength(9);
  expect(objects.fingers_c3_r3).toMatchObject({
    kind: 'key',
    cluster: 'fingers',
    cell: ['c3', 'r3'],
    properties: { column_net: 'C3', row_net: 'R3' },
  });
  expect(objects.fingers_c3_r3_diode).toMatchObject({
    properties: { owner: 'fingers_c3_r3', role: 'diode' },
  });
  expect(parseCount).toBeLessThanOrEqual(10);
});

it('reserves owned component identities before adding another named cell', () => {
  // Given: authored row names may overlap a generated diode suffix.
  const source = compileSetup({ ...defaultSetup(), columns: 1, rows: 1 });

  // When: both rows are added in one resize.
  const result = resizeCluster(source, 'fingers', {
    rows: ['r1', 'r2', 'r2_diode'],
  });

  // Then: the second key receives the same collision-free identity as a sequential addition.
  const objects = readStudio(result).layout.objects || {};
  expect(objects.fingers_c1_r2_diode.properties?.owner).toBe('fingers_c1_r2');
  expect(objects.fingers_c1_r2_diode_2).toMatchObject({
    kind: 'key',
    cell: ['c1', 'r2_diode'],
  });
});

it('initializes legacy key electronics in one insertion per new key', () => {
  // Given: the browser matrix creation path uses inline legacy electronics.
  const source = addCluster(
    '# retained\nschema: ergogen/v1\nlayout: {objects: {}}\n',
    'fingers',
    'columns',
    { columns: 3, rows: 2 }
  );
  parsing.calls = 0;

  // When: one row is added.
  const result = resizeCluster(source, 'fingers', { rows: ['r1', 'r2', 'r3'] });
  const parseCount = parsing.calls;
  const objects = readStudio(result).layout.objects || {};

  // Then: switch/diode wiring and retained source are correct with bounded parsing.
  expect(result.startsWith('# retained\n')).toBe(true);
  expect(objects.fingers_c3_r3.footprints).toEqual({
    switch: { params: { to: '{{name}}_switch' } },
    studio_diode: {
      what: 'diode',
      placement: { at: [0, -5, 0] },
      params: { from: '{{name}}_switch', to: '{{row_net}}' },
    },
  });
  expect(parseCount).toBeLessThanOrEqual(5);
});

it('removes one row and its owned electronics with one source deletion pass', () => {
  // Given: unedited generated keys can be removed without a review prompt.
  const source =
    '# retained shrink comment\n' +
    compileSetup({ ...defaultSetup(), columns: 3, rows: 2 });
  const original = readStudio(source).layout.objects?.fingers_c1_r1;
  parsing.calls = 0;

  // When: three keys are removed as one matrix operation.
  const result = resizeCluster(source, 'fingers', { rows: ['r1'] });
  const parseCount = parsing.calls;
  const objects = readStudio(result).layout.objects || {};

  // Then: retained keys remain exact and removed keys leave no owned components.
  expect(result.startsWith('# retained shrink comment\n')).toBe(true);
  expect(objects.fingers_c1_r1).toEqual(original);
  expect(
    Object.values(objects).filter((item) => item.kind === 'key')
  ).toHaveLength(3);
  expect(objects.fingers_c1_r2).toBeUndefined();
  expect(objects.fingers_c1_r2_diode).toBeUndefined();
  expect(parseCount).toBeLessThanOrEqual(8);
});

it('keeps an edited owned diode behind the resize review boundary', () => {
  // Given: an owned diode has a manual placement edit.
  const source = setValue(
    compileSetup({ ...defaultSetup(), columns: 2, rows: 2 }),
    ['layout', 'objects', 'fingers_c2_r2_diode', 'placement', 'at'],
    [7, -3, 0]
  );

  // When: its row is removed as one batch.
  let review: ResizeReview | undefined;
  try {
    resizeCluster(source, 'fingers', { rows: ['r1'] });
  } catch (error) {
    if (!(error instanceof ResizeReview)) throw error;
    review = error;
  }

  // Then: the original source is retained until the complete candidate is accepted.
  expect(review).toBeInstanceOf(ResizeReview);
  expect(review?.proposal.before).toBe(source);
  expect(review?.proposal.keys).toEqual(['fingers_c1_r2', 'fingers_c2_r2']);
  expect(
    readStudio(review?.proposal.after || source).layout.objects
      ?.fingers_c2_r2_diode
  ).toBeUndefined();
});

it('matches ordinary assembly application when compiling a batch of new keys', async () => {
  // Given: inserted keys have no prior electronics recipe or owned components.
  const { applyAssembly } = await import('./applyAssembly');
  const setup = { ...defaultSetup(), columns: 2, rows: 1, led: true };
  let source = compileSetup(setup);
  const original = readStudio(source);
  const keys = ['fingers_c1_r1', 'fingers_c2_r1'];
  source = setValue(
    source,
    ['layout', 'objects'],
    Object.fromEntries(
      keys.map((id) => {
        const item = original.layout.objects?.[id];
        return [
          id,
          {
            kind: 'key',
            part: item?.part,
            pcb: item?.pcb,
            cluster: item?.cluster,
            cell: item?.cell,
            envelopes: { keycap: { size: [18, 18] } },
          },
        ];
      })
    )
  );
  const expected = readStudio(applyAssembly(source, keys, setup, 'preserve'));

  // When: the same new keys use deferred mapping writes.
  const result = applyAssembly(source, keys, setup, 'preserve', 'keys', true);

  // Then: native parts, generated nets, LED chain, templates and owners match exactly.
  expect(readStudio(result)).toEqual(expected);
});

it('creates one loose key with native owned electronics without intermediate field edits', () => {
  // Given: a native assembly board accepts a new loose key.
  const source = compileSetup({ ...defaultSetup(), columns: 3, rows: 2 });
  parsing.calls = 0;

  // When: a single key is added.
  const result = addObject(source, 'extra', 'key');
  const parseCount = parsing.calls;
  const objects = readStudio(result).layout.objects || {};

  // Then: its part, independent net identity and owned diode are complete.
  expect(objects.extra).toMatchObject({
    kind: 'key',
    part: 'assembly_mx_solder',
    pcb: 'main',
    properties: { column_net: 'extra_c1', row_net: 'extra_row' },
  });
  expect(objects.extra_diode.properties?.owner).toBe('extra');
  expect(parseCount).toBeLessThanOrEqual(6);
});

it('keeps different column recipes when a row creates multiple assembly groups', () => {
  // Given: the first column uses LEDs without diodes and the second uses defaults.
  const source = setValue(
    compileSetup({ ...defaultSetup(), columns: 2, rows: 1 }),
    ['meta', 'studio', 'columns', 'fingers', 'c1'],
    { diode: false, led: true }
  );

  // When: one row adds keys in both columns.
  const result = resizeCluster(source, 'fingers', { rows: ['r1', 'r2'] });

  // Then: each key and its owned electronics retain their resolved recipe.
  const objects = readStudio(result).layout.objects || {};
  expect(objects.fingers_c1_r2_led.properties?.owner).toBe('fingers_c1_r2');
  expect(objects.fingers_c1_r2_diode).toBeUndefined();
  expect(objects.fingers_c2_r2_diode.properties?.owner).toBe('fingers_c2_r2');
  expect(objects.fingers_c2_r2_led).toBeUndefined();
});

it('rejects batch removal when an owned component is locked', () => {
  // Given: one diode in the removed row is locked.
  const source = setValue(
    compileSetup({ ...defaultSetup(), columns: 2, rows: 2 }),
    ['layout', 'objects', 'fingers_c2_r2_diode', 'locked'],
    true
  );

  // When / Then: the complete resize is rejected before offering a candidate.
  expect(() => resizeCluster(source, 'fingers', { rows: ['r1'] })).toThrow(
    'Unlock'
  );
});

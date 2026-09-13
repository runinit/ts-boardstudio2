import { parse } from 'yaml';
import {
  addCluster,
  createMatrix,
  addObject,
  resizeCluster,
  removeObject,
  setValue,
  removeValue,
  duplicateObject,
  addOutline,
} from './studioSource';

const source =
  '# project comment\nschema: ergogen/v1\nunits: {pitch: 19}\nlayout:\n  objects: {}\n';
it('creates parametric keys and retains identities and unrelated source', () => {
  const added = addCluster(source, 'fingers', 'columns');
  const resized = resizeCluster(added, 'fingers', {
    columns: ['c1', 'c2'],
    rows: ['r1', 'r2'],
  });
  const reordered = resizeCluster(resized, 'fingers', {
    columns: ['c2', 'c1'],
    rows: ['r1', 'r2'],
  });
  expect(Object.keys(parse(reordered).layout.objects)).toEqual(
    Object.keys(parse(resized).layout.objects)
  );
  expect(reordered).toContain(
    '# project comment\nschema: ergogen/v1\nunits: {pitch: 19}\n'
  );
  expect(parse(reordered).layout.clusters.fingers.arrangement.pitch).toEqual([
    'pitch',
    'pitch',
  ]);
});
it('blocks deleting a referenced object and edits collections locally', () => {
  const added = addObject(source, 'mcu', 'component');
  const linked = addObject(added, 'screen', 'component');
  const placed = setValue(
    linked,
    ['layout', 'objects', 'screen', 'placement', 'ref'],
    'mcu'
  );
  expect(() => removeObject(placed, 'objects', 'mcu')).toThrow(/screen/);
  const cleared = removeValue(placed, [
    'layout',
    'objects',
    'screen',
    'placement',
    'ref',
  ]);
  expect(
    parse(removeObject(cleared, 'objects', 'mcu')).layout.objects.mcu
  ).toBeUndefined();
});
it('duplicates a selected key without changing its part or original nets', () => {
  const added = addObject(source, 'a', 'key');
  const copy = duplicateObject(added, 'objects', 'a', 'b');
  expect(parse(copy).layout.objects.a.properties).toEqual(
    parse(added).layout.objects.a.properties
  );
  expect(parse(copy).layout.objects.b.part).toBe(
    parse(added).layout.objects.a.part
  );
});

it('retains footprint providers when duplicating and gives keys new net identities', () => {
  const original = setValue(
    addCluster(source, 'fingers', 'columns'),
    ['layout', 'objects', 'fingers_c1_r1', 'footprints'],
    {
      switch: {
        what: 'custom_mx',
        params: { designator: 'SW', from: '{{column_net}}', to: '{{row_net}}' },
      },
    }
  );
  const result = parse(
    duplicateObject(original, 'clusters', 'fingers', 'copy')
  );
  const key = result.layout.objects.copy_fingers_c1_r1;
  expect(key.footprints.switch.what).toBe('custom_mx');
  expect(key.properties.column_net).toBe('copy_c1');
});
it('creates an outline selection that includes future keys', () => {
  const result = parse(addOutline(addCluster(source, 'fingers', 'columns')));
  expect(result.designs.regions.main_keycap.select).toEqual({
    kind: 'key',
    pcb: 'main',
  });
  expect(result.designs.regions.main_keycap.close).toBe(2);
  expect(result.designs.boundaries.main_edge.holes).toBe('fill');
});

it('leaves component envelopes open when creating automatic outlines', () => {
  const withComponent = setValue(
    addObject(source, 'mcu', 'component'),
    ['layout', 'objects', 'mcu', 'envelopes'],
    { pcb: { size: [10, 10] } }
  );
  const placed = setValue(
    withComponent,
    ['layout', 'objects', 'mcu', 'pcb'],
    'main'
  );
  const result = parse(addOutline(placed));

  expect(result.designs.regions.main_pcb.close).toBeUndefined();
  expect(result.designs.boundaries.main_edge.holes).toBe('fill');
});
it('allocates new footprint references when duplicating a BHK-style key', () => {
  let original = addObject(source, 'a', 'key');
  original = setValue(original, ['layout', 'objects', 'a', 'footprints'], {
    switch: 'S1',
    diode: {
      what: 'diode',
      reference: 'D1',
      params: { from: 'row', to: 'column' },
    },
  });
  const result = parse(duplicateObject(original, 'objects', 'a', 'b'));
  expect(result.layout.objects.b.footprints.switch).toBeUndefined();
  expect(result.layout.objects.b.footprints.diode).toEqual({
    what: 'diode',
    params: { from: 'row', to: 'column' },
  });
  expect(result.layout.objects.a.footprints.switch).toBe('S1');
});
it('grows a matrix without restoring deliberately deleted keys', () => {
  const added = addCluster(source, 'matrix', 'columns');
  const grid = resizeCluster(added, 'matrix', {
    columns: ['c1', 'c2'],
    rows: ['r1', 'r2'],
  });
  const removed = removeObject(grid, 'objects', 'matrix_c1_r2');
  const grown = resizeCluster(removed, 'matrix', {
    columns: ['c1', 'c2', 'c3'],
    rows: ['r1', 'r2'],
  });
  expect(parse(grown).layout.objects.matrix_c1_r2).toBeUndefined();
  expect(parse(grown).layout.objects.matrix_c3_r2).toBeDefined();
});

it('mounts a new matrix on its PCB top surface', () => {
  const result = parse(createMatrix(source, 5, 4));
  const layer = result.layout.clusters.fingers.layer;
  expect(layer).toBeDefined();
  expect(result.layout.layers[layer].surface).toBe('pcb.main.top');
});

it('mounts new thumb clusters and loose keys on the existing PCB layer', () => {
  const matrix = createMatrix(source, 5, 4);
  const thumbs = addCluster(matrix, 'thumbs', 'arc');
  const result = parse(addObject(thumbs, 'extra', 'key'));
  expect(result.layout.clusters.thumbs.layer).toBe('electronics');
  expect(result.layout.objects.extra.layer).toBe('electronics');
});

it('deletes a cluster and its own members together', () => {
  const matrix = createMatrix(source, 5, 4);
  const added = addCluster(matrix, 'thumbs', 'arc');
  const result = parse(removeObject(added, 'clusters', 'thumbs'));
  expect(result.layout.clusters.thumbs).toBeUndefined();
  expect(Object.values(result.layout.objects)).toHaveLength(20);
  expect(result.layout.clusters.fingers).toBeDefined();
});
it('protects outside references when deleting a cluster', () => {
  const added = addCluster(source, 'thumbs', 'arc');
  const linked = setValue(added, ['layout', 'objects', 'screen'], {
    kind: 'component',
    placement: { ref: 'thumbs_0' },
  });
  expect(() => removeObject(linked, 'clusters', 'thumbs')).toThrow(/screen/);
});
it('rebuilds the current outline without leaving an invalid old boundary', () => {
  const initial = createMatrix(source, 2, 2);
  const expanded = addCluster(initial, 'thumbs', 'arc');
  const result = parse(addOutline(expanded, 'main', undefined, 'replace'));
  expect(Object.keys(result.designs.boundaries)).toEqual(['main_edge']);
  expect(Object.keys(result.designs.profiles)).toEqual(['main_outline']);
  expect(
    Object.keys(result.designs.boundaries.main_edge.bridges).length
  ).toBeGreaterThan(0);
  expect(result.pcbs.main.profile).toBe('profiles.main_outline');
});

it('preserves an explicit hole policy while rebuilding', () => {
  const initial = createMatrix(source, 2, 2);
  const preserved = setValue(
    initial,
    ['designs', 'boundaries', 'main_edge', 'holes'],
    'preserve'
  );

  expect(
    parse(addOutline(preserved, 'main', undefined, 'replace')).designs
      .boundaries.main_edge.holes
  ).toBe('preserve');
});

it('retains layout, bridges, clearance, and corners while rebuilding', () => {
  const initial = createMatrix(source, 2, 2);
  const authored = setValue(
    setValue(
      setValue(
        setValue(
          initial,
          ['designs', 'boundaries', 'main_edge', 'clearance'],
          4
        ),
        ['designs', 'boundaries', 'main_edge', 'corners'],
        { fillet: 7 }
      ),
      ['designs', 'boundaries', 'main_edge', 'bridges', 'manual'],
      {
        from: { ref: 'fingers_c1_r1' },
        to: { ref: 'fingers_c2_r2' },
        width: 12,
      }
    ),
    ['layout', 'objects', 'fingers_c1_r1', 'placement'],
    { override: { at: [9, 8, 0] } }
  );
  const result = parse(addOutline(authored, 'main', undefined, 'replace'));

  expect(result.layout.objects.fingers_c1_r1.placement.override.at).toEqual([
    9, 8, 0,
  ]);
  expect(result.designs.boundaries.main_edge.clearance).toBe(4);
  expect(result.designs.boundaries.main_edge.corners).toEqual({ fillet: 7 });
  expect(result.designs.boundaries.main_edge.bridges.manual).toEqual({
    from: { ref: 'fingers_c1_r1' },
    to: { ref: 'fingers_c2_r2' },
    width: 12,
  });
});

it('reuses generated regions so old component closing is removed on rebuild', () => {
  const initial = addOutline(
    setValue(
      addObject(source, 'mcu', 'component'),
      ['layout', 'objects', 'mcu'],
      { kind: 'component', pcb: 'main', envelopes: { pcb: { size: [10, 10] } } }
    )
  );
  const legacy = setValue(
    initial,
    ['designs', 'regions', 'main_pcb', 'close'],
    2
  );
  const rebuilt = parse(addOutline(legacy, 'main', undefined, 'replace'));

  expect(rebuilt.designs.regions.main_pcb.close).toBeUndefined();
  expect(Object.keys(rebuilt.designs.regions)).toEqual(['main_pcb']);
});

it('respects a profile hole policy when its boundary has no policy', () => {
  const legacy = parse(createMatrix(source, 2, 2));
  delete legacy.designs.boundaries.main_edge.holes;
  legacy.designs.profiles.main_outline.holes = 'preserve';

  const rebuilt = parse(
    addOutline(JSON.stringify(legacy), 'main', undefined, 'replace')
  );
  expect(rebuilt.designs.boundaries.main_edge.holes).toBe('preserve');
  expect(rebuilt.designs.profiles.main_outline.holes).toBe('preserve');
});

it('removes generated bridges with a deleted cluster but protects manual links', () => {
  const expanded = addCluster(createMatrix(source, 2, 2), 'thumbs', 'arc');
  const rebuilt = addOutline(expanded, 'main', undefined, 'replace');
  const deleted = parse(removeObject(rebuilt, 'clusters', 'thumbs'));
  expect(deleted.layout.clusters.thumbs).toBeUndefined();
  expect(deleted.designs.boundaries.main_edge.bridges).toEqual({});
  const manual = setValue(
    rebuilt,
    ['designs', 'boundaries', 'main_edge', 'bridges', 'manual'],
    {
      from: { ref: 'fingers_c1_r1' },
      to: { ref: 'thumbs_0' },
      width: 12,
    }
  );
  expect(() => removeObject(manual, 'clusters', 'thumbs')).toThrow(/manual/);
});

it('preserves shared automatic regions during rebuild', () => {
  const initial = createMatrix(source, 2, 2);
  const shared = setValue(initial, ['designs', 'profiles', 'other'], {
    from: 'regions.main_keycap',
  });
  const rebuilt = parse(addOutline(shared, 'main', undefined, 'replace'));
  expect(rebuilt.designs.boundaries.main_edge.from).not.toContain(
    'regions.main_keycap'
  );
  expect(rebuilt.designs.regions.main_keycap).toEqual(
    parse(shared).designs.regions.main_keycap
  );
});

it('preserves custom selectors when rebuilding an outline', () => {
  const initial = createMatrix(source, 2, 2);
  const custom = setValue(
    initial,
    ['designs', 'regions', 'main_keycap', 'select', 'cluster'],
    'fingers'
  );
  const rebuilt = parse(addOutline(custom, 'main', undefined, 'replace'));
  expect(rebuilt.designs.regions.main_keycap).toEqual(
    parse(custom).designs.regions.main_keycap
  );
});

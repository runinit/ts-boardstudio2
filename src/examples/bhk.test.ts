import { expect, it } from 'vitest';
import { parse } from 'yaml';
import ergogen from 'ergogen';
import BHK from './bhk';
import { addCell, resizeCluster, setValue } from '../utils/studioSource';

it('keeps BHK keys in named physical cells, separate from electrical nets', () => {
  const config = parse(BHK.value);
  expect(config.layout.clusters.matrix.arrangement).toMatchObject({
    type: 'columns',
    columns: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'],
    rows: ['r5', 'r4', 'r3', 'r2', 'r1'],
    pitch: ['kx', 'ky'],
  });
  expect(config.layout.clusters.thumbfan.arrangement).toMatchObject({
    type: 'columns',
    columns: ['c1', 'c2', 'c3'],
    rows: ['r2', 'r1'],
  });
  for (const [id, item] of Object.entries(config.layout.objects)) {
    const key = item as { kind: string; cell: string[] };
    if (key.kind === 'key') {
      expect(key.cell).toEqual(id.split('_').slice(-2));
    }
  }
  expect(config.layout.objects.thumbfan_c2_r1.properties).toMatchObject({
    column_net: 'c6',
    row_net: 'r5',
    led_prev: 'LED_26',
    led_next: 'LED_27',
  });
});

it('changes matrix pitch parametrically without filling intentional holes', () => {
  const before = ergogen.resolveLayout(BHK.value);
  const edited = setValue(BHK.value, ['units', 'kx'], 20);
  const after = ergogen.resolveLayout(edited);
  expect(
    after.objects.matrix_c2_r4.position[0] -
      before.objects.matrix_c2_r4.position[0]
  ).toBeCloseTo(1.125);
  expect(
    after.objects.matrix_c7_r1.position[0] -
      before.objects.matrix_c7_r1.position[0]
  ).toBeCloseTo(6.125);
  const resized = parse(
    resizeCluster(BHK.value, 'matrix', { rows: ['r5', 'r4', 'r3', 'r2', 'r1'] })
  );
  expect(Object.keys(resized.layout.objects)).toEqual(
    Object.keys(parse(BHK.value).layout.objects)
  );
  expect(resized.layout.objects.matrix_c1_r5).toBeUndefined();
});

it('changes thumb row pitch in each splayed column frame', () => {
  const before = ergogen.resolveLayout(BHK.value);
  const edited = setValue(
    BHK.value,
    ['layout', 'clusters', 'thumbfan', 'arrangement', 'pitch', 1],
    20
  );
  const after = ergogen.resolveLayout(edited);
  expect(after.objects.thumbfan_c2_r2.position).toEqual(
    before.objects.thumbfan_c2_r2.position
  );
  expect(
    after.objects.thumbfan_c2_r1.position[0] -
      before.objects.thumbfan_c2_r1.position[0]
  ).toBeCloseTo(0.5);
  expect(
    after.objects.thumbfan_c2_r1.position[1] -
      before.objects.thumbfan_c2_r1.position[1]
  ).toBeCloseTo(Math.sqrt(3) / 2);
});

it('preserves all migrated positions, rotations and electrical assignments', async () => {
  const { default: expected } = await import('./bhk-layout.json');
  const actual = ergogen.resolveLayout(BHK.value);
  expect(Object.keys(actual.objects).sort()).toEqual(
    Object.keys(expected).sort()
  );
  for (const [id, original] of Object.entries(expected)) {
    const item = actual.objects[id];
    original.position.forEach((coordinate, index) => {
      expect(item.position[index], `${id} axis ${index}`).toBeCloseTo(
        coordinate,
        6
      );
    });
    expect(item.rotation, id).toBeCloseTo(original.rotation, 6);
    expect(item.properties, id).toEqual(original.properties);
  }
});

it('adds a BHK cell with its authored circuit and existing matrix nets', () => {
  const result = parse(addCell(BHK.value, 'matrix', 'c7', 'r4'));
  const key = result.layout.objects.matrix_c7_r4;
  expect(key.pcb).toBe('bhk_pcb');
  expect(key.part).toBe('key');
  expect(key.properties).toMatchObject({
    column_net: 'c7',
    row_net: 'r4',
    colrow: 'c7_r4',
  });
  expect(key.properties.led_prev).not.toBe(key.properties.led_next);
  expect(key.footprints?.studio_diode).toBeUndefined();
  expect(result.parts.key).toEqual(parse(BHK.value).parts.key);
  expect(result.layout.objects.matrix_c7_r1).toEqual(
    parse(BHK.value).layout.objects.matrix_c7_r1
  );
});

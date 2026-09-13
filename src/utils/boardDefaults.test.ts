import { setKeyOptions, keyOptions } from './keyOptions';
import { parse } from 'yaml';
import {
  createBoard,
  applyBoardDefaults,
  setupFromSource,
} from './boardDefaults';
import { defaultSetup, compileSetup } from './designSetup';
import { resolve } from 'ergogen/src/native/layout';
import { addCluster, removeObject } from './studioSource';
it('starts empty with explicit pitch and mechanical parameters', () => {
  const data = parse(createBoard({ ...defaultSetup(), pitch: 19, pitchY: 17 }));
  expect(data.layout.objects).toEqual({});
  expect(data.layout.clusters).toEqual({});
  expect(data.units).toMatchObject({ u: 19, v: 17, pcb_thickness: 1.6 });
  expect(data.designs.stackups.main.pcb).toBe('main');
});

it('keeps pitch expressions and independent keycap dimensions through setup', () => {
  const setup = {
    ...defaultSetup(),
    pitch: 19,
    pitchY: 17,
    pitchExpressions: ['19', 'u - 2'] as [string, string],
    keycap: [17, 16] as [number, number],
  };
  const source = createBoard(setup);
  expect(parse(source).units).toMatchObject({ u: '19', v: 'u - 2' });
  expect(parse(source).parts.key.envelopes.keycap.size).toEqual([17, 16]);
  const next = applyBoardDefaults(source, {
    ...setupFromSource(source),
    family: 'choc_v1',
  });
  expect(parse(next).units.v).toBe('u - 2');
  expect(parse(next).parts.key.envelopes.keycap.size).toEqual([17, 16]);
  const populated = addCluster(next, 'keys', 'columns', {
    columns: 1,
    rows: 1,
  });
  expect(
    parse(populated).layout.objects.keys_c1_r1.envelopes.keycap.size
  ).toEqual([17, 16]);
});

it('resolves keycap expressions in the separate assembly sample', () => {
  const sample = compileSetup({
    ...defaultSetup(),
    pitch: 19,
    pitchY: 17,
    keycap: ['0.9u', '0.8v'],
  });
  const report = resolve(parse(sample));
  const key = Object.values(report.objects).find(
    (item) => item.kind === 'key'
  )!;
  expect(key.envelopes.keycap.size![0]).toBeCloseTo(17.1);
  expect(key.envelopes.keycap.size![1]).toBeCloseTo(13.6);
});
it('applies defaults without regenerating deleted keys', () => {
  let source = createBoard(defaultSetup());
  source = addCluster(source, 'fingers', 'columns', { columns: 2, rows: 2 });
  const key = Object.keys(parse(source).layout.objects).find(
    (id) => !id.includes('diode')
  )!;
  source = removeObject(source, 'objects', key);
  const before = Object.keys(parse(source).layout.objects);
  const after = parse(
    applyBoardDefaults(source, { ...defaultSetup(), pitch: 19 })
  );
  expect(Object.keys(after.layout.objects)).toEqual(before);
  expect(after.units.u).toBe(19);
});

it('applies reversible footprints to existing keys', () => {
  const source = addCluster(createBoard(), 'keys', 'columns', {
    columns: 1,
    rows: 1,
  });
  const next = parse(
    applyBoardDefaults(source, { ...defaultSetup(), topology: 'reversible' })
  );
  const key = Object.values(next.layout.objects).find(
    (item: any) => item.kind === 'key'
  ) as any;
  expect(key.footprints.switch.params.reversible).toBe(true);
});

it('links matrices added after starting a mirrored board', () => {
  const source = addCluster(
    createBoard({ ...defaultSetup(), topology: 'mirrored' }),
    'keys',
    'columns',
    { columns: 2, rows: 1 }
  );
  const data = parse(source);
  const mirror = Object.values(data.layout.clusters).find(
    (item: any) => item.mirror
  ) as any;
  expect(mirror.mirror.source).toBe('keys');
  expect(
    Object.values(mirror.overrides).every((item: any) => item.pcb === 'right')
  ).toBe(true);
});

it.each(['single', 'mirrored'] as const)(
  'creates PCB outlines when an empty %s board receives keys',
  (topology) => {
    const source = addCluster(
      createBoard({ ...defaultSetup(), topology }),
      'keys',
      'columns',
      { columns: 2, rows: 2 }
    );
    const data = parse(source);
    for (const pcb of Object.values(data.pcbs) as { profile?: string }[]) {
      expect(pcb.profile).toMatch(/^profiles\./);
    }
  }
);

it('preserves existing spacing defaults when setup only renames the board', () => {
  const source = setKeyOptions(createBoard(), { pitch: [18, 17] });
  const setup = setupFromSource(source);
  expect(setup).toMatchObject({ pitch: 18, pitchY: 17 });
  const next = applyBoardDefaults(source, { ...setup, name: 'Renamed' });
  expect(keyOptions(next).pitch).toEqual([18, 17]);
  expect(parse(next).units).toEqual(parse(source).units);
});
it('changes board pitch without replacing explicit matrix spacing', () => {
  let source = setKeyOptions(createBoard(), { pitch: [18, 17] });
  source = addCluster(source, 'keys', 'columns', { columns: 2, rows: 2 });
  const next = parse(
    applyBoardDefaults(source, {
      ...setupFromSource(source),
      pitch: 20,
      pitchY: 18,
    })
  );
  expect(next.units).toMatchObject({ u: 20, v: 18 });
  expect(next.meta.studio.defaults.pitch).toEqual(['u', 'v']);
  expect(next.layout.clusters.keys.arrangement.pitch).toEqual([18, 17]);
});

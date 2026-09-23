import type { DesignReport } from '../types/design';
import { freezeOutlines, prepareOutlines } from './studioOutline';
import { parse } from 'yaml';
import {
  freezeOutline,
  isOutlineAutomatic,
  reconcileOutline,
  setOutlineAutomatic,
} from './studioOutline';
import { addOutline, setValue, removeObject } from './studioSource';

const source = `schema: ergogen/v1
layout:
  objects:
    key:
      kind: key
      pcb: main
      envelopes: {keycap: {size: [18, 18]}}
pcbs: {main: {}}
`;

it('defaults Studio outlines to automatic and preserves recipes when frozen', () => {
  const outlined = addOutline(source);
  const frozen = freezeOutline(outlined, 'main', {
    paths: [{ type: 'line', origin: [0, 0], end: [10, 0] }],
  });
  const document = parse(frozen);

  expect(isOutlineAutomatic(frozen)).toBe(false);
  expect(document.meta.studio.outline.auto).toBe(false);
  expect(document.designs.boundaries.main_edge.from).toEqual([
    'regions.main_keycap',
  ]);
  expect(document.designs.boundaries.main_edge.snapshot.paths).toHaveLength(1);
});

it('opts managed outlines into fitted fillets while retaining authored settings', () => {
  const outlined = addOutline(source);
  expect(parse(outlined).designs.boundaries.main_edge.corners).toEqual({
    fillet: 2,
    mode: 'adaptive',
  });

  const changed = setValue(
    outlined,
    ['designs', 'boundaries', 'main_edge', 'corners'],
    { fillet: 3, mode: 'strict' }
  );
  expect(
    parse(prepareOutlines(changed)).designs.boundaries.main_edge.corners
  ).toEqual({
    fillet: 3,
    mode: 'strict',
  });
});

it('does not rewrite a frozen outline until automation is enabled', () => {
  const outlined = addOutline(source);
  const frozen = freezeOutline(outlined, 'main', { paths: [] });
  const moved = setValue(
    frozen,
    ['layout', 'objects', 'key', 'placement', 'at'],
    [20, 0]
  );

  expect(reconcileOutline(moved, 'main')).toBe(moved);
  const rebuilt = reconcileOutline(setOutlineAutomatic(moved, true), 'main');
  expect(parse(rebuilt).meta.studio.outline.auto).toBe(true);
  expect(parse(rebuilt).designs.boundaries.main_edge.snapshot).toBeUndefined();
});

it('preserves a custom outline even when it references a boundary', () => {
  const custom = setValue(
    setValue(
      setValue(source, ['designs', 'boundaries', 'authored'], {
        from: 'regions.art',
      }),
      ['designs', 'profiles', 'art'],
      { from: 'boundaries.authored' }
    ),
    ['pcbs', 'main', 'profile'],
    'profiles.art'
  );
  expect(prepareOutlines(custom)).toBe(custom);
});

it('freezes all managed features with exact curved paths and nested offsets', () => {
  const outlined = addOutline(source);
  const model = {
    origin: [4, 5],
    models: {
      inner: {
        origin: [10, 20],
        paths: {
          arc: {
            type: 'arc',
            origin: [1, 2],
            radius: 3,
            startAngle: 25,
            endAngle: 270,
          },
        },
      },
    },
  };
  const ids = [
    'regions.main_keycap',
    'boundaries.main_edge',
    'profiles.main_outline',
  ];
  const report = {
    features: Object.fromEntries(
      ids.map((id) => [id, { source: `designs.${id}`, model }])
    ),
  } as unknown as DesignReport;
  const frozen = parse(freezeOutlines(outlined, report));
  for (const id of ids) {
    const [section, name] = id.split('.');
    expect(frozen.designs[section][name].snapshot.paths).toEqual([
      {
        type: 'arc',
        center: [15, 27],
        radius: 3,
        startAngle: 25,
        endAngle: 270,
      },
    ]);
  }
});

it('protects edits to generated bridge anchors as authored geometry', () => {
  let input = setValue(source, ['layout', 'objects', 'second'], {
    kind: 'key',
    pcb: 'main',
    envelopes: { keycap: { size: [18, 18] } },
    placement: { at: [50, 0, 0] },
  });
  input = addOutline(input);
  const data = parse(input);
  const id = Object.keys(data.designs.boundaries.main_edge.bridges)[0];
  expect(id).toBeTruthy();
  const edited = setValue(
    input,
    ['designs', 'boundaries', 'main_edge', 'bridges', id, 'from'],
    { ref: 'key', shift: [1, 0] }
  );
  const prepared = parse(prepareOutlines(edited));
  expect(prepared.designs.boundaries.main_edge.bridges[id].from).toEqual({
    ref: 'key',
    shift: [1, 0],
  });
});

it('removes generated bridge ownership with its deleted object', () => {
  const input = addOutline(
    setValue(source, ['layout', 'objects', 'second'], {
      kind: 'key',
      pcb: 'main',
      envelopes: { keycap: { size: [18, 18] } },
    })
  );
  expect(() => removeObject(input, 'objects', 'second')).not.toThrow();
});

it('recognizes an exact legacy Studio recipe without relying on its names', () => {
  const outlined = addOutline(source)
    .replaceAll('main_edge', 'edge')
    .replaceAll('main_outline', 'board');
  const prepared = prepareOutlines(outlined);
  expect(parse(prepared).designs.boundaries.edge.from).toEqual([
    'regions.main_keycap',
  ]);
  expect(parse(prepared).meta.studio.outline.managed.main).toContain(
    'profiles.board'
  );
});

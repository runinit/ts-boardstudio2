import { parse } from 'yaml';
import type { LayoutReport } from 'ergogen/src/native';
import { addOutline, setValue } from './studioSource';

const source = `schema: ergogen/v1
layout:
  objects:
    finger: {kind: key, pcb: main, cluster: fingers, envelopes: {keycap: {size: [18, 18]}}}
    thumb: {kind: key, pcb: main, cluster: thumb, envelopes: {keycap: {size: [18, 18]}}}
    finger_diode: {kind: component, pcb: main, cluster: fingers, envelopes: {pcb: {size: [2, 2]}}}
    thumb_diode: {kind: component, pcb: main, cluster: thumb, envelopes: {pcb: {size: [2, 2]}}}
pcbs: {main: {}}
`;

it('creates only the bridge needed to join two clusters', () => {
  const report = {
    objects: {
      finger: { position: [0, 0, 0] },
      thumb: { position: [40, 0, 0] },
      finger_diode: { position: [20, 0, 0] },
      thumb_diode: { position: [21, 0, 0] },
    },
  } as unknown as LayoutReport;
  const result = parse(addOutline(source, 'main', report));
  const bridges = Object.values(
    result.designs.boundaries.main_edge.bridges
  ) as {
    from: { ref: string };
    to: { ref: string };
  }[];

  expect(bridges).toHaveLength(1);
  expect([bridges[0].from.ref, bridges[0].to.ref].sort()).toEqual([
    'finger',
    'thumb',
  ]);
});

it('does not add generated links over an authored cluster bridge', () => {
  const report = {
    objects: {
      finger: { position: [0, 0, 0] },
      thumb: { position: [40, 0, 0] },
      finger_diode: { position: [20, 0, 0] },
      thumb_diode: { position: [21, 0, 0] },
    },
  } as unknown as LayoutReport;
  const initial = addOutline(source, 'main', report);
  const authored = setValue(
    initial,
    ['designs', 'boundaries', 'main_edge', 'bridges', 'manual'],
    {
      from: { ref: 'finger' },
      to: { ref: 'thumb' },
      width: 12,
      ends: 'flat',
    }
  );
  const result = parse(addOutline(authored, 'main', report, 'replace'));

  expect(Object.keys(result.designs.boundaries.main_edge.bridges)).toEqual([
    'manual',
  ]);
});

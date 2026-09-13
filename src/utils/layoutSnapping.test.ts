import { snapLayout, defaultSnapping } from './layoutSnapping';
import { resolve } from 'ergogen/src/native/layout';
import { parse } from 'yaml';
import { vi } from 'vitest';
const source = `schema: ergogen/v1
units: {u: 19, v: 17}
layout:
  objects:
    a: {kind: key, placement: {at: [0,0,0]}}
    b: {kind: component, placement: {at: [25,25,0]}}
`;
it('snaps movement to independent quarter-pitch increments', () => {
  const report = resolve(parse(source));
  const result = snapLayout(
    report,
    ['b'],
    [1, 1, 0],
    { ...defaultSnapping, centers: false, edges: false },
    { u: 19, v: 17 },
    1,
    {}
  );
  expect(result.delta).toEqual([-1.25, 0.5, 0]);
});
it('prefers center guides over the grid and excludes moving members', () => {
  const report = resolve(parse(source));
  const matrix = report.objects.a.matrix;
  report.guides = {
    'a.center': {
      id: 'a.center',
      label: 'Key A',
      position: [0, 0, 0],
      matrix,
      axes: ['x', 'y'],
      members: ['a'],
    },
    'b.center': {
      id: 'b.center',
      label: 'Part B',
      position: [25, 25, 0],
      matrix: report.objects.b.matrix,
      axes: ['x', 'y'],
      members: ['b'],
    },
  };
  const result = snapLayout(
    report,
    ['b'],
    [-24.5, 5, 0],
    defaultSnapping,
    { u: 19, v: 17 },
    1,
    {}
  );
  expect(result.delta[0]).toBe(-25);
  expect(result.target).toBe('a.center');
  expect(result.axis).toBe('y');
});

it('keeps the free coordinate on the grid after an edge snap', () => {
  const report = resolve(
    parse(`schema: ergogen/v1
layout:
  objects:
    a: {kind: component, envelopes: {body: {size: [10, 20]}}}
    b: {kind: component, placement: {at: [20, 0, 0]}, envelopes: {body: {size: [10, 8]}}}
`)
  );
  const result = snapLayout(
    report,
    ['b'],
    [-7.5, 4, 0],
    { ...defaultSnapping, centers: false },
    { u: 19, v: 19 },
    1,
    {}
  );
  expect(result.kind).toBe('edge');
  expect(result.delta).toEqual([-8, 4.75, 0]);
});

it('offers footprint origins separately from body centers', () => {
  const report = resolve(
    parse(`schema: ergogen/v1
layout:
  objects:
    a: {kind: component, envelopes: {body: {size: [10, 10], at: [4, 0, 0]}}}
    b: {kind: component, placement: {at: [20, 20, 0]}, envelopes: {body: {size: [10, 10], at: [2, 0, 0]}}}
`)
  );
  const options = {
    ...defaultSnapping,
    centers: false,
    edges: false,
    origins: true,
  };
  const result = snapLayout(
    report,
    ['b'],
    [-19.5, 1, 0],
    options,
    { u: 19, v: 19 },
    1,
    {}
  );
  expect(result.kind).toBe('origin');
  expect(result.target).toBe('a.origin');
  expect(result.delta[0]).toBe(-20);
});

it('caches guide geometry for successive pointer movements', () => {
  const report = resolve(parse(source));
  const guides = report.guides;
  const read = vi.fn(() => guides);
  Object.defineProperty(report, 'guides', { get: read });
  snapLayout(
    report,
    ['b'],
    [-24.5, 5, 0],
    defaultSnapping,
    { u: 19, v: 17 },
    1,
    {}
  );
  read.mockClear();
  snapLayout(
    report,
    ['b'],
    [-24.4, 5, 0],
    defaultSnapping,
    { u: 19, v: 17 },
    1,
    {}
  );
  expect(read).not.toHaveBeenCalled();
});

it('retains a nearby guide until the hysteresis threshold is crossed', () => {
  const report = resolve(parse(source));
  const options = { ...defaultSnapping, edges: false };
  const first = snapLayout(
    report,
    ['b'],
    [-24.5, 5, 0],
    options,
    { u: 19, v: 17 },
    1,
    {}
  );
  const retained = snapLayout(
    report,
    ['b'],
    [-23.8, 5, 0],
    options,
    { u: 19, v: 17 },
    1,
    {},
    undefined,
    first
  );
  expect(retained.target).toBe(first.target);
  expect(retained.delta[0]).toBe(-25);
  const released = snapLayout(
    report,
    ['b'],
    [-23.4, 5, 0],
    options,
    { u: 19, v: 17 },
    1,
    {},
    undefined,
    retained
  );
  expect(released.kind).toBe('grid');
});

it('aligns opposite PCB faces without altering height or other boards', () => {
  const report = resolve(
    parse(`schema: ergogen/v1
pcbs: {main: {}, other: {}}
layout:
  layers: {front: {surface: pcb.main.top}, back: {surface: pcb.main.bottom}}
  objects:
    a: {kind: component, pcb: main, layer: front}
    b: {kind: component, pcb: main, layer: back, placement: {at: [25,25,0]}}
    unrelated: {kind: component, pcb: other, placement: {at: [0.4,30,0]}}
`)
  );
  const result = snapLayout(
    report,
    ['b'],
    [-24.5, 5, 0],
    defaultSnapping,
    { u: 19, v: 17 },
    1,
    {}
  );
  expect(result.target).toBe('a.center');
  expect(result.delta).toEqual([-25, 4.75, 0]);
});

it('quantizes a group in a rotated parent frame with one rigid delta', () => {
  const report = resolve(parse(source));
  const angle = Math.PI / 6,
    c = Math.cos(angle),
    s = Math.sin(angle);
  const frame = [c, -s, 0, 25, s, c, 0, 25, 0, 0, 1, 0, 0, 0, 0, 1];
  const result = snapLayout(
    report,
    ['b', 'a'],
    [5 * c, 5 * s, 0],
    { ...defaultSnapping, centers: false, edges: false },
    { u: 19, v: 17 },
    1,
    {},
    frame
  );
  expect(result.delta[0]).toBeCloseTo(4.75 * c, 5);
  expect(result.delta[1]).toBeCloseTo(4.75 * s, 5);
});

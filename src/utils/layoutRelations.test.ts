import { resolve } from 'ergogen/src/native/layout';
import { parse, stringify } from 'yaml';
import {
  alignObject,
  distanceObject,
  unlinkRelation,
  keepSnapRelation,
} from './layoutRelations';

it('makes a mouse-picked distance move only the selected follower', async () => {
  const { process } = await import('ergogen');
  const source = stringify({
    schema: 'ergogen/v1',
    layout: {
      objects: {
        target: { kind: 'component' },
        follower: {
          kind: 'component',
          placement: { at: [10, 0, 4], rotate: 30 },
        },
      },
    },
  });
  const next = distanceObject(
    source,
    'follower',
    'target.center',
    '0.5u',
    resolve(parse(source))
  );
  const result = await process(next, { layoutOnly: true });
  expect(result.layout.objects.target.position).toEqual([0, 0, 0]);
  expect(result.layout.objects.follower.position[0]).toBeCloseTo(9.5);
  expect(result.layout.objects.follower.position[2]).toBe(4);
  expect(result.layout.objects.follower.rotation).toBeCloseTo(30);
});

it('keeps origin relationships independent of body offsets', async () => {
  const source = stringify({
    schema: 'ergogen/v1',
    layout: {
      objects: {
        target: {
          kind: 'component',
          envelopes: { body: { size: [10, 10], at: [4, 0, 0] } },
        },
        follower: { kind: 'component', placement: { at: [0, 20, 0] } },
      },
    },
  });
  const next = keepSnapRelation(
    source,
    {
      kind: 'origin',
      moving: 'follower',
      target: 'target.origin',
      axis: 'y',
      delta: [0, 0, 0],
      guides: [],
      label: '',
    },
    resolve(parse(source))
  );
  expect(Object.values(parse(next).layout.constraints)[0]).toMatchObject({
    refs: ['follower.origin', 'target.origin'],
  });
});

it('rejects cross-board alignments and dependency cycles', () => {
  const source = stringify({
    schema: 'ergogen/v1',
    pcbs: { a: {}, b: {} },
    layout: {
      objects: {
        target: { kind: 'component', pcb: 'a' },
        follower: { kind: 'component', pcb: 'b' },
        child: { kind: 'component', pcb: 'b', placement: { ref: 'follower' } },
      },
    },
  });
  const report = resolve(parse(source));
  expect(() =>
    alignObject(source, 'follower', 'target.center', 'y', report)
  ).toThrow('same PCB');
  expect(() =>
    alignObject(source, 'follower', 'child.center', 'y', report)
  ).toThrow('cycle');
});

it('rejects a cycle through an existing distance relationship', () => {
  const source = stringify({
    schema: 'ergogen/v1',
    layout: {
      objects: {
        target: { kind: 'component' },
        follower: { kind: 'component', placement: { at: [20, 0, 0] } },
      },
    },
  });
  const next = distanceObject(
    source,
    'follower',
    'target.center',
    20,
    resolve(parse(source))
  );
  expect(() =>
    distanceObject(next, 'target', 'follower.center', 20, resolve(parse(next)))
  ).toThrow('cycle');
});

it('releases a distance relationship without snapping its follower back', () => {
  const source = stringify({
    schema: 'ergogen/v1',
    layout: {
      objects: {
        a: { kind: 'component' },
        b: {
          kind: 'component',
          placement: { at: [10, 0, 0], solve: ['x', 'y'] },
        },
      },
      constraints: {
        distance: {
          type: 'distance',
          refs: ['a.center', 'b.center'],
          value: 20,
        },
      },
    },
    meta: {
      studio: {
        relations: {
          distance: { owners: [{ object: 'b', added: ['x', 'y'] }] },
        },
      },
    },
  });
  const report = resolve(parse(source));
  report.objects.b.position = [20, 0, 0];
  const next = unlinkRelation(source, 'distance', report);
  expect(resolve(parse(next)).objects.b.position[0]).toBe(20);
  expect(parse(next).layout.objects.b.placement.solve).toEqual([]);
});

it('keeps an edge offset after the drop without moving the component', async () => {
  const { keepSnapRelation } = await import('./layoutRelations');
  const source = stringify({
    schema: 'ergogen/v1',
    pcbs: { main: { thickness: 1.6 } },
    layout: {
      layers: { top: { surface: 'pcb.main.top' } },
      objects: {
        target: {
          kind: 'component',
          pcb: 'main',
          layer: 'top',
          placement: { at: [0, 0, 0] },
          envelopes: { body: { size: [10, 10], height: [0, 2] } },
        },
        follower: {
          kind: 'component',
          pcb: 'main',
          layer: 'top',
          placement: { at: [12, 0, 0] },
          envelopes: { body: { size: [10, 10], height: [0, 2] } },
        },
      },
    },
  });
  const next = keepSnapRelation(
    source,
    {
      kind: 'edge',
      moving: 'follower',
      target: 'target',
      delta: [-18, 0, 0],
      guides: [],
      label: '2 mm edge gap',
    },
    resolve(parse(source))
  );
  expect(resolve(parse(next)).objects.follower.position).toEqual(
    resolve(parse(source)).objects.follower.position
  );
  const moved = parse(next);
  moved.layout.objects.target.placement.at = [5, 3, 0];
  expect(resolve(moved).objects.follower.position.slice(0, 2)).toEqual([17, 3]);
});

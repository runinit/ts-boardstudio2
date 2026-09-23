import { describeSelection } from './studioSelectionGeometry';
import type { LayoutReport, ResolvedObject } from 'ergogen/src/native';
import type { StudioSelection } from './studioTargets';

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function key(
  id: string,
  x: number,
  y: number,
  cell: string[],
  matrix = IDENTITY
): ResolvedObject {
  const placement = [...matrix];
  placement[3] = x;
  placement[7] = y;
  return {
    id,
    label: id,
    kind: 'key',
    position: [x, y, 0],
    cluster: 'fingers',
    cell,
    locked: false,
    rotation: 0,
    sourcePath: '',
    side: 'top',
    envelopes: { keycap: { size: [18, 18] } },
    bounds: {},
    matrix: placement,
  } as unknown as ResolvedObject;
}

function report(objects: Record<string, ResolvedObject>): LayoutReport {
  return {
    objects,
    clusters: {},
    layers: {},
    findings: [],
    guides: {},
  } as unknown as LayoutReport;
}

it('bounds a selected row from real key geometry and annotates pitch', () => {
  const objects = Object.fromEntries(
    [0, 1, 2, 3, 4].map((i) => [
      `c${i + 1}r1`,
      key(`c${i + 1}r1`, i * 19.05, 0, [`c${i + 1}`, 'r1']),
    ])
  );
  const selection: StudioSelection = {
    section: 'rows',
    cluster: 'fingers',
    id: 'r1',
  };
  const outline = describeSelection(report(objects), selection, 'top', {
    u: 19.05,
    v: 19.05,
  });
  expect(outline).not.toBeNull();
  expect(outline!.members).toBe(5);
  expect(outline!.width).toBeCloseTo(4 * 19.05 + 18, 6);
  expect(outline!.height).toBeCloseTo(18, 6);
  expect(outline!.axis).toBe('x');
  expect(outline!.annotation).toBe('pitch: 19.05mm × 5 keys (94.2mm span)');
});

it('annotates a selected column along the y axis with the vertical pitch', () => {
  const objects = Object.fromEntries(
    [0, 1, 2].map((i) => [
      `c1r${i + 1}`,
      key(`c1r${i + 1}`, 0, -i * 19, [`c1`, `r${i + 1}`]),
    ])
  );
  const selection: StudioSelection = {
    section: 'columns',
    cluster: 'fingers',
    id: 'c1',
  };
  const outline = describeSelection(report(objects), selection, 'top', {
    u: 19.05,
    v: 19,
  });
  expect(outline!.axis).toBe('y');
  expect(outline!.height).toBeCloseTo(2 * 19 + 18, 6);
  expect(outline!.annotation).toBe('pitch: 19mm × 3 keys (56mm span)');
});

it('omits the run annotation for a single key selection', () => {
  const outline = describeSelection(
    report({ key: key('key', 0, 0, ['c1', 'r1']) }),
    { section: 'objects', id: 'key' },
    'top',
    { u: 19.05, v: 19.05 }
  );
  expect(outline!.members).toBe(1);
  expect(outline!.width).toBeCloseTo(18, 6);
  expect(outline!.axis).toBeNull();
  expect(outline!.annotation).toBeNull();
});

it('returns null when the selection resolves to no objects', () => {
  expect(
    describeSelection(
      report({ key: key('key', 0, 0, ['c1', 'r1']) }),
      { section: 'objects', id: '' },
      'top',
      { u: 19.05, v: 19.05 }
    )
  ).toBeNull();
});

it('bounds a rotated key from its resolved matrix, not its axis frame', () => {
  const angle = Math.PI / 4;
  const rotation = [
    Math.cos(angle),
    -Math.sin(angle),
    0,
    0,
    Math.sin(angle),
    Math.cos(angle),
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ];
  const outline = describeSelection(
    report({ key: key('key', 0, 0, ['c1', 'r1'], rotation) }),
    { section: 'objects', id: 'key' },
    'top',
    { u: 19.05, v: 19.05 }
  );
  expect(outline!.width).toBeCloseTo(18 * Math.SQRT2, 6);
  expect(outline!.height).toBeCloseTo(18 * Math.SQRT2, 6);
});

it('treats a multi-item key selection sharing a row as a horizontal run', () => {
  const objects = Object.fromEntries(
    [0, 1, 2].map((i) => [
      `c${i + 1}r1`,
      key(`c${i + 1}r1`, i * 19.05, 0, [`c${i + 1}`, 'r1']),
    ])
  );
  const selection: StudioSelection = {
    section: 'objects',
    id: 'c1r1',
    members: [
      { section: 'objects', id: 'c1r1' },
      { section: 'objects', id: 'c2r1' },
      { section: 'objects', id: 'c3r1' },
    ],
  };
  const outline = describeSelection(report(objects), selection, 'top', {
    u: 19.05,
    v: 19.05,
  });
  expect(outline!.members).toBe(3);
  expect(outline!.axis).toBe('x');
  expect(outline!.annotation).toBe('pitch: 19.05mm × 3 keys (56.1mm span)');
});

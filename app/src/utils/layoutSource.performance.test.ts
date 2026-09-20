import { afterEach, expect, it, vi } from 'vitest';
import * as YAML from 'yaml';
import { resolveLayout } from 'ergogen/src/native/draft';
import { moveLayout, setLayout } from './layoutSource';

vi.mock('yaml', async (importOriginal) => {
  const actual = await importOriginal<typeof import('yaml')>();
  return { ...actual, parseDocument: vi.fn(actual.parseDocument) };
});

afterEach(() => vi.restoreAllMocks());

const source = `# Preserve document
schema: ergogen/v1
units: {pitch: 19}
layout:
  objects:
    thumb:
      kind: key
      placement:
        at: [pitch, 0, 0] # Preserve formula
`;

it('creates first movement and fixed axes without parsing intermediate YAML', () => {
  const parses = vi.spyOn(YAML, 'parseDocument');
  const clones = vi.spyOn(YAML.Document.prototype, 'clone');

  const changed = moveLayout(source, 'objects', 'thumb', [5, 0, 0]);
  const parseCount = parses.mock.calls.length;
  const cloneCount = clones.mock.calls.length;

  expect(changed).toBe(
    source +
      '        override:\n          at:\n            - 5\n            - 0\n            - 0\n          fixed:\n            x: true\n'
  );
  const matrix = resolveLayout(changed).objects.thumb.matrix;
  expect([matrix[3], matrix[7], matrix[11]]).toEqual([24, 0, 0]);
  expect.soft(parseCount).toBe(1);
  expect.soft(cloneCount).toBeLessThanOrEqual(3);
});

it('creates first rotation and its fixed axis without parsing intermediate YAML', () => {
  const input = source.replace('# Preserve document', '# Rotation');
  const parses = vi.spyOn(YAML, 'parseDocument');
  const clones = vi.spyOn(YAML.Document.prototype, 'clone');

  const changed = setLayout(
    input,
    'objects',
    'thumb',
    ['placement', 'override', 'rotate'],
    15
  );
  const parseCount = parses.mock.calls.length;
  const cloneCount = clones.mock.calls.length;

  expect(changed).toBe(
    input +
      '        override:\n          rotate: 15\n          fixed:\n            rotate: true\n'
  );
  expect.soft(parseCount).toBe(1);
  expect.soft(cloneCount).toBeLessThanOrEqual(3);
});

it('keeps existing override sequence formulas and comments byte for byte', () => {
  const input = `schema: ergogen/v1
units: {pitch: 19}
layout:
  objects:
    thumb:
      kind: key
      placement:
        override:
          at:
            - pitch # formula
            - 0 # moved axis
            - 0 # untouched axis
          fixed: {x: true} # prior axes
`;

  const changed = setLayout(
    input,
    'objects',
    'thumb',
    ['placement', 'override', 'at'],
    ['pitch', 3, 0]
  );

  expect(changed).toBe(
    input
      .replace('0 # moved axis', '3 # moved axis')
      .replace('{x: true}', '{ x: true, y: true }')
  );
  const matrix = resolveLayout(changed).objects.thumb.matrix;
  expect([matrix[3], matrix[7], matrix[11]]).toEqual([19, 3, 0]);
});

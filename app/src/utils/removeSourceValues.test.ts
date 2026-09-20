import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { removeSourceValues } from './removeSourceValues';

describe('removeSourceValues', () => {
  it('preserves CRLF when replacing an emptied block mapping', () => {
    const source = 'm:\r\n  a: 1\r\n  b: 2\r\nt: 3\r\n';
    expect(
      removeSourceValues(source, [
        ['m', 'a'],
        ['m', 'b'],
      ])
    ).toBe('m:\r\n  {}\r\nt: 3\r\n');
  });
  it('preserves unrelated bytes when removing adjacent block fields', () => {
    const source =
      '# header\nm:\n  a: 1\n  b: 2\n  # retained\n  c: "03" # tail\nt: 4\n';
    expect(
      removeSourceValues(source, [
        ['m', 'a'],
        ['m', 'b'],
      ])
    ).toBe('# header\nm:\n  # retained\n  c: "03" # tail\nt: 4\n');
  });
  it.each([
    ['a', 'b'],
    ['b', 'c'],
    ['a', 'c'],
  ])('removes flow siblings %s and %s with valid separators', (a, b) => {
    const result = removeSourceValues(
      'm: {a: 1, b: 2, c: 3}\nt: "04" # keep\n',
      [
        ['m', a],
        ['m', b],
      ]
    );
    expect(Object.keys(parse(result).m)).toEqual(
      ['a', 'b', 'c'].filter((key) => key !== a && key !== b)
    );
    expect(result).toContain('t: "04" # keep\n');
  });
  it.each(['m:\n  a: 1\n  b: 2\nt: 3\n', 'm: {a: 1, b: 2}\nt: 3\n'])(
    'leaves an empty mapping when every sibling is removed',
    (source) => {
      const result = removeSourceValues(source, [
        ['m', 'a'],
        ['m', 'b'],
      ]);
      expect(parse(result)).toEqual({ m: {}, t: 3 });
    }
  );
  it('ignores nested and duplicate removals under a removed field', () => {
    expect(
      removeSourceValues('m: {a: {x: 1}, b: 2}\n', [
        ['m', 'a', 'x'],
        ['m', 'a'],
        ['m', 'a'],
      ])
    ).toBe('m: {b: 2}\n');
  });
  it('allows deleting an anchor and its alias together', () => {
    expect(
      removeSourceValues('a: &value {x: 1}\nb: *value\nc: 3\n', [['a'], ['b']])
    ).toBe('c: 3\n');
  });
  it('rejects a dangling alias after all deletions', () => {
    expect(() =>
      removeSourceValues('a: &value {x: 1}\nb: *value\nc: 3\n', [['a']])
    ).toThrow();
  });
  it('preserves source when every requested field is absent', () => {
    expect(removeSourceValues('a: 1 # keep\n', [['missing']])).toBe(
      'a: 1 # keep\n'
    );
  });
});

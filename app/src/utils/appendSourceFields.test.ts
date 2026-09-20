import { describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';
import { appendFields, editField, editMappingFields } from './designSource';

const parsing = vi.hoisted(() => ({ calls: 0 }));
vi.mock('yaml', async (importOriginal) => {
  const actual = await importOriginal<typeof import('yaml')>();
  return {
    ...actual,
    parseDocument: (...args: Parameters<typeof actual.parseDocument>) => {
      parsing.calls++;
      return actual.parseDocument(...args);
    },
  };
});

describe('editMappingFields', () => {
  it.each(['\n', '\r\n'])(
    'matches individual edits with %j source bytes',
    (newline) => {
      const source = [
        '# header',
        'm:',
        '  a: "old" # note',
        '  b:',
        '    old: 1',
        '  c: [1, 2] # keep',
        'tail: { x: 3 }',
        '',
      ].join(newline);
      const entries = { a: { x: 2 }, b: { y: 3 }, c: [4, 5], d: 6 };
      const expected = Object.entries(entries).reduce(
        (result, [key, value]) => editField(result, ['m', key], value),
        source
      );
      expect(editMappingFields(source, ['m'], entries)).toBe(expected);
    }
  );
  it('upserts existing and missing flow fields', () => {
    expect(
      editMappingFields('m: {a: 1, b: 2} # keep\n', ['m'], { a: 3, c: 4 })
    ).toBe('m: {a: 3, b: 2, c: 4} # keep\n');
  });
  it('adds a missing parent mapping', () => {
    expect(editMappingFields('m: {}\n', ['m', 'nested'], { a: 1, b: 2 })).toBe(
      'm: {nested: { a: 1, b: 2 }}\n'
    );
  });
  it('rejects a scalar parent', () => {
    expect(() => editMappingFields('m: 1\n', ['m'], { a: 2 })).toThrow();
  });
  it('parses once when replacing many immediate mapping fields', () => {
    const source =
      '# upsert parse-count fixture\nm: {' +
      Array.from({ length: 40 }, (_, i) => `item_${i}: ${i}`).join(', ') +
      '}\n';
    const entries = Object.fromEntries(
      Array.from({ length: 80 }, (_, i) => [`item_${i}`, i + 100])
    );
    parsing.calls = 0;
    const result = editMappingFields(source, ['m'], entries);
    const count = parsing.calls;
    expect(parse(result).m).toEqual(entries);
    expect(count).toBe(1);
  });
});

describe('appendFields', () => {
  it('appends block entries while preserving unrelated authored bytes', () => {
    const source = '# header\nm:\n  old: "01" # retained\ntail: [1,  2]\n';
    const result = appendFields(source, ['m'], { next: 2, last: { x: 3 } });
    expect(result).toBe(
      '# header\nm:\n  old: "01" # retained\n  next: 2\n  last:\n    x: 3\ntail: [1,  2]\n'
    );
  });
  it.each(['\n', '\r\n'])(
    'preserves %j line endings when adding block entries',
    (newline) => {
      const source = ['m:', '  old: 1 # keep', 'tail: 2', ''].join(newline);
      const result = appendFields(source, ['m'], { a: 3, b: 4 });
      expect(result).toBe(
        ['m:', '  old: 1 # keep', '  a: 3', '  b: 4', 'tail: 2', ''].join(
          newline
        )
      );
    }
  );
  it.each(['{}', '{old: 1}'])(
    'appends entries to flow mapping %s',
    (mapping) => {
      const source = `m: ${mapping} # keep\r\nt: "02"\r\n`;
      const result = appendFields(source, ['m'], { a: 3, b: 4 });
      expect(result).toBe(
        `m: {${mapping === '{}' ? '' : 'old: 1, '}a: 3, b: 4} # keep\r\nt: "02"\r\n`
      );
    }
  );
  it('adds a missing mapping in one edit', () => {
    const result = appendFields('m: {} # retained\n', ['m', 'nested'], {
      a: 1,
      b: 2,
    });
    expect(result).toBe('m: {nested: { a: 1, b: 2 }} # retained\n');
  });
  it('rejects overwriting existing fields', () => {
    expect(() =>
      appendFields('m: {old: 1}\n', ['m'], { old: 2, next: 3 })
    ).toThrow();
  });
  it('rejects a nonmapping parent', () => {
    expect(() => appendFields('m: 1\n', ['m'], { a: 2 })).toThrow();
  });
  it('parses the original source once for many additions', () => {
    const source = '# parser-count fixture\nm: {original: 0}\n';
    const additions = Object.fromEntries(
      Array.from({ length: 80 }, (_, i) => [
        `item_${i}`,
        { kind: 'key', index: i },
      ])
    );
    parsing.calls = 0;
    const result = appendFields(source, ['m'], additions);
    const count = parsing.calls;
    expect(parse(result).m).toEqual({ original: 0, ...additions });
    expect(count).toBe(1);
  });
});

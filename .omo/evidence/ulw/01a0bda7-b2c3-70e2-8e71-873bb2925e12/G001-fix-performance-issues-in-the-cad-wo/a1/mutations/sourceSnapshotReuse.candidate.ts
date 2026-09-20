import { sourceDocument, sourceValue } from './sourceSnapshot';

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

it('reuses both mutation inputs while keeping returned documents isolated', () => {
  // Given: an edit compares its original source with the current candidate.
  const before = '# authored comment\nbase: &base {at: [1, 2, 3]}\ncopy: *base\n';
  const after = before.replace('[1, 2, 3]', '[4, 5, 6]');
  parsing.calls = 0;

  // When: assembly synchronization alternates between those two sources.
  const original = sourceDocument(before);
  const candidate = sourceDocument(after);
  original.setIn(['base', 'at', 0], 99);
  candidate.setIn(['base', 'at', 0], 88);
  const originalValue = sourceValue(before, ['copy', 'at']);
  const candidateValue = sourceValue(after, ['copy', 'at']);

  // Then: aliases and authored bytes remain independent with one parse per input.
  expect(originalValue).toEqual([1, 2, 3]);
  expect(candidateValue).toEqual([4, 5, 6]);
  expect(sourceDocument(before).toString()).toContain('# authored comment');
  expect(parsing.calls).toBe(2);
});

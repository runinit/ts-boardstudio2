import { expect, test } from 'vitest';
import { demoProject } from '../demo';
import { mirrorExistingHalf } from './existingHalf';

test('links existing matrices without changing source identities or independent hardware', () => {
  const doc = demoProject();
  doc.matrices[0].mirror = 'none';
  const before = structuredClone(doc);
  let id = 0;
  const result = mirrorExistingHalf(doc, doc.matrices, 100, () => `copy-${++id}`);
  expect(doc).toEqual(before);
  expect(result.parts).toBe(doc.parts);
  expect(result.matrices[0]).toBe(doc.matrices[0]);
  expect(result.layouts).toHaveLength(2);
  expect(result.layouts?.[1].mirrorLink).toEqual({ sourceId: result.layouts?.[0].id, axisX: 100 });
  expect(result.layouts?.[1].partIds).toEqual([]);
  expect(result.matrices[1].partIds).toEqual([]);
  expect(() => mirrorExistingHalf(result, [result.matrices[0]], 150, () => 'extra')).toThrow('already belongs');
});

test('unsupported frames fail before changing the document', () => {
  const doc = demoProject();
  const before = structuredClone(doc);
  expect(() => mirrorExistingHalf(doc, doc.matrices, 100, () => 'extra')).toThrow('Y-mirrored');
  expect(doc).toEqual(before);
});

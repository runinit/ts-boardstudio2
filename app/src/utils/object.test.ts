import { findResult } from './object';

describe('findResult', () => {
  const testObject = {
    a: {
      b: {
        c: 'hello',
      },
      d: 42,
    },
    e: null,
  };

  it('should find a nested property', () => {
    expect(findResult('a.b.c', testObject)).toBe('hello');
  });

  it('should return a number', () => {
    expect(findResult('a.d', testObject)).toBe(42);
  });

  it('should return an object', () => {
    expect(findResult('a.b', testObject)).toEqual({ c: 'hello' });
  });

  it('should return null for a null property', () => {
    expect(findResult('e', testObject)).toBeNull();
  });

  it('should return undefined for a non-existent path', () => {
    expect(findResult('a.x.y', testObject)).toBeUndefined();
  });

  it('should return the object itself for an empty path', () => {
    expect(findResult('', testObject)).toEqual(testObject);
  });

  it('should return null if the object to search is null', () => {
    expect(findResult('a.b', null)).toBeNull();
  });

  it('should return undefined if the object to search is not an object', () => {
    expect(findResult('a.b', 'a string')).toBeUndefined();
  });
});

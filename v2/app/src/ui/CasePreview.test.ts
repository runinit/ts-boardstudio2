import { describe, expect, it } from 'vitest';
import { componentPoseSvgTransform, componentSideScale, componentSideSvgTransform } from './CasePreview';

describe('component side preview transform', () => {
  it('keeps front models unchanged and turns back models around the Y axis', () => {
    expect(componentSideScale('front')).toEqual([1, 1, 1]);
    expect(componentSideScale('back')).toEqual([-1, 1, -1]);
    expect(componentSideSvgTransform('front')).toBe('');
    expect(componentSideSvgTransform('back')).toBe('scale(-1 1)');
  });

  it('serializes the front pose without an empty side-transform suffix', () => {
    expect(componentPoseSvgTransform({ x: 3, y: 0 }, 0, 'front')).toBe('translate(3 0) rotate(0)');
    expect(componentPoseSvgTransform({ x: 3, y: 0 }, 0, 'back')).toBe('translate(3 0) rotate(0) scale(-1 1)');
  });
});

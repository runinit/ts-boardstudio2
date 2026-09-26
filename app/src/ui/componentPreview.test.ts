import { describe, expect, it } from 'vitest';
import { componentPoseSvgTransform, componentSideSvgTransform } from './componentPreview';

describe('component side preview transform', () => {
  it('keeps front models unchanged and mirrors back footprint previews', () => {
    expect(componentSideSvgTransform('front')).toBe('');
    expect(componentSideSvgTransform('back')).toBe('scale(-1 1)');
  });

  it('serializes the front pose without an empty side-transform suffix', () => {
    expect(componentPoseSvgTransform({ x: 3, y: 0 }, 0, 'front')).toBe('translate(3 0) rotate(0)');
    expect(componentPoseSvgTransform({ x: 3, y: 0 }, 0, 'back')).toBe('translate(3 0) rotate(0) scale(-1 1)');
  });
});

import { describe, expect, it } from 'vitest';
import { builtinCatalog } from '@boardstudio/v2-kicad';
import { libraryPreviewFor, libraryPreviewsToCompile } from './libraryPreview';

describe('library preview compilation', () => {
  const catalog = builtinCatalog();
  const rgbLed = catalog.find((entry) => entry.definition.id === 'rgb-led' && entry.geometry.side === 'front')!;

  it('does not reuse a stale catalog companion after generator parameters change', () => {
    const edited = {
      ...rgbLed.definition,
      generator: { ...rgbLed.definition.generator!, parameters: { ...rgbLed.definition.generator!.parameters, padSpacing: 4.25, padSize: 2.8 } },
    };

    expect(libraryPreviewsToCompile([edited], catalog)).toEqual([edited]);
    expect(libraryPreviewFor(edited, [], catalog)).toBeUndefined();
  });

  it('selects the matching compiled companion after a batched compile', () => {
    const edited = {
      ...rgbLed.definition,
      generator: { ...rgbLed.definition.generator!, parameters: { ...rgbLed.definition.generator!.parameters, padSpacing: 4.25 } },
    };
    const updated = { ...rgbLed, definition: edited, geometry: { ...rgbLed.geometry, pads: rgbLed.geometry.pads.map((pad) => ({ ...pad, at: { ...pad.at, x: pad.at.x + 1 } })) } };

    expect(libraryPreviewFor(edited, [updated], catalog)).toBe(updated);
  });

  it('keeps unchanged generated companion previews on the synchronous catalog', () => {
    expect(libraryPreviewsToCompile([rgbLed.definition], catalog)).toEqual([]);
    expect(libraryPreviewFor(rgbLed.definition, [], catalog)).toBe(rgbLed);
  });
});

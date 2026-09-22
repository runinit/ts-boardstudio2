import { describe, expect, it } from 'vitest';
import {
  footprintUses,
  linkFootprint,
  saveFootprintSettings,
} from './footprintLinks';

describe('Explicit project library bindings', () => {
  it('links only the chosen declaration while preserving comments, inheritance and overrides', () => {
    const source =
      'schema: ergogen/v1\nparts:\n  switch: {revision: "1", footprints: {a: {what: old, params: {height: "unit * 2"}}}}\nlayout:\n  objects:\n    capacitor: # keep this\n      kind: component\n      footprints: {b: {what: old}}\n';
    const uses = footprintUses(source);
    const changed = linkFootprint(source, uses[0], 'library/owned');
    expect(changed).toContain('capacitor: # keep this');
    expect(changed).toContain('height: "unit * 2"');
    expect(footprintUses(changed).map((use) => use.what)).toEqual([
      'library/owned',
      'old',
    ]);
    expect(() => linkFootprint(changed, uses[0], 'another')).toThrow(
      /changed/i
    );
  });

  it('saves settings onto project declarations without creating a library alias', () => {
    const source =
      'schema: ergogen/v1\nlayout:\n  objects:\n    capacitor: # keep this\n      kind: component\n      footprints:\n        body: {what: bhkfp/cap_0603, params: {side: B, from: OLD}}\n';
    const use = footprintUses(source)[0];
    const changed = saveFootprintSettings(source, use, {
      side: 'B',
      from: 'GND',
      to: 'VCC',
    });

    expect(changed).toContain('capacitor: # keep this');
    expect(changed).toContain('what: bhkfp/cap_0603');
    expect(changed).toContain('from: GND');
    expect(changed).toContain('to: VCC');
    expect(changed).not.toContain('library/');
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractParameters } from './footprintParameters';

describe('bundled footprint defaults', () => {
  it('exposes BHK capacitor net defaults in the settings editor', () => {
    const source = readFileSync('vendor/bhk/footprints/cap_0603.js', 'utf8');
    const module = { exports: {} as Record<string, unknown> };
    new Function('module', source)(module);
    const parameters = extractParameters(
      (module.exports as { params: Record<string, unknown> }).params,
      source
    );

    expect(parameters.from.value).toBe('GND');
    expect(parameters.to.value).toBe('VCC');
  });
});

import { describe, expect, it } from 'vitest';
import { builtinCompiled } from '@boardstudio/v2-kicad';
import { canUseBuiltinDefault } from './builtinPreview';

describe('canUseBuiltinDefault', () => {
  const compiled = builtinCompiled('mx-switch', 'front')!;

  it('uses the generated catalog for an unchanged builtin', () => {
    expect(canUseBuiltinDefault(compiled.definition, compiled)).toBe(true);
  });

  it('compiles a builtin with a customized authored courtyard', () => {
    const definition = {
      ...compiled.definition,
      courtyard: compiled.definition.courtyard.map((point, index) => index === 0 ? { x: point.x - 1, y: point.y } : point),
      envelopeSource: { courtyard: 'authored' as const },
    };
    expect(canUseBuiltinDefault(definition, compiled)).toBe(false);
  });

  it('does not substitute generated defaults for source-backed definitions', () => {
    const definition = {
      ...compiled.definition,
      kicadSource: { formatVersion: 1 as const, source: '(footprint "custom")' },
    };
    expect(canUseBuiltinDefault(definition, compiled)).toBe(false);
  });
});

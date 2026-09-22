import { describe, expect, it } from 'vitest';
import { resolvePublicBase } from './publicBase';

describe('resolvePublicBase', () => {
  it('uses the root URL for local development', () => {
    expect(resolvePublicBase('development', '/boardstudio/')).toBe('/');
  });

  it('keeps the Pages deployment path for production', () => {
    expect(resolvePublicBase('production')).toBe('/boardstudio/');
    expect(resolvePublicBase('production', '/custom/')).toBe('/custom/');
  });
});

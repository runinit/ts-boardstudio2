import type { PartDefinition, Vec2 } from '@boardstudio/v2-contracts';
import { isErgogen, parameters } from '@boardstudio/v2-ergogen';

const validSize = (size?: Vec2): size is Vec2 => Boolean(size && Number.isFinite(size.x) && Number.isFinite(size.y) && size.x > 0 && size.y > 0);

/** Resolve the display envelope without changing the saved footprint or its courtyard. */
export function libraryKeycap(definition: PartDefinition): Vec2 | undefined {
  const { generator, keycap, envelopeSource } = definition;
  if (validSize(keycap) && (!envelopeSource || envelopeSource.keycap === 'authored')) return keycap;
  if (generator && isErgogen(generator.source)) {
    const defaults = parameters(generator.source);
    if (defaults.keycap_width && defaults.keycap_height) {
      const size = { x: Number(generator.parameters.keycap_width ?? defaults.keycap_width.value), y: Number(generator.parameters.keycap_height ?? defaults.keycap_height.value) };
      if (validSize(size)) return size;
    }
  }
  return validSize(keycap) ? keycap : undefined;
}

export function keycapOutline(size: Vec2): Vec2[] {
  return [{ x: -size.x / 2, y: -size.y / 2 }, { x: size.x / 2, y: -size.y / 2 }, { x: size.x / 2, y: size.y / 2 }, { x: -size.x / 2, y: size.y / 2 }];
}

export function previewPoint(point: Vec2, at: Vec2, rotation = 0): Vec2 {
  const angle = rotation * Math.PI / 180;
  return { x: point.x * Math.cos(angle) - point.y * Math.sin(angle) + at.x, y: point.x * Math.sin(angle) + point.y * Math.cos(angle) + at.y };
}

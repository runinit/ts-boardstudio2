export const MECHANICAL_EXPLODE_SPACING_MM = 2.4;

/** Move each successive stack layer farther down from the topmost layer. */
export function mechanicalExplodedOffset(stackIndex: number): number {
  return stackIndex <= 0 ? 0 : -stackIndex * MECHANICAL_EXPLODE_SPACING_MM;
}

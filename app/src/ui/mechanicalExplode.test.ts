import { describe, expect, it } from 'vitest';
import { mechanicalExplodedOffset } from './mechanicalExplode';

describe('mechanical exploded stack placement', () => {
  it('moves PCB and lower layers down while increasing every adjacent clearance', () => {
    const stack = [
      { id: 'plate', z: 5, thickness: 1.5 },
      { id: 'plate-foam', z: 0, thickness: 3 },
      { id: 'pcb', z: -1.6, thickness: 1.6 },
      { id: 'bottom-foam', z: -3.6, thickness: 2 },
      { id: 'battery', z: -9.6, thickness: 6 },
      { id: 'bottom', z: -12.6, thickness: 3 },
    ];
    const placed = stack.map((layer, index) => ({
      ...layer,
      offset: mechanicalExplodedOffset(index),
    }));

    for (let index = 0; index < placed.length - 1; index++) {
      const upper = placed[index];
      const lower = placed[index + 1];
      const assembledGap = upper.z - (lower.z + lower.thickness);
      const explodedGap = upper.z + upper.offset - (lower.z + lower.offset + lower.thickness);

      expect(explodedGap).toBeGreaterThan(assembledGap);
      expect(explodedGap).toBeGreaterThan(0);
    }
    [0, -2.4, -4.8, -7.2, -9.6, -12].forEach((offset, index) => {
      expect(placed[index].offset).toBeCloseTo(offset, 7);
    });
    expect(mechanicalExplodedOffset(-1)).toBe(0);
  });
});

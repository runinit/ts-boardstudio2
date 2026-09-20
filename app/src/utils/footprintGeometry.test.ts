import { expect, it } from 'vitest';
import { graphicPoints, padOutline } from './footprintGeometry';
import type { FootprintInfo } from '../types/footprint';
it('tessellates an arc through its supplied midpoint and uses the actual roundrect ratio', () => {
  const arc = graphicPoints({
    type: 'arc',
    start: [1, 0],
    mid: [0, 1],
    end: [-1, 0],
    center: [],
    points: [],
    layer: 'F.SilkS',
  });
  expect(arc[32][0]).toBeCloseTo(0);
  expect(arc[32][1]).toBeCloseTo(1);
  const pad = padOutline({
    index: 0,
    number: '1',
    type: 'smd',
    at: [0, 0],
    layers: ['F.Cu'],
    mechanical: false,
    size: [4, 2],
    shape: 'roundrect',
    roundrect: 0.25,
  });
  expect(pad[0]).toEqual([2, 0.5]);
  expect(pad[16][1]).toBeCloseTo(1);
});

it('normalizes placed pad rotations and mirrors each board side exactly once', async () => {
  const { footprintView } = await import('./footprintGeometry');
  const front: FootprintInfo = {
    targets: [],
    nets: [],
    models: [],
    diagnostics: [],
    at: [100, 200, 90],
    side: 'F',
    pads: [
      {
        index: 0,
        number: '1',
        type: 'smd',
        shape: 'rect',
        size: [1, 1],
        layers: ['F.Cu'],
        mechanical: false,
        at: [1, 2, 120],
      },
    ],
    graphics: [
      {
        type: 'line',
        layer: 'F.SilkS',
        start: [0, 1],
        end: [2, 3],
        mid: [],
        center: [],
        points: [],
      },
    ],
  };
  const back: FootprintInfo = {
    ...front,
    side: 'B',
    pads: [{ ...front.pads[0], at: [1, -2, 60] }],
    graphics: [{ ...front.graphics[0], start: [0, -1], end: [2, -3] }],
  };
  expect(footprintView(front, 'F')?.pads[0].at).toEqual([1, 2, 30]);
  expect(footprintView(front, 'B')?.pads[0].at).toEqual([1, -2, -30]);
  expect(footprintView(back, 'F')?.pads[0].at).toEqual([1, 2, 30]);
  expect(footprintView(back, 'B')?.pads[0].at).toEqual([1, -2, -30]);
  expect(footprintView(back, 'F')?.graphics[0].end).toEqual([2, 3]);
  expect(front.pads[0].at).toEqual([1, 2, 120]);
});

it('keeps custom jumper polygons instead of replacing their area with the anchor', () => {
  // Given: the five-vertex arrow pad used by reversible controller jumpers.
  const jumper = {
    index: 0,
    number: '1',
    type: 'smd',
    shape: 'custom',
    at: [0, 0],
    layers: ['F.Cu'],
    mechanical: false,
    size: [0.2, 0.2],
    anchor: 'rect' as const,
    polygons: [
      [
        [-0.5, -0.625],
        [0.25, -0.625],
        [0.5, 0],
        [0.25, 0.625],
        [-0.5, 0.625],
      ],
    ],
  };
  // When: the renderer asks for the pad contour.
  const outline = padOutline(jumper);
  // Then: the actual arrow extends beyond the tiny KiCad anchor.
  expect(outline).toContainEqual([0.5, 0]);
  expect(outline).toContainEqual([-0.5, 0.625]);
});
it('mirrors custom vertices, drill offsets and copper paths together', async () => {
  // Given: placed asymmetric local copper and an offset hole.
  const { footprintView } = await import('./footprintGeometry');
  const front: FootprintInfo = {
    targets: [],
    nets: [],
    models: [],
    graphics: [],
    diagnostics: [],
    at: [10, 20, 37],
    side: 'F',
    pads: [
      {
        index: 0,
        number: '1',
        type: 'smd',
        shape: 'custom',
        size: [0.2, 0.2],
        at: [1, 2, 52],
        layers: ['F.Cu'],
        mechanical: false,
        polygons: [
          [
            [0, 0],
            [1, 2],
            [0, 3],
          ],
        ],
        drillOffset: [0.2, 0.3],
      },
    ],
    tracks: [
      {
        type: 'segment',
        start: [1, 2],
        end: [3, 4],
        mid: [],
        width: 0.2,
        layer: 'B.Cu',
      },
    ],
  };
  // When: viewing its back side.
  const back = footprintView(front, 'B');
  // Then: each local frame reflects exactly once.
  expect(back?.pads[0].at).toEqual([1, -2, -15]);
  expect(back?.pads[0].polygons?.[0][1]).toEqual([1, -2]);
  expect(back?.pads[0].drillOffset).toEqual([0.2, -0.3]);
  expect(back?.tracks?.[0].end).toEqual([3, -4]);
});

import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { FootprintInfo } from '../types/footprint';
import { FootprintPadPlan } from './FootprintPadPlan';
const pad = {
  index: 0,
  number: '1',
  type: 'smd',
  shape: 'custom',
  at: [0, 0, 37],
  size: [0.2, 0.2],
  layers: ['F.Cu'],
  mechanical: false,
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
const info: FootprintInfo = {
  targets: [],
  nets: [],
  models: [],
  graphics: [],
  diagnostics: [],
  side: 'F',
  pads: [
    pad,
    {
      ...pad,
      index: 1,
      number: '2',
      shape: 'circle',
      size: [2, 2],
      layers: ['B.Cu'],
    },
    {
      ...pad,
      index: 2,
      number: '',
      type: 'np_thru_hole',
      shape: 'circle',
      size: [3, 3],
      drillSize: [3, 3],
      mechanical: true,
      layers: ['*.Cu'],
    },
  ],
  tracks: [
    {
      type: 'segment',
      start: [0, 0],
      end: [3, 0],
      mid: [],
      width: 0.25,
      layer: 'F.Cu',
    },
  ],
  vias: [{ at: [3, 0], size: 0.6, drill: 0.3, layers: ['F.Cu', 'B.Cu'] }],
};
it('renders the actual jumper path, drills and local copper for the chosen side', () => {
  // Given: a front arrow jumper, a back pad, a mounting drill and routed copper.
  const onPad = vi.fn();
  // When: rendering the real SVG plan and choosing its arrow.
  const { container } = render(<FootprintPadPlan info={info} onPad={onPad} />);
  fireEvent.click(
    screen.getByText('Pad 1').parentElement || screen.getByText('Pad 1')
  );
  // Then: the polygon is retained, back copper hidden, and drills use a transparency mask.
  expect(screen.getByRole('img', { name: /front copper/ })).toBeInTheDocument();
  expect(container.querySelector('path[d*="0.5 0"]')).toBeTruthy();
  expect(container.querySelector('[transform*="rotate(-37)"]')).toBeTruthy();
  expect(screen.queryByText('Pad 2')).not.toBeInTheDocument();
  expect(screen.getByText('Unplated hole')).toBeInTheDocument();
  expect(container.querySelector('mask path[d]')).toBeTruthy();
  expect(container.querySelector('polyline[stroke-width="0.25"]')).toBeTruthy();
  expect(onPad).toHaveBeenCalledWith('1');
});
it('shows a board-only keepout boundary without inventing a filled copper area', () => {
  // Given: a utility generator with only a keepout polygon.
  const utility: FootprintInfo = {
    ...info,
    pads: [],
    tracks: [],
    vias: [],
    zones: [
      {
        kind: 'keepout',
        layers: ['F.Cu'],
        polygons: [
          [
            [0, 0],
            [12, 0],
            [12, 8],
            [0, 8],
          ],
        ],
      },
    ],
  };
  // When: showing the plan.
  render(<FootprintPadPlan info={utility} />);
  // Then: the boundary remains observable and explicitly unfilled.
  const outline = screen.getByText('Keepout outline').parentElement;
  expect(outline).toHaveAttribute('fill', 'none');
  expect(outline).toHaveAttribute('stroke-dasharray', '0.6 0.4');
  expect(outline).toHaveAttribute('d', 'M 0 0 L 12 0 L 12 8 L 0 8 Z');
});

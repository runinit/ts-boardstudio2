import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import CaseModelInset from './CaseModelInset';
import { inspectFootprint } from '../utils/footprintService';
import type { BoardInventory } from '../types/case';
import type { ModelBinding } from '../types/footprint';

vi.mock('../utils/footprintService', () => ({ inspectFootprint: vi.fn() }));
vi.mock('./FootprintCanvas', () => ({
  default: ({
    models,
    onChange,
  }: {
    models: ModelBinding[];
    onChange: (model: ModelBinding) => void;
  }) => (
    <button
      onClick={() =>
        onChange({
          ...models[0],
          offset: [models[0].offset[0] + 1, ...models[0].offset.slice(1)] as [
            number,
            number,
            number,
          ],
        })
      }
    >
      Canvas {models[0]?.offset.join(',')}
    </button>
  ),
}));
beforeEach(() =>
  vi.mocked(inspectFootprint).mockResolvedValue({
    targets: [],
    pads: [],
    nets: [],
    models: [],
    graphics: [],
    diagnostics: [],
  })
);
const show = (
  footprints: { key: string; reference: string; frame?: number[] }[],
  models: ModelBinding[] = [],
  assets: Record<string, string> = {}
) => {
  const onChange = vi.fn();
  const board = {
    source: 'pcb',
    components: [
      {
        id: 'mcu',
        reference: 'Controller',
        native: { matrix: [], footprints },
        models,
        side: 'top',
      },
    ],
  } as unknown as BoardInventory;
  render(
    <CaseModelInset
      board={board}
      id="mcu"
      spec={{}}
      assets={assets}
      selected={0}
      onSelect={vi.fn()}
      onChange={onChange}
    />
  );
  return onChange;
};
it('looks up a native object by its emitted PCB reference', async () => {
  show([{ key: 'controller', reference: 'CUSTOM1' }]);
  await waitFor(() =>
    expect(inspectFootprint).toHaveBeenLastCalledWith(
      'pcb',
      { reference: 'CUSTOM1' },
      expect.any(AbortSignal)
    )
  );
});
it('lets a multi-footprint object choose its alignment target', async () => {
  show([
    { key: 'controller', reference: 'U1' },
    { key: 'connector', reference: 'J1' },
  ]);
  fireEvent.change(screen.getByLabelText('Alignment footprint'), {
    target: { value: 'J1' },
  });
  await waitFor(() =>
    expect(inspectFootprint).toHaveBeenLastCalledWith(
      'pcb',
      { reference: 'J1' },
      expect.any(AbortSignal)
    )
  );
});

it('converts a canvas edit back to object coordinates and keeps other models', () => {
  const frame = [0, -1, 0, 10, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 1];
  const original: ModelBinding = {
    path: 'part.step',
    offset: [0, 5, 2],
    frame: [1, 0, 0, 10, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    rotate: [0, 0, 0],
    scale: [1, 1, 1],
  };
  const other = {
    ...original,
    path: 'other.step',
    offset: [30, 40, 50] as [number, number, number],
  };
  const changed = show(
    [{ key: 'controller', reference: 'U1', frame }],
    [original, other]
  );
  fireEvent.click(screen.getByRole('button', { name: 'Canvas 5,0,0' }));
  const updated = changed.mock.calls[0][0] as ModelBinding[];
  updated[0].offset.forEach((value, index) =>
    expect(value).toBeCloseTo([0, 6, 2][index])
  );
  expect(updated[0].frame).toBe(original.frame);
  expect(updated[1].offset).toEqual(other.offset);
});

it('does not author a transient preview asset when moving a bundled model', () => {
  const model: ModelBinding = {
    path: '${KIPRJMOD}/models/boardstudio/controller.step',
    offset: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1],
  };
  const changed = show([{ key: 'controller', reference: 'U1' }], [model], {
    'boardstudio/controller.step': 'transient preview source',
  });

  fireEvent.click(screen.getByRole('button', { name: 'Canvas 0,0,0' }));

  expect(changed.mock.calls[0][0][0]).toEqual({ ...model, offset: [1, 0, 0] });
});

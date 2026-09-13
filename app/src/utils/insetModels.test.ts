import { expect, it } from 'vitest';
import { Vector3 } from 'three';
import { modelMatrix } from './modelGeometry';
import { fromInset, toInset } from './insetModels';
import type { ModelBinding } from '../types/footprint';

const frame = [1, 0, 0, 10, 0, 1, 0, 0, 0, 0, 1, 2, 0, 0, 0, 1];
const model: ModelBinding = {
  path: 'part.step',
  offset: [15, 3, 4],
  rotate: [0, 0, 0],
  scale: [1, 1, 1],
};
it('converts object coordinates into the selected footprint frame', () => {
  expect(toInset(model, frame, 'top').offset).toEqual([5, 3, 2]);
});
it('preserves an authored frame through edits and round trips', () => {
  const original = {
    ...model,
    frame,
    rotate: [20, 30, 40] as [number, number, number],
    scale: [1, 2, 3] as [number, number, number],
  };
  const preview = toInset(original, frame, 'top');
  const restored = fromInset(preview, original, frame, 'top');
  expect(restored.frame).toBe(frame);
  const point = new Vector3(2, 3, 4);
  expect(
    point
      .clone()
      .applyMatrix4(modelMatrix(restored))
      .distanceTo(point.clone().applyMatrix4(modelMatrix(original)))
  ).toBeLessThan(1e-10);
  preview.offset[0] += 2;
  expect(fromInset(preview, original, frame, 'top').offset[0]).toBeCloseTo(
    original.offset[0] + 2
  );
});
it('accounts for unframed bottom-side models without adding an authored frame', () => {
  const preview = toInset(model, frame, 'bottom');
  expect(preview.offset[1]).toBeCloseTo(-3);
  expect(preview.offset[2]).toBeCloseTo(-6);
  const restored = fromInset(preview, model, frame, 'bottom');
  expect(restored.frame).toBeUndefined();
  restored.offset.forEach((value, index) =>
    expect(value).toBeCloseTo(model.offset[index])
  );
});

it('maps a footprint-axis edit back into the rotated object axes', () => {
  const rotated = [0, -1, 0, 10, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 1];
  const original = { ...model, offset: [10, 5, 2] as [number, number, number] };
  const preview = toInset(original, rotated, 'top');
  expect(preview.offset).toEqual([5, 0, 0]);
  preview.offset[0] += 1;
  const restored = fromInset(preview, original, rotated, 'top');
  restored.offset.forEach((value, index) =>
    expect(value).toBeCloseTo([10, 6, 2][index])
  );
});

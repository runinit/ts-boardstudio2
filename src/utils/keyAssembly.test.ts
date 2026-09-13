import { expect, it } from 'vitest';
import { Vector3 } from 'three';
import { compileKey } from './keyAssembly';
import { defaultSetup } from './designSetup';
import { modelMatrix } from './modelGeometry';
import type { ModelBinding } from '../types/footprint';

it('rotates switch models with their footprint placement', () => {
  const setup = defaultSetup();
  setup.template.switch.at = [3, 4];
  setup.template.switch.rotate = 90;
  const objects = compileKey(setup, 'key', {
    columnNet: 'column',
    rowNet: 'row',
  });

  // A local pin at (1, 0) follows the footprint's counterclockwise turn.
  for (const model of objects.key.models as ModelBinding[]) {
    const pin = new Vector3(1, 0, 0).applyMatrix4(modelMatrix(model));
    expect(pin.x).toBeCloseTo(3);
    expect(pin.y).toBeCloseTo(5);
  }
});

import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import type { PartModel } from '@boardstudio/v2-contracts';

export function modelMatrix(model: Omit<PartModel, 'assetId'>): Matrix4 {
  const radians = Math.PI / 180;
  return new Matrix4().compose(
    new Vector3(model.offset.x, -model.offset.y, model.offset.z),
    new Quaternion().setFromEuler(
      new Euler(
        -model.rotation.x * radians,
        -model.rotation.y * radians,
        model.rotation.z * radians,
        'ZYX',
      ),
    ),
    new Vector3(model.scale.x, model.scale.y, model.scale.z),
  );
}

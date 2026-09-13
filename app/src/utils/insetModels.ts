import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import type { ModelBinding, Vec3 } from '../types/footprint';
import { modelMatrix } from './modelGeometry';

const DEGREE = Math.PI / 180;
const matrix = (frame: number[]) => new Matrix4().fromArray(frame).transpose();
const authoredFrame = (model: ModelBinding, side: string) =>
  model.frame
    ? matrix(model.frame)
    : new Matrix4().makeRotationX(side === 'bottom' ? Math.PI : 0);

function transform(model: ModelBinding, placement: Matrix4): ModelBinding {
  const position = new Vector3();
  const rotation = new Quaternion();
  const scale = new Vector3();
  placement.decompose(position, rotation, scale);
  const euler = new Euler().setFromQuaternion(rotation, 'ZYX');
  return {
    ...model,
    offset: position.toArray() as Vec3,
    rotate: [euler.x, euler.y, euler.z].map((value) => -value / DEGREE) as Vec3,
    scale: scale.toArray() as Vec3,
  };
}

// Preview in footprint coordinates; keep authored frames out of the canvas controls.
export function toInset(
  model: ModelBinding,
  frame: number[] | undefined,
  side: string
) {
  if (!frame) {
    return model;
  }
  const local = { ...model, frame: undefined };
  return transform(
    local,
    matrix(frame)
      .invert()
      .multiply(authoredFrame(model, side))
      .multiply(modelMatrix(local))
  );
}

// Convert edited controls back without replacing the model's original frame.
export function fromInset(
  edited: ModelBinding,
  original: ModelBinding,
  frame: number[] | undefined,
  side: string
) {
  if (!frame) {
    return edited;
  }
  return transform(
    original,
    authoredFrame(original, side)
      .invert()
      .multiply(matrix(frame))
      .multiply(modelMatrix(edited))
  );
}

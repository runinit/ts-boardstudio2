import { describe, expect, it } from 'vitest';
import { Matrix4, Vector3 } from 'three';
import { modelMatrix } from './modelTransform';
import { componentSideScale } from './CasePreview';

describe('KiCad 10 model transform oracle', () => {
  it('matches exported offset and clockwise ZYX model rotations', () => {
    // Export serializes (x,-y,z) offset and (rx,ry,-rz) rotation.
    // KiCad create_scene.cpp applies T * Rz(-rz) * Ry(-ry) * Rx(-rx) * S.
    const model = { assetId: 'asymmetric', offset: { x: 2, y: 3, z: 4 }, rotation: { x: 20, y: 40, z: 70 }, scale: { x: 1, y: 2, z: 3 } };
    const r = Math.PI / 180;
    const expected = new Matrix4().makeTranslation(2, -3, 4).multiply(new Matrix4().makeRotationZ(70*r)).multiply(new Matrix4().makeRotationY(-40*r)).multiply(new Matrix4().makeRotationX(-20*r)).multiply(new Matrix4().makeScale(1,2,3));
    modelMatrix(model).elements.forEach((value, index) => expect(value).toBeCloseTo(expected.elements[index], 10));
  });
  it('retains the normalized document bottom frame', () => {
    // Board export subtracts 180 degrees from a back footprint; combined with
    // KiCad Ry(pi)*Rz(pi), this equals the document Ry(pi) side transform.
    const actual = new Vector3(2, 3, 4).multiply(new Vector3(...componentSideScale('back')));
    expect(actual.toArray()).toEqual([-2, 3, -4]);
  });
});

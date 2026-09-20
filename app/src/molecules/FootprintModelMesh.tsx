/* eslint-disable react/no-unknown-property -- React Three Fiber scene properties. */
import { useEffect, useMemo, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group, Euler } from 'three';
import { STLLoader } from 'three-stdlib';
import { modelPreview } from '../utils/cachedModelPreview';
import { assetBytes, CaseAssets } from '../utils/caseAssets';
import { theme } from '../theme/theme';
import type { ModelBinding, Vec3 } from '../types/footprint';
export function FootprintModelMesh({
  model,
  assets,
  active,
  mode,
  onChange,
  onSelect,
}: {
  model: ModelBinding;
  assets: CaseAssets;
  active: boolean;
  mode: 'translate' | 'rotate' | 'scale';
  onChange?: (model: ModelBinding) => void;
  onSelect: () => void;
}) {
  // TransformControls attaches after React assigns the model group ref.
  const object = useRef<Group>(null!);
  const changed = useRef(false);
  const source = modelPreview(model, assets);
  const geometry = useMemo(() => {
    if (!source) {
      return null;
    }
    return new STLLoader().parse(
      assetBytes(JSON.parse(source).stl).buffer as ArrayBuffer
    );
  }, [source]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  if (!geometry) {
    return null;
  }
  const mesh = (
    <group
      ref={object}
      position={model.offset}
      rotation={[
        ...(model.rotate.map((value) => (-value * Math.PI) / 180) as Vec3),
        'ZYX',
      ]}
      scale={model.scale}
    >
      <mesh
        geometry={geometry}
        userData={{ footprint: true }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <meshStandardMaterial
          color={active ? theme.colors.accent : theme.colors.textDark}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
  if (!active || !onChange) {
    return mesh;
  }
  // Keep the attachment stable and save one edit when the gesture ends.
  return (
    <>
      {mesh}
      <TransformControls
        object={object}
        mode={mode}
        onMouseDown={() => {
          changed.current = false;
        }}
        onObjectChange={() => {
          changed.current = true;
        }}
        onMouseUp={() => {
          if (!changed.current || !object.current) {
            return;
          }
          changed.current = false;
          const rotation = new Euler().setFromQuaternion(
            object.current.quaternion,
            'ZYX'
          );
          onChange({
            ...model,
            offset: object.current.position.toArray() as Vec3,
            scale: object.current.scale.toArray() as Vec3,
            rotate: [rotation.x, rotation.y, rotation.z].map(
              (value) => (-value * 180) / Math.PI
            ) as Vec3,
          });
        }}
      />
    </>
  );
}

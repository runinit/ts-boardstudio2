import type { StepModel } from '@boardstudio/v2-cad';
import {
  BufferGeometry,
  Color,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  type Material,
  type Object3D,
} from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { VRMLLoader } from 'three/addons/loaders/VRMLLoader.js';

export type ModelMesh = StepModel['mesh'] & { colors?: Float32Array };
const KICAD_VRML_UNIT_MM = 2.54;

/** Static mesh formats never fetch external resources or execute embedded content. */
export function readMeshModel(bytes: Uint8Array, filename: string): ModelMesh {
  if (!bytes.length || bytes.length > 32 * 1024 * 1024)
    throw new Error('Model must be between 1 byte and 32 MiB');
  let root: Object3D;
  if (/\.stl$/i.test(filename)) {
    const geometry = new STLLoader().parse(bytes.slice().buffer);
    root = new Mesh(geometry, new MeshStandardMaterial({ color: '#b8bec7' }));
  } else if (/\.wrl$/i.test(filename)) {
    const source = new TextDecoder().decode(bytes);
    if (/\b(?:Inline|ImageTexture|MovieTexture|Script)\s*\{/u.test(source))
      throw new Error(
        'WRL preview supports self-contained static geometry and materials; external resources are unsupported',
      );
    const manager = new LoadingManager();
    manager.setURLModifier(() => {
      throw new Error('External WRL resources are unsupported');
    });
    root = new VRMLLoader(manager).parse(source, '');
    root.scale.multiplyScalar(KICAD_VRML_UNIT_MM);
  } else throw new Error('Choose a STEP, STL, or WRL model');
  root.updateMatrixWorld(true);
  const positions: number[] = [],
    normals: number[] = [],
    colors: number[] = [];
  const geometries = new Set<BufferGeometry>(),
    materials = new Set<Material>();
  try {
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      const list = Array.isArray(object.material)
        ? object.material
        : [object.material];
      list.forEach((material) => materials.add(material));
      const geometry = object.geometry.index
        ? object.geometry.toNonIndexed()
        : object.geometry.clone();
      try {
        geometry.applyMatrix4(object.matrixWorld);
        if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
        const p = geometry.getAttribute('position'),
          n = geometry.getAttribute('normal'),
          c = geometry.getAttribute('color');
        if (!p || p.count % 3 || positions.length + p.count * 3 > 18_000_000)
          throw new Error('Model exceeds preview triangle limits');
        for (let i = 0; i < p.count; i++) {
          positions.push(p.getX(i), p.getY(i), p.getZ(i));
          normals.push(n.getX(i), n.getY(i), n.getZ(i));
          const group = geometry.groups.find(
            (entry: { start: number; count: number; materialIndex?: number }) =>
              i >= entry.start && i < entry.start + entry.count,
          );
          const material = list[group?.materialIndex ?? 0] as Material & {
            color?: Color;
          };
          const color = material?.color ?? new Color('#b8bec7');
          colors.push(
            c ? c.getX(i) : color.r,
            c ? c.getY(i) : color.g,
            c ? c.getZ(i) : color.b,
          );
        }
      } finally {
        geometry.dispose();
      }
    });
    if (
      !positions.length ||
      [...positions, ...normals].some((n) => !Number.isFinite(n))
    )
      throw new Error('Model has no finite triangles');
    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      colors: new Float32Array(colors),
    };
  } finally {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  }
}

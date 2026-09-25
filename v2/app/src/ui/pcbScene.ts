import * as THREE from 'three';
import type { PcbPreview, PcbModel, Vec2 } from '@boardstudio/v2-contracts';
import type { ModelMesh } from '../modelMesh';

export function pcbModelMatrix(
  model: PcbModel,
  thickness: number,
): THREE.Matrix4 {
  const r = Math.PI / 180;
  const result = new THREE.Matrix4()
    .makeTranslation(
      model.pose.at.x,
      model.pose.at.y,
      model.side === 'front' ? thickness : 0,
    )
    .multiply(new THREE.Matrix4().makeRotationZ(model.pose.rotation * r));
  if (model.side === 'back')
    result
      .multiply(new THREE.Matrix4().makeRotationY(Math.PI))
      .multiply(new THREE.Matrix4().makeRotationZ(Math.PI));
  return result
    .multiply(
      new THREE.Matrix4().makeTranslation(
        model.offset.x,
        model.offset.y,
        model.offset.z,
      ),
    )
    .multiply(
      new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(
          -model.rotation.x * r,
          -model.rotation.y * r,
          -model.rotation.z * r,
          'ZYX',
        ),
      ),
    )
    .multiply(
      new THREE.Matrix4().makeScale(
        model.scale.x,
        model.scale.y,
        model.scale.z,
      ),
    );
}
function inside(p: Vec2, polygon: Vec2[]): boolean {
  let result = false;
  polygon.forEach((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    )
      result = !result;
  });
  return result;
}
const path = (points: Vec2[]) =>
  new THREE.Path(points.map((p) => new THREE.Vector2(p.x, p.y)));

export function boardShapes(board: PcbPreview): THREE.Shape[] {
  return board.contours
    .filter((c) => !c.hole)
    .map((outer) => {
      const shape = new THREE.Shape(
        outer.points.map((p) => new THREE.Vector2(p.x, p.y)),
      );
      shape.holes = [
        ...board.contours.filter((c) => c.hole).map((c) => c.points),
        ...board.holes,
      ]
        .filter((p) => p.length && inside(p[0], outer.points))
        .map(path);
      return shape;
    });
}

export function boardObject(
  board: PcbPreview,
  hidden: ReadonlySet<string>,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'PCB';
  const shapes = boardShapes(board);
  const all = board.contours.flatMap((c) => c.points);
  const minX = Math.min(...all.map((p) => p.x)),
    maxX = Math.max(...all.map((p) => p.x)),
    minY = Math.min(...all.map((p) => p.y)),
    maxY = Math.max(...all.map((p) => p.y));
  const width = Math.max(maxX - minX, 0.01),
    height = Math.max(maxY - minY, 0.01);
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: board.thickness,
    bevelEnabled: false,
    curveSegments: 32,
  });
  const substrate = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: '#927b40', roughness: 0.8 }),
  );
  group.add(substrate);
  for (const back of [false, true]) {
    const canvas = document.createElement('canvas');
    const density = Math.min(24, 4096 / Math.max(width, height));
    canvas.width = Math.max(1, Math.ceil(width * density));
    canvas.height = Math.max(1, Math.ceil(height * density));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('PCB surface canvas unavailable');
    ctx.fillStyle = '#226345';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(
      canvas.width / width,
      0,
      0,
      -canvas.height / height,
      (-minX * canvas.width) / width,
      (maxY * canvas.height) / height,
    );
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const prefix = back ? 'B.' : 'F.';
    const surfaces = board.surfaces
      .filter((s) => s.layer.startsWith(prefix))
      .sort((a, b) => rank(a.layer) - rank(b.layer));
    for (const surface of surfaces) {
      const copper = surface.layer.endsWith('.Cu'),
        mask = surface.layer.endsWith('.Mask'),
        silk = surface.layer.endsWith('.SilkS');
      if (
        (!copper && !mask && !silk) ||
        ((copper || mask) && hidden.has('Copper')) ||
        (silk && hidden.has('Silkscreen'))
      )
        continue;
      ctx.fillStyle = ctx.strokeStyle = silk
        ? '#f4f1dc'
        : mask
          ? '#cfb87b'
          : '#184b34';
      ctx.lineWidth = Math.max(surface.width, 0.02);
      if (surface.text) {
        ctx.save();
        ctx.translate(surface.points[0].x, surface.points[0].y);
        ctx.rotate((surface.rotation * Math.PI) / 180);
        ctx.scale(back ? -1 : 1, -1);
        ctx.font = `${surface.textSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(surface.text, 0, 0);
        ctx.restore();
      } else if (surface.points.length) {
        ctx.beginPath();
        surface.points.forEach((p, i) =>
          i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
        );
        if (surface.filled) {
          ctx.closePath();
          ctx.fill('evenodd');
        } else ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const face = new THREE.ShapeGeometry(shapes, 32);
    const positions = face.getAttribute('position');
    const uv = face.getAttribute('uv');
    for (let i = 0; i < positions.count; i++)
      uv.setXY(
        i,
        (positions.getX(i) - minX) / width,
        (positions.getY(i) - minY) / height,
      );
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      roughness: 0.62,
      metalness: 0.12,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(face, material);
    mesh.position.z = back ? -0.002 : board.thickness + 0.002;
    group.add(mesh);
  }
  group.visible = !hidden.has('PCB');
  return group;
}
function rank(layer: string) {
  return layer.endsWith('.Cu') ? 0 : layer.endsWith('.Mask') ? 1 : 2;
}
export function meshGeometry(mesh: ModelMesh): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(mesh.positions, 3),
  );
  geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
  if (mesh.colors)
    geometry.setAttribute('color', new THREE.BufferAttribute(mesh.colors, 3));
  return geometry;
}
export function disposeScene(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      for (const m of Array.isArray(object.material)
        ? object.material
        : [object.material])
        materials.add(m);
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => {
    (m as THREE.MeshStandardMaterial).map?.dispose();
    m.dispose();
  });
}

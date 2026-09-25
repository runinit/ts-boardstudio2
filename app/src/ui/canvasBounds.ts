import type { Matrix, Part, PartDefinition, SceneDelta, Vec2 } from '../../../contracts/src/index';
import { selectionOutline } from './selectionOutline';
import type { MatrixProjection } from './matrixGeometry';

export const getBounds = (poses: Map<string, Part['pose']>, visibleParts: Part[], visibleContours: SceneDelta['contours'], matrices: Matrix[], matrixScenes: Map<string, MatrixProjection>, definitions: Map<string, PartDefinition> = new Map(), keycaps: Map<string, Vec2> = new Map()) => {
  const all = [...visibleContours.flatMap((contour) => contour.points)];
  for (const part of visibleParts) {
    const pose = poses.get(part.id) ?? part.pose;
    const resolved = { ...part, pose, keycap: keycaps.get(part.id) ?? part.keycap };
    all.push(pose.at, ...selectionOutline([resolved], definitions));
  }
  const liveParts = new Set(visibleParts.map((part) => part.id));
  for (const matrix of matrices) {
    const projection = matrixScenes.get(matrix.id);
    const size = { x: matrix.pitch.x / 2, y: matrix.pitch.y / 2 };
    for (const cell of projection?.scene?.cells ?? []) {
      if (!cell.enabled || (cell.memberId && liveParts.has(cell.memberId))) continue;
      const angle = cell.pose.rotation * Math.PI / 180;
      for (const x of [-size.x, size.x]) for (const y of [-size.y, size.y]) {
        all.push({ x: cell.pose.at.x + x * Math.cos(angle) - y * Math.sin(angle), y: cell.pose.at.y + x * Math.sin(angle) + y * Math.cos(angle) });
      }
    }
  }
  if (!all.length) all.push({ x: -35, y: -25 }, { x: 35, y: 25 });
  const minX = Math.min(...all.map((point) => point.x)) - 12;
  const maxX = Math.max(...all.map((point) => point.x)) + 12;
  const minY = Math.min(...all.map((point) => point.y)) - 12;
  const maxY = Math.max(...all.map((point) => point.y)) + 12;
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
};

export const cameraBounds = (bounds: ReturnType<typeof getBounds>, zoom: number, pan: Vec2) => {
  const width = bounds.width / zoom;
  const height = bounds.height / zoom;
  const centerX = (bounds.minX + bounds.maxX) / 2 + pan.x;
  const centerY = (bounds.minY + bounds.maxY) / 2 + pan.y;
  return {
    minX: centerX - width / 2,
    maxX: centerX + width / 2,
    minY: centerY - height / 2,
    maxY: centerY + height / 2,
    width,
    height,
  };
};


/** Expand the viewBox to the SVG aspect ratio so pointer and camera coordinates agree. */
export function aspectBounds(bounds: ReturnType<typeof getBounds>, width: number, height: number) {
  const ratio = Math.max(1, width) / Math.max(1, height);
  const nextWidth = Math.max(bounds.width, bounds.height * ratio);
  const nextHeight = Math.max(bounds.height, bounds.width / ratio);
  const x = (bounds.minX + bounds.maxX) / 2, y = (bounds.minY + bounds.maxY) / 2;
  return { minX: x - nextWidth / 2, maxX: x + nextWidth / 2, minY: y - nextHeight / 2, maxY: y + nextHeight / 2, width: nextWidth, height: nextHeight };
}

export function fitCamera(base: ReturnType<typeof getBounds>, target: ReturnType<typeof getBounds>, width: number, height: number, top = 64, bottom = 170) {
  const usableWidth = Math.max(1, width - 32), usableHeight = Math.max(1, height - top - bottom);
  const zoom = Math.max(0.01, Math.min(base.width / target.width * usableWidth / Math.max(1, width), base.height / target.height * usableHeight / Math.max(1, height)));
  return { zoom, pan: { x: (target.minX + target.maxX - base.minX - base.maxX) / 2,
    y: (target.minY + target.maxY - base.minY - base.maxY) / 2 + (top - bottom) / 2 * base.height / zoom / Math.max(1, height) } };
}

import { Path, Shape, ShapeGeometry } from 'three';
import type { FootprintInfo } from '../types/footprint';
type Pad = FootprintInfo['pads'][number];
const STEPS = 16;
const CORNERS = ['bottom_right', 'bottom_left', 'top_left', 'top_right'];

function roundedOutline(size: number[], radius: number, pad?: Pad): number[][] {
  const [w, h] = size.map((value) => value / 2);
  return [
    [w - radius, h - radius],
    [-w + radius, h - radius],
    [-w + radius, -h + radius],
    [w - radius, -h + radius],
  ].flatMap(([x, y], corner) => {
    if (pad?.chamfer?.includes(CORNERS[corner])) {
      const cut = Math.min(...size) * (pad.chamferRatio || 0);
      const sx = corner === 0 || corner === 3 ? 1 : -1;
      const sy = corner < 2 ? 1 : -1;
      const points = [
        [sx * w, sy * (h - cut)],
        [sx * (w - cut), sy * h],
      ];
      return corner % 2 ? points.reverse() : points;
    }
    return Array.from({ length: STEPS + 1 }, (_, i) => {
      const angle = (corner * Math.PI) / 2 + (i * Math.PI) / (STEPS * 2);
      return [x + radius * Math.cos(angle), y + radius * Math.sin(angle)];
    });
  });
}

export function padOutline(pad: Pad): number[][] {
  switch (pad.shape) {
    case 'custom':
      return pad.polygons?.[0] || [];
    case 'circle':
    case 'oval':
      return roundedOutline(pad.size, Math.min(...pad.size) / 2);
    case 'roundrect':
      return roundedOutline(
        pad.size,
        Math.min(...pad.size) * (pad.roundrect || 0),
        pad
      );
    case 'rect':
      return roundedOutline(pad.size, 0, pad);
    default:
      return [];
  }
}

export function padContours(pad: Pad): number[][][] {
  if (pad.unsupportedGeometry?.length) return [];
  if (pad.shape === 'custom') {
    if (!pad.polygons?.length) return [];
    const anchor = padOutline({ ...pad, shape: pad.anchor || 'circle' });
    return [
      ...pad.polygons,
      anchor,
      ...pad.polygons.flatMap((polygon, index) => {
        const width = pad.polygonWidths?.[index] || 0;
        return width > 0
          ? polygon.map((point, i) =>
              strokeOutline(point, polygon[(i + 1) % polygon.length], width)
            )
          : [];
      }),
    ];
  }
  const outline = padOutline(pad);
  return outline.length ? [outline] : [];
}

export function drillOutline(pad: Pad): number[][] {
  if (!pad.drillSize?.length) return [];
  const offset = pad.drillOffset || [0, 0];
  return roundedOutline(pad.drillSize, Math.min(...pad.drillSize) / 2).map(
    ([x, y]) => [x + offset[0], y + offset[1]]
  );
}

export function padHasCopper(pad: Pad, side: 'F' | 'B'): boolean {
  return (
    pad.type !== 'np_thru_hole' &&
    pad.layers.some((layer) => [side + '.Cu', '*.Cu', 'F&B.Cu'].includes(layer))
  );
}

export function outlinePath(points: number[][]): string {
  return points.length
    ? `M ${points.map((point) => point.join(' ')).join(' L ')} Z`
    : '';
}

export function padShapeGeometry(pad: Pad): ShapeGeometry {
  const shapes = padContours(pad).map((outline) => {
    const shape = new Shape();
    outline.forEach(([x, y], index) =>
      index ? shape.lineTo(x, -y) : shape.moveTo(x, -y)
    );
    shape.closePath();
    const hole = drillOutline(pad);
    if (hole.length) {
      const path = new Path();
      hole.forEach(([x, y], index) =>
        index ? path.lineTo(x, -y) : path.moveTo(x, -y)
      );
      path.closePath();
      shape.holes.push(path);
    }
    return shape;
  });
  return new ShapeGeometry(shapes);
}

export function strokeOutline(
  start: number[],
  end: number[],
  width: number
): number[][] {
  const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  return roundedOutline([length + width, width], width / 2).map(([x, y]) => [
    (start[0] + end[0]) / 2 + x * Math.cos(angle) - y * Math.sin(angle),
    (start[1] + end[1]) / 2 + x * Math.sin(angle) + y * Math.cos(angle),
  ]);
}

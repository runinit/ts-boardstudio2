import type { Contour, Vec2 } from '@boardstudio/v2-contracts';

function valid(contours: Contour[]): void {
  if (contours.length === 0) {
    throw new Error('No resolved outline');
  }

  for (const contour of contours) {
    if (contour.points.length < 3 || contour.points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
      throw new Error('Invalid resolved contour');
    }
  }
}

function bounds(contours: Contour[]): { min: Vec2; max: Vec2 } {
  const points = contours.flatMap((contour) => contour.points);

  return {
    min: { x: Math.min(...points.map((point) => point.x)), y: Math.min(...points.map((point) => point.y)) },
    max: { x: Math.max(...points.map((point) => point.x)), y: Math.max(...points.map((point) => point.y)) },
  };
}

export function outlineSvg(contours: Contour[]): string {
  valid(contours);
  const { min, max } = bounds(contours);
  const path = contours.map((contour) => {
    const [first, ...rest] = contour.points;
    return `M ${first.x} ${-first.y} ${rest.map((point) => `L ${point.x} ${-point.y}`).join(' ')} Z`;
  }).join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${max.x - min.x}mm" height="${max.y - min.y}mm" viewBox="${min.x} ${-max.y} ${max.x - min.x} ${max.y - min.y}"><path d="${path}" fill="none" stroke="#111" stroke-width="0.1" fill-rule="evenodd"/></svg>\n`;
}

export function outlineDxf(contours: Contour[]): string {
  valid(contours);
  const rows = ['0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1015', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'];

  for (const contour of contours) {
    rows.push('0', 'LWPOLYLINE', '8', contour.hole ? 'HOLE' : 'OUTLINE', '90', String(contour.points.length), '70', '1');

    for (const point of contour.points) {
      rows.push('10', String(point.x), '20', String(point.y));
    }
  }

  rows.push('0', 'ENDSEC', '0', 'EOF');
  return `${rows.join('\n')}\n`;
}

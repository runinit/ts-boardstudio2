import type { Part, PartDefinition, Vec2 } from '../../../contracts/src/index';

// A group selection surrounds its transformed members, including their spacing.
export function selectionOutline(parts: Part[], definitions: Map<string, PartDefinition>): Vec2[] {
  const points = parts.flatMap((part) => {
    const definition = definitions.get(part.definitionId);
    const cap = definition?.kind === 'switch' ? part.keycap ?? definition.keycap : undefined;
    const corners = cap ? [{ x: -cap.x / 2, y: -cap.y / 2 }, { x: cap.x / 2, y: -cap.y / 2 }, { x: cap.x / 2, y: cap.y / 2 }, { x: -cap.x / 2, y: cap.y / 2 }] : definition?.courtyard ?? [];
    const angle = part.pose.rotation * Math.PI / 180;
    return corners.map((point) => ({ x: part.pose.at.x + point.x * Math.cos(angle) - point.y * Math.sin(angle), y: part.pose.at.y + point.x * Math.sin(angle) + point.y * Math.cos(angle) }));
  }).sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (a: Vec2, b: Vec2, c: Vec2) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const half = (ordered: Vec2[]) => {
    const result: Vec2[] = [];
    for (const point of ordered) {
      while (result.length >= 2 && cross(result[result.length - 2], result[result.length - 1], point) <= 0) result.pop();
      result.push(point);
    }
    return result.slice(0, -1);
  };
  return [...half(points), ...half([...points].reverse())];
}

import type { Matrix, MatrixCell, Part, Pose2, Vec2 } from '../../../contracts/src/index';

export const matrixCellId = (matrixId: string, row: number, column: number): string => `matrix/${matrixId}/r${row}c${column}`;

// Early projects used an ordered list of switch IDs; generated projects encode cells in IDs.
export function matrixMembers(matrix: Matrix): Map<string, string> {
  const result = new Map<string, string>();
  const prefix = `matrix/${matrix.id}/r`;
  const ids = new Set(matrix.partIds);
  const legacy = matrix.partIds.filter((id) => !id.startsWith(prefix) && !(id.includes('/') && ids.has(id.slice(0, id.lastIndexOf('/')))));
  let index = 0;
  const cells = new Map((matrix.cells ?? []).map((cell) => [`${cell.row}:${cell.column}`, cell]));
  for (let row = 0; row < matrix.rows; row++) {
    for (let column = 0; column < matrix.columns; column++) {
      const key = `${row}:${column}`;
      if (cells.get(key)?.enabled === false) continue;
      const canonical = matrixCellId(matrix.id, row, column);
      result.set(key, ids.has(canonical) ? canonical : legacy[index++] ?? canonical);
    }
  }
  return result;
}

export function matrixPosition(matrix: Matrix, row: number, column: number, cell?: MatrixCell): Vec2 {
  let x = column * matrix.pitch.x + (matrix.columnOffsets?.[column]?.x ?? 0) + (matrix.rowOffsets?.[row]?.x ?? 0) + (cell?.offset?.x ?? 0);
  let y = row * matrix.pitch.y + (matrix.columnOffsets?.[column]?.y ?? 0) + (matrix.rowOffsets?.[row]?.y ?? 0) + (cell?.offset?.y ?? 0);
  if (matrix.mirror === 'x') x *= -1;
  if (matrix.mirror === 'y') y *= -1;
  const angle = (matrix.rotation ?? 0) * Math.PI / 180;
  return { x: matrix.origin.x + x * Math.cos(angle) - y * Math.sin(angle), y: matrix.origin.y + x * Math.sin(angle) + y * Math.cos(angle) };
}

export function cellPose(matrix: Matrix, row: number, column: number, cell: MatrixCell | undefined, members: Map<string, string>, parts: Map<string, Part>): Pose2 {
  const part = parts.get(members.get(`${row}:${column}`) ?? '');
  if (part) return part.pose;
  const at = matrixPosition(matrix, row, column, cell);
  // Old row-major projects can have opposite row direction in saved metadata.
  // Interpolate their residual frame; generated slots use their parametric position.
  const rows = new Map<number, { distance: number; x: number; y: number }>();
  for (const [key, id] of members) {
    if (id.startsWith(`matrix/${matrix.id}/`)) continue;
    const member = parts.get(id);
    if (!member) continue;
    const [r, c] = key.split(':').map(Number);
    const distance = Math.abs(c - column);
    if (distance >= (rows.get(r)?.distance ?? Infinity)) continue;
    const expected = matrixPosition(matrix, r, c, matrix.cells?.find((entry) => entry.row === r && entry.column === c));
    rows.set(r, { distance, x: member.pose.at.x - expected.x, y: member.pose.at.y - expected.y });
  }
  const nearest = [...rows.keys()].sort((a, b) => Math.abs(a - row) - Math.abs(b - row));
  let residual = rows.get(nearest[0]) ?? { x: 0, y: 0 };
  if (nearest.length > 1 && nearest[0] !== row) {
    const other = rows.get(nearest[1])!;
    const t = (row - nearest[0]) / (nearest[1] - nearest[0]);
    residual = { x: residual.x + t * (other.x - residual.x), y: residual.y + t * (other.y - residual.y) };
  }
  return { at: { x: at.x + residual.x, y: at.y + residual.y }, rotation: (matrix.rotation ?? 0) + (cell?.rotation ?? 0) };
}

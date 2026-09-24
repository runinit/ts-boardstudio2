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
  y += (matrix.columnStaggers ?? []).slice(0, column + 1).reduce((sum, value) => sum + value, 0);
  // Apply later rotations first: earlier splays carry their subsequent pivots too.
  for (let index = Math.min(column, (matrix.columnSplays?.length ?? 0) - 1); index >= 0; index--) {
    const angle = matrix.columnSplays![index] * Math.PI / 180;
    if (!angle) continue;
    const { x: pivotX, y: pivotY } = splayOrigin(matrix, index);
    const dx = x - pivotX;
    const dy = y - pivotY;
    x = pivotX + dx * Math.cos(angle) - dy * Math.sin(angle);
    y = pivotY + dx * Math.sin(angle) + dy * Math.cos(angle);
  }
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
  return { at: { x: at.x + residual.x, y: at.y + residual.y }, rotation: (matrix.rotation ?? 0) + (matrix.mirror === 'x' || matrix.mirror === 'y' ? -1 : 1) * (matrix.columnSplays ?? []).slice(0, column + 1).reduce((sum, angle) => sum + angle, 0) + (cell?.rotation ?? 0) };
}

const rotatePoint = (point: Vec2, degrees: number, pivot: Vec2 = { x: 0, y: 0 }): Vec2 => {
  const angle = degrees * Math.PI / 180;
  const x = point.x - pivot.x;
  const y = point.y - pivot.y;
  return { x: pivot.x + x * Math.cos(angle) - y * Math.sin(angle), y: pivot.y + x * Math.sin(angle) + y * Math.cos(angle) };
};

function splayOrigin(matrix: Matrix, column: number): Vec2 {
  return matrix.columnOrigins?.[column] ?? { x: column * matrix.pitch.x, y: (matrix.columnStaggers ?? []).slice(0, column + 1).reduce((sum, value) => sum + value, 0) };
}

export function splayOriginWorld(matrix: Matrix, column: number): Vec2 {
  let point = splayOrigin(matrix, column);
  for (let index = column - 1; index >= 0; index--) point = rotatePoint(point, matrix.columnSplays?.[index] ?? 0, splayOrigin(matrix, index));
  if (matrix.mirror === 'x') point = { ...point, x: -point.x };
  if (matrix.mirror === 'y') point = { ...point, y: -point.y };
  point = rotatePoint(point, matrix.rotation ?? 0);
  return { x: point.x + matrix.origin.x, y: point.y + matrix.origin.y };
}

function matrixVector(matrix: Matrix, column: number, world: Vec2): Vec2 {
  let point = rotatePoint(world, -(matrix.rotation ?? 0));
  if (matrix.mirror === 'x') point.x *= -1;
  if (matrix.mirror === 'y') point.y *= -1;
  return rotatePoint(point, -(matrix.columnSplays ?? []).slice(0, column + 1).reduce((sum, value) => sum + value, 0));
}

function preserveColumns(before: Matrix, after: Matrix, columns: number[]): Matrix {
  const offsets = Array.from({ length: after.columns }, (_, index) => after.columnOffsets?.[index] ?? { x: 0, y: 0 });
  for (const column of columns) {
    const previous = matrixPosition(before, 0, column);
    const next = matrixPosition(after, 0, column);
    const delta = matrixVector(after, column, { x: previous.x - next.x, y: previous.y - next.y });
    offsets[column] = { x: offsets[column].x + delta.x, y: offsets[column].y + delta.y };
  }
  return { ...after, columnOffsets: offsets };
}

export function withSplayOrigin(matrix: Matrix, column: number, world: Vec2 | null): Matrix {
  let point = world ? rotatePoint({ x: world.x - matrix.origin.x, y: world.y - matrix.origin.y }, -(matrix.rotation ?? 0)) : null;
  if (point) {
    if (matrix.mirror === 'x') point.x *= -1;
    if (matrix.mirror === 'y') point.y *= -1;
    for (let index = 0; index < column; index++) point = rotatePoint(point, -(matrix.columnSplays?.[index] ?? 0), splayOrigin(matrix, index));
  }
  const columnOrigins = Array.from({ length: matrix.columns }, (_, index) => matrix.columnOrigins?.[index] ?? null);
  columnOrigins[column] = point;
  return preserveColumns(matrix, { ...matrix, columnOrigins }, Array.from({ length: matrix.columns - column }, (_, index) => index + column));
}

export function withSplayAngle(matrix: Matrix, column: number, angle: number, affect: 'column' | 'following'): Matrix {
  const columnSplays = Array.from({ length: matrix.columns }, (_, index) => matrix.columnSplays?.[index] ?? 0);
  const delta = angle - columnSplays[column];
  columnSplays[column] = angle;
  if (affect === 'following' || column === matrix.columns - 1) return { ...matrix, columnSplays };
  columnSplays[column + 1] -= delta;
  return preserveColumns(matrix, { ...matrix, columnSplays }, Array.from({ length: matrix.columns - column - 1 }, (_, index) => index + column + 1));
}

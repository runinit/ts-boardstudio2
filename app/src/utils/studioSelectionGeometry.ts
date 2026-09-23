import type { LayoutReport, ResolvedObject } from 'ergogen/src/native';
import type { StudioSelection } from './studioTargets';
import { includesObject } from './studioTargets';
import { layoutPolygon } from './layoutDrawing';

interface SelectionOutline {
  ids: string[];
  members: number;
  keys: number;
  min: { x: number; y: number };
  max: { x: number; y: number };
  center: { x: number; y: number };
  width: number;
  height: number;
  axis: 'x' | 'y' | null;
  annotation: string | null;
}

function format(value: number): string {
  return String(Number(value.toFixed(2)));
}

// Rows and columns are explicit one-dimensional runs; a multi-object selection
// is a run only when all its keys share the same row or the same column.
function runAxis(
  selection: StudioSelection,
  keys: ResolvedObject[]
): 'x' | 'y' | null {
  if (selection.section === 'rows') {
    return 'x';
  }
  if (selection.section === 'columns') {
    return 'y';
  }
  const cells = keys.filter((item) => item.cell);
  if (cells.length >= 2) {
    const rows = new Set(cells.map((item) => item.cell![1]));
    const columns = new Set(cells.map((item) => item.cell![0]));
    if (rows.size === 1) {
      return 'x';
    }
    if (columns.size === 1) {
      return 'y';
    }
  }
  return null;
}

// Compute the selection boundary from the resolved polygons, so rotated keys
// bound by their transformed matrix rather than their unrotated axis frame.
export function describeSelection(
  report: LayoutReport,
  selection: StudioSelection,
  side: 'top' | 'side',
  pitch: Record<string, number>
): SelectionOutline | null {
  const selected = Object.values(report.objects || {}).filter(
    (item) => item.kind !== 'anchor' && includesObject(selection, item)
  );
  const points = selected.flatMap((item) =>
    layoutPolygon(item, side)
      .split(' ')
      .filter(Boolean)
      .map((pair) => pair.split(',').map(Number))
  );
  if (!points.length) {
    return null;
  }
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const min = { x: Math.min(...xs), y: Math.min(...ys) };
  const max = { x: Math.max(...xs), y: Math.max(...ys) };
  const width = max.x - min.x;
  const height = max.y - min.y;
  const keys = selected.filter((item) => item.kind === 'key');
  const axis = runAxis(selection, keys);
  let annotation: string | null = null;
  if (side === 'top' && axis && keys.length >= 2) {
    const pitchValue = axis === 'x' ? pitch.u : pitch.v;
    const span = axis === 'x' ? width : height;
    annotation = `pitch: ${format(pitchValue)}mm × ${keys.length} keys (${format(span)}mm span)`;
  }
  return {
    ids: selected.map((item) => item.id),
    members: selected.length,
    keys: keys.length,
    min,
    max,
    center: { x: (min.x + max.x) / 2, y: (min.y + max.y) / 2 },
    width,
    height,
    axis,
    annotation,
  };
}

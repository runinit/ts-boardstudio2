import type { LayoutReport } from 'ergogen/src/native';
import type { StudioSelection } from './studioTargets';

// Use the frame edited by the command, including a key's column splay.
export function snapFrame(report: LayoutReport, selection: StudioSelection) {
  const frame =
    selection.section === 'columns'
      ? report.clusters[selection.cluster || '']
      : selection.section === 'clusters'
        ? report.clusters[selection.id]
        : report.objects[selection.id];
  return {
    matrix: selection.section === 'columns' ? frame?.matrix : frame?.editMatrix,
    origin: selection.section === 'clusters' ? frame?.position : undefined,
  };
}

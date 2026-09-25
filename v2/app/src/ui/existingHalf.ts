import type { Matrix, ProjectDoc } from '../../../contracts/src/index';

export function mirrorExistingHalf(document: ProjectDoc, matrices: Matrix[], axisX: number, makeId: () => string): ProjectDoc {
  if (!matrices.length || !Number.isFinite(axisX)) throw new Error('Select a layout and a finite mirror axis.');
  const layouts = [...(document.layouts ?? [])];
  const nextMatrices = [...document.matrices];
  for (const matrix of matrices) {
    if (!matrix.boardId) throw new Error('The layout must belong to a board.');
    const existing = layouts.find((layout) => layout.matrixId === matrix.id);
    if (existing && (existing.mirrorLink || layouts.some((layout) => layout.mirrorLink?.sourceId === existing.id))) throw new Error('This layout already belongs to a linked pair.');
    if (document.constraints.some((constraint) => matrix.partIds.includes(constraint.targetPartId))) throw new Error('Remove key placement constraints before linking this layout.');
    if (matrix.mirror === 'y') throw new Error('Y-mirrored layouts cannot be linked. Use an independent layout or an X-mirrored source.');
    const source = matrix;
    const left = existing ?? { id: makeId(), name: matrix.name || 'Original half', boardId: matrix.boardId, matrixId: matrix.id, partIds: [] };
    if (!existing) layouts.push(left);
    const target = { ...source, id: makeId(), name: `${left.name} · mirrored`, partIds: [], cells: source.cells?.map((cell) => ({ ...cell, assemblies: cell.assemblies?.map((assembly) => ({ ...assembly, offset: { ...assembly.offset, x: -assembly.offset.x }, rotation: assembly.rotation === undefined ? undefined : -assembly.rotation })) })) };
    nextMatrices.push(target);
    layouts.push({ id: makeId(), name: target.name, boardId: matrix.boardId, matrixId: target.id, partIds: [], mirrorLink: { sourceId: left.id, axisX } });
  }
  return { ...document, matrices: nextMatrices, layouts };
}

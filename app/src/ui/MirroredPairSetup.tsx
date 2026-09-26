import { useState } from 'react';
import type { Layout, Matrix, Vec2 } from '../../../contracts/src/index';
import './mirrored-layouts.css';

export type PairSetup = { leftName: string; rightName: string; rows: number; columns: number; gap: number; preset: string };
export type PairPlacement = PairSetup & { leftId: string; rightId: string; rightMatrixId: string };

export function pairAt(matrix: Matrix, placement: PairPlacement, center: Vec2): { matrix: Matrix; left: Layout; right: Layout; preview: Matrix } {
  const inset = (placement.gap + matrix.pitch.x - (matrix.edgeGap?.x ?? 1)) / 2;
  const left: Layout = { id: placement.leftId, name: placement.leftName, boardId: matrix.boardId!, matrixId: matrix.id, partIds: [] };
  const right: Layout = { id: placement.rightId, name: placement.rightName, boardId: matrix.boardId!, matrixId: placement.rightMatrixId, partIds: [], mirrorLink: { sourceId: left.id, axisX: center.x } };
  const placed: Matrix = { ...matrix, name: left.name, mirror: 'x', origin: { x: center.x - inset, y: center.y } };
  return { matrix: placed, left, right, preview: { ...placed, id: right.matrixId, name: right.name, mirror: 'none', origin: { x: center.x + inset, y: center.y } } };
}

export function MirroredPairSetup({ presets, onPreview, onCancel }: {
  presets: { id: string; name: string }[];
  onPreview: (setup: PairSetup) => void;
  onCancel: () => void;
}) {
  const [leftName, setLeftName] = useState('Left half');
  const [rightName, setRightName] = useState('Right half');
  const [rows, setRows] = useState('3');
  const [columns, setColumns] = useState('5');
  const [gap, setGap] = useState('24');
  const [preset, setPreset] = useState(presets[0].id);
  const valid = Boolean(leftName.trim() && rightName.trim() && leftName.trim() !== rightName.trim()
    && Number.isInteger(Number(rows)) && Number(rows) > 0 && Number.isInteger(Number(columns)) && Number(columns) > 0
    && Number(rows) * Number(columns) <= 4096 && gap.trim() && Number.isFinite(Number(gap)) && Number(gap) >= 0);
  return <form className="wb-pair-setup" aria-label="New mirrored pair" onSubmit={(event) => {
    event.preventDefault();
    if (valid) onPreview({ leftName: leftName.trim(), rightName: rightName.trim(), rows: Number(rows), columns: Number(columns), gap: Number(gap), preset });
  }}>
    <h2>Mirrored pair</h2>
    <p>Linked key assemblies, diode settings and components. Substitute a component on either half when needed.</p>
    <div className="wb-pair-fields">
      <label>Left layout<input autoFocus required aria-label="Left layout name" value={leftName} onChange={(event) => setLeftName(event.target.value)} /></label>
      <label>Right layout<input required aria-label="Right layout name" value={rightName} onChange={(event) => setRightName(event.target.value)} /></label>
      <label>Rows per half<input type="number" min="1" max="4096" required value={rows} onChange={(event) => setRows(event.target.value)} /></label>
      <label>Columns per half<input type="number" min="1" max="4096" required value={columns} onChange={(event) => setColumns(event.target.value)} /></label>
    </div>
    <label>Key assembly<select value={preset} onChange={(event) => setPreset(event.target.value)}>{presets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label>Gap between key edges (mm)<input type="number" min="0" step="any" required value={gap} onChange={(event) => setGap(event.target.value)} /></label>
    <p className="wb-pair-policy">Edit either half to update both. Unlink in the inspector for independent geometry.</p>
    <div className="wb-pair-actions"><button type="button" className="wb-secondary" onClick={onCancel}>Cancel</button><button className="wb-primary" type="submit" disabled={!valid}>Preview placement</button></div>
  </form>;
}

export function MirrorPairIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2v3m0 3v4m0 3v3M2 5h5v10H2zM13 5h5v10h-5zM2 10h5m6 0h5" /></svg>;
}

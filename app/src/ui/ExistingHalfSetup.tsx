import { useState } from 'react';
import type { Matrix } from '../../../contracts/src/index';
export function ExistingHalfSetup({ matrices, axis, onCreate, onCancel }: { matrices: Matrix[]; axis: number; onCreate: (matrices: Matrix[], axis: number) => string | undefined; onCancel: () => void }) {
  const [choice, setChoice] = useState('all');
  const [coordinate, setCoordinate] = useState(String(Math.round(axis * 100) / 100));
  const [error, setError] = useState('');
  return <form className="wb-pair-setup" aria-label="Mirror existing half" onSubmit={(event) => { event.preventDefault(); const selected = choice === 'all' ? matrices : matrices.filter((matrix) => matrix.id === choice); setError(onCreate(selected, Number(coordinate)) ?? ''); }}>
    <h2>Mirror existing half</h2><p>Keep the original in place and mirror its components too. Replace a component on one side when the halves need different hardware.</p>
    <label>Source layouts<select aria-label="Source layouts" value={choice} onChange={(event) => setChoice(event.target.value)}><option value="all">All unpaired layouts on this board</option>{matrices.map((matrix, index) => <option key={matrix.id} value={matrix.id}>{matrix.name || `Matrix ${index + 1}`}</option>)}</select></label>
    <label>Mirror axis X (mm)<input aria-label="Mirror axis X" type="number" step="any" required value={coordinate} onChange={(event) => setCoordinate(event.target.value)} /></label>
    {error && <p role="alert">{error}</p>}
    <div className="wb-pair-actions"><button className="wb-secondary" type="button" onClick={onCancel}>Cancel</button><button className="wb-primary" disabled={!coordinate.trim() || !Number.isFinite(Number(coordinate)) || !matrices.length}>Create linked half</button></div>
  </form>;
}

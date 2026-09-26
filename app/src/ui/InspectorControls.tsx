import { useEffect, useState } from 'react';
import { type SwitchOrientation } from './assemblyPresets';

export const DraftInput = ({ ariaLabel, value, onCommit, type = 'text', min, step, placeholder }: {
  ariaLabel: string;
  value: string | number;
  onCommit: (value: string) => void;
  type?: 'text' | 'number';
  min?: string;
  step?: string;
  placeholder?: string;
}) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return <input aria-label={ariaLabel} type={type} min={min} step={step} placeholder={placeholder} value={draft}
    onChange={(event) => setDraft(event.target.value)}
    onBlur={() => { if (draft !== String(value)) onCommit(draft); }}
    onKeyDown={(event) => {
      if (event.key === 'Enter') event.currentTarget.blur();
      if (event.key === 'Escape') { setDraft(String(value)); event.preventDefault(); }
    }} />;
};

export const ConstraintNumber = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => <label className="wb-constraint-number">
  {label}<input aria-label={label} type="number" step="any" value={value} onChange={(event) => onChange(event.target.value)} />
</label>;

export const Coordinate = ({ label, value, suffix, onCommit }: { label: string; value: number; suffix?: string; onCommit: (value: number) => void }) => {
  const [draft, setDraft] = useState(value.toFixed(2));
  useEffect(() => setDraft(value.toFixed(2)), [value]);
  return <label className="wb-coordinate"><span>{label}</span><span className="wb-coordinate-input"><input type="number" step="0.1" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => onCommit(Number(draft))} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><small>{suffix ?? 'mm'}</small></span></label>;
};

type NumberRule = 'finite' | 'nonnegative' | 'positive' | 'positive-integer';

export const CaseNumber = ({ label, value, unit: unitLabel, validation, onCommit }: { label: string; value: number; unit: string; validation: NumberRule; onCommit: (value: number) => void }) => {
  const [draft, setDraft] = useState(value.toString());
  const [error, setError] = useState('');
  useEffect(() => {
    setDraft(value.toString());
    setError('');
  }, [value]);
  const commit = () => {
    const next = Number(draft);
    const valid = draft.trim() !== '' && Number.isFinite(next)
      && (validation === 'finite' || next >= 0)
      && (validation !== 'positive' || next > 0)
      && (validation !== 'positive-integer' || (Number.isInteger(next) && next > 0));
    if (!valid) {
      setError(validation === 'positive' || validation === 'positive-integer' ? 'Enter a value above 0.' : validation === 'nonnegative' ? 'Enter 0 or greater.' : 'Enter a valid number.');
      return;
    }
    setError('');
    if (next !== value) onCommit(next);
  };
  const min = validation === 'positive' ? '0.001' : validation === 'positive-integer' ? '1' : validation === 'nonnegative' ? '0' : undefined;
  return <label className={`wb-case-number ${error ? 'has-error' : ''}`}>
    <span>{label}</span>
    <span className="wb-case-number-input"><input type="number" step={validation === 'positive-integer' ? '1' : '0.1'} min={min} value={draft} aria-invalid={Boolean(error)} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><small>{unitLabel}</small></span>
    {error && <small className="wb-case-field-error">{error}</small>}
  </label>;
};

export const OrientationControl = ({ value, onChange }: { value: SwitchOrientation; onChange: (value: SwitchOrientation) => void }) => <label className="wb-script-select-label">Switch orientation<select aria-label="Switch orientation" value={value} onChange={event => onChange(event.target.value as SwitchOrientation)}><option value="south">South-facing LED</option><option value="north">North-facing LED</option></select><span className="wb-empty-note">Viewed from the keycap side; rotates the switch and attached parts together.</span></label>;

export const ModelVector = ({ title, value, unit: unitLabel, validation, onCommit }: { title: string; value: { x: number; y: number; z: number }; unit: string; validation: NumberRule; onCommit: (axis: 'x' | 'y' | 'z', value: number) => void }) => <fieldset className="wb-model-vector">
  <legend>{title}</legend>
  <div>{(['x', 'y', 'z'] as const).map((axis) => <CaseNumber key={axis} label={axis.toUpperCase()} value={value[axis]} unit={unitLabel} validation={validation} onCommit={(next) => onCommit(axis, next)} />)}</div>
</fieldset>;

export const Measure = ({ label, value }: { label: string; value: string }) => <div className="wb-measure"><dt>{label}</dt><dd>{value}</dd></div>;

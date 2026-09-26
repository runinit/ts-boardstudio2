import { useEffect, useState } from 'react';
import { defaultOutlineSettings } from '../../../contracts/src/index';
import type { Board, OutlineFeature, OutlineSettings, Part, PartDefinition, ProjectDoc } from '../../../contracts/src/index';

type Automatic = Extract<OutlineFeature, { kind: 'part-envelope' }>;

function keycapFallback(definition: PartDefinition) {
  if (definition.courtyard.length < 3) return { x: 18, y: 18 };
  return { x: Math.max(...definition.courtyard.map((p) => p.x)) - Math.min(...definition.courtyard.map((p) => p.x)), y: Math.max(...definition.courtyard.map((p) => p.y)) - Math.min(...definition.courtyard.map((p) => p.y)) };
}

function Dimension({ label, value, positive = false, onCommit }: { label: string; value: number; positive?: boolean; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const valid = draft.trim() !== '' && Number.isFinite(Number(draft)) && (positive ? Number(draft) > 0 : Number(draft) >= 0);
  return <label className="wb-coordinate"><span>{label}</span><span className="wb-coordinate-input">
    <input aria-label={label} type="number" step="0.1" min={positive ? 0.001 : 0} value={draft} aria-invalid={!valid}
      onChange={(event) => setDraft(event.target.value)} onBlur={() => { if (valid && Number(draft) !== value) onCommit(Number(draft)); }}
      onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setDraft(String(value)); }} /><small>mm</small>
  </span>{!valid && <small role="alert">Enter a {positive ? 'positive' : 'nonnegative'} dimension.</small>}</label>;
}

export function OutlineInspector({ document, board, onChange, onDraw }: { document: ProjectDoc; board?: Board; onChange: (document: ProjectDoc, ids: string[]) => void; onDraw: (operation: 'add' | 'subtract') => void }) {
  if (!board) return <p className="wb-empty-note">Add a board to generate its outline.</p>;
  const features = board.outlineIds.map((id) => document.outline.find((feature) => feature.id === id)).filter((feature): feature is OutlineFeature => !!feature);
  const automatic = features.find((feature): feature is Automatic => feature.kind === 'part-envelope');
  const settings = automatic?.settings ?? defaultOutlineSettings;
  const update = (patch: Partial<Automatic>) => {
    const next: Automatic = automatic ? { ...automatic, ...patch } : { id: crypto.randomUUID(), kind: 'part-envelope', partIds: board.partIds, margin: 4, operation: 'add', settings: defaultOutlineSettings, ...patch };
    onChange({ ...document, outline: automatic ? document.outline.map((feature) => feature.id === next.id ? next : feature) : [next, ...document.outline], boards: document.boards.map((item) => item.id === board.id ? { ...item, outlineIds: automatic ? item.outlineIds : [next.id, ...item.outlineIds] } : item) }, [board.id, next.id]);
  };
  return <>
    <div className="wb-inspect-head"><h2>Board outline</h2><span className="wb-mini-tag">{board.name}</span></div>
    <p className="wb-empty-note">Follows current keycaps and included components. Separate groups are connected automatically.</p>
    {!automatic ? <button onClick={() => update({})}>Generate automatic outline</button> : <div className="wb-constraint-form">
      <Dimension label="Outline margin" value={automatic.margin} onCommit={(margin) => update({ margin })} />
      <label>Corners<select aria-label="Outline corners" value={settings.corners} onChange={(event) => update({ settings: { ...settings, corners: event.target.value as OutlineSettings['corners'] } })}>
        <option value="sharp">Sharp</option><option value="fillet">Fillet</option><option value="chamfer">Chamfer</option>
      </select></label>
      {settings.corners !== 'sharp' && <Dimension label={settings.corners === 'fillet' ? 'Fillet radius' : 'Chamfer size'} value={settings.size} onCommit={(size) => update({ settings: { ...settings, size } })} />}
      <Dimension label="Bridge width" positive value={settings.bridgeWidth} onCommit={(bridgeWidth) => update({ settings: { ...settings, bridgeWidth } })} />
      <p className="wb-constraint-note">Tight corners use a smaller size when needed. Review adjustments in Findings.</p>
    </div>}
    <div className="wb-panel-rule" />
    <h3 className="wb-subtitle">Custom additions and cutouts</h3>
    <div className="wb-constraint-actions"><button onClick={() => onDraw('add')}>Draw addition</button><button onClick={() => onDraw('subtract')}>Draw cutout</button></div>
    <p className="wb-empty-note">Click points, then Enter or double-click to close. Escape cancels. Cutouts stay open when the layout changes.</p>
    {features.filter((feature) => feature.kind !== 'part-envelope').map((feature, index) => <div className="wb-pad-row" key={feature.id}>
      <span>{feature.operation === 'add' ? 'Addition' : 'Cutout'} {index + 1}</span>
      <button aria-label={`Remove ${feature.operation === 'add' ? 'addition' : 'cutout'} ${index + 1}`} onClick={() => {
        const boards = document.boards.map((item) => item.id === board.id ? { ...item, outlineIds: item.outlineIds.filter((id) => id !== feature.id) } : item);
        const retained = boards.some((item) => item.outlineIds.includes(feature.id));
        onChange({ ...document, boards, outline: retained ? document.outline : document.outline.filter((item) => item.id !== feature.id) }, [board.id, feature.id]);
      }}>Remove</button>
    </div>)}
  </>;
}

export function PartOutlineControls({ part, definition, onChange }: { part: Part; definition: PartDefinition; onChange: (part: Part) => void }) {
  const override = part.outline;
  const keycap = part.keycap ?? definition.keycap;
  const fallback = keycapFallback(definition);
  return <fieldset disabled={part.locked} className="wb-constraint-form">
    <legend>Board outline contribution</legend>
    <label><input type="checkbox" aria-label="Include in outline" checked={!override?.excluded} onChange={(event) => onChange({ ...part, outline: { ...override, excluded: !event.target.checked } })} /> Include in outline</label>
    {!override?.excluded && <>
      <label><input type="checkbox" aria-label="Use board margin" checked={override?.margin === undefined || override.margin === null} onChange={(event) => onChange({ ...part, outline: { ...override, margin: event.target.checked ? undefined : 0 } })} /> Use board margin</label>
      {override?.margin !== undefined && override.margin !== null && <Dimension label="Part edge margin" value={override.margin} onCommit={(margin) => onChange({ ...part, outline: { ...override, margin } })} />}
    </>}
    {definition.kind === 'switch' && <>
      {part.keycap && <button onClick={() => onChange({ ...part, keycap: undefined })}>Use definition keycap</button>}
      {!keycap && <p className="wb-constraint-note">Keycap dimensions missing: using the courtyard.</p>}
      <Dimension label="Keycap width" positive value={(keycap ?? fallback).x} onCommit={(x) => onChange({ ...part, keycap: { ...(keycap ?? fallback), x } })} />
      <Dimension label="Keycap depth" positive value={(keycap ?? fallback).y} onCommit={(y) => onChange({ ...part, keycap: { ...(keycap ?? fallback), y } })} />
    </>}
    <small>Zero margin allows edge placement. Excluding a part does not check pad support.</small>
  </fieldset>;
}

export function DefinitionKeycapControls({ definition, onChange }: { definition: PartDefinition; onChange: (keycap: PartDefinition['keycap']) => void }) {
  if (definition.kind !== 'switch') return null;
  const size = definition.keycap ?? keycapFallback(definition);
  return <div className="wb-constraint-form">
    <strong>Keycap envelope</strong>
    {!definition.keycap && <small>Using the courtyard until keycap dimensions are set.</small>}
    <Dimension label="Definition keycap width" positive value={size.x} onCommit={(x) => onChange({ ...size, x })} />
    <Dimension label="Definition keycap depth" positive value={size.y} onCommit={(y) => onChange({ ...size, y })} />
  </div>;
}

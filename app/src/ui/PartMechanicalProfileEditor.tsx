import React, { useState } from 'react';
import type { MechanicalBuiltinProfile, MechanicalExtraction, MechanicalGeometry, MechanicalPartProfile, MechanicalPurpose, MechanicalPurposeMapping, MechanicalSwitchFamily, PartDefinition, Vec2 } from '@boardstudio/v2-contracts';
import { defaultPlateThickness, inferSwitchFamily, plateToPcbGap } from '../mechanicalPresets';

type Props = {
  definition: PartDefinition;
  profile?: MechanicalPartProfile;
  onSave: (profile: MechanicalPartProfile) => void;
  onClose: () => void;
  onBuiltin?: (definitionId: string, source: MechanicalBuiltinProfile, gap: number) => Promise<MechanicalPartProfile>;
  onExtract?: (source: string, mappings: MechanicalPurposeMapping[]) => Promise<MechanicalExtraction>;
};
const familySource: Record<MechanicalSwitchFamily, MechanicalBuiltinProfile> = { mx: 'mx-switch', 'choc-v1': 'choc-v1-switch', 'choc-v2': 'choc-v2-switch' };
const emptySquare = (): Vec2[] => [{ x: -2.5, y: -2.5 }, { x: 2.5, y: -2.5 }, { x: 2.5, y: 2.5 }, { x: -2.5, y: 2.5 }];

export function PartMechanicalProfileEditor({ definition, profile, onSave, onClose, onBuiltin, onExtract }: Props) {
  const [draft, setDraft] = useState<MechanicalPartProfile>(() => {
    const family = inferSwitchFamily(definition);
    return profile ?? { definitionId: definition.id, source: 'Parts library', cutouts: [], plateToPcb: family ? plateToPcbGap(family, defaultPlateThickness(family)) : 0, switchFamily: family };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [geometry, setGeometry] = useState<MechanicalGeometry>();
  const [purposes, setPurposes] = useState<Record<string, MechanicalPurpose>>({});
  const update = (patch: Partial<MechanicalPartProfile>) => setDraft(current => ({ ...current, ...patch }));
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  };
  const loadFamily = async (family: MechanicalSwitchFamily) => {
    if (!onBuiltin) return;
    const gap = plateToPcbGap(family, defaultPlateThickness(family));
    await run(async () => {
      const next = await onBuiltin(definition.id, familySource[family], gap);
      setDraft(current => ({ ...current, ...next, switchFamily: family, plateToPcb: gap }));
    });
  };
  const loadGeometry = async () => {
    if (!onExtract || !definition.kicadSource) return;
    await run(async () => {
      const next = await onExtract(definition.kicadSource!.source, []);
      setGeometry(next.geometry);
      setPurposes(Object.fromEntries((draft.sourceGeometry?.mappings ?? []).filter(mapping => mapping.sourceId).map(mapping => [mapping.sourceId!, mapping.purpose])));
    });
  };
  const applyGeometry = async () => {
    if (!onExtract || !definition.kicadSource) return;
    await run(async () => {
      const next = await onExtract(definition.kicadSource!.source, Object.entries(purposes).map(([sourceId, purpose]) => ({ sourceId, purpose })));
      update({ source: `KiCad ${definition.name}`, sourceGeometry: next.sourceGeometry, cutouts: next.plateCutouts, pcbHoles: next.pcbHoles, clearances: next.clearanceEnvelopes });
    });
  };
  const polygons = (field: 'cutouts' | 'clearances', label: string) => <section className="wb-part-profile-section">
    <header><strong>{label}</strong><button type="button" className="wb-secondary" onClick={() => update({ [field]: [...(draft[field] ?? []), emptySquare()] })}>Add {field === 'cutouts' ? 'cutout' : 'clearance'}</button></header>
    {(draft[field] ?? []).map((shape, shapeIndex) => <div className="wb-part-profile-contour" key={shapeIndex}>
      <header><strong>Contour {shapeIndex + 1}</strong><button type="button" className="wb-secondary" onClick={() => update({ [field]: draft[field]!.filter((_, index) => index !== shapeIndex) })}>Remove contour {shapeIndex + 1}</button></header>
      {shape.map((point, pointIndex) => <div className="wb-mech-point" key={pointIndex}><span>Vertex {pointIndex + 1}</span>{(['x', 'y'] as const).map(axis => <input key={axis} aria-label={`${label} contour ${shapeIndex + 1} vertex ${pointIndex + 1} ${axis.toUpperCase()}`} type="number" step="0.1" value={point[axis]} onChange={event => { const value = event.target.valueAsNumber; if (Number.isFinite(value)) update({ [field]: draft[field]!.map((polygon, i) => i === shapeIndex ? polygon.map((vertex, j) => j === pointIndex ? { ...vertex, [axis]: value } : vertex) : polygon) }); }} />)}</div>)}
      <button type="button" className="wb-secondary" onClick={() => update({ [field]: draft[field]!.map((polygon, index) => index === shapeIndex ? [...polygon, { ...polygon[polygon.length - 1] }] : polygon) })}>Add vertex</button>
    </div>)}
    {!draft[field]?.length && <p>No {label.toLowerCase()} defined.</p>}
  </section>;
  return <section className="wb-part-profile-editor" aria-label="Mechanical fit profile editor">
    <header><div><h2>{definition.name} fit</h2><p>Save the fit with this part. Every case using it inherits the profile.</p></div><button type="button" className="wb-secondary" onClick={onClose}>Cancel</button></header>
    {definition.kind === 'switch' && <label className="wb-mech-field"><span>Switch fit family</span><select aria-label="Switch fit family" value={draft.switchFamily ?? ''} disabled={busy || !onBuiltin} onChange={event => { if (event.target.value) void loadFamily(event.target.value as MechanicalSwitchFamily); }}><option value="">Choose family…</option><option value="mx">MX</option><option value="choc-v1">Choc v1</option><option value="choc-v2">Choc v2</option></select></label>}
    {draft.switchFamily ? <p>Mounting gap: {draft.plateToPcb.toFixed(2)} mm with a {defaultPlateThickness(draft.switchFamily)} mm plate. Case recalculates the gap for its plate thickness.</p> : <label className="wb-mech-field"><span>Plate underside to PCB top (mm)</span><input type="number" min="0" step="0.01" value={draft.plateToPcb} onChange={event => { if (Number.isFinite(event.target.valueAsNumber)) update({ plateToPcb: event.target.valueAsNumber }); }} /></label>}
    {draft.switchFamily && onBuiltin && <button type="button" className="wb-secondary" disabled={busy} onClick={() => void loadFamily(draft.switchFamily!)}>Use standard cutout</button>}
    {definition.kicadSource && onExtract && <section className="wb-part-profile-section"><header><strong>Footprint geometry</strong><button type="button" className="wb-secondary" disabled={busy} onClick={() => void loadGeometry()}>Read KiCad layers</button></header>
      {geometry?.primitives.map(primitive => <label className="wb-mech-field" key={primitive.id}><span>{primitive.layer || primitive.kind} · {primitive.kind}</span><select aria-label={`Purpose for ${primitive.id}`} value={purposes[primitive.id] ?? ''} onChange={event => setPurposes(current => { const next = { ...current }; if (event.target.value) next[primitive.id] = event.target.value as MechanicalPurpose; else delete next[primitive.id]; return next; })}><option value="">Unused</option><option value="plate-cutout">Plate cutout</option><option value="electrical-pcb-mounting-hole">PCB mounting hole</option><option value="clearance-envelope">Clearance envelope</option><option value="drawing-guide">Drawing guide</option></select></label>)}
      {geometry && <button type="button" className="wb-secondary" disabled={busy || !Object.keys(purposes).length} onClick={() => void applyGeometry()}>Apply selected geometry</button>}
    </section>}
    {polygons('cutouts', 'Plate cutouts')}{polygons('clearances', 'Component clearances')}
    {error && <p role="alert">{error}</p>}
    <button type="button" className="wb-primary" disabled={busy} onClick={() => { onSave(draft); onClose(); }}>Save fit profile</button>
  </section>;
}

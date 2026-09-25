import React from 'react';
import type {
  Finding,
  CaseOpening,
  MechanicalAssembly,
  MechanicalCriticalFit,
  MechanicalConfiguration,
  MechanicalExtraction,
  MechanicalGeometry,
  MechanicalHardwareSpecification,
  MechanicalPartProfile,
  MechanicalPurposeMapping,
  MechanicalPurpose,
  MechanicalStabilizerOverride,
  Mount,
  PartDefinition,
  ProjectDoc,
  Vec2,
} from '@boardstudio/v2-contracts';
import { FindingList } from './FindingList';
import { MechanicalDraft } from './mechanicalDraft';
import { InspectorSection } from './InspectorSection';
import './mechanical-assembly.css';

const numericFields = [
  ['plateThickness', 'Plate thickness'],
  ['plateFoamThickness', 'Plate foam'],
  ['pcbThickness', 'PCB thickness'],
  ['bottomFoamThickness', 'Bottom foam'],
  ['batteryHeight', 'Battery height'],
  ['bottomThickness', 'Bottom thickness'],
  ['plateToPcb', 'Plate underside to PCB top'],
  ['wallThickness', 'Wall thickness'],
  ['clearance', 'Clearance'],
] as const;
const supportedConstraintVersion = '2026-09-24';
const layerProcessIds = ['plate', 'plate-foam', 'bottom-foam', 'bottom'] as const;
const defaultProcess = (partId: string, method: MechanicalConfiguration['method'], thickness: number, material = '') => ({ partId, method, material, thickness, constraintsVersion: supportedConstraintVersion });
type HardwareSpec = MechanicalHardwareSpecification;
type CriticalFit = MechanicalCriticalFit;

type Props = {
  document: ProjectDoc;
  boardId?: string;
  projectSession?: number;
  definitions: PartDefinition[];
  configuration?: MechanicalConfiguration;
  assembly?: MechanicalAssembly;
  onChange: (configuration: MechanicalConfiguration | null) => void;
  onResolve?: () => void;
  onExport?: () => void;
  onShowFinding?: (finding: Finding) => void;
  selectedLayer?: string;
  onSelectLayer?: (id: string) => void;
  onMechanicalProfile?: (definitionId: string, source: 'mx-switch' | 'mx-stab2u' | 'mx-stab625u', plateToPcb: number) => Promise<MechanicalPartProfile>;
  onExtractMechanicalProfile?: (source: string, mappings: MechanicalPurposeMapping[]) => Promise<MechanicalExtraction>;
};

const makeConfiguration = (document: ProjectDoc, boardId?: string): MechanicalConfiguration => ({
  boardId: boardId ?? document.boards[0]?.id ?? '',
  method: 'printed',
  mount: 'tray',
  integratedPlateFrame: false,
  bottomStyle: 'shell',
  middleFrame: false,
  plateThickness: 1.5,
  plateFoamThickness: 3,
  pcbThickness: 1.6,
  bottomFoamThickness: 2,
  batteryHeight: 6,
  bottomThickness: 3,
  plateToPcb: 5,
  wallThickness: 2,
  clearance: 0.3,
  mounts: [],
  closureMounts: [],
  partProcesses: [
    defaultProcess('plate', 'printed', 1.5),
    defaultProcess('plate-foam', 'printed', 3, 'foam (specify grade)'),
    defaultProcess('bottom-foam', 'printed', 2, 'foam (specify grade)'),
    defaultProcess('bottom', 'printed', 3),
  ],
  profiles: [],
});

function MountList({ title, value, onChange }: { title: string; value: Mount[]; onChange: (value: Mount[]) => void }) {
  const update = (id: string, patch: Partial<Mount>) => onChange(value.map((mount) => mount.id === id ? { ...mount, ...patch } : mount));
  return <InspectorSection title={title} detail={`${value.length}`} defaultOpen={value.length > 0}>
    {value.map((mount, index) => <div className="wb-mech-mount" key={mount.id}>
      <header><strong>{mount.kind === 'boss' ? 'Boss' : 'Hole'} {index + 1}</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange(value.filter((entry) => entry.id !== mount.id))}>Remove</button></header>
      <label className="wb-mech-field"><span>Mount type</span><select value={mount.kind} onChange={(event) => update(mount.id, { kind: event.target.value as Mount['kind'] })}><option value="hole">Hole</option><option value="boss">Boss</option></select></label>
      <div className="wb-mech-numbers"><NumberField label="Position X" value={mount.at.x} min={-1000000} onCommit={(x) => update(mount.id, { at: { ...mount.at, x } })} /><NumberField label="Position Y" value={mount.at.y} min={-1000000} onCommit={(y) => update(mount.id, { at: { ...mount.at, y } })} /><NumberField label="Hole diameter" value={mount.holeDiameter} onCommit={(holeDiameter) => update(mount.id, { holeDiameter })} min={0.1} /><NumberField label="Boss diameter" value={mount.bossDiameter ?? 5} onCommit={(bossDiameter) => update(mount.id, { bossDiameter })} min={0.1} />{mount.kind === 'boss' && <NumberField label="Boss height" value={mount.height ?? 5} onCommit={(height) => update(mount.id, { height })} min={0.1} />}</div>
    </div>)}
    <button type="button" className="wb-mech-quiet" onClick={() => onChange([...value, { id: crypto.randomUUID(), at: { x: 0, y: 0 }, kind: 'hole', holeDiameter: 2.5, bossDiameter: 5, height: 5 }])}>Add {title.toLowerCase().replace(/s$/, '')}</button>
  </InspectorSection>;
}

function NumberField({ label, value, onCommit, min = 0, max, step = 0.1, unit = 'mm' }: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const [draft, setDraft] = React.useState(String(value));
  React.useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const number = Number(draft);
    if (!Number.isFinite(number) || number < min || (max !== undefined && number > max)) {
      setDraft(String(value));
      return;
    }
    if (number !== value) onCommit(number);
  };
  return <label className="wb-mech-number"><span>{label}</span><span className="wb-mech-number-input"><input type="number" min={min} max={max} step={step} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><small>{unit}</small></span></label>;
}

function PolygonListEditor({ title, polygons, onChange }: { title: string; polygons: Vec2[][]; onChange: (polygons: Vec2[][]) => void }) {
  const updatePoint = (polygonIndex: number, pointIndex: number, axis: 'x' | 'y', value: number) => onChange(polygons.map((polygon, i) => i === polygonIndex ? polygon.map((point, j) => j === pointIndex ? { ...point, [axis]: value } : point) : polygon));
  return <div className="wb-mech-polygon-list"><header><strong>{title}</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange([...polygons, [{ x: -2.5, y: -2.5 }, { x: 2.5, y: -2.5 }, { x: 2.5, y: 2.5 }, { x: -2.5, y: 2.5 }]])}>Add polygon</button></header>
    {polygons.map((polygon, polygonIndex) => <div className="wb-mech-polygon" key={polygonIndex}><div className="wb-mech-polygon-title"><strong>Contour {polygonIndex + 1}</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange(polygons.filter((_, i) => i !== polygonIndex))}>Remove</button></div>
      {polygon.map((point, pointIndex) => <div className="wb-mech-point" key={pointIndex}><span>V{pointIndex + 1}</span><input aria-label={`${title} contour ${polygonIndex + 1} vertex ${pointIndex + 1} X`} type="number" step="0.1" value={point.x} onChange={(event) => updatePoint(polygonIndex, pointIndex, 'x', Number(event.target.value))} /><input aria-label={`${title} contour ${polygonIndex + 1} vertex ${pointIndex + 1} Y`} type="number" step="0.1" value={point.y} onChange={(event) => updatePoint(polygonIndex, pointIndex, 'y', Number(event.target.value))} /><button type="button" aria-label={`Remove ${title} vertex ${pointIndex + 1}`} onClick={() => onChange(polygons.map((entry, i) => i === polygonIndex ? entry.filter((_, j) => j !== pointIndex) : entry))} disabled={polygon.length <= 3}>×</button></div>)}
      <button type="button" className="wb-mech-quiet" onClick={() => onChange(polygons.map((entry, i) => i === polygonIndex ? [...entry, { x: 0, y: 0 }] : entry))}>Add vertex</button>
    </div>)}
    {!polygons.length && <p className="wb-mech-hint">No contours assigned.</p>}
  </div>;
}

function OpeningListEditor({ title, openings, onChange }: { title: string; openings: CaseOpening[]; onChange: (openings: CaseOpening[]) => void }) {
  return <div className="wb-mech-polygon-list"><header><strong>{title}</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange([...openings, { points: [{ x: -2.5, y: -2.5 }, { x: 2.5, y: -2.5 }, { x: 2.5, y: 2.5 }, { x: -2.5, y: 2.5 }], z: 0, height: 10 }])}>Add volume</button></header>
    {openings.map((opening, index) => <div className="wb-mech-polygon" key={index}><div className="wb-mech-polygon-title"><strong>Volume {index + 1}</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange(openings.filter((_, i) => i !== index))}>Remove</button></div>
      <div className="wb-mech-numbers"><NumberField label="Bottom Z" value={opening.z} min={-1000000} onCommit={(z) => onChange(openings.map((entry, i) => i === index ? { ...entry, z } : entry))} /><NumberField label="Height" value={opening.height} min={0.1} onCommit={(height) => onChange(openings.map((entry, i) => i === index ? { ...entry, height } : entry))} /></div>
      <PolygonListEditor title="XY footprint" polygons={[opening.points]} onChange={(polygons) => onChange(openings.map((entry, i) => i === index ? { ...entry, points: polygons[0] ?? [] } : entry))} />
    </div>)}
    {!openings.length && <p className="wb-mech-hint">No volumes configured.</p>}
  </div>;
}

function ProfileEditor({ profile, definitions, onChange, onRemove, onExtract }: {
  profile: MechanicalPartProfile;
  definitions: PartDefinition[];
  onChange: (profile: MechanicalPartProfile) => void;
  onRemove: () => void;
  onExtract?: (mappings: MechanicalPurposeMapping[]) => Promise<MechanicalExtraction>;
}) {
  const [geometry, setGeometry] = React.useState<MechanicalGeometry>();
  const [selectedPrimitives, setSelectedPrimitives] = React.useState<Set<string>>(new Set());
  const [primitivePurposes, setPrimitivePurposes] = React.useState<Record<string, MechanicalPurpose>>({});
  const [extracting, setExtracting] = React.useState(false);
  const [extractError, setExtractError] = React.useState('');
  const definition = definitions.find((entry) => entry.id === profile.definitionId);
  const loadGeometry = async () => {
    if (!onExtract) return;
    setExtracting(true); setExtractError('');
    try {
      const result = await onExtract([]);
      setGeometry(result.geometry);
      setSelectedPrimitives(new Set(profile.sourceGeometry?.sourceIds ?? []));
      setPrimitivePurposes(Object.fromEntries((profile.sourceGeometry?.mappings ?? []).filter((mapping) => mapping.sourceId).map((mapping) => [mapping.sourceId!, mapping.purpose])));
    } catch (cause) {
      setExtractError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setExtracting(false);
    }
  };
  const applyGeometry = async () => {
    if (!geometry || !onExtract || !selectedPrimitives.size) return;
    const mappings = geometry.primitives.filter((primitive) => selectedPrimitives.has(primitive.id)).map((primitive) => ({ sourceId: primitive.id, purpose: primitivePurposes[primitive.id] ?? 'plate-cutout' }));
    setExtracting(true); setExtractError('');
    try {
      const result = await onExtract(mappings);
      onChange({ ...profile, source: definition?.name ? `KiCad ${definition.name}` : profile.source, sourceGeometry: result.sourceGeometry, pcbHoles: result.pcbHoles, clearances: result.clearanceEnvelopes, cutouts: result.plateCutouts });
    } catch (cause) {
      setExtractError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setExtracting(false);
    }
  };

  return <section className="wb-mech-profile" aria-label={`${definition?.name ?? profile.definitionId} plate profile`}>
    <header><strong>{definition?.name ?? profile.definitionId}</strong><button type="button" className="wb-mech-quiet" onClick={onRemove}>Remove profile</button></header>
    <p className="wb-mech-hint">Profile source: {profile.source}. Cutouts repeat for every matching placed part.</p>
    {definition?.kicadSource && onExtract && <div className="wb-mech-geometry-picker">
      <div className="wb-mech-geometry-head"><strong>Custom geometry layers</strong><button type="button" className="wb-mech-quiet" onClick={() => void loadGeometry()} disabled={extracting}>{extracting ? 'Reading…' : geometry ? 'Reload layers' : 'Read KiCad layers'}</button></div>
      {geometry && <>
        <p className="wb-mech-hint">Select exact primitives that define plate cutouts. The extracted contour will replace this profile’s cutouts.</p>
        <div className="wb-mech-geometry-list">{geometry.primitives.length ? geometry.primitives.map((primitive) => <div className="wb-mech-geometry-row" key={primitive.id}><label><input type="checkbox" checked={selectedPrimitives.has(primitive.id)} onChange={(event) => setSelectedPrimitives((old) => { const next = new Set(old); if (event.target.checked) next.add(primitive.id); else next.delete(primitive.id); return next; })} /><span><strong>{primitive.layer || primitive.kind}</strong><small>{primitive.kind} · {primitive.sourceGroupId}</small></span></label><select aria-label={`Purpose for ${primitive.layer || primitive.kind}`} value={primitivePurposes[primitive.id] ?? 'plate-cutout'} onChange={(event) => setPrimitivePurposes((old) => ({ ...old, [primitive.id]: event.target.value as MechanicalPurpose }))}><option value="plate-cutout">Plate cutout</option><option value="electrical-pcb-mounting-hole">PCB mounting hole</option><option value="clearance-envelope">Clearance envelope</option><option value="drawing-guide">Drawing guide</option></select></div>) : <p className="wb-mech-hint">No geometric primitives were found in this footprint.</p>}</div>
        <button type="button" className="wb-mech-quiet" onClick={() => void applyGeometry()} disabled={!selectedPrimitives.size || extracting}>Apply selected geometry</button>
      </>}
      {extractError && <p className="wb-mech-error" role="alert">{extractError}</p>}
    </div>}
    <div className="wb-mech-points-head"><span>Cutout vertices</span><span>X / Y · mm</span></div>
    <PolygonListEditor title="Plate cutout geometry" polygons={profile.cutouts} onChange={(cutouts) => onChange({ ...profile, cutouts })} />
    <PolygonListEditor title="Component clearance zones" polygons={profile.clearances ?? []} onChange={(clearances) => onChange({ ...profile, clearances })} />
    <OpeningListEditor title="Access openings" openings={profile.openings ?? []} onChange={(openings) => onChange({ ...profile, openings })} />
    <OpeningListEditor title="Clearance volumes" openings={profile.clearanceVolumes ?? []} onChange={(clearanceVolumes) => onChange({ ...profile, clearanceVolumes })} />
    <div className="wb-mech-profile-offset"><NumberField label="Profile engagement · plate underside to PCB top" value={profile.plateToPcb} onCommit={(plateToPcb) => onChange({ ...profile, plateToPcb })} /><label className="wb-mech-field"><span>Supported thickness</span><span className="wb-mech-range"><input aria-label="Minimum supported plate thickness" type="number" min="0" step="0.1" placeholder="Min" value={profile.supportedThickness?.x ?? ''} onChange={(event) => onChange({ ...profile, supportedThickness: { x: Number(event.target.value), y: profile.supportedThickness?.y ?? 0 } })} /><input aria-label="Maximum supported plate thickness" type="number" min="0" step="0.1" placeholder="Max" value={profile.supportedThickness?.y ?? ''} onChange={(event) => onChange({ ...profile, supportedThickness: { x: profile.supportedThickness?.x ?? 0, y: Number(event.target.value) } })} /></span></label></div>
  </section>;
}

function HardwareAndFits({ configuration, assembly, onChange }: {
  configuration: MechanicalConfiguration;
  assembly?: MechanicalAssembly;
  onChange: (patch: Partial<MechanicalConfiguration>) => void;
}) {
  const hardware = configuration.hardware ?? [];
  const criticalFits = configuration.criticalFits ?? [];
  const bodyParts = assembly?.case.bodies.map((entry) => entry.body) ?? [];
  const plannedBodyIds = [
    'plate',
    ...(configuration.plateFoamThickness > 0 ? ['plate-foam'] : []),
    ...(configuration.bottomFoamThickness > 0 ? ['bottom-foam'] : []),
    'bottom',
    ...(configuration.bottomStyle === 'sheet' && configuration.middleFrame ? ['middle-frame'] : []),
  ];
  const bodyIds = [...new Set(assembly ? bodyParts.map((body) => body.id) : plannedBodyIds)];
  const mountChoices = bodyParts.flatMap((body) => (body.mounts ?? []).map((mount) => ({ partId: body.id, mount })));
  const configuredMountChoices = [
    ...(configuration.mount === 'gasket' ? [] : configuration.mounts.map((mount) => ({ partId: configuration.mount === 'rigid' ? 'plate' : 'bottom', mount }))),
    ...(configuration.closureMounts ?? []).map((mount) => ({ partId: 'bottom', mount })),
  ];
  const availableMounts = mountChoices.length ? mountChoices : configuredMountChoices;
  const bodyName = (id: string) => bodyParts.find((body) => body.id === id)?.name ?? id;
  const updateHardware = (index: number, patch: Partial<HardwareSpec>) => onChange({
    hardware: hardware.map((entry, i) => i === index ? { ...entry, ...patch } : entry),
  });
  const updateFit = (index: number, patch: Partial<CriticalFit>) => onChange({
    criticalFits: criticalFits.map((entry, i) => i === index ? { ...entry, ...patch } : entry),
  });

  return <InspectorSection title="Hardware & critical fits" detail={`${hardware.length} hardware · ${criticalFits.length} fits`} defaultOpen={hardware.length + criticalFits.length > 0}>
    <div className="wb-mech-spec-group">
      <header><strong>Hardware</strong><button type="button" className="wb-mech-quiet" disabled={!availableMounts.length} onClick={() => {
        const choice = availableMounts[0];
        if (!choice) return;
        onChange({ hardware: [...hardware, { id: crypto.randomUUID(), partId: choice.partId, featureId: choice.mount.id, designation: 'Socket screw', thread: 'M2 × 0.4', length: 6, quantity: 4, notes: '' }] });
      }}>Add hardware</button></header>
      {!availableMounts.length && <p className="wb-mech-hint">Add a suspension or closure mount to link a fastener specification to its generated feature.</p>}
      {hardware.map((item, index) => {
        const link = JSON.stringify([item.partId, item.featureId]);
        return <article className="wb-mech-spec-card" key={item.id}>
          <header><strong>{item.designation || 'Hardware item'}</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange({ hardware: hardware.filter((_, i) => i !== index) })}>Remove</button></header>
          <label className="wb-mech-field"><span>Mount link</span><select aria-label={`Mount link for hardware ${index + 1}`} value={availableMounts.some((choice) => choice.partId === item.partId && choice.mount.id === item.featureId) ? link : ''} onChange={(event) => {
            if (!event.target.value) return;
            const [partId, featureId] = JSON.parse(event.target.value) as [string, string];
            updateHardware(index, { partId, featureId });
          }}><option value="">Choose generated mount…</option>{availableMounts.map((choice) => <option key={`${choice.partId}:${choice.mount.id}`} value={JSON.stringify([choice.partId, choice.mount.id])}>{bodyName(choice.partId)} · {choice.mount.kind} · {choice.mount.at.x.toFixed(1)}, {choice.mount.at.y.toFixed(1)} mm</option>)}</select></label>
          <div className="wb-mech-spec-fields"><label className="wb-mech-field"><span>Designation</span><input aria-label={`Designation for hardware ${index + 1}`} value={item.designation} onChange={(event) => updateHardware(index, { designation: event.target.value })} placeholder="Socket screw" /></label><label className="wb-mech-field"><span>Thread</span><input aria-label={`Thread for hardware ${index + 1}`} value={item.thread} onChange={(event) => updateHardware(index, { thread: event.target.value })} placeholder="M2 × 0.4" /></label><NumberField label="Length" value={item.length} min={0.1} onCommit={(length) => updateHardware(index, { length })} /><NumberField label="Quantity" value={item.quantity} min={1} step={1} unit="pcs" onCommit={(quantity) => updateHardware(index, { quantity: Math.round(quantity) })} /><label className="wb-mech-field"><span>Tolerance</span><input aria-label={`Tolerance for hardware ${index + 1}`} value={item.tolerance ?? ''} onChange={(event) => updateHardware(index, { tolerance: event.target.value })} placeholder="Optional callout" /></label></div>
          <label className="wb-mech-field"><span>Notes</span><textarea aria-label={`Notes for hardware ${index + 1}`} value={item.notes ?? ''} onChange={(event) => updateHardware(index, { notes: event.target.value })} rows={2} placeholder="Drive, head, washer, or assembly notes" /></label>
        </article>;
      })}
    </div>
    <div className="wb-mech-spec-group">
      <header><strong>Critical fits</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange({ criticalFits: [...criticalFits, { id: crypto.randomUUID(), partId: bodyIds[0] ?? 'plate', label: 'Critical dimension', from: { x: 0, y: 0 }, to: { x: 10, y: 0 }, tolerance: '±0.2 mm' }] })}>Add fit dimension</button></header>
      <p className="wb-mech-hint">Endpoints are document XY coordinates. Length is calculated from the saved endpoints.</p>
      {criticalFits.map((fit, index) => <article className="wb-mech-spec-card" key={fit.id}>
        <header><strong>{fit.label || 'Fit dimension'}</strong><button type="button" className="wb-mech-quiet" onClick={() => onChange({ criticalFits: criticalFits.filter((_, i) => i !== index) })}>Remove</button></header>
        <div className="wb-mech-spec-fields"><label className="wb-mech-field"><span>Generated part</span><select aria-label={`Part for critical fit ${index + 1}`} value={fit.partId} onChange={(event) => updateFit(index, { partId: event.target.value })}>{bodyIds.map((id) => <option key={id} value={id}>{bodyName(id)}</option>)}</select></label><label className="wb-mech-field"><span>Dimension name</span><input aria-label={`Label for critical fit ${index + 1}`} value={fit.label} onChange={(event) => updateFit(index, { label: event.target.value })} placeholder="Case width" /></label><label className="wb-mech-field"><span>Tolerance</span><input aria-label={`Tolerance for critical fit ${index + 1}`} value={fit.tolerance} onChange={(event) => updateFit(index, { tolerance: event.target.value })} placeholder="±0.2 mm" /></label></div>
        <div className="wb-mech-fit-points"><NumberField label="From X" value={fit.from.x} min={-1000000} onCommit={(x) => updateFit(index, { from: { ...fit.from, x } })} /><NumberField label="From Y" value={fit.from.y} min={-1000000} onCommit={(y) => updateFit(index, { from: { ...fit.from, y } })} /><NumberField label="To X" value={fit.to.x} min={-1000000} onCommit={(x) => updateFit(index, { to: { ...fit.to, x } })} /><NumberField label="To Y" value={fit.to.y} min={-1000000} onCommit={(y) => updateFit(index, { to: { ...fit.to, y } })} /></div>
        <output className="wb-mech-fit-result">Measured {Math.hypot(fit.to.x - fit.from.x, fit.to.y - fit.from.y).toFixed(2)} mm · {fit.tolerance}</output>
      </article>)}
    </div>
  </InspectorSection>;
}

export function MechanicalAssemblyPanel({ document, boardId, projectSession, definitions, configuration, assembly, onChange: commitConfiguration, onResolve, onExport, onShowFinding, selectedLayer, onSelectLayer, onMechanicalProfile, onExtractMechanicalProfile }: Props) {
  const draftScope = `${document.id}:${boardId ?? configuration?.boardId ?? ''}:${projectSession ?? 0}`;
  const draft = React.useRef(new MechanicalDraft(configuration, draftScope, document.revision));
  draft.current.receive(configuration, draftScope, document.revision);
  const [, redraw] = React.useReducer((value: number) => value + 1, 0);
  const config = draft.current.value;
  const onChange = (next: MechanicalConfiguration | null) => {
    draft.current.submit(next); redraw(); commitConfiguration(next);
  };
  const [profileSource, setProfileSource] = React.useState<'mx-switch' | 'mx-stab2u' | 'mx-stab625u'>('mx-switch');
  const [profilePending, setProfilePending] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const usedDefinitions = [...new Set(document.parts.map((part) => part.definitionId))].map((id) => definitions.find((definition) => definition.id === id)).filter((definition): definition is PartDefinition => Boolean(definition));
  const processTargets = [...layerProcessIds.map((partId) => ({ partId, name: partId.replace(/-/g, ' ') })), ...document.parts.map((part) => ({ partId: part.id, name: `${part.reference} · ${definitions.find((definition) => definition.id === part.definitionId)?.name ?? part.definitionId}` }))];
  const update = (patch: Partial<MechanicalConfiguration>) => {
    const current = draft.current.value ?? makeConfiguration(document, boardId);
    let partProcesses = patch.partProcesses ?? current.partProcesses ?? [];
    if (patch.method || patch.plateThickness !== undefined || patch.bottomThickness !== undefined || patch.plateFoamThickness !== undefined || patch.bottomFoamThickness !== undefined) {
      partProcesses = partProcesses.map((process) => ({
        ...process,
        ...(patch.method && layerProcessIds.includes(process.partId as (typeof layerProcessIds)[number]) ? { method: patch.method } : {}),
        ...(patch.method === 'pcb-fr4' && process.partId === 'plate' && !process.material ? { material: 'FR4' } : {}),
        ...(process.partId === 'plate' && patch.plateThickness !== undefined ? { thickness: patch.plateThickness } : {}),
        ...(process.partId === 'bottom' && patch.bottomThickness !== undefined ? { thickness: patch.bottomThickness } : {}),
        ...(process.partId === 'plate-foam' && patch.plateFoamThickness !== undefined ? { thickness: patch.plateFoamThickness } : {}),
        ...(process.partId === 'bottom-foam' && patch.bottomFoamThickness !== undefined ? { thickness: patch.bottomFoamThickness } : {}),
      }));
    }
    onChange({ ...current, ...patch, partProcesses });
  };
  const assignProfile = async (definitionId: string) => {
    if (!config || !onMechanicalProfile || config.profiles.some((profile) => profile.definitionId === definitionId)) return;
    setProfilePending(true); setProfileError('');
    try {
      const profile = await onMechanicalProfile(definitionId, profileSource, config.plateToPcb);
      if (draft.current.value) update({ profiles: [...draft.current.value.profiles, profile] });
    } catch (cause) {
      setProfileError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setProfilePending(false);
    }
  };
  const layers = assembly?.stack ?? [];
  const findings = assembly?.diagnostics ?? [];
  const profileSpacing = config?.profiles.find((profile) => definitions.find((definition) => definition.id === profile.definitionId)?.kind === 'switch')?.plateToPcb;

  return <div className="wb-mechanical-panel">
    <div className="wb-inspect-head"><h2>Mechanical assembly</h2><span className="wb-mini-tag">{config ? 'Configured' : 'Optional'}</span></div>
    {!config ? <div className="wb-mech-start"><p>Resolve the keyboard stack from assigned part profiles, plate settings, and the case outline.</p><button className="wb-primary" disabled={!document.boards.length} onClick={() => onChange(makeConfiguration(document, boardId))}>Configure mechanical stack</button></div> : <>
      <div className="wb-mech-actions"><span className="wb-mech-revision">{assembly ? `Resolved r${assembly.revision}` : 'Waiting for resolution'}</span><button type="button" onClick={onResolve}>Resolve stack</button><button type="button" className="wb-primary" onClick={onExport} disabled={!assembly || assembly.revision !== document.revision}>Export geometry</button><button type="button" className="wb-mech-disable" onClick={() => onChange(null)}>Disable mechanical stack</button></div>
      <InspectorSection title="Manufacturing" detail={config.method} defaultOpen>
        <label className="wb-mech-field"><span>Method</span><select value={config.method} onChange={(event) => update({ method: event.target.value as MechanicalConfiguration['method'] })}><option value="pcb-fr4">PCB FR-4</option><option value="printed">3D printed</option><option value="cnc">CNC machined</option><option value="cut-sheet">Cut sheet</option></select></label>
        <label className="wb-mech-field"><span>Mount style</span><select value={config.mount} onChange={(event) => update({ mount: event.target.value as MechanicalConfiguration['mount'] })}><option value="tray">Tray</option><option value="rigid">Rigid mount</option><option value="gasket">Gasket mount</option></select></label>
        <label className="wb-mech-field"><span>Bottom construction</span><select value={config.bottomStyle ?? 'shell'} onChange={(event) => update({ bottomStyle: event.target.value as MechanicalConfiguration['bottomStyle'] })}><option value="shell">Tray shell</option><option value="sheet">Flat sheet</option></select></label>
        {config.bottomStyle === 'sheet' && <label className="wb-mech-check"><input type="checkbox" checked={config.middleFrame ?? false} onChange={(event) => update({ middleFrame: event.target.checked })} /><span>Add middle frame</span></label>}
        <label className="wb-mech-field"><span>Board</span><select aria-label="Board for mechanical stack" value={config.boardId} onChange={(event) => update({ boardId: event.target.value })}>{document.boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}</select></label>
        <label className="wb-mech-check"><input type="checkbox" checked={config.integratedPlateFrame} onChange={(event) => update({ integratedPlateFrame: event.target.checked })} /><span>Integrate plate frame into case</span></label>
        <div className="wb-mech-numbers">{numericFields.filter(([key]) => key !== 'plateToPcb' || profileSpacing === undefined).map(([key, label]) => <NumberField key={key} label={label} value={config[key]} onCommit={(value) => update({ [key]: value })} />)}</div>
        {profileSpacing !== undefined && <p className="wb-mech-hint">Plate underside to PCB top: {profileSpacing.toFixed(2)} mm, derived from the switch profile. Edit the profile engagement below.</p>}
        <NumberField label="Radial opening allowance" value={config.openingAllowance ?? 0} min={-1} max={1} onCommit={(openingAllowance) => update({ openingAllowance })} />
      </InspectorSection>
      <InspectorSection title="Gasket" detail={config.gasket ? 'Configured' : 'Optional'} defaultOpen={Boolean(config.gasket)}>
        <label className="wb-mech-check"><input type="checkbox" checked={Boolean(config.gasket)} onChange={(event) => update({ gasket: event.target.checked ? { inset: 2, width: 2, depth: 1.5 } : undefined })} /><span>Configure gasket groove</span></label>
        {config.gasket && <div className="wb-mech-numbers"><NumberField label="Inset" value={config.gasket.inset} onCommit={(inset) => update({ gasket: { ...config.gasket!, inset } })} /><NumberField label="Width" value={config.gasket.width} onCommit={(width) => update({ gasket: { ...config.gasket!, width } })} min={0.1} /><NumberField label="Depth" value={config.gasket.depth} onCommit={(depth) => update({ gasket: { ...config.gasket!, depth } })} min={0.1} /><NumberField label="Gasket travel" value={config.gasketTravel ?? 1} onCommit={(gasketTravel) => update({ gasketTravel })} min={0.1} /></div>}
      </InspectorSection>
      <InspectorSection title="Case openings" detail={`${config.openings?.length ?? 0}`}>
        <OpeningListEditor title="Document-coordinate access openings" openings={config.openings ?? []} onChange={(openings) => update({ openings })} />
      </InspectorSection>
      <InspectorSection title="Battery" detail={config.battery ? 'Configured' : 'Optional'} defaultOpen={Boolean(config.battery)}>
        <label className="wb-mech-check"><input type="checkbox" checked={Boolean(config.battery)} onChange={(event) => update({ battery: event.target.checked ? { size: { x: 30, y: 20, z: 6 }, at: { x: 0, y: 0 }, cableExit: { x: 0, y: 0 }, cableWidth: 2 } : undefined })} /><span>Include a battery envelope</span></label>
        {config.battery && <div className="wb-mech-numbers wb-mech-battery">
          <NumberField label="Width" value={config.battery.size.x} onCommit={(x) => update({ battery: { ...config.battery!, size: { ...config.battery!.size, x } } })} min={0.1} />
          <NumberField label="Depth" value={config.battery.size.y} onCommit={(y) => update({ battery: { ...config.battery!, size: { ...config.battery!.size, y } } })} min={0.1} />
          <NumberField label="Height" value={config.battery.size.z} onCommit={(z) => update({ battery: { ...config.battery!, size: { ...config.battery!.size, z } } })} min={0.1} />
          <NumberField label="Cable width" value={config.battery.cableWidth ?? 2} onCommit={(cableWidth) => update({ battery: { ...config.battery!, cableWidth } })} min={0.1} />
          <NumberField label="Position X" value={config.battery.at.x} min={-1000000} onCommit={(x) => update({ battery: { ...config.battery!, at: { ...config.battery!.at, x } } })} />
          <NumberField label="Position Y" value={config.battery.at.y} min={-1000000} onCommit={(y) => update({ battery: { ...config.battery!, at: { ...config.battery!.at, y } } })} />
          <NumberField label="Cable exit X" value={config.battery.cableExit.x} min={-1000000} onCommit={(x) => update({ battery: { ...config.battery!, cableExit: { ...config.battery!.cableExit, x } } })} />
          <NumberField label="Cable exit Y" value={config.battery.cableExit.y} min={-1000000} onCommit={(y) => update({ battery: { ...config.battery!, cableExit: { ...config.battery!.cableExit, y } } })} />
        </div>}
      </InspectorSection>
      <MountList title="Suspension mounts" value={config.mounts} onChange={(mounts) => update({ mounts })} />
      <MountList title="Closure screws" value={config.closureMounts ?? []} onChange={(closureMounts) => update({ closureMounts })} />
      <HardwareAndFits configuration={config} assembly={assembly} onChange={update} />
      <InspectorSection title="Suggested mount locations" detail={`${assembly?.suggestedMounts?.length ?? 0} candidates`}>
        {assembly?.suggestedMounts?.length ? <><p className="wb-mech-hint">Candidates clear the current openings and battery envelope. Adopting them is explicit; later edits keep the chosen coordinates fixed.</p><button type="button" className="wb-mech-quiet" onClick={() => update({ mounts: assembly.suggestedMounts })}>Adopt suggested mounts</button></> : <p className="wb-mech-hint">Resolve the current geometry to see clearance-tested mounting locations.</p>}
      </InspectorSection>
      <InspectorSection title="Per-part process overrides" detail={`${config.partProcesses?.length ?? 0}`}>
        {processTargets.map(({ partId, name }) => {
          const process = config.partProcesses?.find((entry) => entry.partId === partId);
          const defaultThickness = partId === 'plate' ? config.plateThickness : partId === 'plate-foam' ? config.plateFoamThickness : partId === 'bottom-foam' ? config.bottomFoamThickness : partId === 'bottom' ? config.bottomThickness : config.plateThickness;
          const setProcess = (patch: Partial<NonNullable<MechanicalConfiguration['partProcesses']>[number]>) => update({ partProcesses: [...(config.partProcesses ?? []).filter((entry) => entry.partId !== partId), { ...(process ?? defaultProcess(partId, config.method, defaultThickness)), ...patch }] });
          return <div className="wb-mech-process" key={partId}><header><strong>{name}</strong>{process && <button type="button" className="wb-mech-quiet" onClick={() => update({ partProcesses: config.partProcesses?.filter((entry) => entry.partId !== partId) })}>Remove</button>}</header>
            {!process ? <button type="button" className="wb-mech-quiet" onClick={() => setProcess({})}>Add process override</button> : <>
              <div className="wb-mech-process-fields"><label className="wb-mech-field"><span>Method</span><select value={process.method} onChange={(event) => setProcess({ method: event.target.value as MechanicalConfiguration['method'] })}><option value="pcb-fr4">PCB FR-4</option><option value="printed">3D printed</option><option value="cnc">CNC machined</option><option value="cut-sheet">Cut sheet</option></select></label><label className="wb-mech-field"><span>Material</span><input value={process.material} placeholder="Specify grade" onChange={(event) => setProcess({ material: event.target.value })} /></label><NumberField label="Finished thickness" value={process.thickness} onCommit={(thickness) => setProcess({ thickness })} min={0.1}/></div>
              <div className="wb-mech-version">Constraint set <code>{process.constraintsVersion}</code>{process.constraintsVersion !== supportedConstraintVersion && <small role="alert">Unsupported constraint set. Diagnostics will block export.</small>}</div>
            </>}
          </div>;
        })}
        <p className="wb-mech-hint">Supported constraint set: {supportedConstraintVersion}.</p>
      </InspectorSection>
      <InspectorSection title="Stabilizer fit" detail={`${config.stabilizers?.length ?? 0}`}>
        {document.parts.filter((part) => document.boards.find((board) => board.id === config.boardId)?.partIds.includes(part.id) && definitions.find((definition) => definition.id === part.definitionId)?.kind === 'switch').map((part) => {
          const current: MechanicalStabilizerOverride = config.stabilizers?.find((entry) => entry.partId === part.id) ?? { partId: part.id, kind: 'none', units: 2 };
          const change = (next: typeof current) => update({ stabilizers: [...(config.stabilizers ?? []).filter((entry) => entry.partId !== part.id), next] });
          const assignProfile = async (value: string) => {
            if (value === 'shared') {
              const shared = config.profiles.find((profile) => profile.definitionId === part.definitionId);
              change({ ...current, profile: shared });
            } else if (value === 'mx-stab2u' || value === 'mx-stab625u' || value === 'mx-switch') {
              if (!onMechanicalProfile) return;
              setProfilePending(true); setProfileError('');
              try { change({ ...current, profile: await onMechanicalProfile(part.definitionId, value, config.plateToPcb) }); }
              catch (cause) { setProfileError(cause instanceof Error ? cause.message : String(cause)); }
              finally { setProfilePending(false); }
            } else change({ ...current, profile: undefined });
          };
          return <div className="wb-mech-stabilizer" key={part.id}><strong>{part.reference}</strong><label className="wb-mech-field"><span>Mount</span><select value={current.kind} onChange={(event) => change({ ...current, kind: event.target.value as typeof current.kind })}><option value="none">None</option><option value="pcb-mount">PCB mount</option><option value="plate-mount">Plate mount</option></select></label><div className="wb-mech-numbers"><label className="wb-mech-field"><span>Key width</span><select value={current.units} onChange={(event) => change({ ...current, units: Number(event.target.value) })}><option value="2">2u</option><option value="6.25">6.25u</option></select></label><NumberField label="Rotation" value={current.rotation ?? 0} onCommit={(rotation) => change({ ...current, rotation })} min={-360}/></div>{current.kind === 'plate-mount' && <label className="wb-mech-field"><span>Plate opening profile</span><select value={current.profile ? current.profile.source : config.profiles.some((profile) => profile.definitionId === part.definitionId) ? 'shared' : ''} disabled={profilePending} onChange={(event) => void assignProfile(event.target.value)}><option value="">Choose cutout source…</option>{config.profiles.some((profile) => profile.definitionId === part.definitionId) && <option value="shared">Use assigned {definitions.find((definition) => definition.id === part.definitionId)?.name} profile</option>}<option value="mx-stab2u">Built-in 2u stabilizer</option><option value="mx-stab625u">Built-in 6.25u stabilizer</option></select></label>}</div>;
        })}
        {!document.parts.some((part) => definitions.find((definition) => definition.id === part.definitionId)?.kind === 'switch') && <p className="wb-mech-hint">Place switch instances to set stabilizer fit.</p>}
      </InspectorSection>
      <InspectorSection title="Part profiles" detail={`${config.profiles.length} assigned`} defaultOpen>
        <p className="wb-mech-hint">Library entries supply cutout geometry. Engagement spacing and stock compatibility are user-defined and unqualified until checked against the component drawing.</p>
        {usedDefinitions.length === 0 ? <p className="wb-mech-hint">Place parts to assign mechanical profiles.</p> : <div className="wb-mech-profile-add"><label className="wb-mech-field"><span>Library fit profile</span><select value={profileSource} onChange={(event) => setProfileSource(event.target.value as typeof profileSource)}><option value="mx-switch">MX switch</option><option value="mx-stab2u">MX stabilizer · 2u</option><option value="mx-stab625u">MX stabilizer · 6.25u</option></select><select aria-label="Assign library fit profile to" value="" disabled={profilePending || !onMechanicalProfile} onChange={(event) => void assignProfile(event.target.value)}><option value="">Choose a placed part type…</option>{usedDefinitions.filter((definition) => !config.profiles.some((profile) => profile.definitionId === definition.id)).map((definition) => <option key={definition.id} value={definition.id}>{definition.name}</option>)}</select></label><label className="wb-mech-field"><span>Custom KiCad geometry</span><select aria-label="Assign custom geometry profile to" value="" onChange={(event) => { const definitionId = event.target.value; if (!definitionId) return; const definition = usedDefinitions.find((entry) => entry.id === definitionId); if (!definition) return; update({ profiles: [...config.profiles, { definitionId, source: `KiCad ${definition.name}`, cutouts: [], plateToPcb: config.plateToPcb }] }); }}><option value="">Choose imported part type…</option>{usedDefinitions.filter((definition) => Boolean(definition.kicadSource) && !config.profiles.some((profile) => profile.definitionId === definition.id)).map((definition) => <option key={definition.id} value={definition.id}>{definition.name}</option>)}</select></label></div>}
        {profilePending && <p className="wb-mech-hint" role="status">Loading library profile…</p>}
        {profileError && <p className="wb-mech-error" role="alert">{profileError}</p>}
        {config.profiles.map((profile) => <ProfileEditor key={profile.definitionId} profile={profile} definitions={definitions} onExtract={onExtractMechanicalProfile ? (mappings) => onExtractMechanicalProfile(definitions.find((definition) => definition.id === profile.definitionId)?.kicadSource?.source ?? '', mappings) : undefined} onChange={(next) => update({ profiles: config.profiles.map((entry) => entry.definitionId === next.definitionId ? next : entry) })} onRemove={() => update({ profiles: config.profiles.filter((entry) => entry.definitionId !== profile.definitionId) })} />)}
      </InspectorSection>
      <InspectorSection title="Resolved stack" detail={`${layers.length} layers`} defaultOpen>
        {layers.length ? <div className="wb-mech-stack" aria-label="Resolved mechanical stack">{layers.map((layer) => <button type="button" className={`wb-mech-layer${selectedLayer === layer.id ? ' is-selected' : ''}`} aria-pressed={selectedLayer === layer.id} onClick={() => onSelectLayer?.(selectedLayer === layer.id ? '' : layer.id)} key={layer.id}><span className="wb-mech-layer-swatch" /><strong>{layer.id}</strong><span>{layer.thickness.toFixed(2)} mm</span><small>Z {layer.z.toFixed(2)}</small></button>)}</div> : <p className="wb-mech-hint">The stack appears after the current revision resolves.</p>}
      </InspectorSection>
      <InspectorSection title="Mechanical diagnostics" detail={`${findings.length}`} defaultOpen={findings.length > 0}>
        <FindingList document={document} assembly={assembly} findings={findings} onShow={onShowFinding ?? (() => {})} />
      </InspectorSection>
    </>}
  </div>;
}

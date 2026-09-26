import { CanvasLayers } from './CanvasLayers';
import React, { lazy, memo, useMemo, useState } from 'react';
import type { PartDefinition, Vec2, ProjectDoc, MechanicalPartProfile, MechanicalBuiltinProfile, MechanicalPurposeMapping, MechanicalExtraction } from '../../../contracts/src/index';
import type { CompiledFootprint } from '../../../contracts/src/index';
import type { ComponentPreview } from './CasePreview';
import { Ergogen2DPreview, ergogenPreviewLayers, ergogenPreviewPoints } from './Ergogen2DPreview';
import { isErgogen, parameters } from '@boardstudio/v2-ergogen';

export type LibraryModelStatus = { definitionId: string; state: 'empty' | 'loading' | 'ready' | 'unsupported' | 'error'; message?: string };
import './library-workspace.css';
import { sampleAssembly } from './sampleAssembly';
import { PartMechanicalProfileEditor } from './PartMechanicalProfileEditor';
const AssemblyViewer = lazy(() => import('./AssemblyViewer').then(m => ({ default: m.AssemblyViewer })));

const CasePreview = lazy(() => import('./CasePreview').then((module) => ({ default: module.CasePreview })));
const copperLayer = (side: 'front' | 'back') => side === 'back' ? 'B.Cu' : 'F.Cu';
type PreviewLayer = { id: string; label: string; kind: 'copper' | 'graphic' | 'outline' | 'drill' | 'label' | 'part' };
class ModelPreviewBoundary extends React.Component<{ resetKey: string; onRetry?: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }

  componentDidUpdate(previous: Readonly<{ resetKey: string }>): void {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render(): React.ReactNode {
    if (this.state.failed) return <div className="wb-model-message" role="alert"><p>The 3D preview could not be displayed. Switch to 2D or retry the model.</p><button className="wb-secondary" onClick={this.props.onRetry}>Retry model loading</button></div>;
    return this.props.children;
  }
}
export const LibraryWorkspace = memo(({ document, definition, title, companions = [], compiled = [], compilePending = false, compileError, models = [], modelFilename, modelStatus, onRetry, show3d, onViewChange, colorScheme, mechanicalProfile, onSaveMechanicalProfile, onMechanicalProfile, onExtractMechanicalProfile }: {
  document: ProjectDoc; definition?: PartDefinition; title?: string; companions?: { definition: PartDefinition; at: Vec2 }[];
  compiled?: CompiledFootprint[];
  compilePending?: boolean; compileError?: string;
  models?: ComponentPreview[]; modelFilename?: string; modelStatus?: LibraryModelStatus; onRetry?: () => void; show3d: boolean; onViewChange: (value: boolean) => void; colorScheme: 'light' | 'dark';
  mechanicalProfile?: MechanicalPartProfile;
  onSaveMechanicalProfile?: (profile: MechanicalPartProfile) => void;
  onMechanicalProfile?: (definitionId: string, source: MechanicalBuiltinProfile, gap: number) => Promise<MechanicalPartProfile>;
  onExtractMechanicalProfile?: (source: string, mappings: MechanicalPurposeMapping[]) => Promise<MechanicalExtraction>;
}) => {
  const [visibility, setVisibility] = useState<{ definitionId: string; hidden: Set<string> }>({ definitionId: '', hidden: new Set() });
  const [editingProfile, setEditingProfile] = useState(false);
  const hidden = visibility.definitionId === definition?.id ? visibility.hidden : new Set<string>();
  const toggleLayer = (id: string) => setVisibility((current) => {
    const next = new Set(current.definitionId === definition?.id ? current.hidden : []);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { definitionId: definition?.id ?? '', hidden: next };
  });
  const footprints = useMemo(() => definition ? [{ definition, at: { x: 0, y: 0 } }, ...companions].flatMap((entry) => {
    const ir = compiled.find((item) => item.definition.id === entry.definition.id)?.geometry
      ?? (isErgogen(entry.definition.generator?.source) ? {
        side: 'front' as const,
        pads: entry.definition.pads,
        courtyard: entry.definition.courtyard,
        traces: [],
        vias: [],
      } : undefined);
    if (!ir) return [];
    const keycap = entry.definition.kind === 'switch' ? entry.definition.keycap : undefined;
    const generator = entry.definition.generator;
    const keycapToggle = generator?.source === 'infused-kim/choc' ? 'show_keycaps' : 'include_keycap';
    const includeKeycap = generator && isErgogen(generator.source)
      ? generator.parameters[keycapToggle] ?? parameters(generator.source)[keycapToggle]?.value
      : true;
    const outline = keycap ? includeKeycap === false ? [] : [
      { x: -keycap.x / 2, y: -keycap.y / 2 }, { x: keycap.x / 2, y: -keycap.y / 2 },
      { x: keycap.x / 2, y: keycap.y / 2 }, { x: -keycap.x / 2, y: keycap.y / 2 },
    ] : ir.courtyard;
    const parameterSide = generator?.parameters.side;
    const side = parameterSide === 'B' ? 'back' : parameterSide === 'F' ? 'front' : ir.side;
    return [{ ...entry, ir, keycap, outline, side, graphicLayers: ergogenPreviewLayers(entry.definition, Boolean(keycap)) }];
  }) : [], [definition, companions, compiled]);
  const sample = useMemo(() => definition ? sampleAssembly(document, definition, companions) : undefined, [document, definition, companions]);
  if (!definition) return <div className="wb-library-workspace-empty">Select a component or key assembly.</div>;
  if (!footprints.length) return <div className="wb-library-workspace-empty">
    {compilePending && <p role="status">Preparing footprint preview…</p>}
    {compileError && <p role="alert">{compileError}</p>}
  </div>;
  const diagnostics = compiled.find((item) => item.definition.id === definition.id)?.diagnostics ?? [];
  const points = footprints.flatMap(({ definition: item, ir, outline, at }) => [...outline, ...ir.pads.flatMap((pad) => {
    const angle = (pad.rotation ?? 0) * Math.PI / 180;
    return [-1, 1].flatMap((x) => [-1, 1].map((y) => ({
      x: pad.at.x + x * pad.size.x / 2 * Math.cos(angle) - y * pad.size.y / 2 * Math.sin(angle),
      y: pad.at.y + x * pad.size.x / 2 * Math.sin(angle) + y * pad.size.y / 2 * Math.cos(angle),
    })));
  }), ...ir.traces.flatMap((trace) => [trace.start, trace.end]), ...ir.vias.flatMap((via) => [{ x: via.at.x - via.size / 2, y: via.at.y - via.size / 2 }, { x: via.at.x + via.size / 2, y: via.at.y + via.size / 2 }]), ...ergogenPreviewPoints(item)].map((point) => ({ x: point.x + at.x, y: point.y + at.y })));
  const minX = Math.min(0, ...points.map((p) => p.x));
  const maxX = Math.max(0, ...points.map((p) => p.x));
  const minY = Math.min(0, ...points.map((p) => p.y));
  const maxY = Math.max(0, ...points.map((p) => p.y));
  const keycap = footprints[0]?.keycap;
  const size = keycap ?? { x: maxX - minX, y: maxY - minY };
  const copper = new Set(footprints.flatMap(({ ir, side }) => [
    ...ir.pads.map((pad) => copperLayer(pad.side ?? side)),
    ...ir.traces.map((trace) => copperLayer(trace.layer)),
    ...(ir.vias.length ? ['F.Cu', 'B.Cu'] : []),
  ]));
  const graphics = [...new Set(footprints.flatMap(({ graphicLayers }) => graphicLayers))].sort();
  const outlines = [...new Set(footprints.filter(({ outline }) => outline.length > 0).map(({ keycap: envelope }) => envelope ? 'Keycap' : 'Courtyard'))];
  const visibleFootprints = footprints.filter((_, index) => !hidden.has(`part:${index}`));
  const layers: PreviewLayer[] = [
    ...['F.Cu', 'B.Cu'].filter((name) => copper.has(name)).map((name): PreviewLayer => ({ id: `copper:${name}`, label: name, kind: 'copper' })),
    ...graphics.map((name): PreviewLayer => ({ id: `graphics:${name}`, label: name, kind: 'graphic' })),
    ...outlines.map((name): PreviewLayer => ({ id: `outline:${name}`, label: name, kind: 'outline' })),
    ...(footprints.some(({ ir }) => ir.pads.some((pad) => pad.drill)) ? [{ id: 'drills', label: 'Drills', kind: 'drill' as const }] : []),
    ...(footprints.some(({ ir }) => ir.pads.length > 0) ? [{ id: 'pad-labels', label: 'Pad numbers', kind: 'label' as const }] : []),
  ];
  const outlineLabels = [...new Set(visibleFootprints.filter(({ outline }) => outline.length > 0).map(({ keycap: envelope }) => envelope ? 'Keycap' : 'Courtyard'))].filter((name) => !hidden.has(`outline:${name}`)).map((name) => name.toLowerCase()).join(' / ');
  const visiblePads = visibleFootprints.some(({ ir, side }) => ir.pads.some((pad) => !hidden.has(`copper:${copperLayer(pad.side ?? side)}`)));
  if (editingProfile && onSaveMechanicalProfile) return <PartMechanicalProfileEditor key={definition.id} definition={definition} profile={mechanicalProfile} onSave={onSaveMechanicalProfile} onClose={() => setEditingProfile(false)} onBuiltin={onMechanicalProfile} onExtract={onExtractMechanicalProfile} />;
  return <div className="wb-library-workspace" aria-label="Footprint workspace">
    {compilePending && <p role="status">Compiling footprint preview…</p>}
    {compileError && <p role="alert">{compileError}</p>}
    {diagnostics.map((diagnostic, index) => <p className="wb-empty-note" key={`${diagnostic.kind}:${index}`}>{diagnostic.message}</p>)}
    <section className="wb-library-fit-profile" aria-label="Mechanical fit profile"><div><h3>Mechanical fit</h3><p>{mechanicalProfile ? 'Defined with this part and inherited by layouts and cases.' : 'Define this part’s fit once so every layout and case uses the same profile.'}</p></div><button type="button" className="wb-secondary" onClick={() => setEditingProfile(true)} disabled={!onSaveMechanicalProfile}>{mechanicalProfile ? 'Edit profile' : 'Define profile'}</button></section>
    <div className="wb-library-workspace-title"><h2>{title ?? definition.name}</h2><div role="group" aria-label="Part preview view"><button aria-pressed={!show3d} onClick={() => onViewChange(false)}>2D footprint</button><button aria-pressed={show3d} onClick={() => onViewChange(true)}>3D model</button></div></div>
    {show3d ? <div className="wb-library-model-workspace" aria-label="3D footprint model preview">
      {sample && <ModelPreviewBoundary resetKey={definition.id} onRetry={onRetry}><React.Suspense fallback={<p>Loading assembly preview…</p>}><AssemblyViewer document={sample.project} boardId="sample-board" contours={sample.contours} colorScheme={colorScheme} sample /></React.Suspense></ModelPreviewBoundary>}
    </div> : <div className="wb-library-workspace-geometry wb-layer-surface"><svg viewBox={`${minX - 3} ${-maxY - 3} ${maxX - minX + 6} ${maxY - minY + 6}`} role="img" aria-label="Footprint preview">
      {footprints.map(({ definition: item, ir, keycap, outline, at, side }, index) => hidden.has(`part:${index}`) ? null : <g key={`${item.id}:${index}`} transform={`translate(${at.x} ${-at.y})`}>
        <Ergogen2DPreview definition={item} hideKeycap={Boolean(keycap)} hiddenLayers={hidden} />
        {outline.length > 0 && !hidden.has(`outline:${keycap ? 'Keycap' : 'Courtyard'}`) && <polygon points={outline.map((p) => `${p.x},${-p.y}`).join(' ')} className={keycap ? 'wb-preview-keycap' : 'wb-preview-courtyard'} />}
        {ir.traces.filter((trace) => !hidden.has(`copper:${copperLayer(trace.layer)}`)).map((trace, i) => <line key={`trace-${i}`} x1={trace.start.x} y1={-trace.start.y} x2={trace.end.x} y2={-trace.end.y} strokeWidth={trace.width} className="wb-preview-copper" />)}
        {(!hidden.has('copper:F.Cu') || !hidden.has('copper:B.Cu')) && ir.vias.map((via) => <circle key={via.id} cx={via.at.x} cy={-via.at.y} r={via.size / 2} className="wb-preview-via" />)}
        {ir.pads.filter((pad) => !hidden.has(`copper:${copperLayer(pad.side ?? side)}`)).map((pad) => <g key={pad.id} transform={`rotate(${-(pad.rotation ?? 0)} ${pad.at.x} ${-pad.at.y})`}>
          <rect x={pad.at.x - pad.size.x / 2} y={-pad.at.y - pad.size.y / 2} width={pad.size.x} height={pad.size.y} rx={pad.shape === 'circle' || pad.shape === 'oval' ? Math.min(pad.size.x, pad.size.y) / 2 : pad.shape === 'roundrect' ? Math.min(pad.size.x, pad.size.y) / 4 : 0} className="wb-preview-pad" />
          {pad.drill && !hidden.has('drills') && <circle cx={pad.at.x} cy={-pad.at.y} r={pad.drill / 2} className={`wb-preview-drill ${pad.plated === false ? 'is-mechanical' : ''}`} />}
          {!hidden.has('pad-labels') && <text x={pad.at.x} y={-pad.at.y + pad.size.y / 2 + 0.7} className="wb-preview-pad-label">{pad.number}</text>}
        </g>)}
      </g>)}
    </svg><CanvasLayers hidden={hidden} onToggle={toggleLayer} groups={[
      { title: 'Footprint', layers },
      { title: 'Parts', layers: footprints.map(({ definition: item }, index) => ({ id: `part:${index}`, label: item.name, accessibilityLabel: `part ${item.name}`, kind: 'part' })) },
    ]} /></div>}
    <div className="wb-library-workspace-scale">{show3d ? 'Drag to orbit · Scroll to zoom' : `${keycap ? 'Keycap ' : ''}${size.x.toFixed(1)} × ${size.y.toFixed(1)} mm${visiblePads ? ' · Purple: pads' : ''}${outlineLabels ? ` · Dashed: ${outlineLabels}` : ''}`}</div>
  </div>;
});

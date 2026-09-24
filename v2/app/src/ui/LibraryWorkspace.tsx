import React, { lazy, memo, useMemo } from 'react';
import type { PartDefinition, Vec2 } from '../../../contracts/src/index';
import type { CompiledFootprint } from '../../../contracts/src/index';
import type { ComponentPreview } from './CasePreview';
import { Ergogen2DPreview, ergogenPreviewPoints } from './Ergogen2DPreview';
import { isErgogen, parameters } from '@boardstudio/v2-ergogen';

export type LibraryModelStatus = { definitionId: string; state: 'empty' | 'loading' | 'ready' | 'unsupported' | 'error'; message?: string };
import './library-workspace.css';

const CasePreview = lazy(() => import('./CasePreview').then((module) => ({ default: module.CasePreview })));
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
export const LibraryWorkspace = memo(({ definition, title, companions = [], compiled = [], compilePending = false, compileError, models = [], modelFilename, modelStatus, onRetry, show3d, onViewChange, colorScheme }: {
  definition?: PartDefinition; title?: string; companions?: { definition: PartDefinition; at: Vec2 }[];
  compiled?: CompiledFootprint[];
  compilePending?: boolean; compileError?: string;
  models?: ComponentPreview[]; modelFilename?: string; modelStatus?: LibraryModelStatus; onRetry?: () => void; show3d: boolean; onViewChange: (value: boolean) => void; colorScheme: 'light' | 'dark';
}) => {
  const footprints = useMemo(() => definition ? [{ definition, at: { x: 0, y: 0 } }, ...companions].flatMap((entry) => {
    const ir = compiled.find((item) => item.definition.id === entry.definition.id)?.geometry
      ?? (isErgogen(entry.definition.generator?.source) ? {
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
    return [{ ...entry, ir, keycap, outline }];
  }) : [], [definition, companions, compiled]);
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
  const outlineLabels = [...new Set(footprints.filter(({ outline }) => outline.length > 0).map(({ keycap }) => keycap ? 'keycap' : 'courtyard'))].join(' / ');
  return <div className="wb-library-workspace" aria-label="Footprint workspace">
    {compilePending && <p role="status">Compiling footprint preview…</p>}
    {compileError && <p role="alert">{compileError}</p>}
    {diagnostics.map((diagnostic, index) => <p className="wb-empty-note" key={`${diagnostic.kind}:${index}`}>{diagnostic.message}</p>)}
    <div className="wb-library-workspace-title"><h2>{title ?? definition.name}</h2><div role="group" aria-label="Part preview view"><button aria-pressed={!show3d} onClick={() => onViewChange(false)}>2D footprint</button><button aria-pressed={show3d} onClick={() => onViewChange(true)}>3D model</button></div></div>
    {show3d ? <div className="wb-library-model-workspace" aria-label="3D footprint model preview">
      {modelStatus?.state === 'error' ? <div className="wb-model-message" role="alert"><p>{modelStatus.message}</p><button className="wb-secondary" onClick={onRetry}>Retry model loading</button></div>
        : modelStatus?.state === 'empty' || (!definition.model && !definition.models?.length && !isErgogen(definition.generator?.source)) ? <p>No 3D model attached. Import a STEP model in the inspector.</p>
        : modelStatus?.state === 'unsupported' || /\.wrl$/i.test(modelFilename ?? '') ? <p>WRL models are included in exports. Attach a STEP model for an interactive preview.</p>
        : models.length ? <ModelPreviewBoundary resetKey={definition.id} onRetry={onRetry}><React.Suspense fallback={<p>Loading 3D preview…</p>}><CasePreview componentPreviews={models} colorScheme={colorScheme} /></React.Suspense></ModelPreviewBoundary> : <p role="status">Loading the attached 3D model…</p>}

      {companions.length > 0 && <p>3D shows the selected switch model. Companion footprints are shown in 2D.</p>}
    </div> : <div className="wb-library-workspace-geometry"><svg viewBox={`${minX - 3} ${-maxY - 3} ${maxX - minX + 6} ${maxY - minY + 6}`} role="img" aria-label="Footprint preview">
      {footprints.map(({ definition: item, ir, keycap, outline, at }) => <g key={item.id} transform={`translate(${at.x} ${-at.y})`}>
        <Ergogen2DPreview definition={item} hideKeycap={Boolean(keycap)} />
        {outline.length > 0 && <polygon points={outline.map((p) => `${p.x},${-p.y}`).join(' ')} className={keycap ? 'wb-preview-keycap' : 'wb-preview-courtyard'} />}
        {ir.traces.map((trace, i) => <line key={`trace-${i}`} x1={trace.start.x} y1={-trace.start.y} x2={trace.end.x} y2={-trace.end.y} strokeWidth={trace.width} className="wb-preview-copper" />)}
        {ir.vias.map((via) => <circle key={via.id} cx={via.at.x} cy={-via.at.y} r={via.size / 2} className="wb-preview-via" />)}
        {ir.pads.map((pad) => <g key={pad.id} transform={`rotate(${-(pad.rotation ?? 0)} ${pad.at.x} ${-pad.at.y})`}>
          <rect x={pad.at.x - pad.size.x / 2} y={-pad.at.y - pad.size.y / 2} width={pad.size.x} height={pad.size.y} rx={pad.shape === 'circle' || pad.shape === 'oval' ? Math.min(pad.size.x, pad.size.y) / 2 : pad.shape === 'roundrect' ? Math.min(pad.size.x, pad.size.y) / 4 : 0} className="wb-preview-pad" />
          {pad.drill && <circle cx={pad.at.x} cy={-pad.at.y} r={pad.drill / 2} className={`wb-preview-drill ${pad.plated === false ? 'is-mechanical' : ''}`} />}
          <text x={pad.at.x} y={-pad.at.y + pad.size.y / 2 + 0.7} className="wb-preview-pad-label">{pad.number}</text>
        </g>)}
      </g>)}
    </svg></div>}
    <div className="wb-library-workspace-scale">{show3d ? 'Drag to orbit · Scroll to zoom' : `${keycap ? 'Keycap ' : ''}${size.x.toFixed(1)} × ${size.y.toFixed(1)} mm · Purple: pads${outlineLabels ? ` · Dashed: ${outlineLabels}` : ''}`}</div>
  </div>;
});

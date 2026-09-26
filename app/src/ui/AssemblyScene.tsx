import { defaultGasketLayout, moveGasket, gasketAnchors } from '../gasketEditing';
import type { MechanicalGasketSupport } from '@boardstudio/v2-contracts';
import { generationMessage, type GenerationState } from '../generationState';
import React, { useEffect, useRef, useState } from 'react';
import type { BoardReference, MechanicalAssembly, MechanicalConfiguration, PcbPreview } from '@boardstudio/v2-contracts';
import type { ModelMesh } from '../modelMesh';
import { createRendererCanvas, type RendererCanvas } from '../renderClient';
import './assembly-preview.css';

export type LoadedModel = { id: string; mesh: ModelMesh };
export type AssemblyBody = { id: string; name: string; mesh: ModelMesh };
type AssemblyView = 'assembled' | 'exploded' | 'section';

export function AssemblyScene({ board, models, bodies = [], mechanical, generation, onGasketChange, mechanicalConfiguration, selectedLayer = '', reference, onSelect, onSelectLayer, colorScheme }: {
  board: PcbPreview;
  models: LoadedModel[];
  bodies?: AssemblyBody[];
  mechanical?: MechanicalAssembly;
  generation?: GenerationState;
  onGasketChange?: (config: MechanicalConfiguration) => void;
  mechanicalConfiguration?: MechanicalConfiguration;
  selectedLayer?: string;
  reference?: BoardReference;
  onSelect?: (reference: string) => void;
  onSelectLayer?: (id: string) => void;
  colorScheme: 'light' | 'dark';
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<RendererCanvas>();
  const sceneRevision = useRef(0);
  const interacted = useRef(false);
  const fitted = useRef(false);
  const fittedModels = useRef(false);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const selectLayerRef = useRef(onSelectLayer);
  selectLayerRef.current = onSelectLayer;
  const mechanicalRef = useRef(mechanical);
  mechanicalRef.current = mechanical;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState('');
  const [view, setView] = useState<AssemblyView>('assembled');
  const [displayMode, setDisplayMode] = useState<'shaded' | 'wireframe' | 'hybrid'>('hybrid');
  const stableBodies = useRef(bodies);
  if (bodies.length !== stableBodies.current.length || bodies.some((b,i) => b.id !== stableBodies.current[i]?.id || b.mesh.positions !== stableBodies.current[i]?.mesh.positions)) stableBodies.current = bodies;
  const geometryBodies = stableBodies.current;
  const stackKey = JSON.stringify(mechanical?.stack ?? []);
  const batteryKey = JSON.stringify(mechanicalConfiguration?.battery);
  const [preparing, setPreparing] = useState(false);
  const [editingGaskets, setEditingGaskets] = useState(false);
  const [gasketMessage, setGasketMessage] = useState('');
  const [activeGasket, setActiveGasket] = useState('');

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let disposed = false;
    setError('');
    createRendererCanvas(element, (id) => {
      setSelected(id);
      if (mechanicalRef.current?.stack.some((layer) => layer.id === id) || id === 'pcb' || id === 'battery') selectLayerRef.current?.(id);
      selectRef.current?.(id === 'pcb' ? 'PCB' : id);
    }, () => { interacted.current = true; }).then((instance) => {
      if (disposed) { instance.dispose(); return; }
      renderer.current = instance;
      setReady(true);
    }).catch(() => {
      if (!disposed) setError('WebGL2 could not start. The 2D editor remains available.');
    });
    return () => {
      disposed = true;
      setReady(false);
      renderer.current?.dispose();
      renderer.current = undefined;
    };
  }, []);

  useEffect(() => {
    const current = renderer.current;
    if (!ready || !current) return;
    const keepCamera = fitted.current && (models.length === 0 || fittedModels.current || interacted.current);
    const revision = ++sceneRevision.current;
    try {
      setPreparing(true);
      const packet = {
        revision,
        kind: 'assembly',
        theme: colorScheme,
        view,
        keepCamera,
        selectedLayer,
        hidden: [...hidden],
        board,
        models,
        bodies: geometryBodies,
        mechanicalStack: mechanical?.stack ?? [],
        battery: mechanicalConfiguration?.battery,
        reference,
      };
      void current.setScene(packet).then(accepted => {
      if (accepted) {
        if (!keepCamera) fitted.current = true;
        if (models.length > 0) fittedModels.current = true;
        setError('');
        setPreparing(false);
      }
      }).catch(cause => { setError(String(cause)); setPreparing(false); });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The assembly preview could not be updated.');
    }
  }, [ready, board, models, geometryBodies, reference, stackKey, batteryKey]);

  useEffect(() => {
    renderer.current?.setState({ hidden: [...hidden, ...(!editingGaskets ? ['GasketHandles'] : [])], selectedLayer, view, mode: displayMode, theme: colorScheme });
  }, [ready, hidden, selectedLayer, view, displayMode, colorScheme, editingGaskets]);

  useEffect(() => {
    const current = renderer.current;
    if (!current || !ready || !mechanical || !mechanicalConfiguration) return;
    const original = mechanical.gasketSupports ?? [];
    const z = mechanical.stack.find(layer => layer.id === 'retainer');
    const handleZ = z ? z.z + z.thickness + 0.7 : 9;
    const handles = (supports: MechanicalGasketSupport[], invalid = false) => supports.map(support => ({ ...support, z: handleZ, invalid }));
    current.setHandles(editingGaskets ? handles(original) : []);
    let moving = '';
    let pending = original;
    let valid = true;
    current.setDrag(editingGaskets ? {
      start(id) {
        if (!id.startsWith('gasket-handle:')) return undefined;
        moving = id.slice('gasket-handle:'.length);
        setActiveGasket(moving);
        pending = original;
        return handleZ;
      },
      move(point) {
        const next = moveGasket(point, moving, original, mechanical.gasketTracks ?? []);
        valid = Boolean(next);
        if (next) pending = next;
        current.setHandles(handles(pending, !valid));
        setGasketMessage(valid ? 'Release to save positions · Generate updates the solids' : 'That position is blocked · move along the perimeter');
      },
      end(cancelled) {
        if (!cancelled && valid && pending !== original && onGasketChange) {
          const layout = mechanicalConfiguration.gasketLayout ?? defaultGasketLayout();
          onGasketChange({ ...mechanicalConfiguration, gasketLayout: { ...layout, supports: gasketAnchors(layout, original, pending) } });
        } else current.setHandles(handles(original));
        setGasketMessage(cancelled ? 'Move cancelled' : !valid ? 'Blocked move was not saved' : '');
        moving = '';
      },
    } : undefined);
    return () => current.setDrag(undefined);
  }, [ready, editingGaskets, mechanical, mechanicalConfiguration, onGasketChange]);

  const unlinkGasket = () => {
    if (!mechanical || !mechanicalConfiguration || !onGasketChange) return;
    const original = mechanical.gasketSupports ?? [];
    const next = original.map(support => support.id === activeGasket || support.pairId === activeGasket ? { ...support, unlinked: true } : support);
    const layout = mechanicalConfiguration.gasketLayout ?? defaultGasketLayout();
    onGasketChange({ ...mechanicalConfiguration, gasketLayout: { ...layout, supports: gasketAnchors(layout, original, next) } });
  };

  const toggle = (id: string) => setHidden((old) => {
    const next = new Set(old);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const controls = [
    ['PCB', 'PCB'],
    ['Copper', 'Copper'],
    ['Mask', 'Mask openings'],
    ['Silkscreen', 'Silkscreen'],
    ['Models', 'Models'],
    ['Keycaps', 'Keycaps'],
    ...bodies.map((body) => [body.id, body.name]),
    ...(mechanical?.stack ?? []).map((layer) => layer.id === 'pcb' ? ['PCB', 'PCB'] : [layer.id, layer.id]),
  ].filter(([id], index, all) => all.findIndex(([candidate]) => candidate === id) === index);
  const generatedBodyCount = mechanical
    ? bodies.filter((body) => mechanical.case.bodies.some((entry) => entry.body.id === body.id)).length
    : 0;
  const solidsBlocked = mechanical?.generationBlocked ?? false;
  const hasManufacturingFindings = mechanical?.diagnostics.some((finding) => finding.severity === 'error') ?? false;
  const showView = (preset: 'fit' | 'top' | 'bottom' | 'isometric') => {
    renderer.current?.view(preset);
    interacted.current = preset !== 'fit' ? interacted.current : false;
    if (preset === 'fit') fitted.current = true;
  };

  return <div className="wb-assembly-scene" aria-label="Complete PCB assembly preview">
    <canvas ref={canvas} aria-label="3D PCB assembly. Drag to orbit, scroll to zoom." />
    <details className="wb-assembly-layers">
      <summary>Visibility</summary>
      {controls.map(([id, label]) => <label key={id}>
        <input type="checkbox" checked={!hidden.has(id)} onChange={() => toggle(id)} />
        {label}
      </label>)}
      <details>
        <summary>Components ({board.models.length})</summary>
        {board.models.map((model) => <label key={model.id}>
          <input type="checkbox" checked={!hidden.has(model.id)} onChange={() => toggle(model.id)} />
          {model.reference} · {model.path.split('/').pop()}
        </label>)}
      </details>
    </details>
    <div className="wb-render-modes" role="group" aria-label="Display mode">
      {(['shaded', 'wireframe', 'hybrid'] as const).map(mode => <button key={mode} aria-pressed={displayMode === mode} onClick={() => setDisplayMode(mode)}>{mode[0].toUpperCase() + mode.slice(1)}</button>)}
    </div>
    {preparing && <span role="status" className="wb-scene-preparing">Preparing 3D geometry…</span>}
    <div className="wb-assembly-controls" role="group" aria-label="Assembly camera">
      <button disabled={!ready} onClick={() => showView('fit')}>Fit</button>
      <button disabled={!ready} onClick={() => showView('top')}>Top</button>
      <button disabled={!ready} onClick={() => showView('bottom')}>Bottom</button>
      <button disabled={!ready} onClick={() => showView('isometric')}>Isometric</button>
    </div>
    {mechanical && <div className="wb-mechanical-view-controls" role="group" aria-label="Mechanical assembly view">
      <button aria-pressed={view === 'assembled'} onClick={() => setView('assembled')}>Assembled</button>
      <button aria-pressed={view === 'exploded'} onClick={() => setView('exploded')}>Exploded</button>
      <button aria-pressed={view === 'section'} onClick={() => setView('section')}>Section</button>
      {Boolean(mechanical.gasketSupports?.length) && <button aria-pressed={editingGaskets} onClick={() => { setEditingGaskets(value => !value); setGasketMessage(editingGaskets ? '' : 'Drag a gasket handle along the perimeter · linked supports move together'); setView('assembled'); renderer.current?.view('top'); }}>Edit gaskets</button>}
      {editingGaskets && activeGasket && <button onClick={unlinkGasket}>Unlink selected support</button>}
    </div>}
    {mechanical && <output role="status" className="wb-mechanical-preview-status">{generation && generation.status !== 'ready' ? `${generationMessage(generation)}${bodies.length ? ' · showing previous geometry' : ''}` : solidsBlocked ? 'Case solids blocked · see mechanical diagnostics' : generatedBodyCount === mechanical.case.bodies.length ? `Generated CAD solids${hasManufacturingFindings ? ' · manufacturing findings to review' : ''} · ${mechanical.case.bodies.length} parts at revision ${mechanical.revision}` : 'Generate required'}</output>}
    {gasketMessage && <output className="wb-gasket-message" role="status">{gasketMessage}</output>}
    {view === 'section' && <output className="wb-mechanical-section-label">Section at board centre · half removed</output>}
    <output className="wb-assembly-caption">{selected || `${models.length} / ${board.models.length} models · ${board.thickness} mm PCB`}</output>
    {error && <p className="wb-assembly-error" role="alert">{error}</p>}
  </div>;
}

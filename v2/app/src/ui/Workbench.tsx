import React, { lazy, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CaseBody,
  Constraint,
  EditCommand,
  CompiledFootprint,
  FootprintCompileJob,
  Matrix,
  Layout,
  MatrixCell,
  MatrixSplayChange,
  OutlineFeature,
  Part,
  PartDefinition,
  ProjectDoc,
  SceneDelta,
  Vec2,
  JsonValue,
} from '../../../contracts/src/index';
import { componentPoseSvgTransform } from './CasePreview';
import type { ComponentPreview } from './CasePreview';
import { DefinitionKeycapControls, OutlineInspector, PartOutlineControls } from './OutlineInspector';
import { defaultOutlineSettings } from '../../../contracts/src/index';
import { matrixCellId, matrixSceneAdapter, type MatrixProjection, type MatrixScene } from './matrixGeometry';
import { WorkbenchTree } from './WorkbenchTree';
import { LibraryWorkspace, type LibraryModelStatus } from './LibraryWorkspace';
import { InspectorSection } from './InspectorSection';
import { GeneratorFields } from './GeneratorFields';
import { PartsLibrary } from './PartsLibrary';
import { selectionOutline } from './selectionOutline';
import { generatorDraft, generatorParameters } from './generatorSettings';
import { runLatest } from './compileLatest';
import { canUseBuiltinDefault } from './builtinPreview';
import { libraryPreviewFor, libraryPreviewsToCompile } from './libraryPreview';
import type { TreeEntry } from './WorkbenchTree';
import { builtinCatalog, builtinDefinitions } from '@boardstudio/v2-kicad';
import { catalogue as ergogenCatalogue, isErgogen, normalizeDefinition, parameters as ergogenParameterSchema } from '@boardstudio/v2-ergogen';
import './workbench.css';
import './inspector.css';
import { CommandMenu, ToolIcon } from './CommandMenu';
import './unified-workbench.css';
import { alignmentDelta, snapPart } from './placementGeometry';
import { PanelIcon, WorkspacePanel, useCompactPanel, usePanelSettings } from './WorkspacePanel';
import './workspace-panels.css';
import { MirroredPairSetup, MirrorPairIcon, pairAt, type PairPlacement, type PairSetup } from './MirroredPairSetup';

const CasePreview = lazy(() => import('./CasePreview').then((module) => ({ default: module.CasePreview })));

type Mode = 'Design' | 'PCB' | 'Case' | 'Library' | 'Export';
type ExportKind = 'project' | 'kicad' | 'footprints' | 'case-step' | 'svg' | 'dxf';
type Props = {
  document: ProjectDoc;
  scene: SceneDelta;
  onEdit: (command: EditCommand) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (kind: ExportKind, boardId?: string) => void;
  compileFootprints: (jobs: FootprintCompileJob[]) => Promise<CompiledFootprint[]>;
  selectedBoardId?: string;
  onSelectBoard?: (boardId: string) => void;
  onNewProject?: () => void;
  onImport?: (file: File) => void;
  onImportFootprint?: (file: File) => void;
  onImportModel?: (file: File, definitionId: string, parameter?: string) => void;
  onSelectLibraryModel?: (definitionId: string) => void;
  libraryModelPreviews?: ComponentPreview[];
  libraryModelStatus?: LibraryModelStatus;
  onRequestCaseModels?: (boardId: string) => void;
  onDuplicateDesign?: (matrixId: string, presetId: MatrixPresetId) => void;
  onProjectMatrices?: (matrices: Matrix[]) => Promise<MatrixScene[] | undefined>;
  onModeChange?: (mode: Mode) => void;
  casePreview?: { positions: Float32Array; normals: Float32Array; revision: number };
  componentPreviews?: ComponentPreview[];
  embedUsedModels?: boolean;
  onEmbedUsedModelsChange?: (value: boolean) => void;
};
type Drag = {
  ids: string[];
  origins: { id: string; at: Vec2 }[];
  pointerStart: Vec2;
  pending: { id: string; at: Vec2 }[];
  transactionId: string;
  pointerId: number;
  target: SVGGElement;
  bounds: ReturnType<typeof getBounds>;
  frame: number | null;
  moved: boolean;
  matrixCell?: { matrixId: string; row: number; column: number; offset: Vec2; assemblyId?: string };
  matrixScope?: { kind: 'matrix'; origin: Vec2 } | { kind: 'row' | 'column'; index: number; offset: Vec2 };
  pendingMatrix?: Matrix;
};

type SelectionScope = {
  kind: 'matrix' | 'row' | 'column' | 'key' | 'component';
  matrixId?: string;
  row?: number;
  column?: number;
  partId?: string;
};
type StaggerDrag = {
  matrixId: string;
  axis: 'row' | 'column';
  index: number;
  startClient: Vec2;
  worldPerPixel: Vec2;
  offset: Vec2;
  pointerId: number;
  target: SVGElement;
  pending: Matrix;
};
type SceneHandlers = {
  hoverPart: (id: string | null) => void;
  startDrag: (event: React.PointerEvent<SVGGElement>, part: Part) => void;
  moveDrag: (event: React.PointerEvent<SVGGElement>) => void;
  endDrag: (event: React.PointerEvent<SVGGElement>) => void;
  choosePart: (id: string, additive?: boolean) => void;
  nudgePart: (event: React.KeyboardEvent<Element>, part: Part) => void;
};

export type MatrixPresetId = 'mx-solder' | 'mx-hotswap' | 'choc-solder' | 'choc-hotswap' | 'mx-rgb' | 'choc-rgb' | 'mx-hotswap-rgb' | 'choc-hotswap-rgb';
const matrixPresetDefinitions: Record<MatrixPresetId, { definitionId: string; led: boolean }> = {
  'mx-solder': { definitionId: 'mx-switch', led: false },
  'mx-hotswap': { definitionId: 'mx-hotswap', led: false },
  'choc-solder': { definitionId: 'choc-switch', led: false },
  'choc-hotswap': { definitionId: 'choc-hotswap', led: false },
  'mx-rgb': { definitionId: 'mx-switch', led: true },
  'choc-rgb': { definitionId: 'choc-switch', led: true },
  'mx-hotswap-rgb': { definitionId: 'mx-hotswap', led: true },
  'choc-hotswap-rgb': { definitionId: 'choc-hotswap', led: true },
};

const matrixWithPreset = (matrix: Matrix, presetId: MatrixPresetId) => {
  const preset = matrixPresetDefinitions[presetId];
  const existingCells = new Map((matrix.cells ?? []).map((cell) => [`${cell.row}:${cell.column}`, cell]));
  const cells = Array.from({ length: matrix.rows * matrix.columns }, (_, index) => {
    const row = Math.floor(index / matrix.columns);
    const column = index % matrix.columns;
    const existing = existingCells.get(`${row}:${column}`);
    const assemblies = (existing?.assemblies ?? []).filter((assembly) => assembly.definitionId !== 'rgb-led');
    if (preset.led) assemblies.push({ id: 'rgb-led', definitionId: 'rgb-led', offset: { x: -5, y: -12 }, side: 'back' });
    return { ...existing, row, column, enabled: existing?.enabled ?? true, definitionId: preset.definitionId, assemblies };
  });
  const required = new Set([preset.definitionId, 'matrix-diode', ...(preset.led ? ['rgb-led'] : [])]);
  const definitions = builtinDefinitions().filter((definition) => required.has(definition.id));
  return { matrix: { ...matrix, definitionId: preset.definitionId, diodes: true, cells }, definitions };
};

export { matrixWithPreset };

const modes: Mode[] = ['Design', 'Library'];
const unit = 10;
const PITCH_MM = 19.05;
const nudgeStep = 0.1;
const nudgeLargeStep = 1;
const makeId = (): string => `ui-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
type ThemePreference = 'system' | 'light' | 'dark';
const THEME_KEY = 'boardstudio:v2:theme';

const readThemePreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
};

const systemColorScheme = (): 'light' | 'dark' => {
  try {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const Workbench = ({ document, scene, onEdit, onUndo, onRedo, onExport, compileFootprints, onNewProject, onImport, onImportFootprint, onImportModel, onSelectLibraryModel, libraryModelPreviews, libraryModelStatus, onRequestCaseModels, onDuplicateDesign, onProjectMatrices, onModeChange, casePreview, componentPreviews, embedUsedModels = true, onEmbedUsedModelsChange, selectedBoardId: selectedBoardIdProp, onSelectBoard }: Props) => {
  const [mode, setMode] = useState<Mode>('Design');
  const [lastDesignMode, setLastDesignMode] = useState<Mode>('Design');
  const [commandMenu, setCommandMenu] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'properties' | 'relations'>('properties');
  const [showFindings, setShowFindings] = useState(false);
  const [showFootprints, setShowFootprints] = useState(false);
  const [originPicking, setOriginPicking] = useState(false);
  const [geometrySnap, setGeometrySnap] = useState(true);
  const [gapSnap, setGapSnap] = useState(true);
  const [gapOverride, setGapOverride] = useState<string>('');
  const [snapGuide, setSnapGuide] = useState<ReturnType<typeof snapPart>>();
  const [alignTargetId, setAlignTargetId] = useState('');
  const [splayAffect, setSplayAffect] = useState<'column' | 'following'>('following');
  const splayDrag = useRef<{ matrix: Matrix; pending?: MatrixSplayChange; origin: Vec2; column: number; kind: 'origin' | 'angle'; pointerId: number; startAngle: number; target: SVGGElement; transactionId: string; bounds: ReturnType<typeof getBounds> } | null>(null);
  const objectsPanel = usePanelSettings('left');
  const inspectorPanel = usePanelSettings('right');
  const compactObjects = useCompactPanel('left');
  const compactInspector = useCompactPanel('right');
  const cameraViews = useRef(new Map<string, { zoom: number; pan: Vec2 }>());
  const designView = mode === 'Design' || mode === 'PCB' || mode === 'Case';
  const viewLabel = mode === 'Design' ? 'Layout' : mode === 'Library' ? 'Parts' : mode;

  const [themePreference, setThemePreference] = useState<ThemePreference>(readThemePreference);
  const [systemScheme, setSystemScheme] = useState(systemColorScheme);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const projectTriggerRef = useRef<HTMLButtonElement>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [scope, setScope] = useState<SelectionScope | null>(null);
  const [expandedTree, setExpandedTree] = useState<Set<string>>(() => new Set());
  const [treeGrouping, setTreeGrouping] = useState<'column' | 'row'>(() => { try { return localStorage.getItem('boardstudio:v2:tree-grouping') === 'row' ? 'row' : 'column'; } catch { return 'column'; } });
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [pendingPart, setPendingPart] = useState<PartDefinition | null>(null);
  const [placementPoint, setPlacementPoint] = useState<Vec2>({ x: 0, y: 0 });
  const addPartRef = useRef<HTMLButtonElement>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryChoice, setLibraryChoice] = useState('');
  const [library3dOpen, setLibrary3dOpen] = useState(false);
  const [libraryAssembly, setLibraryAssembly] = useState<MatrixPresetId | null>(null);
  const [matrixSetup, setMatrixSetup] = useState(false);
  const [pairSetup, setPairSetup] = useState(false);
  const [pairPlacement, setPairPlacement] = useState<PairPlacement | null>(null);
  const [layoutTargetId, setLayoutTargetId] = useState('');
  const [pendingLayoutId, setPendingLayoutId] = useState('');
  const [matrixRows, setMatrixRows] = useState('');
  const [matrixColumns, setMatrixColumns] = useState('');
  const [matrixPreset, setMatrixPreset] = useState<MatrixPresetId>('mx-solder');
  const [libraryParameters, setLibraryParameters] = useState<Record<string, JsonValue>>({});
  const [compiledPreview, setCompiledPreview] = useState<{ key: string; results: CompiledFootprint[]; error?: string; pending: boolean }>({ key: '', results: [], pending: false });
  const compileSequence = useRef(0);
  const [matrixGhost, setMatrixGhost] = useState<Matrix | null>(null);
  const [matrixGhostScenes, setMatrixGhostScenes] = useState<MatrixScene[]>([]);
  const matrixDraftSeq = useRef(0);
  const matrixGhostProjections = useMemo(() => new Map(matrixGhostScenes.map((projection) => [projection.matrixId, matrixSceneAdapter(projection)])), [matrixGhostScenes]);
  const [snapFraction, setSnapFraction] = useState(0.25);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Vec2>({ x: 0, y: 0 });
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [outlineDraft, setOutlineDraft] = useState<Vec2[]>([]);
  const [outlineActive, setOutlineActive] = useState(false);
  const [outlineSettingsOpen, setOutlineSettingsOpen] = useState(false);
  const [outlineOperation, setOutlineOperation] = useState<'add' | 'subtract'>('add');
  useEffect(() => { setOutlineDraft([]); setOutlineActive(false); }, [mode, selectedBoardIdProp]);
  const [newNetName, setNewNetName] = useState('');
  const [scriptsOpen, setScriptsOpen] = useState(false);
  const [activeScriptId, setActiveScriptId] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [scriptSource, setScriptSource] = useState('');
  const [scriptEnabled, setScriptEnabled] = useState(true);
  const [caseBodyId, setCaseBodyId] = useState('');
  const [caseControlsTarget, setCaseControlsTarget] = useState<HTMLDivElement | null>(null);
  const [projectName, setProjectName] = useState(document.name);
  const [boardName, setBoardName] = useState('');
  const [localBoardId, setLocalBoardId] = useState('');
  const [definitionError, setDefinitionError] = useState('');
  const [constraintKind, setConstraintKind] = useState<Constraint['kind']>('offset');
  const [constraintSourceId, setConstraintSourceId] = useState('');
  const [constraintX, setConstraintX] = useState('0');
  const [constraintY, setConstraintY] = useState('0');
  const [constraintRotation, setConstraintRotation] = useState('0');
  const colorScheme = themePreference === 'system' ? systemScheme : themePreference;

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = (event: MediaQueryListEvent) => setSystemScheme(event.matches ? 'dark' : 'light');
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    window.document.documentElement.dataset.theme = colorScheme;
    window.document.documentElement.style.colorScheme = colorScheme;
    const meta = window.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = colorScheme === 'dark' ? '#151c26' : '#f7f8fa';
  }, [colorScheme]);

  useEffect(() => {
    if (!addPartOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !window.document.getElementById('wb-add-part')?.contains(event.target) && !addPartRef.current?.contains(event.target)) setAddPartOpen(false);
    };
    window.document.addEventListener('pointerdown', dismiss);
    return () => window.document.removeEventListener('pointerdown', dismiss);
  }, [addPartOpen]);

  const chooseTheme = (preference: ThemePreference) => {
    setThemePreference(preference);
    try { localStorage.setItem(THEME_KEY, preference); } catch { /* Keep the current session usable. */ }
  };

  useEffect(() => {
    if (!projectMenuOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !window.document.querySelector('.wb-project-menu')?.contains(event.target)) {
        setProjectMenuOpen(false);
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProjectMenuOpen(false);
        projectTriggerRef.current?.focus();
      }
    };
    window.document.addEventListener('pointerdown', dismiss);
    window.document.addEventListener('keydown', keydown);
    return () => {
      window.document.removeEventListener('pointerdown', dismiss);
      window.document.removeEventListener('keydown', keydown);
    };
  }, [projectMenuOpen]);
  const [constraintAxis, setConstraintAxis] = useState<'vertical' | 'horizontal'>('vertical');
  const [constraintCoordinate, setConstraintCoordinate] = useState('0');
  const [keyboardStatus, setKeyboardStatus] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const wheelZoom = useRef<(event: WheelEvent) => void>(() => undefined);
  const dragRef = useRef<Drag | null>(null);
  const staggerDragRef = useRef<StaggerDrag | null>(null);
  const suppressClick = useRef(false);
  const spaceDown = useRef(false);
  const panDrag = useRef<{ pointerId: number; startX: number; startY: number; pan: Vec2; width: number; height: number } | null>(null);
  const transaction = useRef(makeId());
  const sceneHandlers = useRef<SceneHandlers | null>(null);

  const definitions = useMemo(() => new Map(document.definitions.map((item) => [item.id, item])), [document.definitions]);
  const builtinCompiledCatalog = useMemo(() => builtinCatalog(), []);
  const libraryDefinitions = useMemo(() => {
    const entries = new Map(builtinDefinitions().map((definition) => [definition.id, definition]));
    for (const definition of ergogenCatalogue()) entries.set(definition.id, definition);
    for (const definition of document.definitions) entries.set(definition.id, definition);
    return [...entries.values()];
  }, [document.definitions]);
  const libraryCompanions = useMemo(() => libraryAssembly
    ? libraryDefinitions.filter((definition) => definition.id === 'matrix-diode' || (matrixPresetDefinitions[libraryAssembly].led && definition.id === 'rgb-led')).map((definition) => ({
      definition,
      at: definition.id === 'matrix-diode' ? { x: 6, y: -10 } : { x: -5, y: -12 },
    }))
    : [], [libraryAssembly, libraryDefinitions]);
  const filteredLibrary = useMemo(() => {
    const query = librarySearch.trim().toLocaleLowerCase();
    return libraryDefinitions.filter((definition) => !query || `${definition.name} ${definition.kind}`.toLocaleLowerCase().includes(query));
  }, [libraryDefinitions, librarySearch]);
  const selectedLibraryDefinition = libraryDefinitions.find((definition) => definition.id === libraryChoice) ?? filteredLibrary[0] ?? libraryDefinitions[0];
  const copperGenerator = ['builtin:mx-hotswap', 'builtin:choc-hotswap', 'builtin:rgb-led'].includes(selectedLibraryDefinition?.generator?.source ?? '');
  const ergogenGenerator = isErgogen(selectedLibraryDefinition?.generator?.source);
  const parameterSchema = useMemo(() => generatorParameters(selectedLibraryDefinition), [selectedLibraryDefinition?.generator?.source]);
  const generatorPreview = useMemo(() => selectedLibraryDefinition
    ? generatorDraft(selectedLibraryDefinition, libraryParameters, new Map(document.assets.map((asset) => [asset.id, asset.name])))
    : undefined, [selectedLibraryDefinition, libraryParameters, document.assets]);
  const previewDefinition = generatorPreview?.definition;
  const builtinDefault = previewDefinition?.generator?.source.startsWith('builtin:')
    ? builtinCompiledCatalog.find((entry) => entry.definition.id === previewDefinition.id && entry.geometry.side === 'front')
    : undefined;
  const useBuiltinDefault = canUseBuiltinDefault(previewDefinition, builtinDefault);
  const libraryPreviewDefinitions = useMemo(() => previewDefinition
    ? [previewDefinition, ...libraryCompanions.map((entry) => entry.definition)]
    : [], [previewDefinition, libraryCompanions]);
  const compileDefinitions = useMemo(() => libraryPreviewsToCompile(libraryPreviewDefinitions, builtinCompiledCatalog), [libraryPreviewDefinitions, builtinCompiledCatalog]);
  const libraryCompileKey = JSON.stringify(compileDefinitions.map((definition) => [definition.id, definition]));
  const currentCompileResults = compiledPreview.key === libraryCompileKey && !compiledPreview.pending ? compiledPreview.results : [];
  const currentCompiledPreview = previewDefinition ? libraryPreviewFor(previewDefinition, currentCompileResults, builtinCompiledCatalog) : undefined;
  const previewCompilePending = compileDefinitions.length > 0 && (compiledPreview.key !== libraryCompileKey || compiledPreview.pending);
  const previewCompileError = compiledPreview.key === libraryCompileKey ? compiledPreview.error : undefined;
  const libraryCompiled = useMemo(() => libraryPreviewDefinitions
    .map((definition) => libraryPreviewFor(definition, currentCompileResults, builtinCompiledCatalog))
    .filter((entry): entry is CompiledFootprint => Boolean(entry)), [libraryPreviewDefinitions, currentCompileResults, builtinCompiledCatalog]);
  useEffect(() => {
    if (!compileDefinitions.length) return;
    const definitions = compileDefinitions;
    setCompiledPreview({ key: libraryCompileKey, results: [], pending: true });
    return runLatest(compileSequence, () => compileFootprints(definitions.map((definition) => ({
      id: `library-preview:${definition.id}`,
      definition,
      parameters: {},
      side: 'front',
    }))), (results) => {
      setCompiledPreview(results.length === definitions.length
        ? { key: libraryCompileKey, results, pending: false }
        : { key: libraryCompileKey, results: [], error: 'Rust returned an incomplete footprint preview batch.', pending: false });
    }, (cause) => {
      setCompiledPreview({ key: libraryCompileKey, results: [], error: cause instanceof Error ? cause.message : String(cause), pending: false });
    });
  }, [compileFootprints, libraryCompileKey]);
  useEffect(() => {
    const defaults: Record<string, JsonValue> = {};
    for (const [key, parameter] of Object.entries(parameterSchema)) {
      if (parameter.value !== undefined) defaults[key] = parameter.value as JsonValue;
    }
    Object.assign(defaults, selectedLibraryDefinition?.generator?.parameters ?? {});
    setLibraryParameters(defaults);
  }, [selectedLibraryDefinition?.id, selectedLibraryDefinition?.generator?.parameters, parameterSchema]);
  const updateGenerator = (parameter: string, value: JsonValue) => {
    setLibraryParameters((current) => ({ ...current, [parameter]: value }));
  };
  const saveGenerator = () => {
    if (!selectedLibraryDefinition?.generator || !previewDefinition?.generator || generatorPreview?.error) return;
    const definition = isErgogen(previewDefinition.generator.source) ? normalizeDefinition(previewDefinition) : previewDefinition;
    const ir = currentCompiledPreview?.geometry ?? (useBuiltinDefault ? builtinDefault?.geometry : undefined);
    if (!isErgogen(definition.generator?.source) && !ir) return;
    const next = isErgogen(definition.generator?.source)
      ? definition
      : { ...definition, pads: ir!.pads.map((pad) => ({ ...pad })), courtyard: ir!.courtyard.map((point) => ({ ...point })) };
    const original = document.definitions.find((entry) => entry.id === next.id) ?? selectedLibraryDefinition;
    const instances = document.parts.filter((part) => part.definitionId === next.id);
    let nets = document.nets.map((net) => ({ ...net, pins: [...net.pins] }));
    for (const part of instances) {
      const oldTerminals = Object.entries(original.terminals ?? {});
      const assignments = oldTerminals.map(([terminal, oldPads]) => ({
        terminal,
        oldPads,
        netIds: [...new Set(document.nets.filter((net) => net.pins.some((pin) => pin.partId === part.id && oldPads.includes(pin.padId))).map((net) => net.id))],
      }));
      for (const { terminal, oldPads, netIds } of assignments) {
        const assignment = netIds;
        if (!assignment.length) continue;
        const newPads = next.terminals?.[terminal];
        if (assignment.length > 1 || !newPads?.length) {
          setDefinitionError(`Cannot apply these generator settings: assigned ${terminal} terminal pads would be lost or are split across nets.`);
          return;
        }
      }
      const assignedOldPads = new Set(assignments.flatMap(({ oldPads }) => oldPads));
      nets = nets.map((net) => ({ ...net, pins: net.pins.filter((pin) => pin.partId !== part.id || !assignedOldPads.has(pin.padId)) }));
      for (const { terminal, netIds } of assignments) {
        if (!netIds.length) continue;
        const newPads = next.terminals?.[terminal] ?? [];
        nets.find((net) => net.id === netIds[0])?.pins.push(...newPads.map((padId) => ({ partId: part.id, padId })));
      }
    }
    const saved = document.definitions.some((entry) => entry.id === next.id)
      ? document.definitions.map((entry) => entry.id === next.id ? next : entry)
      : [...document.definitions, next];
    setDefinitionError('');
    emit({ kind: 'replace-document', document: { ...document, definitions: saved, nets } }, [next.id, ...instances.map((part) => part.id)]);
  };
  const poses = useMemo(() => new Map(scene.transforms.map((item) => [item.id, item.pose])), [scene.transforms]);
  const treeParts = useMemo(() => new Map(document.parts.map((part) => [part.id, part])), [document.parts]);
  const parts = useMemo(() => new Map(document.parts.map((part) => [part.id, { ...part, pose: poses.get(part.id) ?? part.pose }])), [document.parts, poses]);
  const activeParts = selected.map((id) => parts.get(id)).filter((part): part is Part => Boolean(part));
  const activePart = activeParts[0];
  const activeDefinition = activePart ? definitions.get(activePart.definitionId) : undefined;
  const activeErgogenParams = activeDefinition?.generator && isErgogen(activeDefinition.generator.source) ? ergogenParameterSchema(activeDefinition.generator.source) : {};
  const updatePartGeneratorParameter = (key: string, value: JsonValue | undefined) => {
    if (!activePart) return;
    const generatorParameters = { ...(activePart.generatorParameters ?? {}) };
    if (value === undefined || value === '') delete generatorParameters[key]; else generatorParameters[key] = value;
    const next = { ...activePart, generatorParameters };
    emit({ kind: 'replace-document', document: { ...document, parts: document.parts.map((part) => part.id === next.id ? next : part) } }, [next.id]);
  };
  const activeScript = document.scripts.find((script) => script.id === activeScriptId);
  const selectedBoard = document.boards.find((board) => board.id === (selectedBoardIdProp ?? localBoardId)) ?? document.boards[0];
  const activeCaseBody = document.caseBodies.find((body) => body.id === caseBodyId && (!selectedBoard || body.boardId === selectedBoard.id))
    ?? document.caseBodies.find((body) => !selectedBoard || body.boardId === selectedBoard.id);
  const activeModelDefinition = selectedLibraryDefinition;
  const selectedBoardId = selectedBoard?.id ?? '';
  const boardPartIds = useMemo(() => new Set(selectedBoard?.partIds ?? document.parts.map((part) => part.id)), [selectedBoard, document.parts]);
  const treeVisibleParts = useMemo(() => document.parts.filter((part) => boardPartIds.has(part.id)), [document.parts, boardPartIds]);
  const visibleParts = useMemo(() => [...parts.values()].filter((part) => boardPartIds.has(part.id)), [parts, boardPartIds]);
  const visibleMatrices = useMemo(() => document.matrices.filter((matrix) => matrix.boardId ? matrix.boardId === selectedBoardId : matrix.partIds.some((id) => boardPartIds.has(id)) || (!matrix.partIds.length && document.boards.length <= 1)), [document.matrices, selectedBoardId, boardPartIds, document.boards.length]);
  const boardLayouts = useMemo(() => (document.layouts ?? []).filter((layout) => layout.boardId === selectedBoardId), [document.layouts, selectedBoardId]);
  const activeLayout = boardLayouts.find((layout) => layout.matrixId === scope?.matrixId || (activePart && (layout.partIds.includes(activePart.id) || document.matrices.find((matrix) => matrix.id === layout.matrixId)?.partIds.includes(activePart.id))));
  const linkedLayout = activeLayout ? activeLayout.mirrorLink ? activeLayout : boardLayouts.find((layout) => layout.mirrorLink?.sourceId === activeLayout.id) : undefined;
  const partnerLayout = linkedLayout ? boardLayouts.find((layout) => layout.id === (linkedLayout.id === activeLayout?.id ? linkedLayout.mirrorLink?.sourceId : linkedLayout.id)) : undefined;
  useEffect(() => setLayoutTargetId(activeLayout?.id ?? ''), [activeLayout?.id]);
  const matrixMap = useMemo(() => new Map(visibleMatrices.map((matrix) => [matrix.id, matrix])), [visibleMatrices]);
  const matrixScenes = useMemo(() => new Map(scene.matrixScenes.map((item) => [item.matrixId, matrixSceneAdapter(item)])), [scene.matrixScenes]);
  const matrixCellOverrides = useMemo(() => new Map(visibleMatrices.map((matrix) => [
    matrix.id,
    new Map((matrix.cells ?? []).map((cell) => [`${cell.row}:${cell.column}`, cell])),
  ])), [visibleMatrices]);
  const memberMaps = useMemo(() => new Map(visibleMatrices.map((matrix) => [matrix.id, matrixScenes.get(matrix.id)?.members ?? new Map<string, string>()])), [visibleMatrices, matrixScenes]);
  const matrixPartLookup = useMemo(() => {
    const lookup = new Map<string, { matrixId: string; row: number; column: number; assemblyId?: string }>();
    for (const matrix of visibleMatrices) {
      for (const projected of matrixScenes.get(matrix.id)?.scene?.cells ?? []) {
        const { row, column, memberId } = projected;
        if (!memberId) continue;
        lookup.set(memberId, { matrixId: matrix.id, row, column });
        const cell = matrixCellOverrides.get(matrix.id)?.get(`${row}:${column}`);
        for (const assembly of cell?.assemblies ?? []) lookup.set(`${memberId}/${assembly.id}`, { matrixId: matrix.id, row, column, assemblyId: assembly.id });
        if (matrix.diodes && cell?.diode !== false) lookup.set(`${memberId}/diode`, { matrixId: matrix.id, row, column, assemblyId: 'diode' });
      }
      for (const id of matrix.partIds) {
        if (lookup.has(id)) continue;
        const prefix = `matrix/${matrix.id}/r`;
        if (!id.startsWith(prefix)) continue;
        const coordinate = id.slice(prefix.length).match(/^(\d+)c(\d+)(?:\/(.+))?$/u);
        if (!coordinate) continue;
        lookup.set(id, { matrixId: matrix.id, row: Number(coordinate[1]), column: Number(coordinate[2]), assemblyId: coordinate[3] });
      }
    }
    return lookup;
  }, [visibleMatrices, matrixCellOverrides, matrixScenes]);
  const activeConstraint = activePart
    ? document.constraints.find((constraint) => constraint.targetPartId === activePart.id && boardPartIds.has(constraint.sourcePartId))
    : undefined;
  const defaultConstraintSourceId = visibleParts.find((part) => part.id !== activePart?.id)?.id ?? '';
  const constrainedTargetIds = useMemo(() => new Set(document.constraints
    .filter((constraint) => boardPartIds.has(constraint.sourcePartId) && boardPartIds.has(constraint.targetPartId))
    .map((constraint) => constraint.targetPartId)), [document.constraints, boardPartIds]);
  const selectedIds = useMemo(() => new Set(selected), [selected]);
  const boardNets = useMemo(() => selectedBoard
    ? document.nets.filter((net) => selectedBoard.netIds.includes(net.id) || net.pins.some((pin) => selectedBoard.partIds.includes(pin.partId)))
    : document.nets, [document.nets, selectedBoard]);
  const visibleContours = selectedBoard
    ? scene.boardContours.find((entry) => entry.boardId === selectedBoard.id)?.contours ?? (document.boards.length === 1 ? scene.contours : [])
    : scene.contours;
  const selectedBoardReadiness = selectedBoard ? scene.boardReadiness?.find((entry) => entry.boardId === selectedBoard.id) : undefined;
  const boardReady = selectedBoardReadiness?.pcb ?? (document.boards.length <= 1 ? scene.readiness.pcb : false);
  const caseReady = Boolean(activeCaseBody) && (selectedBoardReadiness?.case ?? (document.boards.length <= 1 ? scene.readiness.case : false));
  const bounds = useMemo(() => getBounds(poses, visibleParts, visibleContours, visibleMatrices, matrixScenes), [poses, visibleParts, visibleContours, visibleMatrices, matrixScenes]);
  const viewBounds = useMemo(() => cameraBounds(dragRef.current?.bounds ?? splayDrag.current?.bounds ?? bounds, zoom, pan), [bounds, zoom, pan]);
  const readiness = scene.readiness;
  const modeReady = mode === 'Design' ? (selectedBoardReadiness?.outline ?? readiness.outline) : mode === 'PCB' ? boardReady : mode === 'Case' ? caseReady : false;

  useEffect(() => {
    setScriptName(activeScript?.name ?? '');
    setScriptSource(activeScript?.source ?? '');
    setScriptEnabled(activeScript?.enabled ?? true);
  }, [activeScript?.id, activeScript?.source, activeScript?.enabled]);

  useEffect(() => setProjectName(document.name), [document.name]);
  useEffect(() => onModeChange?.(mode), [mode, onModeChange]);
  useEffect(() => {
    if (mode === 'Library' && library3dOpen && selectedLibraryDefinition) onSelectLibraryModel?.(selectedLibraryDefinition.id);
  }, [mode, library3dOpen, selectedLibraryDefinition, onSelectLibraryModel]);
  useEffect(() => {
    if (selectedBoardIdProp === undefined && selectedBoard) setLocalBoardId(selectedBoard.id);
    setBoardName(selectedBoard?.name ?? '');
    setPendingPart(null);
    setMatrixGhost(null);
    setPairPlacement(null);
    setPairSetup(false);
    setAddPartOpen(false);
    setSelected([]);
    setScope(null);
  }, [selectedBoardIdProp, selectedBoard?.id]);

  useEffect(() => {
    if (!matrixGhost || !onProjectMatrices) {
      setMatrixGhostScenes([]);
      return;
    }
    const requestId = ++matrixDraftSeq.current;
    const pair = pairPlacement ? pairAt(matrixGhost, pairPlacement, { x: 0, y: 0 }) : undefined;
    const drafts = pair ? [pair.matrix, pair.preview] : [{ ...matrixGhost, origin: { x: 0, y: 0 } }];
    setMatrixGhostScenes([]);
    void onProjectMatrices(drafts).then((scenes) => {
      if (requestId !== matrixDraftSeq.current) return;
      setMatrixGhostScenes(scenes ?? []);
    }).catch(() => {
      if (requestId === matrixDraftSeq.current) setMatrixGhostScenes([]);
    });
    return () => { matrixDraftSeq.current += 1; };
  }, [matrixGhost?.id, matrixGhost?.rows, matrixGhost?.columns, matrixGhost?.definitionId, matrixGhost?.pitch, matrixGhost?.edgeGap, matrixGhost?.rowOffsets, matrixGhost?.columnOffsets, matrixGhost?.columnSplays, matrixGhost?.columnStaggers, matrixGhost?.columnOrigins, matrixGhost?.mirror, matrixGhost?.rotation, matrixGhost?.cells, pairPlacement, document.revision, onProjectMatrices]);

  useEffect(() => {
    setExpandedTree((current) => {
      const next = new Set(current);
      if (selectedBoardId) { next.add(`board:${selectedBoardId}`); next.add(`layout:${selectedBoardId}`); }
      for (const matrix of visibleMatrices) next.add(`matrix:${matrix.id}`);
      return next;
    });
  }, [selectedBoardId, visibleMatrices]);

  useEffect(() => {
    const sourceId = activeConstraint?.sourcePartId ?? defaultConstraintSourceId;
    setConstraintKind(activeConstraint?.kind ?? 'offset');
    setConstraintSourceId(sourceId);
    setConstraintX(activeConstraint?.kind === 'offset' ? String(activeConstraint.offset.x) : '0');
    setConstraintY(activeConstraint?.kind === 'offset' ? String(activeConstraint.offset.y) : '0');
    setConstraintRotation(activeConstraint?.kind === 'offset' ? String(activeConstraint.rotation) : '0');
    setConstraintAxis(activeConstraint?.kind === 'mirror' ? activeConstraint.axis : 'vertical');
    setConstraintCoordinate(activeConstraint?.kind === 'mirror' ? String(activeConstraint.coordinate) : '0');
  }, [activePart?.id, selectedBoardId, activeConstraint?.id, defaultConstraintSourceId]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isTyping(event.target)) {
        spaceDown.current = true;
        event.preventDefault();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) onRedo();
        else onUndo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        onRedo();
      }
      if (event.key === 'Escape') {
        if (splayDrag.current) {
          const drag = splayDrag.current;
          commitMatrix(drag.matrix, 'preview', drag.transactionId);
          if (drag.target.hasPointerCapture(drag.pointerId)) drag.target.releasePointerCapture(drag.pointerId);
          splayDrag.current = null; return;
        }
        if (originPicking) { setOriginPicking(false); return; }
        setOutlineDraft([]);
        setOutlineActive(false);
        setSelected([]);
        setScope(null);
        setMatrixGhost(null);
        setMatrixSetup(false);
        setPairSetup(false);
        setPairPlacement(null);
        setPendingPart(null);
        setAddPartOpen(false);
        if (addPartOpen) addPartRef.current?.focus();
      }
      if (event.key === 'Enter' && !isTyping(event.target) && outlineActive && outlineDraft.length >= 3) {
        const feature: OutlineFeature = { id: makeId(), kind: 'polygon', points: outlineDraft, operation: outlineOperation };
        saveOutline(feature);
        setOutlineDraft([]);
        setOutlineActive(false);
      }
      if (event.key === 'Delete' && !isTyping(event.target) && (selected.length > 0 || scope?.kind === 'matrix')) {
        if (scope?.kind === 'matrix' && scope.matrixId) {
          emit({ kind: 'remove-matrix', id: scope.matrixId }, [scope.matrixId, ...selected]);
          setScope(null);
        } else emit({ kind: 'remove-parts', ids: selected }, selected);
        setSelected([]);
      }
    };
    const releaseSpace = (event: KeyboardEvent) => {
      if (event.code === 'Space') spaceDown.current = false;
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', releaseSpace);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', releaseSpace);
    };
  }, [onRedo, onUndo, selected, document.revision, outlineActive, outlineDraft, outlineOperation, addPartOpen, scope, originPicking]);

  const emit = (operation: EditCommand['operation'], targetIds: string[], phase: EditCommand['phase'] = 'commit', transactionId?: string) => {
    const currentTransaction = transactionId ?? (phase === 'preview' ? transaction.current : makeId());
    onEdit({
      baseRevision: document.revision,
      transactionId: currentTransaction,
      phase,
      targetIds,
      operation,
    });
    if (phase === 'commit') transaction.current = makeId();
  };

  const commitProjectName = () => {
    const name = projectName.trim();
    if (!name || name === document.name) {
      setProjectName(document.name);
      return;
    }
    emit({ kind: 'replace-document', document: { ...document, name } }, [document.id]);
  };

  const selectBoard = (id: string) => {
    if (onSelectBoard) onSelectBoard(id);
    else setLocalBoardId(id);
  };

  const changeMode = (next: Mode) => {
    if (next !== mode) {
      cameraViews.current.set(`${selectedBoardId}:${mode}`, { zoom, pan });
      const camera = cameraViews.current.get(`${selectedBoardId}:${next}`);
      setZoom(camera?.zoom ?? 1);
      setPan(camera?.pan ?? { x: 0, y: 0 });
    }
    if (next === 'Design' || next === 'PCB' || next === 'Case') setLastDesignMode(next);
    setCommandMenu(null);
    setOriginPicking(false);
    setPairSetup(false);
    setPairPlacement(null);
    setMatrixGhost(null);
    setShowFindings(false);
    setInspectorTab('properties');
    setLeftOpen(false);
    setMode(next);
    setScriptsOpen(false);
    setPendingPart(null);
    setAddPartOpen(false);
    if (next === 'Case' && selectedBoard) onRequestCaseModels?.(selectedBoard.id);
  };

  const changeScope = (kind: SelectionScope['kind']) => {
    if (!scope) return;
    const next: SelectionScope = { ...scope, kind };
    if (scope.matrixId) {
      next.row = scope.row ?? 0;
      next.column = scope.column ?? 0;
      if (kind === 'component') next.partId = scope.partId ?? memberMaps.get(scope.matrixId)?.get(`${next.row}:${next.column}`) ?? matrixCellId(scope.matrixId, next.row, next.column);
      if (kind !== 'component') delete next.partId;
    }
    selectScope(next);
  };

  const addBoard = () => {
    const index = document.boards.length + 1;
    const board = { id: makeId(), name: `Board ${index}`, outlineIds: [] as string[], partIds: [] as string[], netIds: [] as string[], thickness: 1.6 };
    const envelope: OutlineFeature = { id: makeId(), kind: 'part-envelope', settings: defaultOutlineSettings, partIds: [], margin: 4, operation: 'add' };
    board.outlineIds = [envelope.id];
    emit({ kind: 'replace-document', document: { ...document, outline: [...document.outline, envelope], boards: [...document.boards, board] } }, [board.id, envelope.id]);
    selectBoard(board.id);
  };

  const commitBoardName = () => {
    if (!selectedBoard) return;
    const name = boardName.trim();
    if (!name || name === selectedBoard.name) {
      setBoardName(selectedBoard.name);
      return;
    }
    const boards = document.boards.map((board) => board.id === selectedBoard.id ? { ...board, name } : board);
    emit({ kind: 'replace-document', document: { ...document, boards } }, [selectedBoard.id]);
  };

  const saveOutline = (feature: OutlineFeature) => {
    if (!selectedBoard) return;
    const outlineIds = selectedBoard.outlineIds.includes(feature.id) ? selectedBoard.outlineIds : [...selectedBoard.outlineIds, feature.id];
    const boards = document.boards.map((board) => board.id === selectedBoard.id ? { ...board, outlineIds } : board);
    emit({ kind: 'replace-document', document: { ...document, outline: [...document.outline, feature], boards } }, [feature.id, selectedBoard.id]);
  };

  const choosePart = (id: string, additive = false) => {
    if (outlineActive || pendingPart) return;
    setOutlineSettingsOpen(false);
    if (suppressClick.current) return;
    setSelected((current) => additive
      ? current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      : [id]);
    const matrixCell = matrixPartLookup.get(id);
    if (matrixCell && scope?.matrixId === matrixCell.matrixId && ['matrix', 'row', 'column'].includes(scope.kind)) {
      selectScope({ ...scope, row: matrixCell.row, column: matrixCell.column });
      return;
    }
    setScope(matrixCell && !matrixCell.assemblyId && scope?.kind !== 'component'
      ? { kind: 'key', ...matrixCell }
      : { kind: 'component', ...(matrixCell ?? {}), partId: id });
    setRightOpen(true);
  };

  const selectScope = useCallback((next: SelectionScope) => {
    setOutlineSettingsOpen(false);
    const matrix = next.matrixId ? matrixMap.get(next.matrixId) : undefined;
    let ids: string[] = [];
    if (next.kind === 'component' && next.partId) {
      ids = [next.partId];
    } else if (matrix) {
      if (next.kind === 'matrix') ids = matrix.partIds;
      if (next.kind === 'row' && next.row !== undefined) {
        ids = matrix.partIds.filter((id) => matrixPartLookup.get(id)?.row === next.row);
      }
      if (next.kind === 'column' && next.column !== undefined) {
        ids = matrix.partIds.filter((id) => matrixPartLookup.get(id)?.column === next.column);
      }
      if (next.kind === 'key' && next.row !== undefined && next.column !== undefined) {
        ids = [memberMaps.get(matrix.id)?.get(`${next.row}:${next.column}`) ?? matrixCellId(matrix.id, next.row, next.column)];
      }
    }
    const liveIds = ids.filter((id) => boardPartIds.has(id));
    setScope(next);
    setSelected(liveIds);
    setRightOpen(true);
  }, [matrixMap, boardPartIds, matrixPartLookup, memberMaps]);

  const toggleTree = useCallback((id: string) => setExpandedTree((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }), []);

  const treeEntries = useMemo<TreeEntry[]>(() => {
    const rows: TreeEntry[] = [];
    const boardKey = `board:${selectedBoardId}`;
    const boardExpanded = expandedTree.has(boardKey);
    rows.push({
      id: boardKey,
      label: selectedBoard?.name ?? 'Board',
      detail: `${visibleParts.length} parts`,
      level: 0,
      kind: 'board',
      expandable: true,
      expanded: boardExpanded,
      onToggle: () => toggleTree(boardKey),
      onSelect: () => { setScope(null); setSelected([]); setOutlineSettingsOpen(false); if (!boardExpanded) toggleTree(boardKey); },
    });
    if (!boardExpanded) return rows;
    const memberIds = new Set<string>();
    for (const matrix of visibleMatrices) {
      for (const id of matrix.partIds) memberIds.add(id);
      const matrixKey = `matrix:${matrix.id}`;
      const half = boardLayouts.find((layout) => layout.matrixId === matrix.id);
      const isExpanded = expandedTree.has(half ? `half:${half.id}` : matrixKey);
      rows.push({
        id: matrixKey,
        label: matrix.name?.trim() || `Matrix ${document.matrices.indexOf(matrix) + 1}`,
        detail: `${[...(memberMaps.get(matrix.id)?.values() ?? [])].filter((id) => treeParts.has(id)).length} keys`,
        level: 1,
        kind: 'matrix',
        expandable: true,
        expanded: isExpanded,
        selected: scope?.kind === 'matrix' && scope.matrixId === matrix.id,
        onToggle: () => toggleTree(matrixKey),
        onSelect: () => selectScope({ kind: 'matrix', matrixId: matrix.id }),
      });
      const projection = matrixScenes.get(matrix.id)?.scene;
      if (!isExpanded || !projection) continue;
      const columnCount = projection.columns.length;
      const rowCount = projection.cells.length / columnCount;
      const groupCount = treeGrouping === 'column' ? columnCount : rowCount;
      const keyCount = treeGrouping === 'column' ? rowCount : columnCount;
      for (let group = 0; group < groupCount; group++) {
        const groupKey = `${treeGrouping}:${matrix.id}:${group}`;
        const groupExpanded = expandedTree.has(groupKey);
        const enabledCount = Array.from({ length: keyCount }, (_, index) => treeParts.has(memberMaps.get(matrix.id)?.get(treeGrouping === 'column' ? `${index}:${group}` : `${group}:${index}`) ?? '')).filter(Boolean).length;
        rows.push({
          id: groupKey, label: `${treeGrouping === 'column' ? 'Column' : 'Row'} ${group + 1}`,
          detail: `${enabledCount} keys`, level: 2, kind: treeGrouping, expandable: true, expanded: groupExpanded,
          selected: scope?.kind === treeGrouping && scope.matrixId === matrix.id && scope[treeGrouping] === group,
          onToggle: () => toggleTree(groupKey),
          onSelect: () => selectScope({ kind: treeGrouping, matrixId: matrix.id, [treeGrouping]: group }),
        });
        if (!groupExpanded) continue;
        for (let index = 0; index < keyCount; index++) {
          const row = treeGrouping === 'column' ? index : group;
          const column = treeGrouping === 'column' ? group : index;
          const part = treeParts.get(memberMaps.get(matrix.id)?.get(`${row}:${column}`) ?? '');
          const cell = matrixCellOverrides.get(matrix.id)?.get(`${row}:${column}`);
          const keyId = `key:${matrix.id}:${row}:${column}`;
          const components = [
            ...(matrix.diodes && cell?.diode !== false ? [{ id: 'diode', definitionId: 'matrix-diode', label: 'Diode' }] : []),
            ...(cell?.assemblies ?? []).map((assembly) => ({ id: assembly.id, definitionId: assembly.definitionId, label: definitions.get(assembly.definitionId)?.name ?? 'Component' })),
          ];
          rows.push({
            id: keyId,
            label: `Key ${row + 1}.${column + 1}`,
            detail: !part ? 'Empty slot' : part.reference,
            level: 3,
            kind: 'key',
            expandable: components.length > 0,
            expanded: expandedTree.has(keyId),
            selected: scope?.kind === 'key' && scope.matrixId === matrix.id && scope.row === row && scope.column === column,
            onToggle: () => toggleTree(keyId),
            onSelect: () => selectScope({ kind: 'key', matrixId: matrix.id, row, column }),
            onKeyDown: part ? (event) => nudgePart(event, part) : undefined,
          });
          if (expandedTree.has(keyId)) {
            for (const component of components) {
              const partId = `${memberMaps.get(matrix.id)?.get(`${row}:${column}`) ?? matrixCellId(matrix.id, row, column)}/${component.id}`;
              rows.push({
                id: `component:${partId}`,
                label: component.label,
                detail: component.id === 'diode' ? 'Automatic companion' : 'Cell component',
                level: 4,
                kind: 'component',
                selected: scope?.kind === 'component' && scope.partId === partId,
                onSelect: () => selectScope({ kind: 'component', matrixId: matrix.id, row, column, partId }),
              });
            }
          }
        }
      }

    }
    for (const part of treeVisibleParts) {
      if (memberIds.has(part.id)) continue;
      rows.push({
        id: `component:${part.id}`,
        label: part.reference,
        detail: `${definitions.get(part.definitionId)?.name ?? 'Component'} · ${part.pose.at.x.toFixed(1)}, ${part.pose.at.y.toFixed(1)}`,
        level: 1,
        kind: 'component',
        selected: scope?.kind === 'component' && scope.partId === part.id,
        onSelect: () => selectScope({ kind: 'component', partId: part.id }),
        onKeyDown: (event) => nudgePart(event, part),
      });
    }
    const groups = new Map<string, TreeEntry[]>();
    let owner: Layout | undefined;
    for (const entry of rows.slice(1)) {
      if (entry.kind === 'matrix') owner = boardLayouts.find((layout) => `matrix:${layout.matrixId}` === entry.id);
      if (entry.level === 1 && entry.kind === 'component') owner = boardLayouts.find((layout) => layout.partIds.some((id) => `component:${id}` === entry.id));
      const key = owner?.id ?? '';
      const children = groups.get(key) ?? [];
      if (!owner || entry.kind !== 'matrix') children.push({ ...entry, level: owner ? Math.max(2, entry.level) : entry.level + 1, selected: mode === 'Design' && entry.selected,
        onSelect: () => { changeMode('Design'); entry.onSelect(); } });
      groups.set(key, children);
    }
    const result: TreeEntry[] = [rows[0]];
    const layoutKey = `layout:${selectedBoardId}`;
    const layoutExpanded = expandedTree.has(layoutKey);
    if (groups.has('') || boardLayouts.length === 0) result.push({
      id: layoutKey, label: 'Layout', kind: 'layout', level: 1, expandable: true,
      expanded: layoutExpanded, selected: mode === 'Design' && !scope,
      onToggle: () => toggleTree(layoutKey), onSelect: () => { changeMode('Design'); setExpandedTree((current) => new Set([...current, layoutKey])); },
    }, ...(layoutExpanded ? groups.get('') ?? [] : []));
    for (const layout of boardLayouts) {
      const key = `half:${layout.id}`;
      const expanded = expandedTree.has(key);
      const linked = Boolean(layout.mirrorLink || boardLayouts.some((other) => other.mirrorLink?.sourceId === layout.id));
      result.push({ id: key, label: layout.name, kind: 'layout', level: 1, expandable: true, expanded,
        detail: linked ? 'Linked' : 'Independent', selected: mode === 'Design' && scope?.kind === 'matrix' && scope.matrixId === layout.matrixId,
        onToggle: () => toggleTree(key), onSelect: () => { changeMode('Design'); selectScope({ kind: 'matrix', matrixId: layout.matrixId }); },
      }, ...(expanded ? groups.get(layout.id) ?? [] : []));
    }
    for (const branch of ['PCB', 'Case'] as const) {
      const key = `${branch}:${selectedBoardId}`;
      const expanded = expandedTree.has(key);
      result.push({ id: key, label: branch, kind: branch === 'PCB' ? 'pcb' : 'case', level: 1,
        expandable: true, expanded, selected: mode === branch,
        onToggle: () => toggleTree(key), onSelect: () => changeMode(branch) });
      if (expanded && branch === 'PCB') {
        for (const part of treeVisibleParts) result.push({ id: `pcb:${part.id}`, label: part.reference,
          detail: part.side, kind: 'component', level: 2, selected: mode === 'PCB' && selected.includes(part.id),
          onSelect: () => { changeMode('PCB'); selectScope({ kind: 'component', partId: part.id }); } });
      }
      if (expanded && branch === 'Case') {
        for (const body of document.caseBodies.filter((body) => body.boardId === selectedBoardId)) result.push({
          id: `case:${body.id}`, label: body.name, kind: 'case', level: 2, selected: mode === 'Case' && activeCaseBody?.id === body.id,
          onSelect: () => { changeMode('Case'); setCaseBodyId(body.id); setRightOpen(true); } });
      }
    }
    return result;
  }, [mode, selected, document.caseBodies, activeCaseBody?.id, selectedBoardId, selectedBoard?.name, visibleMatrices, treeVisibleParts, expandedTree, scope, treeParts, definitions, matrixCellOverrides, selectScope, toggleTree, treeGrouping, memberMaps, matrixScenes, document.matrices, boardLayouts]);

  const nudgePart = (event: React.KeyboardEvent<Element>, part: Part) => {
    if (!event.key.startsWith('Arrow') || part.locked) return;
    event.preventDefault();
    const step = event.shiftKey ? nudgeLargeStep : nudgeStep;
    const delta = event.key === 'ArrowLeft' ? { x: -step, y: 0 }
      : event.key === 'ArrowRight' ? { x: step, y: 0 }
        : event.key === 'ArrowUp' ? { x: 0, y: step }
          : event.key === 'ArrowDown' ? { x: 0, y: -step }
            : undefined;
    if (!delta) return;
    const ids = selected.includes(part.id) ? selected : [part.id];
    const moving = ids.map((id) => parts.get(id)).filter((item): item is Part => item !== undefined && !item.locked);
    if (moving.length === 0) return;
    setSelected(moving.map((item) => item.id));
    setRightOpen(true);
    emit({ kind: 'move-parts', positions: moving.map((item) => ({
      id: item.id,
      at: { x: item.pose.at.x + delta.x, y: item.pose.at.y + delta.y },
    })) }, moving.map((item) => item.id));
    const nextPose = moving.find((item) => item.id === part.id)?.pose.at;
    const x = (nextPose?.x ?? part.pose.at.x) + delta.x;
    const y = (nextPose?.y ?? part.pose.at.y) + delta.y;
    setKeyboardStatus(`${part.reference} moved ${event.key.slice(5).toLowerCase()} ${step} mm. Position X ${x.toFixed(1)}, Y ${y.toFixed(1)} mm.`);
  };

  const updatePosition = (axis: 'x' | 'y', value: number) => {
    if (!Number.isFinite(value) || activeParts.length === 0) return;
    const delta = value - activeParts[0].pose.at[axis];
    const positions = activeParts.map((part) => ({
      id: part.id,
      at: { ...part.pose.at, [axis]: part.pose.at[axis] + delta },
    }));
    emit({ kind: 'move-parts', positions }, selected);
  };

  const assignNet = (padId: string, netId: string) => {
    if (!activePart) return;
    const pin = { partId: activePart.id, padId };
    const nets = document.nets.map((net) => ({ ...net, pins: net.pins.filter((item) => item.partId !== pin.partId || item.padId !== pin.padId) }));
    const target = nets.find((net) => net.id === netId);
    if (target) target.pins.push(pin);
    emit({ kind: 'replace-document', document: { ...document, nets } }, [activePart.id, padId, netId]);
  };

  const assignTerminal = (terminal: string, padIds: string[], netId: string) => {
    if (!activePart) return;
    const padSet = new Set(padIds);
    const nets = document.nets.map((net) => ({ ...net, pins: net.pins.filter((pin) => pin.partId !== activePart.id || !padSet.has(pin.padId)) }));
    const target = nets.find((net) => net.id === netId);
    if (target) target.pins.push(...padIds.map((padId) => ({ partId: activePart.id, padId })));
    emit({ kind: 'replace-document', document: { ...document, nets } }, [activePart.id, ...padIds, terminal]);
  };

  const saveConstraint = () => {
    if (!activePart || !selectedBoard || !boardPartIds.has(activePart.id) || !boardPartIds.has(constraintSourceId) || constraintSourceId === activePart.id) return;
    const id = activeConstraint?.id ?? makeId();
    let constraint: Constraint;
    if (constraintKind === 'offset') {
      const x = Number(constraintX);
      const y = Number(constraintY);
      const rotation = Number(constraintRotation);
      if ([constraintX, constraintY, constraintRotation].some((value) => value.trim() === '') || ![x, y, rotation].every(Number.isFinite)) return;
      constraint = { id, kind: 'offset', sourcePartId: constraintSourceId, targetPartId: activePart.id, offset: { x, y }, rotation };
    } else {
      const coordinate = Number(constraintCoordinate);
      if (constraintCoordinate.trim() === '' || !Number.isFinite(coordinate)) return;
      constraint = { id, kind: 'mirror', sourcePartId: constraintSourceId, targetPartId: activePart.id, axis: constraintAxis, coordinate };
    }
    emit({ kind: 'set-constraint', constraint }, [constraint.id, constraint.sourcePartId, constraint.targetPartId]);
  };

  const removeConstraint = () => {
    if (!activeConstraint) return;
    emit({ kind: 'remove-constraint', id: activeConstraint.id }, [activeConstraint.id, activeConstraint.targetPartId]);
  };

  const addNet = () => {
    const name = newNetName.trim();
    if (!name) return;
    const net: ProjectDoc['nets'][number] = { id: makeId(), name, pins: [] };
    const boards = document.boards.map((board) => board.id === selectedBoard?.id ? { ...board, netIds: [...board.netIds, net.id] } : board);
    emit({ kind: 'replace-document', document: { ...document, nets: [...document.nets, net], boards } }, [net.id, selectedBoard?.id ?? ''].filter(Boolean));
    setNewNetName('');
  };

  const addScript = () => {
    const script: ProjectDoc['scripts'][number] = { id: makeId(), name: `Script ${document.scripts.length + 1}`, source: '', enabled: false };
    emit({ kind: 'replace-document', document: { ...document, scripts: [...document.scripts, script] } }, [script.id]);
    setActiveScriptId(script.id);
  };

  const applyScript = () => {
    if (!activeScript || !scriptSource.trim()) return;
    const scripts = document.scripts.map((script) => script.id === activeScript.id
      ? { ...script, name: scriptName, source: scriptSource, enabled: scriptEnabled }
      : script);
    emit({ kind: 'replace-document', document: { ...document, scripts } }, [activeScript.id]);
  };

  const addCaseBody = () => {
    if (!selectedBoard) return;
    const body: CaseBody = {
      id: makeId(),
      name: `${selectedBoard.name} plate`,
      boardId: selectedBoard.id,
      kind: 'plate',
      thickness: 3,
      clearance: 0.5,
      materialId: document.materials.find((material) => material.id === 'pla' || material.name.toLowerCase() === 'pla')?.id ?? 'pla',
      z: 0,
      wallHeight: 14,
      wallThickness: 2,
      mounts: [],
    };
    emit({ kind: 'set-case', body }, [body.id]);
    setCaseBodyId(body.id);
  };

  const updateCaseBody = (changes: Partial<CaseBody>) => {
    if (!activeCaseBody) return;
    emit({ kind: 'set-case', body: { ...activeCaseBody, ...changes } }, [activeCaseBody.id]);
  };

  const updateMount = (mountId: string, changes: Partial<NonNullable<CaseBody['mounts']>[number]>) => {
    if (!activeCaseBody) return;
    const mounts = (activeCaseBody.mounts ?? []).map((mount) => mount.id === mountId ? { ...mount, ...changes } : mount);
    updateCaseBody({ mounts });
  };

  const addMount = () => {
    if (!activeCaseBody) return;
    const mount = { id: makeId(), at: { x: 0, y: 0 }, kind: 'hole' as const, holeDiameter: 2.5, bossDiameter: 5, height: 5 };
    updateCaseBody({ mounts: [...(activeCaseBody.mounts ?? []), mount] });
  };

  const removeMount = (mountId: string) => {
    if (!activeCaseBody) return;
    updateCaseBody({ mounts: (activeCaseBody.mounts ?? []).filter((mount) => mount.id !== mountId) });
  };

  const attachModel = (file: File) => {
    if (!activeModelDefinition || !onImportModel) return;
    onImportModel(file, activeModelDefinition.id);
  };

  const updateModel = (field: 'offset' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: number) => {
    if (!activeModelDefinition?.model) return;
    const definitions = document.definitions.map((definition) => definition.id === activeModelDefinition.id
      ? { ...definition, model: { ...definition.model!, [field]: { ...definition.model![field], [axis]: value } } }
      : definition);
    emit({ kind: 'replace-document', document: { ...document, definitions } }, [activeModelDefinition.id]);
  };

  const editDefinition = selectedLibraryDefinition;
  const saveDefinition = (next: PartDefinition) => {
    const definitions = document.definitions.some((definition) => definition.id === next.id) ? document.definitions.map((definition) => definition.id === next.id ? next : definition) : [...document.definitions, next];
    emit({ kind: 'replace-document', document: { ...document, definitions } }, [next.id]);
  };

  const updateDefinition = (changes: Partial<PartDefinition>) => {
    if (!editDefinition) return;
    const envelopeSource = changes.courtyard
      ? { ...editDefinition.envelopeSource, courtyard: 'authored' as const }
      : editDefinition.envelopeSource;
    saveDefinition({ ...editDefinition, ...changes, ...(envelopeSource ? { envelopeSource } : {}) });
    setDefinitionError('');
  };

  const addCustomDefinition = () => {
    const definition: PartDefinition = {
      id: makeId(),
      name: `Custom component ${document.definitions.length + 1}`,
      kind: 'custom',
      courtyard: [{ x: -5, y: -3 }, { x: 5, y: -3 }, { x: 5, y: 3 }, { x: -5, y: 3 }],
      pads: [],
    };
    emit({ kind: 'replace-document', document: { ...document, definitions: [...document.definitions, definition] } }, [definition.id]);
    setLibrarySearch('');
    setScriptsOpen(false);
    setRightOpen(true);
    setLeftOpen(false);
    setLibraryChoice(definition.id);
    setLibraryAssembly(null);
    setDefinitionError('');
  };

  const updateCourtyard = (axis: 'x' | 'y', value: string) => {
    const dimension = Number(value);
    if (!editDefinition || !Number.isFinite(dimension) || dimension <= 0) {
      setDefinitionError('Courtyard dimensions must be positive numbers.');
      return;
    }
    const size = courtyardSize(editDefinition.courtyard);
    const center = editDefinition.courtyard.length === 0 ? { x: 0, y: 0 } : {
      x: (Math.min(...editDefinition.courtyard.map((point) => point.x)) + Math.max(...editDefinition.courtyard.map((point) => point.x))) / 2,
      y: (Math.min(...editDefinition.courtyard.map((point) => point.y)) + Math.max(...editDefinition.courtyard.map((point) => point.y))) / 2,
    };
    const width = axis === 'x' ? dimension : size.x;
    const height = axis === 'y' ? dimension : size.y;
    const halfX = width / 2;
    const halfY = height / 2;
    updateDefinition({ courtyard: [
      { x: center.x - halfX, y: center.y - halfY },
      { x: center.x + halfX, y: center.y - halfY },
      { x: center.x + halfX, y: center.y + halfY },
      { x: center.x - halfX, y: center.y + halfY },
    ] });
    setDefinitionError('');
  };

  const updatePad = (padId: string, changes: Partial<PartDefinition['pads'][number]>) => {
    if (!editDefinition || editDefinition.kicadSource) return;
    const current = editDefinition.pads.find((pad) => pad.id === padId);
    if (!current) return;
    const nextPad = { ...current, ...changes };
    if (changes.id && changes.id !== padId && editDefinition.pads.some((pad) => pad.id === changes.id)) {
      setDefinitionError('Pad IDs must be unique within the component.');
      return;
    }
    if (changes.number?.trim() && editDefinition.pads.some((pad) => pad.id !== padId && pad.number === changes.number?.trim())) {
      setDefinitionError('Pad numbers must be unique within the component.');
      return;
    }
    if (!nextPad.id.trim() || !nextPad.number.trim() || !Number.isFinite(nextPad.at.x) || !Number.isFinite(nextPad.at.y)
      || !Number.isFinite(nextPad.size.x) || !Number.isFinite(nextPad.size.y) || nextPad.size.x <= 0 || nextPad.size.y <= 0
      || (nextPad.drill !== undefined && (!Number.isFinite(nextPad.drill) || nextPad.drill <= 0))) {
      setDefinitionError('Pad IDs and numbers are required. Positions must be finite, sizes and drill must be positive.');
      return;
    }
    const pads = editDefinition.pads.map((pad) => pad.id === padId ? nextPad : pad);
    let nets = document.nets;
    if (nextPad.id !== padId) {
      const partIds = new Set(document.parts.filter((part) => part.definitionId === editDefinition.id).map((part) => part.id));
      nets = document.nets.map((net) => ({ ...net, pins: net.pins.map((pin) => partIds.has(pin.partId) && pin.padId === padId ? { ...pin, padId: nextPad.id } : pin) }));
    }
    emit({ kind: 'replace-document', document: { ...document, definitions: document.definitions.map((definition) => definition.id === editDefinition.id ? { ...editDefinition, pads } : definition), nets } }, [editDefinition.id, padId, nextPad.id]);
    setDefinitionError('');
  };

  const commitPadField = (padId: string, field: 'id' | 'number', value: string) => updatePad(padId, { [field]: value.trim() });
  const commitPadNumber = (padId: string, field: 'atX' | 'atY' | 'sizeX' | 'sizeY' | 'drill', value: string) => {
    const number = Number(value);
    if (field === 'drill') {
      updatePad(padId, { drill: value.trim() === '' ? undefined : number });
      return;
    }
    if (!Number.isFinite(number)) {
      setDefinitionError('Pad positions and dimensions must be finite numbers.');
      return;
    }
    const pad = editDefinition?.pads.find((item) => item.id === padId);
    if (!pad) return;
    if (field === 'atX') updatePad(padId, { at: { ...pad.at, x: number } });
    if (field === 'atY') updatePad(padId, { at: { ...pad.at, y: number } });
    if (field === 'sizeX') updatePad(padId, { size: { ...pad.size, x: number } });
    if (field === 'sizeY') updatePad(padId, { size: { ...pad.size, y: number } });
  };

  const addDefinitionPad = () => {
    if (!editDefinition || editDefinition.kicadSource) return;
    const pad = { id: makeId(), number: String(editDefinition.pads.length + 1), at: { x: 0, y: 0 }, size: { x: 2, y: 2 }, shape: 'circle' as const };
    updateDefinition({ pads: [...editDefinition.pads, pad] });
  };

  const removeDefinitionPad = (padId: string) => {
    if (!editDefinition || editDefinition.kicadSource) return;
    const partIds = new Set(document.parts.filter((part) => part.definitionId === editDefinition.id).map((part) => part.id));
    const nets = document.nets.map((net) => ({ ...net, pins: net.pins.filter((pin) => !partIds.has(pin.partId) || pin.padId !== padId) }));
    emit({ kind: 'replace-document', document: { ...document, definitions: document.definitions.map((definition) => definition.id === editDefinition.id ? { ...editDefinition, pads: editDefinition.pads.filter((pad) => pad.id !== padId) } : definition), nets } }, [editDefinition.id, padId]);
  };

  const documentWithPart = (part: Part, definition: PartDefinition, layoutId: string): ProjectDoc => ({
    ...document,
    definitions: definitions.has(definition.id) ? document.definitions : [...document.definitions, definition],
    parts: [...document.parts, part],
    boards: document.boards.map((board) => board.id === selectedBoardId ? { ...board, partIds: [...board.partIds, part.id] } : board),
    outline: document.outline.map((feature) => feature.kind === 'part-envelope' && selectedBoard?.outlineIds.includes(feature.id) ? { ...feature, partIds: [...feature.partIds, part.id] } : feature),
    ...(document.layouts ? { layouts: document.layouts.map((layout) => layout.id === layoutId ? { ...layout, partIds: [...layout.partIds, part.id] } : layout) } : {}),
  });

  const assignPartLayout = (part: Part, layoutId: string) => {
    const layouts = (document.layouts ?? []).map((layout) => ({ ...layout, partIds: [...layout.partIds.filter((id) => id !== part.id), ...(layout.id === layoutId ? [part.id] : [])] }));
    emit({ kind: 'replace-document', document: { ...document, layouts } }, [part.id, layoutId].filter(Boolean));
  };

  const addDefinition = (definition: PartDefinition) => {
    const part = createPart(definition, document.parts);
    emit({ kind: 'replace-document', document: documentWithPart(part, definition, layoutTargetId) }, [part.id]);
    setSelected([part.id]);
    setScope({ kind: 'component', partId: part.id });
    setMode('Design');
    setRightOpen(true);
  };

  const commitMatrix = (matrix: Matrix, phase: EditCommand['phase'] = 'commit', transactionId?: string, definitions?: PartDefinition[]) => {
    emit({ kind: 'set-matrix', matrix, definitions }, [matrix.id, ...(definitions ?? []).map((definition) => definition.id)], phase, transactionId);
  };

  const commitSplay = (matrix: Matrix, column: number, change: MatrixSplayChange, phase: EditCommand['phase'] = 'commit', transactionId?: string) => {
    emit({ kind: 'set-matrix-splay', matrixId: matrix.id, column, change }, [matrix.id], phase, transactionId);
  };

  const setCell = (matrix: Matrix, row: number, column: number, changes: Partial<MatrixCell>, definitions?: PartDefinition[]) => {
    const cells = matrix.cells ?? [];
    const current = cells.find((cell) => cell.row === row && cell.column === column);
    const nextCell: MatrixCell = { row, column, enabled: current?.enabled ?? true, ...current, ...changes };
    const nextCells = cells.filter((cell) => cell.row !== row || cell.column !== column).concat(nextCell);
    commitMatrix({ ...matrix, cells: nextCells }, 'commit', undefined, definitions);
  };

  const createGuidedMatrix = () => { setPairSetup(false); setPairPlacement(null); setMatrixSetup(true); setAddPartOpen(false); setLeftOpen(true); if (!compactObjects) objectsPanel.setMode('pinned'); setMatrixRows(''); setMatrixColumns(''); };

  const beginMatrixPlacement = (rows: number, columns: number, preset: MatrixPresetId, pair?: PairSetup) => {
    const definition = builtinDefinitions().find((item) => item.id === 'mx-switch');
    if (!definition || !selectedBoard) return;
    const matrix: Matrix = {
      id: makeId(),
      boardId: selectedBoard.id,
      rows,
      columns,
      pitch: { x: PITCH_MM, y: PITCH_MM },
      edgeGap: { x: 1, y: 1 },
      origin: { x: 0, y: 0 },
      definitionId: definition.id,
      partIds: [],
      diodes: true,
      cells: [],
    };
    setMatrixGhost(matrixWithPreset(matrix, preset).matrix);
    setPairPlacement(pair ? { ...pair, leftId: makeId(), rightId: makeId(), rightMatrixId: makeId() } : null);
    setPairSetup(false);
    setMatrixSetup(false);
    setLeftOpen(false);
    setRightOpen(false);
    setPendingPart(null);
    setOutlineSettingsOpen(false);
    setMode('Design');
    setScope(null);
  };

  const placeLibraryDefinition = (definition: PartDefinition) => {
    if (scope?.kind === 'key' && scope.matrixId !== undefined && scope.row !== undefined && scope.column !== undefined) {
      const matrix = matrixMap.get(scope.matrixId);
      if (matrix) {
        const row = scope.row;
        const column = scope.column;
        const currentCell = matrixCellOverrides.get(matrix.id)?.get(`${row}:${column}`);
        const isAlternativeSwitch = definition.kind === 'switch' || definition.id === 'mx-hotswap' || definition.id === 'choc-hotswap';
        const cellChanges: Partial<MatrixCell> = isAlternativeSwitch
          ? { enabled: true, definitionId: definition.id }
          : definition.id === 'matrix-diode'
            ? { enabled: true, diode: true }
          : {
            enabled: true,
            assemblies: [...(currentCell?.assemblies ?? []), {
              id: `library-${definition.id}-${(currentCell?.assemblies?.length ?? 0) + 1}`,
              definitionId: definition.id,
              offset: { x: 0, y: 0 },
            }],
          };
        setCell(matrix, row, column, cellChanges, definitions.has(definition.id) ? undefined : [definition]);
        setScope({ ...scope, kind: 'key' });
        setMode('Design');
        return;
      }
    }
    addDefinition(definition);
  };

  useEffect(() => {
    if ((pendingPart || matrixGhost) && mode === 'Design') svgRef.current?.focus();
  }, [pendingPart, Boolean(matrixGhost), mode]);

  const beginPartPlacement = (definition: PartDefinition) => {
    setPendingPart(definition);
    setPendingLayoutId(layoutTargetId);
    setPairPlacement(null);
    setPairSetup(false);
    setPlacementPoint(snapDelta({ x: (viewBounds.minX + viewBounds.maxX) / 2, y: (viewBounds.minY + viewBounds.maxY) / 2 }, { x: PITCH_MM, y: PITCH_MM }, snapFraction));
    setAddPartOpen(false);
    setLeftOpen(false);
    setRightOpen(false);
    setOutlineActive(false);
    setMatrixGhost(null);
    setMode('Design');
  };

  const placePendingPart = (at: Vec2) => {
    if (!pendingPart || !selectedBoard) return;
    const part = { ...createPart(pendingPart, document.parts), pose: { at, rotation: 0 } };
    emit({ kind: 'replace-document', document: documentWithPart(part, pendingPart, pendingLayoutId) }, [part.id, selectedBoard.id]);
    setPendingPart(null);
    setScope({ kind: 'component', partId: part.id });
    setSelected([part.id]);
    setOutlineSettingsOpen(false);
    setRightOpen(true);
  };

  const snapPlacement = (point: Vec2, free: boolean): Vec2 => {
    if (!pendingPart || free) { setSnapGuide(undefined); return point; }
    const grid = snapDelta(point, { x: PITCH_MM, y: PITCH_MM }, snapFraction);
    const moving: Part = { id: 'placement-preview', reference: pendingPart.name, definitionId: pendingPart.id, pose: { at: point, rotation: 0 }, side: 'front' };
    const snap = geometrySnap ? snapPart(moving, visibleParts, new Map([...definitions, [pendingPart.id, pendingPart]]), 2, gapSnap ? effectiveGap : null) : undefined;
    setSnapGuide(snap);
    return snap?.at ?? grid;
  };

  const placeMatrixAt = (point: Vec2) => {
    if (!matrixGhost) return;
    const pair = pairPlacement ? pairAt(matrixGhost, pairPlacement, point) : undefined;
    const placed = pair?.matrix ?? { ...matrixGhost, origin: point };
    const needed = new Set([placed.definitionId, 'matrix-diode', ...(placed.cells ?? []).flatMap((cell) => [cell.definitionId, ...(cell.assemblies ?? []).map((assembly) => assembly.definitionId)])]);
    const required = libraryDefinitions.filter((definition) => needed.has(definition.id) && !definitions.has(definition.id));
    emit(pair ? { kind: 'create-mirrored-pair', matrix: placed, left: pair.left, right: pair.right, definitions: required } : { kind: 'set-matrix', matrix: placed, definitions: required }, [placed.id, ...required.map((definition) => definition.id)]);
    if (pair) setExpandedTree((current) => new Set([...current, `half:${pair.left.id}`, `half:${pair.right.id}`]));
    setPairPlacement(null);
    setMatrixGhost(null);
    setExpandedTree((current) => new Set(current).add(`matrix:${placed.id}`));
    selectScope({ kind: 'matrix', matrixId: placed.id });
  };

  const drawOutline = (event: React.MouseEvent<SVGSVGElement>) => {
    if (suppressClick.current) return;
    if (originPicking && scope?.matrixId && scope.column !== undefined) {
      const matrix = matrixMap.get(scope.matrixId);
      const point = pointFromEvent(event, svgRef.current);
      if (matrix && point) commitSplay(matrix, scope.column, { kind: 'origin', world: event.altKey ? point : snapDelta(point, matrix.pitch, snapFraction) });
      setOriginPicking(false); setRightOpen(true); return;
    }
    if (pendingPart && event.button === 0) {
      const point = pointFromEvent(event, svgRef.current);
      if (point) placePendingPart(snapPlacement(point, event.altKey));
      return;
    }
    if (mode === 'Design' && matrixGhost && event.button === 0) {
      const point = pointFromEvent(event, svgRef.current);
      if (point) placeMatrixAt(point);
      return;
    }
    if (mode !== 'Design' || !outlineActive || event.button !== 0) return;
    const point = pointFromEvent(event, svgRef.current);
    if (!point) return;
    if (event.detail > 1) return;
    const snapped = event.altKey ? point : snapDelta(point, { x: PITCH_MM, y: PITCH_MM }, snapFraction);
    setOutlineDraft((current) => current.some((p) => p.x === snapped.x && p.y === snapped.y) ? current : [...current, snapped]);
  };

  const finishOutline = () => {
    if (outlineDraft.length < 3) return;
    const feature: OutlineFeature = {
      id: makeId(),
      kind: 'polygon',
      points: outlineDraft,
      operation: outlineOperation,
    };
    saveOutline(feature);
    setOutlineDraft([]);
    setOutlineActive(false);
  };

  const startDrag = (event: React.PointerEvent<SVGGElement>, part: Part) => {
    if (part.locked || outlineActive || pendingPart || matrixGhost) return;
    if (event.button === 1 || spaceDown.current) return;
    const pointerStart = pointFromEvent(event, svgRef.current);
    if (!pointerStart) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const matrixCell = matrixPartLookup.get(part.id);
    const matrix = matrixCell ? matrixMap.get(matrixCell.matrixId) : undefined;
    const usesMatrixScope = Boolean(matrix && matrixCell && scope?.matrixId === matrix.id
      && (scope.kind === 'matrix' || scope.kind === 'row' || scope.kind === 'column'));
    const matrixScope = usesMatrixScope && scope
      ? scope.kind === 'matrix'
        ? { kind: 'matrix' as const, origin: matrix!.origin }
        : scope.kind === 'row'
          ? { kind: 'row' as const, index: matrixCell!.row, offset: matrix?.rowOffsets?.[matrixCell!.row] ?? { x: 0, y: 0 } }
          : { kind: 'column' as const, index: matrixCell!.column, offset: matrix?.columnOffsets?.[matrixCell!.column] ?? { x: 0, y: 0 } }
      : undefined;
    const ids = usesMatrixScope && matrix && matrixCell
      ? matrix.partIds.filter((id) => {
        const cell = matrixPartLookup.get(id);
        if (!cell) return false;
        if (matrixScope?.kind === 'row') return cell.row === matrixScope.index;
        if (matrixScope?.kind === 'column') return cell.column === matrixScope.index;
        return true;
      })
      : matrixCell ? [part.id] : selected.includes(part.id) ? selected : [part.id];
    if (!usesMatrixScope) setScope(matrixCell && !matrixCell.assemblyId && scope?.kind !== 'component'
      ? { kind: 'key', matrixId: matrixCell.matrixId, row: matrixCell.row, column: matrixCell.column }
      : { kind: 'component', partId: part.id, ...(matrixCell ?? {}) });
    setOutlineSettingsOpen(false);
    const origins = ids.map((id) => parts.get(id)).filter((item): item is Part => Boolean(item)).map((item) => ({ id: item.id, at: item.pose.at }));
    if (scope?.kind === 'row' && matrixCell && scope.row !== matrixCell.row) {
      setScope({ ...scope, row: matrixCell.row });
    }
    if (scope?.kind === 'column' && matrixCell && scope.column !== matrixCell.column) {
      setScope({ ...scope, column: matrixCell.column });
    }
    setSelected(ids);
    setRightOpen(true);
    const transactionId = makeId();
    transaction.current = transactionId;
    dragRef.current = {
      ids,
      origins,
      pointerStart,
      pending: origins,
      transactionId,
      pointerId: event.pointerId,
      target: event.currentTarget,
      bounds,
      frame: null,
      moved: false,
      ...(matrixScope && matrix ? { matrixScope, pendingMatrix: matrix } : {}),
      ...(matrixCell && matrix ? {
        matrixCell: {
          ...matrixCell,
          offset: matrixCell.assemblyId
            ? matrixCellOverrides.get(matrix.id)?.get(`${matrixCell.row}:${matrixCell.column}`)?.assemblies?.find((assembly) => assembly.id === matrixCell.assemblyId)?.offset ?? { x: 0, y: 0 }
            : matrixCellOverrides.get(matrix.id)?.get(`${matrixCell.row}:${matrixCell.column}`)?.offset ?? { x: 0, y: 0 },
        },
        pendingMatrix: matrix,
      } : {}),
    };
  };

  const moveDrag = (event: React.PointerEvent<SVGGElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const point = pointFromEvent(event, svgRef.current);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    const dx = point.x - drag.pointerStart.x;
    const dy = point.y - drag.pointerStart.y;
    if (drag.matrixScope && drag.pendingMatrix) {
      const matrix = drag.pendingMatrix;
      const pointerDelta = { x: dx, y: dy };
      const local = drag.matrixScope.kind === 'matrix' ? pointerDelta : localMatrixDelta(matrix, pointerDelta, drag.matrixScope.kind === 'column' ? drag.matrixScope.index : 0);
      const delta = event.altKey ? local : snapDelta(local, matrix.pitch, snapFraction);
      if (drag.matrixScope.kind === 'matrix') {
        drag.pendingMatrix = { ...matrix, origin: { x: drag.matrixScope.origin.x + delta.x, y: drag.matrixScope.origin.y + delta.y } };
      } else {
        const offsets = drag.matrixScope.kind === 'row' ? [...(matrix.rowOffsets ?? [])] : [...(matrix.columnOffsets ?? [])];
        while (offsets.length <= drag.matrixScope.index) offsets.push({ x: 0, y: 0 });
        offsets[drag.matrixScope.index] = { x: drag.matrixScope.offset.x + delta.x, y: drag.matrixScope.offset.y + delta.y };
        drag.pendingMatrix = drag.matrixScope.kind === 'row'
          ? { ...matrix, rowOffsets: offsets }
          : { ...matrix, columnOffsets: offsets };
      }
      drag.moved = true;
      if (drag.frame !== null) return;
      drag.frame = window.requestAnimationFrame(() => {
        drag.frame = null;
        if (drag.pendingMatrix) commitMatrix(drag.pendingMatrix, 'preview', drag.transactionId);
      });
      return;
    }
    if (drag.matrixCell && drag.pendingMatrix) {
      const matrix = drag.pendingMatrix;
      const local = localMatrixDelta(matrix, { x: dx, y: dy }, drag.matrixCell.column);
      const moved = event.altKey ? local : snapDelta(local, matrix.pitch, snapFraction);
      const offset = { x: drag.matrixCell.offset.x + moved.x, y: drag.matrixCell.offset.y + moved.y };
      const currentCell = matrixCellOverrides.get(matrix.id)?.get(`${drag.matrixCell.row}:${drag.matrixCell.column}`);
      drag.pendingMatrix = drag.matrixCell.assemblyId && drag.matrixCell.assemblyId !== 'diode'
        ? withCell(matrix, drag.matrixCell.row, drag.matrixCell.column, {
          assemblies: (currentCell?.assemblies ?? []).map((assembly) => assembly.id === drag.matrixCell!.assemblyId ? { ...assembly, offset } : assembly),
        })
        : withCell(matrix, drag.matrixCell.row, drag.matrixCell.column, { offset });
      drag.moved = true;
      if (drag.frame !== null) return;
      drag.frame = window.requestAnimationFrame(() => {
        drag.frame = null;
        if (drag.pendingMatrix) commitMatrix(drag.pendingMatrix, 'preview', drag.transactionId);
      });
      return;
    }
    drag.pending = drag.origins.map(({ id, at }) => ({ id, at: { x: at.x + dx, y: at.y + dy } }));
    const keyUnit = (scope?.matrixId ? matrixMap.get(scope.matrixId)?.pitch : undefined) ?? { x: PITCH_MM, y: PITCH_MM };
    if (!event.altKey) {
      const snapped = snapDelta({ x: dx, y: dy }, keyUnit, snapFraction);
      drag.pending = drag.origins.map(({ id, at }) => ({ id, at: { x: at.x + snapped.x, y: at.y + snapped.y } }));
    }
    if (!event.altKey && geometrySnap && drag.origins.length === 1) {
      const original = parts.get(drag.origins[0].id);
      if (original) {
        const moving = { ...original, pose: { ...original.pose, at: { x: drag.origins[0].at.x + dx, y: drag.origins[0].at.y + dy } } };
        const snap = snapPart(moving, visibleParts.filter((part) => !drag.ids.includes(part.id)), definitions, 2, gapSnap ? effectiveGap : null);
        setSnapGuide(snap);
        if (snap) drag.pending = [{ id: original.id, at: snap.at }];
      }
    } else setSnapGuide(undefined);
    drag.moved = true;
    if (drag.frame !== null) return;
    drag.frame = window.requestAnimationFrame(() => {
      drag.frame = null;
      emit({ kind: 'move-parts', positions: drag.pending }, drag.ids, 'preview', drag.transactionId);
    });
  };

  const endDrag = (event: React.PointerEvent<SVGGElement>) => {
    setSnapGuide(undefined);
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.stopPropagation();
    if (drag.frame !== null) window.cancelAnimationFrame(drag.frame);
    if (drag.moved) {
      suppressClick.current = true;
      if (drag.pendingMatrix) {
        commitMatrix(drag.pendingMatrix, 'preview', drag.transactionId);
        commitMatrix(drag.pendingMatrix, 'commit', drag.transactionId);
      } else {
        emit({ kind: 'move-parts', positions: drag.pending }, drag.ids, 'preview', drag.transactionId);
        emit({ kind: 'move-parts', positions: drag.pending }, drag.ids, 'commit', drag.transactionId);
      }
      window.setTimeout(() => { suppressClick.current = false; }, 0);
    }
    if (drag.target.hasPointerCapture(drag.pointerId)) drag.target.releasePointerCapture(drag.pointerId);
    dragRef.current = null;
  };

  const startStagger = (event: React.PointerEvent<SVGElement>, matrix: Matrix, axis: 'row' | 'column', index: number) => {
    if (event.button !== 0) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const values = axis === 'row' ? matrix.rowOffsets : matrix.columnOffsets;
    const offset = values?.[index] ?? { x: 0, y: 0 };
    staggerDragRef.current = {
      matrixId: matrix.id,
      axis,
      index,
      startClient: { x: event.clientX, y: event.clientY },
      worldPerPixel: { x: viewBounds.width / rect.width, y: viewBounds.height / rect.height },
      offset,
      pointerId: event.pointerId,
      target: event.currentTarget,
      pending: matrix,
    };
    selectScope(axis === 'row'
      ? { kind: 'row', matrixId: matrix.id, row: index }
      : { kind: 'column', matrixId: matrix.id, column: index });
  };

  const startSplay = (event: React.PointerEvent<SVGGElement>, kind: 'origin' | 'angle') => {
    const matrix = scope?.matrixId ? matrixMap.get(scope.matrixId) : undefined;
    if (!matrix || scope?.column === undefined || event.button !== 0) return;
    const point = pointFromEvent(event, svgRef.current);
    if (!point) return;
    const origin = matrixScenes.get(matrix.id)?.basis(scope.column)?.splayOrigin;
    if (!origin) return;
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    splayDrag.current = { matrix, origin, column: scope.column, kind, pointerId: event.pointerId,
      startAngle: Math.atan2(point.y - origin.y, point.x - origin.x), target: event.currentTarget, transactionId: makeId(), bounds };
  };

  const moveCanvasPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const splay = splayDrag.current;
    if (splay && splay.pointerId === event.pointerId) {
      const point = pointFromEvent(event, svgRef.current);
      if (!point) return;
      if (splay.kind === 'origin') splay.pending = { kind: 'origin', world: event.altKey ? point : snapDelta(point, splay.matrix.pitch, snapFraction) };
      else {
        const origin = splay.origin;
        const angle = Math.atan2(point.y - origin.y, point.x - origin.x) - splay.startAngle;
        const delta = Math.atan2(Math.sin(angle), Math.cos(angle)) * 180 / Math.PI * (splay.matrix.mirror === 'x' || splay.matrix.mirror === 'y' ? -1 : 1);
        const value = (splay.matrix.columnSplays?.[splay.column] ?? 0) + delta;
        splay.pending = { kind: 'angle', angle: event.altKey ? value : Math.round(value), affect: splayAffect };
      }
      commitSplay(splay.matrix, splay.column, splay.pending, 'preview', splay.transactionId);
      event.preventDefault(); return;
    }
    if (pendingPart) {
      const point = pointFromEvent(event, svgRef.current);
      if (point) setPlacementPoint(snapPlacement(point, event.altKey));
    }
    if (matrixGhost && mode === 'Design' && !panDrag.current) {
      const point = pointFromEvent(event, svgRef.current);
      if (point) setMatrixGhost((current) => current ? { ...current, origin: point } : current);
    }
    const panState = panDrag.current;
    if (panState && event.pointerId === panState.pointerId) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = (event.clientX - panState.startX) / rect.width * panState.width;
      const dy = -(event.clientY - panState.startY) / rect.height * panState.height;
      setPan({ x: panState.pan.x - dx, y: panState.pan.y - dy });
      event.preventDefault();
      return;
    }
    const drag = staggerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const matrix = matrixMap.get(drag.matrixId);
    if (!matrix) return;
    const local = localMatrixDelta(matrix, {
      x: (event.clientX - drag.startClient.x) * drag.worldPerPixel.x,
      y: -(event.clientY - drag.startClient.y) * drag.worldPerPixel.y,
    }, drag.axis === 'column' ? drag.index : 0);
    const delta = event.altKey ? local : snapDelta(local, matrix.pitch, snapFraction);
    const offset = { x: drag.offset.x + delta.x, y: drag.offset.y + delta.y };
    const values = drag.axis === 'row' ? [...(matrix.rowOffsets ?? [])] : [...(matrix.columnOffsets ?? [])];
    while (values.length <= drag.index) values.push({ x: 0, y: 0 });
    values[drag.index] = offset;
    drag.pending = drag.axis === 'row' ? { ...matrix, rowOffsets: values } : { ...matrix, columnOffsets: values };
    commitMatrix(drag.pending, 'preview', transaction.current);
    event.preventDefault();
  };

  const endCanvasPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const splay = splayDrag.current;
    if (splay && splay.pointerId === event.pointerId) {
      if (splay.pending) {
        if (event.type === 'pointercancel') commitMatrix(splay.matrix, 'preview', splay.transactionId);
        else commitSplay(splay.matrix, splay.column, splay.pending, 'commit', splay.transactionId);
      }
      if (splay.target.hasPointerCapture(splay.pointerId)) splay.target.releasePointerCapture(splay.pointerId);
      splayDrag.current = null;
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      return;
    }
    const panState = panDrag.current;
    if (panState && event.pointerId === panState.pointerId) {
      if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
      panDrag.current = null;
      return;
    }
    const drag = staggerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.pending !== matrixMap.get(drag.matrixId)) commitMatrix(drag.pending, 'commit', transaction.current);
    if (drag.target.hasPointerCapture(drag.pointerId)) drag.target.releasePointerCapture(drag.pointerId);
    staggerDragRef.current = null;
  };

  const startCanvasPan = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 1 && !spaceDown.current) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    svgRef.current?.setPointerCapture(event.pointerId);
    panDrag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, pan, width: viewBounds.width, height: viewBounds.height };
  };

  const zoomAt = (clientX: number, clientY: number, nextZoom: number) => {
    const svg = svgRef.current;
    const rect = svg?.getBoundingClientRect();
    if (!svg || !rect) {
      setZoom(nextZoom);
      return;
    }
    const fx = (clientX - rect.left) / rect.width;
    const fy = (clientY - rect.top) / rect.height;
    const worldX = viewBounds.minX + fx * viewBounds.width;
    const worldY = viewBounds.maxY - fy * viewBounds.height;
    const nextWidth = bounds.width / nextZoom;
    const nextHeight = bounds.height / nextZoom;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    setZoom(nextZoom);
    setPan({
      x: worldX - centerX - (fx - 0.5) * nextWidth,
      y: worldY - centerY - (0.5 - fy) * nextHeight,
    });
  };

  wheelZoom.current = (event: WheelEvent) => {
    const nextZoom = Math.min(4, Math.max(0.25, zoom * Math.exp(-event.deltaY * 0.001)));
    zoomAt(event.clientX, event.clientY, nextZoom);
  };

  useEffect(() => {
    const canvas = svgRef.current;
    if (!canvas) return;

    // A non-passive listener keeps wheel input inside the drawing.
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      wheelZoom.current(event);
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const selectedMatrix = (scope?.matrixId ? matrixMap.get(scope.matrixId) : undefined);
  const effectiveGap = gapOverride.trim() && Number.isFinite(Number(gapOverride)) && Number(gapOverride) >= 0 ? Number(gapOverride) : selectedMatrix?.edgeGap?.x ?? 1;
  const linkedSelection = partnerLayout && (scope?.kind !== 'component' || (activePart && matrixPartLookup.has(activePart.id) && !matrixPartLookup.get(activePart.id)?.assemblyId));
  const movingCounterparts = new Set(linkedSelection ? matrixMap.get(partnerLayout.matrixId)?.partIds ?? [] : []);
  const alignTargets = visibleParts.filter((part) => !selectedIds.has(part.id) && !movingCounterparts.has(part.id));
  const alignTarget = alignTargets.find((part) => part.id === alignTargetId) ?? alignTargets[0];
  const selectionLocked = activeParts.some((part) => part.locked || constrainedTargetIds.has(part.id));
  const alignSelection = (axis: 'x' | 'y', anchor: 'min' | 'center' | 'max') => {
    if (!alignTarget || !activeParts.length || selectionLocked) return;
    const delta = alignmentDelta(selectionOutline(activeParts, definitions), selectionOutline([alignTarget], definitions), axis, anchor);
    if (!delta) return;
    if (selectedMatrix && scope && scope.kind !== 'component') {
      if (scope.kind === 'matrix') commitMatrix({ ...selectedMatrix, origin: { x: selectedMatrix.origin.x + delta.x, y: selectedMatrix.origin.y + delta.y } });
      else {
        const local = localMatrixDelta(selectedMatrix, delta, scope.column ?? 0);
        if (scope.kind === 'key') {
          const offset = selectedMatrix.cells?.find((cell) => cell.row === scope.row && cell.column === scope.column)?.offset ?? { x: 0, y: 0 };
          commitMatrix(withCell(selectedMatrix, scope.row ?? 0, scope.column ?? 0, { offset: { x: offset.x + local.x, y: offset.y + local.y } }));
        } else {
          const key = scope.kind === 'row' ? 'rowOffsets' : 'columnOffsets';
          const index = scope[scope.kind] ?? 0;
          const offsets = [...(selectedMatrix[key] ?? [])];
          while (offsets.length <= index) offsets.push({ x: 0, y: 0 });
          offsets[index] = { x: offsets[index].x + local.x, y: offsets[index].y + local.y };
          commitMatrix({ ...selectedMatrix, [key]: offsets });
        }
      }
    } else emit({ kind: 'move-parts', positions: activeParts.map((part) => ({ id: part.id, at: { x: part.pose.at.x + delta.x, y: part.pose.at.y + delta.y } })) }, selected);
    setKeyboardStatus(`Aligned selection to ${alignTarget.reference}. Reference unchanged.`);
  };
  const groupOutline = useMemo(() => scope && ['matrix', 'row', 'column'].includes(scope.kind) ? selectionOutline(visibleParts.filter((part) => selectedIds.has(part.id)), definitions) : [], [scope, visibleParts, selectedIds, definitions]);
  const hoverOutline = useMemo(() => {
    if (!hoveredPart) return [];
    const member = matrixPartLookup.get(hoveredPart);
    const kind = scope?.kind ?? 'key';
    const group = visibleParts.filter((part) => {
      if (!member || !['matrix', 'row', 'column'].includes(kind)) return part.id === hoveredPart;
      const candidate = matrixPartLookup.get(part.id);
      return candidate?.matrixId === member.matrixId && (kind === 'matrix' || (kind === 'row' ? candidate.row === member.row : candidate.column === member.column));
    });
    return selectionOutline(group, definitions);
  }, [hoveredPart, scope?.kind, visibleParts, matrixPartLookup, definitions]);

  const selectionTitle = scope?.kind === 'component' && activePart ? activePart.reference : selectedMatrix
    ? `${activeLayout?.name || selectedMatrix.name?.trim() || `Matrix ${document.matrices.indexOf(selectedMatrix) + 1}`}${scope?.kind === 'row' ? ` · Row ${(scope.row ?? 0) + 1}` : scope?.kind === 'column' ? ` · Column ${(scope.column ?? 0) + 1}` : scope?.kind === 'key' ? ` · Key ${(scope.row ?? 0) + 1}.${(scope.column ?? 0) + 1}` : ''}`
    : activePart?.reference ?? selectedBoard?.name ?? 'Board';

  const getModeDetails = () => {
    if (scriptsOpen) return <>
      <div className="wb-inspect-head"><h2>Geometry scripts</h2></div>
      <button className="wb-secondary" onClick={() => setScriptsOpen(false)}>Back to inspector</button>
        <div className="wb-script-heading"><h3 className="wb-subtitle">Scripts</h3><button onClick={addScript}>+ New script</button></div>
        {document.scripts.length > 0 && <label className="wb-script-select-label">Active script<select aria-label="Active script" value={activeScript?.id ?? ''} onChange={(event) => setActiveScriptId(event.target.value)}>
          {document.scripts.map((script) => <option key={script.id} value={script.id}>{script.name}</option>)}
        </select></label>}
        {activeScript ? <div className="wb-script-editor">
          <label className="wb-script-name">Name<input value={scriptName} onChange={(event) => setScriptName(event.target.value)} /></label>
          <label className="wb-script-source-label">Rhai source<textarea spellCheck={false} value={scriptSource} onChange={(event) => setScriptSource(event.target.value)} placeholder="// Describe generated geometry and component groups" /></label>
          <label className="wb-script-enabled"><input type="checkbox" checked={scriptEnabled} onChange={(event) => setScriptEnabled(event.target.checked)} /> Enable on Apply</label>
          <button className="wb-primary wb-script-apply" disabled={!scriptSource.trim()} onClick={applyScript}>Apply script <ArrowIcon /></button>
          <div className="wb-script-diagnostics"><span>Core findings</span><FindingList findings={scene.findings} /></div>
        </div> : <p className="wb-empty-state">Scripts generate named geometry groups. Apply a script to run it in the core.</p>}
    </>;

    if (mode === 'Design' && outlineSettingsOpen) return <><OutlineInspector document={document} board={selectedBoard}
      onChange={(next, ids) => emit({ kind: 'replace-document', document: next }, ids)}
      onDraw={(operation) => { setOutlineOperation(operation); setOutlineDraft([]); setOutlineActive(true); setRightOpen(false); }} /><div className="wb-findings-head"><h3 className="wb-subtitle">Findings</h3></div><FindingList findings={scene.findings} /></>;

    if (mode === 'PCB') {
      const assigned = boardNets.reduce((total, net) => total + net.pins.filter((pin) => selectedBoard?.partIds.includes(pin.partId) ?? true).length, 0);
      return <>
        <div className="wb-inspect-head"><h2>Board setup</h2><span className="wb-mini-tag">{document.boards.length} board{document.boards.length === 1 ? '' : 's'}</span></div>
        <InspectorSection title="Board details" detail={selectedBoard?.name}>
        {selectedBoard ? <dl className="wb-measure-list">
          <Measure label="Board" value={selectedBoard.name} />
          <Measure label="Thickness" value={`${selectedBoard.thickness.toFixed(2)} mm`} />
          <Measure label="Placed parts" value={`${selectedBoard.partIds.length}`} />
          <Measure label="Net assignments" value={`${assigned}`} />
        </dl> : <p className="wb-empty-note">Add a board in the project setup to begin mapping nets.</p>}
        </InspectorSection>
        <div className="wb-findings-head"><h3 className="wb-subtitle">Connections</h3><span>{activeDefinition?.pads.length ?? 0}</span></div>
        {activePart && activeDefinition ? <div className="wb-net-map">
          {Object.entries(activeDefinition.terminals ?? {}).map(([terminal, padIds]) => {
            const assigned = [...new Set(padIds.map((padId) => boardNets.find((net) => net.pins.some((pin) => pin.partId === activePart.id && pin.padId === padId))?.id).filter((id): id is string => Boolean(id)))];
            return <label className="wb-net-map-row" key={`terminal:${terminal}`}><span>{terminal} terminal</span><select aria-label={`Net for terminal ${terminal}`} value={assigned.length === 1 ? assigned[0] : ''} onChange={(event) => assignTerminal(terminal, padIds, event.target.value)}>
              <option value="">Unmapped</option>{boardNets.map((net) => <option key={net.id} value={net.id}>{net.name}</option>)}
            </select></label>;
          })}
          {activeDefinition.pads.filter((pad) => !isErgogen(activeDefinition.generator?.source) && !Object.values(activeDefinition.terminals ?? {}).some((padIds) => padIds.includes(pad.id))).map((pad) => {
          const assigned = boardNets.find((net) => net.pins.some((pin) => pin.partId === activePart.id && pin.padId === pad.id));
          return <label className="wb-net-map-row" key={pad.id}><span className="wb-pad-number">{pad.number}</span><select aria-label={`Net for pad ${pad.number}`} value={assigned?.id ?? ''} onChange={(event) => assignNet(pad.id, event.target.value)}>
            <option value="">Unmapped</option>{boardNets.map((net) => <option key={net.id} value={net.id}>{net.name}</option>)}
          </select></label>;
        })}</div> : <p className="wb-empty-note">Select a placed part to map its pads to nets.</p>}
        {activePart && Object.keys(activeErgogenParams).some((key) => activeErgogenParams[key].type === 'net' || activeErgogenParams[key].type === 'anchor') && <>
          <div className="wb-panel-rule" /><h3 className="wb-subtitle">Ergogen bindings</h3>
          <div className="wb-net-map">{Object.entries(activeErgogenParams).filter(([key, parameter]) => (parameter.type === 'net' && !activeDefinition?.terminals?.[key]) || parameter.type === 'anchor').map(([key, parameter]) => {
            const value = activePart.generatorParameters?.[key];
            if (parameter.type === 'net') return <label className="wb-net-map-row" key={key}><span>{key}</span><select aria-label={`Ergogen net ${key}`} value={typeof value === 'string' ? value : ''} onChange={(event) => updatePartGeneratorParameter(key, event.target.value || undefined)}><option value="">Default</option>{boardNets.map((net) => <option key={net.name} value={net.name}>{net.name}</option>)}</select></label>;
            const anchor = value && typeof value === 'object' && !Array.isArray(value) ? value as { x?: unknown; y?: unknown } : {};
            const updateAnchor = (axis: 'x' | 'y', raw: string) => {
              const next = { ...anchor };
              if (raw.trim() === '') delete next[axis];
              else {
                const coordinate = Number(raw);
                if (!Number.isFinite(coordinate)) return;
                next[axis] = coordinate;
              }
              updatePartGeneratorParameter(key, Object.keys(next).length ? next as JsonValue : undefined);
            };
            return <div className="wb-net-map-row wb-anchor-row" key={key}><span>{key}</span><label>{key} X<input type="number" aria-label={`Ergogen anchor ${key} X`} value={typeof anchor.x === 'number' ? anchor.x : ''} placeholder="Part X" onChange={(event) => updateAnchor('x', event.target.value)} /></label><label>{key} Y<input type="number" aria-label={`Ergogen anchor ${key} Y`} value={typeof anchor.y === 'number' ? anchor.y : ''} placeholder="Part Y" onChange={(event) => updateAnchor('y', event.target.value)} /></label></div>;
          })}</div>
        </>}
        <form className="wb-new-net" onSubmit={(event) => { event.preventDefault(); addNet(); }}>
          <input aria-label="New net name" placeholder="New net name" value={newNetName} onChange={(event) => setNewNetName(event.target.value)} />
          <button type="submit" disabled={!newNetName.trim()}>Add net</button>
        </form>
        <div className="wb-panel-rule" />
        <InspectorSection title="Electrical nets" detail={String(boardNets.length)}>
        <div className="wb-net-list">{boardNets.map((net) => <div className="wb-net-row" key={net.id}>
          <span className="wb-net-swatch" /> <span>{net.name}</span><small>{net.pins.filter((pin) => selectedBoard?.partIds.includes(pin.partId) ?? true).length} pins</small>
        </div>)}</div>
        </InspectorSection>
      </>;
    }
    if (mode === 'Case') {
      const caseFindings = activeCaseBody ? scene.findings.filter((finding) => finding.scope === 'case' && (finding.targetIds.length === 0 || finding.targetIds.includes(activeCaseBody.id))) : [];
      return <>
        <div className="wb-inspect-head"><h2>Case stack</h2><button className="wb-case-new-body" onClick={addCaseBody} disabled={!selectedBoard}>+ New case body</button></div>
        <div className="wb-case-preview-state"><span className={`wb-ready-dot ${activeCaseBody && casePreview?.revision === scene.revision && caseReady ? 'is-ready' : ''}`} />
          <span><strong>{!activeCaseBody ? 'No case body on this board' : casePreview?.revision === scene.revision && caseReady ? 'Preview current' : 'Waiting for settled edit'}</strong><small>{activeCaseBody && casePreview ? `${Math.floor(casePreview.positions.length / 3)} mesh vertices · r${casePreview.revision}` : '3D preview builds after edits settle'}</small></span>
        </div>
        {document.caseBodies.some((body) => !selectedBoard || body.boardId === selectedBoard.id) && <div className="wb-case-body-list">{document.caseBodies.filter((body) => !selectedBoard || body.boardId === selectedBoard.id).map((body, index) => <button className={`wb-case-body-tab ${body.id === activeCaseBody?.id ? 'is-active' : ''}`} key={body.id} onClick={() => setCaseBodyId(body.id)}>
          <span>{String(index + 1).padStart(2, '0')}</span><strong>{body.name}</strong><small>{body.kind}</small>
        </button>)}</div>}
        {!activeCaseBody ? <div className="wb-case-empty"><p>{selectedBoard ? 'Add a plate, tray, or lid to begin the case stack.' : 'Add a board before creating a case body.'}</p></div> : <>
          <div className="wb-case-controls">
            <label className="wb-case-select"><span>Body type</span><select value={activeCaseBody.kind} onChange={(event) => {
              const kind = event.target.value as CaseBody['kind'];
              updateCaseBody({ kind, wallHeight: activeCaseBody.wallHeight ?? 14, wallThickness: activeCaseBody.wallThickness ?? 2 });
            }}>
              <option value="plate">Plate</option><option value="tray">Tray</option><option value="lid">Lid</option>
            </select></label>
            <div className="wb-case-measures">
              <CaseNumber label="Thickness" value={activeCaseBody.thickness} unit="mm" validation="positive" onCommit={(value) => updateCaseBody({ thickness: value })} />
              <CaseNumber label="Clearance" value={activeCaseBody.clearance} unit="mm" validation="nonnegative" onCommit={(value) => updateCaseBody({ clearance: value })} />
              <CaseNumber label="Z offset" value={activeCaseBody.z ?? 0} unit="mm" validation="finite" onCommit={(value) => updateCaseBody({ z: value })} />
              {activeCaseBody.kind !== 'plate' && <><CaseNumber label="Wall height" value={activeCaseBody.wallHeight ?? 14} unit="mm" validation="positive" onCommit={(value) => updateCaseBody({ wallHeight: value })} />
              <CaseNumber label="Wall thickness" value={activeCaseBody.wallThickness ?? 2} unit="mm" validation="positive" onCommit={(value) => updateCaseBody({ wallThickness: value })} /></>}
            </div>
          </div>
          <InspectorSection title="Mounting" detail={`${activeCaseBody.mounts?.length ?? 0} mounts`} defaultOpen={Boolean(activeCaseBody.mounts?.length)}>
          <div className="wb-case-section-head"><h3 className="wb-subtitle">Mounts <small>{activeCaseBody.mounts?.length ?? 0}</small></h3><button onClick={addMount}>+ Add mount</button></div>
          {(activeCaseBody.mounts ?? []).map((mount, index) => <div className="wb-mount-editor" key={mount.id}>
            <div className="wb-mount-head"><strong>Mount {index + 1}</strong><button aria-label={`Remove mount ${index + 1}`} onClick={() => removeMount(mount.id)}>Remove</button></div>
            <label className="wb-case-select"><span>Type</span><select value={mount.kind} onChange={(event) => updateMount(mount.id, { kind: event.target.value as 'hole' | 'boss' })}><option value="hole">Hole</option><option value="boss">Boss</option></select></label>
            <div className="wb-case-measures">
              <CaseNumber label="X position" value={mount.at.x} unit="mm" validation="finite" onCommit={(value) => updateMount(mount.id, { at: { ...mount.at, x: value } })} />
              <CaseNumber label="Y position" value={mount.at.y} unit="mm" validation="finite" onCommit={(value) => updateMount(mount.id, { at: { ...mount.at, y: value } })} />
              <CaseNumber label="Hole diameter" value={mount.holeDiameter} unit="mm" validation="positive" onCommit={(value) => updateMount(mount.id, { holeDiameter: value })} />
              {mount.kind === 'boss' && <>
                <CaseNumber label="Boss diameter" value={mount.bossDiameter ?? 5} unit="mm" validation="positive" onCommit={(value) => updateMount(mount.id, { bossDiameter: value })} />
                <CaseNumber label="Height" value={mount.height ?? 5} unit="mm" validation="positive" onCommit={(value) => updateMount(mount.id, { height: value })} />
              </>}
            </div>
          </div>)}
          </InspectorSection>
          <InspectorSection title="Gasket channel" detail={activeCaseBody.gasket ? "Configured" : "Optional"} defaultOpen={Boolean(activeCaseBody.gasket)}>
          <div className="wb-case-section-head"><h3 className="wb-subtitle">Gasket channel</h3>{activeCaseBody.gasket ? <button onClick={() => updateCaseBody({ gasket: undefined })}>Remove</button> : <button onClick={() => updateCaseBody({ gasket: { inset: 2, width: 2, depth: 1.5 } })}>+ Add gasket</button>}</div>
          {activeCaseBody.gasket && <div className="wb-case-measures wb-gasket-measures">
            <CaseNumber label="Inset" value={activeCaseBody.gasket.inset} unit="mm" validation="nonnegative" onCommit={(value) => updateCaseBody({ gasket: { ...activeCaseBody.gasket!, inset: value } })} />
            <CaseNumber label="Width" value={activeCaseBody.gasket.width} unit="mm" validation="positive" onCommit={(value) => updateCaseBody({ gasket: { ...activeCaseBody.gasket!, width: value } })} />
            <CaseNumber label="Depth" value={activeCaseBody.gasket.depth} unit="mm" validation="positive" onCommit={(value) => updateCaseBody({ gasket: { ...activeCaseBody.gasket!, depth: value } })} />
          </div>}
          </InspectorSection>
        </>}
        {caseFindings.length > 0 && <InspectorSection title="Clearance review" defaultOpen><FindingList findings={caseFindings} /></InspectorSection>}
      </>;
    }
    if (mode === 'Library') {
      return <>
        <div className="wb-inspect-head"><h2>{libraryAssembly ? assemblyName(libraryAssembly) : selectedLibraryDefinition?.name ?? 'Select a part'}</h2></div>
        {libraryAssembly && <section aria-label="Assembly settings"><p className="wb-empty-note">Switch footprint and diode{matrixPresetDefinitions[libraryAssembly].led ? ', with RGB LED' : ''}.</p><button className="wb-primary" onClick={() => beginMatrixPlacement(1, 1, libraryAssembly)}>Place key assembly</button></section>}
        {!libraryAssembly && selectedLibraryDefinition && <section className="wb-library-preview" aria-label="Selected footprint settings">
          <p className="wb-inspector-description">{selectedLibraryDefinition.kind === 'switch' ? 'Switch footprint' : selectedLibraryDefinition.kind === 'custom' ? 'Custom component' : 'Component footprint'} · {formatSize(selectedLibraryDefinition.courtyard)}</p>
          <button className="wb-primary wb-place-part" disabled={Boolean(generatorPreview?.error)} onClick={() => scope?.kind === 'key' ? placeLibraryDefinition(selectedLibraryDefinition) : beginPartPlacement(selectedLibraryDefinition)}>{scope?.kind === 'key' ? 'Apply to selected key' : 'Place component'} <ArrowIcon /></button>
          {(copperGenerator || ergogenGenerator) && <fieldset className="wb-generator-settings">
            <legend>Part options</legend>
            {ergogenGenerator && <GeneratorFields definition={selectedLibraryDefinition} edits={libraryParameters} onChange={updateGenerator} onImportModel={onImportModel} error={generatorPreview?.error} />}
            {copperGenerator && <div className="wb-generator-fields">
              <label className="wb-generator-toggle"><span>Reversible footprint</span><input type="checkbox" aria-label="Reversible footprint" checked={libraryParameters.reversible === true || (libraryParameters.reversible === undefined && selectedLibraryDefinition.generator?.parameters.reversible === true)} onChange={(event) => updateGenerator('reversible', event.target.checked)} /></label>
              <label className="wb-generator-toggle"><span>Include traces and vias</span><input type="checkbox" aria-label="Include traces and vias" checked={libraryParameters.includeTracesVias === true || (libraryParameters.includeTracesVias === undefined && selectedLibraryDefinition.generator?.parameters.includeTracesVias === true)} onChange={(event) => updateGenerator('includeTracesVias', event.target.checked)} /></label>
            </div>}
            {generatorPreview?.error && <p className="wb-generator-error" role="alert">{generatorPreview.error}</p>}
            {previewCompilePending && <p role="status">Compiling footprint preview…</p>}
            {previewCompileError && <p className="wb-generator-error" role="alert">{previewCompileError}</p>}
            <button className="wb-secondary" disabled={Boolean(generatorPreview?.error || previewCompilePending || previewCompileError)} onClick={saveGenerator}>Apply generator settings</button>
          </fieldset>}
          {selectedLibraryDefinition.envelopeNotice && <p className="wb-empty-note">{selectedLibraryDefinition.envelopeNotice}</p>}
          {!ergogenGenerator && <InspectorSection title="Keycap & outline" defaultOpen={selectedLibraryDefinition.kind === 'switch'}>
            <DefinitionKeycapControls definition={selectedLibraryDefinition} onChange={(keycap) => updateDefinition({ keycap })} />
            {selectedLibraryDefinition.kind !== 'switch' && <p className="wb-empty-note">The component courtyard defines its outline contribution. Adjust the edge margin after placing it.</p>}
          </InspectorSection>}
        </section>}
        {!libraryAssembly && editDefinition && !editDefinition.generator && <InspectorSection title="Edit footprint" detail="Custom geometry" defaultOpen={editDefinition.pads.length === 0}>
        {editDefinition && <section className="wb-definition-editor" aria-label="Custom component definition editor">
          <label>Name<DraftInput ariaLabel="Definition name" value={editDefinition.name} onCommit={(value) => updateDefinition({ name: value })} /></label>
          <label>Kind<select aria-label="Definition kind" value={editDefinition.kind} onChange={(event) => updateDefinition({ kind: event.target.value as PartDefinition['kind'] })}>
            <option value="switch">Switch</option><option value="controller">Controller</option><option value="connector">Connector</option><option value="encoder">Encoder</option><option value="passive">Passive</option><option value="custom">Custom</option>
          </select></label>
          <div className="wb-definition-dimensions"><strong>Rectangular courtyard <small>mm</small></strong>
            <label>Width<DraftInput ariaLabel="Courtyard width" type="number" min="0.01" step="0.1" value={courtyardSize(editDefinition.courtyard).x} onCommit={(value) => updateCourtyard('x', value)} /></label>
            <label>Height<DraftInput ariaLabel="Courtyard height" type="number" min="0.01" step="0.1" value={courtyardSize(editDefinition.courtyard).y} onCommit={(value) => updateCourtyard('y', value)} /></label>
          </div>
          <div className="wb-definition-pad-heading"><strong>Pads <small>{editDefinition.pads.length}</small></strong><button type="button" disabled={Boolean(editDefinition.kicadSource)} onClick={addDefinitionPad}>+ Add pad</button></div>
          {editDefinition.kicadSource && <p className="wb-empty-note">Imported pad geometry stays linked to its original KiCad source. Edit the footprint envelope, reference, nets, and attached models here.</p>}
          {editDefinition.pads.map((pad, index) => <fieldset className="wb-definition-pad" key={index} disabled={Boolean(editDefinition.kicadSource)}>
            <legend>Pad {index + 1}</legend>
            <div className="wb-definition-pad-grid">
              <label>ID<DraftInput ariaLabel={`Pad ${index + 1} ID`} value={pad.id} onCommit={(value) => commitPadField(pad.id, 'id', value)} /></label>
              <label>Number<DraftInput ariaLabel={`Pad ${index + 1} number`} value={pad.number} onCommit={(value) => commitPadField(pad.id, 'number', value)} /></label>
              <label>X<DraftInput ariaLabel={`Pad ${index + 1} X`} type="number" step="0.1" value={pad.at.x} onCommit={(value) => commitPadNumber(pad.id, 'atX', value)} /></label>
              <label>Y<DraftInput ariaLabel={`Pad ${index + 1} Y`} type="number" step="0.1" value={pad.at.y} onCommit={(value) => commitPadNumber(pad.id, 'atY', value)} /></label>
              <label>Width<DraftInput ariaLabel={`Pad ${index + 1} width`} type="number" min="0.01" step="0.1" value={pad.size.x} onCommit={(value) => commitPadNumber(pad.id, 'sizeX', value)} /></label>
              <label>Height<DraftInput ariaLabel={`Pad ${index + 1} height`} type="number" min="0.01" step="0.1" value={pad.size.y} onCommit={(value) => commitPadNumber(pad.id, 'sizeY', value)} /></label>
              <label>Shape<select aria-label={`Pad ${index + 1} shape`} value={pad.shape} onChange={(event) => updatePad(pad.id, { shape: event.target.value as PartDefinition['pads'][number]['shape'] })}>
                <option value="circle">Circle</option><option value="oval">Oval</option><option value="rect">Rectangle</option><option value="roundrect">Rounded rectangle</option>
              </select></label>
              <label>Drill<DraftInput ariaLabel={`Pad ${index + 1} drill`} type="number" min="0.01" step="0.1" placeholder="None" value={pad.drill ?? ''} onCommit={(value) => commitPadNumber(pad.id, 'drill', value)} /></label>
            </div>
            <button className="wb-definition-remove-pad" type="button" onClick={() => removeDefinitionPad(pad.id)}>Remove pad</button>
          </fieldset>)}
          <ul className="wb-definition-validation" aria-live="polite">{definitionIssues(editDefinition).map((issue) => <li key={issue}>{issue}</li>)}</ul>
          {definitionError && <p className="wb-definition-error" role="alert">{definitionError}</p>}
          <p className="wb-model-bound">Definitions in use stay in the library; edits apply to every placed instance.</p>
        </section>}
        </InspectorSection>}
        {!libraryAssembly && !ergogenGenerator && onImportModel && <InspectorSection title="3D model" detail={activeModelDefinition?.model ? "Attached" : "Optional"}>
          <section className="wb-model-import" aria-label="3D model binding">
          {activeModelDefinition?.model ? <p className="wb-model-bound">Bound asset: {document.assets.find((asset) => asset.id === activeModelDefinition.model?.assetId)?.name ?? activeModelDefinition.model.assetId}</p> : <p className="wb-model-bound">No model attached to this definition.</p>}
          <label className="wb-footprint-import">Attach STEP / WRL model<input type="file" accept=".step,.stp,.wrl,model/step,model/vrml" disabled={!activeModelDefinition} onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) attachModel(file);
            event.currentTarget.value = '';
          }} /></label>
          {activeModelDefinition?.model && <div className="wb-model-transforms">
            <h4>Model alignment</h4>
            <ModelVector title="Offset" value={activeModelDefinition.model.offset} unit="mm" validation="finite" onCommit={(axis, value) => updateModel('offset', axis, value)} />
            <ModelVector title="Rotation" value={activeModelDefinition.model.rotation} unit="°" validation="finite" onCommit={(axis, value) => updateModel('rotation', axis, value)} />
            <ModelVector title="Scale" value={activeModelDefinition.model.scale} unit="×" validation="positive" onCommit={(axis, value) => updateModel('scale', axis, value)} />
          </div>}
        </section></InspectorSection>}
      </>;
    }
    if (mode === 'Export') {
      const outputs: { label: string; ready: boolean; detail: string; kind: ExportKind }[] = [
        { label: 'KiCad board', ready: boardReady, detail: 'Placement, edge cuts, nets', kind: 'kicad' },
        { label: 'KiCad footprints', ready: document.definitions.length > 0, detail: 'Component footprint library', kind: 'footprints' },
        { label: 'SVG board outline', ready: selectedBoardReadiness?.outline ?? readiness.outline, detail: 'Resolved board contour', kind: 'svg' },
        { label: 'DXF board outline', ready: selectedBoardReadiness?.outline ?? readiness.outline, detail: 'Resolved board contour', kind: 'dxf' },
        { label: 'Case STEP', ready: caseReady, detail: 'Assembly solids', kind: 'case-step' },
      ];
      return <>
        <div className="wb-inspect-head"><h2>Export package</h2><span className="wb-mini-tag">v2</span></div>
        <p className="wb-empty-note">Each file reflects the last committed revision. Review readiness before packaging.</p>
        <div className="wb-export-list">{outputs.map((output) => <div className="wb-export-row" key={output.label}>
          <span className={`wb-ready-dot ${output.ready ? 'is-ready' : ''}`} />
          <span><strong>{output.label}</strong><small>{output.detail}</small></span>
          <button className="wb-export-status wb-export-button" disabled={!output.ready} onClick={() => onExport(output.kind, selectedBoardId || undefined)}>{output.ready ? 'Export' : 'Needs work'}</button>
        </div>)}</div>
        {onEmbedUsedModelsChange && <label className="wb-export-option"><input type="checkbox" aria-label="Embed used models" checked={embedUsedModels} onChange={(event) => onEmbedUsedModelsChange(event.target.checked)} /><span><strong>Embed used models</strong><small>Include attached 3D model files used in this project.</small></span></label>}
        <button className="wb-primary wb-export-action" onClick={() => onExport('project')}>Save .boardstudio project <ArrowIcon /></button>
      </>;
    }
    if (selectedMatrix && scope && scope.kind !== 'component') return <>
      <div className="wb-inspect-head wb-matrix-detail-heading"><h2>{selectionTitle}</h2></div>
      {scope.kind === 'matrix' && <div className="wb-object-actions"><label>{activeLayout ? 'Layout name' : 'Matrix name'}<DraftInput ariaLabel={activeLayout ? 'Layout name' : 'Matrix name'} value={activeLayout?.name ?? selectedMatrix.name ?? selectionTitle} onCommit={(name) => { if (name.trim()) activeLayout ? emit({ kind: 'set-layout', layout: { ...activeLayout, name: name.trim() } }, [activeLayout.id]) : commitMatrix({ ...selectedMatrix, name: name.trim() }); }} /></label></div>}
      {activeLayout && <div className="wb-layout-link"><strong><MirrorPairIcon />{partnerLayout ? `Linked to ${partnerLayout.name}` : 'Independent layout'}</strong><p>{partnerLayout ? 'Key geometry mirrors from either half. Switches and components stay local.' : 'Geometry and components can be edited independently.'}</p>{linkedLayout && <button className="wb-secondary" onClick={() => emit({ kind: 'set-layout', layout: { ...linkedLayout, mirrorLink: undefined } }, [linkedLayout.id])}>Unlink halves</button>}</div>}
      {scope.kind === 'matrix'
        ? <MatrixEditor document={document} onEdit={onEdit} scope={scope} onDuplicateDesign={onDuplicateDesign} />
        : <CellInspector projection={matrixScenes.get(selectedMatrix.id)} onSplay={(column, change) => commitSplay(selectedMatrix, column, change)} splayAffect={splayAffect} onAffectChange={setSplayAffect} onPickOrigin={() => { setOriginPicking(true); setRightOpen(false); }} matrix={selectedMatrix} scope={scope} definitions={libraryDefinitions} parts={treeParts} members={memberMaps.get(selectedMatrix.id) ?? new Map()} onChange={(matrix, definitions) => commitMatrix(matrix, 'commit', undefined, definitions)} />}
      {scope.kind === 'matrix' && <InspectorSection title="Matrix actions"><button className="wb-secondary" onClick={() => { emit({ kind: 'remove-matrix', id: selectedMatrix.id }, [selectedMatrix.id, ...selectedMatrix.partIds]); setScope(null); setSelected([]); }}>Delete matrix</button></InspectorSection>}

    </>;
    return <>
      <div className="wb-inspect-head"><h2>{selectionTitle}</h2>
        {activePart?.locked && <span className="wb-mini-tag is-locked">Locked</span>}</div>
      {activePart && activeDefinition && scope?.kind === 'component' ? <>
        <p className="wb-part-title">{activeDefinition.name}<span>{activeDefinition.kind}</span></p>
        {boardLayouts.length > 0 && !matrixPartLookup.has(activePart.id) && <label className="wb-component-layout">Layout<select aria-label="Component layout" value={activeLayout?.id ?? ''} onChange={(event) => assignPartLayout(activePart, event.target.value)}><option value="">Board / ungrouped</option>{boardLayouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}</select></label>}
        {activeDefinition.envelopeNotice && <p className="wb-empty-note">{activeDefinition.envelopeNotice}</p>}
        <h3 className="wb-subtitle">Position <small>millimetres</small></h3>
        <div className="wb-coordinate-grid">
          <Coordinate label="X" value={activePart.pose.at.x} onCommit={(value) => updatePosition('x', value)} />
          <Coordinate label="Y" value={activePart.pose.at.y} onCommit={(value) => updatePosition('y', value)} />
        </div>
        <InspectorSection title="Board outline" detail={activePart.outline?.excluded ? 'Excluded' : 'Included'}>
        <PartOutlineControls part={activePart} definition={activeDefinition} onChange={(next) => emit({ kind: 'replace-document', document: { ...document, parts: document.parts.map((part) => part.id === next.id ? next : part) } }, [next.id])} />
        </InspectorSection>
        <InspectorSection title="Layout constraint" detail={activeConstraint ? 'Active' : 'Optional'} defaultOpen={Boolean(activeConstraint)}>
        {visibleParts.length > 1 ? <div className="wb-constraint-form">
          <label>Relationship
            <select aria-label="Constraint type" value={constraintKind} onChange={(event) => setConstraintKind(event.target.value as Constraint['kind'])}>
              <option value="offset">Offset from part</option>
              <option value="mirror">Mirror placement across axis</option>
            </select>
          </label>
          <label>Source part
            <select aria-label="Constraint source part" value={constraintSourceId} onChange={(event) => setConstraintSourceId(event.target.value)}>
              {visibleParts.filter((part) => part.id !== activePart.id).map((part) => <option key={part.id} value={part.id}>{part.reference}</option>)}
            </select>
          </label>
          {constraintKind === 'offset' ? <>
            <div className="wb-constraint-number-grid">
              <ConstraintNumber label="Offset X (mm)" value={constraintX} onChange={setConstraintX} />
              <ConstraintNumber label="Offset Y (mm)" value={constraintY} onChange={setConstraintY} />
            </div>
            <ConstraintNumber label="Rotation (degrees)" value={constraintRotation} onChange={setConstraintRotation} />
          </> : <>
            <label>Axis
              <select aria-label="Mirror axis" value={constraintAxis} onChange={(event) => setConstraintAxis(event.target.value as 'vertical' | 'horizontal')}>
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </label>
            <ConstraintNumber label="Axis coordinate (mm)" value={constraintCoordinate} onChange={setConstraintCoordinate} />
            <p className="wb-constraint-note">Footprint geometry stays unchanged. Use a handed definition where needed.</p>
          </>}
          {activeConstraint && <p className="wb-constraint-note">{parts.get(activeConstraint.sourcePartId)?.reference ?? 'A part'} drives {activePart.reference}.</p>}
          <div className="wb-constraint-actions">
            <button type="button" onClick={saveConstraint} disabled={!constraintSourceId}>{activeConstraint ? 'Save constraint' : 'Add constraint'}</button>
            {activeConstraint && <button type="button" className="is-remove" onClick={removeConstraint}>Remove</button>}
          </div>
        </div> : <p className="wb-empty-note">Add another part on this board to create a layout constraint.</p>}
        </InspectorSection>
        <button className="wb-inspector-link" onClick={() => changeMode('PCB')}>Edit electrical connections <ArrowIcon /></button>
        {activeParts.length > 1 && <p className="wb-selection-count">{activeParts.length} parts selected. Position edits apply to selection.</p>}
      </> : <>
        <p className="wb-empty-note">Select a key, component, or matrix to edit it.</p>
        {selectedBoard && <label className="wb-object-name">Board name<input aria-label="Board name" value={boardName} onChange={(event) => setBoardName(event.target.value)} onBlur={commitBoardName} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setBoardName(selectedBoard.name); }} /></label>}
        <div className="wb-empty-measure"><span>Outline</span><strong>{readiness.outline ? 'Resolved' : 'Not defined'}</strong></div>
        <div className="wb-empty-measure"><span>Placed parts</span><strong>{visibleParts.length}</strong></div>

      </>}

    </>;
  };

  const pairPreview = matrixGhost && pairPlacement ? pairAt(matrixGhost, pairPlacement, matrixGhost.origin) : undefined;

  sceneHandlers.current = { startDrag, moveDrag, endDrag, choosePart, nudgePart, hoverPart: setHoveredPart };

  return <main className={`wb-root wb-unified is-${mode.toLowerCase()}`} data-objects-mode={objectsPanel.mode} data-inspector-mode={inspectorPanel.mode} style={{
    ...(objectsPanel.width ? { '--wb-navigator-width': `${objectsPanel.width}px` } : {}),
    ...(inspectorPanel.width ? { '--wb-inspector-width': `${inspectorPanel.width}px` } : {}),
  } as React.CSSProperties}>
    <header className="wb-topbar">
      <div className="wb-project-menu">
        <button ref={projectTriggerRef} className="wb-project-trigger" aria-expanded={projectMenuOpen} aria-controls="wb-project-dropdown" aria-label="Project" title={`Project menu — ${document.name}`} onClick={() => setProjectMenuOpen((open) => !open)}><ProjectIcon /></button>
        {projectMenuOpen && <div id="wb-project-dropdown" className="wb-project-dropdown" aria-label="Project menu">
          {onNewProject && <button onClick={() => { setProjectMenuOpen(false); onNewProject(); }}>New project</button>}
          {onImport && <button className="wb-open-project" onClick={() => projectFileRef.current?.click()}>Open v2 project</button>}
          {onImport && <input ref={projectFileRef} className="wb-project-file-input" type="file" accept=".boardstudio" onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onImport(file);
            event.currentTarget.value = '';
            setProjectMenuOpen(false);
          }} />}
      <label className="wb-project-title"><span>Name</span><input aria-label="Project name" title="Rename project" value={projectName} onChange={(event) => setProjectName(event.target.value)} onBlur={commitProjectName} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setProjectName(document.name); }} /></label>
          <button onClick={() => { setProjectMenuOpen(false); onExport('project'); }}>Save project copy</button>
          <button onClick={() => { setProjectMenuOpen(false); setScriptsOpen(true); setRightOpen(true); if (!compactInspector) inspectorPanel.setMode('pinned'); }}>Geometry scripts</button>
        <div className="wb-board-picker">
          <label htmlFor="wb-board-select">Board</label>
          <div><select id="wb-board-select" aria-label="Selected board" value={selectedBoardId} onChange={(event) => selectBoard(event.target.value)}>
            {document.boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}
          </select><button type="button" onClick={addBoard}>+ New</button></div>

        </div>
          <label className="wb-theme-setting">Appearance<select aria-label="Color theme" value={themePreference} onChange={(event) => chooseTheme(event.target.value as ThemePreference)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
        </div>}
      </div>
      <a className="wb-brand" href="#workbench" aria-label="Board Studio workbench">
        <span className="wb-brand-mark"><BrandMark /></span><span>BOARD<span className="wb-brand-light">STUDIO</span> <span className="wb-brand-version">v2</span></span>
      </a>
      <nav className="wb-modes" role="tablist" aria-label="Design stage">
        {modes.map((item) => <button key={item} role="tab" aria-selected={item === 'Design' ? designView : mode === item} className={`wb-mode ${(item === 'Design' ? designView : mode === item) ? 'is-active' : ''}`} onClick={() => changeMode(item === 'Design' ? lastDesignMode : item)}><span>{item === 'Library' ? 'Parts' : item}</span></button>)}
      </nav>
      <div className="wb-top-actions">
        <span className="wb-save-state"><span /> Saved locally</span>
        <button className="wb-icon-button" aria-label="Undo" title="Undo (Ctrl+Z)" onClick={onUndo}><UndoIcon /></button>
        <button className="wb-icon-button" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={onRedo}><RedoIcon /></button>
        <button className="wb-icon-button wb-export-trigger" aria-label="Export" title="Export" aria-pressed={mode === 'Export'} onClick={() => { changeMode('Export'); setRightOpen(true); if (!compactInspector) inspectorPanel.setMode('pinned'); }}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 12v5h12v-5M10 13V3M6 7l4-4 4 4" /></svg></button>
      </div>
    </header>
    <div className="wb-workspace-navigation">
      <button id="wb-objects-toggle" onClick={() => { if (compactObjects) { setLeftOpen(!leftOpen); setRightOpen(false); } else objectsPanel.setMode(objectsPanel.mode === 'pinned' ? 'collapsed' : 'pinned'); }} aria-expanded={compactObjects ? leftOpen : objectsPanel.mode === 'autohide' ? undefined : objectsPanel.mode === 'pinned'} aria-controls="wb-inventory"><PanelIcon side="left" /><span>Objects</span></button>
      <nav className="wb-workspace-breadcrumbs" aria-label="Workspace location"><ol>
        <li><button onClick={() => { changeMode('Design'); setScope(null); setSelected([]); }}>{selectedBoard?.name ?? 'Board'}</button></li>
        <li><button onClick={() => { setScope(null); setSelected([]); }}>{viewLabel}</button></li>
        {designView && (activeLayout || selectedMatrix) && <li><button aria-current="location" onClick={() => selectScope({ kind: 'matrix', matrixId: activeLayout?.matrixId ?? selectedMatrix!.id })}>{activeLayout?.name || selectedMatrix?.name?.trim() || `Matrix ${document.matrices.findIndex((matrix) => matrix.id === selectedMatrix?.id) + 1}`}</button></li>}
      </ol></nav>
      <button id="wb-inspector-toggle" onClick={() => { if (compactInspector) { setRightOpen(!rightOpen); setLeftOpen(false); } else inspectorPanel.setMode(inspectorPanel.mode === 'pinned' ? 'collapsed' : 'pinned'); }} aria-expanded={compactInspector ? rightOpen : inspectorPanel.mode === 'autohide' ? undefined : inspectorPanel.mode === 'pinned'} aria-controls="wb-inspector"><span>Inspect</span><PanelIcon side="right" /></button>
    </div>

    <p className="wb-keyboard-status" role="status" aria-label="Keyboard movement" aria-live="polite">{keyboardStatus}</p>
    <section className="wb-workspace" id="workbench">
      <WorkspacePanel side="left" label="Part inventory" settings={objectsPanel} compact={compactObjects} open={leftOpen} onClose={() => setLeftOpen(false)}>
        {mode === 'Library' ? <PartsLibrary definitions={libraryDefinitions} assemblies={(Object.keys(matrixPresetDefinitions) as MatrixPresetId[]).map((id) => ({ id, name: assemblyName(id), definitionId: matrixPresetDefinitions[id].definitionId }))} query={librarySearch} selected={libraryAssembly ? `assembly:${libraryAssembly}` : selectedLibraryDefinition?.id ?? ''} onCreate={addCustomDefinition} onImport={onImportFootprint} onSearch={setLibrarySearch} onSelect={(id) => { setScriptsOpen(false); setLibraryChoice(id); setLibraryAssembly(null); setLibrary3dOpen(false); setRightOpen(true); setLeftOpen(false); }} onAssembly={(id) => { setScriptsOpen(false); const preset = id as MatrixPresetId; setLibraryAssembly(preset); setLibraryChoice(matrixPresetDefinitions[preset].definitionId); setLibrary3dOpen(false); setRightOpen(true); setLeftOpen(false); }} /> : <>

        {matrixSetup && <form className="wb-matrix-setup" aria-label="New matrix" onSubmit={(event) => { event.preventDefault(); const rows = Number(matrixRows); const columns = Number(matrixColumns); if (Number.isInteger(rows) && rows > 0 && Number.isInteger(columns) && columns > 0 && rows * columns <= 4096) beginMatrixPlacement(rows, columns, matrixPreset); }}>
          <h3>New matrix</h3><label>Rows<input autoFocus aria-label="New matrix rows" type="number" min="1" max="4096" required value={matrixRows} onChange={(event) => setMatrixRows(event.target.value)} /></label><label>Columns<input aria-label="New matrix columns" type="number" min="1" max="4096" required value={matrixColumns} onChange={(event) => setMatrixColumns(event.target.value)} /></label>
          <label>Key assembly<select aria-label="New matrix assembly" value={matrixPreset} onChange={(event) => setMatrixPreset(event.target.value as MatrixPresetId)}>{(Object.keys(matrixPresetDefinitions) as MatrixPresetId[]).map((id) => <option key={id} value={id}>{assemblyName(id)}</option>)}</select></label>
          <p>Choose dimensions, then click the board to place.</p><button type="submit" disabled={!matrixRows || !matrixColumns || Number(matrixRows) * Number(matrixColumns) > 4096}>Continue to placement</button><button type="button" onClick={() => setMatrixSetup(false)}>Cancel</button>
        </form>}
        <WorkbenchTree entries={treeEntries} />
        <div className="wb-inventory-foot"><strong>{selectionTitle.split(' · ').at(-1)}</strong><span>{selectedBoard?.name} / {viewLabel}{selectedMatrix ? ` / ${activeLayout?.name || selectedMatrix.name || selectionTitle.split(' · ')[0]}` : ''}</span><span>{selected.length ? `${selected.length} selected` : 'Select an object to edit'}</span></div>
        </>}
      </WorkspacePanel>

      <section className="wb-canvas-column" aria-label={`${mode === 'Library' ? 'Parts' : mode} canvas`}>
        <div className="wb-canvas-toolbar" role="toolbar" aria-label={`${viewLabel} commands`}>
          {mode === 'Design' || mode === 'PCB' ? <>
            <CommandMenu id="wb-add-part" label="Add" icon={<ToolIcon name="add" />} open={addPartOpen} onOpenChange={(open) => { setAddPartOpen(open); setCommandMenu(null); }} triggerRef={addPartRef}>
              <section className="wb-add-section" aria-label="Layouts"><h3>Layouts</h3>
                <button className="wb-add-matrix wb-pair-icon" aria-label="Mirrored pair…" onClick={() => { changeMode('Design'); setPairSetup(true); setMatrixSetup(false); setRightOpen(false); }}><MirrorPairIcon /><span>Mirrored pair…<small>Linked halves, independent hardware</small></span></button>
                <button className="wb-add-matrix" aria-label="Matrix…" onClick={createGuidedMatrix}><ScopeIcon kind="matrix" /><span>Matrix…<small>Rows, columns & key assemblies</small></span></button>
              </section>
              {selectedMatrix && <section className="wb-add-section" aria-label="Selected matrix"><h3>{selectedMatrix.name || 'Selected matrix'}</h3><div className="wb-add-inline"><button data-close-menu onClick={() => commitMatrix({ ...selectedMatrix, rows: selectedMatrix.rows + 1 })}><ToolIcon name="add" />Add row</button><button data-close-menu onClick={() => commitMatrix({ ...selectedMatrix, columns: selectedMatrix.columns + 1 })}><ToolIcon name="add" />Add column</button></div></section>}
              <section className="wb-add-section" aria-label="Parts"><h3>Parts</h3>
                {boardLayouts.length > 0 && <label className="wb-placement-layout">Place in<select aria-label="Part placement layout" value={layoutTargetId} onChange={(event) => setLayoutTargetId(event.target.value)}><option value="">Board / ungrouped</option>{boardLayouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}</select></label>}
                <input autoFocus type="search" aria-label="Search parts" placeholder="Find a part…" value={librarySearch} onChange={(event) => setLibrarySearch(event.target.value)} />
                <div className="wb-add-part-results">{(librarySearch.trim() ? filteredLibrary : filteredLibrary.slice(0, 4)).map((definition) => <button key={definition.id} onClick={() => beginPartPlacement(definition)}><PartGlyph kind={definition.kind} /><span>{definition.name}</span></button>)}
                  {!filteredLibrary.length && <p>No parts match this search.</p>}
                </div>
                <button className="wb-add-browse" data-close-menu onClick={() => { changeMode('Library'); setLeftOpen(true); if (!compactObjects) objectsPanel.setMode('pinned'); }}>Browse all parts<ArrowIcon /></button>
              </section>
              <section className="wb-add-section" aria-label="Board geometry"><h3>Board geometry</h3><button data-close-menu onClick={() => { setOutlineSettingsOpen(true); setRightOpen(true); if (!compactInspector) inspectorPanel.setMode('pinned'); }}>Board outline…</button></section>
            </CommandMenu>
            <CommandMenu id="wb-select-menu" label={`Select: ${scope ? scope.kind === 'component' ? 'Part' : scope.kind[0].toUpperCase() + scope.kind.slice(1) : 'Key'}`} icon={<ToolIcon name="select" />} open={commandMenu === 'select'} onOpenChange={(open) => { setCommandMenu(open ? 'select' : null); setAddPartOpen(false); }}>
              <div role="group" aria-label="Selection scope">{(['matrix', 'row', 'column', 'key', 'component'] as const).map((kind) => <button key={kind} data-close-menu aria-pressed={scope?.kind === kind} disabled={!scope || (kind !== 'component' && !scope.matrixId)} onClick={() => changeScope(kind)}><ScopeIcon kind={kind} />{kind === 'component' ? 'Part' : kind[0].toUpperCase() + kind.slice(1)}</button>)}</div>
              <label>Group objects<select aria-label="Tree grouping" value={treeGrouping} onChange={(event) => { const value = event.target.value as 'row' | 'column'; setTreeGrouping(value); try { localStorage.setItem('boardstudio:v2:tree-grouping', value); } catch { /* Session only. */ } }}><option value="column">Columns</option><option value="row">Rows</option></select></label>
            </CommandMenu>
            <CommandMenu id="wb-transform-menu" label="Transform" icon={<ToolIcon name="transform" />} open={commandMenu === 'transform'} onOpenChange={(open) => setCommandMenu(open ? 'transform' : null)}>
              <p>Drag the selection to move it. Arrow keys move parts precisely.</p>
              <button data-close-menu onClick={() => { setInspectorTab('properties'); setRightOpen(true); }} disabled={!scope}>Position & rotation</button>
              <button data-close-menu disabled={!selectedMatrix} onClick={() => { changeScope('column'); setInspectorTab('properties'); setRightOpen(true); }}>Splay & origin</button>
              <button data-close-menu disabled={!selectedMatrix} onClick={() => { changeScope('row'); setInspectorTab('properties'); setRightOpen(true); }}>Row offsets</button>
            </CommandMenu>
            <CommandMenu id="wb-align-menu" label="Align" icon={<ToolIcon name="align" />} open={commandMenu === 'align'} onOpenChange={(open) => setCommandMenu(open ? 'align' : null)}>
              <label>Reference part<select aria-label="Alignment reference" disabled={!alignTargets.length} value={alignTarget?.id ?? ''} onChange={(event) => setAlignTargetId(event.target.value)}>{!alignTargets.length && <option value="">No independent reference parts</option>}{alignTargets.map((part) => <option value={part.id} key={part.id}>{part.reference}</option>)}</select></label>
              <p>Align envelope bounds once. The reference stays fixed. Rotated shapes use axis bounds.</p>
              <div className="wb-align-grid">{([['x', 'min', 'Left'], ['x', 'center', 'Center X'], ['x', 'max', 'Right'], ['y', 'max', 'Top'], ['y', 'center', 'Center Y'], ['y', 'min', 'Bottom']] as const).map(([axis, anchor, label]) => <button data-close-menu key={label} disabled={!activeParts.length || !alignTarget || selectionLocked || scope?.kind === 'row'} onClick={() => alignSelection(axis, anchor)}>{label}</button>)}</div>
              {(selectionLocked || scope?.kind === 'row') && <p>{selectionLocked ? 'Unlock or remove the driving constraint before aligning.' : 'A row can cross differently splayed columns. Align individual keys or a column.'}</p>}
              <button data-close-menu disabled={!scope} onClick={() => { setInspectorTab('relations'); setRightOpen(true); }}>Relationships</button>
            </CommandMenu>
            <CommandMenu id="wb-snap-menu" label="Snap" icon={<ToolIcon name="snap" />} open={commandMenu === 'snap'} onOpenChange={(open) => setCommandMenu(open ? 'snap' : null)}>
              <label>Grid step<select aria-label="Snap increment" value={snapFraction} onChange={(event) => setSnapFraction(Number(event.target.value))}><option value={0}>Off</option><option value={0.125}>⅛u</option><option value={0.25}>¼u</option><option value={0.5}>½u</option><option value={1}>1u</option></select></label>
              <p>Uses the selected matrix pitch. Hold Alt to place freely.</p>
              <label className="wb-menu-check"><input type="checkbox" checked={geometrySnap} onChange={(event) => setGeometrySnap(event.target.checked)} /> Geometry snap</label>
              <label className="wb-menu-check"><input type="checkbox" checked={gapSnap} onChange={(event) => setGapSnap(event.target.checked)} disabled={!geometrySnap} /> Envelope gap</label>
              <label>Gap (mm)<input aria-label="Snap gap" type="number" min="0" step="0.1" placeholder={String(selectedMatrix?.edgeGap?.x ?? 1)} value={gapOverride} onChange={(event) => setGapOverride(event.target.value)} /></label>
              <p>Standalone parts snap at corners, midpoints and centers. Gaps use rectangular edges; keycap envelope when available, courtyard otherwise.</p>
              <label className="wb-menu-check"><input type="checkbox" checked={showFootprints} onChange={(event) => setShowFootprints(event.target.checked)} /> Show footprint detail</label>
            </CommandMenu>
          </> : <div className="wb-canvas-context"><ModeIcon mode={mode} /><strong>{viewLabel}</strong><span>{mode === 'Case' ? 'Assembly & components' : mode === 'Library' ? 'Footprint & model preview' : 'Artifacts & readiness'}</span></div>}
          {outlineActive && <button className="wb-tool-commit" onClick={finishOutline} disabled={outlineDraft.length < 3}>Close outline</button>}
        </div>
        <div className={`wb-canvas-stage ${leftOpen || rightOpen ? 'has-drawer' : ''} ${mode === 'Design' && !showFootprints ? 'is-layout-simplified' : ''}`}>
          {mode !== 'Library' && mode !== 'Case' && <div className="wb-canvas-watermark">{viewLabel} / Top · mm</div>}
          <svg tabIndex={0} onKeyDown={(event) => { if (matrixGhost) {
            if (event.key === 'Enter') { event.preventDefault(); placeMatrixAt(matrixGhost.origin); }
            if (event.key.startsWith('Arrow')) { event.preventDefault(); const step = PITCH_MM * (snapFraction || 0.25); setMatrixGhost((matrix) => matrix ? { ...matrix, origin: { x: matrix.origin.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y: matrix.origin.y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0) } } : null); }
            return;
          } if (!pendingPart) return; if (event.key === 'Enter') { event.preventDefault(); placePendingPart(placementPoint); } if (event.key.startsWith('Arrow')) { event.preventDefault(); const step = snapFraction ? PITCH_MM * snapFraction : nudgeStep; setPlacementPoint((point) => ({ x: point.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y: point.y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0) })); } }} ref={svgRef} className={`wb-canvas ${matrixGhost ? 'is-placing-matrix' : ''}`} style={{ display: mode === 'Case' || mode === 'Library' ? 'none' : undefined }} viewBox={`${viewBounds.minX} ${-viewBounds.maxY} ${viewBounds.width} ${viewBounds.height}`} role="application" aria-label="Board layout canvas. Use the CAD tree to select objects; use wheel to zoom and Space-drag to pan." onPointerDown={startCanvasPan} onPointerMove={moveCanvasPointer} onPointerUp={endCanvasPointer} onPointerCancel={endCanvasPointer} onClickCapture={(event) => { if (matrixGhost) { event.stopPropagation(); drawOutline(event); } }} onClick={drawOutline} onDoubleClick={finishOutline}>
            <defs><pattern id="wb-grid-small" width={unit / 2} height={unit / 2} patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r="0.12" fill="var(--wb-grid-large)" stroke="none" /></pattern></defs>
            <rect x={viewBounds.minX} y={-viewBounds.maxY} width={viewBounds.width} height={viewBounds.height} fill="url(#wb-grid-small)" />
            <g transform="scale(1,-1)" style={outlineActive || pendingPart || originPicking ? { pointerEvents: 'none' } : undefined}>
              {visibleContours.map((contour, index) => <polygon key={`contour-${index}`} points={contour.points.map((point) => `${point.x},${point.y}`).join(' ')} className={`wb-outline-shape ${contour.hole ? 'is-hole' : ''}`} />)}
              {mode === 'Design' && matrixGhost && <g transform={`translate(${matrixGhost.origin.x} ${matrixGhost.origin.y})`}>
                {pairPreview && <><line className="wb-mirror-axis" x1="0" x2="0" y1="-16" y2={(matrixGhost.rows - 1) * matrixGhost.pitch.y + 16} /><MatrixGhost matrix={pairPreview.preview} projection={matrixGhostProjections.get(pairPreview.preview.id)} scope={null} ghost onSelect={() => undefined} onStagger={() => undefined} /></>}
                <MatrixGhost matrix={pairPreview?.matrix ?? matrixGhost} projection={matrixGhostProjections.get(matrixGhost.id)} scope={null} ghost onSelect={() => undefined} onStagger={() => undefined} />
              </g>}
              {mode === 'Design' && visibleMatrices.map((matrix) => <MatrixGhost key={matrix.id} matrix={matrix} projection={matrixScenes.get(matrix.id)} parts={parts} definitions={definitions} scope={scope} onSelect={(row, column) => selectScope({ kind: 'key', matrixId: matrix.id, row, column })} onStagger={(event, axis, index) => startStagger(event, matrix, axis, index)} />)}
              {visibleParts.map((part) => {
                const definition = definitions.get(part.definitionId);
                return <ScenePart key={part.id} part={part} definition={definition} active={selectedIds.has(part.id)} constrained={constrainedTargetIds.has(part.id)} handlers={sceneHandlers} />;
              })}
              {hoverOutline.length > 2 && <polygon className="wb-scope-outline is-hover" points={hoverOutline.map((point) => `${point.x},${point.y}`).join(' ')} />}
              {groupOutline.length > 2 && <polygon className="wb-scope-outline is-selected" data-scope={scope?.kind} points={groupOutline.map((point) => `${point.x},${point.y}`).join(' ')} />}
              {mode === 'Design' && selectedMatrix && scope?.kind === 'column' && !originPicking && <SplayHandles projection={matrixScenes.get(selectedMatrix.id)} matrix={selectedMatrix} column={scope.column ?? 0} parts={activeParts} onStart={startSplay}
                onOrigin={(point) => commitSplay(selectedMatrix, scope.column ?? 0, { kind: 'origin', world: point })}
                onAngle={(value) => commitSplay(selectedMatrix, scope.column ?? 0, { kind: 'angle', angle: value, affect: splayAffect })} />}
              {snapGuide && <g className="wb-snap-guide"><circle cx={snapGuide.to.x} cy={snapGuide.to.y} r="1.3" /><path d={`M${snapGuide.from.x} ${snapGuide.from.y}L${snapGuide.to.x} ${snapGuide.to.y}`} /></g>}
              {pendingPart && <g className="wb-placement-preview" transform={`translate(${placementPoint.x} ${placementPoint.y})`}><polygon points={pendingPart.courtyard.map((point) => `${point.x},${point.y}`).join(' ')} /><path d="M-2 0h4M0-2v4" /></g>}
              {outlineDraft.length > 0 && <g className="wb-outline-draft">
                <polyline points={outlineDraft.map((point) => `${point.x},${point.y}`).join(' ')} />
                {outlineDraft.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="0.8" />)}
              </g>}
            </g>
          </svg>
          {pairSetup && mode === 'Design' && <MirroredPairSetup presets={(Object.keys(matrixPresetDefinitions) as MatrixPresetId[]).map((id) => ({ id, name: assemblyName(id) }))} onPreview={(setup) => beginMatrixPlacement(setup.rows, setup.columns, setup.preset as MatrixPresetId, setup)} onCancel={() => { setPairSetup(false); addPartRef.current?.focus(); }} />}
          {mode === 'Library' && <LibraryWorkspace definition={previewDefinition} title={libraryAssembly ? assemblyName(libraryAssembly) : undefined} companions={libraryCompanions} compiled={libraryCompiled} compilePending={previewCompilePending} compileError={previewCompileError} models={libraryModelStatus?.definitionId === selectedLibraryDefinition?.id ? libraryModelPreviews : []} modelStatus={libraryModelStatus?.definitionId === selectedLibraryDefinition?.id ? libraryModelStatus : undefined} onRetry={() => selectedLibraryDefinition && onSelectLibraryModel?.(selectedLibraryDefinition.id)} modelFilename={document.assets.find((asset) => asset.id === previewDefinition?.model?.assetId)?.name} show3d={library3dOpen} onViewChange={setLibrary3dOpen} colorScheme={colorScheme} />}
          {mode === 'Case' && <React.Suspense fallback={<div role="status">Loading case preview…</div>}><CasePreview
            mesh={activeCaseBody ? casePreview : undefined}
            componentPreviews={selectedBoard ? componentPreviews : undefined}
            boardThickness={selectedBoard?.thickness ?? 0}
            colorScheme={colorScheme}
            controlsTarget={caseControlsTarget}
          /></React.Suspense>}
          {mode !== 'Case' && mode !== 'Library' && !matrixGhost && !pendingPart && visibleParts.length === 0 && visibleContours.length === 0 && visibleMatrices.length === 0 && <div className="wb-canvas-empty"><div className="wb-empty-cursor"><CursorIcon /></div><h2>Start with the geometry</h2><p>Place keys or components to generate an outline that follows your layout.</p><button className="wb-primary" onClick={() => changeMode('Library')}>Browse parts <ArrowIcon /></button></div>}
          {snapGuide && <div className="wb-canvas-hint" role="status">{snapGuide.label}</div>}
          {originPicking && <div className="wb-canvas-hint" role="status">Pick splay origin · Click the canvas · Esc cancels</div>}
          {matrixGhost && pairPlacement && <div className="wb-canvas-hint" role="status">Place linked halves · Click to place · Esc cancels</div>}
          {pendingPart && <div className="wb-canvas-hint" role="status">Place {pendingPart.name}{pendingLayoutId ? ` in ${boardLayouts.find((layout) => layout.id === pendingLayoutId)?.name}` : ''} · Click or Enter to place · Esc cancels</div>}
          {outlineActive && <div className="wb-canvas-hint"><span className="wb-hint-dot" /> Click to add points <kbd>Esc</kbd> cancel <kbd>Enter</kbd> close</div>}
          {mode !== 'Library' && mode !== 'Case' && <><div className="wb-axis-indicator" aria-label="Coordinate axes"><span className="wb-axis-y">Y</span><span className="wb-axis-origin">0</span><span className="wb-axis-x">X</span></div>
          <div className="wb-canvas-scale" title="Canvas scale">{unit} mm <span /></div></>}
        </div>

      </section>

      <WorkspacePanel side="right" label={`${mode === 'Library' ? 'Parts' : mode} inspector`} settings={inspectorPanel} compact={compactInspector} open={rightOpen} onClose={() => setRightOpen(false)}>
        <div className="wb-inspector-content" key={`${mode}:${scriptsOpen}:${mode === 'Library' ? libraryAssembly ?? selectedLibraryDefinition?.id : `${selectedBoardId}:${scope?.matrixId}:${scope?.kind}:${scope?.row}:${scope?.column}:${activePart?.id}`}`}>
          {designView && !scriptsOpen && !outlineSettingsOpen && <>{mode === 'Design' && selectedMatrix && scope?.kind !== 'component' && <><div className="wb-inspect-head wb-selection-heading"><h2 aria-label={selectionTitle}>{selectionTitle.split(' · ').at(-1)}</h2></div><p className="wb-selection-summary">{scope?.kind === 'matrix' ? `${selectedMatrix.rows} rows · ${selectedMatrix.columns} columns` : `${activeParts.length} keys selected`}</p></>}<div className="wb-selection-breadcrumb">{selectedBoard?.name} / {viewLabel}{selectedMatrix ? ` / ${activeLayout?.name || selectedMatrix.name || selectionTitle.split(' · ')[0]}` : ''}</div><div className="wb-inspector-tabs" role="tablist" aria-label="Inspector details"><button role="tab" aria-selected={inspectorTab === 'properties'} onClick={() => setInspectorTab('properties')}>Properties</button><button role="tab" aria-selected={inspectorTab === 'relations'} onClick={() => setInspectorTab('relations')}>Relations</button></div></>}
          {showFindings ? <><div className="wb-inspect-head"><h2>Findings</h2><button className="wb-secondary" onClick={() => setShowFindings(false)}>Back</button></div><FindingList findings={scene.findings} /></> : inspectorTab === 'relations' && designView && !scriptsOpen && !outlineSettingsOpen ? <><h2>Relationships</h2><p className="wb-empty-note">{partnerLayout ? `Key geometry is linked to ${partnerLayout.name}. Components and switch variants stay local to each half.` : activeLayout ? 'This layout is independent. Its geometry and components can be edited separately.' : activeConstraint ? `${parts.get(activeConstraint.sourcePartId)?.reference} drives ${activePart?.reference}.` : 'No saved placement relationship on this selection.'}</p>{activePart && <button className="wb-secondary" onClick={() => { changeMode('Design'); setScope({ kind: 'component', partId: activePart.id }); setInspectorTab('properties'); }}>Edit placement relationship</button>}<p className="wb-empty-note">Matrix rows and columns share pitch, stagger and splay. Edit those in Properties.</p></> : getModeDetails()}
        </div>
        <div className="wb-inspector-bottom"><span><span className="wb-inspector-orb" />Live analysis</span><span className="wb-revision" title="Saved document revision">r{document.revision}</span></div>
      </WorkspacePanel>
      {((compactObjects && leftOpen) || (compactInspector && rightOpen)) && <button className="wb-drawer-scrim" aria-label="Close panels" onClick={() => { setLeftOpen(false); setRightOpen(false); }} />}
    </section>
    <footer className="wb-canvas-footer">
      {mode === 'Case' ? <>
        <span className="wb-footer-view">3D · mm</span>
        <div className="wb-footer-center"><span>Drag to orbit · Scroll to zoom</span></div>
        <div ref={setCaseControlsTarget} />
      </> : <>
      <div className="wb-footer-coords"><span>mm</span><span>X <b>{activePart?.pose.at.x.toFixed(2) ?? '0.00'}</b></span><span>Y <b>{activePart?.pose.at.y.toFixed(2) ?? '0.00'}</b></span></div>
      <div className="wb-footer-center"><button onClick={() => setCommandMenu('snap')} disabled={mode !== 'Design' && mode !== 'PCB'}>Grid {snapFraction === 0 ? 'off' : snapFraction === 1 ? '1u' : snapFraction === .5 ? '½u' : snapFraction === .125 ? '⅛u' : '¼u'}</button><span>{geometrySnap ? 'Geometry snap on' : 'Geometry snap off'}</span></div>
      <div className="wb-footer-zoom"><button className="wb-view-button" aria-label="Fit view" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><FitIcon /></button><button aria-label="Zoom out" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, Math.max(.25, zoom / 1.2))}>−</button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, Math.min(4, zoom * 1.2))}>+</button></div>
      </>}
      <button className="wb-findings-status" onClick={() => { setShowFindings(!showFindings); setRightOpen(true); }}><ToolIcon name="warning" />{scene.findings.length} findings</button>
    </footer>
  </main>;
};

const isTyping = (target: EventTarget | null): boolean => target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

const DraftInput = ({ ariaLabel, value, onCommit, type = 'text', min, step, placeholder }: {
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

const ConstraintNumber = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => <label className="wb-constraint-number">
  {label}<input aria-label={label} type="number" step="any" value={value} onChange={(event) => onChange(event.target.value)} />
</label>;

const courtyardSize = (points: Vec2[]): Vec2 => {
  if (points.length === 0) return { x: 10, y: 6 };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return { x: Math.max(...xs) - Math.min(...xs), y: Math.max(...ys) - Math.min(...ys) };
};

const definitionIssues = (definition: PartDefinition): string[] => {
  const issues: string[] = [];
  if (!definition.name.trim()) issues.push('Name is required.');
  const size = courtyardSize(definition.courtyard);
  if (definition.courtyard.length < 3 || !Number.isFinite(size.x) || !Number.isFinite(size.y) || size.x <= 0 || size.y <= 0) {
    issues.push('Courtyard must have positive width and height.');
  }
  const ids = new Set<string>();
  const numbers = new Set<string>();
  for (const [index, pad] of definition.pads.entries()) {
    if (!pad.id.trim() || ids.has(pad.id)) issues.push(`Pad ${index + 1} needs a unique ID.`);
    ids.add(pad.id);
    if (!definition.kicadSource) {
      if (!pad.number.trim()) issues.push(`Pad ${index + 1} needs a number.`);
      if (numbers.has(pad.number)) issues.push(`Pad ${index + 1} number must be unique.`);
      numbers.add(pad.number);
    }
    if (!Number.isFinite(pad.at.x) || !Number.isFinite(pad.at.y)) issues.push(`Pad ${index + 1} position must be finite.`);
    if (!Number.isFinite(pad.size.x) || !Number.isFinite(pad.size.y) || pad.size.x <= 0 || pad.size.y <= 0) {
      issues.push(`Pad ${index + 1} size must be positive.`);
    }
    if (pad.drill !== undefined && (!Number.isFinite(pad.drill) || pad.drill <= 0)) issues.push(`Pad ${index + 1} drill must be positive.`);
  }
  return issues;
};

const getBounds = (poses: Map<string, Part['pose']>, visibleParts: Part[], visibleContours: SceneDelta['contours'], matrices: Matrix[], matrixScenes: Map<string, MatrixProjection>) => {
  const all = [...visibleContours.flatMap((contour) => contour.points)];
  for (const part of visibleParts) all.push(poses.get(part.id)?.at ?? part.pose.at);
  for (const matrix of matrices) {
    const projection = matrixScenes.get(matrix.id);
    const size = { x: matrix.pitch.x / 2, y: matrix.pitch.y / 2 };
    for (const cell of projection?.scene?.cells ?? []) {
      const center = cell.pose.at;
      all.push({ x: center.x - size.x, y: center.y - size.y }, { x: center.x + size.x, y: center.y + size.y });
    }
  }
  all.push({ x: -35, y: -25 }, { x: 35, y: 25 });
  const minX = Math.min(...all.map((point) => point.x)) - 12;
  const maxX = Math.max(...all.map((point) => point.x)) + 12;
  const minY = Math.min(...all.map((point) => point.y)) - 12;
  const maxY = Math.max(...all.map((point) => point.y)) + 12;
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
};

const cameraBounds = (bounds: ReturnType<typeof getBounds>, zoom: number, pan: Vec2) => {
  const width = bounds.width / zoom;
  const height = bounds.height / zoom;
  const centerX = (bounds.minX + bounds.maxX) / 2 + pan.x;
  const centerY = (bounds.minY + bounds.maxY) / 2 + pan.y;
  return {
    minX: centerX - width / 2,
    maxX: centerX + width / 2,
    minY: centerY - height / 2,
    maxY: centerY + height / 2,
    width,
    height,
  };
};

const withCell = (matrix: Matrix, row: number, column: number, changes: Partial<MatrixCell>): Matrix => {
  const cells = matrix.cells ?? [];
  const current = cells.find((cell) => cell.row === row && cell.column === column);
  const next: MatrixCell = { row, column, enabled: current?.enabled ?? true, ...current, ...changes };
  return { ...matrix, cells: cells.filter((cell) => cell.row !== row || cell.column !== column).concat(next) };
};

const localMatrixDelta = (matrix: Matrix, delta: Vec2, column = 0): Vec2 => {
  const angle = -(matrix.rotation ?? 0) * Math.PI / 180;
  let x = delta.x * Math.cos(angle) - delta.y * Math.sin(angle);
  let y = delta.x * Math.sin(angle) + delta.y * Math.cos(angle);
  if (matrix.mirror === 'x') x *= -1;
  if (matrix.mirror === 'y') y *= -1;
  const splay = -(matrix.columnSplays ?? []).slice(0, column + 1).reduce((sum, value) => sum + value, 0) * Math.PI / 180;
  return { x: x * Math.cos(splay) - y * Math.sin(splay), y: x * Math.sin(splay) + y * Math.cos(splay) };
};

const snapDelta = (delta: Vec2, pitch: Vec2, fraction: number): Vec2 => fraction === 0 ? delta : ({
  x: Math.round(delta.x / Math.max(0.001, pitch.x * fraction)) * pitch.x * fraction,
  y: Math.round(delta.y / Math.max(0.001, pitch.y * fraction)) * pitch.y * fraction,
});

const createPart = (definition: PartDefinition, parts: Part[]): Part => {
  const prefix = definition.kind === 'switch' ? 'S' : definition.kind === 'controller' ? 'U' : definition.kind === 'encoder' ? 'E' : 'J';
  const references = new Set(parts.map((part) => part.reference));
  let count = 1;
  while (references.has(`${prefix}${count}`)) count += 1;
  return {
    id: makeId(),
    definitionId: definition.id,
    reference: `${prefix}${count}`,
    pose: { at: { x: 0, y: 0 }, rotation: 0 },
    side: 'front',
  };
};

const MatrixGhost = memo(({ matrix, scope, onSelect, onStagger, ghost = false, parts = new Map(), definitions = new Map(), projection }: {
  matrix: Matrix;
  scope: SelectionScope | null;
  ghost?: boolean;
  parts?: Map<string, Part>;
  definitions?: Map<string, PartDefinition>;
  projection?: MatrixProjection;
  onSelect: (row: number, column: number) => void;
  onStagger: (event: React.PointerEvent<SVGElement>, axis: 'row' | 'column', index: number) => void;
}) => {
  if (!projection?.scene) return null;
  const keyWidth = Math.max(1, matrix.pitch.x - (matrix.edgeGap?.x ?? 1));
  const keyHeight = Math.max(1, matrix.pitch.y - (matrix.edgeGap?.y ?? 1));
  return <g className={`wb-matrix-ghost ${ghost ? 'is-placement-preview' : ''}`} aria-label={`Matrix ${matrix.rows} by ${matrix.columns}`}>
    {projection?.scene?.cells.map(({ row, column, enabled, pose, memberId }) => {
      if (!enabled) return null;
      const center = pose.at;
      const part = parts.get(memberId ?? '');
      const keycap = part?.keycap ?? definitions.get(part?.definitionId ?? matrix.definitionId)?.keycap;
      const selected = scope?.matrixId === matrix.id && scope.row === row && scope.column === column && ['key', 'component'].includes(scope.kind);
      const transform = `translate(${center.x} ${center.y}) rotate(${pose.rotation})`;
      const label = `${ghost ? 'Ghost' : 'Select'} key, row ${row + 1}, column ${column + 1}`;
      return <rect
        key={`${row}:${column}`}
        className={`wb-matrix-cell is-enabled ${selected ? 'is-selected' : ''}`}
        x={-(keycap?.x ?? keyWidth) / 2}
        y={-(keycap?.y ?? keyHeight) / 2}
        width={keycap?.x ?? keyWidth}
        height={keycap?.y ?? keyHeight}
        rx="0.9"
        transform={transform}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        onClick={(event) => { if (ghost) return; event.stopPropagation(); onSelect(row, column); }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          if (ghost) return;
          onSelect(row, column);
        }}
      />;
    })}
    {projection.scene.cells.filter((cell) => cell.column === 0).map(({ row }) => {
      const point = projection?.pose(row, 0)?.at;
      if (!point) return null;
      const basis = projection?.basis(0);
      if (!basis) return null;
      const offset = { x: -matrix.pitch.x * 0.9 * basis.axisX.x, y: -matrix.pitch.x * 0.9 * basis.axisX.y };
      return <g key={`row-handle-${row}`} className="wb-stagger-handle is-row" transform={`translate(${point.x + offset.x} ${point.y + offset.y})`}>
        <rect width="1.2" height="2.8" x="-0.6" y="-1.4" rx="0.4" aria-label={`Stagger row ${row + 1}`} onPointerDown={(event) => onStagger(event, 'row', row)} />
      </g>;
    })}
    {projection.scene.columns.map(({ column }) => {
      const point = projection?.pose(0, column)?.at;
      if (!point) return null;
      const basis = projection?.basis(column);
      if (!basis) return null;
      const offset = { x: -matrix.pitch.y * 0.9 * basis.axisY.x, y: -matrix.pitch.y * 0.9 * basis.axisY.y };
      return <g key={`column-handle-${column}`} className="wb-stagger-handle is-column" transform={`translate(${point.x + offset.x} ${point.y + offset.y})`}>
        <rect width="2.8" height="1.2" x="-1.4" y="-0.6" rx="0.4" aria-label={`Stagger column ${column + 1}`} onPointerDown={(event) => onStagger(event, 'column', column)} />
      </g>;
    })}
  </g>;
});

const ScenePart = memo(({ part, definition, active, constrained, handlers }: {
  part: Part;
  definition?: PartDefinition;
  active: boolean;
  constrained: boolean;
  handlers: React.MutableRefObject<SceneHandlers | null>;
}) => <g className={`wb-scene-part ${active ? 'is-selected' : ''} ${constrained ? 'is-constrained' : ''}`} role="button" tabIndex={0}
  aria-label={`${part.reference}, ${definition?.name ?? 'part'}${constrained ? ', constrained target' : ''}, X ${part.pose.at.x} Y ${part.pose.at.y}`}
  aria-pressed={active}
  aria-description="Arrow keys move 0.1 mm; Shift+Arrow moves 1 mm. Delete removes the selection."
  onPointerEnter={() => handlers.current?.hoverPart(part.id)}
  onPointerLeave={() => handlers.current?.hoverPart(null)}
  onPointerDown={(event) => handlers.current?.startDrag(event, part)}
  onPointerMove={(event) => handlers.current?.moveDrag(event)}
  onPointerUp={(event) => handlers.current?.endDrag(event)}
  onPointerCancel={(event) => handlers.current?.endDrag(event)}
  onClick={(event) => { event.stopPropagation(); handlers.current?.choosePart(part.id, event.ctrlKey || event.metaKey); }}
  onKeyDown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handlers.current?.choosePart(part.id, event.ctrlKey || event.metaKey); }
    handlers.current?.nudgePart(event, part);
  }}
  transform={componentPoseSvgTransform(part.pose.at, part.pose.rotation, part.side)}>
  {definition?.courtyard.length ? <polygon points={definition.courtyard.map((point) => `${point.x},${point.y}`).join(' ')} className="wb-part-courtyard" /> : <rect x="-4" y="-4" width="8" height="8" rx="0.8" className="wb-part-courtyard" />}
  {definition?.kind === 'switch' && (part.keycap ?? definition.keycap) && <rect className="wb-keycap-boundary" x={-(part.keycap ?? definition.keycap)!.x / 2} y={-(part.keycap ?? definition.keycap)!.y / 2} width={(part.keycap ?? definition.keycap)!.x} height={(part.keycap ?? definition.keycap)!.y} rx="0.9" />}
  {definition?.pads.map((pad) => <circle key={pad.id} cx={pad.at.x} cy={pad.at.y} r={Math.max(0.35, Math.min(pad.size.x, pad.size.y) / 2)} className="wb-part-pad" />)}
  <circle r="1.25" className="wb-part-center" />
  {constrained && <circle r="8.1" className="wb-part-constrained" aria-hidden="true" />}
  <text x="0" y="-5.2" transform="scale(1,-1)" className="wb-part-reference">{part.reference}</text>

</g>, (previous, next) => previous.part.id === next.part.id
  && previous.part.reference === next.part.reference
  && previous.part.definitionId === next.part.definitionId
  && previous.part.side === next.part.side
  && previous.part.locked === next.part.locked
  && previous.part.pose.at.x === next.part.pose.at.x
  && previous.part.pose.at.y === next.part.pose.at.y
  && previous.part.pose.rotation === next.part.pose.rotation
  && previous.part.keycap === next.part.keycap
  && previous.part.properties === next.part.properties
  && previous.definition === next.definition
  && previous.active === next.active
  && previous.constrained === next.constrained);

const pointFromEvent = (event: { clientX: number; clientY: number }, svg: SVGSVGElement | null): Vec2 | null => {
  if (!svg) return null;
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const local = point.matrixTransform(matrix.inverse());
  return {
    x: local.x,
    y: -local.y,
  };
};

const formatSize = (points: Vec2[]): string => {
  if (points.length === 0) return '—';
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return `${(Math.max(...xs) - Math.min(...xs)).toFixed(1)} × ${(Math.max(...ys) - Math.min(...ys)).toFixed(1)} mm`;
};

const Coordinate = ({ label, value, suffix, onCommit }: { label: string; value: number; suffix?: string; onCommit: (value: number) => void }) => {
  const [draft, setDraft] = useState(value.toFixed(2));
  useEffect(() => setDraft(value.toFixed(2)), [value]);
  return <label className="wb-coordinate"><span>{label}</span><span className="wb-coordinate-input"><input type="number" step="0.1" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => onCommit(Number(draft))} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><small>{suffix ?? 'mm'}</small></span></label>;
};

type NumberRule = 'finite' | 'nonnegative' | 'positive' | 'positive-integer';
const CaseNumber = ({ label, value, unit: unitLabel, validation, onCommit }: { label: string; value: number; unit: string; validation: NumberRule; onCommit: (value: number) => void }) => {
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

const CellInspector = ({ matrix, scope, definitions, parts, members, onChange, projection, onSplay, splayAffect, onAffectChange, onPickOrigin }: {
  projection?: MatrixProjection; onSplay: (column: number, change: MatrixSplayChange) => void;
  splayAffect: 'column' | 'following'; onAffectChange: (value: 'column' | 'following') => void; onPickOrigin: () => void;
  matrix: Matrix; scope: SelectionScope; definitions: PartDefinition[]; parts: Map<string, Part>; members: Map<string, string>;
  onChange: (matrix: Matrix, definitions?: PartDefinition[]) => void;
}) => {
  const field = (label: string, value: number, onCommit: (value: number) => void) => <CaseNumber key={label} label={label} value={value} unit="mm" validation="finite" onCommit={onCommit} />;
  if (scope.kind === 'row' || scope.kind === 'column') {
    const axis = scope.kind;
    const index = scope[axis] ?? 0;
    const basis = projection?.basis(index);
    const offsets = axis === 'row' ? matrix.rowOffsets ?? [] : matrix.columnOffsets ?? [];
    const offset = offsets[index] ?? { x: 0, y: 0 };
    const count = [...members].filter(([key, id]) => Number(key.split(':')[axis === 'row' ? 0 : 1]) === index && parts.has(id)).length;
    const update = (value: Vec2) => {
      const next = [...offsets];
      while (next.length <= index) next.push({ x: 0, y: 0 });
      next[index] = value;
      onChange({ ...matrix, [axis === 'row' ? 'rowOffsets' : 'columnOffsets']: next });
    };
    return <section aria-label={`${axis} properties`}>
      {axis === 'column' && basis && <InspectorSection title="Splay & origin" defaultOpen>
        <div className="wb-splay-angle"><CaseNumber label="Splay" value={basis.splayAngle} unit="°" validation="finite" onCommit={(value) => onSplay(index, { kind: 'angle', angle: value, affect: splayAffect })} /></div>
        <label className="wb-script-select-label">Origin<select aria-label="Splay origin" value={basis.customOrigin ? 'custom' : 'base'} onChange={(event) => onSplay(index, { kind: 'origin', world: event.target.value === 'base' ? null : basis.splayOrigin })}><option value="base">Column base</option><option value="custom">Custom point</option></select></label>
        <button className="wb-secondary wb-pick-origin" onClick={onPickOrigin}><ToolIcon name="origin" />Pick origin</button>
        <div className="wb-matrix-number-grid">{field('Origin X', basis.splayOrigin.x, (x) => onSplay(index, { kind: 'origin', world: { ...basis.splayOrigin, x } }))}{field('Origin Y', basis.splayOrigin.y, (y) => onSplay(index, { kind: 'origin', world: { ...basis.splayOrigin, y } }))}</div>
        <label className="wb-script-select-label">Affect<select aria-label="Splay affects" value={splayAffect} onChange={(event) => onAffectChange(event.target.value as 'column' | 'following')}><option value="column">This column</option><option value="following">This and following</option></select></label>
        <p className="wb-empty-note">Move the origin without moving the keys.</p>

      </InspectorSection>}
      <InspectorSection title="Position & rotation" defaultOpen={axis === 'row'}>{axis === 'column' && <CaseNumber label="Stagger" value={matrix.columnStaggers?.[index] ?? 0} unit="mm" validation="finite" onCommit={(value) => { const next = Array.from({ length: matrix.columns }, (_, i) => matrix.columnStaggers?.[i] ?? 0); next[index] = value; onChange({ ...matrix, columnStaggers: next }); }} />}<div className="wb-matrix-number-grid">{field('Offset X', offset.x, (x) => update({ ...offset, x }))}{field('Offset Y', offset.y, (y) => update({ ...offset, y }))}</div><button className="wb-secondary" onClick={() => update({ x: 0, y: 0 })}>Reset offsets</button></InspectorSection>
      <InspectorSection title="Spacing"><p className="wb-empty-note">Pitch {matrix.pitch.x} × {matrix.pitch.y} mm. Edge gap {matrix.edgeGap?.x ?? 1} × {matrix.edgeGap?.y ?? 1} mm. Select the matrix to change shared spacing.</p></InspectorSection>
      {axis === 'column' && <InspectorSection title="Advanced"><button className="wb-secondary" onClick={() => onChange({ ...matrix, columnStaggers: (matrix.columnStaggers ?? []).map((value, i) => i === index ? 0 : value), columnSplays: (matrix.columnSplays ?? []).map((value, i) => i === index ? 0 : value) })}>Reset stagger and splay</button></InspectorSection>}
    </section>;
  }
  const row = scope.row ?? 0;
  const column = scope.column ?? 0;
  const cell = matrix.cells?.find((entry) => entry.row === row && entry.column === column) ?? { row, column, enabled: true };
  const update = (changes: Partial<MatrixCell>) => {
    const next = withCell(matrix, row, column, changes);
    const definition = definitions.find((entry) => entry.id === changes.definitionId);
    onChange(next, definition ? [definition] : undefined);
  };
  return <section aria-label="Key properties">
    <label className="wb-matrix-diodes"><input type="checkbox" aria-label="Key enabled" checked={cell.enabled} onChange={(event) => update({ enabled: event.target.checked })} /> Enabled</label>
    <div className="wb-matrix-number-grid">
      {field('Local X', cell.offset?.x ?? 0, (x) => update({ offset: { x, y: cell.offset?.y ?? 0 } }))}
      {field('Local Y', cell.offset?.y ?? 0, (y) => update({ offset: { x: cell.offset?.x ?? 0, y } }))}
      <CaseNumber label="Key rotation" value={cell.rotation ?? 0} unit="°" validation="finite" onCommit={(rotation) => update({ rotation })} />
    </div>
    <button className="wb-secondary" onClick={() => update({ offset: { x: 0, y: 0 }, rotation: 0 })}>Reset local transform</button>
    <label className="wb-script-select-label">Switch variant<select aria-label="Cell variant" value={cell.definitionId ?? matrix.definitionId} onChange={(event) => update({ definitionId: event.target.value, variant: event.target.value })}>
      {definitions.filter((definition) => (definition.matrixTerminals && definition.terminals?.[definition.matrixTerminals.row]?.length && definition.terminals?.[definition.matrixTerminals.column]?.length)
        || (!definition.matrixTerminals && definition.pads.some((pad) => pad.id === 'one') && definition.pads.some((pad) => pad.id === 'two'))
        || definition.id === 'mx-hotswap' || definition.id === 'choc-hotswap').map((definition) => <option key={definition.id} value={definition.id}>{definition.name}</option>)}
    </select></label>
    <label className="wb-matrix-diodes"><input type="checkbox" aria-label="Diode on selected key" disabled={!matrix.diodes} checked={Boolean(matrix.diodes && cell.diode !== false)} onChange={(event) => update({ diode: event.target.checked })} /> Diode</label>
    <h3 className="wb-subtitle">Attached components</h3>
    {matrix.diodes && cell.diode !== false && <p className="wb-empty-note">Matrix diode</p>}
    {(cell.assemblies ?? []).map((assembly) => <div className="wb-pad-row" key={assembly.id}><span>{definitions.find((entry) => entry.id === assembly.definitionId)?.name ?? assembly.definitionId}</span><button aria-label={`Remove ${assembly.id}`} onClick={() => update({ assemblies: cell.assemblies?.filter((entry) => entry.id !== assembly.id) })}>Remove</button></div>)}
    {!cell.assemblies?.length && !(matrix.diodes && cell.diode !== false) && <p className="wb-empty-note">No attached components. Apply a component in Parts.</p>}
  </section>;
};

const MatrixEditor = ({ document, onEdit, scope, onDuplicateDesign }: { document: ProjectDoc; onEdit: (command: EditCommand) => void; scope: SelectionScope | null; onDuplicateDesign?: (matrixId: string, presetId: MatrixPresetId) => void }) => {
  const [presetId, setPresetId] = useState<MatrixPresetId>('mx-solder');
  const matrix = document.matrices.find((item) => item.id === scope?.matrixId);
  const definitions = new Map(document.definitions.map((definition) => [definition.id, definition]));
  const commit = (next: Matrix, definitions?: PartDefinition[]) => onEdit({
    baseRevision: document.revision,
    transactionId: makeId(),
    phase: 'commit',
    targetIds: [next.id],
    operation: { kind: 'set-matrix', matrix: next, definitions },
  });

  const update = (changes: Partial<Matrix>) => {
    if (!matrix) return;
    commit({ ...matrix, ...changes });
  };

  const field = (label: string, value: number, unitLabel: string, validation: NumberRule, onCommit: (value: number) => void) => <CaseNumber key={label} label={label} value={value} unit={unitLabel} validation={validation} onCommit={onCommit} />;

  return <section className="wb-matrix-editor" aria-label="Key matrix editor">
    {!matrix ? <p className="wb-empty-state">Select a matrix to edit its layout.</p> : <>
      <InspectorSection title="Layout" detail={`${matrix.rows} × ${matrix.columns}`} defaultOpen>
        <div className="wb-matrix-number-grid">
          {field('Rows', matrix.rows, 'keys', 'positive-integer', (value) => update({ rows: value }))}
          {field('Columns', matrix.columns, 'keys', 'positive-integer', (value) => update({ columns: value }))}
          {field('Pitch X', matrix.pitch.x, 'mm', 'positive', (value) => update({ pitch: { ...matrix.pitch, x: value } }))}
          {field('Pitch Y', matrix.pitch.y, 'mm', 'positive', (value) => update({ pitch: { ...matrix.pitch, y: value } }))}
        </div>
      </InspectorSection>
      <InspectorSection title="Position & orientation" defaultOpen>
        <div className="wb-matrix-number-grid">
          {field('Origin X', matrix.origin.x, 'mm', 'finite', (value) => update({ origin: { ...matrix.origin, x: value } }))}
          {field('Origin Y', matrix.origin.y, 'mm', 'finite', (value) => update({ origin: { ...matrix.origin, y: value } }))}
          {field('Rotation', matrix.rotation ?? 0, '°', 'finite', (value) => update({ rotation: value }))}
        </div>
        <label className="wb-script-select-label">Mirror<select aria-label="Mirror matrix" value={matrix.mirror ?? 'none'} onChange={(event) => update({ mirror: event.target.value as Matrix['mirror'] })}>
          <option value="none">None</option><option value="x">X axis</option><option value="y" disabled={Boolean((document.layouts ?? []).find((layout) => layout.matrixId === matrix.id && (layout.mirrorLink || document.layouts?.some((other) => other.mirrorLink?.sourceId === layout.id))))}>Y axis</option>
        </select></label>
      </InspectorSection>
      <InspectorSection title="Key assembly" detail={definitions.get(matrix.definitionId)?.name}>
        <label className="wb-script-select-label">Assembly preset<select aria-label="Apply matrix preset" value={presetId} onChange={(event) => setPresetId(event.target.value as MatrixPresetId)}>
          {(Object.keys(matrixPresetDefinitions) as MatrixPresetId[]).map((id) => <option key={id} value={id}>{assemblyName(id)}</option>)}
        </select></label>
        <div className="wb-inspector-actions">
          <button className="wb-secondary" onClick={() => {
            const result = matrixWithPreset(matrix, presetId);
            const missing = result.definitions.filter((definition) => !definitions.has(definition.id));
            commit(result.matrix, missing);
          }}>Apply preset</button>
          <button className="wb-inspector-link" disabled={!onDuplicateDesign} onClick={() => onDuplicateDesign?.(matrix.id, presetId)}>Duplicate design as variant</button>
        </div>
        <label className="wb-script-select-label">Switch footprint<select aria-label="Matrix part definition" value={matrix.definitionId} onChange={(event) => update({ definitionId: event.target.value })}>
          {document.definitions.filter((definition) => definition.kind === 'switch' || definition.id === matrix.definitionId).map((definition) => <option key={definition.id} value={definition.id}>{definition.name}</option>)}
        </select></label>
        <label className="wb-matrix-diodes"><input type="checkbox" aria-label="Add matrix diodes" checked={Boolean(matrix.diodes)} onChange={(event) => update({ diodes: event.target.checked })} /> Add one diode per key</label>
        {matrix.diodes && <label className="wb-script-select-label">Diode direction<select aria-label="Diode direction" value={matrix.diodeDirection ?? 'row2col'} onChange={(event) => update({ diodeDirection: event.target.value as Matrix['diodeDirection'] })}>
          <option value="row2col">Rows to columns</option><option value="col2row">Columns to rows</option>
        </select></label>}
      </InspectorSection>
      <InspectorSection title="Keycap spacing" detail="Preview only">
        <div className="wb-matrix-number-grid">
          {field('Edge gap X', matrix.edgeGap?.x ?? 1, 'mm', 'nonnegative', (value) => update({ edgeGap: { ...(matrix.edgeGap ?? { x: 1, y: 1 }), x: value } }))}
          {field('Edge gap Y', matrix.edgeGap?.y ?? 1, 'mm', 'nonnegative', (value) => update({ edgeGap: { ...(matrix.edgeGap ?? { x: 1, y: 1 }), y: value } }))}
        </div>
        <p className="wb-empty-note">Keycap preview {Math.max(0, matrix.pitch.x - (matrix.edgeGap?.x ?? 1)).toFixed(1)} × {Math.max(0, matrix.pitch.y - (matrix.edgeGap?.y ?? 1)).toFixed(1)} mm</p>
      </InspectorSection>
    </>}
  </section>;
};

const ModelVector = ({ title, value, unit: unitLabel, validation, onCommit }: { title: string; value: { x: number; y: number; z: number }; unit: string; validation: NumberRule; onCommit: (axis: 'x' | 'y' | 'z', value: number) => void }) => <fieldset className="wb-model-vector">
  <legend>{title}</legend>
  <div>{(['x', 'y', 'z'] as const).map((axis) => <CaseNumber key={axis} label={axis.toUpperCase()} value={value[axis]} unit={unitLabel} validation={validation} onCommit={(next) => onCommit(axis, next)} />)}</div>
</fieldset>;

const Measure = ({ label, value }: { label: string; value: string }) => <div className="wb-measure"><dt>{label}</dt><dd>{value}</dd></div>;

const FindingList = ({ findings }: { findings: SceneDelta['findings'] }) => findings.length ? <ul className="wb-findings">{findings.map((finding) => <li key={finding.id} className={`is-${finding.severity}`}>
  <span className="wb-finding-mark" /><span>{finding.message}</span>
</li>)}</ul> : <p className="wb-no-findings"><span>✓</span> No active findings</p>;

const PartGlyph = ({ kind }: { kind: PartDefinition['kind'] }) => <svg viewBox="0 0 28 28" aria-hidden="true" className="wb-glyph-svg">
  {kind === 'switch' ? <><rect x="4" y="4" width="20" height="20" rx="4" /><circle cx="14" cy="14" r="4.3" /><path d="M14 2v4M14 22v4M2 14h4M22 14h4" /></>
    : kind === 'controller' ? <><rect x="6" y="3" width="16" height="22" rx="2" /><path d="M10 7h8M10 21h8M3 9v2M3 14v2M25 9v2M25 14v2" /><circle cx="14" cy="14" r="3" /></>
      : kind === 'connector' ? <><rect x="4" y="7" width="20" height="14" rx="2" /><path d="M8 10v8M12 10v8M16 10v8M20 10v8" /></>
        : kind === 'encoder' ? <><circle cx="14" cy="14" r="9" /><circle cx="14" cy="14" r="3" /><path d="M14 2v3M14 23v3M2 14h3M23 14h3" /></>
          : <><rect x="5" y="5" width="18" height="18" rx="2" /><path d="M10 10h8v8h-8zM2 10h3M2 18h3M23 10h3M23 18h3" /></>}
</svg>;

const ScopeIcon = ({ kind }: { kind: SelectionScope['kind'] }) => <svg viewBox="0 0 20 20" aria-hidden="true">
  {kind === 'matrix' ? <><rect x="3" y="3" width="14" height="14" rx="1" /><path d="M3 8h14M3 12h14M8 3v14M12 3v14" /></>
    : kind === 'row' ? <><rect x="2" y="7" width="16" height="6" rx="1" /><path d="M7 7v6M13 7v6" /></>
    : kind === 'column' ? <><rect x="7" y="2" width="6" height="16" rx="1" /><path d="M7 7h6M7 13h6" /></>
    : kind === 'key' ? <><rect x="3" y="3" width="14" height="14" rx="3" /><path d="M6 13h8" /></>
    : <><rect x="6" y="6" width="8" height="8" rx="1" /><path d="M7 2v4M13 2v4M7 14v4M13 14v4M2 7h4M2 13h4M14 7h4M14 13h4" /></>}
</svg>;

const ModeIcon = ({ mode }: { mode: Mode }) => <svg viewBox="0 0 20 20" aria-hidden="true" className="wb-mode-icon">
  {mode === 'Design' ? <><path d="M3 14.5 14.5 3l2.5 2.5L5.5 17H3z" /><path d="m11 6 3 3M3 17h14" /></>
    : mode === 'PCB' ? <><rect x="3" y="3" width="14" height="14" rx="2" /><circle cx="7" cy="7" r="1.2" /><circle cx="13" cy="13" r="1.2" /><path d="M8 7h3v3M7 8v3h3" /></>
      : mode === 'Case' ? <><path d="m10 2 7 4v8l-7 4-7-4V6z" /><path d="m3 6 7 4 7-4M10 10v8" /></>
        : mode === 'Library' ? <><path d="M4 3h9l3 3v11H4z" /><path d="M13 3v4h4M7 11h6M7 14h6" /></>
          : <><path d="M10 2v10" /><path d="M6.5 5.5a7 7 0 1 0 7 0" /></>}
</svg>;

const BrandMark = () => <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M4 4h22v22H4z" /><path d="m8 20 5-10 4 8 3-5 3 7" /><circle cx="13" cy="10" r="1.3" /></svg>;
const ProjectIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" /><path d="M3 9h18" /></svg>;
const ArrowIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4" /></svg>;
const UndoIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 6 4 10l4 4M4 10h7a5 5 0 0 1 5 5" /></svg>;
const RedoIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 6 4 4-4 4m4-4H9a5 5 0 0 0-5 5" /></svg>;
const LockIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>;
const OutlineIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3 15 2-10 8-2 4 6-3 8H6z" /><circle cx="3" cy="15" r="1" /><circle cx="5" cy="5" r="1" /><circle cx="13" cy="3" r="1" /></svg>;
const FitIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4M13 3h4v4M3 13v4h4M17 13v4h-4" /><path d="m3 7 5-4M17 7l-5-4M3 13l5 4m9-4-5 4" /></svg>;
const CursorIcon = () => <svg viewBox="0 0 36 36" aria-hidden="true"><path d="m9 5 17 15-8 1 5 8-3 2-5-8-5 6z" /></svg>;
const EmptyBoard = () => <svg viewBox="0 0 80 58" aria-hidden="true"><path d="M14 15h46v32H14z" /><path d="M21 22h32v18H21z" /><circle cx="27" cy="28" r="2" /><circle cx="47" cy="34" r="2" /><path d="M8 9v40M67 9v40M8 9h8M8 49h8m43-40h8m-8 40h8" /></svg>;

export { Workbench };
export type { Props as WorkbenchProps };

const assemblyName = (id: MatrixPresetId): string => id.split('-').map((word) => word === 'mx' || word === 'rgb' ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)).join(' ');

const SplayHandles = ({ matrix, column, parts, projection, onStart, onOrigin, onAngle }: {
  matrix: Matrix; column: number; parts: Part[]; projection?: MatrixProjection;
  onStart: (event: React.PointerEvent<SVGGElement>, kind: 'origin' | 'angle') => void;
  onOrigin: (point: Vec2) => void; onAngle: (angle: number) => void;
}) => {
  const basis = projection?.basis(column);
  if (!basis) return null;
  const origin = basis.splayOrigin;
  const x = parts.length ? parts.reduce((sum, part) => sum + part.pose.at.x, 0) / parts.length : origin.x;
  const y = parts.length ? Math.max(...parts.map((part) => part.pose.at.y)) + matrix.pitch.y * .9 : origin.y + 20;
  return <g className="wb-splay-handles" onClick={(event) => event.stopPropagation()}>
    <path className="wb-splay-guide" d={`M${origin.x} ${origin.y} L${x} ${y}`} />
    <g transform={`translate(${origin.x} ${origin.y})`} role="button" tabIndex={0} aria-label="Move splay origin" onPointerDown={(event) => onStart(event, 'origin')} onKeyDown={(event) => {
      if (!event.key.startsWith('Arrow')) return;
      event.preventDefault(); event.stopPropagation(); const step = event.shiftKey ? 1 : .1;
      onOrigin({ x: origin.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y: origin.y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0) });
    }}>
      <circle className="wb-handle-target" r="4" /><circle r="2" /><path d="M-3.5 0h7M0-3.5v7" /><text transform="scale(1,-1)" x="4.5" y="1">Origin</text>
    </g>
    <g transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label="Drag to splay" onPointerDown={(event) => onStart(event, 'angle')} onKeyDown={(event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault(); event.stopPropagation(); onAngle(basis.splayAngle + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 5 : 1));
    }}>
      <rect className="wb-handle-target" x="-11" y="-5" width="22" height="10" /><path d="M-9 0Q0 6 9 0M-9 0l1 3M-9 0l3-.5M9 0l-1 3M9 0l-3-.5" /><text transform="scale(1,-1)" textAnchor="middle" y="-6">Drag to splay</text>
    </g>
  </g>;
};

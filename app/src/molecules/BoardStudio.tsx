import { resolvedMatrixFindings } from '../utils/assemblyElectrical';
import ProjectMenu from './ProjectMenu';
import { findingTarget } from '../utils/findingTarget';
import { MISSING_CONTROLLER_FINDING } from '../utils/designSetup';
import { keepSnapRelation } from '../utils/layoutRelations';
import AssemblyScopePanel from './AssemblyScopePanel';
import { SnapProvider } from '../hooks/useSnapOptions';
import { removeSelection, isDeleteShortcut } from '../utils/studioDelete';
import { ResizeReview, type ResizeProposal } from '../utils/resizeReview';
import { repairSetup } from '../utils/setupRepair';
import { applyBoardDefaults } from '../utils/boardDefaults';
import ResizeReviewDialog from './ResizeReviewDialog';
import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Code2,
  Component,
  Cpu,
  Download,
  Eye,
  FolderOpen,
  GitBranch,
  LayoutGrid,
  Plus,
  Redo2,
  Settings,
  SlidersHorizontal,
  Undo2,
  Variable,
  X,
} from 'lucide-react';
import { useConfigContext } from '../context/ConfigContext';
import { useCasePreview, useLayoutAnalysis } from '../hooks/useCasePreview';
import { useStudio } from '../hooks/useStudio';
import {
  getValue,
  readStudio,
  addCluster,
  addObject,
  addOutline,
  nextId,
  resizeCluster,
  setValue,
  StudioDoc,
} from '../utils/studioSource';
import { moveTargets } from '../utils/studioMove';
import {
  targets,
  selectTargets,
  selectionMode,
  includesObject,
  type SelectionMode,
  type StudioTarget,
} from '../utils/studioTargets';
import StudioExport from './StudioExport';
import StudioSettings from './StudioSettings';
import ConfigEditor from './ConfigEditor';
import UpdateChip from '../atoms/UpdateChip';
import InstallChip from '../atoms/InstallChip';
import CaseWizard from './CaseWizard';
import FilePreview from './FilePreview';
import StudioCanvas, { StudioSelection } from './StudioCanvas';
import StudioInspector from './StudioInspector';
import DesignSetupPanel from './DesignSetupPanel';
import RelationshipPanel from './RelationshipPanel';
import {
  insertComponent,
  COMPONENT_CHOICES,
} from '../utils/componentPlacement';
import { componentPackage } from '../utils/componentPackage';
import {
  alignObject,
  distanceObject,
  type RelationPick,
} from '../utils/layoutRelations';
import { theme } from '../theme/theme';
import ClusterTree from './ClusterTree';
import LayoutDefaults from './LayoutDefaults';
import { placeNewItem } from '../utils/studioPlacement';
import SelectionPopover from './SelectionPopover';
import {
  StudioShell,
  StudioBar,
  StudioHeader,
  StageNav,
  StudioBody,
  StudioPane,
  StudioBrowser,
  StudioProperties,
  StudioMain,
  StudioLibrary,
  StudioActions,
  StudioField,
  TreeButton,
  StudioStatus,
} from './StudioStyles';
const FootprintLibrary = lazy(() => import('./FootprintLibrary'));
const DesignView = lazy(() => import('./DesignView'));
const stages = [
  ['design', 'Design', LayoutGrid],
  ['pcb', 'PCB', Cpu],
  ['case', 'Case', Box],
  ['library', 'Library', Component],
  ['export', 'Export', Download],
] as const;
type Stage = (typeof stages)[number][0];
const EMPTY: StudioDoc = { schema: 'ergogen/v1', layout: {} };
const EMPTY_ASSETS = {};

export default function BoardStudio({
  onUpdate,
  onInstall,
}: { onUpdate?: () => void; onInstall?: () => void } = {}) {
  const context = useConfigContext();
  const source = context?.configInput || '';
  const parsed = useMemo(() => {
    try {
      return { data: readStudio(source), error: '' };
    } catch (error) {
      return { data: EMPTY, error: String(error) };
    }
  }, [source]);
  const data = parsed.data;
  const findingsId = useId();
  const [stage, setStage] = useState<Stage>('design');
  const [selection, setSelection] = useState<StudioSelection>({
    section: Object.keys(data.layout.clusters || {}).length
      ? 'clusters'
      : 'objects',
    id:
      Object.keys(data.layout.clusters || {})[0] ||
      Object.keys(data.layout.objects || {})[0] ||
      '',
  });
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [sections, setSections] = useState<Record<string, boolean>>({
    objects: true,
    selection: true,
    design: true,
  });
  const [sheet, setSheet] = useState<'inspector' | 'preview' | ''>('');
  const [view, setView] = useState<'canvas' | 'code' | 'library' | 'sketch'>(
    'canvas'
  );
  const [paneTab, setPaneTab] = useState<'objects' | 'properties'>(
    'properties'
  );
  const codeReturn = useRef<'canvas' | 'library' | 'sketch'>('canvas');
  const [libraryVisited, setLibraryVisited] = useState(false);
  const [side, setSide] = useState<'top' | 'side'>('top');
  const [pcbView, setPcbView] = useState<'outline' | 'pcb'>('outline');
  const assets = context?.projectAssets || EMPTY_ASSETS;
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [componentBoard, setComponentBoard] = useState('');
  const [componentChoice, setComponentChoice] = useState('nice_nano');
  const [batterySize, setBatterySize] = useState([0, 0, 0]);
  const [addingBusy, setAddingBusy] = useState(false);
  const [newKind, setNewKind] = useState('columns');
  const [newName, setNewName] = useState('');
  const [matrixSize, setMatrixSize] = useState({ columns: 5, rows: 4 });
  const [review, setReview] = useState(false);
  const [setupOpen, setSetupOpen] = useState(
    () => !!getValue(source, ['meta', 'studio', 'openSetup'])
  );
  const [assemblyKeys, setAssemblyKeys] = useState<string[]>([]);
  const [assemblyOpen, setAssemblyOpen] = useState(false);
  const [resizeReview, setResizeReview] = useState<{
    proposal: ResizeProposal;
    finish: (source: string) => void;
  } | null>(null);
  const repaired = useRef(new Set<string>());
  const editSource = context?.editSource;
  useEffect(() => {
    if (parsed.error || repaired.current.has(source)) {
      return;
    }
    try {
      const next = repairSetup(source);
      if (next !== source) {
        repaired.current.add(source);
        editSource?.(next);
      }
    } catch (caught) {
      setError(String(caught));
    }
  }, [source, parsed.error, editSource]);
  const inspectorTrigger = useRef<HTMLButtonElement>(null);
  const inspectorPane = useRef<HTMLElement>(null);
  const inspectorField = useRef<HTMLElement | null>(null);
  const resumeInspector = useRef(false);
  const previewReturn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (sheet === 'preview') {
      previewReturn.current?.focus();
      return;
    }
    if (sheet === 'inspector') {
      const field =
        resumeInspector.current && inspectorField.current?.isConnected
          ? inspectorField.current
          : inspectorPane.current?.querySelector<HTMLButtonElement>(
              '.close-pane'
            );
      field?.focus({ preventScroll: resumeInspector.current });
    }
    resumeInspector.current = false;
  }, [sheet]);
  useEffect(() => {
    if (sheet !== 'preview') {
      return;
    }
    const restoreDesktop = () => {
      if (window.innerWidth > parseInt(theme.studio.breakpoint)) {
        setSheet('inspector');
      }
    };
    window.addEventListener('resize', restoreDesktop);
    return () => window.removeEventListener('resize', restoreDesktop);
  }, [sheet]);
  const cad = context?.setCadActive;
  useEffect(() => {
    cad?.(true);
    return () => cad?.(false);
  }, [cad]);
  const studio = useStudio({
    source,
    project: context?.activeConfigId,
    injections: context?.injectionInput,
    assets,
    revision: context?.sourceRevision || 0,
    action: context?.sourceAction || 'restore',
    amend: context?.amendSource || (() => false),
    edit: (next) => context?.editSource(next),
  });
  const analysis = studio.analysis;
  const preview = useCasePreview(source, context?.injectionInput, assets);
  const layout = analysis;
  const report = studio.report;
  const [picking, setPicking] = useState<RelationPick | null>(null);
  const [relation, setRelation] = useState<{
    before: string;
    source: string;
  } | null>(null);
  const relationPreview = useLayoutAnalysis(
    relation?.source || '',
    context?.injectionInput,
    !!relation
  );
  useEffect(() => {
    if (
      !relation ||
      relationPreview.pending ||
      (relationPreview.stale && !relationPreview.error)
    ) {
      return;
    }
    if (relation.before !== context?.getRealtimeConfigInput()) {
      setError('The project changed. Retry the alignment.');
    } else if (relationPreview.error) {
      setError(relationPreview.error);
    } else if (relationPreview.result?.layout) {
      context?.editSource(relation.source);
    }
    setRelation(null);
  }, [
    relation,
    relationPreview.pending,
    relationPreview.stale,
    relationPreview.error,
    relationPreview.result,
    context,
  ]);
  const stale =
    analysis.stale || analysis.pending || !!analysis.error || !!parsed.error;
  const boardStale =
    analysis.stale || analysis.pending || !!analysis.error || !!parsed.error;
  const edit = (
    transform: (before: string) => string,
    finish: (source: string) => void = (next) => context?.editSource(next)
  ) => {
    try {
      const before = context?.getRealtimeConfigInput() || '';
      const next = transform(before);
      finish(next);
      setError('');
      return true;
    } catch (caught) {
      if (caught instanceof ResizeReview) {
        setResizeReview({ proposal: caught.proposal, finish });
        return false;
      }
      setError(String(caught));
      return false;
    }
  };
  const deleteSelected = () => {
    if (stale || !selection.id) {
      return;
    }
    edit(
      (before) => removeSelection(before, selection),
      (next) => {
        context?.editSource(next);
        setSelection({ section: 'objects', id: '' });
      }
    );
  };
  const choose = (
    value: StudioSelection,
    panel: 'inspect' | 'keep' = 'inspect',
    mode: SelectionMode = 'replace',
    order: StudioTarget[] = []
  ) => {
    setSelection((current) => selectTargets(current, value, mode, order));
    setPaneTab('properties');
    setReview(false);
    setQuickActionsOpen(
      ['objects', 'columns', 'rows', 'clusters'].includes(value.section) &&
        targets(value).length > 0
    );
  };
  const move = (
    target: StudioSelection,
    delta: number[],
    before: string,
    candidate?: string
  ) => {
    if (before !== context?.getRealtimeConfigInput()) {
      setError('The source changed during this move. Retry.');
      return false;
    }
    // The synchronous draft can move while background analysis catches up.
    if (!report || parsed.error || analysis.error) {
      return false;
    }
    return edit(
      (current) => candidate || moveTargets(current, target, delta, report)
    );
  };
  const changeStage = (next: Stage) => {
    setStage(next);
    setView(next === 'library' ? 'library' : 'canvas');
    if (next === 'library') {
      setLibraryVisited(true);
    }
    setQuickActionsOpen(false);
    if (window.innerWidth <= parseInt(theme.studio.breakpoint)) {
      setSheet('');
    }
    setReview(false);
    if (next !== 'library') {
      setAssemblyOpen(false);
    }
    if (next === 'pcb') {
      choose({
        section: 'outline',
        id: Object.keys(data.designs?.profiles || {})[0] || '',
      });
    }
  };
  const add = async () => {
    if (addingBusy) {
      return;
    }
    setAddingBusy(true);
    const id =
      newName.trim() ||
      nextId(
        [
          ...Object.keys(data.layout.objects || {}),
          ...Object.keys(data.layout.clusters || {}),
          ...Object.keys(data.layout.layers || {}),
          ...Object.keys(data.layout.constraints || {}),
        ],
        newKind
      );
    let section: StudioSelection['section'] = 'objects';
    try {
      let next = source;
      let payload: Awaited<ReturnType<typeof componentPackage>> | undefined;
      if (['columns', 'arc', 'free'].includes(newKind)) {
        section = 'clusters';
        next = addCluster(
          source,
          id,
          newKind as 'columns' | 'arc' | 'free',
          matrixSize
        );
      } else if (newKind === 'mirror') {
        section = 'clusters';
        const original =
          selection.section === 'clusters' &&
          data.layout.clusters?.[selection.id]
            ? selection.id
            : Object.keys(data.layout.clusters || {}).find(
                (key) => !data.layout.clusters![key].mirror
              );
        if (!original) {
          throw new Error('Create or select a source cluster first.');
        }
        next = setValue(source, ['layout', 'clusters', id], {
          label: id,
          mirror: { source: original, axis: 100 },
        });
      } else if (newKind === 'constraint') {
        section = 'constraints';
        const refs = Object.keys(data.layout.objects || {});
        if (refs.length < 2) {
          throw new Error('Add two objects before creating a constraint.');
        }
        const first =
          selection.section === 'objects' && refs.includes(selection.id)
            ? selection.id
            : refs[0];
        const second = refs.find((ref) => ref !== first)!;
        const a = report?.objects[first],
          b = report?.objects[second];
        const value =
          a && b
            ? Number(
                Math.hypot(
                  a.position[0] - b.position[0],
                  a.position[1] - b.position[1]
                ).toFixed(3)
              )
            : 19;
        next = setValue(source, ['layout', 'constraints', id], {
          type: 'distance',
          refs: [first, second],
          value,
        });
      } else if (newKind === 'component' && componentChoice !== 'custom') {
        payload = await componentPackage(componentChoice);
        if (source !== context?.getRealtimeConfigInput()) {
          throw new Error('The project changed. Retry adding the component.');
        }
        next = insertComponent(
          source,
          id,
          componentChoice,
          batterySize,
          componentBoard
        );
      } else if (newKind === 'layer') {
        section = 'layers';
        next = setValue(source, ['layout', 'layers', id], { surface: 'world' });
      } else {
        next = addObject(
          source,
          id,
          newKind as 'key' | 'component',
          selection.section === 'clusters' &&
            data.layout.clusters?.[selection.id]?.arrangement?.type === 'free'
            ? selection.id
            : undefined
        );
      }
      if (
        (section === 'clusters' && newKind !== 'mirror') ||
        section === 'objects'
      ) {
        next = placeNewItem(
          next,
          section as 'objects' | 'clusters',
          id,
          report
        );
      }
      if (payload) {
        context?.commitProject({ source: next }, payload);
      } else {
        context?.editSource(next);
      }
      choose({ section, id });
      setNewName('');
      setAdding(false);
      setError('');
    } catch (caught) {
      setError(String(caught));
    } finally {
      setAddingBusy(false);
    }
  };
  const addSelectionLine = (kind: 'key' | 'rows' | 'columns') => {
    if (kind === 'key') {
      setNewKind('key');
      setAdding(true);
      setSetupOpen(false);
      setSheet('inspector');
      setPaneTab('objects');
      return;
    }
    const clusterId =
      selection.section === 'clusters'
        ? selection.id
        : selection.cluster || '';
    const arrangement = data.layout.clusters?.[clusterId]?.arrangement;
    if (
      !clusterId ||
      !arrangement ||
      !Array.isArray(arrangement.columns) ||
      !Array.isArray(arrangement.rows)
    ) {
      setError('Select a key matrix before adding a row or column.');
      return;
    }
    const names =
      kind === 'columns' ? arrangement.columns : arrangement.rows;
    const nextName = nextId(names, kind === 'columns' ? 'c' : 'r');
    const nextSize =
      kind === 'columns'
        ? { columns: [...names, nextName], rows: arrangement.rows }
        : { columns: arrangement.columns, rows: [...names, nextName] };
    try {
      edit((before) => resizeCluster(before, clusterId, nextSize, 'fill'));
      setQuickActionsOpen(false);
    } catch (caught) {
      setError(String(caught));
    }
  };
  const selectedProfile =
    data.pcbs?.[Object.keys(data.pcbs || {})[0]]?.profile ||
    `profiles.${Object.keys(data.designs?.profiles || {})[0]}`;
  const model = boardStale
    ? undefined
    : analysis.result?.designs?.features[selectedProfile]?.model;
  const pcb = Object.entries(analysis.result?.pcbs || {})[0];
  const setupIssues = ((!parsed.error &&
    getValue(source, ['meta', 'studio', 'findings'])) ||
    []) as string[];
  const currentElectricalIssues = useMemo(
    () =>
      !boardStale && analysis.result?.layout
        ? resolvedMatrixFindings(analysis.result.layout)
        : undefined,
    [boardStale, analysis.result?.layout]
  );
  const electricalIssues = ((!parsed.error &&
    getValue(source, ['meta', 'studio', 'electricalFindings'])) ||
    []) as string[];
  const resizeIssues = Object.values(
    (getValue(source, ['meta', 'studio', 'resizeSpacing']) || {}) as Record<
      string,
      { conflicts?: string[] }
    >
  ).flatMap((entry) => entry.conflicts || []);
  const findings = [
    ...resizeIssues.map((message) => ({
      feature: 'layout',
      sourcePath: 'layout',
      code: 'resize-clearance',
      severity: 'error',
      message,
    })),
    ...setupIssues.map((message) => ({
      feature: 'meta.studio.setup',
      sourcePath:
        message === MISSING_CONTROLLER_FINDING
          ? 'meta.studio.setup.controller'
          : 'meta.studio.setup',
      code: 'setup-incomplete',
      severity: 'error',
      message,
    })),
    ...Array.from(
      new Set([
        ...electricalIssues.filter(
          (message) =>
            !currentElectricalIssues || !message.includes(': matrix wiring ')
        ),
        ...(currentElectricalIssues || []),
      ])
    ).map((message) => ({
      feature: 'meta.studio.electricalFindings',
      sourcePath: 'meta.studio.electricalFindings',
      code: 'wiring-review',
      severity: 'error',
      message,
    })),
    ...(report?.findings || []),
    ...(layout.diagnostics || []),
    ...analysis.diagnostics,
  ];
  const uniqueFindings = Array.from(
    new Map(
      findings.map((finding) => [
        `${finding.feature}:${finding.code}:${finding.message}`,
        finding,
      ])
    ).values()
  );
  const blockers = uniqueFindings.filter(
    (item) => item.severity === 'error'
  ).length;
  const solver =
    report && 'constraints' in report
      ? (report.constraints as { status: string; dof: number })
      : undefined;
  const keyCount = Object.values(report?.objects || {}).filter(
    (item) => item.kind === 'key'
  ).length;
  const reviewError = parsed.error || analysis.error;
  const reviewLabel = parsed.error
    ? 'Review source error'
    : analysis.error
      ? 'Review analysis error'
      : blockers
        ? `Review ${blockers} ${blockers === 1 ? 'blocker' : 'blockers'}`
        : uniqueFindings.length
          ? `Review ${uniqueFindings.length} ${uniqueFindings.length === 1 ? 'finding' : 'findings'}`
          : 'View findings';
  // Position analysis and generated previews have separate readiness states.
  const layoutMessage = parsed.error
    ? 'Project YAML needs repair'
    : analysis.error
      ? 'Layout analysis failed'
      : analysis.pending
        ? 'Updating layout…'
        : stale
          ? 'Layout analysis pending'
          : 'Layout positions current';
  const previewMessage = preview.pending
    ? 'Generating 3D preview…'
    : preview.error
      ? '3D generation failed'
      : !preview.result
        ? '3D preview not generated'
        : preview.stale
          ? '3D preview out of date'
          : '3D preview current';
  const navigateFinding = (path: string) => {
    const { editor } = findingTarget(path);
    const chunks = path.split('.');
    setReview(false);
    setStage(editor === 'case' ? 'case' : 'design');
    setView(editor === 'code' ? 'code' : 'canvas');
    if (editor === 'case' || editor === 'code') {
      return;
    }
    setSheet('inspector');
    setPaneTab('properties');
    setSetupOpen(editor === 'setup');
    setAssemblyOpen(false);
    if (editor === 'controller') {
      const existing = Object.entries(data.layout.objects || {}).find(
        ([, item]) => item.properties?.role === 'controller'
      );
      if (existing) {
        setSelection({ section: 'objects', id: existing[0] });
        return;
      }
      setPaneTab('objects');
      setSections((before) => ({ ...before, objects: true }));
      setNewKind('component');
      setNewName(nextId(Object.keys(data.layout.objects || {}), 'controller'));
      setAdding(true);
    } else if (editor === 'parameters') {
      setSelection({ section: 'parameters', id: '' });
    } else if (
      editor === 'layout' &&
      ['objects', 'clusters', 'constraints', 'layers'].includes(chunks[1]) &&
      chunks[2]
    ) {
      setSelection({
        section: chunks[1] as StudioSelection['section'],
        id: chunks[2],
      });
    }
  };
  const closeSheet = () => {
    if (!sheet) {
      return;
    }
    const trigger = inspectorTrigger;
    resumeInspector.current = false;
    setSheet('');
    trigger.current?.focus();
  };
  const inspectorButton = (
    <button
      ref={inspectorTrigger}
      aria-expanded={sheet === 'inspector'}
      aria-controls="studio-inspector"
      onClick={() => setSheet(sheet === 'inspector' ? '' : 'inspector')}
    >
      <SlidersHorizontal size={18} /> Inspector
    </button>
  );
  const selectionCount = targets(selection).length;
  const selectedKeyCount = Object.entries(data.layout.objects || {}).filter(
    ([id, item]) =>
      item.kind === 'key' &&
      includesObject(selection, { id, cluster: item.cluster, cell: item.cell })
  ).length;
  const clusterType = data.layout.clusters?.[selection.id]?.arrangement?.type;
  const selectionType = {
    clusters:
      clusterType === 'columns'
        ? 'Matrix'
        : clusterType === 'arc'
          ? 'Thumb arc'
          : 'Cluster',
    columns: 'Column',
    rows: 'Row',
    objects:
      data.layout.objects?.[selection.id]?.kind === 'key' ? 'Key' : 'Component',
    parameters: 'Parameters',
    constraints: 'Constraint',
    outline: 'Outline',
    layers: 'Layer',
  }[selection.section];
  const selectionSummary =
    selectionCount > 1
      ? `${selectionCount} selected · ${selectedKeyCount} keys`
      : selection.id
        ? `${selectionType} ${selection.id}${selection.cluster ? ` · ${selection.cluster}` : ''}${['clusters', 'columns', 'rows'].includes(selection.section) ? ` · ${selectedKeyCount} ${selectedKeyCount === 1 ? 'key' : 'keys'}` : ''}`
        : 'Select an object on the canvas';
  if (!context) {
    return null;
  }
  return (
    <SnapProvider>
      <StudioShell
        aria-label="Board Studio"
        onKeyDown={(event) => {
          if (
            stage === 'design' &&
            view === 'canvas' &&
            isDeleteShortcut(event.key, event.target) &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            event.preventDefault();
            deleteSelected();
          }
          if (event.key === 'Escape') {
            setAdding(false);
            setView(view === 'code' ? codeReturn.current : 'canvas');
            setReview(false);
            closeSheet();
          }
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === 'z' &&
            !(event.target as Element).closest('.monaco-editor')
          ) {
            event.preventDefault();
            if (event.shiftKey) {
              context.redo();
            } else {
              context.undo();
            }
          }
        }}
      >
        {resizeReview && (
          <ResizeReviewDialog
            proposal={resizeReview.proposal}
            onCancel={() => setResizeReview(null)}
            onApply={() => {
              if (
                context.getRealtimeConfigInput() !==
                resizeReview.proposal.before
              ) {
                setError(
                  'The project changed during review. Resize again to review the current keys.'
                );
                setResizeReview(null);
                return;
              }
              try {
                resizeReview.finish(resizeReview.proposal.after);
                setResizeReview(null);
                setError('');
              } catch (caught) {
                setError(String(caught));
              }
            }}
          />
        )}
        {context.showSettings && (
          <StudioSettings
            onClose={() => context.setShowSettings(false)}
            onLibrary={() => {
              context.setShowSettings(false);
              changeStage('library');
            }}
          />
        )}
        <StudioHeader>
          <button
            aria-label="Projects"
            onClick={() => context.setShowSideNav(true)}
          >
            <FolderOpen size={20} />
          </button>
          <h1>
            <span className="desktop">Board Studio / </span>
            {context.activeConfigName}
          </h1>
          <small className="desktop">
            {context.error ? 'Needs attention' : 'Autosaved'}
          </small>

          <button
            data-primary="true"
            aria-label="Generate project"
            aria-busy={preview.pending}
            disabled={
              !!parsed.error ||
              preview.pending ||
              analysis.pending ||
              analysis.stale ||
              !!analysis.error
            }
            onClick={preview.generate}
          >
            <Box size={18} />
            <span className="generate-label">
              {preview.pending
                ? 'Generating…'
                : preview.error
                  ? 'Retry generation'
                  : 'Generate 3D'}
            </span>
          </button>
          {preview.pending && (
            <button onClick={preview.cancel}>Cancel generation</button>
          )}
          <ProjectMenu>
            <button
              aria-label="Code"
              aria-pressed={view === 'code'}
              onClick={() => {
                if (view === 'code') {
                  setView(codeReturn.current);
                  return;
                }
                codeReturn.current = view;
                setView('code');
              }}
            >
              <Code2 size={18} />
              Code
            </button>
            {!parsed.error && (
              <button
                onClick={() => {
                  setAssemblyKeys([]);
                  setAssemblyOpen(false);
                  setSetupOpen(true);
                  setSheet('inspector');
                  setPaneTab('properties');
                }}
              >
                Design setup
              </button>
            )}
            {onUpdate && <UpdateChip onClick={onUpdate} />}
            {onInstall && <InstallChip onClick={onInstall} />}
            <button
              aria-label="Settings"
              onClick={() => context.setShowSettings(true)}
            >
              <Settings size={18} />
            </button>
          </ProjectMenu>
        </StudioHeader>
        <StageNav aria-label="Design workflow">
          {stages.map(([id, label, Glyph]) => (
            <button
              key={id}
              aria-current={stage === id ? 'step' : undefined}
              onClick={() => changeStage(id)}
            >
              <Glyph size={20} />
              {label}
            </button>
          ))}
          <div className="workspace-actions">
            <button
              aria-label="Undo project edit"
              disabled={!context.canUndo}
              onClick={context.undo}
            >
              <Undo2 size={18} />
            </button>
            <button
              aria-label="Redo project edit"
              disabled={!context.canRedo}
              onClick={context.redo}
            >
              <Redo2 size={18} />
            </button>
            {view !== 'library' &&
              ['design', 'pcb'].includes(stage) &&
              inspectorButton}
          </div>
        </StageNav>
        {preview.error && (
          <StudioStatus role="alert">{preview.error}</StudioStatus>
        )}
        {analysis.error && (
          <StudioStatus role="alert">
            {analysis.error}
            <button onClick={analysis.generate}>Retry board analysis</button>
          </StudioStatus>
        )}
        {resizeIssues.length > 0 && (
          <StudioStatus role="alert">{resizeIssues.join(' ')}</StudioStatus>
        )}
        {context.error && (
          <StudioStatus role="alert">{context.error}</StudioStatus>
        )}
        {(error || parsed.error) && (
          <StudioStatus role="alert">
            {error || parsed.error}
            <button
              onClick={() => {
                setError('');
                setView('code');
              }}
            >
              Open Code
            </button>
          </StudioStatus>
        )}
        {libraryVisited && (
          <StudioLibrary $active={view === 'library'}>
            <Suspense fallback={<p>Opening part library…</p>}>
              <StudioBar>
                <h2>Part library</h2>
              </StudioBar>
              <FootprintLibrary
                source={source}
                onSource={(next) => edit(() => next)}
                onPreview={() => changeStage('case')}
                onAssemblyApply={(setup, assets) => {
                  try {
                    context.commitProject(
                      { source: applyBoardDefaults(source, setup) },
                      { assets }
                    );
                  } catch (caught) {
                    setError(String(caught));
                  }
                }}
                onAssembly={() => {
                  changeStage('design');
                  setAssemblyKeys([]);
                  setAssemblyOpen(false);
                  setSetupOpen(true);
                  setSheet('inspector');
                  setPaneTab('properties');
                }}
              />
            </Suspense>
          </StudioLibrary>
        )}
        {view === 'library' ? null : view === 'code' ? (
          <StudioMain style={{ flex: 1 }}>
            <ConfigEditor
              aria-label="Project YAML"
              className="studio-code"
              onGenerate={preview.generate}
            />
          </StudioMain>
        ) : stage === 'case' && !parsed.error ? (
          <CaseWizard
            presentation="embedded"
            session={{
              preview,
              analysis,
              onExport: () => changeStage('export'),
            }}
            onClose={() => changeStage('design')}
          />
        ) : stage === 'export' ? (
          <StudioExport
            source={source}
            injections={context.injectionInput}
            assets={assets}
            result={analysis.result}
            stale={boardStale}
            blockers={blockers}
            preview={preview}
            analysis={analysis}
            review={() => {
              const assemblies = Object.values(data.designs?.assemblies || {});
              if (
                !assemblies.length ||
                assemblies.some(
                  (spec) =>
                    (spec as { preset?: string })?.preset === 'enclosure'
                )
              ) {
                changeStage('case');
                return;
              }
              changeStage('design');
              setView('sketch');
            }}
          />
        ) : (
          <>
            {(view === 'sketch' || stage === 'pcb') && (
              <StudioBar className={'studio-stage-tools'}>
                {stage === 'pcb' && (
                  <>
                    <button
                      aria-pressed={pcbView === 'outline'}
                      onClick={() => setPcbView('outline')}
                    >
                      Outline
                    </button>
                    <button
                      aria-pressed={pcbView === 'pcb'}
                      onClick={() => setPcbView('pcb')}
                    >
                      KiCad PCB
                    </button>
                  </>
                )}
              </StudioBar>
            )}
            {sheet === 'preview' && (
              <StudioBar aria-label="Inspector preview">
                <button
                  ref={previewReturn}
                  onClick={() => setSheet('inspector')}
                >
                  <SlidersHorizontal size={18} /> Return to Inspector
                </button>
              </StudioBar>
            )}
            <StudioBody data-sheet={sheet ? 'inspector' : undefined}>
              <StudioPane
                ref={inspectorPane}
                id="studio-inspector"
                data-pane={paneTab}
                data-setup={setupOpen || undefined}
                $open={!!sheet}
                $preview={sheet === 'preview'}
                aria-label="Design inspector"
                onFocusCapture={(event) => {
                  if (
                    event.target.matches('input, select, textarea, summary')
                  ) {
                    inspectorField.current = event.target;
                  }
                }}
              >
                <div className="pane-header">
                  <div className="pane-top">
                    <p
                      className="selection-summary"
                      aria-label="Current selection"
                    >
                      {setupOpen
                        ? assemblyOpen
                          ? 'Key assembly'
                          : 'Design setup'
                        : selectionSummary}
                    </p>
                    <button
                      className="preview-pane"
                      onClick={() => {
                        resumeInspector.current = true;
                        setSheet('preview');
                      }}
                    >
                      <Eye size={18} /> Preview board
                    </button>
                    <button
                      className="close-pane"
                      aria-label="Close inspector"
                      title="Close inspector"
                      onClick={closeSheet}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div
                    className="pane-tabs"
                    role="group"
                    aria-label="Inspector view"
                  >
                    <button
                      aria-pressed={paneTab === 'objects'}
                      onClick={() => setPaneTab('objects')}
                    >
                      Browse objects
                    </button>
                    <button
                      aria-pressed={paneTab === 'properties'}
                      onClick={() => setPaneTab('properties')}
                    >
                      Edit properties
                    </button>
                  </div>
                </div>
                <StudioBrowser className="studio-browser">
                  <details open={!!sections.objects}>
                    <summary
                      onClick={(event) => {
                        event.preventDefault();
                        setSections((before) => ({
                          ...before,
                          objects: !before.objects,
                        }));
                      }}
                    >
                      Objects
                    </summary>
                    <StudioActions>
                      <button
                        onClick={() => {
                          setAdding(!adding);
                          setNewKind('columns');
                        }}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </StudioActions>
                    {adding && (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          add();
                        }}
                      >
                        <StudioField>
                          <span>Kind</span>
                          <select
                            aria-label="New item kind"
                            value={newKind}
                            onChange={(event) => setNewKind(event.target.value)}
                          >
                            {Object.entries({
                              columns: 'Key matrix',
                              arc: 'Thumb arc',
                              free: 'Free cluster',
                              mirror: 'Linked mirror',
                              key: 'Key',
                              component: 'Component',
                              layer: 'Mounting layer',
                              constraint: 'Constraint',
                            }).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </StudioField>
                        {newKind === 'component' && (
                          <>
                            <StudioField>
                              <span>Component</span>
                              <select
                                aria-label="Component catalogue"
                                value={componentChoice}
                                onChange={(event) =>
                                  setComponentChoice(event.target.value)
                                }
                              >
                                {COMPONENT_CHOICES.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.label}
                                  </option>
                                ))}
                              </select>
                            </StudioField>
                            {Object.keys(data.pcbs || {}).length > 1 && (
                              <StudioField>
                                <span>Board</span>
                                <select
                                  aria-label="Component board"
                                  value={
                                    componentBoard ||
                                    Object.keys(data.pcbs || {})[0]
                                  }
                                  onChange={(event) =>
                                    setComponentBoard(event.target.value)
                                  }
                                >
                                  {Object.keys(data.pcbs || {}).map((id) => (
                                    <option key={id}>{id}</option>
                                  ))}
                                </select>
                              </StudioField>
                            )}
                            {componentChoice === 'battery' &&
                              ['Width', 'Depth', 'Height'].map(
                                (label, axis) => (
                                  <StudioField key={label}>
                                    <span>{label} · mm</span>
                                    <input
                                      aria-label={`Battery ${label.toLowerCase()}`}
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={batterySize[axis] || ''}
                                      onChange={(event) =>
                                        setBatterySize((values) =>
                                          values.map((v, i) =>
                                            i === axis
                                              ? Number(event.target.value)
                                              : v
                                          )
                                        )
                                      }
                                    />
                                  </StudioField>
                                )
                              )}
                          </>
                        )}
                        {newKind === 'columns' && (
                          <StudioActions>
                            {(['columns', 'rows'] as const).map((name) => (
                              <StudioField key={name}>
                                <span>
                                  {name === 'columns' ? 'Columns' : 'Rows'}
                                </span>
                                <input
                                  aria-label={`New matrix ${name}`}
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={matrixSize[name]}
                                  onChange={(event) =>
                                    setMatrixSize({
                                      ...matrixSize,
                                      [name]: Number(event.target.value),
                                    })
                                  }
                                />
                              </StudioField>
                            ))}
                          </StudioActions>
                        )}
                        <StudioField>
                          <span>Name</span>
                          <input
                            aria-label="New item name"
                            value={newName}
                            pattern="[A-Za-z_][A-Za-z_0-9-]*"
                            onChange={(event) => setNewName(event.target.value)}
                          />
                        </StudioField>
                        <StudioActions>
                          <button
                            type="submit"
                            disabled={
                              addingBusy ||
                              (Object.keys(data.layout.objects || {}).length >
                                0 &&
                                !Object.keys(report?.objects || {}).length)
                            }
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdding(false)}
                          >
                            Cancel
                          </button>
                        </StudioActions>
                      </form>
                    )}
                    <LayoutDefaults source={source} edit={edit} />
                    <ClusterTree
                      data={data}
                      report={report}
                      selection={selection}
                      choose={(value, mode, order) => {
                        choose(value, 'keep', mode, order);
                      }}
                    />
                    <details>
                      <summary>Components and free objects</summary>
                      {Object.entries(data.layout.objects || {})
                        .filter(([, item]) => !item.cluster)
                        .map(([id, item]) => (
                          <TreeButton
                            key={id}
                            aria-pressed={includesObject(selection, { id })}
                            onClick={(event) => {
                              choose(
                                { section: 'objects', id },
                                'keep',
                                selectionMode(event),
                                Object.entries(data.layout.objects || {})
                                  .filter(([, item]) => !item.cluster)
                                  .map(([id]) => ({ section: 'objects', id }))
                              );
                            }}
                          >
                            <Component size={18} />
                            <span>
                              {item.label || id}
                              <small>{item.kind}</small>
                            </span>
                          </TreeButton>
                        ))}
                    </details>
                  </details>
                  <details open={!!sections.design}>
                    <summary
                      onClick={(event) => {
                        event.preventDefault();
                        setSections((before) => ({
                          ...before,
                          design: !before.design,
                        }));
                      }}
                    >
                      Design
                    </summary>
                    <TreeButton
                      aria-pressed={selection.section === 'parameters'}
                      onClick={() => choose({ section: 'parameters', id: '' })}
                    >
                      <Variable size={18} />
                      Parameters
                    </TreeButton>
                    <TreeButton
                      aria-pressed={selection.section === 'constraints'}
                      onClick={() =>
                        choose({
                          section: 'constraints',
                          id:
                            Object.keys(data.layout.constraints || {})[0] || '',
                        })
                      }
                    >
                      <GitBranch size={18} />
                      Constraints
                    </TreeButton>
                    {Object.entries(data.layout.constraints || {}).map(
                      ([id, item]) => (
                        <TreeButton
                          key={id}
                          aria-pressed={
                            selection.section === 'constraints' &&
                            selection.id === id
                          }
                          onClick={() => choose({ section: 'constraints', id })}
                        >
                          {item.label || id}
                        </TreeButton>
                      )
                    )}
                    <details>
                      <summary>Mounting layers</summary>
                      {Object.keys(data.layout.layers || {}).map((id) => (
                        <TreeButton
                          key={id}
                          aria-pressed={
                            selection.section === 'layers' &&
                            selection.id === id
                          }
                          onClick={() => choose({ section: 'layers', id })}
                        >
                          {id}
                          <small>Layer</small>
                        </TreeButton>
                      ))}
                    </details>
                    {Object.keys(data.designs?.profiles || {}).map((id) => (
                      <TreeButton
                        key={id}
                        aria-pressed={
                          selection.section === 'outline' && selection.id === id
                        }
                        onClick={() => choose({ section: 'outline', id })}
                      >
                        {id}
                        <small>Outline</small>
                      </TreeButton>
                    ))}
                    <button
                      onClick={() =>
                        edit((before) =>
                          addOutline(
                            before,
                            Object.keys(data.pcbs || {})[0] || 'main',
                            report,
                            'replace'
                          )
                        )
                      }
                    >
                      Rebuild board outline
                    </button>
                    <StudioActions>
                      <button
                        onClick={() => {
                          setView(view === 'sketch' ? 'canvas' : 'sketch');
                          setSheet('');
                        }}
                      >
                        Sketches
                      </button>
                    </StudioActions>
                  </details>
                </StudioBrowser>
                <StudioProperties className="studio-properties">
                  {setupOpen && !assemblyOpen && (
                    <DesignSetupPanel
                      source={source}
                      currentSource={() =>
                        context.getRealtimeConfigInput() || source
                      }
                      injections={context.injectionInput}
                      onClose={() => setSetupOpen(false)}
                      onApply={(next, newAssets) => {
                        edit(
                          () => next,
                          (after) => {
                            context.commitProject(
                              { source: after },
                              { assets: newAssets }
                            );
                            setSetupOpen(false);
                          }
                        );
                      }}
                    />
                  )}
                  {setupOpen && assemblyOpen && (
                    <AssemblyScopePanel
                      source={source}
                      ids={assemblyKeys}
                      selection={selection}
                      onClose={() => setSetupOpen(false)}
                      onApply={(change, newAssets, injections) =>
                        edit(change, (after) => {
                          context.commitProject(
                            { source: after },
                            { assets: newAssets, injections }
                          );
                          setSetupOpen(false);
                        })
                      }
                    />
                  )}
                  {!setupOpen && (
                    <>
                      {report && (
                        <RelationshipPanel
                          source={source}
                          selection={selection}
                          report={report}
                          edit={edit}
                          onPick={setPicking}
                          onPropose={(next) =>
                            setRelation({ before: source, source: next })
                          }
                        />
                      )}
                      {picking && (
                        <p role="status">
                          Click a center guide on the canvas.{' '}
                          <button onClick={() => setPicking(null)}>
                            Cancel relationship
                          </button>
                        </p>
                      )}

                      <details open={!!sections.selection}>
                        <summary
                          onClick={(event) => {
                            event.preventDefault();
                            setSections((before) => ({
                              ...before,
                              selection: !before.selection,
                            }));
                          }}
                        >
                          Selection
                        </summary>
                        {['objects', 'columns', 'rows', 'clusters'].includes(
                          selection.section
                        ) && (
                          <>
                            <StudioInspector
                              source={source}
                              data={data}
                              selection={selection}
                              report={report}
                              edit={edit}
                              select={choose}
                            />
                          </>
                        )}
                      </details>
                      {!['objects', 'columns', 'rows', 'clusters'].includes(
                        selection.section
                      ) && (
                        <StudioInspector
                          source={source}
                          data={data}
                          selection={selection}
                          report={report}
                          edit={edit}
                          select={choose}
                        />
                      )}
                    </>
                  )}
                </StudioProperties>
              </StudioPane>
              <StudioMain>
                {stage === 'design' &&
                  view === 'canvas' &&
                  quickActionsOpen &&
                  ['objects', 'columns', 'rows', 'clusters'].includes(
                    selection.section
                  ) &&
                  targets(selection).length > 0 && (
                    <SelectionPopover
                      source={source}
                      selection={selection}
                      report={report}
                      edit={edit}
                      onClose={() => setQuickActionsOpen(false)}
                      onOpenInspector={() => {
                        setQuickActionsOpen(false);
                        setSheet('inspector');
                        setPaneTab('properties');
                      }}
                      onDelete={() => {
                        setQuickActionsOpen(false);
                        deleteSelected();
                      }}
                      onAdd={(kind) => {
                        addSelectionLine(kind);
                      }}
                    />
                  )}
                {stage === 'design' &&
                  view === 'canvas' &&
                  !Object.keys(data.layout.objects || {}).length && (
                    <div
                      style={{
                        position: 'absolute',
                        top: theme.studio.emptyTop,
                        left: `calc(${theme.studio.touchSize} + ${theme.spacing.lg})`,
                        right: theme.spacing.md,
                        zIndex: 1,
                        textAlign: 'center',
                      }}
                    >
                      <h2>Build your layout</h2>
                      <p>Place keys and hardware using the design’s spacing.</p>
                      <StudioActions style={{ justifyContent: 'center' }}>
                        {['matrix', 'column', 'key', 'component'].map(
                          (kind) => (
                            <button
                              key={kind}
                              onClick={() => {
                                setNewKind(
                                  kind === 'matrix' || kind === 'column'
                                    ? 'columns'
                                    : kind
                                );
                                setMatrixSize(
                                  kind === 'column'
                                    ? { columns: 1, rows: 3 }
                                    : { columns: 5, rows: 4 }
                                );
                                setAdding(true);
                                setSetupOpen(false);
                                setSheet('inspector');
                                setPaneTab('objects');
                              }}
                            >
                              Add {kind}
                            </button>
                          )
                        )}
                      </StudioActions>
                    </div>
                  )}

                <StudioBar aria-label="Outline controls">
                  <label>
                    <input
                      type="checkbox"
                      checked={studio.automatic}
                      onChange={studio.toggle}
                    />
                    Automatic outline
                  </label>
                  {!studio.automatic && (
                    <button type="button" onClick={studio.rebuild}>
                      Rebuild outline
                    </button>
                  )}
                  {analysis.error && (
                    <button type="button" onClick={studio.rebuild}>
                      Retry outline
                    </button>
                  )}
                  {analysis.pending && (
                    <span role="status">Updating outline…</span>
                  )}
                </StudioBar>
                {stale && (
                  <StudioStatus
                    role="status"
                    style={{ position: 'relative', zIndex: 2 }}
                  >
                    {layout.pending
                      ? 'Updating layout…'
                      : 'Showing the last valid geometry.'}
                    {layout.error && (
                      <button onClick={layout.generate}>Retry analysis</button>
                    )}
                  </StudioStatus>
                )}
                {view === 'sketch' ? (
                  <Suspense fallback={<p>Opening sketches…</p>}>
                    <DesignView session={{ analysis, preview }} />
                  </Suspense>
                ) : stage === 'pcb' && pcbView === 'pcb' ? (
                  pcb ? (
                    <FilePreview
                      previewKey={`pcbs.${pcb[0]}`}
                      previewExtension="kicad_pcb"
                      previewContent={pcb[1]}
                    />
                  ) : (
                    <p>Generate a PCB profile to inspect its footprints.</p>
                  )
                ) : (
                  <>
                    <StudioCanvas
                      report={report}
                      injections={context.injectionInput}
                      source={source}
                      stale={stale}
                      selection={selection}
                      onSelect={choose}
                      onMove={move}
                      onDelete={deleteSelected}
                      model={model}
                      side={side}
                      onSide={setSide}
                      onPickTarget={
                        picking
                          ? (target) => {
                              if (report) {
                                try {
                                  setRelation({
                                    before: source,
                                    source:
                                      picking.kind === 'distance'
                                        ? distanceObject(
                                            source,
                                            picking.id,
                                            target,
                                            picking.value,
                                            report
                                          )
                                        : alignObject(
                                            source,
                                            picking.id,
                                            target,
                                            picking.axis,
                                            report
                                          ),
                                  });
                                  setPicking(null);
                                } catch (reason) {
                                  setError(String(reason));
                                }
                              }
                            }
                          : undefined
                      }
                      onKeepSnap={(snap) => {
                        if (report) {
                          try {
                            setRelation({
                              before: source,
                              source: keepSnapRelation(source, snap, report),
                            });
                          } catch (reason) {
                            setError(String(reason));
                          }
                        }
                      }}
                      rules={data.layout.constraints || {}}
                    />
                  </>
                )}
              </StudioMain>
            </StudioBody>
          </>
        )}
        {review && (
          <StudioStatus
            id={findingsId}
            role="region"
            aria-label="Project findings"
            style={{ maxHeight: '35vh', overflow: 'auto', alignItems: 'start' }}
          >
            <div style={{ flexBasis: '100%' }}>
              {reviewError && <p role="alert">{reviewError}</p>}
              {!!blockers && (
                <p>
                  Resolve blockers before downloading PCB and outline files.
                  Case downloads have separate checks in Export.
                </p>
              )}
              {stale && !reviewError && (
                <p>Findings update when layout analysis finishes.</p>
              )}
              {!uniqueFindings.length && !reviewError && !stale && (
                <p>
                  No findings from the current analysis. Check Export for
                  download readiness.
                </p>
              )}
            </div>
            {uniqueFindings.map((issue, index) => (
              <button
                key={index}
                onClick={() =>
                  navigateFinding(
                    ('sourcePath' in issue && issue.sourcePath) || issue.feature
                  )
                }
              >
                {issue.severity === 'error'
                  ? 'Blocker'
                  : issue.severity === 'warning'
                    ? 'Warning'
                    : 'Note'}
                : {issue.message} ·{' '}
                {
                  findingTarget(
                    ('sourcePath' in issue && issue.sourcePath) || issue.feature
                  ).label
                }
              </button>
            ))}
            <button onClick={() => setReview(false)}>Close findings</button>
          </StudioStatus>
        )}
        {!(stage === 'case' && view === 'canvas' && !parsed.error) && (
          <StudioStatus role="status" aria-label="Project status">
            <small>
              {stage === 'design' ? layoutMessage : previewMessage}
              {stage === 'design' &&
                !stale &&
                !!solver?.dof &&
                ` · ${solver.dof} free ${solver.dof === 1 ? 'movement' : 'movements'}`}
              {' · '}
              {keyCount} {keyCount === 1 ? 'key' : 'keys'}
            </small>
            <button
              aria-controls={findingsId}
              aria-expanded={review}
              onClick={() => setReview(!review)}
            >
              {reviewLabel}
            </button>
          </StudioStatus>
        )}
      </StudioShell>
    </SnapProvider>
  );
}

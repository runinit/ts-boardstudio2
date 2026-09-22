import { useBundledPreviews } from '../hooks/useBundledPreviews';
import { modelPreview } from '../utils/cachedModelPreview';
import { Undo2 } from 'lucide-react';
import {
  footprintUses,
  linkFootprint,
  saveFootprintSettings,
} from '../utils/footprintLinks';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useConfigContext } from '../context/ConfigContext';
import { useFootprintLibrary } from '../hooks/useFootprintLibrary';
import {
  createEntry,
  entryInjection,
  linkedUses,
  saveFootprint,
  packageLibrary,
} from '../utils/footprintLibrary';
import {
  prepareFootprint,
  prepareBundle,
  countUses,
  readFootprintFiles,
  ImportFile,
} from '../utils/footprintService';
import { packageAssets, saveAssets } from '../utils/caseAssets';
import type {
  FootprintInfo,
  LibraryEntry,
  ModelBinding,
} from '../types/footprint';
import ModelEditor from './ModelEditor';
import FootprintCanvas from './FootprintCanvas';
import InspectorSection from './InspectorSection';
import { FootprintParameters } from './FootprintParameters';
import type { FootprintParameters as ParameterDefinitions } from '../types/footprint';
import NewDesignWorkspace from './NewDesignWorkspace';
import { defaultSetup, type DesignSetup } from '../utils/designSetup';
import bundled from '../../.generated/footprints.json';
import { theme } from '../theme/theme';

const Layout = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${theme.cad.treeWidth} minmax(0, 1fr) ${theme.cad
      .inspectorWidth};
  flex: 1;
  min-height: 0;
  overflow: hidden;
  @media (max-width: ${theme.studio.breakpoint}) {
    grid-template-columns: 1fr;
    overflow: auto;
  }
`;
const AssemblyCard = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  background: ${theme.workbench.fieldSurface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.cad.fieldRadius};
`;
const AssemblyPreview = styled.div<{ $large?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  min-height: ${({ $large }) => ($large ? '280px' : '150px')};
  align-items: center;
  background: ${theme.colors.background};
  border-radius: ${theme.cad.fieldRadius};
  overflow: hidden;
  svg {
    width: 100%;
    height: ${({ $large }) => ($large ? '260px' : '140px')};
  }
`;
const ModelTile = styled.div`
  position: relative;
  min-height: 110px;
  perspective: 360px;
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 18%;
    right: 18%;
    height: 58px;
    border-radius: 4px;
    background: ${theme.colors.backgroundLighter};
    border: 1px solid ${theme.colors.border};
    transform: rotateX(58deg) rotateZ(-12deg);
  }
  &::before {
    top: 22px;
    box-shadow: 14px 12px 0 ${theme.colors.border};
  }
  &::after {
    top: 18px;
    left: 31%;
    right: 31%;
    height: 40px;
    background: ${theme.studio.key};
    border-color: ${theme.colors.accent};
    transform: rotateX(58deg) rotateZ(-12deg) translateZ(18px);
  }
`;
const LargePreview = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
  width: min(720px, 90%);
  margin: auto;
  h2,
  p {
    margin: 0;
  }
  p {
    color: ${theme.colors.textDarker};
  }
  ${ModelTile} {
    min-height: 220px;
    &::before,
    &::after {
      height: 110px;
    }
    &::before {
      top: 48px;
    }
    &::after {
      top: 40px;
    }
  }
`;
type AssemblyColors = {
  pcb: string;
  switch: string;
  diode: string;
  led: string;
};
function KeyAssemblyArt({
  colors,
  large = false,
}: {
  colors: AssemblyColors;
  large?: boolean;
}) {
  return (
    <AssemblyPreview $large={large} aria-label="Key assembly preview">
      <svg viewBox="0 0 160 120" role="img" aria-label="1x1 PCB">
        <rect
          x="12"
          y="12"
          width="136"
          height="96"
          rx="8"
          fill={colors.pcb}
          opacity="0.85"
        />
        <rect
          x="45"
          y="31"
          width="70"
          height="58"
          rx="5"
          fill={colors.switch}
        />
        <circle cx="30" cy="30" r="5" fill={colors.diode} />
        <circle cx="130" cy="90" r="5" fill={colors.diode} />
        <circle cx="130" cy="30" r="5" fill={colors.led} />
      </svg>
      <ModelTile aria-label="3D key assembly preview" />
    </AssemblyPreview>
  );
}
const Panel = styled.aside<{
  $drawer?: 'catalog' | 'inspector';
  $open?: boolean;
}>`
  @media (max-width: ${theme.studio.breakpoint}) {
    ${({ $drawer, $open }) =>
      $drawer
        ? `display:${$open ? 'block' : 'none'}; position:absolute; top:0; bottom:0; ${$drawer === 'catalog' ? 'left' : 'right'}:0; width:min(86vw,${theme.cad.inspectorWidth}); z-index:${theme.cad.drawerLayer}; background:${theme.colors.background}; box-sizing:border-box;`
        : ''}
  }

  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    ${({ $drawer }) => ($drawer ? 'width:100%; border-inline:0;' : '')}
  }

  padding: ${theme.spacing.md};
  min-width: 0;
  background: ${theme.colors.backgroundLight};
  overflow: auto;
  scrollbar-gutter: stable;
  border-right: 1px solid ${theme.colors.border};
  &[aria-label='Footprint inspector'] {
    border-right: 0;
    border-left: 1px solid ${theme.colors.border};
  }
  h2 {
    overflow-wrap: anywhere;
  }
  label {
    min-width: 0;
    overflow-wrap: anywhere;
    display: grid;
    gap: ${theme.spacing.xs};
    margin-bottom: ${theme.spacing.md};
  }
  input,
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
    background: ${theme.workbench.fieldSurface};
  }
  h2 {
    font-size: ${theme.workbench.titleSize};
  }
  h3 {
    font-size: ${theme.fontSizes.bodySmall};
    font-weight: 500;
    color: ${theme.colors.textDarker};
  }
  input[type='checkbox'] {
    width: 18px;
  }
  .import-actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
    margin: ${theme.spacing.sm} 0;
  }
  fieldset {
    margin: ${theme.spacing.md} 0;
    padding: ${theme.spacing.sm} 0;
    min-width: 0;
    border: 0;
    border-top: 1px solid ${theme.colors.border};
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: ${theme.fontSizes.bodySmall};
  }
  td,
  th {
    text-align: left;
    padding: ${theme.spacing.sm};
    border-bottom: 1px solid ${theme.colors.border};
  }
  small,
  p {
    color: ${theme.colors.textDarker};
    line-height: 1.5;
  }
`;
const MobileAction = styled.button`
  /* Keep the shell's generic button rule from exposing drawer controls. */
  && {
    display: none;
    @media (max-width: ${theme.studio.breakpoint}) {
      display: inline-flex;
    }
  }
`;
const Catalog = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin: ${theme.spacing.sm} 0 ${theme.spacing.lg};
  && button {
    justify-content: flex-start;
    text-align: left;
    min-width: 0;
    padding: ${theme.spacing.sm};
    background: transparent;
    border-color: transparent;
    > span {
      min-width: 0;
      display: grid;
      gap: ${theme.spacing.xs};
    }
    span span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    small {
      display: block;
      font-size: ${theme.fontSizes.bodySmall};
    }
  }
  && button:hover {
    background: ${theme.colors.buttonHover};
  }
  && button[aria-pressed='true'] {
    background: ${theme.studio.selected};
    border-color: ${theme.colors.accent};
  }
`;
const EditorHeader = styled.div`
  position: sticky;
  top: calc(-1 * ${theme.spacing.md});
  z-index: 1;
  margin: calc(-1 * ${theme.spacing.md}) calc(-1 * ${theme.spacing.md})
    ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.backgroundLight};
  border-bottom: 1px solid ${theme.colors.border};
  > button {
    margin-bottom: ${theme.spacing.sm};
  }
  h2 {
    margin: 0 0 ${theme.spacing.xs};
    font-size: ${theme.fontSizes.base};
  }
  p {
    margin: 0;
    font-size: ${theme.fontSizes.bodySmall};
  }
  .save-actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
    margin-top: ${theme.spacing.sm};
  }
`;
const Center = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  > div[aria-label='Footprint preview'] {
    flex: 1;
  }
`;
const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  button[aria-pressed='true'] {
    border-color: ${theme.colors.accent};
  }
`;
const Inset = styled.div`
  position: absolute;
  bottom: ${theme.spacing.md};
  left: ${theme.spacing.md};
  width: ${theme.cad.insetWidth};
  height: ${theme.cad.insetHeight};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.caseWizard.radius};
  overflow: hidden;
  @media (max-width: ${theme.studio.breakpoint}) {
    display: none;
  }
`;
type Batch = ImportFile & {
  checked: boolean;
  status?: string;
  draft?: LibraryEntry;
};
type Props = {
  onPreview?: () => void;
  onAssembly?: () => void;
  onAssemblyApply?: (
    setup: DesignSetup,
    assets: Record<string, string>
  ) => void;
  initialQuery?: string;
  source?: string;
  onSource?: (source: string) => void;
};
const ASSEMBLY_PRESETS = [
  { id: 'mx', label: 'MX', family: 'mx', mounting: 'solder', led: false },
  {
    id: 'mx-hotswap',
    label: 'MX hotswap',
    family: 'mx',
    mounting: 'hotswap',
    led: false,
  },
  { id: 'mx-rgb', label: 'MX RGB', family: 'mx', mounting: 'solder', led: true },
  {
    id: 'mx-rgb-hotswap',
    label: 'MX RGB hotswap',
    family: 'mx',
    mounting: 'hotswap',
    led: true,
  },
  {
    id: 'choc',
    label: 'Choc',
    family: 'choc_v1',
    mounting: 'solder',
    led: false,
  },
  {
    id: 'choc-hotswap',
    label: 'Choc hotswap',
    family: 'choc_v1',
    mounting: 'hotswap',
    led: false,
  },
  {
    id: 'choc-v2',
    label: 'Choc v2',
    family: 'choc_v2',
    mounting: 'solder',
    led: false,
  },
] as const;
export default function FootprintLibrary({
  onPreview,
  onAssembly,
  onAssemblyApply,
  initialQuery = '',
  source,
  onSource,
}: Props) {
  const context = useConfigContext();
  const { entries, error: storageError } = useFootprintLibrary();
  const [linkIndex, setLinkIndex] = useState('');
  const projectSource = source ?? context?.getRealtimeConfigInput() ?? '';
  const projectUses = footprintUses(projectSource);
  const layout = useRef<HTMLDivElement>(null);
  const catalogButton = useRef<HTMLButtonElement>(null);
  const inspectorButton = useRef<HTMLButtonElement>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const closeDrawer = () => {
    (catalogOpen ? catalogButton : inspectorButton).current?.focus();
    setCatalogOpen(false);
    setInspectorOpen(false);
  };
  useEffect(() => {
    if (!window.matchMedia(`(max-width: ${theme.studio.breakpoint})`).matches) {
      return;
    }
    const panel = catalogOpen
      ? 'Footprint library catalog'
      : inspectorOpen
        ? 'Footprint inspector'
        : '';
    layout.current
      ?.querySelector<HTMLElement>(`aside[aria-label="${panel}"] button`)
      ?.focus();
  }, [catalogOpen, inspectorOpen]);
  const [query, setQuery] = useState(initialQuery);
  const [assemblyId, setAssemblyId] = useState('mx');
  const [assemblyDraft, setAssemblyDraft] = useState<DesignSetup>(() => {
    const preset = ASSEMBLY_PRESETS[0];
    return {
      ...defaultSetup(),
      family: preset.family,
      mounting: preset.mounting,
      led: preset.led,
    };
  });
  const selectAssembly = (preset: (typeof ASSEMBLY_PRESETS)[number]) => {
    setAssemblyId(preset.id);
    setAssemblyDraft({
      ...defaultSetup(),
      family: preset.family,
      mounting: preset.mounting,
      led: preset.led,
      template: {
        ...defaultSetup().template,
        name: preset.label,
      },
    });
  };
  const [assemblyColors, setAssemblyColors] = useState({
    pcb: theme.studio.outline,
    switch: theme.studio.key,
    diode: theme.studio.component,
    led: theme.colors.accent,
  });
  const [draft, setDraft] = useState<LibraryEntry>();
  // Resolve attached defaults for display without changing the saved draft.
  const previews = useBundledPreviews(draft?.models || [], draft?.assets || {});
  const [info, setInfo] = useState<FootprintInfo>();
  const [parameters, setParameters] = useState<ParameterDefinitions>({});
  const params = draft?.parameters || {};
  const [parametersValid, setParametersValid] = useState(true);
  const [preparedRevision, setPreparedRevision] = useState('');
  const [yaml, setYaml] = useState('');
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<'model' | 'pads'>('model');
  const [view, setView] = useState<'2d' | '3d'>('3d');
  const [side, setSide] = useState<'F' | 'B'>('F');
  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>(
    'translate'
  );
  const [pad, setPad] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [importsOpen, setImportsOpen] = useState(true);
  const [batch, setBatch] = useState<Batch[]>([]);
  const [bundleFiles, setBundleFiles] = useState<ImportFile[]>([]);
  const [impact, setImpact] = useState<{
    placements: number;
    projects: number;
    unchecked: number;
  }>();
  const [busy, setBusy] = useState(false);
  const [modelBusy, setModelBusy] = useState<'busy' | 'idle'>('idle');
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const drafts = useRef(new Map<string, LibraryEntry>());
  const sourceDrafts = useRef(new Map<string, LibraryEntry>());
  const histories = useRef(new Map<string, LibraryEntry[]>());
  const history = useRef<LibraryEntry[]>([]);
  const operation = useRef<AbortController>();
  const current = useRef(draft);
  const previewFace = useRef<{ id: string; value: unknown }>();
  current.current = draft;
  useEffect(() => () => operation.current?.abort(), []);
  const edit = (next: LibraryEntry) => {
    if (draft) {
      history.current.push(draft);
      histories.current.set(draft.id, history.current);
    }
    drafts.current.set(next.id, next);
    setDraft(next);
    setStatus('Unsaved footprint draft');
  };
  const open = (entry: LibraryEntry) => {
    setImportsOpen(false);
    setCatalogOpen(false);
    setInspectorOpen(true);
    if (draft) {
      drafts.current.set(draft.id, draft);
    }
    setDraft(drafts.current.get(entry.id) || entry);
    if (draft?.id !== entry.id) {
      setInfo(undefined);
      setParameters({});
      setParametersValid(true);
    }
    setError('');
    history.current = histories.current.get(entry.id) || [];
    setStatus(history.current.length ? 'Unsaved footprint draft' : '');
    setActive(0);
  };
  // A catalogue item owns one draft, even after browsing another part.
  const openSource = (name: string, source: string, kind: string) => {
    const key = `${kind}:${name}`;
    const entry =
      sourceDrafts.current.get(key) || createEntry(name, source, 'ergogen');
    sourceDrafts.current.set(key, entry);
    open(entry);
  };
  const geometryRevision = JSON.stringify([
    draft?.id,
    draft?.module,
    draft?.mapping,
    draft?.origin.kind,
    draft?.origin.original,
    draft?.target,
    params,
  ]);
  useEffect(() => {
    const entry = current.current;
    if (!entry) {
      return;
    }
    const controller = new AbortController();
    setInspecting(true);
    setInfo(undefined);
    void prepareFootprint(
      { ...entry, modelMode: 'preserve' },
      controller.signal,
      params
    )
      .then((prepared) => {
        if (controller.signal.aborted) {
          return;
        }
        const face =
          params.side ?? prepared.parameters.side?.value ?? prepared.info.side;
        if (
          previewFace.current?.id !== entry.id ||
          previewFace.current.value !== face
        ) {
          previewFace.current = { id: entry.id, value: face };
          if (face === 'F' || face === 'B') setSide(face);
        }
        setInfo(prepared.info);
        setPreparedRevision(geometryRevision);
        setParameters(prepared.parameters);
        setYaml(prepared.yaml);
        setInspecting(false);
        setError('');
        setDraft((previous) =>
          previous?.id === entry.id
            ? {
                ...previous,
                module: prepared.module,
                mapping: prepared.mapping,
                models:
                  previous.modelMode === 'preserve'
                    ? prepared.info.models
                    : previous.models,
              }
            : previous
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(String(error));
          setInspecting(false);
        }
      });
    return () => controller.abort();
    // The serialized geometry revision intentionally excludes immediate model transforms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometryRevision]);
  const currentInfo =
    preparedRevision === geometryRevision && parametersValid ? info : undefined;
  const available = useMemo(
    () => [
      ...Object.entries(bundled).map(([name, source]) => ({
        name,
        source,
        kind: 'Bundled',
      })),
      ...(context?.injectionInput || [])
        .filter(
          (row) => row[0] === 'footprint' && !row[1].startsWith('library/')
        )
        .map((row) => ({ name: row[1], source: row[2], kind: 'Project' })),
    ],
    [context?.injectionInput]
  );
  const filtered = available.filter((entry) =>
    entry.name.toLowerCase().includes(query.toLowerCase())
  );
  const uses = draft
    ? linkedUses(
        (context?.configs || []).map((project) =>
          project.id === context?.activeConfigId
            ? { ...project, config: projectSource }
            : project
        ),
        draft.alias
      )
    : { projects: 0, declarations: 0 };
  const countRevision = JSON.stringify([
    (context?.configs || []).map((project) => ({
      config:
        project.id === context?.activeConfigId ? projectSource : project.config,
    })),
    draft?.alias,
  ]);
  useEffect(() => {
    const [projects, alias] = JSON.parse(countRevision);
    if (!alias) {
      return;
    }
    const controller = new AbortController();
    setImpact(undefined);
    void countUses(projects, alias, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) {
          setImpact(value);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [countRevision]);
  const importFiles = async (files: File[]) => {
    operation.current?.abort();
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true);
    setError('');
    try {
      const sources = await readFootprintFiles(files, controller.signal);
      controller.signal.throwIfAborted();
      setBundleFiles(sources);
      setImportsOpen(true);
      setBatch(
        sources
          .filter((source) => source.kind !== 'model')
          .map((source) => ({ ...source, checked: true }))
      );
      if (!sources.some((source) => source.kind !== 'model')) {
        setError('No .kicad_mod or Ergogen .js footprints found.');
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(String(error));
      }
    } finally {
      if (operation.current === controller) {
        setBusy(false);
      }
    }
  };
  const convertBatch = async () => {
    operation.current?.abort();
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true);
    for (const item of batch.filter((item) => item.checked)) {
      if (controller.signal.aborted) {
        break;
      }
      try {
        const entry = createEntry(
          item.name.replace(/\.(kicad_mod|js)$/i, ''),
          item.source,
          item.kind === 'kicad' ? 'kicad' : 'ergogen'
        );
        const prepared = await prepareFootprint(entry, controller.signal);
        const models = await prepareBundle(
          prepared.info.models,
          bundleFiles,
          controller.signal
        );
        const preparedDraft = {
          ...entry,
          module: prepared.module,
          resolved: prepared.resolved,
          mapping: prepared.mapping,
          ...models,
        };
        setBatch((previous) =>
          previous.map((row) =>
            row.name === item.name
              ? {
                  ...row,
                  status: 'Prepared · review and save',
                  draft: preparedDraft,
                }
              : row
          )
        );
        drafts.current.set(entry.id, preparedDraft);
      } catch (error) {
        if (!controller.signal.aborted) {
          setBatch((previous) =>
            previous.map((row) =>
              row.name === item.name ? { ...row, status: String(error) } : row
            )
          );
        }
      }
    }
    setBusy(false);
  };
  const save = async () => {
    if (!draft || !currentInfo || inspecting) {
      return;
    }
    operation.current?.abort();
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true);
    setError('');
    try {
      const prepared = await prepareFootprint(draft, controller.signal, params);
      controller.signal.throwIfAborted();
      await saveAssets(draft.assets);
      const projectUsesForEntry = projectUses.filter(
        (use) => use.what === draft.name
      );
      if (context && projectUsesForEntry.length) {
        const next = projectUsesForEntry.reduce(
          (currentSource, use) =>
            saveFootprintSettings(currentSource, use, params),
          projectSource
        );
        if (onSource) {
          onSource(next);
        } else {
          context.updateRealtimeConfigInput(next);
          context.setConfigInput(next);
        }
        setDraft((currentDraft) =>
          currentDraft
            ? {
                ...currentDraft,
                module: prepared.module,
                mapping: prepared.mapping,
              }
            : currentDraft
        );
        history.current = [];
        histories.current.delete(draft.id);
        setStatus('Saved settings to the current project.');
      } else {
        const saved = await saveFootprint({
          ...draft,
          module: prepared.module,
          resolved: prepared.resolved,
          mapping: prepared.mapping,
        });
        drafts.current.set(saved.id, saved);
        setDraft(saved);
        history.current = [];
        histories.current.delete(saved.id);
        const injection = entryInjection(saved);
        context?.setInjectionInput((previous) => [
          ...(previous || []).filter((row) => row[1] !== saved.alias),
          injection,
        ]);
        setStatus(
          `Saved revision ${saved.revision}. Linked projects use this revision.`
        );
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(String(error));
      }
    } finally {
      setBusy(false);
    }
  };
  const download = async () => {
    if (!draft || !currentInfo || inspecting) {
      return;
    }
    const controller = new AbortController();
    const prepared = await prepareFootprint(draft, controller.signal, params);
    const zip = new JSZip();
    zip.file(`footprints/${draft.alias}.js`, prepared.resolved);
    zip.file('usage.yaml', prepared.yaml);
    packageAssets(zip, draft.assets);
    const exported = { ...draft, resolved: prepared.resolved };
    packageLibrary(zip, [entryInjection(exported)], [exported]);
    saveAs(
      await zip.generateAsync({ type: 'blob' }),
      `${draft.name.replace(/[^A-Za-z0-9_-]/g, '_')}.zip`
    );
  };
  const changeModel = (model: ModelBinding) =>
    draft &&
    edit({
      ...draft,
      modelMode: 'replace',
      models: draft.models.map((previous, index) =>
        index === active ? model : previous
      ),
    });
  return (
    <Layout
      ref={layout}
      onKeyDown={(event) => {
        if (
          !(catalogOpen || inspectorOpen) ||
          !window.matchMedia(`(max-width: ${theme.studio.breakpoint})`).matches
        ) {
          return;
        }
        if (event.key === 'Escape') {
          event.stopPropagation();
          closeDrawer();
        }
        if (event.key !== 'Tab') {
          return;
        }
        const panel = catalogOpen
          ? 'Footprint library catalog'
          : 'Footprint inspector';
        const controls = Array.from(
          layout.current?.querySelectorAll<HTMLElement>(
            `aside[aria-label="${panel}"] button:not(:disabled), aside[aria-label="${panel}"] input:not(:disabled), aside[aria-label="${panel}"] select:not(:disabled), aside[aria-label="${panel}"] textarea, aside[aria-label="${panel}"] a[href]`
          ) || []
        ).filter((item) => item.getClientRects().length);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
        event.stopPropagation();
      }}
    >
      <Panel
        $drawer="catalog"
        $open={catalogOpen}
        aria-label="Footprint library catalog"
      >
        <MobileAction onClick={closeDrawer}>Close catalog</MobileAction>
        <h2>Footprint library</h2>
        <label>
          Search footprints
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <details>
          <summary>Import footprints</summary>
          <div className="import-actions">
            <button onClick={() => fileInput.current?.click()}>
              Import KiCad footprint
            </button>{' '}
            <button onClick={() => folderInput.current?.click()}>
              Import folder
            </button>
          </div>
        </details>
        <input
          hidden
          ref={fileInput}
          type="file"
          multiple
          accept=".kicad_mod,.js,.zip"
          aria-label="Import footprint files"
          onChange={(event) => {
            void importFiles(Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
        <input
          hidden
          ref={folderInput}
          type="file"
          multiple
          {...{ webkitdirectory: '' }}
          aria-label="Import .pretty folder"
          onChange={(event) => {
            void importFiles(Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
        {!!batch.length && (
          <details open={importsOpen}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setImportsOpen(!importsOpen);
              }}
            >
              Import selection ({batch.length})
            </summary>
            {batch.map((item) => (
              <div key={item.name}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(event) =>
                      setBatch((previous) =>
                        previous.map((row) =>
                          row.name === item.name
                            ? { ...row, checked: event.target.checked }
                            : row
                        )
                      )
                    }
                  />
                  {item.name}
                </label>
                <small>{item.status}</small>
                {item.draft && (
                  <button onClick={() => open(item.draft!)}>
                    Review {item.name}
                  </button>
                )}
              </div>
            ))}
            <button
              disabled={busy || !batch.some((item) => item.checked)}
              onClick={() => void convertBatch()}
            >
              Prepare selected
            </button>
          </details>
        )}
        <InspectorSection name="Key assemblies" defaultOpen>
          <AssemblyCard>
            <strong>Standard key assemblies</strong>
            <small>
              Pick a footprint family, then edit its placement and wiring in
              the pane.
            </small>
            <Catalog>
              {ASSEMBLY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  aria-pressed={assemblyId === preset.id}
                  onClick={() => selectAssembly(preset)}
                >
                  <span>
                    <span>{preset.label}</span>
                    <small>
                      {preset.family === 'mx' ? 'MX' : 'Choc'} ·{' '}
                      {preset.mounting === 'hotswap' ? 'hot-swap' : 'solder'}
                      {preset.led ? ' · RGB' : ''}
                    </small>
                  </span>
                </button>
              ))}
            </Catalog>
            <KeyAssemblyArt colors={assemblyColors} />
            <label>
              Part colors
              <span style={{ display: 'grid', gap: theme.spacing.xs }}>
                {(
                  [
                    ['pcb', 'PCB'],
                    ['switch', 'Switch'],
                    ['diode', 'Diode'],
                    ['led', 'LED'],
                  ] as const
                ).map(([part, label]) => (
                  <span
                    key={part}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 44px',
                      alignItems: 'center',
                    }}
                  >
                    <small>{label}</small>
                    <input
                      aria-label={`${label} color`}
                      type="color"
                      value={assemblyColors[part]}
                      onChange={(event) =>
                        setAssemblyColors((current) => ({
                          ...current,
                          [part]: event.target.value,
                        }))
                      }
                    />
                  </span>
                ))}
              </span>
            </label>
            {onAssembly && (
              <button data-primary="true" onClick={onAssembly}>
                Edit assembly in Design
              </button>
            )}
          </AssemblyCard>
        </InspectorSection>
        <InspectorSection name={`Your footprints (${entries.length})`} defaultOpen>
          <Catalog>
            {entries
              .filter((entry) =>
                entry.name.toLowerCase().includes(query.toLowerCase())
              )
              .map((entry) => (
                <button
                  key={entry.id}
                  title={entry.name}
                  aria-pressed={draft?.id === entry.id}
                  onClick={() => open(entry)}
                >
                  <span>
                    <span>{entry.name}</span>
                    <small>Custom · revision {entry.revision}</small>
                  </span>
                </button>
              ))}
          </Catalog>
        </InspectorSection>
        <InspectorSection
          name={`Bundled & project (${filtered.length})`}
          defaultOpen
        >
          <Catalog>
            {filtered.map((entry) => (
              <button
                key={`${entry.kind}:${entry.name}`}
                aria-label={`${entry.name} · ${entry.kind}`}
                title={entry.name}
                aria-pressed={
                  !!draft &&
                  draft.id ===
                    sourceDrafts.current.get(`${entry.kind}:${entry.name}`)?.id
                }
                onClick={() =>
                  openSource(entry.name, entry.source, entry.kind)
                }
              >
                <span>
                  <span>{entry.name.split('/').at(-1)}</span>
                  <small>
                    {entry.kind} ·{' '}
                    {entry.name.split('/').slice(0, -1).join('/') || 'Ergogen'}
                  </small>
                </span>
              </button>
            ))}
          </Catalog>
        </InspectorSection>
      </Panel>
      <Center>
        <Toolbar>
          <MobileAction
            ref={catalogButton}
            onClick={() => {
              setCatalogOpen(true);
              setInspectorOpen(false);
            }}
          >
            Catalog
          </MobileAction>
          <MobileAction
            ref={inspectorButton}
            onClick={() => {
              setInspectorOpen(true);
              setCatalogOpen(false);
            }}
          >
            Inspector
          </MobileAction>
          {(['3d', '2d'] as const).map((value) => (
            <button
              key={value}
              aria-pressed={view === value}
              onClick={() => setView(value)}
            >
              {value.toUpperCase()}
            </button>
          ))}
          {(['translate', 'rotate', 'scale'] as const).map((value) => (
            <button
              key={value}
              disabled={!draft?.models[active] || view === '2d'}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {value === 'translate'
                ? 'Move'
                : value === 'rotate'
                  ? 'Rotate'
                  : 'Scale'}
            </button>
          ))}
          <button
            aria-pressed={side === 'B'}
            onClick={() =>
              setSide((previous) => (previous === 'F' ? 'B' : 'F'))
            }
          >
            View {side === 'F' ? 'back' : 'front'}
          </button>
        </Toolbar>
        {draft ? (
          <FootprintCanvas
            info={currentInfo}
            models={
              draft.modelMode === 'preserve'
                ? currentInfo?.models || []
                : draft.models
            }
            assets={previews.assets}
            selected={active}
            onSelect={setActive}
            onChange={changeModel}
            mode={mode}
            view={view}
            pad={pad}
            onPad={(value) => {
              setPad(value);
              setTab('pads');
            }}
            side={side}
          />
        ) : (
          <LargePreview aria-label="Key assembly library preview">
            <h2>
              {ASSEMBLY_PRESETS.find((preset) => preset.id === assemblyId)
                ?.label || 'Key assembly'}
            </h2>
            <NewDesignWorkspace
              key={assemblyId}
              embedded
              mode="assembly"
              previewExpanded
              initial={assemblyDraft}
              onDraft={setAssemblyDraft}
              onCancel={() => {}}
              onCreate={(_source, assets) =>
                onAssemblyApply?.(assemblyDraft, assets)
              }
              applyLabel="Apply assembly"
            />
          </LargePreview>
        )}
        {currentInfo &&
          draft?.models.some((model) => modelPreview(model, previews.assets)) &&
          view === '3d' && (
            <Inset aria-label="Magnified model alignment">
              <FootprintCanvas
                info={info}
                models={draft.models.filter((_, index) => index === active)}
                assets={previews.assets}
                selected={0}
                onSelect={() => {}}
                side={side}
              />
            </Inset>
          )}
      </Center>
      <Panel
        $drawer="inspector"
        $open={inspectorOpen}
        aria-label="Footprint inspector"
      >
        {!draft && (
          <MobileAction onClick={closeDrawer}>Close inspector</MobileAction>
        )}
        {draft && (
          <>
            <EditorHeader>
              <MobileAction onClick={closeDrawer}>Close inspector</MobileAction>
              <h2>{draft.name}</h2>
              <p>
                {history.current.length || !draft.revision
                  ? 'Unsaved changes'
                  : `Library footprint · revision ${draft.revision}`}
              </p>
              <div className="save-actions">
                <button
                  data-primary="true"
                  onClick={() => void save()}
                  disabled={
                    busy ||
                    modelBusy === 'busy' ||
                    inspecting ||
                    !currentInfo ||
                    !info ||
                    (info.targets.length > 1 &&
                      draft.modelMode === 'replace' &&
                      !draft.target)
                  }
                >
                  Save footprint
                </button>
                <button
                  aria-label="Undo footprint edit"
                  disabled={!history.current.length}
                  onClick={() => {
                    const previous = history.current.pop();
                    if (previous) {
                      drafts.current.set(previous.id, previous);
                      setDraft(previous);
                    }
                  }}
                >
                  <Undo2 size={16} /> Undo
                </button>
              </div>
            </EditorHeader>
            <FootprintParameters
              key={`settings-${draft.id}`}
              definitions={parameters}
              values={params}
              onValidity={setParametersValid}
              onChange={(key, value) =>
                edit({ ...draft, parameters: { ...params, [key]: value } })
              }
            />
            <Toolbar>
              <button
                aria-pressed={tab === 'model'}
                onClick={() => {
                  setTab('model');
                  setView('3d');
                }}
              >
                3D models
              </button>
              <button
                aria-pressed={tab === 'pads'}
                onClick={() => {
                  setTab('pads');
                  setView('2d');
                }}
              >
                Pads & nets
              </button>
            </Toolbar>
            {info && info.targets.length > 1 && (
              <label>
                Emitted footprint target
                <select
                  value={JSON.stringify(draft.target || {})}
                  onChange={(event) =>
                    edit({ ...draft, target: JSON.parse(event.target.value) })
                  }
                >
                  <option value="{}">Choose one footprint</option>
                  {info.targets.map((target, index) => (
                    <option
                      key={index}
                      value={JSON.stringify({
                        name: target.name,
                        index: target.index,
                        count: target.count,
                      })}
                    >
                      {target.reference || target.name || index}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {tab === 'model' ? (
              <ModelEditor
                key={draft.id}
                onBusy={setModelBusy}
                models={draft.models}
                assets={draft.assets}
                previewAssets={previews.assets}
                selected={active}
                onSelect={setActive}
                onChange={(models, assets) =>
                  edit({ ...draft, models, assets, modelMode: 'replace' })
                }
              />
            ) : (
              <>
                <p>
                  {info?.pads.length || 0} pads · duplicate numbers share a net.
                  Mechanical pads remain separate.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Pad</th>
                      <th>Net parameter</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info?.nets.map((net) => (
                      <tr key={net.mappingKey ?? net.number}>
                        <td>
                          <button
                            aria-pressed={pad === net.number}
                            onClick={() => setPad(net.number)}
                          >
                            {net.number || `Unnumbered ${net.pads[0] + 1}`}
                          </button>
                        </td>
                        <td>
                          {draft.origin.kind === 'kicad' ? (
                            <input
                              aria-label={`Pad ${net.number || `unnumbered ${net.pads[0] + 1}`} net parameter`}
                              value={
                                draft.mapping[net.mappingKey ?? net.number] ||
                                net.parameter
                              }
                              onChange={(event) =>
                                edit({
                                  ...draft,
                                  mapping: {
                                    ...draft.mapping,
                                    [net.mappingKey ?? net.number]:
                                      event.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            <span>Defined by body(p)</span>
                          )}
                        </td>
                        <td>{net.pads.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>
                  {info?.pads.filter((p) => p.mechanical).length || 0}{' '}
                  mechanical pads · no net assignment
                </p>
              </>
            )}
            {info?.pads.some(
              (pad) =>
                !['rect', 'roundrect', 'circle', 'oval'].includes(pad.shape)
            ) && (
              <p role="status">
                Custom and trapezoid pad outlines have a simplified preview. The
                exported footprint retains their original geometry.
              </p>
            )}
            {info?.diagnostics.map((finding, index) => (
              <p
                key={index}
                role={finding.severity === 'error' ? 'alert' : 'status'}
              >
                {finding.message}
              </p>
            ))}

            <details>
              <summary>Source & export</summary>
              <label>
                Library name
                <input
                  value={draft.name}
                  onChange={(event) =>
                    edit({ ...draft, name: event.target.value })
                  }
                />
              </label>
              <label>
                Ergogen module
                <textarea
                  aria-label="Footprint module source"
                  rows={10}
                  value={draft.module}
                  readOnly={draft.origin.kind === 'kicad'}
                  onChange={(event) =>
                    edit({ ...draft, module: event.target.value })
                  }
                />
              </label>
              <pre>{yaml}</pre>
              <button
                disabled={busy || inspecting || !currentInfo}
                onClick={() =>
                  void download().catch((error) => setError(String(error)))
                }
              >
                Export footprint ZIP
              </button>
            </details>
            <p>
              {impact
                ? `${impact.placements} linked placements · ${impact.projects} projects${impact.unchecked ? ` · ${impact.unchecked} project counts unavailable` : ''}`
                : `${uses.declarations} linked declarations · ${uses.projects} projects · counting placements…`}
            </p>
            {draft.revision > 0 && (
              <>
                <fieldset>
                  <legend>Link to this project</legend>
                  <label>
                    Footprint declaration
                    <select
                      value={linkIndex}
                      onChange={(event) => setLinkIndex(event.target.value)}
                    >
                      <option value="">Choose a declaration</option>
                      {projectUses.map((use, index) => (
                        <option key={use.path.join('.')} value={index}>
                          {use.path.slice(1, -1).join(' / ')} · {use.what}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>
                    Only this declaration changes. Its net parameters and
                    instance overrides are retained.
                  </p>
                  <button
                    disabled={linkIndex === ''}
                    onClick={() => {
                      const use = projectUses[Number(linkIndex)];
                      if (!use || !context) {
                        return;
                      }
                      try {
                        const next = linkFootprint(
                          projectSource,
                          use,
                          draft.alias
                        );
                        if (onSource) {
                          onSource(next);
                        } else {
                          context.updateRealtimeConfigInput(next);
                          context.setConfigInput(next);
                        }
                        setStatus(
                          'Linked. Preview in case to inspect the updated footprint.'
                        );
                      } catch (error) {
                        setError(String(error));
                      }
                    }}
                  >
                    Link selected declaration
                  </button>
                </fieldset>
                <button onClick={onPreview}>Preview in case</button>
              </>
            )}
          </>
        )}
        {(status || busy || inspecting) && (
          <p role="status">
            {inspecting
              ? 'Inspecting footprint…'
              : status || 'Preparing import…'}
          </p>
        )}
        {busy && (
          <button
            onClick={() => {
              operation.current?.abort();
              setBusy(false);
            }}
          >
            Cancel import
          </button>
        )}
        {(error || storageError || previews.error) && (
          <p role="alert">{error || storageError || previews.error}</p>
        )}
      </Panel>
    </Layout>
  );
}

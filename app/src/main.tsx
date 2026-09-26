import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { defaultOutlineSettings, emptyProject } from '@boardstudio/v2-contracts';
import type { CaseAssemblyIR, CaseResult, CoreReply, CoreRequest, EditCommand, FootprintCompileJob, Matrix, MechanicalAssembly, MechanicalBuiltinProfile, MechanicalExtraction, MechanicalPurposeMapping, MechanicalPartProfile, Part, PartDefinition, ProjectDoc, SceneDelta } from '@boardstudio/v2-contracts';
import type { MatrixScene } from './ui/matrixGeometry';
import { builtinDefinitions } from '@boardstudio/v2-kicad';
import { catalogue as ergogenCatalogue, isErgogen, modelBindings, normalizeDefinition } from '@boardstudio/v2-ergogen';
import type { StepModel } from '@boardstudio/v2-cad';
import { CoreClient } from './CoreClient';
import { CaseClient } from './CaseClient';
import type { CasePreviewResult } from '@boardstudio/v2-cad';
import type { GenerationState } from './generationState';
import { casePreviewContextMatches } from './casePreviewContext';
import type { CasePreviewContext, ContextualCaseResult } from './casePreviewContext';
import { prepareCase } from './prepareCase';
import { resolveMechanical } from './resolveMechanical';
import { exportMechanicalAssembly } from './exportMechanicalAssembly';
import { ExportClient } from './ExportClient';
import { normalizeMechanicalConfiguration } from './mechanicalPresets';
import { demoProject } from './demo';
import { activeProjectId, loadAsset, loadProject, packProject, saveAsset, saveProject, unpackProject } from './storage';
import { bundledModelBytes, bundledModel } from './bundledModels';
import { Workbench, matrixWithPreset } from './ui/Workbench';
import type { ComponentPreview } from './ui/CasePreview';
import type { LibraryModelStatus } from './ui/LibraryWorkspace';

const STARTER_ID = 'starter';
const ERGOGEN_DEFINITIONS = ergogenCatalogue();

const EMPTY_SCENE: SceneDelta = {
  revision: 0,
  transactionId: 'initial',
  changedIds: [],
  transforms: [],
  matrixScenes: [],
  contours: [],
  boardContours: [],
  boardReadiness: [],
  findings: [],
  readiness: { layout: false, outline: false, pcb: false, case: false },
};

function download(name: string, bytes: string | Uint8Array, type: string): void {
  const content = typeof bytes === 'string' ? bytes : new Uint8Array(bytes);
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = name;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function caseAssembly(document: ProjectDoc, scene: SceneDelta, boardId: string): CaseAssemblyIR {
  return {
    revision: scene.revision,
    bodies: document.caseBodies.filter((body) => body.boardId === boardId).map((body) => ({
      revision: scene.revision,
      body,
      contours: scene.boardContours.find((entry) => entry.boardId === body.boardId)?.contours ?? [],
    })),
  };
}

function bindings(definition: PartDefinition, part?: Part): NonNullable<PartDefinition['models']> {
  let generated: NonNullable<PartDefinition['models']> = [];
  if (isErgogen(definition.generator?.source)) {
    try {
      generated = modelBindings(definition, part);
    } catch (cause) {
      generated = [{ assetId: `invalid-generator-model:${encodeURIComponent(String(cause))}`, offset: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }];
    }
  }
  return [
    ...(definition.model ? [definition.model] : []),
    ...(definition.models ?? []),
    ...generated,
  ];
}

async function modelFiles(document: ProjectDoc, definitions: PartDefinition[], parts: Part[] = []): Promise<{ paths: Map<string, string>; files: Record<string, Uint8Array> }> {
  const paths = new Map<string, string>();
  const files: Record<string, Uint8Array> = {};

  const modelIds = definitions.flatMap((definition) => {
    const instances = parts.filter((part) => part.definitionId === definition.id);
    return (instances.length ? instances : [undefined]).flatMap((part) => bindings(definition, part).map((model) => model.assetId));
  });

  for (const id of new Set(modelIds)) {
    const asset = document.assets.find((item) => item.id === id);
    const bundled = !asset ? bundledModel(id) : undefined;
    const name = asset?.name ?? bundled?.filename;
    const extension = name?.match(/\.(step|stp|stl|wrl)$/i)?.[1]?.toLowerCase();

    if (!asset || !extension) {
      if (!bundled || !extension) throw new Error(`Model asset ${id} needs a STEP, STP, or WRL filename`);
    }

    const bytes = asset ? await loadAsset(asset.sha256) : await bundledModelBytes(id);

    if (!bytes) {
      throw new Error(`Model asset ${name ?? id} is missing`);
    }

    const digest = asset?.sha256 ?? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes))),
      (byte) => byte.toString(16).padStart(2, '0')).join('');
    const path = `models/${digest}.${extension}`;

    paths.set(id, path);
    files[path] = bytes;
  }

  return { paths, files };
}

function App() {
  const [project, setProject] = useState<ProjectDoc>(demoProject);
  const [selectedBoardId, setSelectedBoardId] = useState('main-board');
  const [scene, setScene] = useState<SceneDelta>(EMPTY_SCENE);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [casePreview, setCasePreview] = useState<ContextualCaseResult<CasePreviewResult> | undefined>();
  const [mechanicalAssembly, setMechanicalAssembly] = useState<ContextualCaseResult<MechanicalAssembly> | undefined>();
  const [generation, setGeneration] = useState<GenerationState>({ status: 'required' });
  const generationSeq = useRef(0);
  const generationRunning = useRef(false);
  const [modelErrors, setModelErrors] = useState<Record<string, string>>({});
  const [modelMeshes, setModelMeshes] = useState<Record<string, StepModel>>({});
  const [libraryDefinitionId, setLibraryDefinitionId] = useState('');
  const [embedUsedModels, setEmbedUsedModels] = useState(true);
  const [activeMode, setActiveMode] = useState<'Design' | 'PCB' | 'Case' | 'Library' | 'Export'>('Design');
  const client = useRef<CoreClient | null>(null);
  const caseClient = useRef<CaseClient | null>(null);
  const exportClient = useRef<ExportClient | null>(null);
  const caseSeq = useRef(0);
  const modelEpoch = useRef(0);
  const modelCache = useRef(new Map<string, Promise<StepModel>>());
  const [projectSession, setProjectSession] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'failed'>('saving');
  const projectRef = useRef(project);
  const committedScene = useRef(scene);
  const previewContext: CasePreviewContext = {
    documentId: project.id, boardId: selectedBoardId, revision: project.revision,
    scene, committedScene: committedScene.current,
  };
  const currentPreviewContext = useRef(previewContext);
  currentPreviewContext.current = previewContext;
  const visibleCasePreview = casePreview?.context.documentId === project.id && casePreview.context.boardId === selectedBoardId ? casePreview.result : undefined;
  const visibleMechanicalAssembly = mechanicalAssembly?.context.documentId === project.id && mechanicalAssembly.context.boardId === selectedBoardId ? mechanicalAssembly.result : undefined;
  const queue = useRef<Promise<void>>(Promise.resolve());

  function ensureExportClient(): ExportClient {
    exportClient.current ??= new ExportClient();
    return exportClient.current;
  }

  async function accept(reply: CoreReply, mode: 'open' | 'commit' | 'preview'): Promise<void> {
    if (reply.kind === 'case-prepared' || reply.kind === 'mechanical-resolved' || reply.kind === 'mechanical-profile') return;
    if (reply.kind === 'matrix-projections') return;
    if (reply.kind === 'error') {
      throw new Error(reply.message);
    }

    if (mode !== 'open' && reply.scene.revision < projectRef.current.revision) {
      return;
    }

    if (reply.kind === 'preview') {
      setScene(reply.scene);
      return;
    }

    if (mode === 'open') {
      modelEpoch.current += 1;
      modelCache.current.clear();
      setModelMeshes({});
      setLibraryDefinitionId('');
    }

    setSaveStatus('saving');
    try {
      await saveProject(reply.document);
      setSaveStatus('saved');
    } catch (cause) {
      setSaveStatus('failed');
      throw cause;
    }
    if (mode === 'open') setProjectSession((value) => value + 1);
    projectRef.current = reply.document;
    setProject(reply.document);
    setScene(reply.scene);
    setSelectedBoardId((current) => reply.document.boards.some((board) => board.id === current)
      ? current
      : reply.document.boards[0]?.id ?? '');

    committedScene.current = reply.scene;
  }

  function schedule(work: () => Promise<void>): void {
    queue.current = queue.current.then(work).catch((cause) => setError(String(cause)));
  }

  useEffect(() => {
    const core = new CoreClient();

    client.current = core;
    schedule(async () => {
      const saved = await loadProject(activeProjectId(STARTER_ID));
      const loaded = saved ?? demoProject();
      const document = { ...loaded, definitions: loaded.definitions.map((definition) => normalizeDefinition(definition)) };
      if (document.mechanical) {
        document.mechanical = normalizeMechanicalConfiguration(document, document.mechanical);
      }
      const reply = await core.request({ id: crypto.randomUUID(), kind: 'open', document });

      await accept(reply, 'open');
      setReady(true);
    });

    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('./sw.js').catch((cause) => setError(String(cause)));
    }

    return () => {
      core.close();
      caseClient.current?.close();
      exportClient.current?.close();
    };
  }, []);

  useEffect(() => {
    generationSeq.current += 1;
    if (generationRunning.current) { caseClient.current?.cancel(); generationRunning.current = false; }
    setGeneration(casePreview?.context.documentId === project.id && casePreview.context.boardId === selectedBoardId && casePreview.result.revision === project.revision
      ? { status: 'ready', revision: project.revision } : { status: 'required' });
  }, [project, scene, selectedBoardId]);

  useEffect(() => {
    const sequence = ++caseSeq.current;
    const context = currentPreviewContext.current;
    const isCurrent = () => sequence === caseSeq.current && casePreviewContextMatches(context, {
      ...currentPreviewContext.current, committedScene: committedScene.current,
    });
    if (activeMode !== 'Case') {
      return;
    }

    const boardReady = scene.boardReadiness.find((entry) => entry.boardId === selectedBoardId);

    if (scene !== committedScene.current) {
      return;
    }

    const generated = project.mechanical?.boardId === selectedBoardId;
    if (!ready || !(generated ? boardReady?.outline : boardReady?.case)) {
      setMechanicalAssembly(undefined);
      setCasePreview(undefined);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (generated) {
          const contours = scene.boardContours.find((entry) => entry.boardId === selectedBoardId)?.contours ?? [];
          const assembly = await resolveMechanical(client.current!, project, contours, isCurrent);
          if (!assembly) return;
          setMechanicalAssembly({ context, result: assembly });
          if (assembly.generationBlocked) {
            setGeneration({ status: 'blocked' });
            return;
          }
        } else {
          setMechanicalAssembly(undefined);
        }
      } catch (cause) {
        if (isCurrent()) {
          setError(String(cause));
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (sequence === caseSeq.current) caseSeq.current += 1;
    };
  }, [activeMode, ready, project, scene, selectedBoardId]);

  function cancelGeneration(): void {
    generationSeq.current += 1;
    generationRunning.current = false;
    caseClient.current?.cancel();
    setGeneration({ status: 'cancelled' });
  }

  async function generateCase(): Promise<void> {
    if (generationRunning.current) return;
    const context = currentPreviewContext.current;
    const document = projectRef.current;
    const sequence = ++generationSeq.current;
    const isCurrent = () => sequence === generationSeq.current && casePreviewContextMatches(context, currentPreviewContext.current);
    generationRunning.current = true;
    setGeneration({ status: 'preparing', revision: document.revision });
    try {
      // Allow the progress state to paint before scheduling preparation.
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
      let ir = caseAssembly(document, context.scene, context.boardId);
      if (document.mechanical?.boardId === context.boardId) {
        const contours = context.scene.boardContours.find(entry => entry.boardId === context.boardId)?.contours ?? [];
        const assembly = await resolveMechanical(client.current!, document, contours, isCurrent);
        if (!assembly || !isCurrent()) return;
        setMechanicalAssembly({ context, result: assembly });
        if (assembly.generationBlocked) { setGeneration({ status: 'blocked' }); return; }
        ir = assembly.case;
      }
      const prepared = await prepareCase(client.current!, ir);
      if (!isCurrent()) return;
      caseClient.current ??= new CaseClient();
      const started = performance.now();
      const result = await caseClient.current.preview(prepared, progress => {
        if (isCurrent()) setGeneration({ status: 'running', revision: document.revision, progress });
      });
      if (!isCurrent()) return;
      performance.measure('boardstudio.cad.preview', { start: started, end: performance.now() });
      setCasePreview({ context, result });
      setGeneration({ status: 'ready', revision: result.revision });
    } catch (cause) {
      if (isCurrent()) setGeneration({ status: 'failed', message: String(cause) });
    } finally {
      if (sequence === generationSeq.current) generationRunning.current = false;
    }
  }

  const requestModels = useCallback((definitionIds: string[], instances: Part[] = []) => {
    const document = projectRef.current;
    const definitions = new Map([...ERGOGEN_DEFINITIONS, ...document.definitions].map((item) => [item.id, item]));
    const assets = new Map(document.assets.map((item) => [item.id, item]));

    for (const id of definitionIds) {
      const definition = definitions.get(id);
      const used = instances.filter((part) => part.definitionId === id);
      const modelIds = definition ? (used.length ? used : [undefined]).flatMap((part) => bindings(definition, part).map((model) => model.assetId)) : [];

      for (const modelId of modelIds) {
        const asset = assets.get(modelId);
        const bundled = !asset ? bundledModel(modelId) : undefined;

        if ((!asset && !bundled) || (!/\.(step|stp)$/i.test(asset?.name ?? bundled?.filename ?? ''))
          || modelCache.current.has(asset?.sha256 ?? modelId)) {
          continue;
        }

        const cacheKey = asset?.sha256 ?? modelId;
        setModelErrors((current) => { const next = { ...current }; delete next[cacheKey]; return next; });
        const task = (asset ? loadAsset(asset.sha256) : bundledModelBytes(modelId)).then(async (bytes) => {
        if (!bytes) {
          throw new Error(`Model asset ${asset?.name ?? bundled?.filename ?? modelId} is missing`);
        }

        caseClient.current ??= new CaseClient();
        return caseClient.current.requestModel(bytes);
      });

        const epoch = modelEpoch.current;
        modelCache.current.set(cacheKey, task);
        void task.then((mesh) => {
        if (epoch !== modelEpoch.current) {
          return;
        }

        setModelMeshes((current) => ({ ...current, [cacheKey]: mesh }));
        }).catch((cause) => {
        if (epoch !== modelEpoch.current) {
          return;
        }

        modelCache.current.delete(cacheKey);
        setModelErrors((current) => ({ ...current, [cacheKey]: String(cause) }));
        if (instances.length) setError(String(cause));
        });
      }
    }
  }, []);

  const requestCaseModels = useCallback((boardId: string) => {
    const document = projectRef.current;
    const board = document.boards.find((item) => item.id === boardId);

    if (!board) {
      return;
    }

    const parts = new Map(document.parts.map((item) => [item.id, item]));
    const instances = board.partIds.map((id) => parts.get(id)).filter((part): part is Part => Boolean(part));
    requestModels([...new Set(instances.map((part) => part.definitionId))], instances);
  }, [requestModels]);

  const selectLibraryModel = useCallback((definitionId: string) => {
    setLibraryDefinitionId((current) => current === definitionId ? current : definitionId);
    requestModels([definitionId]);
  }, [requestModels]);

  const componentPreviews = useMemo<ComponentPreview[]>(() => {
    if (activeMode !== 'Case') {
      return [];
    }

    const board = project.boards.find((item) => item.id === selectedBoardId);

    if (!board) {
      return [];
    }

    const definitions = new Map([...ERGOGEN_DEFINITIONS, ...project.definitions].map((item) => [item.id, item]));
    const parts = new Map(project.parts.map((item) => [item.id, item]));
    const poses = new Map(scene.transforms.map((item) => [item.id, item.pose]));
    const assets = new Map(project.assets.map((item) => [item.id, item]));

    return board.partIds.flatMap((id) => {
      const part = parts.get(id);
      const definition = part && definitions.get(part.definitionId);
      if (!part || !definition) return [];
      return bindings(definition, part).flatMap((model, index) => {
        const asset = assets.get(model.assetId);
        const mesh = modelMeshes[asset?.sha256 ?? model.assetId]?.mesh;
        return mesh ? [{ id: `${id}:${index}`, reference: part.reference, pose: poses.get(id) ?? part.pose, side: part.side, model, mesh }] : [];
      });
    });
  }, [activeMode, project.boards, project.definitions, project.parts, project.assets, selectedBoardId, scene.transforms, modelMeshes]);

  const libraryModelPreviews = useMemo<ComponentPreview[]>(() => {
    const definition = project.definitions.find((item) => item.id === libraryDefinitionId) ?? ERGOGEN_DEFINITIONS.find((item) => item.id === libraryDefinitionId);
    if (!definition) return [];
    return bindings(definition).flatMap((model, index) => {
      const asset = project.assets.find((item) => item.id === model.assetId);
      const mesh = modelMeshes[asset?.sha256 ?? model.assetId]?.mesh;
      return mesh ? [{ id: `${definition.id}:${index}`, reference: definition.name, pose: { at: { x: 0, y: 0 }, rotation: 0 }, side: 'front' as const, model, mesh }] : [];
    });
  }, [project.definitions, project.assets, libraryDefinitionId, modelMeshes]);

  const libraryModelStatus = useMemo<LibraryModelStatus>(() => {
    const definition = project.definitions.find((item) => item.id === libraryDefinitionId) ?? ERGOGEN_DEFINITIONS.find((item) => item.id === libraryDefinitionId);
    const result = (state: LibraryModelStatus['state'], message?: string): LibraryModelStatus => ({ definitionId: libraryDefinitionId, state, message });
    const models = definition ? bindings(definition) : [];
    if (!models.length) return result('empty');
    const resolved = models.map((model) => {
      const asset = project.assets.find((item) => item.id === model.assetId);
      const bundled = bundledModel(model.assetId);
      return { key: asset?.sha256 ?? model.assetId, name: asset?.name ?? bundled?.filename };
    });
    if (resolved.some((model) => !model.name)) return result('error', 'The attached model file is missing. Attach it again in the inspector.');
    const supported = resolved.filter((model) => /\.(step|stp)$/i.test(model.name!));
    if (!supported.length) return result('unsupported');
    const failed = supported.find((model) => modelErrors[model.key]);
    if (failed) return result('error', `Could not load ${failed.name}. Check the file or retry.`);
    return result(supported.every((model) => modelMeshes[model.key]) ? 'ready' : 'loading');
  }, [project.definitions, project.assets, libraryDefinitionId, modelMeshes, modelErrors]);

  function edit(command: EditCommand): void {
    schedule(async () => {
      if (!client.current) {
        return;
      }

      const current = projectRef.current;
      const baseRevision = command.operation.kind === 'replace-document'
        ? command.baseRevision
        : current.revision;
      const request: CoreRequest = {
        id: crypto.randomUUID(),
        kind: 'edit',
        command: { ...command, baseRevision },
      };
      const reply = await client.current.request(request);

      await accept(reply, command.phase);
    });
  }

  function history(kind: 'undo' | 'redo'): void {
    schedule(async () => {
      if (!client.current) {
        return;
      }

      const reply = await client.current.request({ id: crypto.randomUUID(), kind });

      await accept(reply, 'commit');
    });
  }

  function importProject(file: File): void {
    schedule(async () => {
      if (!client.current) {
        return;
      }

      const document = await unpackProject(new Uint8Array(await file.arrayBuffer()), ensureExportClient());
      const reply = await client.current.request({ id: crypto.randomUUID(), kind: 'open', document });

      await accept(reply, 'open');
    });
  }

  function newProject(): void {
    schedule(async () => {
      if (!client.current) {
        return;
      }

      const document = emptyProject(crypto.randomUUID(), 'Untitled keyboard');
      const boardId = crypto.randomUUID();
      const outlineId = crypto.randomUUID();

      document.definitions = builtinDefinitions();
      document.outline = [{ id: outlineId, kind: 'part-envelope', settings: defaultOutlineSettings, partIds: [], margin: 4, operation: 'add' }];
      document.boards = [{ id: boardId, name: 'Main board', outlineIds: [outlineId], partIds: [], netIds: [], thickness: 1.6 }];
      document.materials = [{ id: 'pla', name: 'PLA', thickness: 3 }];

      const reply = await client.current.request({ id: crypto.randomUUID(), kind: 'open', document });

      await accept(reply, 'open');
    });
  }

  function duplicateDesign(matrixId: string, presetId: Parameters<typeof matrixWithPreset>[1]): void {
    schedule(async () => {
      if (!client.current) {
        return;
      }

      const original = projectRef.current;
      const matrix = original.matrices.find((item) => item.id === matrixId);

      if (!matrix) {
        throw new Error('Select a matrix to duplicate the design');
      }

      const variant = matrixWithPreset(matrix, presetId);
      const document: ProjectDoc = {
        ...structuredClone(original),
        id: crypto.randomUUID(),
        name: `${original.name} — ${presetId}`,
      };

      const opened = await client.current.request({ id: crypto.randomUUID(), kind: 'open', document });

      if (opened.kind !== 'scene') {
        throw new Error(opened.kind === 'error' ? opened.message : 'Expected project snapshot');
      }

      const changed = await client.current.request({
        id: crypto.randomUUID(),
        kind: 'edit',
        command: {
          baseRevision: opened.document.revision,
          transactionId: crypto.randomUUID(),
          phase: 'commit',
          targetIds: [matrixId],
          operation: { kind: 'set-matrix', matrix: variant.matrix, definitions: variant.definitions },
        },
      });

      if (changed.kind !== 'scene') {
        await client.current.request({ id: crypto.randomUUID(), kind: 'open', document: original });
        throw new Error(changed.kind === 'error' ? changed.message : 'Expected variant snapshot');
      }

      await accept(changed, 'open');
    });
  }

  function importPart(file: File): void {
    schedule(async () => {
      if (!file.name.endsWith('.kicad_mod')) {
        throw new Error('Select a .kicad_mod footprint');
      }

      exportClient.current ??= new ExportClient();
      const imported = await exportClient.current.artifact({ kind: 'import-footprint', definitionId: crypto.randomUUID(), source: await file.text() });
      if (imported.kind !== 'import-footprint') throw new Error('Expected Rust footprint import');
      const definition = { ...imported.result.definition, pads: imported.result.geometry.pads, courtyard: imported.result.geometry.courtyard };
      const current = projectRef.current;
      const document: ProjectDoc = {
        ...current,
        definitions: [...current.definitions, definition],
      };

      if (!client.current) {
        return;
      }

      const reply = await client.current.request({
        id: crypto.randomUUID(),
        kind: 'edit',
        command: {
          baseRevision: current.revision,
          transactionId: crypto.randomUUID(),
          phase: 'commit',
          targetIds: [definition.id],
          operation: { kind: 'replace-document', document },
        },
      });

      await accept(reply, 'commit');
    });
  }

  function importModel(file: File, definitionId: string, parameter?: string): void {
    schedule(async () => {
      const extension = file.name.match(/\.(step|stp|stl|wrl)$/i)?.[1]?.toLowerCase();

      if (!extension) {
        throw new Error('Select a STEP, STL, or WRL model');
      }

      const current = projectRef.current;
      const definition = current.definitions.find((item) => item.id === definitionId)
        ?? ERGOGEN_DEFINITIONS.find((item) => item.id === definitionId);

      if (!definition) {
        throw new Error('Part definition is missing');
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
      const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
      const assetId = crypto.randomUUID();
      const asset = {
        id: assetId,
        name: file.name,
        mediaType: extension === 'wrl' ? 'model/vrml' : extension === 'stl' ? 'model/stl' : 'model/step',
        sha256,
        source: 'local file',
      };
      const updatedDefinition = parameter && definition.generator ? {
        ...definition,
        generator: { ...definition.generator, parameters: { ...definition.generator.parameters, [parameter]: `boardstudio-asset:${assetId}` } },
      } : {
        ...definition,
        model: { assetId, offset: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      };
      const nextDefinitions = current.definitions.some((item) => item.id === definitionId)
        ? current.definitions.map((item) => item.id === definitionId ? updatedDefinition : item)
        : [...current.definitions, updatedDefinition];
      const document: ProjectDoc = {
        ...current,
        assets: [...current.assets, asset],
        definitions: nextDefinitions,
      };

      await saveAsset(sha256, bytes);

      if (!client.current) {
        return;
      }

      const reply = await client.current.request({
        id: crypto.randomUUID(),
        kind: 'edit',
        command: {
          baseRevision: current.revision,
          transactionId: crypto.randomUUID(),
          phase: 'commit',
          targetIds: [definitionId, assetId],
          operation: { kind: 'replace-document', document },
        },
      });

      await accept(reply, 'commit');
    });
  }

  function exportFile(kind: 'project' | 'kicad' | 'footprints' | 'case-step' | 'svg' | 'dxf', boardId?: string): void {
    schedule(async () => {
      const document = projectRef.current;
      const resolved = committedScene.current;

      if (resolved.revision !== document.revision) {
        throw new Error('The committed scene is still resolving');
      }

      if (kind === 'project') {
        const bytes = await packProject(document, { embedUsedModels }, ensureExportClient());
        download(`${document.name}.boardstudio`, bytes, 'application/zip');
        return;
      }

      if (kind === 'footprints') {
        const { paths, files } = await modelFiles(document, document.definitions);
        exportClient.current ??= new ExportClient();
        const result = await exportClient.current.request({ kind: 'footprints', document, paths: [...paths], files });
        download(result.filename, result.bytes, result.mediaType);
        return;
      }

      const board = document.boards.find((item) => item.id === (boardId ?? selectedBoardId));

      if (!board) {
        throw new Error('Select a board before export');
      }

      const boardReady = resolved.boardReadiness.find((item) => item.boardId === board.id);

      if (kind === 'svg' || kind === 'dxf') {
        if (!boardReady?.outline) {
          throw new Error('Resolve outline findings before export');
        }

        const contours = resolved.boardContours.find((entry) => entry.boardId === board.id)?.contours ?? [];
        exportClient.current ??= new ExportClient();
        const result = await exportClient.current.request({ kind: 'outline', document, boardId: board.id, contours, outlineFormat: kind, paths: [], files: {} });
        download(result.filename, result.bytes, result.mediaType);
        return;
      }

      if (kind === 'case-step') {
        if (!boardReady?.case) {
          throw new Error('Resolve case findings before export');
        }

        caseClient.current ??= new CaseClient();
        const prepared = await prepareCase(client.current!, caseAssembly(document, resolved, board.id));
        const result = await caseClient.current.request(prepared);
        const boardSuffix = document.boards.length === 1 ? '' : `-${board.name.replace(/[^a-zA-Z0-9_.-]+/g, '_')}`;

        download(`${document.name}${boardSuffix}-case.step`, result.step, 'model/step');
        return;
      }

      if (!boardReady?.pcb) {
        throw new Error('Resolve PCB findings before export');
      }

      const usedDefinitions = document.definitions
        .filter((definition) => board.partIds.some((id) => document.parts.find((part) => part.id === id)?.definitionId === definition.id))
      const usedParts = board.partIds.map((id) => document.parts.find((part) => part.id === id)).filter((part): part is Part => Boolean(part));
      const { paths, files } = await modelFiles(document, usedDefinitions, usedParts);

      const contours = resolved.boardContours.find((entry) => entry.boardId === board.id)?.contours ?? [];
      exportClient.current ??= new ExportClient();
      const result = await exportClient.current.request({ kind: 'kicad', document, boardId: board.id, contours, paths: [...paths], files });
      download(result.filename, result.bytes, result.mediaType);
    });
  }

  const requestMechanicalProfile = useCallback(async (definitionId: string, source: MechanicalBuiltinProfile, plateToPcb: number): Promise<MechanicalPartProfile> => {
    if (!client.current) throw new Error('The core worker is not ready');
    const reply = await client.current.request({ id: crypto.randomUUID(), kind: 'mechanical-profile', definitionId, source, plateToPcb });
    if (reply.kind === 'error') throw new Error(reply.message);
    if (reply.kind !== 'mechanical-profile') throw new Error('Expected a library mechanical profile');
    return reply.profile;
  }, []);

  const extractMechanicalProfile = useCallback(async (source: string, mappings: MechanicalPurposeMapping[]): Promise<MechanicalExtraction> => {
    const reply = await ensureExportClient().artifact({ kind: 'extract-mechanical', source, mappings, maxDeviationMm: 0.005 });
    if (reply.kind === 'error') throw new Error(reply.error.message);
    if (reply.kind !== 'extract-mechanical') throw new Error('Expected extracted mechanical geometry');
    return reply.result;
  }, []);

  function exportMechanical(): void {
    schedule(async () => {
      const document = projectRef.current;
      const resolved = committedScene.current;
      const configuration = document.mechanical;
      if (generation.status !== 'ready' || generation.revision !== document.revision) throw new Error('Generate the current geometry before export');
      if (!configuration || configuration.boardId !== selectedBoardId) {
        throw new Error('Enable a mechanical assembly for the selected board before export');
      }
      if (resolved.revision !== document.revision) throw new Error('The committed scene is still resolving');
      const contours = resolved.boardContours.find((entry) => entry.boardId === configuration.boardId)?.contours ?? [];
      const isCurrent = () => projectRef.current.id === document.id && projectRef.current.revision === document.revision;
      caseClient.current ??= new CaseClient();
      const exporter = ensureExportClient();
      const files = await exportMechanicalAssembly({ document, contours, core: client.current!, cad: caseClient.current, exporter, isCurrent });
      const entries = Object.keys(files).map((path, bufferIndex) => ({ path, bufferIndex }));
      const packed = await exporter.archive({ kind: 'archive', request: { kind: 'pack-files', entries }, buffers: Object.values(files) });
      if (!isCurrent()) throw new Error('The assembly changed during export; export the current revision again');
      if (packed.reply.kind !== 'packed') throw new Error('Expected a mechanical assembly archive');
      download(`${document.name}-mechanical.zip`, packed.reply.bytes, 'application/zip');
    });
  }

  const compileFootprints = useCallback(async (jobs: FootprintCompileJob[]) => {
    exportClient.current ??= new ExportClient();
    return exportClient.current.compile(jobs);
  }, []);

  const projectMatrices = useCallback(async (matrices: Matrix[]): Promise<MatrixScene[] | undefined> => {
    const core = client.current;
    if (!core) return undefined;
    const requestedRevision = projectRef.current.revision;
    const reply = await core.projectMatrices(crypto.randomUUID(), requestedRevision, matrices);
    if (reply.kind !== 'matrix-projections' || reply.revision !== requestedRevision || projectRef.current.revision !== requestedRevision) return undefined;
    return reply.matrixScenes;
  }, []);

  if (!ready) {
    return <div className="boot-status">Opening Board Studio…</div>;
  }

  return <>
    {error && <div className="app-error" role="alert" onClick={() => setError('')}>{error}</div>}
    <Workbench
      saveStatus={saveStatus}
      projectSession={projectSession}
      document={project}
      scene={scene}
      casePreview={visibleCasePreview && { revision: visibleCasePreview.revision, ...visibleCasePreview.mesh }}
      caseBodies={visibleCasePreview?.bodies}
      mechanicalAssembly={project.mechanical?.boardId === selectedBoardId ? visibleMechanicalAssembly : undefined}
      onResolveMechanical={() => { void generateCase(); }}
      onCancelGeneration={cancelGeneration}
      generation={generation}
      onExportMechanical={exportMechanical}
      onMechanicalProfile={requestMechanicalProfile}
      onExtractMechanicalProfile={extractMechanicalProfile}
      componentPreviews={componentPreviews}
      libraryModelPreviews={libraryModelPreviews}
      libraryModelStatus={libraryModelStatus}
      onSelectLibraryModel={selectLibraryModel}
      onRequestCaseModels={requestCaseModels}
      onModeChange={setActiveMode}
      onEdit={edit}
      onUndo={() => history('undo')}
      onRedo={() => history('redo')}
      onExport={exportFile}
      compileFootprints={compileFootprints}
      embedUsedModels={embedUsedModels}
      onEmbedUsedModelsChange={setEmbedUsedModels}
      selectedBoardId={selectedBoardId}
      onSelectBoard={setSelectedBoardId}
      onImport={importProject}
      onNewProject={newProject}
      onDuplicateDesign={duplicateDesign}
      onProjectMatrices={projectMatrices}
      onImportFootprint={importPart}
      onImportModel={importModel}
    />
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);

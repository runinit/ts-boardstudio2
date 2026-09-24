import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { defaultOutlineSettings, emptyProject } from '@boardstudio/v2-contracts';
import type { CaseAssemblyIR, CaseResult, CoreReply, CoreRequest, EditCommand, PartDefinition, ProjectDoc, SceneDelta } from '@boardstudio/v2-contracts';
import { builtinDefinitions, importFootprint } from '@boardstudio/v2-kicad';
import type { StepModel } from '@boardstudio/v2-cad';
import { CoreClient } from './CoreClient';
import { CaseClient } from './CaseClient';
import { ExportClient } from './ExportClient';
import { demoProject } from './demo';
import { outlineDxf, outlineSvg } from './outlineExport';
import { activeProjectId, loadAsset, loadProject, saveAsset, saveProject, unpackProject } from './storage';
import { Workbench, matrixWithPreset } from './ui/Workbench';
import type { ComponentPreview } from './ui/CasePreview';

const STARTER_ID = 'starter';

const EMPTY_SCENE: SceneDelta = {
  revision: 0,
  transactionId: 'initial',
  changedIds: [],
  transforms: [],
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

async function modelFiles(document: ProjectDoc, definitions: PartDefinition[]): Promise<{ paths: Map<string, string>; files: Record<string, Uint8Array> }> {
  const paths = new Map<string, string>();
  const files: Record<string, Uint8Array> = {};

  for (const id of new Set(definitions.flatMap((definition) => definition.model ? [definition.model.assetId] : []))) {
    const asset = document.assets.find((item) => item.id === id);
    const extension = asset?.name.match(/\.(step|stp|wrl)$/i)?.[1]?.toLowerCase();

    if (!asset || !extension) {
      throw new Error(`Model asset ${id} needs a STEP or WRL filename`);
    }

    const bytes = await loadAsset(asset.sha256);

    if (!bytes) {
      throw new Error(`Model asset ${asset.name} is missing`);
    }

    const path = `models/${asset.sha256}.${extension}`;

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
  const [casePreview, setCasePreview] = useState<CaseResult | undefined>();
  const [modelMeshes, setModelMeshes] = useState<Record<string, StepModel>>({});
  const [libraryDefinitionId, setLibraryDefinitionId] = useState('');
  const [activeMode, setActiveMode] = useState<'Design' | 'PCB' | 'Case' | 'Library' | 'Export'>('Design');
  const client = useRef<CoreClient | null>(null);
  const caseClient = useRef<CaseClient | null>(null);
  const exportClient = useRef<ExportClient | null>(null);
  const caseSeq = useRef(0);
  const modelEpoch = useRef(0);
  const modelCache = useRef(new Map<string, Promise<StepModel>>());
  const projectRef = useRef(project);
  const committedScene = useRef(scene);
  const queue = useRef<Promise<void>>(Promise.resolve());

  function accept(reply: CoreReply, mode: 'open' | 'commit' | 'preview'): void {
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

    projectRef.current = reply.document;
    setProject(reply.document);
    setScene(reply.scene);
    setSelectedBoardId((current) => reply.document.boards.some((board) => board.id === current)
      ? current
      : reply.document.boards[0]?.id ?? '');

    if (mode !== 'preview') {
      committedScene.current = reply.scene;
      void saveProject(reply.document).catch((cause) => setError(String(cause)));
    }
  }

  function schedule(work: () => Promise<void>): void {
    queue.current = queue.current.then(work).catch((cause) => setError(String(cause)));
  }

  useEffect(() => {
    const core = new CoreClient();

    client.current = core;
    schedule(async () => {
      const saved = await loadProject(activeProjectId(STARTER_ID));
      const document = saved ?? demoProject();
      const reply = await core.request({ id: crypto.randomUUID(), kind: 'open', document });

      accept(reply, 'open');
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
    const sequence = ++caseSeq.current;

    if (activeMode !== 'Case') {
      return;
    }

    const boardReady = scene.boardReadiness.find((entry) => entry.boardId === selectedBoardId);

    if (scene !== committedScene.current) {
      return;
    }

    if (!ready || !boardReady?.case) {
      setCasePreview(undefined);
      return;
    }

    const timer = setTimeout(async () => {
      caseClient.current ??= new CaseClient();
      const ir = caseAssembly(project, scene, selectedBoardId);

      try {
        const result = await caseClient.current.request(ir);

        if (sequence !== caseSeq.current) {
          return;
        }

        setCasePreview(result);
      } catch (cause) {
        if (sequence === caseSeq.current) {
          setError(String(cause));
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [activeMode, ready, project, scene, selectedBoardId]);

  const requestModels = useCallback((definitionIds: string[]) => {
    const document = projectRef.current;
    const definitions = new Map(document.definitions.map((item) => [item.id, item]));
    const assets = new Map(document.assets.map((item) => [item.id, item]));

    for (const id of definitionIds) {
      const asset = assets.get(definitions.get(id)?.model?.assetId ?? '');

      if (!asset || !/\.(step|stp)$/i.test(asset.name) || modelCache.current.has(asset.sha256)) {
        continue;
      }

      const task = loadAsset(asset.sha256).then(async (bytes) => {
        if (!bytes) {
          throw new Error(`Model asset ${asset.name} is missing`);
        }

        caseClient.current ??= new CaseClient();
        return caseClient.current.requestModel(bytes);
      });

      const epoch = modelEpoch.current;
      modelCache.current.set(asset.sha256, task);
      void task.then((mesh) => {
        if (epoch !== modelEpoch.current) {
          return;
        }

        setModelMeshes((current) => ({ ...current, [asset.sha256]: mesh }));
      }).catch((cause) => {
        if (epoch !== modelEpoch.current) {
          return;
        }

        modelCache.current.delete(asset.sha256);
        setError(String(cause));
      });
    }
  }, []);

  const requestCaseModels = useCallback((boardId: string) => {
    const document = projectRef.current;
    const board = document.boards.find((item) => item.id === boardId);

    if (!board) {
      return;
    }

    const parts = new Map(document.parts.map((item) => [item.id, item]));
    requestModels([...new Set(board.partIds.map((id) => parts.get(id)?.definitionId).filter((id): id is string => Boolean(id)))]);
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

    const definitions = new Map(project.definitions.map((item) => [item.id, item]));
    const parts = new Map(project.parts.map((item) => [item.id, item]));
    const poses = new Map(scene.transforms.map((item) => [item.id, item.pose]));
    const assets = new Map(project.assets.map((item) => [item.id, item]));

    return board.partIds.flatMap((id) => {
      const part = parts.get(id);
      const definition = part && definitions.get(part.definitionId);
      const model = definition?.model;
      const asset = model && assets.get(model.assetId);
      const mesh = asset && modelMeshes[asset.sha256]?.mesh;

      if (!part || !model || !mesh) {
        return [];
      }

      return [{ id, reference: part.reference, pose: poses.get(id) ?? part.pose, side: part.side, model, mesh }];
    });
  }, [activeMode, project.boards, project.definitions, project.parts, project.assets, selectedBoardId, scene.transforms, modelMeshes]);

  const libraryModelPreview = useMemo<ComponentPreview | undefined>(() => {
    const definition = project.definitions.find((item) => item.id === libraryDefinitionId);
    const model = definition?.model;
    const asset = project.assets.find((item) => item.id === model?.assetId);
    const mesh = asset && modelMeshes[asset.sha256]?.mesh;

    if (!definition || !model || !mesh) {
      return undefined;
    }

    return {
      id: definition.id,
      reference: definition.name,
      pose: { at: { x: 0, y: 0 }, rotation: 0 },
      side: 'front',
      model,
      mesh,
    };
  }, [project.definitions, project.assets, libraryDefinitionId, modelMeshes]);

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

      accept(reply, command.phase);
    });
  }

  function history(kind: 'undo' | 'redo'): void {
    schedule(async () => {
      if (!client.current) {
        return;
      }

      const reply = await client.current.request({ id: crypto.randomUUID(), kind });

      accept(reply, 'commit');
    });
  }

  function importProject(file: File): void {
    schedule(async () => {
      if (!client.current) {
        return;
      }

      const document = await unpackProject(new Uint8Array(await file.arrayBuffer()));
      const reply = await client.current.request({ id: crypto.randomUUID(), kind: 'open', document });

      accept(reply, 'open');
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

      accept(reply, 'open');
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

      accept(changed, 'open');
    });
  }

  function importPart(file: File): void {
    schedule(async () => {
      if (!file.name.endsWith('.kicad_mod')) {
        throw new Error('Select a .kicad_mod footprint');
      }

      const definition = importFootprint(await file.text(), crypto.randomUUID());
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

      accept(reply, 'commit');
    });
  }

  function importModel(file: File, definitionId: string): void {
    schedule(async () => {
      const extension = file.name.match(/\.(step|stp|wrl)$/i)?.[1]?.toLowerCase();

      if (!extension) {
        throw new Error('Select a STEP or WRL model');
      }

      const current = projectRef.current;
      const definition = current.definitions.find((item) => item.id === definitionId);

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
        mediaType: extension === 'wrl' ? 'model/vrml' : 'model/step',
        sha256,
        source: 'local file',
      };
      const model = {
        assetId,
        offset: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      };
      const document: ProjectDoc = {
        ...current,
        assets: [...current.assets, asset],
        definitions: current.definitions.map((item) => item.id === definitionId ? { ...item, model } : item),
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

      accept(reply, 'commit');
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
        const files: Record<string, Uint8Array> = {};
        for (const asset of document.assets) {
          const bytes = await loadAsset(asset.sha256);
          if (!bytes) {
            throw new Error(`Missing asset: ${asset.name}`);
          }
          files[`assets/${asset.sha256}`] = bytes;
        }
        exportClient.current ??= new ExportClient();
        const result = await exportClient.current.request({ kind: 'project', document, paths: [], files });
        download(result.filename, result.bytes, result.mediaType);
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
        const content = kind === 'svg' ? outlineSvg(contours) : outlineDxf(contours);

        download(`${document.name}.${kind}`, content, kind === 'svg' ? 'image/svg+xml' : 'application/dxf');
        return;
      }

      if (kind === 'case-step') {
        if (!boardReady?.case) {
          throw new Error('Resolve case findings before export');
        }

        caseClient.current ??= new CaseClient();
        const result = await caseClient.current.request(caseAssembly(document, resolved, board.id));
        const boardSuffix = document.boards.length === 1 ? '' : `-${board.name.replace(/[^a-zA-Z0-9_.-]+/g, '_')}`;

        download(`${document.name}${boardSuffix}-case.step`, result.step, 'model/step');
        return;
      }

      if (!boardReady?.pcb) {
        throw new Error('Resolve PCB findings before export');
      }

      const usedDefinitions = document.definitions
        .filter((definition) => board.partIds.some((id) => document.parts.find((part) => part.id === id)?.definitionId === definition.id))
      const { paths, files } = await modelFiles(document, usedDefinitions);

      const contours = resolved.boardContours.find((entry) => entry.boardId === board.id)?.contours ?? [];
      exportClient.current ??= new ExportClient();
      const result = await exportClient.current.request({ kind: 'kicad', document, boardId: board.id, contours, paths: [...paths], files });
      download(result.filename, result.bytes, result.mediaType);
    });
  }

  if (!ready) {
    return <div className="boot-status">Opening Board Studio…</div>;
  }

  return <>
    {error && <div className="app-error" role="alert" onClick={() => setError('')}>{error}</div>}
    <Workbench
      document={project}
      scene={scene}
      casePreview={casePreview && { revision: casePreview.revision, ...casePreview.mesh }}
      componentPreviews={componentPreviews}
      libraryModelPreview={libraryModelPreview}
      onSelectLibraryModel={selectLibraryModel}
      onRequestCaseModels={requestCaseModels}
      onModeChange={setActiveMode}
      onEdit={edit}
      onUndo={() => history('undo')}
      onRedo={() => history('redo')}
      onExport={exportFile}
      selectedBoardId={selectedBoardId}
      onSelectBoard={setSelectedBoardId}
      onImport={importProject}
      onNewProject={newProject}
      onDuplicateDesign={duplicateDesign}
      onImportFootprint={importPart}
      onImportModel={importModel}
    />
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);

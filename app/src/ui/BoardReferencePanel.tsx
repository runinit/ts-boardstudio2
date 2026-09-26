import { useEffect, useRef, useState } from 'react';
import type { BoardReference, ProjectDoc } from '@boardstudio/v2-contracts';
import { ExportClient } from '../ExportClient';
import { loadAsset, saveAsset } from '../storage';

export async function storePreviewAsset(file: File) {
  if (!file.size || file.size > 32 * 1024 * 1024)
    throw new Error('Choose a file smaller than 32 MiB');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(hash), (v) =>
    v.toString(16).padStart(2, '0'),
  ).join('');
  await saveAsset(sha256, bytes);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    sha256,
    mediaType: /\.kicad_pcb$/i.test(file.name)
      ? 'application/x-kicad-pcb'
      : /\.wrl$/i.test(file.name)
        ? 'model/vrml'
        : /\.stl$/i.test(file.name)
          ? 'model/stl'
          : 'model/step',
  };
}
export function BoardReferencePanel({
  document,
  boardId,
  onChange,
}: {
  document: ProjectDoc;
  boardId: string;
  onChange: (next: ProjectDoc) => void;
}) {
  const reference = document.boardReferences?.find(
    (r) => r.boardId === boardId,
  );
  const [paths, setPaths] = useState<string[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const current = useRef(document);
  current.current = document;
  const boardRef = useRef(boardId);
  boardRef.current = boardId;
  useEffect(() => {
    if (!reference) {
      setPaths([]);
      return;
    }
    let active = true;
    const client = new ExportClient();
    const asset = document.assets.find((a) => a.id === reference.assetId);
    if (asset)
      void loadAsset(asset.sha256)
        .then(async (bytes) => {
          if (!bytes) throw new Error('Saved board file is missing');
          const reply = await client.artifact({
            kind: 'preview-board',
            source: new TextDecoder().decode(bytes),
            revision: document.revision,
          });
          if (active && reply.kind === 'preview-board')
            setPaths([...new Set(reply.result.models.map((m) => m.path))]);
        })
        .catch((cause) => {
          if (active) setError(String(cause));
        });
    return () => {
      active = false;
      client.close();
    };
  }, [reference?.assetId]);
  const update = (next: BoardReference, assets = document.assets) =>
    onChange({
      ...document,
      assets,
      boardReferences: [
        ...(document.boardReferences ?? []).filter((r) => r.id !== next.id),
        next,
      ],
    });
  const importBoard = async (file: File) => {
    setBusy(true);
    setError('');
    const client = new ExportClient();
    const revision = document.revision;
    try {
      if (!/\.kicad_pcb$/i.test(file.name) || file.size > 32 * 1024 * 1024)
        throw new Error('Choose a .kicad_pcb file smaller than 32 MiB');
      const reply = await client.artifact({
        kind: 'preview-board',
        source: await file.text(),
        revision,
      });
      if (reply.kind !== 'preview-board')
        throw new Error('Board preview failed');
      const asset = await storePreviewAsset(file);
      if (current.current.revision !== revision || boardRef.current !== boardId)
        throw new Error(
          'The project changed during import. Retry with the current board.',
        );
      const next: BoardReference = reference
        ? { ...reference, assetId: asset.id, enabled: true }
        : {
            id: crypto.randomUUID(),
            boardId,
            assetId: asset.id,
            enabled: true,
            pose: { at: { x: 0, y: 0 }, rotation: 0 },
            elevation: 0,
            modelAssets: {},
          };
      update(next, [...document.assets, asset]);
      setPaths([...new Set(reply.result.models.map((m) => m.path))]);
    } catch (cause) {
      setError(String(cause instanceof Error ? cause.message : cause));
    } finally {
      client.close();
      setBusy(false);
    }
  };
  const attach = async (path: string, file: File) => {
    const revision = document.revision;
    setError('');
    try {
      if (!/\.(step|stp|stl|wrl)$/i.test(file.name))
        throw new Error('Choose a STEP, STL, or WRL model');
      const asset = await storePreviewAsset(file);
      if (current.current.revision !== revision)
        throw new Error('Project changed during model import. Retry.');
      if (reference)
        update(
          {
            ...reference,
            modelAssets: { ...reference.modelAssets, [path]: asset.id },
          },
          [...document.assets, asset],
        );
    } catch (cause) {
      setError(String(cause));
    }
  };
  const attachDirectory = async (files: FileList) => {
    if (!reference) return;
    setBusy(true);
    setError('');
    const revision = document.revision;
    try {
      const available = Array.from(files).filter((file) =>
        /\.(step|stp|stl|wrl)$/i.test(file.name),
      );
      const mapping = { ...reference.modelAssets };
      const assets = [...document.assets];
      let matched = 0;
      for (const path of paths) {
        const candidates = available.filter(
          (file) => path.replaceAll('\\', '/').split('/').pop() === file.name,
        );
        if (candidates.length !== 1) continue;
        const asset = await storePreviewAsset(candidates[0]);
        assets.push(asset);
        mapping[path] = asset.id;
        matched++;
      }
      if (current.current.revision !== revision)
        throw new Error('Project changed during model import. Retry.');
      if (!matched)
        throw new Error(
          'No unique model filenames matched. Attach files individually below.',
        );
      update({ ...reference, modelAssets: mapping }, assets);
    } catch (cause) {
      setError(String(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className="wb-assembly-editor">
      <summary>Routed PCB reference</summary>
      <p>
        Preview a routed KiCad board with the case. Replace this reference after
        editing routing in KiCad.
      </p>
      <label>
        {reference ? 'Replace KiCad board' : 'Import KiCad board'}
        <input
          type="file"
          accept=".kicad_pcb"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importBoard(file);
            e.target.value = '';
          }}
        />
      </label>
      {reference && (
        <>
          <label>
            <input
              type="checkbox"
              checked={reference.enabled}
              onChange={(e) =>
                update({ ...reference, enabled: e.target.checked })
              }
            />
            Use routed PCB in assembly
          </label>
          <div className="wb-transform-fields">
            {(['x', 'y'] as const).map((axis) => (
              <label key={axis}>
                {axis.toUpperCase()} (mm)
                <input
                  type="number"
                  step="0.1"
                  value={reference.pose.at[axis]}
                  onChange={(e) => {
                    if (e.target.value)
                      update({
                        ...reference,
                        pose: {
                          ...reference.pose,
                          at: {
                            ...reference.pose.at,
                            [axis]: Number(e.target.value),
                          },
                        },
                      });
                  }}
                />
              </label>
            ))}
            <label>
              Z (mm)
              <input
                type="number"
                step="0.1"
                value={reference.elevation}
                onChange={(e) => {
                  if (e.target.value)
                    update({ ...reference, elevation: Number(e.target.value) });
                }}
              />
            </label>
          </div>
          <label>
            Rotation (°)
            <input
              type="number"
              value={reference.pose.rotation}
              onChange={(e) => {
                if (e.target.value)
                  update({
                    ...reference,
                    pose: {
                      ...reference.pose,
                      rotation: Number(e.target.value),
                    },
                  });
              }}
            />
          </label>
          <label>
            Attach model directory
            <input
              type="file"
              multiple
              {...{ webkitdirectory: '' }}
              disabled={busy}
              onChange={(e) => {
                if (e.target.files) void attachDirectory(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          {paths.map((path) => (
            <label key={path}>
              {path}
              <select
                aria-label={`Model asset for ${path}`}
                value={reference.modelAssets[path] ?? ''}
                onChange={(e) =>
                  update({
                    ...reference,
                    modelAssets: {
                      ...reference.modelAssets,
                      [path]: e.target.value,
                    },
                  })
                }
              >
                <option value="">Resolve bundled model</option>
                {document.assets
                  .filter((a) => /\.(step|stp|stl|wrl)$/i.test(a.name))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
              <input
                aria-label={`Attach model for ${path}`}
                type="file"
                accept=".step,.stp,.stl,.wrl"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void attach(path, file);
                  e.target.value = '';
                }}
              />
            </label>
          ))}
          <button
            onClick={() =>
              onChange({
                ...document,
                boardReferences: document.boardReferences?.filter(
                  (r) => r.id !== reference.id,
                ),
              })
            }
          >
            Remove PCB reference
          </button>
        </>
      )}
      {busy && <p role="status">Importing PCB…</p>}
      {error && <p role="alert">{error}</p>}
    </details>
  );
}

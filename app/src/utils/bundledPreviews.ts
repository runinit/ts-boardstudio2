import { loadBundledModels } from './bundledModels';
import { fetchModel, officialStep } from './modelSources';
import type { CaseAssets } from './caseAssets';

export const PROJECT_MODELS = '${KIPRJMOD}/models/';
export const BUNDLED_PREFIX = `${PROJECT_MODELS}boardstudio/`;

function inspectModel(name: string, source: string, signal: AbortSignal) {
  signal.throwIfAborted();
  return new Promise<string>((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/model.worker.ts', import.meta.url),
      { type: 'module' }
    );
    const finish = () => {
      worker.terminate();
      signal.removeEventListener('abort', abort);
    };
    const abort = () => {
      finish();
      reject(signal.reason);
    };
    signal.addEventListener('abort', abort, { once: true });
    worker.onerror = (event) => {
      finish();
      reject(new Error(event.message));
    };
    worker.onmessage = ({ data }) => {
      finish();
      if (data.error) {
        reject(new Error(data.error));
        return;
      }
      resolve(JSON.stringify({ ...data, source }));
    };
    try {
      worker.postMessage({ name, source });
    } catch (error) {
      finish();
      reject(error);
    }
  });
}

// Return transient previews; callers must not store bundled bytes as owned overrides.
export async function bundledPreviews(
  paths: string[],
  assets: CaseAssets,
  signal: AbortSignal
): Promise<CaseAssets> {
  const selected = Array.from(
    new Set(
      paths.filter(
        (path) => path.startsWith(BUNDLED_PREFIX) || officialStep(path)
      )
    )
  );
  if (!selected.length) {
    return {};
  }
  const loaded = await loadBundledModels(selected, assets, (url, options) =>
    fetch(url, { ...options, signal })
  );
  const previews: CaseAssets = {};
  for (const path of selected) {
    signal.throwIfAborted();
    const official = officialStep(path);
    if (official) {
      // Cache geometry by the authored reference without replacing its source bytes.
      const key = `__model_${path}.json`;
      const cached = assets[key];
      if (cached) {
        previews[key] = cached;
        continue;
      }
      let source = { name: path, source: assets[path] };
      if (source.source === undefined) {
        try {
          source = await fetchModel(official, signal);
        } catch (error) {
          signal.throwIfAborted();
          if (official === path) {
            throw error;
          }
          // Some official parts have only WRL; resolve that without a user choice.
          source = await fetchModel(path, signal);
        }
      }
      previews[key] = await inspectModel(source.name, source.source, signal);
      continue;
    }
    const name = path.slice(PROJECT_MODELS.length);
    const key = `__model_${name}.json`;
    const cached = assets[key];
    previews[name] = loaded[name];
    previews[key] =
      cached && JSON.parse(cached).source === loaded[name]
        ? cached
        : await inspectModel(name, loaded[name], signal);
  }
  return previews;
}

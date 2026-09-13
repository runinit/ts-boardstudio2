import * as footprints from 'ergogen/src/footprint-tools';
import type { CaseAssets } from './caseAssets';

const PROJECT_MODELS = '${KIPRJMOD}/models/';
const BUNDLED_MODELS = 'boardstudio/';

// Resolve emitted model references so exports include defaults absent from project storage.
export async function loadBoardModels(
  boards: Record<string, string>,
  assets: CaseAssets,
  download: typeof fetch = fetch
): Promise<CaseAssets> {
  const paths: string[] = [];
  for (const board of Object.values(boards)) {
    if (!board.includes(PROJECT_MODELS + BUNDLED_MODELS)) {
      continue;
    }
    const summary = footprints.inspect(board);
    for (const target of summary.targets) {
      const info = footprints.inspect(board, target);
      paths.push(...info.models.map((model: { path: string }) => model.path));
    }
  }
  return loadBundledModels(paths, assets, download);
}

// Share portable-path validation between board export and selected-model previews.
export async function loadBundledModels(
  paths: string[],
  assets: CaseAssets,
  download: typeof fetch = fetch
): Promise<CaseAssets> {
  const names = new Set<string>();
  for (const path of paths) {
    if (!path.startsWith(PROJECT_MODELS + BUNDLED_MODELS)) {
      continue;
    }
    const name = path.slice(PROJECT_MODELS.length);
    if (name.split('/').some((part) => part === '..' || part === '.')) {
      throw new Error(`Invalid bundled model path: ${name}`);
    }
    if (assets[name] !== undefined) {
      continue;
    }
    names.add(name);
    const license = `boardstudio/${name.split('/')[1]}/LICENSE`;
    if (assets[license] === undefined) {
      names.add(license);
    }
  }
  const loaded: CaseAssets = {};
  for (const name of Array.from(names)) {
    // Plus is literal in URL paths; preserve it for static asset servers.
    const url = `${import.meta.env.BASE_URL}footprint-models/${name
      .split('/')
      .map((part) => encodeURIComponent(part).replace(/%2B/g, '+'))
      .join('/')}`;
    const response = await download(url);
    if (!response.ok) {
      throw new Error(
        `Cannot load bundled model ${name} (${response.status}).`
      );
    }
    const source = await response.text();
    if (!source.trim() || /^\s*</.test(source)) {
      throw new Error(`Invalid bundled model ${name}.`);
    }
    loaded[name] = source;
  }
  return { ...loaded, ...assets };
}

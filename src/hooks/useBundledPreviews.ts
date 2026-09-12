import { useEffect, useMemo, useState } from 'react';
import {
  bundledPreviews,
  BUNDLED_PREFIX,
  PROJECT_MODELS,
} from '../utils/bundledPreviews';
import type { CaseAssets } from '../utils/caseAssets';
import type { ModelBinding } from '../types/footprint';

export function useBundledPreviews(models: ModelBinding[], assets: CaseAssets) {
  const paths = models
    .map((model) => model.path)
    .filter((path) => path.startsWith(BUNDLED_PREFIX));
  const key = JSON.stringify(
    paths.map((path) => [path, assets[path.slice(PROJECT_MODELS.length)]])
  );
  const [preview, setPreview] = useState<{
    key: string;
    assets: CaseAssets;
    error: string;
  }>();
  useEffect(() => {
    const controller = new AbortController();
    const entries: [string, string | null][] = JSON.parse(key);
    const owned = Object.fromEntries(
      entries
        .filter(([, source]) => source !== null)
        .map(([path, source]) => [path.slice(PROJECT_MODELS.length), source!])
    );
    void bundledPreviews(
      entries.map(([path]) => path),
      owned,
      controller.signal
    )
      .then((assets) => {
        if (!controller.signal.aborted) {
          setPreview({ key, assets, error: '' });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setPreview({ key, assets: {}, error: String(error) });
        }
      });
    return () => controller.abort();
  }, [key]);
  const current = preview?.key === key ? preview : undefined;
  const merged = useMemo(
    () => ({ ...assets, ...current?.assets }),
    [assets, current]
  );
  return {
    assets: merged,
    error: current?.error || '',
  };
}

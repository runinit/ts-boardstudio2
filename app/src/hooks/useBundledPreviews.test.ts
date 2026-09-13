import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { bundledPreviews } from '../utils/bundledPreviews';
import { useBundledPreviews } from './useBundledPreviews';
import type { CaseAssets } from '../utils/caseAssets';
import type { ModelBinding } from '../types/footprint';

vi.mock('../utils/bundledPreviews', () => ({
  bundledPreviews: vi.fn(),
  PROJECT_MODELS: '${KIPRJMOD}/models/',
  BUNDLED_PREFIX: '${KIPRJMOD}/models/boardstudio/',
}));
const name = 'boardstudio/test/part.step';
const path = '${KIPRJMOD}/models/' + name;
const model = (path: string): ModelBinding => ({
  path,
  offset: [0, 0, 0],
  rotate: [0, 0, 0],
  scale: [1, 1, 1],
});
beforeEach(() => {
  vi.mocked(bundledPreviews).mockReset();
});

it('keeps bundled previews transient and uses project-owned bytes', async () => {
  const assets = { [name]: 'owned', [`__model_${name}.json`]: 'outdated' };
  vi.mocked(bundledPreviews).mockResolvedValue({
    [name]: 'owned',
    [`__model_${name}.json`]: 'fresh',
  });
  const { result } = renderHook(() =>
    useBundledPreviews([model(path)], assets)
  );
  await waitFor(() =>
    expect(result.current.assets[`__model_${name}.json`]).toBe('fresh')
  );
  expect(bundledPreviews).toHaveBeenCalledWith(
    [path],
    { [name]: 'owned' },
    expect.any(AbortSignal)
  );
  expect(assets).toEqual({
    [name]: 'owned',
    [`__model_${name}.json`]: 'outdated',
  });
});

it('aborts old selections and does not publish their late meshes', async () => {
  const requests: {
    signal: AbortSignal;
    resolve: (assets: CaseAssets) => void;
  }[] = [];
  vi.mocked(bundledPreviews).mockImplementation(
    (_paths, _assets, signal) =>
      new Promise((resolve) => requests.push({ signal, resolve }))
  );
  const { result, rerender } = renderHook(
    ({ path }) => useBundledPreviews([model(path)], {}),
    { initialProps: { path } }
  );
  const next = path.replace('part.step', 'next.step');
  rerender({ path: next });
  expect(requests[0].signal.aborted).toBe(true);
  await act(async () => requests[0].resolve({ stale: 'mesh' }));
  expect(result.current.assets).toEqual({});
  await act(async () => requests[1].resolve({ current: 'mesh' }));
  expect(result.current.assets).toEqual({ current: 'mesh' });
});

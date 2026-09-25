import { expect, test } from '@playwright/test';

type Result = { p50: number; p95: number; samples: number };
type Measurements = { worker: Result; painted: Result; parts: number; creation?: { workerMs: number; paintedMs: number } };

declare global {
  interface Window {
    runMatrixBenchmark: (keys: 30 | 100 | 200, scope: 'matrix' | 'row' | 'column') => Promise<Measurements>;
  }
}

test('updates complete matrix assembly outlines within latency targets', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('/bench-workbench.html');

  for (const keys of [30, 100, 200] as const) {
    for (const scope of ['matrix', 'row', 'column'] as const) {
      const result = await page.evaluate(([count, target]) => window.runMatrixBenchmark(count, target), [keys, scope] as const);

      console.info(`Matrix ${keys} ${scope}: ${JSON.stringify(result)}`);
      expect(result.parts).toBe(keys * 3);
      expect(result.worker.samples).toBe(100);
      expect(result.painted.samples).toBe(100);
      expect(result.creation?.paintedMs).toBeGreaterThan(0);

      if (keys >= 100) {
        expect(result.painted.p95).toBeLessThanOrEqual(keys);
      }
    }
  }
});

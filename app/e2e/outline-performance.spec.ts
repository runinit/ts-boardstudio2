import { expect, test } from '@playwright/test';

test('paints 100 and 200 key outline previews within latency targets', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/bench.html');
  const measurements = await page.evaluate(async () => ({
    small: await window.runOutlineBenchmark(100),
    large: await window.runOutlineBenchmark(200),
  }));

  console.info(`Outline paint latency: ${JSON.stringify(measurements)}`);

  expect(measurements.small.samples).toBe(100);
  expect(measurements.large.samples).toBe(100);
  expect(measurements.small.p95).toBeLessThan(100);
  expect(measurements.large.p95).toBeLessThan(200);
});

import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    preparePointerBenchmark: (keys: 30 | 100 | 200) => Promise<{ parts: number }>;
    beginPointerSample: () => void;
    waitPointerSample: () => Promise<number>;
    closePointerBenchmark: () => void;
    startFrameTrace: () => void;
    stopFrameTrace: () => { p95GapMs: number; gapsOver50Ms: number };
  }
}

const WARMUP_SAMPLES = 10;
const MEASURED_SAMPLES = 100;
const MOVE_PIXELS = 50;

function p95(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * 0.95) - 1];
}

async function measure(page: Page, keys: 30 | 100 | 200): Promise<{ latency: number; p95GapMs: number; gapsOver50Ms: number; changedFrames: number }> {
  await page.goto('/bench-workbench.html');
  const fixture = await page.evaluate((count) => window.preparePointerBenchmark(count), keys);
  expect(fixture.parts).toBe(keys * 3);

  const reference = `SW${Math.floor(keys / 2)}`;
  const part = page.locator(`.wb-scene-part[aria-label^="${reference},"]`);
  const bounds = await part.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + bounds!.width / 2;
  const y = bounds!.y + bounds!.height / 2;
  const samples: number[] = [];
  let previousTransform = await part.getAttribute('transform');
  let changedFrames = 0;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.evaluate(() => window.startFrameTrace());
  let frames = { p95GapMs: 0, gapsOver50Ms: 0 };

  try {
    for (let index = 0; index < WARMUP_SAMPLES + MEASURED_SAMPLES; index += 1) {
      await page.evaluate(() => window.beginPointerSample());
      await page.mouse.move(x + (index % 2 === 0 ? MOVE_PIXELS : -MOVE_PIXELS), y);
      const elapsed = await page.evaluate(() => window.waitPointerSample());
      const transform = await part.getAttribute('transform');

      if (transform !== previousTransform) {
        changedFrames += 1;
        previousTransform = transform;
      }

      if (index >= WARMUP_SAMPLES) {
        samples.push(elapsed);
      }
    }
  } finally {
    frames = await page.evaluate(() => window.stopFrameTrace());
    await page.mouse.up();
    await page.evaluate(() => window.closePointerBenchmark());
  }

  expect(changedFrames).toBeGreaterThan(MEASURED_SAMPLES / 2);
  return { latency: p95(samples), changedFrames, ...frames };
}

test('measures pointer to painted assembly feedback', async ({ page }) => {
  test.setTimeout(240_000);
  const limits = { 30: 33, 100: 50, 200: 100 } as const;

  for (const keys of [30, 100, 200] as const) {
    const result = await measure(page, keys);

    console.info(`${keys} key pointer feedback: ${JSON.stringify(result)}`);
    expect(result.latency).toBeLessThanOrEqual(limits[keys]);
  }
});

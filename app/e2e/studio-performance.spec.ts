import { test, expect, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import {
  installProbe,
  createMeasurement,
  settle,
  measurePreparation,
  measureFrozenRebuild,
  performanceFixture,
  verifyComponentMove,
} from './utils/studioPerformance';
import { openInspector, readSource } from './utils/studio';
const output = resolve(process.env.PERF_OUTPUT || 'test-results/performance');
const rows = Number(process.env.PERF_NATIVE_ROWS || 6);
const columns = Number(process.env.PERF_COLUMNS || 10);
const total = rows * columns;
const lastKey = `Select fingers_c${columns}_r1`;
const key = (page: Page) =>
  page.getByRole('button', { name: lastKey, exact: true });
const keys = (page: Page) =>
  page.getByRole('button', { name: /^Select fingers_c\d+_r\d+$/ });
test('measures real keyboard editing response and source correctness', async ({
  page,
}) => {
  const initial = process.env.PERF_SOURCE
    ? await readFile(process.env.PERF_SOURCE, 'utf8')
    : performanceFixture(columns, rows);
  test.setTimeout(600000);
  page.setDefaultTimeout(15000);
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'initial-source.yaml'), initial);
  const errors: string[] = [];
  const results: unknown[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installProbe(page, initial);
  try {
    await page.goto('./');
    await expect(keys(page)).toHaveCount(total);
    await settle(page);
    await page
      .getByRole('button', { name: 'Select Objects', exact: true })
      .click();
    await key(page).click();
    await page
      .getByRole('button', { name: 'Snapping settings', exact: true })
      .click();
    await page.getByLabel('Custom snap increment').fill('1');
    await page
      .getByRole('button', { name: 'Snapping settings', exact: true })
      .click();
    await page.screenshot({ path: resolve(output, 'before.png') });
    const measure = createMeasurement(page, output, results, errors);
    for (
      let repeat = 0;
      repeat < Number(process.env.PERF_REPEATS || 1);
      repeat++
    ) {
      await measure(
        `nudge-${repeat}`,
        'keydown',
        () => key(page).press('ArrowRight'),
        async () => {
          await expect
            .poll(
              async () =>
                parse(await readSource(page)).layout.objects[
                  `fingers_c${columns}_r1`
                ].placement.override.at
            )
            .toEqual([repeat + 1, 0, 0]);
        }
      );
    }
    await measureFrozenRebuild(page, output, results);
    if (process.env.PERF_REBUILD_ONLY === '1') {
      expect(errors).toEqual([]);
      return;
    }
    for (
      let repeat = 0;
      repeat < Number(process.env.PERF_REPEATS || 1);
      repeat++
    ) {
      const before = parse(await readSource(page)).layout.objects[
        `fingers_c${columns}_r1`
      ].placement.override.at;
      const box = await key(page).boundingBox();
      if (!box) throw new Error('Selected key has no rendered bounds');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await measure(
        `drag-${repeat}`,
        'pointermove',
        async () => {
          await page.mouse.move(
            box.x + box.width / 2 + 12,
            box.y + box.height / 2,
            { steps: 3 }
          );
          await page.mouse.up();
        },
        async () => {
          await expect
            .poll(
              async () =>
                parse(await readSource(page)).layout.objects[
                  `fingers_c${columns}_r1`
                ].placement.override.at[0]
            )
            .toBeGreaterThan(before[0]);
        }
      );
    }
    await openInspector(page);
    await page
      .getByRole('button', { name: `fingers ${total} keys`, exact: true })
      .click();
    for (const dimension of ['columns', 'rows']) {
      const field = page.getByLabel(`Matrix ${dimension}`, { exact: true });
      const base = dimension === 'columns' ? columns : rows;
      for (
        let repeat = 0;
        repeat < Number(process.env.PERF_REPEATS || 1);
        repeat++
      ) {
        for (const delta of [1, 0]) {
          await field.fill(String(base + delta));
          const count =
            dimension === 'columns'
              ? (base + delta) * rows
              : (base + delta) * columns;
          if (!delta)
            await measurePreparation(
              page,
              field,
              results,
              `remove-${dimension}-${repeat}`
            );
          const confirm = page.getByRole('button', {
            name: 'Remove keys and resize',
            exact: true,
          });
          await measure(
            `${delta ? 'add' : 'remove'}-${dimension}-${repeat}`,
            delta ? 'keydown' : 'click',
            () => (delta ? field.press('Tab') : confirm.click()),
            async () => {
              await expect(keys(page)).toHaveCount(count);
              expect(
                Object.keys(
                  parse(await readSource(page)).layout.objects
                ).filter((id) => /^fingers_c\d+_r\d+$/.test(id)).length
              ).toBe(count);
            }
          );
        }
      }
    }
    await page
      .getByRole('button', { name: 'Select Columns', exact: true })
      .click();
    await page.getByRole('button', { name: 'Fit layout', exact: true }).click();
    await page
      .getByRole('button', { name: 'Select fingers_c2_r1', exact: true })
      .click();
    await page
      .locator('summary')
      .filter({ hasText: /^Column keys$/ })
      .click();
    for (
      let repeat = 0;
      repeat < Number(process.env.PERF_REPEATS || 1);
      repeat++
    ) {
      await measure(
        `remove-key-${repeat}`,
        'click',
        () =>
          page
            .getByRole('button', {
              name: `Remove fingers_c2_r2`,
              exact: true,
            })
            .click(),
        async () => {
          await expect(keys(page)).toHaveCount(total - 1);
          expect(
            parse(await readSource(page)).layout.objects['fingers_c2_r2']
          ).toBeUndefined();
        }
      );
      await measure(
        `add-key-${repeat}`,
        'click',
        () =>
          page
            .getByRole('button', { name: 'Add key in row 2', exact: true })
            .click(),
        async () => {
          await expect(keys(page)).toHaveCount(total);
          expect(
            parse(await readSource(page)).layout.objects['fingers_c2_r2'].cell
          ).toEqual(['c2', 'r2']);
        }
      );
    }
    const finalSource = await readSource(page);
    await page
      .getByRole('button', { name: 'Undo project edit', exact: true })
      .click();
    await expect(keys(page)).toHaveCount(total - 1);
    await page
      .getByRole('button', { name: 'Redo project edit', exact: true })
      .click();
    await expect.poll(() => readSource(page)).toBe(finalSource);
    await settle(page);
    await page.screenshot({ path: resolve(output, 'after.png') });
    await writeFile(resolve(output, 'final-source.yaml'), finalSource);
    await page.reload();
    await expect(keys(page)).toHaveCount(total);
    expect(await readSource(page)).toBe(finalSource);
    if (process.env.PERF_NATIVE_ROWS) await verifyComponentMove(page, output);
    expect(errors).toEqual([]);
  } finally {
    await writeFile(
      resolve(output, 'worker-packets.json'),
      JSON.stringify(await page.evaluate(() => window.studioPackets), null, 2)
    );
    await writeFile(
      resolve(output, 'last-source.yaml'),
      await readSource(page)
    );
    await writeFile(
      resolve(output, 'timings.json'),
      JSON.stringify({ results, errors }, null, 2)
    );
    await page.screenshot({ path: resolve(output, 'last-state.png') });
  }
});

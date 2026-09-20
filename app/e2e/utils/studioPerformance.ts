import { regionEvidence } from './studioPerformanceProbe';
import { waitForStudio, writeWorkerPackets } from './studioPerformanceWorker';
import { expect, type Page, type Locator } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export { installProbe, performanceFixture } from './studioPerformanceProbe';
import { readSource, openInspector } from './studio';
import { parse } from 'yaml';
export const settle = async (page: Page) => {
  await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0, {
    timeout: 60000,
  });
  await expect(page.getByText(/Layout analysis failed/)).toHaveCount(0);
  await expect(
    page.getByText('Showing the last valid geometry.', { exact: true })
  ).toHaveCount(0);
  await expect(
    page
      .getByRole('group', { name: 'Interactive board layout' })
      .locator('polyline')
      .first()
  ).toHaveAttribute('points', /[-\d.]+,[-\d.]+/);
};
export function createMeasurement(
  page: Page,
  output: string,
  results: unknown[],
  errors: string[]
) {
  async function measure(
    name: string,
    event: string,
    action: () => Promise<void>,
    verify: () => Promise<void>
  ) {
    await settle(page);
    const before = await readSource(page);
    const contour = page
      .getByRole('group', { name: 'Interactive board layout' })
      .locator(':scope > g[transform="scale(1,-1)"][pointer-events="none"]');
    const outlineBefore = await contour.innerHTML();
    await page.evaluate(
      ({ event, source }) => {
        const probe = window.performanceProbe;
        Object.assign(probe, {
          start: 0,
          visible: 0,
          persisted: 0,
          committed: 0,
          polygon: [
            ...document.querySelectorAll(
              '[aria-label="Interactive board layout"] [role="button"] polygon'
            ),
          ]
            .map((node) => node.getAttribute('points'))
            .join('|'),
          armed: true,
          event,
          source,
          geometry: [
            ...document.querySelectorAll(
              '[aria-label="Interactive board layout"] [role="button"] polygon'
            ),
          ]
            .map(
              (node) =>
                `${node.parentElement?.getAttribute('transform')}:${node.getAttribute('points')}`
            )
            .join('|'),
        });
      },
      { event, source: before }
    );
    await action();
    const actionSource = await readSource(page);
    const start = await page.evaluate(() => window.performanceProbe.start);
    await verify();
    const acknowledgment = await waitForStudio(page, actionSource, start);
    await writeWorkerPackets(
      page,
      resolve(output, `${name}-worker.json`),
      acknowledgment.requestId,
      acknowledgment.revision
    );
    await settle(page);
    const result = await page.evaluate((name) => {
      const probe = window.performanceProbe;
      probe.armed = false;
      return {
        name,
        inputToVisibleMs: probe.visible ? probe.visible - probe.start : null,
        inputToPersistedMs: probe.persisted
          ? probe.persisted - probe.start
          : null,
        committedPolygonMs: probe.committed
          ? probe.committed - probe.start
          : null,
        settledMs: performance.now() - probe.start,
        longTasks: probe.tasks.filter((task) => task.start >= probe.start),
        visibleBudgetMs: 100,
        persistedBudgetMs: 100,
        visiblePass: !!probe.visible && probe.visible - probe.start < 100,
        persistedPass: !!probe.persisted && probe.persisted - probe.start < 100,
      };
    }, name);
    results.push({
      ...result,
      acknowledgment,
      regions: regionEvidence(before, await readSource(page)),
      outlineSettledWithin5s: acknowledgment.publishedSuccessMs < 5000,
      outlineSettledWithin60s: acknowledgment.publishedSuccessMs < 60000,
    });
    await writeFile(
      resolve(output, `${name}-source.yaml`),
      await readSource(page)
    );
    await writeFile(
      resolve(output, 'timings.json'),
      JSON.stringify({ results, errors }, null, 2)
    );
    await settle(page);
    await expect(contour).toBeVisible();
    if (name.startsWith('nudge-'))
      expect(await contour.innerHTML()).not.toBe(outlineBefore);
    return before;
  }
  return measure;
}
export async function measurePreparation(
  page: Page,
  field: Locator,
  results: unknown[],
  name: string
) {
  const source = await readSource(page);
  await page.evaluate(() =>
    Object.assign(window.performanceProbe, {
      armed: true,
      event: 'keydown',
      start: 0,
    })
  );
  await field.press('Tab');
  await expect(
    page.getByRole('dialog', { name: 'Review matrix resize' })
  ).toBeVisible();
  const elapsedMs = await page.evaluate(
    () => performance.now() - window.performanceProbe.start
  );
  expect(await readSource(page)).toBe(source);
  results.push({
    name: name + '-preparation',
    tabToDialogMs: elapsedMs,
    sourceUnchanged: true,
  });
}

export async function measureFrozenRebuild(
  page: Page,
  output: string,
  results: unknown[]
) {
  const automatic = page.getByRole('checkbox', { name: 'Automatic outline' });
  const freezeStart = await page.evaluate(() => performance.now());
  await automatic.uncheck();
  await waitForStudio(page, await readSource(page), freezeStart);
  await settle(page);
  await writeFile(
    resolve(output, 'post-nudge-frozen-source.yaml'),
    await readSource(page)
  );
  await page.evaluate(() =>
    Object.assign(window.performanceProbe, {
      armed: true,
      event: 'click',
      start: 0,
    })
  );
  const frozen = await readSource(page);
  await page
    .getByRole('button', { name: 'Rebuild outline', exact: true })
    .click();
  const start = await page.evaluate(() => window.performanceProbe.start);
  const acknowledgment = await waitForStudio(page, frozen, start);
  await writeWorkerPackets(
    page,
    resolve(output, 'rebuild-worker.json'),
    acknowledgment.requestId,
    acknowledgment.revision
  );
  await settle(page);
  const elapsedMs = await page.evaluate(
    () => performance.now() - window.performanceProbe.start
  );
  await expect(automatic).not.toBeChecked();
  results.push({
    name: 'frozen-rebuild',
    completedMs: elapsedMs,
    acknowledgment,
    regions: regionEvidence(frozen, await readSource(page)),
  });
  await page.screenshot({ path: resolve(output, 'post-nudge-rebuilt.png') });
  const automaticStart = await page.evaluate(() => performance.now());
  await automatic.check();
  await waitForStudio(page, await readSource(page), automaticStart);
  await settle(page);
}

export async function verifyComponentMove(page: Page, output: string) {
  const id = 'fingers_c1_r1_diode';
  const before = await readSource(page);
  const inspector = await openInspector(page);
  await page
    .getByRole('button', { name: 'Select Objects', exact: true })
    .click();
  await page.locator(`[data-object="${id}"]`).press('Enter');
  const started = await page.evaluate(() => performance.now());
  await inspector.getByLabel('X', { exact: true }).fill('1');
  await inspector.getByLabel('X', { exact: true }).press('Tab');
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects[id].placement.at[0]
    )
    .toBe(1);
  await settle(page);
  const edited = await readSource(page);
  await waitForStudio(page, edited, started);
  await page
    .getByRole('button', { name: 'Undo project edit', exact: true })
    .click();
  await expect.poll(() => readSource(page)).toBe(before);
  await page
    .getByRole('button', { name: 'Redo project edit', exact: true })
    .click();
  await expect.poll(() => readSource(page)).toBe(edited);
  await page.reload();
  await waitForStudio(page, edited, 0);
  await settle(page);
  expect(await readSource(page)).toBe(edited);
  await writeFile(resolve(output, 'component-moved-source.yaml'), edited);
  await page.screenshot({
    path: resolve(output, 'component-moved-reloaded.png'),
  });
}

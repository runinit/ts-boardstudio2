import { expect, test, type Page } from '@playwright/test';
import { parse } from 'yaml';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { openInspector, readSource, studio } from './utils/studio';

test.setTimeout(120000);

const outline = (page: Page) =>
  page
    .getByRole('group', { name: 'Interactive board layout' })
    .locator(
      ':scope > g[transform="scale(1,-1)"][pointer-events="none"] polyline'
    );

async function rebuild(page: Page) {
  const automatic = page.getByRole('checkbox', { name: 'Automatic outline' });
  if (await automatic.isChecked()) {
    await automatic.click();
  }
  await page
    .getByRole('button', { name: 'Rebuild outline', exact: true })
    .click();
  await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0, {
    timeout: 60000,
  });
}

async function visibleOutline(page: Page) {
  await expect
    .poll(() => outline(page).count(), { timeout: 60000 })
    .toBeGreaterThan(3);
  await expect(outline(page).first().locator('..')).toBeVisible();
  await expect(outline(page).first()).toHaveAttribute(
    'points',
    /[-\d.]+,[-\d.]+/
  );
}

test('creates, moves, and rebuilds a matrix outline as one undoable edit', async ({
  page,
}) => {
  await page.goto('./new');
  await expect(studio(page)).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^Select fingers_c\d+_r\d+$/ })
  ).toHaveCount(20);
  await visibleOutline(page);

  await openInspector(page);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByLabel('New item kind').selectOption('columns');
  await page.getByLabel('New matrix columns').fill('2');
  await page.getByLabel('New matrix rows').fill('2');
  await page.getByLabel('New item name').fill('matrix');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page
    .getByRole('button', { name: 'matrix 4 keys', exact: true })
    .click();

  const beforeMove = parse(await readSource(page));
  const inspector = page.getByLabel('Design inspector');
  await inspector
    .locator('summary')
    .filter({ hasText: 'Relative adjustments' })
    .click();
  await inspector.getByLabel('Relative x', { exact: true }).fill('10');
  await inspector
    .getByRole('button', { name: 'Apply relative adjustment' })
    .click();
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.clusters.matrix.placement?.override
          ?.at
    )
    .toEqual([10, 0, 0]);
  const beforeRebuild = await readSource(page);
  expect(parse(beforeRebuild).layout.objects).toEqual(
    beforeMove.layout.objects
  );

  await rebuild(page);
  await expect.poll(() => readSource(page)).not.toBe(beforeRebuild);
  await visibleOutline(page);
  expect(parse(await readSource(page)).designs.boundaries.main.holes).toBe(
    'fill'
  );
  await page.getByRole('button', { name: 'Fit layout', exact: true }).click();
  await page.screenshot({ path: test.info().outputPath('matrix-rebuilt.png') });

  await page.getByRole('button', { name: 'Undo project edit' }).click();
  await expect.poll(() => readSource(page)).toBe(beforeRebuild);
});

test('repairs an imported legacy component region only on request and undoes exactly', async ({
  page,
}) => {
  // Synthetic legacy source: the original reported configuration was unavailable.
  const source = `schema: ergogen/v1
layout:
  objects:
    key:
      kind: key
      pcb: main
      envelopes: {pcb: {size: [18, 18]}}
    diode:
      kind: component
      pcb: main
      placement: {ref: key, at: [0, -5, 0]}
      envelopes: {pcb: {size: [3.2, 1.6]}}
designs:
  regions:
    keys: {select: {kind: key, pcb: main}, envelope: pcb, close: 2}
    components: {select: {kind: component, pcb: main}, envelope: pcb, close: 2}
  boundaries:
    edge:
      from: [regions.keys, regions.components]
      clearance: 2
      corners: {fillet: 2}
      connected: single
  profiles:
    board: {from: boundaries.edge}
pcbs:
  main: {profile: profiles.board}
`;
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: CONFIG_LOCAL_STORAGE_KEY, value: source }
  );
  await page.goto('./');
  await expect(studio(page)).toBeVisible();
  await visibleOutline(page);
  expect(await readSource(page)).toBe(source);

  await rebuild(page);
  await expect.poll(() => readSource(page)).not.toBe(source);
  await visibleOutline(page);
  const result = parse(await readSource(page));
  expect(result.designs.regions.components.close).toBeUndefined();
  expect(result.designs.boundaries.edge.holes).toBe('fill');
  expect(result.layout).toEqual(parse(source).layout);
  await page.screenshot({ path: test.info().outputPath('legacy-rebuilt.png') });

  await page.getByRole('button', { name: 'Undo project edit' }).click();
  await expect.poll(() => readSource(page)).toBe(source);
  await visibleOutline(page);
});

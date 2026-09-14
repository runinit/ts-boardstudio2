import { test, expect, type Page } from '@playwright/test';
import { parse } from 'yaml';
import { resolve } from 'ergogen/src/native/layout';
import { createBoard } from '../src/utils/boardDefaults';
import { defaultSetup } from '../src/utils/designSetup';
import { addCluster, setValue } from '../src/utils/studioSource';
import { setKeyOptions } from '../src/utils/keyOptions';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { readSource, studio, openCase } from './utils/studio';

test.setTimeout(120000);
const capture = (name: string) =>
  `docs/design-qa/settings-consolidation/${name}.png`;
async function open(page: Page, source: string, width = 1440) {
  await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
  await page.addInitScript(
    ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
    { key: CONFIG_LOCAL_STORAGE_KEY, source }
  );
  await page.goto('./');
  await expect(
    page.getByRole('status', { name: 'Project status' })
  ).toContainText('Layout positions current');
}
function board() {
  return setValue(
    addCluster(createBoard(), 'fingers', 'columns', { columns: 2, rows: 2 }),
    ['meta', 'studio', 'openSetup'],
    false
  );
}

test('keeps one matrix spacing editor and preserves defaults through a rename', async ({
  page,
}) => {
  let source = setKeyOptions(createBoard(), { pitch: [18, 17] });
  source = setValue(
    addCluster(source, 'fingers', 'columns', { columns: 2, rows: 2 }),
    ['meta', 'studio', 'openSetup'],
    false
  );
  await open(page, source);
  await page
    .getByRole('button', { name: 'Select Matrices', exact: true })
    .click();
  await page.locator('[data-object="fingers_c1_r1"]').click();
  await expect(page.getByLabel('Column spacing', { exact: true })).toHaveCount(
    1
  );
  await expect(
    page.getByLabel('Selection column spacing', { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel('Default column spacing', { exact: true })
  ).toHaveCount(0);
  await page
    .getByLabel('Column spacing', { exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: capture('desktop-matrix') });
  await page.getByRole('button', { name: 'Design setup', exact: true }).click();
  await expect(page.getByLabel('Horizontal pitch')).toHaveValue('18');
  await page.getByLabel('Design name').fill('Renamed');
  await page.getByRole('button', { name: 'Apply setup', exact: true }).click();
  await expect
    .poll(async () => parse(await readSource(page)).meta.name)
    .toBe('Renamed');
  const data = parse(await readSource(page));
  expect(data.meta.studio.defaults.pitch).toEqual([18, 17]);
  expect(data.layout.clusters.fingers.arrangement.pitch).toEqual([18, 17]);
});

test('edits column and key assembly scopes and resets a key to inheritance', async ({
  page,
}) => {
  await open(page, board());
  await page
    .getByRole('button', { name: 'Select Columns', exact: true })
    .click();
  await page.locator('[data-object="fingers_c1_r1"]').click();
  await page
    .getByRole('button', { name: 'Edit key assembly', exact: true })
    .click();
  await expect(page.getByLabel('Assembly scope')).toHaveValue('2');
  await page
    .getByRole('checkbox', { name: 'SOD-123 diode', exact: true })
    .uncheck();
  await page.screenshot({ path: capture('desktop-assembly') });
  await page
    .getByRole('button', { name: 'Apply assembly', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        !!parse(await readSource(page)).layout.objects.fingers_c1_r1_diode
    )
    .toBe(false);
  await page
    .getByRole('button', { name: 'Select Objects', exact: true })
    .click();
  await page.locator('[data-object="fingers_c1_r1"]').click();
  await page
    .getByRole('button', { name: 'Edit key assembly', exact: true })
    .click();
  await page
    .getByRole('checkbox', { name: 'SK6812 MINI-E LED', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Apply assembly', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        !!parse(await readSource(page)).layout.objects.fingers_c1_r1_led
    )
    .toBe(true);
  await page
    .getByRole('button', { name: 'Edit key assembly', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Reset to inherited', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        !!parse(await readSource(page)).layout.objects.fingers_c1_r1_led
    )
    .toBe(false);
  const data = parse(await readSource(page));
  expect(data.layout.objects.fingers_c1_r1_diode).toBeUndefined();
  expect(data.layout.objects.fingers_c2_r1_diode).toBeDefined();
});

test('retains an edge relationship only after the snapped drop', async ({
  page,
}) => {
  let source = addCluster(
    createBoard({ ...defaultSetup(), diode: false }),
    'fingers',
    'columns'
  );
  source = setValue(source, ['meta', 'studio', 'openSetup'], false);
  source = setValue(source, ['layout', 'objects', 'follower'], {
    kind: 'component',
    pcb: 'main',
    layer: 'main',
    placement: { at: [40, 0, 0] },
    envelopes: { body: { size: [12, 12], height: [0, 2] } },
  });
  await open(page, source);
  const toolbar = page.getByRole('toolbar', { name: 'Snapping', exact: true });
  await toolbar
    .getByRole('button', { name: 'Snapping settings', exact: true })
    .click();
  await toolbar.getByRole('checkbox', { name: 'Center guides' }).uncheck();
  await toolbar.getByRole('checkbox', { name: 'Increment grid' }).uncheck();
  await expect(toolbar.getByLabel('Snap edge gap')).toHaveValue('2');
  await expect(
    page.getByRole('button', { name: 'Canvas options', exact: true })
  ).toHaveCount(0);
  await toolbar.getByRole('button', { name: 'Snapping', exact: true }).click();
  await expect(
    toolbar.getByRole('button', { name: 'Snap increment 0.25u' })
  ).toBeDisabled();
  await toolbar.getByRole('button', { name: 'Snapping', exact: true }).click();
  await page.screenshot({ path: capture('desktop-snapping') });
  await toolbar
    .getByRole('button', { name: 'Snapping settings', exact: true })
    .click();
  const points = await page
    .getByRole('group', { name: 'Interactive board layout' })
    .evaluate((svg) => {
      const matrix = (svg as SVGSVGElement).getScreenCTM()!;
      return [
        [40, 0],
        [17, 0],
      ].map(([x, y]) => {
        const p = new DOMPoint(x, y).matrixTransform(matrix);
        return { x: p.x, y: p.y };
      });
    });
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await page.mouse.move(points[1].x, points[1].y, { steps: 12 });
  await page.mouse.up();
  const keep = page.getByRole('button', {
    name: /Keep relationship · Edge offset/,
  });
  await expect(keep).toBeEnabled();
  expect(
    parse(await readSource(page)).layout.objects.follower.placement.ref
  ).toBeUndefined();
  await keep.click();
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects.follower.placement.ref
    )
    .toBe('fingers_c1_r1');
  await page
    .getByRole('button', { name: 'Select Objects', exact: true })
    .click();
  const key = page.locator('[data-object="fingers_c1_r1"]');
  await key.click();
  await key.press('ArrowRight');
  await expect
    .poll(
      async () =>
        resolve(parse(await readSource(page))).objects.follower.position[0]
    )
    .toBeCloseTo(17 + 19.05 / 4);
});

test('shares mechanical stack editing between Case and Design setup', async ({
  page,
}) => {
  await open(page, board());
  const designer = await openCase(page);
  await designer.getByRole('button', { name: 'Mounting', exact: true }).click();
  await designer.getByLabel('PCB to plate gap', { exact: true }).fill('4');
  await designer.getByLabel('PCB to plate gap', { exact: true }).press('Enter');
  await expect
    .poll(async () => parse(await readSource(page)).units.plate_gap)
    .toBe(4);
  await expect(
    designer.getByLabel('Plate underside height', { exact: true })
  ).toContainText('11.6 mm');
  await designer
    .getByRole('region', { name: 'Stack dimensions', exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: capture('desktop-case-stack') });
  await studio(page)
    .getByRole('navigation', { name: 'Design workflow' })
    .getByRole('button', { name: 'Design', exact: true })
    .click();
  await page.getByRole('button', { name: 'Design setup', exact: true }).click();
  await page.getByRole('tab', { name: 'Stackup', exact: true }).click();
  await expect(
    page.getByLabel('Plate underside height', { exact: true })
  ).toContainText('11.6 mm');
  await page.getByLabel('PCB to plate gap', { exact: true }).fill('5.4');
  await page.getByLabel('PCB to plate gap', { exact: true }).press('Enter');
  await page
    .getByRole('region', { name: 'Stack dimensions', exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: capture('desktop-setup-stack') });
  await page.getByRole('button', { name: 'Apply setup', exact: true }).click();
  await openCase(page);
  await designer.getByRole('button', { name: 'Mounting', exact: true }).click();
  await expect(
    designer.getByLabel('Plate underside height', { exact: true })
  ).toContainText('13 mm');
});

for (const width of [320, 390]) {
  test(`keeps consolidated controls usable at ${width}px`, async ({ page }) => {
    await open(page, board(), width);
    const close = page.getByRole('button', {
      name: 'Close inspector',
      exact: true,
    });
    if (await close.isVisible()) {
      await close.click();
    }
    const toolbar = page.getByRole('toolbar', {
      name: 'Snapping',
      exact: true,
    });
    await toolbar
      .getByRole('button', { name: 'Snapping settings', exact: true })
      .click();
    const menu = await toolbar
      .getByRole('region', { name: 'Snapping settings', exact: true })
      .boundingBox();
    expect(menu!.x).toBeGreaterThanOrEqual(0);
    expect(menu!.x + menu!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: capture(`mobile-${width}-snapping`) });
    await toolbar
      .getByRole('button', { name: 'Snapping settings', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Design setup', exact: true })
      .click();
    await page.getByRole('tab', { name: 'Key assembly', exact: true }).click();
    await expect(
      page
        .getByRole('img', { name: 'Key assembly footprint editor' })
        .locator('polygon')
        .first()
    ).toBeVisible();
    await page.screenshot({ path: capture(`mobile-${width}-assembly`) });
    await page.getByRole('tab', { name: 'Stackup', exact: true }).click();
    await page
      .getByRole('region', { name: 'Stack dimensions', exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ path: capture(`mobile-${width}-stack`) });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    if (await close.isVisible()) {
      await close.click();
    }
    await page
      .getByRole('button', { name: 'Select Objects', exact: true })
      .click();
    await page.locator('[data-object="fingers_c1_r1"]').click();
    await page
      .getByRole('button', { name: 'Edit key assembly', exact: true })
      .click();
    const scope = page.getByLabel('Assembly scope');
    await expect(scope).toHaveValue('3');
    await expect(scope.locator('option')).toHaveCount(4);
    for (const value of ['0', '1', '2', '3']) {
      await scope.selectOption(value);
      await expect(scope).toHaveValue(value);
    }
    await scope.scrollIntoViewIfNeeded();
    await page.screenshot({ path: capture(`mobile-${width}-assembly-scope`) });

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  });
}

import { test, expect } from '@playwright/test';
import { parse } from 'yaml';
import { createBoard } from '../src/utils/boardDefaults';
import { addCluster, setValue } from '../src/utils/studioSource';
import { defaultSetup } from '../src/utils/designSetup';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { readSource, openInspector } from './utils/studio';

test.setTimeout(120000);
test('stages expressions and keycap dimensions without losing the canvas', async ({
  page,
}) => {
  const source = setValue(
    addCluster(
      createBoard({ ...defaultSetup(), diode: false }),
      'keys',
      'columns',
      { columns: 2, rows: 1 }
    ),
    ['meta', 'studio', 'openSetup'],
    false
  );
  await page.addInitScript(
    ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
    { key: CONFIG_LOCAL_STORAGE_KEY, source }
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./');
  const canvas = page.getByRole('group', { name: 'Interactive board layout' });
  await expect(page.locator('[data-object="keys_c1_r1"]')).toBeVisible();
  await page.locator('[data-object="keys_c1_r1"]').click();
  const box = await canvas.getAttribute('viewBox');
  const before = await readSource(page);
  await page.getByRole('button', { name: 'Design setup', exact: true }).click();
  const horizontal = page.getByLabel('Horizontal pitch', { exact: true });
  await horizontal.fill('19');
  await horizontal.press('Enter');
  const vertical = page.getByLabel('Vertical pitch', { exact: true });
  await vertical.fill('u - 2');
  await vertical.press('Enter');
  await expect(vertical).toHaveAccessibleDescription('Expression = 17 mm');
  await page.getByLabel('Keycap width', { exact: true }).fill('16');
  await page.getByLabel('Keycap width', { exact: true }).press('Enter');
  expect(await readSource(page)).toBe(before);
  expect(await canvas.getAttribute('viewBox')).toBe(box);
  await horizontal.fill('u + 1');
  await horizontal.press('Enter');
  await expect(horizontal).toHaveAttribute('aria-invalid', 'true');
  await horizontal.press('Escape');
  await expect(horizontal).toHaveValue('19');
  await page.getByRole('button', { name: 'Apply setup', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Design setup panel' })
  ).toBeHidden();
  await expect
    .poll(async () => parse(await readSource(page)).units.v)
    .toBe('u - 2');
  expect(parse(await readSource(page)).meta.studio.setup.keycap[0]).toBe(16);
  expect(Object.keys(parse(await readSource(page)).layout.objects)).toEqual(
    Object.keys(parse(before).layout.objects)
  );
  expect(await canvas.getAttribute('viewBox')).toBe(box);
  await page.getByRole('button', { name: /Undo/ }).click();
  await expect.poll(() => readSource(page)).toBe(before);
});

test('selects a distance target on the canvas and preserves its position', async ({
  page,
}) => {
  let source = setValue(
    createBoard({ ...defaultSetup(), diode: false }),
    ['meta', 'studio', 'openSetup'],
    false
  );
  source = setValue(source, ['layout', 'objects'], {
    target: {
      kind: 'component',
      pcb: 'main',
      layer: 'main',
      label: 'Target',
      envelopes: { body: { size: [8, 8], height: [0, 3] } },
    },
    follower: {
      kind: 'component',
      pcb: 'main',
      layer: 'main',
      label: 'Encoder',
      placement: { at: [30, 0, 0] },
      envelopes: { body: { size: [8, 8], height: [0, 5] } },
    },
  });
  await page.addInitScript(
    ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
    { key: CONFIG_LOCAL_STORAGE_KEY, source }
  );
  await page.goto('./');
  await page.locator('[data-object="follower"]').click();
  await openInspector(page);
  await page.getByLabel('Center distance', { exact: true }).fill('u');
  await page.getByLabel('Center distance', { exact: true }).press('Enter');
  await page.getByRole('button', { name: 'Set distance', exact: true }).click();
  await page
    .getByRole('button', { name: 'Align to Target', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        Object.values(parse(await readSource(page)).layout.constraints || {})
          .length
    )
    .toBe(1);
  const after = parse(await readSource(page));
  expect(Object.values(after.layout.constraints)[0]).toMatchObject({
    type: 'distance',
    refs: ['target.center', 'follower.center'],
    value: 'u',
  });
  expect(after.layout.objects.target.placement).toBeUndefined();
  await page
    .getByRole('button', { name: 'Snapping settings', exact: true })
    .click();
  await page.getByRole('button', { name: 'Footprint origins' }).click();
  await expect(
    page.getByRole('button', { name: 'Center guides' })
  ).toHaveAttribute('aria-pressed', 'true');
});

test('keeps the narrow snapping menu above camera controls', async ({
  page,
}) => {
  const source = setValue(
    createBoard(),
    ['meta', 'studio', 'openSetup'],
    false
  );
  await page.addInitScript(
    ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
    { key: CONFIG_LOCAL_STORAGE_KEY, source }
  );
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('./');
  await page
    .getByRole('button', { name: 'Snapping settings', exact: true })
    .click();
  await expect
    .poll(async () => {
      const menu = await page
        .getByRole('toolbar', { name: 'Snapping', exact: true })
        .getByRole('region', { name: 'Snapping settings', exact: true })
        .boundingBox();
      const view = await page
        .getByRole('button', { name: 'Zoom in', exact: true })
        .boundingBox();
      return menu!.y + menu!.height <= view!.y;
    })
    .toBe(true);
});

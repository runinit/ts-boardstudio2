import { writeFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { parse } from 'yaml';
import { addCluster, addOutline } from '../src/utils/studioSource';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { openInspector, readSource } from './utils/studio';

test.setTimeout(120000);
const RESPONSE_DELAY_MS = 2000;
const initial = addOutline(
  addCluster(
    'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
    'fingers',
    'columns',
    { columns: 7, rows: 5 }
  )
);
const canvas = (page: Page) =>
  page.getByRole('group', { name: 'Interactive board layout' });
const outline = (page: Page) =>
  canvas(page).locator(
    ':scope > g[transform="scale(1,-1)"][pointer-events="none"]'
  );

async function visibleOutline(page: Page) {
  // Horizontal SVG segments have zero-height bounds; inspect their enclosing drawing.
  await expect(outline(page)).toBeVisible();
  await expect(outline(page).locator('polyline').first()).toHaveAttribute(
    'points',
    /[-\d.]+,[-\d.]+/
  );
}

async function snapMillimeter(page: Page) {
  const snapping = page.getByRole('toolbar', { name: 'Snapping' });
  await snapping
    .getByRole('button', { name: 'Snapping settings', exact: true })
    .click();
  await snapping.getByLabel('Custom snap increment').fill('1');
  await snapping
    .getByRole('button', { name: 'Snapping settings', exact: true })
    .click();
}

async function open(page: Page, source = initial) {
  await page.addInitScript(
    ({ key, source }) => {
      localStorage.setItem(key, JSON.stringify(source));
      const state = window as Window & {
        studioDelay: number;
        studioRequests: number;
      };
      state.studioDelay = 0;
      state.studioRequests = 0;
      const NativeWorker = window.Worker;
      window.Worker = class extends NativeWorker {
        constructor(url: string | URL, options?: WorkerOptions) {
          super(url, options);
          let handler: ((event: MessageEvent) => void) | null = null;
          let studio = false;
          const post = this.postMessage.bind(this);
          this.postMessage = ((
            message: { type?: string },
            ...args: unknown[]
          ) => {
            if (message.type === 'studio') {
              studio = true;
              state.studioRequests += 1;
            }
            post(message, ...(args as [Transferable[]]));
          }) as Worker['postMessage'];
          Object.defineProperty(this, 'onmessage', {
            get: () => handler,
            set: (next) => {
              handler = next;
            },
          });
          this.addEventListener('message', (event) => {
            if (!studio || !state.studioDelay) {
              handler?.(event);
              return;
            }
            const captured = handler;
            setTimeout(() => captured?.(event), state.studioDelay);
          });
        }
      };
    },
    { key: CONFIG_LOCAL_STORAGE_KEY, source }
  );
  await page.goto('./');
  await expect(
    page.getByRole('checkbox', { name: 'Automatic outline' })
  ).toBeEnabled();
  await visibleOutline(page);
  await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0);
}

test('persists rapid moves through delayed analysis, undo and reload', async ({
  page,
}) => {
  await open(
    page,
    addOutline(
      addCluster(
        'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
        'single',
        'columns',
        { columns: 1, rows: 1 }
      )
    )
  );
  await snapMillimeter(page);
  await page.evaluate((delay) => {
    (window as Window & { studioDelay: number }).studioDelay = delay;
  }, RESPONSE_DELAY_MS);
  await page
    .getByRole('button', { name: 'Select Objects', exact: true })
    .click();
  const key = page.getByRole('button', {
    name: 'Select single_c1_r1',
    exact: true,
  });
  await key.click();
  const camera = await canvas(page).getAttribute('viewBox');
  const position = async () =>
    parse(await readSource(page)).layout.objects.single_c1_r1.placement
      ?.override?.at;
  for (const [index, direction] of [
    'ArrowRight',
    'ArrowRight',
    'ArrowUp',
  ].entries()) {
    const pose = await key.locator('polygon').first().getAttribute('points');
    await key.press(direction);
    await expect(key.locator('polygon').first()).not.toHaveAttribute(
      'points',
      pose!
    );
    await expect
      .poll(position)
      .toEqual(index < 2 ? [index + 1, 0, 0] : [2, 1, 0]);
    await expect(
      page.getByText('Updating layout…', { exact: true })
    ).toBeVisible();
  }
  await expect(
    page.getByRole('button', { name: 'Inspector', exact: true })
  ).toHaveAttribute('aria-expanded', 'false');
  await expect(canvas(page)).toHaveAttribute('viewBox', camera!);
  await page.getByRole('button', { name: 'Undo project edit' }).click();
  await expect.poll(position).toEqual([2, 0, 0]);
  await page.getByRole('button', { name: 'Redo project edit' }).click();
  await expect.poll(position).toEqual([2, 1, 0]);
  await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0, {
    timeout: 60000,
  });
  await expect.poll(position).toEqual([2, 1, 0]);
  await visibleOutline(page);
  await page.reload();
  await expect(key).toBeVisible();
  await expect.poll(position).toEqual([2, 1, 0]);
});

test('keeps drags, nudges and inspector edits through delayed outline updates', async ({
  page,
}) => {
  await open(page);
  await openInspector(page);
  await snapMillimeter(page);
  await page.evaluate((delay) => {
    (window as Window & { studioDelay: number }).studioDelay = delay;
  }, RESPONSE_DELAY_MS);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByLabel('New matrix columns').fill('2');
  await page.getByLabel('New matrix rows').fill('2');
  await page.getByLabel('New item name').fill('matrix');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(
    page.getByRole('button', { name: /^Select (fingers|matrix)_c\d+_r\d+$/ })
  ).toHaveCount(39);
  await page.getByRole('button', { name: 'Inspector', exact: true }).click();
  await page.getByRole('button', { name: 'Fit layout', exact: true }).click();
  const camera = await canvas(page).getAttribute('viewBox');
  await page
    .getByRole('button', { name: 'Select Objects', exact: true })
    .click();
  // Use the outer key so each drag starts clear of neighboring keycaps.
  const key = page.getByRole('button', {
    name: 'Select matrix_c2_r1',
    exact: true,
  });
  await key.click();
  await expect(
    page.getByRole('button', { name: 'Inspector', exact: true })
  ).toHaveAttribute('aria-expanded', 'false');
  const start = parse(await readSource(page)).layout.objects.matrix_c2_r1
    .placement?.override?.at || [0, 0, 0];
  const pose = await key.locator('polygon').first().getAttribute('points');
  await key.press('ArrowRight');
  await expect(
    page.getByText('Updating layout…', { exact: true })
  ).toBeVisible();
  await expect(key.locator('polygon').first()).not.toHaveAttribute(
    'points',
    pose!
  );
  await key.press('ArrowRight');
  await key.press('ArrowUp');
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects.matrix_c2_r1.placement
          .override.at
    )
    .toEqual([start[0] + 2, start[1] + 1, start[2]]);
  await openInspector(page);
  const x = page
    .getByLabel('Design inspector')
    .getByLabel('X', { exact: true });
  await x.fill('8');
  await x.press('Tab');
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects.matrix_c2_r1.placement
          .override.at[0]
    )
    .toBe(8);
  await page.getByRole('button', { name: 'Inspector', exact: true }).click();
  await page.getByRole('button', { name: 'Snapping', exact: true }).click();
  let beforeLastMove: number[] = [];
  for (let index = 0; index < 2; index++) {
    beforeLastMove = parse(await readSource(page)).layout.objects.matrix_c2_r1
      .placement.override.at;
    const box = await key.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box!.x + box!.width / 2 + 8,
      box!.y + box!.height / 2
    );
    await page.mouse.up();
    await expect
      .poll(
        async () =>
          parse(await readSource(page)).layout.objects.matrix_c2_r1.placement
            .override.at[0]
      )
      .toBeGreaterThan(beforeLastMove[0]);
  }
  const edited = parse(await readSource(page)).layout.objects.matrix_c2_r1
    .placement.override.at;
  expect(edited[0]).toBeGreaterThan(8);
  await expect(canvas(page)).toHaveAttribute('viewBox', camera!);
  await page.getByRole('button', { name: 'Undo project edit' }).click();
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects.matrix_c2_r1.placement
          .override.at
    )
    .toEqual(beforeLastMove);
  await page.getByRole('button', { name: 'Redo project edit' }).click();
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects.matrix_c2_r1.placement
          .override.at
    )
    .toEqual(edited);
  await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0, {
    timeout: 60000,
  });
  expect(
    parse(await readSource(page)).layout.objects.matrix_c2_r1.placement.override
      .at
  ).toEqual(edited);
  await visibleOutline(page);
  await page.screenshot({
    path: test.info().outputPath('continuous-7x5-plus-2x2.png'),
  });
  await page.reload();
  await expect(key).toBeVisible();
  expect(
    parse(await readSource(page)).layout.objects.matrix_c2_r1.placement.override
      .at
  ).toEqual(edited);
});

test('freezes exact contours across reload and rebuilds while remaining frozen', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('checkbox', { name: 'Automatic outline' }).click();
  const frozen = parse(await readSource(page));
  expect(frozen.meta.studio.outline.auto).toBe(false);
  expect(
    frozen.designs.profiles.main_outline.snapshot.paths.length
  ).toBeGreaterThan(0);
  await page.reload();
  await expect(
    page.getByRole('checkbox', { name: 'Automatic outline' })
  ).not.toBeChecked();
  await page
    .getByRole('button', { name: 'Rebuild outline', exact: true })
    .click();
  await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0, {
    timeout: 60000,
  });
  expect(parse(await readSource(page)).meta.studio.outline.auto).toBe(false);
  await page.getByRole('checkbox', { name: 'Automatic outline' }).click();
  await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0, {
    timeout: 60000,
  });
  expect(
    parse(await readSource(page)).designs.profiles.main_outline.snapshot
  ).toBeUndefined();
});

test.afterEach(async ({ page }) => {
  await writeFile('/home/chris/projects/ts-boardstudio2/.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/after/continuous-capture/final-source.yaml', await readSource(page));
  await page.screenshot({ path: '/home/chris/projects/ts-boardstudio2/.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/after/continuous-capture/final.png' });
});

import { expect, test, type Page } from '@playwright/test';
import { parse } from 'yaml';
import { addCluster, addOutline } from '../src/utils/studioSource';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { readSource } from './utils/studio';

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

async function open(page: Page) {
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
    { key: CONFIG_LOCAL_STORAGE_KEY, source: initial }
  );
  await page.goto('./');
  await expect(
    page.getByRole('switch', { name: 'Automatic outline' })
  ).toBeEnabled();
  await expect(outline(page).locator('polyline').first()).toBeVisible();
  await expect(
    page.getByText('Updating outline…', { exact: true })
  ).toHaveCount(0);
}

test('keeps drags, nudges and inspector edits through delayed outline updates', async ({
  page,
}) => {
  await open(page);
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
  await page.getByRole('button', { name: 'Fit layout', exact: true }).click();
  const camera = await canvas(page).getAttribute('viewBox');
  await page
    .getByRole('button', { name: 'Select Objects', exact: true })
    .click();
  const key = page.getByRole('button', {
    name: 'Select matrix_c1_r1',
    exact: true,
  });
  await key.click();
  const start = parse(await readSource(page)).layout.objects.matrix_c1_r1
    .placement?.override?.at || [0, 0, 0];
  await key.press('ArrowRight');
  await key.press('ArrowRight');
  await key.press('ArrowUp');
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects.matrix_c1_r1.placement
          .override.at
    )
    .toEqual([start[0] + 2, start[1] + 1, start[2]]);
  const x = page
    .getByLabel('Design inspector')
    .getByLabel('X', { exact: true });
  await x.fill('8');
  await x.press('Tab');
  await expect
    .poll(
      async () =>
        parse(await readSource(page)).layout.objects.matrix_c1_r1.placement
          .override.at[0]
    )
    .toBe(8);
  await page
    .getByRole('button', { name: 'Snap to edges', exact: true })
    .click();
  for (let index = 0; index < 2; index++) {
    const box = await key.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box!.x + box!.width / 2 + 8,
      box!.y + box!.height / 2
    );
    await page.mouse.up();
  }
  const edited = parse(await readSource(page)).layout.objects.matrix_c1_r1
    .placement.override.at;
  expect(edited[0]).toBeGreaterThan(8);
  await expect(canvas(page)).toHaveAttribute('viewBox', camera!);
  await expect(
    page.getByText('Updating outline…', { exact: true })
  ).toHaveCount(0, { timeout: 60000 });
  expect(
    parse(await readSource(page)).layout.objects.matrix_c1_r1.placement.override
      .at
  ).toEqual(edited);
  await expect(outline(page).locator('polyline').first()).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('continuous-7x5-plus-2x2.png'),
  });
});

test('freezes exact contours across reload and rebuilds while remaining frozen', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('switch', { name: 'Automatic outline' }).click();
  const frozen = parse(await readSource(page));
  expect(frozen.meta.studio.outline.auto).toBe(false);
  expect(
    frozen.designs.profiles.main_outline.snapshot.paths.length
  ).toBeGreaterThan(0);
  await page.reload();
  await expect(
    page.getByRole('switch', { name: 'Automatic outline' })
  ).not.toBeChecked();
  await page
    .getByRole('button', { name: 'Rebuild outline', exact: true })
    .click();
  await expect(
    page.getByText('Updating outline…', { exact: true })
  ).toHaveCount(0, { timeout: 60000 });
  expect(parse(await readSource(page)).meta.studio.outline.auto).toBe(false);
  await page.getByRole('switch', { name: 'Automatic outline' }).click();
  await expect(
    page.getByText('Updating outline…', { exact: true })
  ).toHaveCount(0, { timeout: 60000 });
  expect(
    parse(await readSource(page)).designs.profiles.main_outline.snapshot
  ).toBeUndefined();
});

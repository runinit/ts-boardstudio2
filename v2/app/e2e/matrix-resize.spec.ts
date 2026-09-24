import { configureMatrix } from './matrix-setup';
import { expect, test, type Page } from '@playwright/test';

async function createMatrix(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Project', exact: true }).click();
  await page.getByRole('button', { name: 'New project' }).click();
  await configureMatrix(page);
  await page.getByRole('button', { name: 'Ghost key, row 1, column 1' }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(60);
}

async function drag(page: Page, target: ReturnType<Page['locator']>, dx: number): Promise<void> {
  const revision = Number((await page.locator('.wb-revision').textContent())?.slice(1));
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y, { steps: 4 });
  await page.mouse.up();
  // Resize the committed layout, not an intermediate drag preview.
  await expect(page.locator('.wb-revision')).toHaveText(`r${revision + 1}`);
}

async function shrinkRows(page: Page, expectedParts: number): Promise<void> {
  await page.getByRole('button', { name: 'Matrix', exact: true }).click();
  const rows = page.getByRole('spinbutton', { name: /Rows/ });

  await rows.fill('5');
  await rows.blur();
  await expect(rows).toHaveValue('5');
  await expect(page.locator('.wb-scene-part')).toHaveCount(expectedParts);
  await expect(page.getByRole('alert')).toHaveCount(0);
}

test('shrinks a matrix after staggering its last row', async ({ page }) => {
  await createMatrix(page);
  await drag(page, page.getByLabel('Stagger row 6'), 20);
  await shrinkRows(page, 50);

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(60);
});

test('shrinks a custom matrix after moving a key in the removed row', async ({ page }) => {
  await createMatrix(page);
  const columns = page.getByRole('spinbutton', { name: /Columns/ });

  await columns.fill('7');
  await columns.blur();
  await expect(page.locator('.wb-scene-part')).toHaveCount(84);

  await page.getByRole('button', { name: 'Key', exact: true, pressed: false }).click();
  await drag(page, page.getByRole('button', { name: /^SW42, MX switch/ }), 20);
  await shrinkRows(page, 70);
});

test('shrinks a custom matrix without losing a moved surviving key', async ({ page }) => {
  await createMatrix(page);
  const columns = page.getByRole('spinbutton', { name: /Columns/ });

  await columns.fill('7');
  await columns.blur();
  await expect(page.locator('.wb-scene-part')).toHaveCount(84);

  await page.getByRole('button', { name: 'Key', exact: true, pressed: false }).click();
  const key = page.getByRole('button', { name: /^SW1, MX switch/ });
  const before = await key.getAttribute('transform');
  await drag(page, key, 20);
  const moved = await key.getAttribute('transform');
  expect(moved).not.toBe(before);

  await shrinkRows(page, 70);
  await expect(key).toHaveAttribute('transform', moved!);
});

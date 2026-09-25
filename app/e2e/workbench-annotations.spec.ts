import { expect, test } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import { demoProject } from '../src/demo';

test('matrix members without switch metadata still have keycap overlays', async ({ page }) => {
  const doc = demoProject();
  const definition = doc.definitions.find((item) => item.id === doc.matrices[0].definitionId)!;
  definition.kind = 'connector';
  definition.name = 'Socket key fixture';
  delete definition.keycap;
  await page.goto('/');
  await page.getByRole('button', { name: 'Project', exact: true }).click();
  await page.locator('.wb-project-file-input').setInputFiles({ name: 'socket-keys.boardstudio', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'project.json': strToU8(JSON.stringify(doc)) })) });
  await expect(page.getByRole('button', { name: /^SW1, Socket key fixture/ })).toBeVisible();
  await expect(page.locator('.wb-keycap-overlay')).toHaveCount(15);
  await page.getByRole('button', { name: 'Hide Keycaps', exact: true }).click();
  await expect(page.locator('.wb-keycap-overlay')).toHaveCount(0);
});

test('existing half creates linked copies in one undo step without moving source keys', async ({ page }) => {
  const doc = demoProject();
  doc.name = 'Existing half fixture';
  doc.matrices[0].mirror = 'none';
  doc.definitions[0].name = 'Existing half key';
  await page.goto('/');
  await page.getByRole('button', { name: 'Project', exact: true }).click();
  await page.locator('.wb-project-file-input').setInputFiles({ name: 'half.boardstudio', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'project.json': strToU8(JSON.stringify(doc)) })) });
  await expect(page.getByRole('button', { name: /^SW1, Existing half key/ })).toBeVisible();
  await page.keyboard.press('Escape');
  const source = page.getByRole('button', { name: /^SW1, Existing half key/ });
  const before = await source.getAttribute('transform');
  await page.getByRole('button', { name: 'Add object', exact: true }).click();
  await page.getByRole('button', { name: /Mirror existing half/ }).click();
  await page.getByRole('button', { name: 'Create linked half', exact: true }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(30);
  await expect(page.getByRole('treeitem', { name: 'Left half', exact: true })).toBeVisible();
  await expect(page.getByRole('treeitem', { name: 'Right half', exact: true })).toBeVisible();
  await expect(page.locator('.wb-outline-shape:not(.is-hole)')).toHaveCount(2);
  await expect(source).toHaveAttribute('transform', before!);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(15);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(30);
  await page.reload();
  await expect(page.locator('.wb-scene-part')).toHaveCount(30);
});

test('transform handles are opt-in, and keys and components have independent visibility', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('treeitem', { name: /^Column 1/ }).click();
  await expect(page.getByRole('button', { name: 'Drag to splay', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Transform', exact: true }).click();
  await page.getByRole('button', { name: 'Splay', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Drag to splay', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Finish transform', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Drag to splay', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Hide Keys', exact: true }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show Keys', exact: true }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(15);
  await page.getByRole('button', { name: 'Hide Components', exact: true }).click();
  await expect(page.locator('.wb-scene-part')).toHaveCount(15);
});

test('add groups specialist hardware and stagger is an explicit keyboard-accessible tool', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add object', exact: true }).click();
  for (const category of ['Components', 'Controllers', 'Displays', 'Encoders']) {
    await expect(page.locator('.wb-add-category summary').filter({ hasText: category })).toBeVisible();
  }
  await expect(page.locator('.wb-add-part-results').getByText('MX switch', { exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('treeitem', { name: /^Column 1/ }).click();
  await page.getByRole('button', { name: 'Select column', exact: true }).click();
  await page.getByRole('button', { name: 'Transform', exact: true }).click();
  await page.getByRole('button', { name: 'Stagger', exact: true }).click();
  const key = page.locator('.wb-scene-part.is-selected').first();
  const before = await key.getAttribute('transform');
  await page.getByRole('button', { name: 'Drag to stagger', exact: true }).focus();
  await page.keyboard.press('ArrowUp');
  await expect(key).not.toHaveAttribute('transform', before!);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(key).toHaveAttribute('transform', before!);
});

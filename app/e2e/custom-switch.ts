import { expect, type Page } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import { demoProject } from '../src/demo';

export async function openCustomSwitchProject(page: Page) {
  const document = demoProject();
  const definition = document.definitions.find(item => item.id === document.matrices[0].definitionId)!;
  // These tests edit authored geometry/models, rather than generator parameters.
  delete definition.generator;
  const sourceId = definition.id;
  definition.id = 'fixture-switch';
  definition.name = 'Fixture switch';
  for (const part of document.parts) if (part.definitionId === sourceId) part.definitionId = definition.id;
  for (const matrix of document.matrices) if (matrix.definitionId === sourceId) matrix.definitionId = definition.id;
  await page.goto('/');
  await page.getByRole('button', { name: 'Project', exact: true }).click();
  await page.locator('.wb-project-file-input').setInputFiles({
    name: 'custom-switch.boardstudio', mimeType: 'application/zip',
    buffer: Buffer.from(zipSync({ 'project.json': strToU8(JSON.stringify(document)) })),
  });
  await expect(page.getByRole('button', { name: /^SW1, Fixture switch,/ })).toBeVisible();
}

import type { Page } from '@playwright/test';

export async function chooseScope(page: Page, kind: 'key' | 'row' | 'column' | 'matrix' | 'component') {
  const shortcut = page.getByRole('button', { name: `Select ${kind}`, exact: true });
  if (await shortcut.isVisible()) await shortcut.click();
  else {
    await page.getByRole('button', { name: /^Select:/ }).click();
    await page.getByRole('group', { name: 'Selection scope' }).getByRole('button', { name: kind === 'component' ? 'Part' : kind[0].toUpperCase() + kind.slice(1), exact: true }).click();
  }
}

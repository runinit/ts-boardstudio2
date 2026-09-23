import { expect, test } from '@playwright/test';
import { compileSetup, defaultSetup } from '../src/utils/designSetup';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';

const READY_TIMEOUT = 60000;
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
  { width: 844, height: 390 },
]) {
  test(`keeps outline controls clear of canvas tools at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(READY_TIMEOUT);
    await page.setViewportSize(viewport);
    const source = compileSetup({
      ...defaultSetup(),
      columns: 3,
      rows: 3,
      diode: false,
    });
    await page.addInitScript(
      ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
      { key: CONFIG_LOCAL_STORAGE_KEY, source }
    );
    await page.route('http://localhost:8400/**', (route) => route.abort());
    await page.goto('./');
    const canvas = page.getByRole('group', {
      name: 'Interactive board layout',
    });
    await expect(canvas).toBeVisible({ timeout: READY_TIMEOUT });
    await expect(
      page.getByRole('button', { name: 'Generate project', exact: true })
    ).toBeEnabled({ timeout: READY_TIMEOUT });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await page.screenshot({
      path: `../.omo/evidence/stitch-ui/workspace-${viewport.width}.png`,
    });
    const automatic = page.getByRole('checkbox', { name: 'Automatic outline' });
    const bar = page.getByLabel('Outline controls', { exact: true });
    const tools = page.getByRole('toolbar', { name: 'Canvas tools' });
    const barBox = await bar.boundingBox();
    const toolBox = await tools.boundingBox();
    expect(toolBox!.y).toBeGreaterThanOrEqual(barBox!.y + barBox!.height);
    await automatic.click({ timeout: 5000 });
    await expect(automatic).not.toBeChecked({ timeout: READY_TIMEOUT });
    await expect(
      page.getByRole('button', { name: 'Rebuild outline', exact: true })
    ).toBeVisible();
    await automatic.click();
    await expect(automatic).toBeChecked();
    if (viewport.width > 1050) {
      const project = await page
        .getByRole('button', { name: 'Projects', exact: true })
        .boundingBox();
      const stages = await page
        .getByRole('navigation', { name: 'Design workflow' })
        .boundingBox();
      expect(stages!.y).toBeLessThan(project!.y + project!.height);
      await expect(
        page.getByLabel('Project actions', { exact: true })
      ).toBeHidden();
      return;
    }
    const menu = page.getByRole('button', {
      name: 'Project actions',
      exact: true,
    });
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(
      page.getByRole('button', { name: 'Design setup', exact: true })
    ).toBeHidden();
    const projects = await page
      .getByRole('button', { name: 'Projects', exact: true })
      .boundingBox();
    const generate = await page
      .getByRole('button', { name: 'Generate project', exact: true })
      .boundingBox();
    expect(Math.abs(projects!.y - generate!.y)).toBeLessThanOrEqual(1);
    await menu.click();
    await page
      .getByRole('button', { name: 'Design setup', exact: true })
      .click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await page
      .getByRole('button', { name: 'Close inspector', exact: true })
      .click();
    await menu.click();
    await menu.press('Escape');
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  });
}

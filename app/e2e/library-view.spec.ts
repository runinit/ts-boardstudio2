import { expect, test } from '@playwright/test';
import { openLibrary, studio } from './utils/studio';

const evidenceRoot = '../.omo/evidence/library-view';

test.describe('Library view', () => {
  test('renders the reference workbench at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('./new');
    const workbench = await openLibrary(page);

    await expect(
      workbench
        .getByRole('navigation', { name: 'Design workflow' })
        .getByRole('button', { name: 'Library', exact: true })
    ).toHaveAttribute('aria-current', 'step');
    await expect(
      page.getByRole('complementary', { name: 'Footprint library catalog' })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Search footprints' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'All footprint types', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Footprint preview' })
    ).toBeVisible();
    await expect(
      page.getByRole('complementary', { name: 'Footprint inspector' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Pads & nets', exact: true })
    ).toBeVisible();

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(noOverflow).toBe(true);

    await page.screenshot({
      path: `${evidenceRoot}/desktop.png`,
      fullPage: true,
    });
  });

  test('supports library search, view, inspector, and responsive drawers', async ({
    page,
  }) => {
    await page.goto('./new');
    await openLibrary(page);

    const search = page.getByRole('textbox', { name: 'Search footprints' });
    await search.fill('mcu_nice_nano');
    const footprint = page.getByRole('button', {
      name: /ceoloide\/mcu_nice_nano/,
    });
    await expect(footprint).toBeVisible();
    await footprint.click();

    await page.getByRole('button', { name: '2D', exact: true }).click();
    await expect(page.getByRole('button', { name: '2D', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page.getByRole('button', { name: 'Pads & nets', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Pads & nets', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    for (const viewport of [
      { width: 375, height: 844, screenshot: 'mobile-375.png' },
      { width: 768, height: 1024, screenshot: 'tablet-768.png' },
    ]) {
      await page.setViewportSize(viewport);
      await expect(
        page.getByRole('button', { name: 'Open footprint catalog', exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Open footprint inspector', exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('region', { name: 'Footprint preview' })
      ).toBeVisible();
      const noOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(noOverflow).toBe(true);
      await page.screenshot({
        path: `${evidenceRoot}/${viewport.screenshot}`,
        fullPage: true,
      });
    }

    await expect(studio(page)).toBeVisible();
  });
});

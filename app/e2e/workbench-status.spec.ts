import { expect, test } from '@playwright/test';
import { compileSetup, defaultSetup } from '../src/utils/designSetup';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';

const READY_TIMEOUT = 60000;
for (const width of [1440, 320]) {
  test(`explains current layout and blocked downloads at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
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
    await page.goto('./');
    const status = page.getByRole('status', { name: 'Project status' });
    await expect(status).toContainText('Layout positions current', {
      timeout: READY_TIMEOUT,
    });
    const review = status.getByRole('button', {
      name: /^Review \d+ blockers?$/,
    });
    await review.click();
    const findings = page.getByRole('region', { name: 'Project findings' });
    await expect(findings).toContainText(
      'Resolve blockers before downloading PCB and outline files.'
    );
    await expect(findings).toContainText(
      'Case downloads have separate checks in Export.'
    );
    await expect(review).toHaveAttribute('aria-expanded', 'true');
    expect(
      await findings.evaluate(
        (element) => element.scrollWidth <= element.clientWidth
      )
    ).toBe(true);
    await findings.getByRole('button', { name: 'Close findings' }).click();
    await expect(review).toHaveAttribute('aria-expanded', 'false');
    await review.click();
    await findings
      .getByRole('button', {
        name: /Choose a controller before PCB review.*Open controller editor/,
      })
      .click();
    await expect(page.getByLabel('Component catalogue')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Inspector', exact: true })
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(findings).toBeHidden();
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await expect(
      page.getByText(/blockers? prevents? PCB and outline downloads/)
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Download PCB and outlines ZIP' })
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Download YAML' })
    ).toBeEnabled();
    await expect(review).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
}

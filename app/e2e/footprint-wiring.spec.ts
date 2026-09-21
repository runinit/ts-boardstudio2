import { expect, test } from '@playwright/test';
import { compileSetup, defaultSetup } from '../src/utils/designSetup';
import { setValue } from '../src/utils/studioSource';
import {
  CONFIG_LOCAL_STORAGE_KEY,
  MULTI_CONFIG_STORAGE_KEY,
} from '../src/context/constants';
import { openCode, openExport, readSource } from './utils/studio';

const TIMEOUT = 60000;
test('blocks a raw diode junction break and restores export after repair', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  // This bounded fixture isolates electrical readiness from the setup's physical qualification reminder.
  const clean = setValue(
    compileSetup({
      ...defaultSetup(),
      columns: 1,
      rows: 1,
      controller: 'promicro',
    }),
    ['meta', 'studio', 'findings'],
    []
  );
  const broken = setValue(
    clean,
    [
      'layout',
      'objects',
      'fingers_c1_r1_diode',
      'footprints',
      'main',
      'params',
      'from',
    ],
    'RAW_BREAK'
  );
  await page.addInitScript(
    ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
    {
      key: CONFIG_LOCAL_STORAGE_KEY,
      source: clean,
    }
  );
  await page.goto('./');
  await openExport(page);
  const download = page.getByRole('button', {
    name: 'Download PCB and outlines ZIP',
    exact: true,
  });
  await expect(download).toBeEnabled({ timeout: TIMEOUT });

  const edit = async (source: string) => {
    await page.evaluate(
      ({ key, value }) => {
        const stored = JSON.parse(localStorage.getItem(key) || 'null');
        if (!stored) {
          throw new Error('The multi-config state is not initialized.');
        }
        localStorage.setItem(
          key,
          JSON.stringify({
            ...stored,
            configs: stored.configs.map((config: { id: string }) =>
              config.id === stored.activeConfigId
                ? { ...config, config: value }
                : config
            ),
          })
        );
      },
      { key: MULTI_CONFIG_STORAGE_KEY, value: source }
    );
    await page.reload();
    await openCode(page);
  };
  await edit(broken);
  await expect.poll(() => readSource(page)).toContain('RAW_BREAK');
  await openExport(page);
  await expect(download).toBeDisabled();
  const status = page.getByRole('status', { name: 'Project status' });
  const design = page
    .getByRole('navigation', { name: 'Design workflow' })
    .getByRole('button', { name: 'Design', exact: true });
  await design.click();
  await expect(status).toContainText('Layout positions current', {
    timeout: TIMEOUT,
  });
  await openExport(page);
  await expect(download).toBeDisabled();
  await status.getByRole('button', { name: /^Review \d+ blockers?$/ }).click();
  const findings = page.getByRole('region', { name: 'Project findings' });
  await expect(findings).toContainText('RAW_BREAK');
  await page.screenshot({
    path: testInfo.outputPath('raw-wiring-blocked.png'),
    fullPage: true,
  });
  await findings.getByRole('button', { name: 'Close findings' }).click();

  await openCode(page);
  await edit(clean);
  await expect.poll(() => readSource(page)).not.toContain('RAW_BREAK');
  await openExport(page);
  await expect(download).toBeEnabled({ timeout: TIMEOUT });
  await design.click();
  await expect(status).toContainText('Layout positions current');
  await openExport(page);
  await expect(download).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath('raw-wiring-repaired.png'),
    fullPage: true,
  });
});

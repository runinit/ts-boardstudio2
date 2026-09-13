import { expect, test } from '@playwright/test';
import { parse } from 'yaml';
import { studio, readSource } from './utils/studio';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`edits BHK rows and columns at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.goto('./import');
    await page.getByLabel('Load BHK example', { exact: true }).click();
    await expect(studio(page)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Select matrix_c4_r4', exact: true })
    ).toBeVisible();
    const before = parse(await readSource(page));
    await page
      .getByRole('button', { name: 'Select Rows', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Select matrix_c4_r4', exact: true })
      .click();
    if (
      await page.getByRole('button', { name: 'Inspector', exact: true }).count()
    ) {
      await page
        .getByRole('button', { name: 'Inspector', exact: true })
        .click();
    }
    await expect(
      page.getByRole('heading', { name: 'Row 2', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Add key in column 7' })
    ).toBeVisible();
    await page.getByLabel('Relative x', { exact: true }).fill('1');
    await page
      .getByRole('button', { name: 'Apply relative adjustment' })
      .click();
    await expect
      .poll(
        async () =>
          parse(await readSource(page)).layout.objects.matrix_c1_r4.placement
            ?.override?.at?.[0]
      )
      .toBe(1);
    const after = parse(await readSource(page));
    for (const [id, item] of Object.entries(before.layout.objects)) {
      expect(after.layout.objects[id].properties).toEqual(
        (item as { properties?: unknown }).properties
      );
    }
    expect(after.layout.objects.matrix_c7_r4).toBeUndefined();
    expect(after.layout.objects.matrix_c1_r3.placement).toBeUndefined();
    await page.getByRole('button', { name: 'Add key in column 7' }).click();
    await expect
      .poll(
        async () =>
          parse(await readSource(page)).layout.objects.matrix_c7_r4?.cell
      )
      .toEqual(['c7', 'r4']);
    const filled = parse(await readSource(page)).layout.objects.matrix_c7_r4;
    expect(filled.properties).toMatchObject({
      column_net: 'c7',
      row_net: 'r4',
    });
    expect(filled.pcb).toBe('bhk_pcb');
    await page
      .getByRole('button', { name: 'Undo project edit', exact: true })
      .click();
    await expect
      .poll(
        async () => parse(await readSource(page)).layout.objects.matrix_c7_r4
      )
      .toBeUndefined();
    await page
      .getByRole('button', { name: 'Undo project edit', exact: true })
      .click();
    await expect
      .poll(async () => parse(await readSource(page)).layout.objects)
      .toEqual(before.layout.objects);
    if (
      await page
        .getByRole('button', { name: 'Close inspector', exact: true })
        .count()
    ) {
      await page
        .getByRole('button', { name: 'Close inspector', exact: true })
        .click();
    }
    await page
      .getByRole('button', { name: 'Select Columns', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Select matrix_c3_r4', exact: true })
      .click();
    if (
      await page.getByRole('button', { name: 'Inspector', exact: true }).count()
    ) {
      await page
        .getByRole('button', { name: 'Inspector', exact: true })
        .click();
    }
    await expect(
      page.getByLabel('Column stagger', { exact: true })
    ).toHaveValue('ky / 4');
    await page.screenshot({
      path: test.info().outputPath(`bhk-matrix-${viewport.width}.png`),
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  });
}

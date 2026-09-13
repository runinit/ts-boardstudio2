import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import JSZip from 'jszip';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { openCode, openExport, readSource, studio } from './utils/studio';

const source = `schema: ergogen/v1
layout:
  objects:
    reset:
      kind: component
      pcb: main
      envelopes:
        body: {size: [6, 4], height: [0, 3]}
      footprints:
        main:
          what: infused-kim/switch_reset
          params: {from: GND, to: RESET}
designs:
  regions:
    main: {shape: {size: [30, 30]}}
  profiles:
    main: {from: regions.main}
pcbs:
  main: {profile: profiles.main}
`;

test('blocks export for an incompatible trackpoint extension', async ({
  page,
}) => {
  const incompatible = source
    .replace('infused-kim/switch_reset', 'infused-kim/trackpoint_mount')
    .replace('params: {from: GND, to: RESET}', 'params: {drill: 3.5}')
    .replace('size: [30, 30]', 'size: [90, 90]');

  await page.addInitScript(
    ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
    { key: CONFIG_LOCAL_STORAGE_KEY, source: incompatible }
  );
  await page.goto('./');
  await expect(studio(page)).toBeVisible();
  const view = await openExport(page);

  await expect(
    studio(page)
      .getByRole('alert')
      .filter({
        hasText: 'The bundled trackpoint extension requires a center drill',
      })
      .first()
  ).toBeVisible({ timeout: 30000 });
  await expect(
    view.getByRole('button', {
      name: 'Download PCB and outlines ZIP',
      exact: true,
    })
  ).toBeDisabled();
});

test('invalidates and restores export after a model compatibility edit', async ({
  page,
}, testInfo) => {
  const valid = source
    .replace('infused-kim/switch_reset', 'infused-kim/trackpoint_mount')
    .replace('params: {from: GND, to: RESET}', 'params: {drill: 5.5}')
    .replace('size: [30, 30]', 'size: [90, 90]');
  await page.addInitScript(
    ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
    { key: CONFIG_LOCAL_STORAGE_KEY, source: valid }
  );
  await page.goto('./');
  const view = await openExport(page);
  const downloadButton = view.getByRole('button', {
    name: 'Download PCB and outlines ZIP',
    exact: true,
  });
  await expect(downloadButton).toBeEnabled({ timeout: 30000 });
  await openCode(page);

  const edit = async (source: string) => {
    const lines = source.split('\n');
    const parameterLine = lines.findIndex((line) => line.includes('params:'));
    const editor = page.getByRole('textbox', { name: 'Editor content' });
    await editor.focus();
    await editor.press('ControlOrMeta+Home');
    // Edit only the parameter line so Monaco preserves the surrounding YAML.
    for (let line = 0; line < parameterLine; line++) {
      await editor.press('ArrowDown');
    }
    await editor.press('Home');
    await editor.press('Shift+End');
    await page.keyboard.insertText(lines[parameterLine].trimStart());
    await expect.poll(() => readSource(page)).toBe(source);
  };

  await edit(valid.replace('drill: 5.5', 'drill: 3.5'));
  const compatibilityError = studio(page)
    .getByRole('alert')
    .filter({
      hasText: 'The bundled trackpoint extension requires a center drill',
    })
    .first();
  await expect(compatibilityError).toBeVisible({ timeout: 30000 });
  await openExport(page);
  await expect(downloadButton).toBeDisabled();
  await expect(
    view.getByRole('button', { name: 'main · KiCad PCB', exact: true })
  ).toBeDisabled();

  // Recovery must export the corrected revision, not the retained old board.
  const corrected = valid.replace('drill: 5.5', 'drill: 6');
  await openCode(page);
  await edit(corrected);
  await expect(compatibilityError).toHaveCount(0);
  await openExport(page);
  await expect(downloadButton).toBeEnabled({ timeout: 30000 });
  const downloading = page.waitForEvent('download');
  await downloadButton.click();
  const download = await downloading;
  const output = testInfo.outputPath('corrected-model.zip');
  await download.saveAs(output);
  const archive = await JSZip.loadAsync(readFileSync(output));
  const pcb = await archive
    .file('outputs/pcbs/main.kicad_pcb')!
    .async('string');
  expect(pcb).toContain('(drill 6)');
  expect(pcb).not.toContain('(drill 5.5)');
});

for (const sample of [
  {
    namespace: 'koktoh',
    model: 'Choc_V2_Red.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/switch_choc_v1_v2')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {from: GND, to: RESET, choc_v1_support: false, choc_v2_support: true}'
      ),
    excludedModel: 'Choc_V1_Keycap_MBK_Black_1u.step',
  },
  {
    namespace: 'infused-kim',
    model:
      'trackpoint/TP_Red_T460S_platform_z_offset_+0.0_pcb_offset_-2.0.step',
    source: source
      .replace('infused-kim/switch_reset', 'infused-kim/trackpoint_mount')
      .replace('params: {from: GND, to: RESET}', 'params: {}')
      .replace('size: [30, 30]', 'size: [90, 90]'),
  },
  {
    namespace: 'infused-kim',
    model: 'Choc_V1_Keycap_MBK_Black_1u.step',
    source: source
      .replace('infused-kim/switch_reset', 'infused-kim/choc')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {from: GND, to: RESET, hotswap: false, solder: true}'
      ),
    excludedModel: 'Choc_V1_Hotswap.step',
  },
  {
    namespace: 'gdek',
    model: 'KS33.stp',
    source: source.replace(
      'infused-kim/switch_reset',
      'ceoloide/switch_gateron_ks27_ks33'
    ),
  },
  {
    namespace: 'kicad',
    model: 'PinSocket_2x12_W15.24mm_Vertical.step',
    source: source
      .replace('infused-kim/switch_reset', 'infused-kim/nice_nano_pretty')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {mcu_3dmodel_side: B}'
      )
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    namespace: 'kicad',
    model: 'PinSocket_1x05_P2.54mm_Vertical.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/display_nice_view')
      .replace('params: {from: GND, to: RESET}', 'params: {reversible: true}')
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    namespace: 'tsuki',
    model: 'nrf52840.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/mcu_supermini_nrf52840')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {reversible: true, reverse_mount: true, include_extra_pins: true, only_required_jumpers: true}'
      )
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  { namespace: 'infused-kim', model: 'Switch_Reset.step', source },
  {
    namespace: 'kiswitch',
    model: 'SW_Cherry_MX_PCB.stp',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/switch_mx')
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    namespace: 'infused-kim',
    model: 'Choc_V1_Switch.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/switch_choc_v1_v2')
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    namespace: 'infused-kim',
    model: 'Nice_Nano_V2.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/mcu_nice_nano')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {reverse_mount: true}'
      )
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    namespace: 'kicad',
    model: 'Panasonic_EVQPUL_EVQPUC.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/reset_switch_smd_side')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {include_bosses: true}'
      ),
  },
  {
    namespace: 'foostan',
    model: 'OLED-Module-with-Pins.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/display_ssd1306')
      .replace('params: {from: GND, to: RESET}', 'params: {}')
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    namespace: 'keebio',
    model: 'SK6812MINI-E v1.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/led_sk6812mini-e')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {P2: DATA_OUT, P4: DATA_IN}'
      ),
  },
]) {
  const modelPath = `boardstudio/${sample.namespace}/${sample.model}`;
  test(`exports a ${sample.namespace}/${sample.model} default model without manual import`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
      { key: CONFIG_LOCAL_STORAGE_KEY, source: sample.source }
    );
    await page.goto('./');
    await expect(studio(page)).toBeVisible();
    const view = await openExport(page);
    const button = view.getByRole('button', {
      name: 'Download PCB and outlines ZIP',
      exact: true,
    });
    await expect(button).toBeEnabled({ timeout: 30000 });
    const downloading = page.waitForEvent('download');
    await button.click();
    const download = await downloading;
    const output = testInfo.outputPath('default-model.zip');
    await download.saveAs(output);
    const archive = await JSZip.loadAsync(readFileSync(output));
    const pcb = await archive
      .file('outputs/pcbs/main.kicad_pcb')!
      .async('string');
    expect(pcb).toContain('${KIPRJMOD}/models/' + modelPath);
    if ('excludedModel' in sample) {
      expect(pcb).not.toContain(sample.excludedModel);
      expect(
        Object.keys(archive.files).some((name) =>
          name.endsWith(sample.excludedModel)
        )
      ).toBe(false);
    }
    const model = archive.file('outputs/pcbs/models/' + modelPath);
    expect(model).not.toBeNull();
    expect(await model!.async('string')).toContain('ISO-10303-21;');
    expect(
      archive.file(`assets/boardstudio/${sample.namespace}/LICENSE`)
    ).not.toBeNull();
    expect(await model!.async('string')).toBe(
      readFileSync(`public/footprint-models/${modelPath}`, 'utf8')
    );
  });
}

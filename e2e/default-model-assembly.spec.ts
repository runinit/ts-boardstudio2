import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
import { openCase, studio } from './utils/studio';

const WORKER_TIMEOUT_MS = 180000;
test.setTimeout(240000);

const source = `schema: ergogen/v1
layout:
  layers:
    electronics: {surface: pcb.main.top}
  objects:
    reset:
      kind: component
      layer: electronics
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
  assemblies:
    case:
      preset: enclosure
      profile: profiles.main
      board: {source: generated, name: main}
      pcb_z: 15
      height: 40
      plate_z: 30
      mounting: bottom
      ledge: {width: 2, thickness: 2}
pcbs:
  main: {profile: profiles.main}
`;

for (const sample of [
  {
    name: 'trackpoint',
    model: 'boardstudio/infused-kim/trackpoint/TP_Cap_Red_T460S.step',
    count: 3,
    source: source
      .replace('infused-kim/switch_reset', 'infused-kim/trackpoint_mount')
      .replace('params: {from: GND, to: RESET}', 'params: {tp_3dmodel_side: F}')
      .replace('size: [30, 30]', 'size: [90, 90]'),
  },
  {
    name: 'Choc-solder',
    model: 'boardstudio/infused-kim/Choc_V1_Keycap_MBK_Black_1u.step',
    count: 2,
    source: source
      .replace('infused-kim/switch_reset', 'infused-kim/choc')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {from: GND, to: RESET, hotswap: false, solder: true}'
      ),
  },
  {
    name: 'KS33',
    model: 'boardstudio/gdek/KS33.stp',
    source: source.replace(
      'infused-kim/switch_reset',
      'ceoloide/switch_gateron_ks27_ks33'
    ),
  },
  {
    name: 'infused-nano',
    model: 'boardstudio/infused-kim/Nice_Nano_V2.step',
    count: 3,
    source: source
      .replace('infused-kim/switch_reset', 'infused-kim/nice_nano_pretty')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {mcu_3dmodel_side: B}'
      )
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    name: 'infused-niceview',
    model: 'boardstudio/infused-kim/Nice_View.step',
    count: 3,
    source: source
      .replace('infused-kim/switch_reset', 'infused-kim/nice_view')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {reverse: true, display_3dmodel_side: B}'
      )
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    name: 'niceview',
    model: 'boardstudio/infused-kim/Nice_View.step',
    count: 3,
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/display_nice_view')
      .replace('params: {from: GND, to: RESET}', 'params: {reversible: true}')
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
  {
    name: 'reset',
    model: 'boardstudio/infused-kim/Switch_Reset.step',
    volume: 12.5794419,
    source,
  },
  {
    name: 'Supermini',
    model: 'boardstudio/tsuki/nrf52840.step',
    source: source
      .replace('infused-kim/switch_reset', 'ceoloide/mcu_supermini_nrf52840')
      .replace(
        'params: {from: GND, to: RESET}',
        'params: {reversible: true, reverse_mount: true}'
      )
      .replace('size: [30, 30]', 'size: [50, 50]'),
  },
]) {
  test(`builds a native assembly from the default ${sample.name} model`, async ({
    page,
  }) => {
    const file = readdirSync('dist/assets').find((name) =>
      /^ergogen\.worker-.*\.js$/.test(name)
    );
    expect(file).toBeTruthy();
    await page.goto('./');
    const result = await page.evaluate(
      ({ file, source, timeout }) =>
        new Promise<{
          error?: string;
          models?: { frame?: number[]; path: string }[];
          volume?: number;
          meshBytes?: number;
        }>((resolve, reject) => {
          const worker = new Worker(new URL(`assets/${file}`, location.href), {
            type: 'module',
          });
          const timer = setTimeout(() => {
            worker.terminate();
            reject(new Error('Native model generation timed out'));
          }, timeout);
          worker.onerror = (event) => {
            clearTimeout(timer);
            worker.terminate();
            reject(new Error(event.message));
          };
          worker.onmessage = ({ data }) => {
            clearTimeout(timer);
            worker.terminate();
            const solid = data.results?.solids?.case_components_native_reset;
            resolve({
              error: data.error,
              models:
                data.results?.designs?.boards?.case?.components?.[0]?.models,
              volume: solid?.volume,
              meshBytes: solid?.stl?.byteLength,
            });
          };
          worker.postMessage({
            type: 'generate',
            inputConfig: source,
            assets: {},
            requestId: 'default-model-test',
          });
        }),
      { file, source: sample.source, timeout: WORKER_TIMEOUT_MS }
    );
    expect(result.error).toBeUndefined();
    expect(result.models).toHaveLength('count' in sample ? sample.count : 1);
    expect(result.models![0].frame).toHaveLength(16);
    expect(result.models![0].path).toContain(sample.model);
    if (sample.name === 'Choc-solder') {
      expect(result.models!.map((model) => model.path).join(' ')).not.toContain(
        'Hotswap'
      );
    }
    expect(result.volume).toBeGreaterThan(0);
    if ('volume' in sample) {
      // Compare the imported solid, not the fallback rectangular envelope.
      expect(result.volume).toBeCloseTo(sample.volume, 4);
    }
    expect(result.meshBytes).toBeGreaterThan(84);
  });
  test(`renders the default ${sample.name} assembly`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1487, height: 1058 });
    await page.addInitScript(
      ({ key, source }) => localStorage.setItem(key, JSON.stringify(source)),
      { key: CONFIG_LOCAL_STORAGE_KEY, source: sample.source }
    );
    await page.goto('./');
    await expect(studio(page)).toBeVisible();
    const designer = await openCase(page);
    await page
      .getByRole('button', { name: 'Generate project', exact: true })
      .click();
    await expect(
      designer.getByRole('status').filter({ hasText: /Current geometry/ })
    ).toBeVisible({ timeout: WORKER_TIMEOUT_MS });
    await designer
      .getByRole('button', { name: 'exploded', exact: true })
      .click();
    await expect(designer.getByLabel('3D assembly preview')).toHaveAttribute(
      'data-rendered',
      'true'
    );
    for (const name of ['Case shell', 'Top frame', 'Plate', 'PCB']) {
      await designer
        .getByRole('button', { name: `Hide ${name}`, exact: true })
        .click();
    }
    await page.mouse.move(0, 0);
    await page.screenshot({
      path: testInfo.outputPath('default-assembly.png'),
    });
  });
}

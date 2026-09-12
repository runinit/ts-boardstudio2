// Compare emitted defaults with actual KiCad-exported pad and terminal solids.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const engine = require('ergogen');
const library = path.resolve(
  process.env.BOARDSTUDIO_FOOTPRINTS || 'vendor/boardstudio-footprints'
);

const cases = [
  ...[false, true].map((reversible) => ({
    name: 'switch_mx',
    namespace: 'kiswitch',
    asset: 'SW_Cherry_MX_PCB.stp',
    kind: `mx_solder_ceoloide_r${Number(reversible)}`,
    params: { reversible, hotswap: false, solder: true, from: 'input', to: 'output' },
  })),
  ...[false, true].map((reversible) => ({
    name: 'switch_choc_v1_v2',
    asset: 'Choc_V1_Switch.step',
    assets: ['Choc_V1_Keycap_MBK_Black_1u.step'],
    kind: `choc_solder_ceoloide_r${Number(reversible)}`,
    params: { reversible, hotswap: false, solder: true, from: 'input', to: 'output' },
  })),
  {
    name: 'choc',
    footprintNamespace: 'infused-kim',
    sideParam: 'switch_3dmodel_side',
    asset: 'Choc_V1_Switch.step',
    assets: ['Choc_V1_Keycap_MBK_Black_1u.step'],
    kind: 'choc_solder_infused',
    params: { reverse: true, hotswap: false, solder: true, from: 'input', to: 'output' },
  },
  {
    name: 'choc',
    footprintNamespace: 'infused-kim',
    sideParam: 'switch_3dmodel_side',
    sides: ['F'],
    modelSide: 'B',
    asset: 'Choc_V1_Switch.step',
    extra: 'Choc_V1_Hotswap.step',
    assets: ['Choc_V1_Keycap_MBK_Black_1u.step'],
    kind: 'choc_hotswap_infused_single',
    params: { reverse: false, from: 'input', to: 'output' },
  },
  {
    name: 'choc',
    footprintNamespace: 'infused-kim',
    sideParam: 'switch_3dmodel_side',
    modelSideMap: { F: 'B', B: 'F' },
    asset: 'Choc_V1_Switch.step',
    extra: 'Choc_V1_Hotswap.step',
    assets: ['Choc_V1_Keycap_MBK_Black_1u.step'],
    kind: 'choc_hotswap_infused',
    params: { reverse: true, from: 'input', to: 'output' },
  },
  ...[false, true].flatMap((mirror) =>
    [false, true].map((swap_pad_direction) => ({
      name: 'smd_0805',
      footprintNamespace: 'infused-kim',
      sideParam: 'component_3dmodel_side',
      asset: 'SMD_0805_Resistor.step',
      kind: `smd0805_custom_m${Number(mirror)}_s${Number(swap_pad_direction)}_2`,
      params: { components: 2, space: 0.8, mirror, swap_pad_direction },
    }))
  ),
  ...[1, 2, 6].map((components) => ({
    name: 'smd_0805',
    footprintNamespace: 'infused-kim',
    sideParam: 'component_3dmodel_side',
    asset: 'SMD_0805_Resistor.step',
    kind: `smd0805_${components}`,
    params: { components },
  })),
  ...[false, true].map((reverse) => ({
    name: 'switch_reset',
    footprintNamespace: 'infused-kim',
    asset: 'Switch_Reset.step',
    kind: `evq7_infused_r${Number(reverse)}`,
    params: { reverse, from: 'GND', to: 'RST' },
    modelSide: reverse ? 'B' : undefined,
  })),
  ...[false, true].map((reverse) => ({
    name: 'switch_power',
    footprintNamespace: 'infused-kim',
    asset: 'Switch_Power.step',
    kind: `power_infused_r${Number(reverse)}`,
    params: { reverse },
    modelSide: reverse ? 'B' : undefined,
  })),
  ...[false, true].map((include_tht) => ({
    name: 'diode',
    footprintNamespace: 'infused-kim',
    sideParam: 'diode_3dmodel_side',
    asset: 'Diode_1N4148W.step',
    kind: `diode_infused_${Number(include_tht)}`,
    params: { include_tht, from: 'anode', to: 'cathode' },
  })),
  ...[false, true].map((reverse) => ({
    name: 'conn_molex_pico_ezmate_1x02',
    footprintNamespace: 'infused-kim',
    asset: 'Molex_Ezmate_Pico_Socket_2pin.step',
    extra: 'Molex_Ezmate_Pico_Cable_2pin.step',
    kind: `molex2_infused_r${Number(reverse)}`,
    params: { reverse },
    modelSide: reverse ? 'F' : undefined,
  })),
  ...[false, true].map((reverse) => ({
    name: 'conn_molex_pico_ezmate_1x05',
    footprintNamespace: 'infused-kim',
    asset: 'Molex_Ezmate_Pico_Socket_5pin.step',
    extra: 'Molex_Ezmate_Pico_Cable_5pin.step',
    kind: `molex5_r${Number(reverse)}`,
    params: { reverse },
    modelSide: reverse ? 'F' : undefined,
  })),
  {
    name: 'nice_nano_pretty',
    footprintNamespace: 'infused-kim',
    sideParam: 'mcu_3dmodel_side',
    asset: 'Nice_Nano_V2.step',
    assets: ['PinHeader_2.54mm_2x-12.step', 'PinSocket_2.54mm_5mm_2x-12.step'],
    modelAssets: [
      { namespace: 'kicad', asset: 'PinSocket_2x12_W15.24mm_Vertical.step' },
    ],
    rotations: [0, 37, 90, 180, 270],
    kind: 'nano_infused_reverse',
    params: {},
  },
  ...[false, true].flatMap((reverse) =>
    [false, true].flatMap((jumpers_at_bottom) =>
      (reverse ? ['', 'B'] : ['']).map((display_3dmodel_side) => ({
        name: 'nice_view',
        footprintNamespace: 'infused-kim',
        asset: 'Nice_View.step',
        assets: ['PinHeader_2.54mm_1x-5.step'],
        modelAssets: [
          { namespace: 'kicad', asset: 'PinSocket_1x05_P2.54mm_Vertical.step' },
        ],
        kind: `nice_view_infused${display_3dmodel_side ? '_back' : ''}_r${Number(reverse)}_i${Number(jumpers_at_bottom)}`,
        params: { reverse, jumpers_at_bottom, display_3dmodel_side },
        modelSide: reverse ? display_3dmodel_side || 'F' : undefined,
      }))
    )
  ),
  ...[false, true].flatMap((reversible) =>
    [false, true].map((invert_jumpers_position) => ({
      name: 'display_nice_view',
      asset: 'Nice_View.step',
      assets: ['PinHeader_2.54mm_1x-5.step'],
      modelAssets: [
        { namespace: 'kicad', asset: 'PinSocket_1x05_P2.54mm_Vertical.step' },
      ],
      kind: `nice_view_r${Number(reversible)}_i${Number(invert_jumpers_position)}`,
      params: { reversible, invert_jumpers_position },
    }))
  ),
  ...[false, true].flatMap((reversible) =>
    [false, true].flatMap((hotswap_pads_same_side) =>
      [false, true].map((include_plated_holes) => ({
        name: 'switch_mx',
        namespace: 'kiswitch',
        asset: 'SW_Cherry_MX_PCB.stp',
        extra: 'SW_Hotswap_Kailh_MX.stp',
        kind: `mx_hotswap_r${Number(reversible)}_same${Number(hotswap_pads_same_side)}_plated${Number(include_plated_holes)}`,
        params: {
          from: 'input',
          to: 'output',
          reversible,
          hotswap_pads_same_side,
          include_plated_holes,
        },
      }))
    )
  ),
  ...[false, true].flatMap((reversible) =>
    [false, true].flatMap((hotswap_pads_same_side) =>
      [false, true].map((include_plated_holes) => ({
        name: 'switch_choc_v1_v2',
        asset: 'Choc_V1_Switch.step',
        extra: 'Choc_V1_Hotswap.step',
        kind: `choc_hotswap_r${Number(reversible)}_same${Number(hotswap_pads_same_side)}_plated${Number(include_plated_holes)}`,
        assets: ['Choc_V1_Keycap_MBK_Black_1u.step'],
        params: {
          from: 'input',
          to: 'output',
          reversible,
          hotswap_pads_same_side,
          include_plated_holes,
        },
      }))
    )
  ),
  ...[false, true].map((reverse_mount) => ({
    name: 'mcu_nice_nano',
    asset: 'Nice_Nano_V2.step',
    kind: reverse_mount ? 'nano_reverse' : 'nano_normal',
    params: { reverse_mount },
  })),
  ...[false, true].map((reversible) => ({
    name: 'battery_connector_jst_ph_2',
    asset: 'JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal.step',
    namespace: 'kicad',
    kind: reversible ? 'jst_reversible' : 'jst',
    params: { reversible, BAT_P: 'positive', BAT_N: 'negative' },
  })),
  { name: 'power_switch_smd_side', asset: 'Switch_Power.step', kind: 'power' },
  { name: 'diode_tht_sod123', asset: 'Diode_1N4148W.step', kind: 'diode' },
  {
    name: 'battery_connector_molex_pico_ezmate_1x02',
    asset: 'Molex_Ezmate_Pico_Socket_2pin.step',
    extra: 'Molex_Ezmate_Pico_Cable_2pin.step',
    kind: 'molex',
    params: { BAT_P: 'positive', BAT_N: 'negative' },
  },
  ...[true, false].map((reverse_mount) => ({
    name: 'led_sk6812mini-e',
    asset: 'SK6812MINI-E v1.step',
    namespace: 'keebio',
    kind: reverse_mount ? 'led_reverse' : 'led_normal',
    params: { P2: 'data_out', P4: 'data_in', reverse_mount },
  })),
  ...[
    { reversible: false, symmetric: false },
    { reversible: true, symmetric: false },
    { reversible: true, symmetric: true },
  ].map((params, index) => ({
    name: 'trrs_pj320a',
    asset: 'PJ-320A.step',
    namespace: 'keebio',
    kind: `trrs_${index}`,
    params,
  })),
  ...[false, true].map((reversible) => ({
    name: 'display_ssd1306',
    asset: 'OLED-Module-with-Pins.step',
    namespace: 'foostan',
    kind: reversible ? 'oled_reversible' : 'oled',
    params: { reversible },
  })),
  ...[false, true].map((include_bosses) => ({
    name: 'reset_switch_smd_side',
    asset: 'Panasonic_EVQPUJ_EVQPUA.step',
    extra: 'Panasonic_EVQPUL_EVQPUC.step',
    namespace: 'kicad',
    kind: include_bosses ? 'reset_bosses' : 'reset_plain',
    params: { include_bosses },
  })),
];
async function check(spec) {
  const { bindDefaults } = await import(
    pathToFileURL(path.join(library, 'src/defaultModels.mjs'))
  );
  const context = { module: { exports: {} } };
  vm.runInNewContext(
    bindDefaults(
      fs.readFileSync(
        path.join(
          library,
          spec.footprintNamespace === 'infused-kim' ? 'vendor/infused-kim' : '',
          `${spec.name}.js`
        ),
        'utf8'
      ),
      `${spec.footprintNamespace || 'ceoloide'}/${spec.name}`
    ),
    context
  );
  engine.inject('footprint', 'contact_qa', context.module.exports);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'model-contacts-'));
  try {
    const namespace = spec.namespace || 'infused-kim';
    const models = path.join(temporary, 'models/boardstudio', namespace);
    fs.mkdirSync(models, { recursive: true });
    for (const asset of [spec.asset, spec.extra, ...(spec.assets || [])].filter(
      Boolean
    )) {
      fs.copyFileSync(
        path.join(library, `vendor/${namespace}/3d_models/${asset}`),
        path.join(models, asset)
      );
    }
    for (const { namespace: source, asset } of spec.modelAssets || []) {
      const target = path.join(temporary, 'models/boardstudio', source, asset);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(
        path.join(library, 'vendor', source, '3d_models', asset),
        target
      );
    }
    for (const side of spec.sides || ['F', 'B']) {
      for (const rotate of spec.rotations || [0, 90]) {
        const result = await engine.process(
          {
            schema: 'ergogen/v1',
            layout: {
              objects: {
                part: {
                  kind: 'component',
                  pcb: 'main',
                  placement: { rotate },
                  footprints: {
                    part: {
                      what: 'contact_qa',
                      params: {
                        [spec.sideParam || 'side']: side,
                        ...(spec.params || { from: 'input', to: 'output' }),
                      },
                    },
                  },
                },
              },
            },
            designs: {
              regions: { main: { shape: { size: [20, 20] } } },
              profiles: { main: { from: 'regions.main' } },
            },
            pcbs: { main: { profile: 'profiles.main' } },
          },
          { debug: true }
        );
        const base = path.join(temporary, `${spec.kind}-${side}-${rotate}`);
        fs.writeFileSync(`${base}.kicad_pcb`, result.pcbs.main);
        fs.writeFileSync(
          `${base}.json`,
          JSON.stringify(engine.footprints.inspect(result.pcbs.main))
        );
        execFileSync('kicad-cli', [
          'pcb',
          'export',
          'step',
          '--force',
          '--no-board-body',
          '--include-pads',
          '--user-origin',
          '0x0mm',
          '-o',
          `${base}.step`,
          `${base}.kicad_pcb`,
        ]);
        process.stdout.write(
          execFileSync(
            'python',
            [
              path.join(__dirname, 'model-terminals.py'),
              `${base}.step`,
              spec.kind,
              String(rotate),
              spec.modelSideMap?.[side] || spec.modelSide || side,
            ],
            { encoding: 'utf8' }
          )
        );
      }
    }
  } finally {
    if (process.env.QA_KEEP_MODELS === '1') {
      console.log(`QA artifacts: ${temporary}`);
    } else {
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  }
}
(async () => {
  for (const spec of cases) {
    if (process.argv[2] && !spec.kind.startsWith(process.argv[2])) {
      continue;
    }
    await check(spec);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

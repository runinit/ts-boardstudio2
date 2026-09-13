import { stringify } from 'yaml';
import { defaultSetup, type DesignSetup } from './designSetup';
import { assemblyParts } from './keyAssembly';
import { applyScopeAssembly, scopeAssembly } from './assemblyScope';
import { getValue, setValue } from './studioSource';
import { syncBoardTopology } from './boardTopology';
import {
  ensurePitchUnits,
  pitchUnits,
  dimension,
  type Dimension,
} from './designUnits';

const BOARD_REVISION = 3;
const MECHANICAL_DEFAULTS = { pcb: 1.6, plate: 1.5, gap: 5.4 };
function setupPitch(setup: DesignSetup, units: Record<string, number> = {}) {
  const values = [setup.pitch, setup.pitchY ?? setup.pitch];
  return values.map((value, axis) => {
    const expression = setup.pitchExpressions?.[axis];
    if (
      expression !== undefined &&
      dimension(expression, { ...units, u: values[0], v: values[1] }) === value
    ) {
      return expression;
    }
    return axis === 1 && value === values[0] ? 'u' : value;
  });
}
export function createBoard(setup: DesignSetup = defaultSetup()): string {
  const boards = setup.topology === 'mirrored' ? ['left', 'right'] : ['main'];
  const pitch = setupPitch(setup);
  return stringify(
    {
      schema: 'ergogen/v1',
      meta: {
        name: setup.name,
        studio: {
          setupRevision: BOARD_REVISION,
          setup: structuredClone(setup),
          defaults: { pitch: ['u', 'v'] },
          templates: { [setup.template.name]: structuredClone(setup.template) },
          openSetup: true,
        },
      },
      units: {
        u: pitch[0],
        v: pitch[1],
        pcb_thickness: MECHANICAL_DEFAULTS.pcb,
        plate_thickness: MECHANICAL_DEFAULTS.plate,
        plate_gap: MECHANICAL_DEFAULTS.gap,
      },
      parts: assemblyParts(setup),
      layout: {
        objects: {},
        clusters: {},
        layers: Object.fromEntries(
          boards.map((id) => [id, { surface: `pcb.${id}.top` }])
        ),
      },
      pcbs: Object.fromEntries(
        boards.map((id) => [id, { thickness: 'pcb_thickness' }])
      ),
      designs: {
        regions: {},
        profiles: {},
        stackups: Object.fromEntries(
          boards.map((id) => [
            id,
            {
              pcb: id,
              plate: { thickness: 'plate_thickness', gap: 'plate_gap' },
              layers: {},
            },
          ])
        ),
      },
    },
    { lineWidth: 100 }
  );
}

export function setupFromSource(source: string): DesignSetup {
  const saved = getValue(source, ['meta', 'studio', 'setup']) as
    | Partial<DesignSetup>
    | undefined;
  const units = pitchUnits(source);
  const inherited = getValue(source, [
    'meta',
    'studio',
    'defaults',
    'pitch',
  ]) as Dimension[] | undefined;
  return {
    ...defaultSetup(),
    ...saved,
    ...scopeAssembly(source, { kind: 'board' }),
    pitch: dimension(inherited?.[0] ?? 'u', units),
    pitchY: dimension(inherited?.[1] ?? 'v', units),
    pitchExpressions: (inherited &&
    JSON.stringify(inherited) !== JSON.stringify(['u', 'v'])
      ? inherited
      : ['u', 'v'].map(
          (name) => getValue(source, ['units', name]) ?? units[name]
        )) as [Dimension, Dimension],
    keycap: getValue(source, [
      'parts',
      'key',
      'envelopes',
      'keycap',
      'size',
    ]) as DesignSetup['keycap'],
  };
}

// Defaults update inherited definitions, never regenerate the authored layout.
export function applyBoardDefaults(source: string, setup: DesignSetup): string {
  const previous = setupFromSource(source);
  let next = ensurePitchUnits(source);
  const pitchChanged =
    setup.pitch !== previous.pitch ||
    (setup.pitchY ?? setup.pitch) !== (previous.pitchY ?? previous.pitch) ||
    (setup.pitchExpressions !== undefined &&
      JSON.stringify(setup.pitchExpressions) !==
        JSON.stringify(previous.pitchExpressions));
  if (pitchChanged) {
    const pitch = setupPitch(setup, pitchUnits(source));
    next = setValue(next, ['units', 'u'], pitch[0]);
    next = setValue(next, ['units', 'v'], pitch[1]);
  }
  const assemblyChanged = [
    'family',
    'mounting',
    'diode',
    'led',
    'template',
    'topology',
  ].some(
    (key) =>
      JSON.stringify(previous[key as keyof DesignSetup]) !==
      JSON.stringify(setup[key as keyof DesignSetup])
  );
  if (assemblyChanged) {
    next = applyScopeAssembly(next, { kind: 'board' }, setup);
  }
  if (
    setup.keycap &&
    JSON.stringify(setup.keycap) !== JSON.stringify(previous.keycap)
  ) {
    next = setValue(
      next,
      ['parts', 'key', 'envelopes', 'keycap', 'size'],
      setup.keycap
    );
  }
  next = setValue(next, ['meta', 'studio', 'openSetup'], false);
  next = setValue(next, ['meta', 'name'], setup.name);
  next = setValue(next, ['meta', 'studio', 'setup'], setup);
  next = setValue(next, ['meta', 'studio', 'setupRevision'], BOARD_REVISION);
  const defaults = (getValue(next, ['meta', 'studio', 'defaults']) ||
    {}) as object;
  next = setValue(next, ['meta', 'studio', 'defaults'], {
    ...defaults,
    ...(pitchChanged ? { pitch: ['u', 'v'] } : {}),
  });
  return syncBoardTopology(next);
}

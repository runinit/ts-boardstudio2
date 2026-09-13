import { getValue, setValue } from './studioSource';
import type { StackupSpec } from '../types/stackup';

export function setStackDimension(
  source: string,
  path: (string | number)[],
  value: unknown
): string {
  const current = getValue(source, path);
  const parameter =
    typeof current === 'string' &&
    /^[A-Za-z_]\w*$/.test(current) &&
    getValue(source, ['units', current]) !== undefined;
  return setValue(
    source,
    parameter ? ['units', current as string] : path,
    value
  );
}
export function stackForBoard(
  source: string,
  board: string
): string | undefined {
  const stacks = (getValue(source, ['designs', 'stackups']) || {}) as Record<
    string,
    StackupSpec
  >;
  return Object.keys(stacks).find((name) => stacks[name].pcb === board);
}

const CASE_PCB_HEIGHT = 6;

export type StackDimension = 'pcb' | 'plate' | 'gap' | 'pcbZ';
export function stackDimensions(
  source: string,
  board: string,
  assembly?: string
) {
  const assemblies = (getValue(source, ['designs', 'assemblies']) ||
    {}) as Record<
    string,
    {
      board?: { name?: string };
      stackup?: string;
      pcb_z?: number | string;
      pcb_thickness?: number | string;
      plate?: number | string;
      plate_z?: number | string;
    }
  >;
  const name =
    assembly ||
    Object.keys(assemblies).find(
      (name) => assemblies[name].board?.name === board
    );
  const spec = name ? assemblies[name] : undefined;
  const stack = assembly ? spec?.stackup : stackForBoard(source, board);
  const path = ['designs', 'stackups', stack || board];
  const pcb =
    (!stack && assembly
      ? spec?.pcb_thickness
      : getValue(source, ['pcbs', board, 'thickness'])) ?? 1.6;
  const plate =
    (stack ? getValue(source, [...path, 'plate', 'thickness']) : spec?.plate) ??
    1.5;
  const pcbZ = spec?.pcb_z ?? (spec ? CASE_PCB_HEIGHT : 0);
  const gap = stack
    ? (getValue(source, [...path, 'plate', 'gap']) ?? 5.4)
    : spec
      ? `(${spec.plate_z ?? 13}) - (${pcbZ}) - (${pcb})`
      : 5.4;
  return {
    name,
    stack,
    pcb: pcb as number | string,
    plate: plate as number | string,
    pcbZ,
    gap: gap as number | string,
  };
}
export function editStackDimension(
  source: string,
  board: string,
  field: StackDimension,
  value: number | string,
  assembly?: string
): string {
  const state = stackDimensions(source, board, assembly);
  if (field === 'pcbZ') {
    if (!state.name) {
      throw new Error('Create a case before changing its PCB height.');
    }
    return setStackDimension(
      source,
      ['designs', 'assemblies', state.name, 'pcb_z'],
      value
    );
  }
  if (assembly && !state.stack) {
    const valueInCase =
      field === 'gap' ? `(${state.pcbZ}) + (${state.pcb}) + (${value})` : value;
    return setStackDimension(
      source,
      [
        'designs',
        'assemblies',
        assembly,
        { pcb: 'pcb_thickness', plate: 'plate', gap: 'plate_z' }[field],
      ],
      valueInCase
    );
  }
  if (field === 'pcb') {
    return setStackDimension(source, ['pcbs', board, 'thickness'], value);
  }
  const stack = state.stack || board;
  let next = source;
  if (!state.stack) {
    next = setValue(next, ['designs', 'stackups', stack], {
      pcb: board,
      plate: { thickness: state.plate, gap: state.gap },
      layers: {},
    });
  }
  return setStackDimension(
    next,
    [
      'designs',
      'stackups',
      stack,
      'plate',
      field === 'plate' ? 'thickness' : 'gap',
    ],
    value
  );
}

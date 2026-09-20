import { expect, it } from 'vitest';
import { stringify } from 'yaml';
import { syncControllerNets, keyNets } from './assemblyNets';
import { compileSetup, defaultSetup } from './designSetup';
import { getValue, setValue, addCluster } from './studioSource';
import { insertComponent } from './componentPlacement';
import { applyAssembly } from './applyAssembly';

const key = 'fingers_c1_r1';
const setup = {
  ...defaultSetup(),
  columns: 1,
  rows: 1,
  controller: 'promicro',
};
const params = ['layout', 'objects', key, 'footprints', 'switch', 'params'];
const findings = ['meta', 'studio', 'electricalFindings'];
const plain = () =>
  stringify({
    schema: 'ergogen/v1',
    layout: { objects: {} },
    designs: {
      regions: { board: { shape: { size: [120, 80] } } },
      profiles: { board: { from: 'regions.board' } },
    },
    pcbs: { main: { profile: 'profiles.board' } },
  });

it('allocates the effective native matrix nets when inserting a controller without setup metadata', () => {
  const source = addCluster(plain(), 'fingers', 'columns', {
    columns: 2,
    rows: 1,
  });
  const next = insertComponent(source, 'mcu', 'promicro');
  expect(
    getValue(next, ['layout', 'objects', 'mcu', 'footprints', 'main', 'params'])
  ).toMatchObject({
    P0: 'fingers_c1',
    P1: 'fingers_r1',
    P2: 'fingers_c2',
  });
});

it('uses the native implicit names when reading setup-less key nets', () => {
  const source = addCluster(plain(), 'fingers', 'columns', {
    columns: 1,
    rows: 1,
  });
  expect(keyNets(source, key)).toEqual({
    columnNet: 'fingers_c1',
    rowNet: 'fingers_r1',
  });
});

it('does not count non-GPIO parameters as controller net assignments', () => {
  const source = setValue(
    compileSetup(setup),
    ['layout', 'objects', 'controller', 'footprints', 'main', 'params'],
    { orientation: 'C1' }
  );
  const next = syncControllerNets(source);
  expect(
    getValue(next, [
      'layout',
      'objects',
      'controller',
      'footprints',
      'main',
      'params',
    ])
  ).toMatchObject({ P0: 'C1', P1: 'R1' });
});

it('reports a disagreement between effective switch wiring and matrix properties without changing either', () => {
  const source = setValue(compileSetup(setup), [...params, 'from'], 'AUTH_COL');
  const next = syncControllerNets(source);
  expect(getValue(next, findings)).toEqual(
    expect.arrayContaining([expect.stringContaining('AUTH_COL')])
  );
  expect(getValue(next, [...params, 'from'])).toBe('AUTH_COL');
});

it('reports a changed row property whose diode still uses the previous row net', () => {
  const source = setValue(
    compileSetup(setup),
    ['layout', 'objects', key, 'properties', 'row_net'],
    'AUTH_ROW'
  );
  const next = syncControllerNets(source);
  expect(getValue(next, findings)).toEqual(
    expect.arrayContaining([expect.stringContaining('AUTH_ROW')])
  );
});

it('restores both endpoints of a custom junction when enabling its diode again', () => {
  let source = setValue(compileSetup(setup), [...params, 'to'], 'CUSTOM');
  source = setValue(
    source,
    [
      'layout',
      'objects',
      `${key}_diode`,
      'footprints',
      'main',
      'params',
      'from',
    ],
    'CUSTOM'
  );
  const off = applyAssembly(
    source,
    [key],
    { ...setup, diode: false },
    'preserve'
  );
  const next = applyAssembly(off, [key], setup, 'preserve');
  expect(
    getValue(next, [
      'layout',
      'objects',
      `${key}_diode`,
      'footprints',
      'main',
      'params',
      'from',
    ])
  ).toBe('CUSTOM');
});

it('preserves a switch net inherited from its part when applying an assembly', () => {
  let source = compileSetup(setup);
  const inherited = getValue(source, ['layout', 'objects', key, 'footprints']);
  source = setValue(source, ['parts', 'key', 'footprints'], inherited);
  source = setValue(
    source,
    ['parts', 'key', 'footprints', 'switch', 'params', 'from'],
    'INHERITED_COL'
  );
  source = setValue(source, ['layout', 'objects', key, 'footprints'], {});
  const next = applyAssembly(source, [key], setup, 'preserve');
  expect(getValue(next, [...params, 'from'])).toBe('INHERITED_COL');
});

it('reports unavailable matrix resolution while editing an incomplete part definition', () => {
  const source = setValue(
    compileSetup(setup),
    ['layout', 'objects', key, 'part'],
    'missing'
  );
  const next = syncControllerNets(source);
  expect(getValue(next, findings)).toEqual(
    expect.arrayContaining([expect.stringContaining(key)])
  );
  expect(
    getValue(next, [
      'layout',
      'objects',
      'controller',
      'footprints',
      'main',
      'params',
    ])
  ).toEqual(
    getValue(source, [
      'layout',
      'objects',
      'controller',
      'footprints',
      'main',
      'params',
    ])
  );
});

it('uses native identities for a free key without explicit matrix properties', () => {
  const source = setValue(plain(), ['layout', 'objects', 'free'], {
    kind: 'key',
    pcb: 'main',
  });
  expect(keyNets(source, 'free')).toEqual({
    columnNet: 'free_column',
    rowNet: 'free_row',
  });
});

it('resolves a custom switch template in the key context when restoring a diode', () => {
  let source = setValue(
    compileSetup(setup),
    [...params, 'to'],
    '{{name}}_CUSTOM'
  );
  source = setValue(
    source,
    [
      'layout',
      'objects',
      `${key}_diode`,
      'footprints',
      'main',
      'params',
      'from',
    ],
    `${key}_CUSTOM`
  );
  const off = applyAssembly(
    source,
    [key],
    { ...setup, diode: false },
    'preserve'
  );
  const next = applyAssembly(off, [key], setup, 'preserve');
  expect(
    getValue(next, [
      'layout',
      'objects',
      `${key}_diode`,
      'footprints',
      'main',
      'params',
      'from',
    ])
  ).toBe(`${key}_CUSTOM`);
});

it('clears a matrix disagreement after its explicit binding is repaired', () => {
  const inconsistent = setValue(
    compileSetup(setup),
    [...params, 'from'],
    'AUTH_COL'
  );
  const source = setValue(
    syncControllerNets(inconsistent),
    [...params, 'from'],
    'C1'
  );
  const next = syncControllerNets(source);
  expect(getValue(next, findings)).toEqual([]);
});

it('allocates around inherited controller pin assignments', () => {
  let source = setValue(compileSetup(setup), ['parts', 'mcu'], {
    footprints: { main: { what: 'promicro', params: { P0: 'RESERVED' } } },
  });
  source = setValue(source, ['layout', 'objects', 'controller', 'part'], 'mcu');
  source = setValue(
    source,
    ['layout', 'objects', 'controller', 'footprints'],
    {}
  );
  const next = syncControllerNets(source);
  expect(
    getValue(next, [
      'layout',
      'objects',
      'controller',
      'footprints',
      'main',
      'params',
    ])
  ).toMatchObject({ P0: 'RESERVED', P1: 'C1', P2: 'R1' });
});

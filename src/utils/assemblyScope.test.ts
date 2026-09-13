import { parse } from 'yaml';
import {
  createBoard,
  applyBoardDefaults,
  setupFromSource,
} from './boardDefaults';
import { addCluster, resizeCluster } from './studioSource';
import {
  applyScopeAssembly,
  scopeAssembly,
  resetScopeAssembly,
} from './assemblyScope';
import { setKeyOptions } from './keyOptions';

it('uses the effective board recipe in setup, including older defaults', () => {
  const source = setKeyOptions(createBoard(), {
    diode: false,
    diodeAt: [2, 3, 0],
  });
  expect(setupFromSource(source)).toMatchObject({
    diode: false,
    template: { diode: { at: [2, 3] } },
  });
});
it('preserves explicit column and key recipes when changing the board', () => {
  let source = addCluster(createBoard(), 'keys', 'columns', {
    columns: 2,
    rows: 2,
  });
  const board = scopeAssembly(source, { kind: 'board' });
  source = applyScopeAssembly(
    source,
    { kind: 'column', cluster: 'keys', column: 'c1' },
    { ...board, diode: false }
  );
  source = applyScopeAssembly(
    source,
    { kind: 'keys', ids: ['keys_c2_r1'] },
    { ...board, led: true }
  );
  source = applyBoardDefaults(source, {
    ...setupFromSource(source),
    diode: false,
  });
  expect(scopeAssembly(source, { kind: 'keys', ids: ['keys_c2_r1'] }).led).toBe(
    true
  );
  expect(
    scopeAssembly(source, { kind: 'keys', ids: ['keys_c2_r2'] }).diode
  ).toBe(false);
  source = resetScopeAssembly(source, { kind: 'keys', ids: ['keys_c2_r1'] });
  expect(
    scopeAssembly(source, { kind: 'keys', ids: ['keys_c2_r1'] })
  ).toMatchObject({ diode: false, led: false });
  expect(
    parse(source).layout.objects.keys_c2_r1.properties.assembly_override
  ).toBeUndefined();
});
it('resets a matrix to its board recipe while retaining a column override', () => {
  let source = addCluster(createBoard(), 'keys', 'columns', {
    columns: 2,
    rows: 1,
  });
  const board = scopeAssembly(source, { kind: 'board' });
  source = applyScopeAssembly(
    source,
    { kind: 'matrix', cluster: 'keys' },
    { ...board, diode: false }
  );
  source = applyScopeAssembly(
    source,
    { kind: 'column', cluster: 'keys', column: 'c1' },
    { ...board, led: true }
  );
  source = resetScopeAssembly(source, { kind: 'matrix', cluster: 'keys' });
  expect(
    scopeAssembly(source, { kind: 'keys', ids: ['keys_c2_r1'] }).diode
  ).toBe(true);
  expect(scopeAssembly(source, { kind: 'keys', ids: ['keys_c1_r1'] }).led).toBe(
    true
  );
});

it('new keys inherit the current column recipe after its reset', () => {
  let source = addCluster(createBoard(), 'keys', 'columns');
  const scope = { kind: 'column' as const, cluster: 'keys', column: 'c1' };
  source = applyScopeAssembly(source, scope, {
    ...scopeAssembly(source, scope),
    diode: false,
  });
  source = resetScopeAssembly(source, scope);
  source = resizeCluster(source, 'keys', { rows: ['r1', 'r2'] }, 'fill');
  expect(
    scopeAssembly(source, { kind: 'keys', ids: ['keys_c1_r2'] }).diode
  ).toBe(true);
});

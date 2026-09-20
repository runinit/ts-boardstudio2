import { appendFileSync, readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { compileSetup, defaultSetup } from '/home/chris/projects/ts-boardstudio2/app/src/utils/designSetup';
import { addCell, addObject, setValue, readStudio, removeObject, resizeCluster } from '/home/chris/projects/ts-boardstudio2/app/src/utils/studioSource';
import { ResizeReview } from '/home/chris/projects/ts-boardstudio2/app/src/utils/resizeReview';
import { moveLayout } from '/home/chris/projects/ts-boardstudio2/app/src/utils/layoutSource';

const metrics = vi.hoisted(() => ({ calls: 0, bytes: 0, stacks: [] as string[] }));
vi.mock('yaml', async (importOriginal) => {
  const actual = await importOriginal<typeof import('yaml')>();
  return { ...actual, parseDocument: (...args: Parameters<typeof actual.parseDocument>) => {
    metrics.calls++;
    metrics.bytes += args[0].length;
    return actual.parseDocument(...args);
  } };
});

it('profiles real resize and key mutations', () => {
  for (const [columns, rows] of [[13, 3]]) {
    const source = '# preserved project comment\n' + compileSetup({ ...defaultSetup(), columns, rows });
    const names = Array.from({ length: columns }, (_, i) => `c${i + 1}`);
    const rowNames = Array.from({ length: rows }, (_, i) => `r${i + 1}`);
    for (const [operation, run] of [
      ['move-key', () => moveLayout(source, 'objects', 'fingers_c1_r1', [1, 1, 0])],
      ['add-column', () => resizeCluster(source, 'fingers', { columns: [...names, 'extra'] })],
      ['remove-column', () => resizeCluster(source, 'fingers', { columns: names.slice(0, -1) })],
      ['add-row', () => resizeCluster(source, 'fingers', { rows: [...rowNames, 'extra'] })],
      ['remove-row', () => resizeCluster(source, 'fingers', { rows: rowNames.slice(0, -1) })],
      ['add-key', () => addObject(source, 'extra', 'key')],
      ['remove-key', () => removeObject(source, 'objects', 'fingers_c1_r1')],
    ] satisfies [string, () => string][]) {
      metrics.calls = 0;
      metrics.bytes = 0;
      const start = performance.now();
      let result: string;
      try { result = run(); } catch (error) { if (!(error instanceof ResizeReview)) throw error; result = error.proposal.after; }
      const elapsed = performance.now() - start;
      const { calls, bytes } = metrics;
      expect(result).toContain('# preserved project comment');
      const keys = Object.values(readStudio(result).layout.objects || {}).filter(item => item.kind === 'key').length;
      const record = JSON.stringify({ keysBefore: columns * rows, operation, elapsed: Math.round(elapsed), calls, bytes, keysAfter: keys });
      appendFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/mutations/after-isolated.jsonl', record + '\n');
    }
  }
}, 120000);

it('profiles the captured browser source', () => {
  const source = readFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/baseline/initial-source.yaml', 'utf8');
  const rows = readStudio(source).layout.clusters?.fingers.arrangement?.rows || [];
  metrics.calls = 0; metrics.bytes = 0;
  const start = performance.now();
  const result = resizeCluster(source, 'fingers', { rows: [...rows, 'r7'] });
  const elapsed = performance.now() - start;
  const record = { fixture: 'browser60', operation: 'add-row', elapsed, ...metrics };
  expect(Object.values(readStudio(result).layout.objects || {}).filter(item => item.kind === 'key')).toHaveLength(70);
  appendFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/mutations/after-isolated.jsonl', JSON.stringify(record) + '\n');
});

it('profiles selected cell insertion', () => {
  for (const kind of ['native39', 'legacy60']) {
    const initial = kind === 'native39' ? compileSetup({ ...defaultSetup(), columns: 13, rows: 3 }) : readFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/baseline/initial-source.yaml', 'utf8');
    const source = removeObject(initial, 'objects', 'fingers_c1_r1');
    metrics.calls = 0; metrics.bytes = 0;
    const start = performance.now();
    const result = addCell(source, 'fingers', 'c1', 'r1');
    const record = { fixture: kind, elapsed: performance.now() - start, ...metrics };
    expect(readStudio(result).layout.objects?.fingers_c1_r1.cell).toEqual(['c1', 'r1']);
    appendFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/mutations/cell-final-after.jsonl', JSON.stringify(record) + '\n');
  }
});

it('traces selected native LED cell insertion', () => {
  let source = compileSetup({ ...defaultSetup(), columns: 2, rows: 2 });
  source = removeObject(removeObject(source, 'objects', 'fingers_c1_r1'), 'objects', 'fingers_c2_r2');
  source = setValue(source, ['layout', 'objects', 'fingers_c2_r2'], { kind: 'anchor', label: 'reserved identity' });
  source = setValue(source, ['meta', 'studio', 'columns', 'fingers', 'c2'], { size: [23, 19], diodeAt: [2, -6, 0], led: true });
  metrics.calls = 0; metrics.bytes = 0; metrics.stacks = [];
  const result = addCell(source, 'fingers', 'c2', 'r2');
  expect(result).toContain('fingers_c2_r2_2');
  appendFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/mutations/cell-traces.json', JSON.stringify(metrics, null, 2));
});

it('checks historical managed outline regions remain bounded', async () => {
  const { prepareOutlines } = await import('/home/chris/projects/ts-boardstudio2/app/src/utils/studioOutline');
  const initial = readFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/after/plain60/last-source.yaml', 'utf8');
  const ids = Object.keys(readStudio(initial).designs?.regions || {});
  const records = [{ rebuild: 0, bytes: initial.length, regions: ids }];
  let result = initial;
  for (let rebuild = 1; rebuild <= 5; rebuild++) {
    result = prepareOutlines(result);
    const regions = Object.keys(readStudio(result).designs?.regions || {});
    expect(regions).toEqual(ids);
    records.push({ rebuild, bytes: result.length, regions });
  }
  appendFileSync('../.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/mutations/outline-reuse-historical.json', JSON.stringify(records, null, 2));
});

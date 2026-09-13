import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { parse } from 'yaml';
import { resolveLayout } from 'ergogen/src/native/draft';
import { addCluster, addOutline, setValue } from './studioSource';
import { moveTargets } from './studioMove';

it('commits cumulative 39-key source targets without awaiting geometry', async () => {
  let source = addCluster(
    'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
    'fingers',
    'columns',
    { columns: 7, rows: 5 }
  );
  source = addCluster(source, 'thumbs', 'columns', { columns: 2, rows: 2 });
  source = setValue(source, ['layout', 'clusters', 'thumbs', 'placement'], {
    at: [160, 0, 0],
  });
  source = addOutline(source, 'main', resolveLayout(source));
  let report = resolveLayout(source);
  const times: number[] = [];
  const commits: number[] = [];
  const drafts: number[] = [];
  const iterations = 10;
  const baselinePath = process.env.STUDIO_BASELINE;
  let validationMs: number | undefined;
  if (baselinePath) {
    const baseline = createRequire(import.meta.url)(baselinePath);
    const start = performance.now();
    await baseline.process(source, { layoutOnly: true, debug: true });
    validationMs = performance.now() - start;
  }
  for (let index = 0; index < iterations; index++) {
    const start = performance.now();
    source = moveTargets(
      source,
      { section: 'clusters', id: 'thumbs' },
      [1, 0, 0],
      report
    );
    const committed = performance.now();
    commits.push(committed - start);
    report = resolveLayout(source);
    drafts.push(performance.now() - committed);
    times.push(performance.now() - start);
  }
  expect(parse(source).layout.clusters.thumbs.placement.override.at[0]).toBe(
    iterations
  );
  expect(Object.keys(report.objects)).toHaveLength(39);
  if (baselinePath) {
    console.info(
      'Studio local timings (ms)',
      JSON.stringify({
        baselineValidation: validationMs,
        draftCommitMedian: [...times].sort((a, b) => a - b)[
          Math.floor(iterations / 2)
        ],
        draftCommitMax: Math.max(...times),
        commitMax: Math.max(...commits),
        commitMedian: [...commits].sort((a, b) => a - b)[
          Math.floor(iterations / 2)
        ],
        draftMedian: [...drafts].sort((a, b) => a - b)[
          Math.floor(iterations / 2)
        ],
        iterations,
      })
    );
  }
});

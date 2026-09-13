import { runStudio } from './studioPipeline';
import { addCluster, addOutline, setValue } from '../utils/studioSource';
import { freezeOutlines, prepareOutlines } from '../utils/studioOutline';
import * as ergogen from 'ergogen';
import type { StudioReply } from '../utils/studioQueue';

const base = `schema: ergogen/v1
layout:
  objects:
    key: {kind: key, pcb: main, envelopes: {keycap: {size: [18, 18]}}}
pcbs: {main: {}}
`;
it('publishes layout, outline, then board analysis using one solved scene', async () => {
  const source = addOutline(base);
  const replies: StudioReply[] = [];
  await runStudio(
    {
      inputConfig: source,
      revision: 'one',
      requestId: 'one',
      outline: 'rebuild',
    },
    { debug: true, svg: true },
    () => true,
    (reply) => replies.push(reply)
  );
  expect(replies.map((reply) => reply.stage || reply.type)).toEqual([
    'layout',
    'outline',
    'success',
  ]);
  expect(replies[1].results?.designs?.analysis).toBeUndefined();
  expect(replies[2].results?.pcbs?.main).toContain('kicad_pcb');
});
it('round-trips frozen contours through native processing and manual rebuilding', async () => {
  const source = addOutline(base);
  const initial = await ergogen.process(source, {
    debug: true,
    svg: true,
    analysis: true,
  });
  const frozen = freezeOutlines(source, initial.designs);
  const moved = frozen.replace(
    'kind: key, pcb: main',
    'kind: key, placement: {at: [50, 0, 0]}, pcb: main'
  );
  const result = await ergogen.process(moved, {
    debug: true,
    svg: true,
    analysis: true,
  });
  expect(result.outlines.main_outline.svg).toBe(
    initial.outlines.main_outline.svg
  );
  const replies: StudioReply[] = [];
  await runStudio(
    {
      inputConfig: moved,
      revision: 'freeze',
      requestId: 'freeze',
      outline: 'rebuild',
    },
    { debug: true, svg: true },
    () => true,
    (reply) => replies.push(reply)
  );
  const rebuilt = replies.at(-1)!;
  expect(rebuilt.type).toBe('success');
  expect(
    rebuilt.results?.designs?.features['profiles.main_outline'].bounds?.low[0]
  ).toBeCloseTo(
    initial.designs.features['profiles.main_outline'].bounds.low[0] + 50
  );
  expect(rebuilt.source).toContain('auto: false');
  expect(rebuilt.source).toContain('snapshot:');
});
it('stops before outline publication when superseded', async () => {
  const replies: StudioReply[] = [];
  await runStudio(
    { inputConfig: addOutline(base), revision: 'old', requestId: 'old' },
    {},
    () => false,
    (reply) => replies.push(reply)
  );
  expect(replies.map((reply) => reply.type)).toEqual(['superseded']);
});
it('reconciles a 7 by 5 matrix plus a 2 by 2 matrix without manual recipes', async () => {
  let source = addCluster(
    base.replace(
      'key: {kind: key, pcb: main, envelopes: {keycap: {size: [18, 18]}}}',
      '{}'
    ),
    'fingers',
    'columns',
    { columns: 7, rows: 5 }
  );
  source = addCluster(source, 'thumbs', 'columns', { columns: 2, rows: 2 });
  source = setValue(source, ['layout', 'clusters', 'thumbs', 'placement'], {
    at: [160, 0, 0],
  });
  const layout = ergogen.resolveLayout(source);
  const prepared = prepareOutlines(source, layout);
  const result = await ergogen.process(prepared, {
    debug: true,
    analysis: true,
  });
  expect(
    result.designs.features['profiles.main_outline'].contours
  ).toBeGreaterThan(0);
}, 30000);

it('reconciles and freezes both boards of a linked mirror', async () => {
  const source = `schema: ergogen/v1
layout:
  clusters:
    left: {arrangement: {type: free}}
    right: {mirror: {source: left, axis: 50}, overrides: {key: {pcb: right}}}
  objects:
    key: {kind: key, pcb: left, cluster: left, envelopes: {keycap: {size: [18, 18]}}}
pcbs: {left: {}, right: {}}
`;
  const draft = ergogen.resolveLayout(source);
  const prepared = prepareOutlines(source, draft);
  const initial = await ergogen.process(prepared, {
    debug: true,
    analysis: true,
  });
  const frozen = freezeOutlines(prepared, initial.designs);
  expect(frozen.match(/snapshot:/g)).toHaveLength(6);
  expect(Object.keys(initial.outlines)).toEqual([
    'left_outline',
    'right_outline',
  ]);
});

import { resolve } from 'ergogen/src/native/layout';
import { snapFrame } from './snapFrame';

it('uses a splayed key frame and the containing frame for a matrix', () => {
  const report = resolve({
    schema: 'ergogen/v1',
    layout: {
      clusters: {
        keys: {
          placement: { at: [13, 7, 0], rotate: 20 },
          arrangement: {
            type: 'columns',
            columns: ['c1'],
            rows: ['r1'],
            pitch: [19, 17],
            splay: { c1: 30 },
          },
        },
      },
      objects: { key: { kind: 'key', cluster: 'keys', cell: ['c1', 'r1'] } },
    },
  });
  const key = snapFrame(report, { section: 'objects', id: 'key' });
  expect(key.matrix).toEqual(report.objects.key.editMatrix);
  const matrix = snapFrame(report, { section: 'clusters', id: 'keys' });
  expect(matrix.matrix).toEqual(report.clusters.keys.editMatrix);
  expect(matrix.origin).toEqual([13, 7, 0]);
});

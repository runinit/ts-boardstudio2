import { compileSetup, defaultSetup } from './designSetup';
import { applyKeyDefaults } from './keyOptions';
import { addObject, getValue, resizeCluster, setValue } from './studioSource';

it('keeps sequential LED chain order across interleaved assembly recipes', () => {
  // Given: three LED columns inherit recipes A, B, A.
  const source = setValue(
    compileSetup({ ...defaultSetup(), columns: 3, rows: 1, led: true }),
    ['meta', 'studio', 'columns', 'fingers', 'c2'],
    { diodeAt: [4, -5, 0] }
  );
  const ids = ['fingers_c1_r2', 'fingers_c2_r2', 'fingers_c3_r2'];
  let sequential = setValue(
    source,
    ['layout', 'clusters', 'fingers', 'arrangement', 'rows'],
    ['r1', 'r2']
  );
  for (const [index, id] of Array.from(ids.entries())) {
    sequential = addObject(sequential, id, 'key', undefined, 'defer');
    sequential = setValue(
      sequential,
      ['layout', 'objects', id, 'cluster'],
      'fingers'
    );
    sequential = setValue(
      sequential,
      ['layout', 'objects', id, 'cell'],
      [`c${index + 1}`, 'r2']
    );
    sequential = applyKeyDefaults(sequential, id);
  }
  const wiring = (text: string) =>
    ids.map((id) =>
      getValue(text, [
        'layout',
        'objects',
        `${id}_led`,
        'footprints',
        'main',
        'params',
        'P4',
      ])
    );
  expect(wiring(sequential)).toEqual([
    'fingers_c3_r1_led_out',
    'fingers_c1_r2_led_out',
    'fingers_c2_r2_led_out',
  ]);

  // When: one resize batches all new row keys.
  const result = resizeCluster(source, 'fingers', { rows: ['r1', 'r2'] });

  // Then: the actual P4 inputs match the historical insertion order.
  expect(wiring(result)).toEqual(wiring(sequential));
});

import { expect, test } from 'vitest';
import { runLatest } from './compileLatest';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}

test('ignores a late older result after a newer compilation resolves first', async () => {
  const sequence = { current: 0 };
  const old = deferred<string>();
  const current = deferred<string>();
  const accepted: string[] = [];
  const rejected: unknown[] = [];
  runLatest(sequence, () => old.promise, (value) => accepted.push(value), (error) => rejected.push(error));
  runLatest(sequence, () => current.promise, (value) => accepted.push(value), (error) => rejected.push(error));
  current.resolve('definition B');
  await Promise.resolve();
  old.resolve('definition A');
  await Promise.resolve();
  expect(accepted).toEqual(['definition B']);
  expect(rejected).toEqual([]);
});

test('ignores a late error from an older compilation after a newer one completes', async () => {
  const sequence = { current: 0 };
  const old = deferred<string>();
  const current = deferred<string>();
  const accepted: string[] = [];
  const rejected: unknown[] = [];
  runLatest(sequence, () => old.promise, (value) => accepted.push(value), (error) => rejected.push(error));
  runLatest(sequence, () => current.promise, (value) => accepted.push(value), (error) => rejected.push(error));
  current.resolve('definition B');
  await Promise.resolve();
  old.reject(new Error('stale failure'));
  await Promise.resolve();
  expect(accepted).toEqual(['definition B']);
  expect(rejected).toEqual([]);
});

test('cancels a pending compilation when its consumer switches definitions', async () => {
  const sequence = { current: 0 };
  const old = deferred<string>();
  const accepted: string[] = [];
  const cleanup = runLatest(sequence, () => old.promise, (value) => accepted.push(value), () => undefined);
  cleanup();
  old.resolve('old definition');
  await Promise.resolve();
  expect(accepted).toEqual([]);
});

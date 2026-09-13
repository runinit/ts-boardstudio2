import { createHistory } from './projectHistory';

it('shares source history across code and visual commands', () => {
  const history = createHistory('initial');
  history.record('typing', 'code', 100);
  history.record('formula', 'code', 200);
  history.record('moved', 'command', 210);
  expect(history.undo()).toBe('formula');
  expect(history.undo()).toBe('initial');
  expect(history.redo()).toBe('formula');
  history.record('different move');
  expect(history.redo()).toBeUndefined();
});

it('keeps an invalid source draft recoverable and resets between projects', () => {
  const history = createHistory('layout: {}');
  history.record('layout: [');
  expect(history.undo()).toBe('layout: {}');
  expect(history.redo()).toBe('layout: [');
  history.reset('another project');
  expect(history.undo()).toBeUndefined();
});

it('amends only the originating revision without an extra undo step', () => {
  const history = createHistory('initial');
  history.record('moved');
  const revision = history.revision;
  expect(history.amend(revision, 'outlined')).toBe(true);
  expect(history.undo()).toBe('initial');
  expect(history.redo()).toBe('outlined');
  expect(history.amend(revision, 'obsolete')).toBe(false);
});

it('rejects amendments after undo, reset, and newer edits', () => {
  const history = createHistory('initial');
  history.record('first');
  const first = history.revision;
  history.record('second');
  expect(history.amend(first, 'obsolete')).toBe(false);
  history.undo();
  const revision = history.revision;
  expect(history.amend(first, 'obsolete')).toBe(false);
  expect(history.amend(revision, 'first outline')).toBe(true);
  expect(history.canRedo).toBe(true);
  expect(history.redo()).toBe('second');
  history.reset('first');
  expect(history.amend(revision, 'obsolete')).toBe(false);
});

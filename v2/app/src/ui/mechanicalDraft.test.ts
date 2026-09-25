import { expect, test } from 'vitest';
import type { MechanicalConfiguration } from '@boardstudio/v2-contracts';
import { MechanicalDraft } from './mechanicalDraft';
const initial = { boardId: 'board', plateThickness: 1.5, bottomThickness: 2, profiles: [] } as unknown as MechanicalConfiguration;

test('successive field edits survive an earlier commit acknowledgement and serialization', () => {
  const draft = new MechanicalDraft(initial);
  const plate = { ...draft.value!, plateThickness: 1.6 };
  draft.submit(plate);
  const bottom = { ...draft.value!, bottomThickness: 3 };
  draft.submit(bottom);
  draft.receive(JSON.parse(JSON.stringify(plate)));
  expect(draft.value?.plateThickness).toBe(1.6);
  expect(draft.value?.bottomThickness).toBe(3);
  draft.receive(Object.fromEntries(Object.entries(bottom).reverse()) as MechanicalConfiguration);
  expect(draft.value).toEqual(bottom);
});

test('undo and reopening replace an acknowledged draft instead of replaying it', () => {
  const draft = new MechanicalDraft(initial);
  draft.submit({ ...initial, plateThickness: 2 });
  draft.receive({ ...initial, plateThickness: 2 });
  draft.receive(initial);
  expect(draft.value).toEqual(initial);
  draft.submit(null);
  draft.receive(undefined);
  expect(draft.value).toBeUndefined();
  draft.receive(initial);
  expect(draft.value).toEqual(initial);
});

test('newer committed snapshots reject delayed acknowledgements and a new project clears queued drafts', () => {
  const draft = new MechanicalDraft(initial, 'project-a:board', 1);
  const first = { ...initial, plateThickness: 2 };
  const second = { ...first, bottomThickness: 4 };
  draft.submit(first); draft.submit(second);
  draft.receive(second, 'project-a:board', 3);
  draft.receive(first, 'project-a:board', 2);
  expect(draft.value).toEqual(second);
  draft.submit({ ...second, plateThickness: 3 });
  draft.receive(initial, 'project-b:board', 1);
  expect(draft.value).toEqual(initial);
  draft.submit(first);
  draft.receive(initial, 'project-b:other-board', 2);
  expect(draft.value).toEqual(initial);
});

test('an unrelated document acknowledgement does not erase queued mechanical fields', () => {
  const draft = new MechanicalDraft(initial, 'project:board:session-1', 1);
  const next = { ...initial, plateThickness: 2 };
  draft.submit(next);
  draft.receive({ ...initial }, 'project:board:session-1', 2);
  expect(draft.value).toEqual(next);
  draft.receive(next, 'project:board:session-1', 3);
  draft.receive(initial, 'project:board:session-2', 1);
  expect(draft.value).toEqual(initial);
});

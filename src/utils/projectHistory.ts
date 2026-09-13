export type EditKind = 'command' | 'code';
const CODE_GROUP_MS = 750;
const HISTORY_LIMIT = 100;

// Keep history outside editors so closing a panel cannot discard a transaction.
export function createHistory<T>(initial: T) {
  let current = initial;
  let revision = 0;
  let action: 'edit' | 'restore' | 'amend' = 'restore';
  let past: T[] = [];
  let future: T[] = [];
  let previousKind: EditKind = 'command';
  let previousTime = 0;
  return {
    sync(next: T) {
      current = next;
    },
    get action() {
      return action;
    },
    get revision() {
      return revision;
    },
    // Generated geometry belongs to its edit and must preserve redo entries.
    amend(expected: number, next: T) {
      if (expected !== revision) {
        return false;
      }
      current = next;
      revision += 1;
      action = 'amend';
      return true;
    },
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
    record(next: T, kind: EditKind = 'command', now = Date.now()) {
      if (next === current) {
        return;
      }
      if (
        kind !== 'code' ||
        previousKind !== 'code' ||
        now - previousTime > CODE_GROUP_MS
      ) {
        past = [...past.slice(-(HISTORY_LIMIT - 1)), current];
      }
      current = next;
      revision += 1;
      action = 'edit';
      future = [];
      previousKind = kind;
      previousTime = now;
    },
    undo() {
      const next = past.pop();
      if (next === undefined) {
        return;
      }
      future.push(current);
      current = next;
      revision += 1;
      action = 'restore';
      previousKind = 'command';
      return current;
    },
    redo() {
      const next = future.pop();
      if (next === undefined) {
        return;
      }
      past.push(current);
      current = next;
      revision += 1;
      action = 'restore';
      previousKind = 'command';
      return current;
    },
    reset(next: T) {
      current = next;
      revision += 1;
      action = 'restore';
      past = [];
      future = [];
      previousKind = 'command';
    },
  };
}

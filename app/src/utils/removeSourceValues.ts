import { isMap, isNode, isScalar, parseDocument } from 'yaml';
import type { YAMLMap } from 'yaml';
import type { SourcePath } from './designSource';
import { sourceDocument } from './sourceSnapshot';

type Edit = {
  readonly start: number;
  readonly end: number;
  readonly text: string;
};

export function removeSourceValues(
  source: string,
  paths: readonly SourcePath[]
): string {
  if (!paths.length) return source;
  const doc = sourceDocument(source);
  const groups = new Map<YAMLMap, Set<number>>();
  const requested = new Set(paths.map((path) => JSON.stringify(path)));
  for (const path of paths) {
    if (
      path.some((_, index) =>
        requested.has(JSON.stringify(path.slice(0, index)))
      )
    )
      continue;
    if (doc.getIn(path, true) === undefined) continue;
    const parent = doc.getIn(path.slice(0, -1), true);
    if (!isMap(parent)) throw new Error('Remove a named field from a mapping.');
    const index = parent.items.findIndex(
      (item) => isScalar(item.key) && item.key.value === path.at(-1)
    );
    if (index < 0) continue;
    const entry = parent.items[index];
    if (
      !isScalar(entry.key) ||
      !entry.key.range ||
      !isNode(entry.value) ||
      !entry.value.range
    ) {
      throw new Error('This field has no editable source range.');
    }
    const indices = groups.get(parent) || new Set<number>();
    indices.add(index);
    groups.set(parent, indices);
  }
  const edits: Edit[] = [];
  groups.forEach((indices, parent) => {
    if (indices.size === parent.items.length) {
      if (!parent.range)
        throw new Error('This field has no editable source range.');
      const [start, end] = parent.range;
      edits.push({
        start,
        end,
        text:
          parent.flow || !source.slice(start, end).endsWith('\n')
            ? '{}'
            : source.slice(start, end).endsWith('\r\n')
              ? '{}\r\n'
              : '{}\n',
      });
      return;
    }
    const sorted = Array.from(indices).sort((a, b) => a - b);
    for (let offset = 0; offset < sorted.length; offset++) {
      const first = sorted[offset];
      let last = first;
      while (sorted[offset + 1] === last + 1) last = sorted[++offset];
      const key = parent.items[first].key;
      const value = parent.items[last].value;
      if (!isScalar(key) || !key.range || !isNode(value) || !value.range) {
        throw new Error('This field has no editable source range.');
      }
      let start = key.range[0],
        end = value.range[2];
      if (parent.flow) {
        end = value.range[1];
        const next = parent.items[last + 1]?.key;
        if (isScalar(next) && next.range) end = next.range[0];
        else start = source.lastIndexOf(',', start);
      } else start = source.lastIndexOf('\n', start - 1) + 1;
      edits.push({ start, end, text: '' });
    }
  });
  if (!edits.length) return source;
  edits.sort((a, b) => a.start - b.start);
  let cursor = 0;
  const pieces: string[] = [];
  for (const edit of edits) {
    pieces.push(source.slice(cursor, edit.start), edit.text);
    cursor = edit.end;
  }
  pieces.push(source.slice(cursor));
  const result = pieces.join('');
  const check = parseDocument(result);
  if (check.errors.length) throw new Error(check.errors[0].message);
  check.toJS();
  return result;
}

import { isMap, isScalar, isNode, stringify } from 'yaml';
import type { YAMLMap } from 'yaml';
import { sourceDocument } from './sourceSnapshot';

export type SourcePath = (string | number)[];
export type SourceEdit = { path: SourcePath; value: unknown };
export const DESIGN_EDIT_EVENT = 'ergogen-design-edit';
export interface DesignEditEvent {
  before: string;
  after: string;
  applied: boolean;
}

export function appendFields(
  source: string,
  path: SourcePath,
  entries: Record<string, unknown>
): string {
  const names = Object.keys(entries);
  if (!names.length) return source;
  const parent = document(source).getIn(path, true);
  if (parent === undefined) return editField(source, path, entries);
  if (!isMap(parent)) {
    throw new Error('Append named fields to a mapping.');
  }
  if (names.some((name) => parent.has(name))) {
    throw new Error('Choose new, unique field names.');
  }
  return appendMapping(source, parent, entries);
}

export function editMappingFields(
  source: string,
  path: SourcePath,
  entries: Record<string, unknown>
): string {
  if (!Object.keys(entries).length) return source;
  const parent = document(source).getIn(path, true);
  if (parent === undefined) return editField(source, path, entries);
  if (!isMap(parent)) throw new Error('Edit named fields in a mapping.');
  const additions: Record<string, unknown> = {};
  const replacements: { start: number; end: number; text: string }[] = [];
  for (const [key, value] of Object.entries(entries)) {
    const node = parent.get(key, true);
    if (node === undefined) {
      additions[key] = value;
      continue;
    }
    if (!isNode(node) || !node.range) {
      throw new Error('This field has no editable source range.');
    }
    replacements.push({
      start: node.range[0],
      end: node.range[1],
      text: renderValue(source, node.range[1], isScalar(node), value),
    });
  }
  const appended = Object.keys(additions).length
    ? appendMapping(source, parent, additions)
    : source;
  replacements.sort((a, b) => a.start - b.start);
  let cursor = 0;
  const pieces: string[] = [];
  for (const replacement of replacements) {
    pieces.push(appended.slice(cursor, replacement.start), replacement.text);
    cursor = replacement.end;
  }
  pieces.push(appended.slice(cursor));
  return pieces.join('');
}

const document = (source: string) => {
  const doc = sourceDocument(source);
  if (doc.errors.length) {
    throw new Error(doc.errors[0].message);
  }
  return doc;
};

// Use document ranges so unrelated bytes, comments, and formulas stay intact.
export function editDesign(
  source: string,
  path: SourcePath,
  value: unknown
): string {
  const doc = document(source);
  const node = doc.getIn(path, true);
  if (isScalar(node) && node.range) {
    return (
      source.slice(0, node.range[0]) +
      renderValue(source, node.range[1], true, value) +
      source.slice(node.range[1])
    );
  }
  if (node !== undefined) {
    throw new Error(
      'Edit individual fields; replacing a collection would discard source formatting.'
    );
  }
  let depth = path.length - 1;
  while (depth > 0 && doc.getIn(path.slice(0, depth), true) === undefined) {
    depth--;
  }
  const parent = depth ? doc.getIn(path.slice(0, depth), true) : doc.contents;
  if (!isMap(parent) || !parent.range) {
    throw new Error(
      'Add this field in YAML; its parent must be a block mapping.'
    );
  }
  let addition: unknown = value;
  for (let index = path.length - 1; index >= depth; index--) {
    addition = { [path[index]]: addition };
  }
  return appendMapping(source, parent, addition);
}

export function editFields(source: string, changes: SourceEdit[]): string {
  if (!changes.length) {
    return source;
  }
  const unique = new Map(
    changes.map((change) => [JSON.stringify(change.path), change])
  );
  const doc = document(source);
  const additions: SourceEdit[] = [];
  const replacements: { start: number; end: number; text: string }[] = [];
  for (const change of Array.from(unique.values())) {
    const node = doc.getIn(change.path, true);
    if (node === undefined) {
      additions.push(change);
      continue;
    }
    if (!isNode(node) || !node.range) {
      throw new Error('This field has no editable source range.');
    }
    replacements.push({
      start: node.range[0],
      end: node.range[1],
      text: renderValue(source, node.range[1], isScalar(node), change.value),
    });
  }
  if (additions.length) {
    let appended = source;
    for (const addition of additions) {
      appended = editField(appended, addition.path, addition.value);
    }
    return editFields(
      appended,
      Array.from(unique.values()).filter(
        (change) => !additions.includes(change)
      )
    );
  }
  replacements.sort((a, b) => a.start - b.start);
  let cursor = 0;
  const pieces: string[] = [];
  for (const replacement of replacements) {
    pieces.push(source.slice(cursor, replacement.start), replacement.text);
    cursor = replacement.end;
  }
  pieces.push(source.slice(cursor));
  return pieces.join('');
}

function appendMapping(
  source: string,
  parent: YAMLMap,
  addition: unknown
): string {
  if (!parent.range) {
    throw new Error('This field has no editable source range.');
  }
  if (parent.flow) {
    const rendered = stringify(addition, {
      collectionStyle: 'flow',
      aliasDuplicateObjects: false,
      lineWidth: 0,
    }).trim();
    const end = source.lastIndexOf('}', parent.range[1] - 1);
    return (
      source.slice(0, end) +
      (parent.items.length ? ', ' : '') +
      rendered.slice(1, -1).trim() +
      source.slice(end)
    );
  }
  const first = parent.items[0]?.key;
  const start =
    isScalar(first) && first.range ? first.range[0] : parent.range[0];
  const indent = start - source.lastIndexOf('\n', start - 1) - 1;
  const rendered = stringify(addition, {
    lineWidth: 0,
    aliasDuplicateObjects: false,
  })
    .trimEnd()
    .split('\n')
    .map((line) => ' '.repeat(indent) + line)
    .join('\n');
  const end = parent.range[2];
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  return (
    source.slice(0, end) +
    (source[end - 1] === '\n' ? '' : newline) +
    rendered.replace(/\n/g, newline) +
    newline +
    source.slice(end)
  );
}

export function movePoint(
  source: string,
  sketch: string,
  point: string,
  before: number[],
  after: number[],
  frame?: { angle: number; handedness: number }
): string {
  const path = ['designs', 'sketches', sketch, 'points', point];
  if (!document(source).getIn(path)) {
    throw new Error(`Missing point ${point}; repair its reference.`);
  }
  const doc = document(source);
  const constraints = doc.getIn(['designs', 'sketches', sketch, 'constraints']);
  const fixedConstraint =
    isMap(constraints) &&
    constraints.items.some(
      (item) =>
        isMap(item.value) &&
        item.value.get('type') === 'fixed' &&
        item.value.get('point') === point
    );
  if (doc.getIn([...path, 'fixed']) === true || fixedConstraint) {
    throw new Error(`Point ${point} is fixed.`);
  }
  if (doc.getIn([...path, 'anchor']) && !frame) {
    throw new Error('Regenerate the sketch to resolve its anchor frame.');
  }
  const angle = ((frame?.angle || 0) * Math.PI) / 180;
  const dx = after[0] - before[0],
    dy = after[1] - before[1];
  const delta = [
    (dx * Math.cos(angle) + dy * Math.sin(angle)) * (frame?.handedness ?? 1),
    -dx * Math.sin(angle) + dy * Math.cos(angle),
  ].map((value) => Math.round(value * 1000000) / 1000000);
  if (doc.getIn([...path, 'at']) === undefined) {
    return editDesign(source, [...path, 'at'], delta);
  }
  let result = source;
  for (const axis of [0, 1]) {
    const coordinate = [...path, 'at', axis];
    const value = document(result).getIn(coordinate);
    const offset = delta[axis];
    if (!offset) {
      continue;
    }
    if (typeof value === 'string') {
      result = editDesign(result, coordinate, `(${value}) + ${offset}`);
    } else if (typeof value === 'number') {
      result = editDesign(result, coordinate, value + offset);
    } else {
      throw new Error('Declare point.at coordinates before dragging.');
    }
  }
  return result;
}

export function applyDesignEdit(before: string, after: string): void {
  const detail: DesignEditEvent = { before, after, applied: false };
  window.dispatchEvent(new CustomEvent(DESIGN_EDIT_EVENT, { detail }));
  if (!detail.applied) {
    throw new Error(
      'The source changed before this edit. Retry using the current project.'
    );
  }
}

export function editField(
  source: string,
  path: SourcePath,
  value: unknown
): string {
  const doc = sourceDocument(source);
  if (doc.errors.length) {
    throw new Error(doc.errors[0].message);
  }
  const node = doc.getIn(path, true);
  if (!node || isScalar(node)) {
    return editDesign(source, path, value);
  }
  if (!isNode(node) || !node.range) {
    throw new Error('This field has no editable source range.');
  }
  return (
    source.slice(0, node.range[0]) +
    renderValue(source, node.range[1], false, value) +
    source.slice(node.range[1])
  );
}

function renderValue(
  source: string,
  end: number,
  scalar: boolean,
  value: unknown
): string {
  const next = stringify(value, {
    collectionStyle: 'flow',
    lineWidth: 0,
    aliasDuplicateObjects: false,
    flowCollectionPadding: !scalar,
  }).trimEnd();
  const newline =
    !scalar && source[end - 1] === '\n'
      ? source.includes('\r\n')
        ? '\r\n'
        : '\n'
      : '';
  return next + newline;
}

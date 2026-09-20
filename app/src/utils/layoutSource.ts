import { isAlias, isMap, isSeq, stringify } from 'yaml';
import { editField, SourcePath } from './designSource';
import { sourceDocument, sourceValue } from './sourceSnapshot';

export type LayoutSection = 'objects' | 'clusters';
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const PRECISION = 1_000_000;

// Only materialize the selected instance; leave the shared alias definition intact.
function instance(
  source: string,
  path: SourcePath,
  document = sourceDocument(source)
): string {
  if (document.errors.length) {
    throw new Error(document.errors[0].message);
  }
  const node = document.getIn(path, true);
  if (!node) {
    throw new Error('Missing layout object; regenerate before editing.');
  }
  if (!isAlias(node) || !node.range) {
    return source;
  }
  const resolved = node.resolve(document);
  if (!isMap(resolved)) {
    throw new Error('The selected alias must reference an object.');
  }
  const value = resolved.toJSON();
  const rendered = stringify(value, {
    collectionStyle: 'flow',
    lineWidth: 0,
  }).trim();
  return (
    source.slice(0, node.range[0]) + rendered + source.slice(node.range[1])
  );
}

function target(source: string, section: LayoutSection, id: string) {
  const data = sourceValue(source) as {
    layout?: Record<
      string,
      Record<
        string,
        { cluster?: string; locked?: boolean; mirror?: { source: string } }
      >
    >;
  };
  const root = ['layout', section, id];
  if (data?.layout?.[section]?.[id]) {
    const cluster = data.layout[section][id].cluster;
    return {
      root,
      locked: !!(cluster && data.layout.clusters?.[cluster]?.locked),
      generated: false,
    };
  }
  for (const [cluster, value] of Object.entries(data?.layout?.clusters || {})) {
    const spec = value as { mirror?: { source: string }; locked?: boolean };
    if (
      section !== 'objects' ||
      !spec.mirror ||
      !id.startsWith(`${cluster}__`)
    ) {
      continue;
    }
    const member = id.slice(cluster.length + 2);
    if (data.layout?.objects?.[member]?.cluster === spec.mirror.source) {
      return {
        root: ['layout', 'clusters', cluster, 'overrides', member],
        locked: !!spec.locked,
        generated: true,
      };
    }
  }
  throw new Error('Missing layout object; regenerate before editing.');
}

export function setLayout(
  source: string,
  section: LayoutSection,
  id: string,
  field: SourcePath,
  value: unknown
): string {
  const { root, locked, generated } = target(source, section, id);
  const original = sourceDocument(source);
  let result = generated ? source : instance(source, root, original);
  const path = [...root, ...field];
  const document = result === source ? original : sourceDocument(result);
  if (
    locked ||
    (document.getIn([...root, 'locked']) && field[0] !== 'locked')
  ) {
    throw new Error('This object is locked.');
  }
  const coordinate = field[1] === 'override' ? field[2] : field[1];
  const fixedPath = [...root, 'placement', 'override', 'fixed'];
  const prior = sourceValue(result, fixedPath);
  const before = sourceValue(result, path);
  const fixesPlacement =
    field[0] === 'placement' && ['at', 'rotate'].includes(String(coordinate));
  const fixed: Record<string, boolean> = Array.isArray(prior)
    ? Object.fromEntries(prior.map((axis) => [axis, true]))
    : { ...((prior as Record<string, boolean>) || {}) };
  if (fixesPlacement) {
    if (coordinate === 'rotate') {
      fixed.rotate = true;
    } else if (Array.isArray(value)) {
      const previous = (before || [0, 0, 0]) as unknown[];
      value.forEach((item, index) => {
        if (item !== previous[index]) {
          fixed[['x', 'y', 'z'][index]] = true;
        }
      });
    } else {
      fixed[['x', 'y', 'z'][Number(field.at(-1))]] = true;
    }
    const overridePath = [...root, 'placement', 'override'];
    if (
      field.length === 3 &&
      field[1] === 'override' &&
      document.getIn(overridePath, true) === undefined
    ) {
      return editField(result, overridePath, { [coordinate]: value, fixed });
    }
  }
  const node = document.getIn(path, true);
  if (
    Array.isArray(value) &&
    isSeq(node) &&
    node.items.length === value.length
  ) {
    value.forEach((item, index) => {
      // Preserve unchanged collection members, including their comments.
      if (
        JSON.stringify((before as unknown[])[index]) !== JSON.stringify(item)
      ) {
        result = editField(result, [...path, index], item);
      }
    });
  } else {
    result = editField(result, path, value);
  }
  if (!fixesPlacement) {
    return result;
  }
  // Repeated nudges do not need to rewrite axes that are already fixed.
  return JSON.stringify(prior) === JSON.stringify(fixed)
    ? result
    : editField(result, fixedPath, fixed);
}

export function moveLayout(
  source: string,
  section: LayoutSection,
  id: string,
  delta: number[],
  frame: number[] = IDENTITY,
  solved: number[] = [0, 0, 0]
): string {
  const local = [0, 1, 2].map(
    (axis) =>
      Math.round(
        [0, 1, 2].reduce(
          (sum, row) => sum + frame[row * 4 + axis] * delta[row],
          0
        ) * PRECISION
      ) / PRECISION
  );
  const { root } = target(source, section, id);
  const coordinates = (sourceValue(source, [
    ...root,
    'placement',
    'override',
    'at',
  ]) || [0, 0, 0]) as (number | string)[];
  const targets = local.map((value, index) =>
    value ? value + solved[index] : value
  );
  const next = coordinates.map((value, index) =>
    typeof value === 'number'
      ? value + targets[index]
      : `(${value}) + ${targets[index]}`
  );
  return setLayout(source, section, id, ['placement', 'override', 'at'], next);
}

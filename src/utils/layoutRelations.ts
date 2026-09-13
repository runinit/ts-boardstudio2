import type { LayoutSnap } from './layoutSnapping';
import { attachObject } from './studioMove';
import { resolve } from 'ergogen/src/native/layout';
import type { LayoutReport } from 'ergogen/src/native';
import {
  getValue,
  readStudio,
  removeValue,
  setValue,
  nextId,
  type StudioRule,
} from './studioSource';
import { moveTargets } from './studioMove';
import { snapTargets } from './snapTargets';
import { ensurePitchUnits, type Dimension } from './designUnits';

export type RelationPick =
  | { kind: 'align'; id: string; axis: 'x' | 'y' }
  | { kind: 'distance'; id: string; value: Dimension };

function relationTarget(
  source: string,
  id: string,
  target: string,
  report: LayoutReport
) {
  const data = readStudio(source),
    item = data.layout.objects?.[id];
  if (!item || report.objects[id]?.locked) {
    throw new Error('Select an unlocked object to align.');
  }
  const guide = snapTargets(report).guides[target];
  if (!guide || guide.members.includes(id)) {
    throw new Error('Choose a different alignment target.');
  }
  if (guide.pcb !== report.objects[id]?.pcb) {
    throw new Error('Choose an alignment target on the same PCB.');
  }
  const follower = `${id}.${target.endsWith('.origin') ? 'origin' : 'center'}`;
  const relations = (getValue(source, ['meta', 'studio', 'relations']) ||
    {}) as Record<string, Ownership>;
  const depends = (members: string[], seen = new Set<string>()): boolean =>
    members.some((member) => {
      if (member === id) {
        return true;
      }
      if (seen.has(member)) {
        return false;
      }
      seen.add(member);
      const refs = Object.entries(data.layout.constraints || {})
        .filter(
          ([name, rule]) =>
            (rule.type === 'aligned' &&
              [`${member}.center`, `${member}.origin`].includes(
                rule.refs[0]
              )) ||
            ownersOf(relations[name] || {}).some(
              (owner) => owner.object === member
            )
        )
        .flatMap(([, rule]) =>
          rule.refs
            .flatMap((ref) => snapTargets(report).guides[ref]?.members || [])
            .filter((id) => id !== member)
        );
      const parent = data.layout.objects?.[member]?.placement?.ref
        ?.replace(/^objects\./, '')
        .split('.')[0];
      return depends(parent ? [...refs, parent] : refs, seen);
    });
  if (depends(guide.members)) {
    throw new Error('This alignment would create a dependency cycle.');
  }
  return { data, item, guide, follower };
}

function addRelation(source: string, id: string, rule: StudioRule): string {
  const data = readStudio(source);
  const name = nextId(
    Object.keys(data.layout.constraints || {}),
    rule.type === 'aligned' ? 'alignment' : 'distance'
  );
  const solve = data.layout.objects![id].placement?.solve || [];
  const added = ['x', 'y'].filter((axis) => !solve.includes(axis));
  let next = setValue(
    source,
    ['layout', 'objects', id, 'placement', 'solve'],
    Array.from(new Set([...solve, ...added]))
  );
  next = setValue(next, ['layout', 'constraints', name], rule);
  return setValue(next, ['meta', 'studio', 'relations', name], {
    object: id,
    added,
  });
}

export function alignObject(
  source: string,
  id: string,
  target: string,
  axis: 'x' | 'y',
  report: LayoutReport
): string {
  const { data, item, guide, follower } = relationTarget(
    source,
    id,
    target,
    report
  );
  const existing = Object.values(data.layout.constraints || {}).some(
    (rule) =>
      rule.type === 'aligned' &&
      rule.refs[0] === follower &&
      rule.refs[1] === target &&
      rule.axis === axis
  );
  if (existing) {
    return source;
  }
  return addRelation(source, id, {
    type: 'aligned',
    refs: [follower, target],
    axis,
    label: `${item.label || id} ${target.endsWith('.origin') ? 'origin aligned with' : 'centered on'} ${guide.label}`,
  });
}

export function distanceObject(
  source: string,
  id: string,
  target: string,
  value: Dimension,
  report: LayoutReport
): string {
  const { item, guide } = relationTarget(source, id, target, report);
  return addRelation(ensurePitchUnits(source), id, {
    type: 'distance',
    refs: [target, `${id}.center`],
    value,
    label: `${item.label || id} · ${value} from ${guide.label}`,
  });
}

type Owner = { object: string; added: string[] };
type Ownership = { object?: string; added?: string[]; owners?: Owner[] };
const ownersOf = (value: Ownership): Owner[] =>
  value.owners ||
  (value.object ? [{ object: value.object, added: value.added || [] }] : []);

export function unlinkRelation(
  source: string,
  name: string,
  report: LayoutReport
): string {
  const owned = getValue(source, ['meta', 'studio', 'relations', name]) as
    | Ownership
    | undefined;
  let next = removeValue(source, ['layout', 'constraints', name]);
  if (!owned) {
    return next;
  }
  next = removeValue(next, ['meta', 'studio', 'relations', name]);
  for (const owner of ownersOf(owned)) {
    const remaining = (getValue(next, ['meta', 'studio', 'relations']) ||
      {}) as Record<string, Ownership>;
    const dependent = Object.entries(remaining).find(([, value]) =>
      ownersOf(value).some((item) => item.object === owner.object)
    );
    if (dependent) {
      const owners = ownersOf(dependent[1]).map((item) =>
        item.object === owner.object
          ? {
              ...item,
              added: Array.from(new Set([...item.added, ...owner.added])),
            }
          : item
      );
      next = setValue(next, ['meta', 'studio', 'relations', dependent[0]], {
        owners,
      });
      continue;
    }
    const current = report.objects[owner.object];
    if (!current) {
      continue;
    }
    // Bake the solved pose; remove only freedoms owned by the released relationship.
    const nominal = resolve(readStudio(next)).objects[owner.object];
    next = moveTargets(
      next,
      { section: 'objects', id: owner.object },
      current.position.map((v, i) => v - nominal.position[i]),
      report
    );
    const data = readStudio(next);
    const referenced = Object.values(data.layout.constraints || {}).some(
      (rule) =>
        rule.refs.some(
          (ref) => ref.replace(/^objects\./, '').split('.')[0] === owner.object
        )
    );
    if (referenced) {
      continue;
    }
    const solve = data.layout.objects?.[owner.object].placement?.solve || [];
    next = setValue(
      next,
      ['layout', 'objects', owner.object, 'placement', 'solve'],
      solve.filter((axis) => !owner.added.includes(axis))
    );
  }
  return next;
}

// Retain the accepted drop pose; the relationship is a separate undoable edit.
export function keepSnapRelation(
  source: string,
  snap: LayoutSnap,
  report: LayoutReport
): string {
  if ((snap.kind === 'center' || snap.kind === 'origin') && snap.axis) {
    return alignObject(source, snap.moving, snap.target, snap.axis, report);
  }
  if (snap.kind === 'edge') {
    return attachObject(source, snap.moving, snap.target, [0, 0, 0], report);
  }
  throw new Error(
    'Snap to an object or center guide before keeping a relationship.'
  );
}

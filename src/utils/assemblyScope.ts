import {
  defaultSetup,
  type DesignSetup,
  type KeyAssembly,
} from './designSetup';
import { applyAssembly } from './applyAssembly';
import { keySetup } from './keyOptions';
import { getValue, readStudio, removeValue, setValue } from './studioSource';

export type AssemblyScope =
  | { kind: 'board' }
  | { kind: 'matrix'; cluster: string }
  | { kind: 'column'; cluster: string; column: string }
  | { kind: 'keys'; ids: string[] };
const ASSEMBLY_FIELDS = [
  'assemblyTemplate',
  'diode',
  'led',
  'diodeAt',
  'ledAt',
] as const;

function scopePath(scope: Exclude<AssemblyScope, { kind: 'keys' }>): string[] {
  if (scope.kind === 'board') {
    return ['meta', 'studio', 'defaults'];
  }
  if (scope.kind === 'matrix') {
    return ['meta', 'studio', 'layouts', scope.cluster];
  }
  return ['meta', 'studio', 'columns', scope.cluster, scope.column];
}
function parentScope(source: string, scope: AssemblyScope): AssemblyScope {
  if (scope.kind === 'keys') {
    const item = readStudio(source).layout.objects?.[scope.ids[0]];
    if (!item?.cluster) {
      return { kind: 'board' };
    }
    return item.cell?.[0]
      ? { kind: 'column', cluster: item.cluster, column: item.cell[0] }
      : { kind: 'matrix', cluster: item.cluster };
  }
  return scope.kind === 'column'
    ? { kind: 'matrix', cluster: scope.cluster }
    : { kind: 'board' };
}
function signature(setup: DesignSetup): string {
  return JSON.stringify([
    setup.family,
    setup.mounting,
    setup.diode,
    setup.led,
    setup.template.switch,
    setup.template.diode,
    setup.template.led,
  ]);
}
export function scopeAssembly(
  source: string,
  scope: AssemblyScope
): DesignSetup {
  if (scope.kind === 'keys') {
    return (
      keySetup(source, scope.ids[0]) ||
      scopeAssembly(source, parentScope(source, scope))
    );
  }
  let setup =
    scope.kind === 'board'
      ? {
          ...defaultSetup(),
          ...(getValue(source, [
            'meta',
            'studio',
            'setup',
          ]) as Partial<DesignSetup>),
        }
      : scopeAssembly(source, parentScope(source, scope));
  const custom = (getValue(source, scopePath(scope)) || {}) as {
    assemblyTemplate?: string;
    diode?: boolean;
    led?: boolean;
    diodeAt?: number[];
    ledAt?: number[];
  };
  const template =
    custom.assemblyTemplate &&
    (getValue(source, [
      'meta',
      'studio',
      'templates',
      custom.assemblyTemplate,
    ]) as KeyAssembly | undefined);
  if (template) {
    setup = { ...setup, ...template.options, template };
  }
  return {
    ...setup,
    diode: custom.diode ?? setup.diode,
    led: custom.led ?? setup.led,
    template: {
      ...setup.template,
      diode: {
        ...setup.template.diode,
        ...(custom.diodeAt
          ? { at: custom.diodeAt.slice(0, 2) as [number, number] }
          : {}),
      },
      led: {
        ...setup.template.led,
        ...(custom.ledAt
          ? { at: custom.ledAt.slice(0, 2) as [number, number] }
          : {}),
      },
    },
  };
}
export function hasAssemblyOverride(
  source: string,
  scope: AssemblyScope
): boolean {
  if (scope.kind === 'board') {
    return false;
  }
  if (scope.kind === 'keys') {
    return scope.ids.some((id) => {
      const item = readStudio(source).layout.objects?.[id];
      if (item?.properties?.assembly_override) {
        return true;
      }
      return (
        signature(scopeAssembly(source, { kind: 'keys', ids: [id] })) !==
        signature(
          scopeAssembly(
            source,
            parentScope(source, { kind: 'keys', ids: [id] })
          )
        )
      );
    });
  }
  return ASSEMBLY_FIELDS.some(
    (field) => getValue(source, [...scopePath(scope), field]) !== undefined
  );
}
function inheritedKeys(source: string, scope: AssemblyScope): string[] {
  if (scope.kind === 'keys') {
    return scope.ids;
  }
  return Object.entries(readStudio(source).layout.objects || {})
    .filter(([id, item]) => {
      if (
        item.kind !== 'key' ||
        (scope.kind !== 'board' && item.cluster !== scope.cluster) ||
        (scope.kind === 'column' && item.cell?.[0] !== scope.column)
      ) {
        return false;
      }
      if (hasAssemblyOverride(source, { kind: 'keys', ids: [id] })) {
        return false;
      }
      if (
        scope.kind === 'board' &&
        item.cluster &&
        hasAssemblyOverride(source, { kind: 'matrix', cluster: item.cluster })
      ) {
        return false;
      }
      if (
        scope.kind !== 'column' &&
        item.cluster &&
        item.cell?.[0] &&
        hasAssemblyOverride(source, {
          kind: 'column',
          cluster: item.cluster,
          column: item.cell[0],
        })
      ) {
        return false;
      }
      return true;
    })
    .map(([id]) => id);
}
function clearScope(
  source: string,
  scope: Exclude<AssemblyScope, { kind: 'keys' }>
): string {
  return ASSEMBLY_FIELDS.reduce(
    (next, field) => removeValue(next, [...scopePath(scope), field]),
    source
  );
}
export function applyScopeAssembly(
  source: string,
  scope: AssemblyScope,
  setup: DesignSetup
): string {
  const data = readStudio(source);
  if (
    scope.kind !== 'board' &&
    scope.kind !== 'keys' &&
    data.layout.clusters?.[scope.cluster]?.locked
  ) {
    throw new Error('Unlock this matrix before changing its assembly.');
  }
  const ids = inheritedKeys(source, scope).filter(
    (id) =>
      scope.kind !== 'board' ||
      (!data.layout.objects?.[id]?.locked &&
        !data.layout.clusters?.[data.layout.objects?.[id]?.cluster || '']
          ?.locked)
  );
  let next = applyAssembly(
    source,
    ids,
    setup,
    scope.kind === 'keys' ? 'replace' : 'preserve'
  );
  if (scope.kind === 'keys') {
    for (const id of ids) {
      next = setValue(
        next,
        ['layout', 'objects', id, 'properties', 'assembly_override'],
        true
      );
    }
    return next;
  }
  const templates = getValue(next, ['meta', 'studio', 'templates']) as Record<
    string,
    KeyAssembly
  >;
  const template = Object.values(templates).find(
    (template) =>
      template.options &&
      signature({ ...setup, ...template.options, template }) ===
        signature(setup)
  );
  if (!template) {
    throw new Error('The assembly recipe could not be saved.');
  }
  next = setValue(
    clearScope(next, scope),
    [...scopePath(scope), 'assemblyTemplate'],
    template.name
  );
  if (scope.kind === 'board') {
    next = setValue(next, ['meta', 'studio', 'setup'], { ...setup, template });
  }
  return next;
}
export function resetScopeAssembly(
  source: string,
  scope: AssemblyScope
): string {
  if (scope.kind === 'board') {
    return source;
  }
  if (scope.kind === 'keys') {
    return scope.ids.reduce((next, id) => {
      const target: AssemblyScope = { kind: 'keys', ids: [id] };
      next = applyAssembly(
        next,
        [id],
        scopeAssembly(next, parentScope(next, target)),
        'replace'
      );
      return removeValue(next, [
        'layout',
        'objects',
        id,
        'properties',
        'assembly_override',
      ]);
    }, source);
  }
  if (readStudio(source).layout.clusters?.[scope.cluster]?.locked) {
    throw new Error('Unlock this matrix before resetting its assembly.');
  }
  const ids = inheritedKeys(source, scope);
  const next = clearScope(source, scope);
  return applyAssembly(next, ids, scopeAssembly(next, scope), 'replace');
}

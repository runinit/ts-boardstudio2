export function findingTarget(path: string) {
  if (path === 'meta.studio.setup.controller') {
    return { editor: 'controller', label: 'Open controller editor' } as const;
  }
  if (path.startsWith('meta.studio.setup')) {
    return { editor: 'setup', label: 'Open Design setup' } as const;
  }
  if (path === 'layout' || path.startsWith('layout.')) {
    return { editor: 'layout', label: 'Open layout Inspector' } as const;
  }
  if (path === 'units' || path.startsWith('units.')) {
    return { editor: 'parameters', label: 'Open parameters' } as const;
  }
  if (path === 'designs' || path.startsWith('designs.')) {
    return { editor: 'case', label: 'Open Case' } as const;
  }
  return { editor: 'code', label: 'Review source in Code' } as const;
}

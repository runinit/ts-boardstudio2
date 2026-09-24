import type { CompiledFootprint, PartDefinition, Side } from '../../contracts/src/index.ts';
import compiledCatalog from './generated/builtin-catalog.json' with { type: 'json' };

const catalog = compiledCatalog as CompiledFootprint[];

export function builtinDefinitions(): PartDefinition[] {
  return catalog.filter((entry) => entry.geometry.side === 'front').map((entry) => structuredClone(entry.definition));
}

export function builtinCompiled(id: string, side: Side = 'front'): CompiledFootprint | undefined {
  const entry = catalog.find((item) => item.definition.id === id && item.geometry.side === side);
  return entry && structuredClone(entry);
}

export function builtinCatalog(): CompiledFootprint[] {
  return structuredClone(catalog);
}

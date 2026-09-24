import type { CompiledFootprint, PartDefinition } from '@boardstudio/v2-contracts';
import { isErgogen } from '@boardstudio/v2-ergogen';
import { canUseBuiltinDefault } from './builtinPreview';

export function libraryPreviewFor(
  definition: PartDefinition,
  compiled: CompiledFootprint[],
  catalog: CompiledFootprint[],
): CompiledFootprint | undefined {
  const result = compiled.find((entry) => entry.definition.id === definition.id);
  if (result) return result;
  const fallback = catalog.find((entry) => entry.definition.id === definition.id && entry.geometry.side === 'front');
  return canUseBuiltinDefault(definition, fallback) ? fallback : undefined;
}

export function libraryPreviewsToCompile(
  definitions: PartDefinition[],
  catalog: CompiledFootprint[],
): PartDefinition[] {
  const unique = new Map(definitions.map((definition) => [definition.id, definition]));
  return [...unique.values()].filter((definition) => {
    if (isErgogen(definition.generator?.source)) return false;
    const fallback = catalog.find((entry) => entry.definition.id === definition.id && entry.geometry.side === 'front');
    return !canUseBuiltinDefault(definition, fallback);
  });
}

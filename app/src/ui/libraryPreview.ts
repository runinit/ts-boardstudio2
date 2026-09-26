import type { CompiledFootprint, PartDefinition } from '@boardstudio/v2-contracts';
import { isErgogen } from '@boardstudio/v2-ergogen';

export function libraryPreviewFor(
  definition: PartDefinition,
  compiled: CompiledFootprint[],
): CompiledFootprint | undefined {
  return compiled.find((entry) => entry.definition.id === definition.id);
}

export function libraryPreviewsToCompile(
  definitions: PartDefinition[],
): PartDefinition[] {
  const unique = new Map(definitions.map((definition) => [definition.id, definition]));
  return [...unique.values()].filter((definition) => !isErgogen(definition.generator?.source));
}

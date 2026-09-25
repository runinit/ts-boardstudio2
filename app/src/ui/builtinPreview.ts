import type { CompiledFootprint, PartDefinition } from '@boardstudio/v2-contracts';

export const canUseBuiltinDefault = (
  definition: PartDefinition | undefined,
  compiled: CompiledFootprint | undefined,
): boolean => Boolean(definition
  && compiled
  && !definition.kicadSource
  && definition.envelopeSource?.courtyard !== 'authored'
  && JSON.stringify(definition.generator?.parameters) === JSON.stringify(compiled.definition.generator?.parameters)
  && JSON.stringify(definition.courtyard) === JSON.stringify(compiled.definition.courtyard)
  && JSON.stringify(definition.pads) === JSON.stringify(compiled.definition.pads));

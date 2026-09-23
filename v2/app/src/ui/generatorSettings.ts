import type { PartDefinition } from '../../../contracts/src/index';
import { compileFootprint } from '@boardstudio/v2-kicad';

type Parameter = 'padSpacing' | 'padSize' | 'padDrill';
type Field = { key: Parameter; label: string; fallback: number };
export type GeneratorEdits = Record<string, string | boolean>;

const fields: Record<string, Field[]> = {
  'builtin:mx-switch': [
    { key: 'padSpacing', label: 'Pad spacing', fallback: 6.35 },
    { key: 'padSize', label: 'Pad size', fallback: 2.286 },
    { key: 'padDrill', label: 'Pad drill', fallback: 1.4986 },
  ],
  'builtin:choc-switch': [
    { key: 'padSpacing', label: 'Pad spacing', fallback: 5 },
    { key: 'padSize', label: 'Pad size', fallback: 2.032 },
    { key: 'padDrill', label: 'Pad drill', fallback: 1.27 },
  ],
  'builtin:mx-hotswap': [
    { key: 'padSpacing', label: 'Pad spacing', fallback: 12.952 },
    { key: 'padSize', label: 'Pad size', fallback: 2.6 },
  ],
  'builtin:choc-hotswap': [
    { key: 'padSpacing', label: 'Pad spacing', fallback: 11.55 },
    { key: 'padSize', label: 'Pad size', fallback: 2.6 },
  ],
  'builtin:rgb-led': [
    { key: 'padSpacing', label: 'Pad spacing', fallback: 5.4 },
    { key: 'padSize', label: 'Pad size', fallback: 1.1 },
  ],
};

export const numericFields = (definition?: PartDefinition): Field[] => fields[definition?.generator?.source ?? ''] ?? [];

export function generatorDraft(definition: PartDefinition, edits: GeneratorEdits): { definition: PartDefinition; error: string } {
  if (!definition.generator) {
    return { definition, error: '' };
  }

  const parameters = { ...definition.generator.parameters };
  for (const field of numericFields(definition)) {
    const input = edits[field.key];
    if (input === undefined) {
      continue;
    }
    const value = Number(input);
    if (typeof input !== 'string' || input.trim() === '' || !Number.isFinite(value) || value <= 0) {
      return { definition, error: `${field.label} must be greater than zero.` };
    }
    parameters[field.key] = value;
  }

  for (const key of ['reversible', 'includeTracesVias']) {
    if (typeof edits[key] === 'boolean') {
      parameters[key] = edits[key];
    }
  }

  const draft = { ...definition, generator: { ...definition.generator, parameters } };
  try {
    compileFootprint(draft);
    return { definition: draft, error: '' };
  } catch (error) {
    return { definition, error: error instanceof Error ? error.message : String(error) };
  }
}

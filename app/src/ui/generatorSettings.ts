import type { JsonValue, PartDefinition } from '../../../contracts/src/index';
import { bundledModel } from '../bundledModels';
import { geometry as ergogenGeometry, isErgogen, modelAssetId, normalizeDefinition, parameters as ergogenParameters, render as renderErgogen } from '@boardstudio/v2-ergogen';

export type GeneratorEdits = Record<string, JsonValue>;

export const generatorParameters = (definition?: PartDefinition) => {
  const source = definition?.generator?.source;
  return source && isErgogen(source) ? ergogenParameters(source) : {};
};

export function generatorDraft(definition: PartDefinition, edits: GeneratorEdits, assets: ReadonlyMap<string, string> = new Map()): { definition: PartDefinition; error: string } {
  if (!definition.generator) {
    return { definition, error: '' };
  }

  const parameters = { ...definition.generator.parameters };
  const draft = { ...definition, generator: { ...definition.generator, parameters } };
  try {
    if (isErgogen(draft.generator.source)) {
      const schema = ergogenParameters(draft.generator.source);
      for (const [key, parameter] of Object.entries(schema)) {
        const input = edits[key];
        if (input === undefined) continue;
        if (parameter.type === 'number') {
          const value = typeof input === 'number' ? input : typeof input === 'string' && input.trim() !== '' ? Number(input) : NaN;
          if (!Number.isFinite(value)) throw new Error(`${key.replaceAll('_', ' ')} must be a finite number.`);
          draft.generator.parameters[key] = value;
        } else if (parameter.type === 'boolean') {
          if (typeof input !== 'boolean') throw new Error(`${key.replaceAll('_', ' ')} must be true or false.`);
          draft.generator.parameters[key] = input;
        } else if (parameter.type === 'string' || parameter.type === 'net') {
          if (typeof input !== 'string') throw new Error(`${key.replaceAll('_', ' ')} must be text.`);
          draft.generator.parameters[key] = input;
        } else if (parameter.type === 'array' || parameter.type === 'object' || parameter.type === 'anchor') {
          let value: JsonValue;
          if (typeof input === 'string') {
            try { value = JSON.parse(input) as JsonValue; } catch { throw new Error(`${key.replaceAll('_', ' ')} must contain valid JSON.`); }
          } else value = input;
          const validObject = value !== null && typeof value === 'object' && !Array.isArray(value);
          if ((parameter.type === 'array' && !Array.isArray(value)) || ((parameter.type === 'object' || parameter.type === 'anchor') && !validObject)) {
            throw new Error(`${key.replaceAll('_', ' ')} must be ${parameter.type === 'array' ? 'a JSON array' : 'a JSON object'}.`);
          }
          draft.generator.parameters[key] = value;
        }
      }
      for (const [key, value] of Object.entries(draft.generator.parameters)) {
        if (!/3dmodel_filename$/iu.test(key) || typeof value !== 'string' || !value.trim()) continue;
        const assetId = modelAssetId(value);
        const filename = assetId ? assets.get(assetId) ?? bundledModel(assetId)?.filename : undefined;
        if (!assetId || !filename || !/\.(step|stp|stl|wrl)$/iu.test(filename)) {
          throw new Error(`${key.replaceAll('_', ' ')} must reference a bundled model or an attached STEP / STL / WRL file.`);
        }
      }
      ergogenGeometry(renderErgogen(draft));
      return { definition: normalizeDefinition(draft), error: '' };
    }
    throw new Error(`Unsupported footprint generator: ${draft.generator.source}`);
  } catch (error) {
    return { definition, error: error instanceof Error ? error.message : String(error) };
  }
}

import { describe, expect, it } from 'vitest';
import { catalogue } from '@boardstudio/v2-ergogen';
import { compileFootprint } from '@boardstudio/v2-kicad';
import { generatorDraft, generatorParameters } from './generatorSettings';

describe('Ergogen generator settings', () => {
  it('applies string, boolean and finite numeric settings including zero and negatives', () => {
    const definition = catalogue().find((item) => item.generator?.source === 'ceoloide/utility_text');
    expect(definition).toBeDefined();
    const result = generatorDraft(definition!, { text: 'Board mark', reversible: true, width: '0', thickness: '-0.2' });
    expect(result.error).toBe('');
    expect(result.definition.generator?.parameters).toMatchObject({ text: 'Board mark', reversible: true, width: 0, thickness: -0.2 });
    const geometry = compileFootprint(result.definition);
    expect(geometry.pads).toHaveLength(0);
    expect(geometry.courtyard).toHaveLength(0);
  });

  it('parses structured settings as JSON and reports malformed JSON', () => {
    const definition = catalogue().find((item) => Object.values(generatorParameters(item)).some(({ type }) => type === 'array' || type === 'object'));
    expect(definition).toBeDefined();
    const structured = Object.entries(generatorParameters(definition!)).find(([, parameter]) => parameter.type === 'array' || parameter.type === 'object');
    expect(structured).toBeDefined();
    const [key, parameter] = structured!;
    const json = parameter.type === 'array' ? '[1, "x"]' : '{"x": 1}';
    const result = generatorDraft(definition!, { [key]: json });
    expect(result.error).toBe('');
    expect(result.definition.generator?.parameters[key]).toEqual(JSON.parse(json));
    expect(generatorDraft(definition!, { [key]: '[' }).error).toMatch(/valid JSON/u);
  });

  it('retains committed false, zero, and empty generator values without replacing them with defaults', () => {
    const base = catalogue().find((item) => item.generator?.source === 'ceoloide/utility_text')!;
    const definition = { ...base, generator: { ...base.generator!, parameters: { ...base.generator!.parameters, reversible: false, width: 0, text: '' } } };
    const result = generatorDraft(definition, {});
    expect(result.error).toBe('');
    expect(result.definition.generator?.parameters).toMatchObject({ reversible: false, width: 0, text: '' });
  });

  it('rejects an unsupported model filename and invalid keycap dimensions', () => {
    const definition = catalogue().find((item) => item.generator?.source === 'ceoloide/switch_mx')!;
    expect(generatorDraft(definition, { switch_3dmodel_filename: 'missing.step' }).error).toMatch(/bundled model or an attached STEP \/ WRL/u);
    expect(generatorDraft(definition, { switch_3dmodel_filename: 'boardstudio-asset:local' }, new Map([['local', 'model.obj']])).error).toMatch(/bundled model or an attached STEP \/ WRL/u);
    expect(generatorDraft(definition, { switch_3dmodel_filename: 'boardstudio-asset:local' }, new Map([['local', 'model.step']])).error).toBe('');
    expect(generatorDraft(definition, { keycap_width: '0' }).error).toMatch(/greater than zero/u);
  });
});

import { expect, it } from 'vitest';
import { catalogue, render, child, value } from '@boardstudio/v2-ergogen';
import { assemblyPreset } from './assemblyPresets';

it('puts configured switch sockets on the back so switch housings face up', () => {
  const definitions = catalogue();
  for (const id of ['mx-hotswap', 'choc-hotswap']) {
    const member = assemblyPreset(id, definitions).members[0];
    const original = definitions.find(d => d.id === member.definitionId)!;
    const definition = {...original, generator: {...original.generator!, parameters: {...original.generator!.parameters, ...member.parameters}}};
    const footprint = render(definition).find(form => form[0] === 'footprint' || form[0] === 'module')!;
    expect(value(child(footprint, 'layer')?.[1])).toBe('B.Cu');
  }
});

it('uses the bundled LED definition for RGB presets', () => {
  const definitions = catalogue();
  const led = assemblyPreset('mx-hotswap-rgb', definitions).members.find(m => m.id === 'led')!;
  expect(definitions.find(d => d.id === led.definitionId)?.generator?.source).toBe('ceoloide/led_sk6812mini-e');
});

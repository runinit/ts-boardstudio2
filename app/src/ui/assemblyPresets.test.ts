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

it('centres reverse-mounted MINI-E LEDs inside the opposite switch cavity in both orientations', () => {
  const definitions = catalogue();
  for (const id of ['mx-rgb', 'mx-hotswap-rgb', 'choc-rgb', 'choc-hotswap-rgb']) {
    for (const orientation of ['south', 'north'] as const) {
      const assembly = assemblyPreset(id, definitions, orientation);
      const main = assembly.members[0];
      const led = assembly.members.find(member => member.id === 'led')!;
      const distance = id.includes('choc') ? 4.7 : 4.75;
      expect(led.pose.at).toEqual({ x: 0, y: orientation === 'north' ? distance : -distance });
      expect(main.pose.rotation).toBe(orientation === 'north' ? 180 : 0);
      expect(led.side).toBe('back');
      expect(led.parameters).toMatchObject({ side: 'B', reverse_mount: true, reversible: false });
      const source = definitions.find(definition => definition.id === led.definitionId)!;
      const forms = render({ ...source, generator: { ...source.generator!, parameters: { ...source.generator!.parameters, ...led.parameters } } });
      const footprint = forms.find(form => form[0] === 'footprint')!;
      expect(value(child(footprint, 'layer')?.[1])).toBe('B.Cu');
      expect(footprint.filter(form => Array.isArray(form) && form[0] === 'pad').every(form => form[2] === 'smd')).toBe(true);
      expect(JSON.stringify(footprint)).toContain('Edge.Cuts');
    }
  }
});

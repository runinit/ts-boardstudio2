import type {
  AssemblyDefinition,
  AssemblyMember,
  PartDefinition,
} from '@boardstudio/v2-contracts';
export function assemblyPreset(
  id: string,
  definitions: PartDefinition[],
): AssemblyDefinition {
  const source = id.includes('choc')
    ? 'ceoloide/switch_choc_v1_v2'
    : 'ceoloide/switch_mx';
  const main = definitions.find((d) => d.generator?.source === source)!;
  const diode = definitions.find(
    (d) => d.generator?.source === 'ceoloide/diode_tht_sod123',
  )!;
  const members: AssemblyMember[] = [
    {
      id: 'switch',
      definitionId: main.id,
      pose: { at: { x: 0, y: 0 }, rotation: 0 },
      side: 'front',
      models: [],
      parameters: {
        hotswap: id.includes('hotswap'),
        solder: !id.includes('hotswap'),
        reversible: false,
        // Generator side names the socket, opposite the switch housing.
        side: 'B',
      },
    },
  ];
  if (diode)
    members.push({
      id: 'diode',
      definitionId: diode.id,
      pose: { at: { x: 6, y: -10 }, rotation: 0 },
      side: 'back',
      models: [],
    });
  if (id.includes('rgb')) {
    const led =
      definitions.find(
        (d) => d.generator?.source === 'ceoloide/led_sk6812mini-e',
      ) ?? definitions.find((d) => d.id === 'rgb-led');
    if (led)
      members.push({
        id: 'led',
        definitionId: led.id,
        pose: { at: { x: -5, y: -12 }, rotation: 0 },
        side: 'back',
        models: [],
      });
  }
  return {
    id: crypto.randomUUID(),
    name: id.split('-').join(' ').toUpperCase(),
    members,
  };
}

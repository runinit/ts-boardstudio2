import type { PartDefinition } from '@boardstudio/v2-contracts';

const preferredNames: Record<string, string> = {
  'ergogen:ceoloide/switch_mx': 'MX switch',
  'ergogen:ceoloide/switch_choc_v1_v2': 'Choc V1 / V2 switch',
  'ergogen:ceoloide/switch_gateron_ks27_ks33': 'Gateron KS27 / KS33 switch',
  'ergogen:ceoloide/diode_tht_sod123': 'Matrix diode (SOD-123 / THT)',
  'ergogen:ceoloide/led_sk6812mini-e': 'SK6812 MINI-E',
};

const replacements: Record<string, string> = {
  'mx-switch': 'ergogen:ceoloide/switch_mx',
  'mx-hotswap': 'ergogen:ceoloide/switch_mx',
  'choc-switch': 'ergogen:ceoloide/switch_choc_v1_v2',
  'choc-hotswap': 'ergogen:ceoloide/switch_choc_v1_v2',
  'matrix-diode': 'ergogen:ceoloide/diode_tht_sod123',
  'rgb-led': 'ergogen:ceoloide/led_sk6812mini-e',
  'ergogen:infused-kim/choc': 'ergogen:ceoloide/switch_choc_v1_v2',
  'ergogen:infused-kim/diode': 'ergogen:ceoloide/diode_tht_sod123',
};

export function replacementPartId(definition: PartDefinition): string | undefined {
  const expectedSource = definition.id.startsWith('ergogen:') ? definition.id.slice(8) : `builtin:${definition.id}`;
  return !definition.kicadSource && definition.generator?.source === expectedSource ? replacements[definition.id] : undefined;
}

export function partCatalogLabel(definition: PartDefinition): string {
  return preferredNames[definition.id] ?? definition.name;
}

export function partCatalogSearchText(definition: PartDefinition): string {
  const aliases = definition.id === 'ergogen:ceoloide/led_sk6812mini-e' ? 'RGB LED reverse mount' : definition.kind === 'switch' ? 'solder hotswap' : '';
  return `${partCatalogLabel(definition)} ${definition.name} ${definition.kind} ${definition.generator?.source ?? ''} ${aliases}`;
}

// These are placement snapshots, not additional library products. Keep them
// resolvable for saved projects and selectable only where already assigned.
const isAssemblySnapshot = (definition: PartDefinition) => !definition.kicadSource && /^(?:assembly-.+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/definition\//i.test(definition.id);

export function partChoices(definitions: PartDefinition[], currentId?: string): PartDefinition[] {
  return definitions.filter(definition => definition.id === currentId || (!replacementPartId(definition) && !isAssemblySnapshot(definition)));
}

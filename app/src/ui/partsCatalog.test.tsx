import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { builtinDefinitions } from '@boardstudio/v2-kicad';
import { catalogue } from '@boardstudio/v2-ergogen';
import { PartsLibrary } from './PartsLibrary';

it('offers canonical key parts without duplicate legacy choices', () => {
  const definitions = [...builtinDefinitions(), ...catalogue()];
  const before = structuredClone(definitions);
  const markup = renderToStaticMarkup(<PartsLibrary definitions={definitions} assemblies={[]} selected="" query="" onSearch={() => {}} onSelect={() => {}} onAssembly={() => {}} />);
  expect(markup).not.toContain('title="builtin:mx-switch"');
  expect(markup).not.toContain('title="infused-kim/choc"');
  expect(markup).not.toContain('title="infused-kim/diode"');
  expect(markup).toContain('title="ceoloide/switch_mx"');
  expect(markup).toContain('SK6812 MINI-E');
  expect(definitions).toEqual(before);
});

import { partChoices, replacementPartId } from './partsCatalog';

it('retains every definition for resolution while hiding exactly eight bundled duplicates', () => {
  const definitions = [...builtinDefinitions(), ...catalogue()];
  const visible = partChoices(definitions);
  expect(visible).toHaveLength(definitions.length - 8);
  expect(visible.filter(definition => definition.kind === 'switch')).toHaveLength(3);
  for (const definition of definitions.filter(item => replacementPartId(item))) {
    expect(definitions).toContain(definition);
    expect(partChoices(definitions, definition.id)).toContain(definition);
    expect(visible).not.toContain(definition);
  }
});

it('does not deduplicate custom parts by name or by their underlying generator', () => {
  const builtin = builtinDefinitions()[0];
  const custom = { ...builtin, id: 'custom-switch', name: 'MX switch' };
  const imported = { ...builtin, kicadSource: { formatVersion: 1 as const, source: '(footprint Custom)' } };
  expect(partChoices([builtin, custom, imported])).toEqual([custom, imported]);
});

it('keeps placement snapshots out of the catalog without losing existing assignments', () => {
  const builtin = builtinDefinitions()[0];
  const snapshots = ['assembly-preset-mx-rgb-south-matrix-0/definition/switch', '25aa53b5-59f9-4808-82a5-0b3027aecc9f/definition/switch'].map(id => ({ ...builtin, id }));
  expect(partChoices(snapshots)).toEqual([]);
  expect(partChoices(snapshots, snapshots[1].id)).toEqual([snapshots[1]]);
});

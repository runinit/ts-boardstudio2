import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { emptyProject, type PartDefinition } from '@boardstudio/v2-contracts';
import { catalogue } from '@boardstudio/v2-ergogen';
import { LibraryWorkspace } from './LibraryWorkspace';
import { sampleAssembly } from './sampleAssembly';

const doc = emptyProject('preview', 'Preview');
const switches = catalogue();
const mx = switches.find(item => item.generator?.source === 'ceoloide/switch_mx')!;
const display = (definition: PartDefinition, rotation = 0) => renderToStaticMarkup(<LibraryWorkspace document={doc} definition={definition} rotation={rotation} show3d={false} onViewChange={() => {}} colorScheme="dark" />);

it('uses generator keycap dimensions for the displayed outline without changing the definition', () => {
  const definition = { ...mx, generator: { ...mx.generator!, parameters: { keycap_width: 30, keycap_height: 17 } } };
  const before = structuredClone(definition);
  const markup = display(definition);
  expect(markup).toContain('points="-15,8.5 15,8.5 15,-8.5 -15,-8.5"');
  expect(markup).toContain('Keycap 30.0 × 17.0 mm');
  expect(definition).toEqual(before);
});

it('shows an explicitly defined keycap on socket definitions regardless of catalog category', () => {
  const definition = { ...mx, kind: 'connector' as const, keycap: { x: 24, y: 18 }, envelopeSource: { ...mx.envelopeSource, keycap: 'authored' as const } };
  expect(display(definition, 90)).toContain('class="wb-preview-keycap"');
  expect(display(definition, 90)).toContain('rotate(-90)');
});

it('frames the 3D sample around keycaps and rotated companions without changing project data', () => {
  const definition = { ...mx, keycap: { x: 40, y: 18 }, envelopeSource: { ...mx.envelopeSource, keycap: 'authored' as const } };
  const companion: PartDefinition = { id: 'long', name: 'Long component', kind: 'custom', pads: [], courtyard: [{ x: -1, y: -12 }, { x: 1, y: -12 }, { x: 1, y: 12 }, { x: -1, y: 12 }] };
  const before = structuredClone(doc);
  const sample = sampleAssembly(doc, definition, [{ definition: companion, at: { x: 25, y: 0 }, rotation: 90, side: 'back' }]);
  const xs = sample.contours[0].points.map(point => point.x);
  expect(Math.min(...xs)).toBeLessThanOrEqual(-23);
  expect(Math.max(...xs)).toBeGreaterThanOrEqual(40);
  expect(sample.project.parts[1]).toMatchObject({ side: 'back', pose: { at: { x: 25, y: 0 }, rotation: 90 } });
  expect(doc).toEqual(before);
});

it('keeps standalone sample terminals unconnected without changing saved generator nets', () => {
  const led = switches.find(item => item.generator?.source === 'ceoloide/led_sk6812mini-e')!;
  const definition = { ...led, generator: { ...led.generator!, parameters: { ...led.generator!.parameters, VCC: 'VCC', GND: 'GND' } } };
  const sample = sampleAssembly(doc, definition);
  for (const terminal of Object.keys(definition.terminals!)) expect(sample.project.parts[0].generatorParameters?.[terminal]).toBe('');
  expect(definition.generator.parameters.VCC).toBe('VCC');
  expect(doc.nets).toHaveLength(0);
});

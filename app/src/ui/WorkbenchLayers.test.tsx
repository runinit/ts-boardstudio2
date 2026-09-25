import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Part, PartDefinition } from '../../../contracts/src/index';
import { boardLayer, footprintLayers, KeycapOverlay, SceneFootprint } from './WorkbenchLayers';

const definition: PartDefinition = { id: 'test', name: 'Test', kind: 'switch', courtyard: [], pads: [
  { id: 'smd', number: '1', at: { x: 2, y: 3 }, size: { x: 4, y: 2 }, shape: 'rect', rotation: 30, side: 'front' },
  { id: 'th', number: '2', at: { x: 0, y: 0 }, size: { x: 3, y: 3 }, shape: 'circle', drill: 1 },
  { id: 'hole', number: '', at: { x: 0, y: 5 }, size: { x: 2, y: 2 }, shape: 'circle', drill: 2, plated: false },
] };
const part = { side: 'back' } as Part;
describe('workbench geometry layers', () => {
  it('maps front/back technical layers while retaining non-sided geometry', () => {
    expect(boardLayer('F.SilkS', 'back')).toBe('B.SilkS');
    expect(boardLayer('B.Mask', 'back')).toBe('F.Mask');
    expect(boardLayer('Edge.Cuts', 'back')).toBe('Edge.Cuts');
    expect(footprintLayers(definition, 'back')).toEqual(['B.Cu', 'F.Cu']);
  });
  it('keeps through-hole copper visible on either side and holes independent', () => {
    const markup = renderToStaticMarkup(<SceneFootprint definition={definition} part={part} hidden={new Set(['B.Cu'])} />);
    expect(markup.match(/class="wb-part-pad"/g)).toHaveLength(1);
    expect(markup.match(/class="wb-part-drill"/g)).toHaveLength(2);
    const noCopper = renderToStaticMarkup(<SceneFootprint definition={definition} part={part} hidden={new Set(['Pads'])} />);
    expect(noCopper).not.toContain('class="wb-part-pad"');
    expect(noCopper.match(/class="wb-part-drill"/g)).toHaveLength(2);
  });
  it('uses pad shape, size, position and rotation instead of placeholder circles', () => {
    const markup = renderToStaticMarkup(<SceneFootprint definition={definition} part={part} hidden={new Set()} />);
    expect(markup).toContain('translate(2 3) rotate(30)');
    expect(markup).toContain('width="4" height="2" rx="0"');
  });
  it('draws the cap envelope from resolved dimensions', () => {
    const markup = renderToStaticMarkup(<KeycapOverlay size={{ x: 27, y: 18 }} />);
    expect(markup).toContain('x="-13.5" y="-9" width="27" height="18"');
  });
});

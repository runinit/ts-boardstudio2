import { describe, expect, it } from 'vitest';
import { prepareEntry } from './footprintEngine';
import { createEntry } from './footprintLibrary';

describe('Footprint worker preparation', () => {
  it('previews dynamic footprints with required nets without changing their source parameters', async () => {
    const source =
      'module.exports={params:{from:undefined,to:undefined},body:p=>`(module "Dynamic" (layer F.Cu) ${p.at} (pad 1 smd rect (at 0 0) (size 1 1) (layers F.Cu) ${p.from}) (pad 2 smd rect (at 1 0) (size 1 1) (layers F.Cu) ${p.to}))`}';
    const prepared = await prepareEntry(
      createEntry('Dynamic', source, 'ergogen')
    );
    expect(prepared.info.pads).toHaveLength(2);
    expect(prepared.module).toBe(source);
    expect(prepared.parameters.from.type).toBe('net');
  });
});

it('keeps structured defaults and persists geometry defaults with placement override precedence', async () => {
  const source =
    'module.exports={params:{side:"F",reversible:false,width:1,offset:[1,2],metadata:{label:"part"}},body:p=>`(module "Settings" (layer ${p.side}.Cu) ${p.at} (pad 1 smd rect (at ${p.offset[0]} 0) (size ${p.width} 1) (layers ${p.side}.Cu)) ${p.reversible ? "(pad 2 smd rect (at 0 2) (size 1 1) (layers B.Cu))" : ""} (model "${p.side}.step" (offset (xyz 0 0 ${p.width})) (scale (xyz 1 1 1)) (rotate (xyz 0 0 0))))`}';
  const entry = {
    ...createEntry('Settings', source, 'ergogen'),
    parameters: { side: 'B', reversible: true, width: 3 },
  };
  const prepared = await prepareEntry(entry);
  expect(prepared.parameters.offset).toEqual({ type: 'array', value: [1, 2] });
  expect(prepared.parameters.metadata).toEqual({
    type: 'object',
    value: { label: 'part' },
  });
  expect(prepared.info.pads).toHaveLength(2);
  expect(prepared.info.pads[0].size[0]).toBe(3);
  expect(prepared.info.pads[0].layers).toContain('B.Cu');
  expect(prepared.info.models[0].path).toBe('B.step');
  expect(prepared.module).toBe(source);
  const reopened = createEntry('Reopened', prepared.resolved, 'ergogen');
  expect((await prepareEntry(reopened)).info.pads[0].size[0]).toBe(3);
  expect(
    (await prepareEntry(reopened, { width: 5 })).info.pads[0].size[0]
  ).toBe(5);
  expect(prepared.yaml).toContain('width: 3');
});

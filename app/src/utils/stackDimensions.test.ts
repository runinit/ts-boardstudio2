import { parse } from 'yaml';
import { createBoard } from './boardDefaults';
import { setValue } from './studioSource';
import { dimension, pitchUnits } from './designUnits';
import { editStackDimension, stackDimensions } from './stackDimensions';

it('uses the same gap and derived plate height from setup and a linked case', () => {
  let source = setValue(createBoard(), ['designs', 'assemblies', 'case'], {
    board: { name: 'main' },
    stackup: 'main',
    pcb_z: 6,
  });
  source = editStackDimension(source, 'main', 'gap', 4, 'case');
  const setup = stackDimensions(source, 'main');
  const enclosure = stackDimensions(source, 'main', 'case');
  expect(setup).toEqual(enclosure);
  const units = pitchUnits(source);
  expect(dimension(setup.gap, units)).toBe(4);
  expect(
    dimension(`(${setup.pcbZ}) + (${setup.pcb}) + (${setup.gap})`, units)
  ).toBe(11.6);
  expect(parse(source).units.plate_gap).toBe(4);
});
it('keeps unlinked case dimensions editable through the same controls', () => {
  let source = setValue(createBoard(), ['designs', 'assemblies', 'case'], {
    board: { name: 'main' },
    pcb_z: 6,
    pcb_thickness: 2,
    plate_z: 13,
    plate: 1.5,
  });
  expect(
    dimension(stackDimensions(source, 'main', 'case').gap, pitchUnits(source))
  ).toBe(5);
  source = editStackDimension(source, 'main', 'gap', 3, 'case');
  expect(
    dimension(parse(source).designs.assemblies.case.plate_z, pitchUnits(source))
  ).toBe(11);
});

it('uses the enclosure PCB datum when its height is omitted', () => {
  const source = setValue(createBoard(), ['designs', 'assemblies', 'case'], {
    board: { name: 'main' },
    stackup: 'main',
  });
  expect(stackDimensions(source, 'main', 'case').pcbZ).toBe(6);
  expect(stackDimensions(createBoard(), 'main').pcbZ).toBe(0);
});

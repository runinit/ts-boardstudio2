import { it, expect } from 'vitest';
import { parse } from 'yaml';
import { editNativeBoard } from './nativeBoardSource';

it('updates body dimensions on the native instance used by stacking', () => {
  const source =
    'schema: ergogen/v1\nlayout: {objects: {mcu: {kind: component, part: controller}}}\n';
  const changed = editNativeBoard(source, ['board', 'components'], {
    mcu: { size: [18, 30], height: [0, 6] },
  })!;
  expect(parse(changed).layout.objects.mcu.envelopes.body.height).toEqual([
    0, 6,
  ]);
  expect(parse(changed).designs).toBeUndefined();
});

it('updates one component model list without treating indices as object IDs', () => {
  const source =
    'schema: ergogen/v1\nlayout: {objects: {mcu: {kind: component, models: [{path: controller.step, offset: [0, 0, 0]}]}, display: {kind: component, models: [{path: display.step}]}}}\n';
  const models = [{ path: 'controller.step', offset: [1, 2, 3] }];

  const changed = editNativeBoard(source, ['board', 'models', 'mcu'], models)!;

  expect(parse(changed).layout.objects.mcu.models).toEqual(models);
  expect(parse(changed).layout.objects.display).toEqual(
    parse(source).layout.objects.display
  );
  expect(Object.keys(parse(changed).layout.objects)).toEqual([
    'mcu',
    'display',
  ]);
});

import { findingTarget } from './findingTarget';

it.each([
  ['meta.studio.setup.controller', 'controller'],
  ['meta.studio.setup', 'setup'],
  ['layout', 'layout'],
  ['layout.objects.key', 'layout'],
  ['units.pitch', 'parameters'],
  ['designs.solids.case', 'case'],
  ['meta.studio.electricalFindings', 'code'],
  ['pcbs.main', 'code'],
  ['unknown', 'code'],
])('routes %s to %s', (path, editor) => {
  expect(findingTarget(path).editor).toBe(editor);
});

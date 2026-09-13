import { expect, it } from 'vitest';
import { vrmlNames } from './vrmlNames';

it('keeps comments and quoted text while resolving distinct reference names', () => {
  const source =
    '# DEF PIN-01\nWorldInfo { title "USE PIN-01" }\nDEF PIN-01 Material {} DEF PIN_01 Material {} USE PIN-01';
  const normalized = vrmlNames(source);
  expect(normalized).toContain('# DEF PIN-01');
  expect(normalized).toContain('"USE PIN-01"');
  const names = Array.from(normalized.matchAll(/(?:DEF|USE) (BS_\w+)/g)).map(
    (match) => match[1]
  );
  expect(names[0]).toBe(names[2]);
  expect(names[0]).not.toBe(names[1]);
});

it('preserves route fields and resolves their node names', () => {
  const normalized = vrmlNames(
    'DEF timer TimeSensor {} DEF target Transform {} ROUTE timer.fraction_changed TO target.set_fraction'
  );
  const names = Array.from(normalized.matchAll(/DEF (BS_\w+)/g)).map(
    (match) => match[1]
  );
  expect(normalized).toContain(
    `ROUTE ${names[0]}.fraction_changed TO ${names[1]}.set_fraction`
  );
});

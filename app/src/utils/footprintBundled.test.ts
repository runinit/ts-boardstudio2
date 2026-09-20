import { expect, it } from 'vitest';
import bundled from '../../.generated/footprints.json';
import { createEntry } from './footprintLibrary';
import { prepareEntry } from './footprintEngine';

it.each(Object.entries(bundled))(
  'prepares bundled defaults: %s',
  async (name, source) => {
    const prepared = await prepareEntry(createEntry(name, source, 'ergogen'));
    expect(prepared.module).toBe(source);
    expect(prepared.info).toBeDefined();
    expect(
      prepared.info.diagnostics.filter((item) => item.severity === 'error')
    ).toEqual([]);
  }
);

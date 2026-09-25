import { expect, test, vi } from 'vitest';
import { emptyProject } from '@boardstudio/v2-contracts';
import { resolveMechanical } from './resolveMechanical';

const document = { ...emptyProject('mechanical', 'Mechanical'), revision: 7 };
const reply = (revision: number) => ({
  id: 'request', kind: 'mechanical-resolved', assembly: {
    revision, case: { revision, bodies: [] }, plateContours: [], stack: [], diagnostics: [],
  },
});

test('resolves a captured document without accepting a different revision', async () => {
  const core = { request: vi.fn(async () => reply(6)) };
  await expect(resolveMechanical(core as never, document, [], () => true)).rejects.toThrow('different mechanical assembly revision');
  expect(core.request).toHaveBeenCalledWith({ id: expect.any(String), kind: 'resolve-mechanical', document, contours: [] });
});

test('discards a mechanical result when the captured document has become stale', async () => {
  const core = { request: vi.fn(async () => reply(7)) };
  await expect(resolveMechanical(core as never, document, [], () => false)).resolves.toBeUndefined();
});

test('rejects inconsistent case geometry revision even if the assembly revision matches', async () => {
  const response = reply(7);
  response.assembly.case.revision = 6;
  const core = { request: vi.fn(async () => response) };
  await expect(resolveMechanical(core as never, document, [], () => true)).rejects.toThrow('different mechanical assembly revision');
});

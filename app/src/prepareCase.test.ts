import { expect, test, vi } from 'vitest';
import type { CaseAssemblyIR, CoreReply } from '@boardstudio/v2-contracts';
import { prepareCase } from './prepareCase';

const requestIR: CaseAssemblyIR = { revision: 7, bodies: [] };

test('rejects a prepared reply for a different case revision', async () => {
  const core = {
    request: vi.fn(async () => ({ id: 'request', kind: 'case-prepared', ir: { revision: 6, bodies: [] } }) as CoreReply),
  };

  await expect(prepareCase(core as never, requestIR)).rejects.toThrow('Core prepared a different case revision');
  expect(core.request).toHaveBeenCalledWith({ id: expect.any(String), kind: 'prepare-case', ir: requestIR });
});

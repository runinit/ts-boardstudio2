import type { CaseAssemblyIR, PreparedCaseAssemblyIR } from '@boardstudio/v2-contracts';
import { CoreClient } from './CoreClient';

export async function prepareCase(core: CoreClient, ir: CaseAssemblyIR): Promise<PreparedCaseAssemblyIR> {
  const reply = await core.request({ id: crypto.randomUUID(), kind: 'prepare-case', ir });
  if (reply.kind === 'error') throw new Error(reply.message);
  if (reply.kind !== 'case-prepared') throw new Error('Unexpected core worker response for case preparation');
  if (reply.ir.revision !== ir.revision) throw new Error('Core prepared a different case revision');
  return reply.ir;
}

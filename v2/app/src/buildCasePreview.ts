import type { CaseAssemblyIR, CaseResult } from '@boardstudio/v2-contracts';
import { CaseClient } from './CaseClient';
import { CoreClient } from './CoreClient';
import { prepareCase } from './prepareCase';

export async function buildCasePreview(
  core: CoreClient,
  cad: CaseClient,
  ir: CaseAssemblyIR,
  isCurrent: () => boolean,
): Promise<CaseResult | undefined> {
  const prepared = await prepareCase(core, ir);
  if (!isCurrent()) return undefined;

  const result = await cad.request(prepared);
  if (!isCurrent()) return undefined;
  if (result.revision !== ir.revision) throw new Error('CAD returned a different case revision');
  return result;
}

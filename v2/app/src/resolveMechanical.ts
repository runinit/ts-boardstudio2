import type { Contour, MechanicalAssembly, ProjectDoc } from '@boardstudio/v2-contracts';
import type { CoreClient } from './CoreClient';

/** Resolve a captured document without changing the engine's document or history. */
export async function resolveMechanical(
  core: CoreClient,
  document: ProjectDoc,
  contours: Contour[],
  isCurrent: () => boolean,
): Promise<MechanicalAssembly | undefined> {
  const reply = await core.request({ id: crypto.randomUUID(), kind: 'resolve-mechanical', document, contours });
  if (!isCurrent()) return undefined;
  if (reply.kind === 'error') throw new Error(reply.message);
  if (reply.kind !== 'mechanical-resolved') throw new Error('Unexpected mechanical assembly response');
  if (reply.assembly.revision !== document.revision || reply.assembly.case.revision !== document.revision) {
    throw new Error('Core resolved a different mechanical assembly revision');
  }
  return reply.assembly;
}

import type { CaseResult, PreparedCaseAssemblyIR } from '@boardstudio/v2-contracts';
import { buildAssembly, readStepModel, previewAssembly } from '@boardstudio/v2-cad';
import type { StepModel, CasePreviewResult, CadProgress } from '@boardstudio/v2-cad';

type CaseMessage = { id: string; kind: 'case' | 'preview'; ir: PreparedCaseAssemblyIR } | { id: string; kind: 'model'; bytes: Uint8Array };
type CaseReply =
  | { id: string; kind: 'progress'; progress: CadProgress }
  | { id: string; kind: 'preview'; result: CasePreviewResult }
  | { id: string; kind: 'case'; result: CaseResult }
  | { id: string; kind: 'model'; result: StepModel }
  | { id: string; kind: 'error'; message: string; revision: number };

let queue = Promise.resolve();

async function handle(message: CaseMessage): Promise<void> {
  const { id } = message;

  try {
    if (message.kind === 'model') {
      const result = await readStepModel(message.bytes);
      const reply: CaseReply = { id, kind: 'model', result };

      self.postMessage(reply, [result.mesh.positions.buffer, result.mesh.normals.buffer]);
      return;
    }

    if (message.kind === 'preview') {
      const result = await previewAssembly(message.ir, progress => self.postMessage({ id, kind: 'progress', progress }));
      self.postMessage({ id, kind: 'preview', result }, [result.mesh.positions.buffer, result.mesh.normals.buffer,
        ...(result.bodies ?? []).flatMap(body => [body.positions.buffer, body.normals.buffer])]);
      return;
    }
    const result = await buildAssembly(message.ir);
    const reply: CaseReply = { id, kind: 'case', result };

    self.postMessage(reply, [result.step.buffer, result.mesh.positions.buffer, result.mesh.normals.buffer, ...(result.bodies ?? []).flatMap(body => [body.positions.buffer, body.normals.buffer])]);
  } catch (cause) {
    const reply: CaseReply = {
      id,
      kind: 'error',
      message: cause instanceof Error ? cause.message : String(cause),
      revision: message.kind !== 'model' ? message.ir.revision : 0,
    };

    self.postMessage(reply);
  }
}

self.onmessage = (event: MessageEvent<CaseMessage>) => {
  queue = queue.then(() => handle(event.data));
};

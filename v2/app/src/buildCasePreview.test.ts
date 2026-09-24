import { expect, test, vi } from 'vitest';
import type { CaseAssemblyIR, CaseResult, CoreReply, PreparedCaseAssemblyIR } from '@boardstudio/v2-contracts';
import { buildCasePreview } from './buildCasePreview';

const input = (revision: number): CaseAssemblyIR => ({ revision, bodies: [] });
const prepared = (revision: number): PreparedCaseAssemblyIR => ({ revision, bodies: [] });
const result = (revision: number): CaseResult => ({
  revision,
  step: new Uint8Array([revision]),
  mesh: { positions: new Float32Array([revision]), normals: new Float32Array([0, 0, 1]) },
});

function harness() {
  const core = { request: vi.fn() };
  const cad = { request: vi.fn() };
  return { core, cad };
}

test('a late preparation reply for an older revision never starts CAD', async () => {
  const { core, cad } = harness();
  const replies = new Map<string, (reply: CoreReply) => void>();
  core.request.mockImplementation((request: { id: string; kind: string }) => new Promise((resolve) => replies.set(request.id, resolve)));
  cad.request.mockResolvedValue(result(2));
  let currentRevision = 1;

  const older = buildCasePreview(core as never, cad as never, input(1), () => currentRevision === 1);
  const oldId = core.request.mock.calls[0][0].id;
  currentRevision = 2;
  const newer = buildCasePreview(core as never, cad as never, input(2), () => currentRevision === 2);
  const newId = core.request.mock.calls[1][0].id;

  replies.get(newId)!({ id: newId, kind: 'case-prepared', ir: prepared(2) });
  await expect(newer).resolves.toEqual(result(2));
  replies.get(oldId)!({ id: oldId, kind: 'case-prepared', ir: prepared(1) });
  await expect(older).resolves.toBeUndefined();
  expect(cad.request).toHaveBeenCalledTimes(1);
  expect(cad.request).toHaveBeenCalledWith(prepared(2));
});

test('a late CAD reply cannot replace a newer completed preview', async () => {
  const { core, cad } = harness();
  const requests = core.request.mockImplementation((request: { id: string; ir: CaseAssemblyIR }) => Promise.resolve({
    id: request.id,
    kind: 'case-prepared',
    ir: prepared(request.ir.revision),
  } satisfies CoreReply));
  const cadReplies = new Map<number, (value: CaseResult) => void>();
  cad.request.mockImplementation((ir: PreparedCaseAssemblyIR) => new Promise((resolve) => cadReplies.set(ir.revision, resolve)));
  let currentRevision = 1;
  let visible: CaseResult | undefined;

  const older = buildCasePreview(core as never, cad as never, input(1), () => currentRevision === 1).then((value) => {
    if (value) visible = value;
  });
  await vi.waitFor(() => expect(cadReplies.has(1)).toBe(true));

  currentRevision = 2;
  const newer = buildCasePreview(core as never, cad as never, input(2), () => currentRevision === 2).then((value) => {
    if (value) visible = value;
  });
  await vi.waitFor(() => expect(cadReplies.has(2)).toBe(true));
  cadReplies.get(2)!(result(2));
  await newer;
  cadReplies.get(1)!(result(1));
  await older;

  expect(visible).toEqual(result(2));
  expect(requests).toHaveBeenCalledTimes(2);
});

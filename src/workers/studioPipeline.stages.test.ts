import { runStudio } from './studioPipeline';
const calls = vi.hoisted(() => ({ solveLayout: vi.fn(), process: vi.fn() }));
vi.mock('ergogen', () => calls);
it('solves once and reuses the same scene through both geometry stages', async () => {
  const prepared = { scene: {}, results: { layout: { objects: {} } } };
  calls.solveLayout.mockResolvedValue(prepared);
  calls.process.mockResolvedValue({});
  const publish = vi.fn();
  await runStudio(
    { inputConfig: 'source', requestId: 'id', revision: 'revision' },
    {},
    () => true,
    publish
  );
  expect(calls.solveLayout).toHaveBeenCalledOnce();
  expect(calls.process).toHaveBeenCalledTimes(2);
  expect(
    calls.process.mock.calls.every(
      ([, options]) => options.preparedLayout === prepared
    )
  ).toBe(true);
});

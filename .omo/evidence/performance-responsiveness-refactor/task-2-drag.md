# Todo 2: no drag scheduling change

**Decision: no change justified.** At baseline SHA `64bfc2e84dc871b191d237fbd3d759f67fc05a76`, five completed drag samples have input-to-visible median 31.8 ms and input-to-persisted median 170.5 ms. Add-column and add-row visible medians are 6097.2 ms and 7051.4 ms respectively. Raw-record recomputation is captured in task-2/timing-check.log; inputs are baseline/timings.json.

This contrast points toward investigating mutation/outline work before changing pointer scheduling. It does not prove a particular parse/clone/render function causes the cost. Drag settled median is 9756.6 ms, which includes downstream work and must not be presented as pointer preview latency. No per-event profiler evidence establishes rendering or gesture geometry as the dominant cost. Memoization already exists in StudioCanvas for pitch, spacing, bounds, proposal and dragged IDs. Introducing a frame/cache change now would be speculative and would add release/cancel/unmount correctness risk.

The five-repeat overall benchmark timed out as described in task-1-baseline.md. Its completed drag records inform this decision, but no complete benchmark pass or speedup is claimed. The plan explicitly permits an evidence-backed no-change result; the 15% median/p95/long-task improvement gate is not claimed satisfied.

## Focused existing checks

Exact invocation, from the task worktree with Node 24.14.0 first on PATH:

```sh
VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 \
timeout 180 pnpm --dir app exec vitest run src/molecules/StudioCanvas.test.tsx \
  -t 'keeps the viewport stable while selecting a column to move|starts an object move in Select mode without changing tools|flushes the final pointer delta on release before its animation frame'
```

Actual exit **0**, three tests passed, six deselected by the name filter. Artifacts: task-2/unit.log and task-2/unit.exit. The tests verify column selection/camera behavior, move-tool entry, and committing exactly the final `[5, 0, 0]` delta once with the current source when releasing before the mocked frame. The first dispatches pointerCancel but does not assert a no-commit postcondition; it is not a complete cancellation regression. Existing React act warning output is retained.

No browser QA was run for Todo 2. Port 4184 was occupied by the root agent's baseline rerun (PID 2262818 at inspection); it was not stopped or reused. The plan's native-layout reference contains resize cancellation, not an existing pointer-cancel browser case. No unchanged-source/zero-page-error browser cancellation claim is made. Broader browser acceptance remains for subsequent integration.

## Cleanup and DoneClaim

Task-2/start.log records the SHA, existing dirty benchmark file and build hash. Task-2/cleanup.log records final status and occupied-port ownership. This task changed no product/test code, launched no browser/preview server, and created only these evidence files. The root agent's existing studio-performance.spec.ts edit remains untouched. Unit execution finished; no commit was made.

DoneClaim: Todo 2's evidence-gated no-change decision and requested focused existing checks are complete, with the cancellation/browser coverage limits above explicitly retained.

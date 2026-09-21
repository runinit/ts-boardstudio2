# Todo 4: outline preparation no-change decision

**Decision: no outline code change justified by the captured measurements.** Outline-related latency is material, but the baseline does not isolate `prepareOutlines` or `freezeOutlines` as its cause. Changing those functions or publishing partial results without that evidence would be speculative. No implementation commit is needed.

## Timing evidence and its limits

Raw acknowledgment measurements from baseline/timings.json were independently summarized with `uv run --with numpy python`; output is task-4/timing-inspection.log. Each group below has five completed records from baseline SHA `64bfc2e84dc871b191d237fbd3d759f67fc05a76`.

| Action | Request-to-outline median ms | p95 ms |
| --- | ---: | ---: |
| Nudge | 6910.3 | 7286.2 |
| Drag | 6849.6 | 7352.7 |
| Add columns | 8108.4 | 8434.2 |
| Add rows | 8978.4 | 9089.9 |

These intervals include layout solving, preparation, engine outline processing, worker scheduling and reply delivery. `outlineStageMs` instead begins at the input event and additionally includes source mutation before request dispatch. Neither field directly times preparation or freezing. The retained drag-0 packet has one correlated request, layout stage, outline stage and success; it does not separate preparation from geometry processing. The aggregate baseline timeout and partial-record caveat from task-1-baseline.md still apply.

No claim is made that outline preparation is cheap, that engine computation is definitively the bottleneck, or that the plan's 15% improvement gate was met. Isolated preparation profiling would be necessary before choosing a safe optimization here; engine changes remain out of scope.

## Existing behavior reviewed

- `prepareOutlines` removes snapshots only from managed references, regenerates the managed board recipe using the supplied layout report, and records ownership. Authored profiles are protected by the managed-recipe checks.
- `freezeOutlines` snapshots exact line/arc/circle geometry for every managed feature, including nested offsets, before disabling automatic mode. Changing serialization/order here could affect frozen fidelity and ownership.
- `runStudio` solves once and passes the same prepared layout into both outline-only and final processing. It yields and checks supersession before stage publication and final success; request IDs and revisions are echoed.
- `useStudio` ignores mismatched revisions, keeps the previous outline during updates, and adopts generated source only after a current successful request. Earlier outline publication was deliberately left unchanged.

## Focused verification

Exact command from the task worktree, using Node 24.14.0/pnpm 11.26.0:

```sh
VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 \
timeout 180 pnpm --dir app exec vitest run \
  src/utils/studioOutline.test.ts src/utils/studioOutlineReuse.test.ts \
  src/workers/studioPipeline.test.ts src/workers/studioPipeline.stages.test.ts \
  src/utils/studioQueue.test.ts src/hooks/useStudio.test.ts --reporter=verbose
```

Actual exit **0**, **6 files / 25 tests passed**. Artifacts: task-4/focused.log and focused.exit. Existing tests exercise authored-profile protection, exact curved frozen contours, managed identity reuse across rebuilds, multi-board ownership, native frozen round trips, single solved-scene reuse, superseded requests, mismatched revisions and stale replies after undo/project changes. No browser outline-recovery scenario was run for this bounded decision; these results must not be relabeled browser QA.

## Cleanup and DoneClaim

Task-4/start.log and task-4/cleanup.log capture SHA/status and resource ownership. No source/test edits or commit were made. Only completed Vitest processes were launched; no browser/server was started or terminated. Todo 3 source edits and the measurement timeout change remain untouched.

DoneClaim: evidence-gated no-change decision, focused outline/worker checks and cleanup reporting complete. Direct preparation profiling and integrated browser/performance acceptance are not claimed complete.

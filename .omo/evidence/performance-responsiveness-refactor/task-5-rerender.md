# Todo 5 — no workspace rerender change justified

Decision: **NO CHANGE**. The available profiling does not identify ConfigContext/render fan-out as a material bottleneck. This completes the bounded evidence-gated decision; it does not claim a speedup or complete browser acceptance.

Reviewed at HEAD `64bfc2e84dc871b191d237fbd3d759f67fc05a76`, with concurrent existing diff limited to the benchmark timeout override and Todo 3 resize batching/test threshold. No ConfigContext, LayoutView or StudioCanvas delta exists. Inspected the full current diff, approved plan, task-1-baseline.md, task-2-drag.md, task-4-outline.md, baseline-fixed timing structure, and the measurement probe implementation.

## Evidence and interpretation

`app/e2e/utils/studioPerformanceProbe.ts:74` observes long-task start/duration and DOM/source acknowledgment. Timing records contain input-to-visible/persisted, committed polygon, settled, long-task and worker acknowledgment fields. They contain no React commit durations, component render counts, context update causes, or render/geometry call-stack attribution. No component profiler artifact was located in this task evidence. Long tasks and slow settlement alone cannot establish context fan-out as the cause.

`app/src/context/ConfigContext.tsx:2069` already memoizes its provider value. The broad dependency/value surface makes fan-out a plausible candidate, but static breadth is not measured cost. `StudioCanvas.tsx` already memoizes pitch, spacing, fit, proposal and dragged IDs. `LayoutView.tsx:89–95` parses source during render, which is a possible follow-up profiling target; frequency and exclusive cost are not isolated by these measurements. No speculative subscription split or additional cache is justified by this evidence.

Todo 1 reports an incomplete original five-repeat run. The additional baseline-fixed artifact inspected also has action/worker timing fields rather than React attribution. Neither absence of render attribution nor the no-change decision proves rendering is cheap. A future change would require a profile tied to representative source/settings/selection updates, identifying avoidable CAD work and a controlled five-repeat before/after comparison meeting the plan's median/p95/long-task rule.

Programming and remove-ai-slops perspectives were consulted (skills loaded in this review session): no implementation or test additions are warranted; introducing speculative memoization, subscriptions, or tests mirroring those internals would increase scope without causal evidence.

## Focused existing verification

Executed from this worktree:

```sh
PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH pnpm --dir app exec vitest run src/molecules/StudioCanvas.test.tsx src/context/ConfigContext.test.tsx --maxWorkers=1 --minWorkers=1
```

Exit **0**; **2 files / 42 tests passed**. Receipts: `task-5-tests.log`, `task-5-tests.exit`. Existing warnings remain in the log. These are existing component/context correctness checks, not a React profiler or settings-during-drag browser proof. No snapshots or source files were changed.

The 60-key benchmark and settings/inspector-during-drag scenario were not rerun by this lane. Parent integration owns browser validation; its concurrent warmup-final run was observed and left untouched. No five-repeat improvement or no-lost-pointer browser claim is made.

## Cleanup

`task-5-cleanup-receipt.log` records SHA, preserved dirty source paths, occupied parent preview port and resource ownership. The only child process launched by this lane was the completed Vitest command. No browser, preview, product edit or implementation commit was created. Task-owned output consists solely of this report and test/cleanup receipts.

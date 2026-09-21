# performance-responsiveness-refactor - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->
<!-- Plain English for a non-engineer: NO file paths, NO todo numbers, NO wave/agent/tool names. -->

**What you'll get:** A faster CAD workspace and layout designer during dragging, row/column edits, and outline refreshes, backed by repeatable timing evidence. Existing editing semantics, persistence, and stale-result protections will remain intact.

**Why this approach:** Measure the existing 60-key browser path first, then make the lowest-risk changes at the proven hot paths: frame-coalesced previews, cached geometry/source work, and batched mutations.

**What it will NOT do:** It will not change the data format, add visual features, redesign the interface, or rewrite the engine speculatively.

**Effort:** Large
**Risk:** Medium - interaction scheduling and source batching touch correctness-sensitive editing paths.
**Decisions I made for you:** Optimize measured bottlenecks first; require median/p95 evidence; preserve one-step undo and stale-result rejection; defer spatial indexing and earlier outline publication unless profiling proves they are needed.

Your next move: run `$start-work performance-responsiveness-refactor` in a task-owned worktree.

---

> TL;DR (machine): Large, medium-risk performance refactor covering drag/render/source/outline paths with benchmark-led validation and no schema or UX redesign.

## Scope
### Must have
 - Baseline and post-change median/p95 timings for the existing 60-key browser benchmark, plus focused unit/browser regressions.
 - Evidence-backed frame-coalescing, cached per-gesture computations, memoized parsing/geometry, or batched source mutations where the baseline identifies the corresponding cost; no-change is valid when a candidate is not dominant.
 - Outline preparation and publication changes only where measurements justify them; preserve solved-layout reuse, ownership, frozen snapshots, and supersession checks.
 - Evidence artifacts for every todo and all four final verification lanes.
### Must NOT have (guardrails, anti-slop, scope boundaries)
 - No production schema/data-format changes, visual redesign, new CAD features, or removal of stale-result/request correlation safeguards.
 - No speculative spatial index or engine rewrite without a captured benchmark showing the existing candidate scan is dominant.
 - No unrelated footprint, engine, or existing worktree edits; measured engine changes are out of scope for this plan.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after for measured refactors, with focused unit tests, Vitest/jsdom, and Playwright browser checks; baseline characterization precedes each behavioral change.
- Evidence: `.omo/evidence/performance-responsiveness-refactor/task-<N>-*.md` with command logs, timing JSON, screenshots, and exit ledgers.

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.
 - Wave 1: baseline only (Todo 1).
 - Wave 2: serial evidence-gated optimization tasks (Todos 2-5), then integration (Todo 6).

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 | none | 2-6 | none |
| 2 | 1 | 5,6 | none |
| 3 | 1 | 4-6 | none |
| 4 | 3 | 5,6 | none |
| 5 | 2,3,4 | 6 | none |
| 6 | 5 | F1-F4 | none |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. Capture a repeatable performance baseline and profiling report
  What to do / Must NOT do: Run the 60-key native Playwright benchmark with repeated timings, long-task and worker-packet evidence, plus focused 390/1440 interaction checks. Add only measurement/reporting helpers; do not change product behavior.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 2-6
  References (executor has NO interview context - be exhaustive): `app/e2e/studio-performance.spec.ts`, `app/e2e/utils/studioPerformance.ts`, `app/e2e/utils/studioPerformanceProbe.ts`, `app/e2e/studio-continuous.spec.ts`, `app/CAD-WORKSPACE-VALIDATION.md`.
  Acceptance criteria (agent-executable): Record Node 24+, pnpm 11.26+, frozen install/build, Chromium version, preview port, clean task-worktree baseline SHA, identical 60-key fixture, one warm-up plus five measured repeats, action median/p95, long-task counts, and a comparison rule: improvement requires at least 15% median reduction with p95 no worse than 10% and no new long task; otherwise record no improvement.
  QA scenarios (name the exact tool + invocation): happy `PERF_OUTPUT=... PERF_COLUMNS=10 PERF_NATIVE_ROWS=6 PERF_LED=1 PERF_REPEATS=5 pnpm --dir app exec playwright test e2e/studio-performance.spec.ts --workers=1`; failure run the same benchmark with an invalid fixture and verify a nonzero exit plus retained diagnostics. Evidence `.omo/evidence/performance-responsiveness-refactor/task-1-baseline.md`.
  Commit: Y | test(perf): capture CAD responsiveness baseline

- [x] 2. Coalesce drag previews and cache gesture-local calculations
  What to do / Must NOT do: Update `StudioCanvas` and `LayoutView` to use refs/requestAnimationFrame for preview updates, memoize parsed documents and per-report polygon geometry, and cache moving IDs/snap frames during a gesture. Preserve final pointer position and commit/cancel behavior.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 5,6
  References (executor has NO interview context - be exhaustive): `app/src/molecules/StudioCanvas.tsx:118-220,553-598,670-900`, `app/src/molecules/LayoutView.tsx:88-96,306-370`, `app/src/utils/studioMove.ts:212-305`, `app/src/utils/layoutDrawing.ts`, snapping and movement tests.
  Acceptance criteria (agent-executable): If the baseline identifies per-event rendering or geometry as dominant, pointer events are frame-coalesced with no stale frame commits after cancel/unmount, geometry output is unchanged, and six-repeat 60-key drag median/p95 meets the Todo 1 comparison rule; otherwise record no-change evidence.
  QA scenarios (name the exact tool + invocation): happy run the complete `e2e/studio-performance.spec.ts` benchmark with one warm-up excluded and five measured repeats, one worker, dedicated output, and retained traces; failure execute pointer-cancel/drag-cancel coverage in `native-layout.spec.ts` and require unchanged source plus zero page errors. Evidence `.omo/evidence/performance-responsiveness-refactor/task-2-drag.md`.
  Commit: Y | perf(canvas): coalesce CAD drag previews

- [x] 3. Batch layout source mutations and preserve history semantics
  What to do / Must NOT do: Replace serial string-returning edits in multi-target moves and matrix resize with one document transaction where safe; retain YAML comments/expressions, holes, companions, locks, IDs, generated nets, and one undo entry.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 5,6
  References (executor has NO interview context - be exhaustive): `app/src/utils/studioMove.ts`, `app/src/utils/studioSource.ts:715-752`, `app/src/utils/sourceSnapshot.ts`, `app/src/utils/applyAssembly.ts`, `app/src/context/ConfigContext.tsx:1509-1610`, source/history regression tests.
  Acceptance criteria (agent-executable): If Todo 1 identifies parse/clone/serialization cost as material, multi-key moves and row/column add/remove produce semantically equivalent documents, one undo/redo step, stable IDs and preserved metadata, and meet the Todo 1 comparison rule; otherwise record no-change evidence and make no implementation commit.
  QA scenarios (name the exact tool + invocation): happy targeted Vitest source/assembly/history suites; failure malformed or locked resize rejects without partial writes and preserves prior source. Evidence `.omo/evidence/performance-responsiveness-refactor/task-3-source-batch.md`.
  Commit: Y | perf(source): batch layout mutations

- [x] 4. Optimize automatic outline preparation only where profiling supports it
  What to do / Must NOT do: Measure `prepareOutlines`/`freezeOutlines` and batch repeated source operations if dominant; preserve managed ownership, authored profiles, frozen snapshots, and solved-layout reuse. Do not publish partial results solely for perceived speed.
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 6
  References (executor has NO interview context - be exhaustive): `app/src/utils/studioOutline.ts`, `app/src/workers/studioPipeline.ts:28-73`, `app/src/hooks/useStudio.ts:83-118`, worker and outline reuse tests, engine outline cache paths.
  Acceptance criteria (agent-executable): Automatic and frozen outlines are semantically identical before/after, outline-stage reuse remains observable, and any optimization has timing evidence; if outline is not dominant, record no code change and preserve the measurement.
  QA scenarios (name the exact tool + invocation): happy focused outline unit/worker tests and `e2e/outline-recovery.spec.ts`; failure supersede an outline request and verify no stale outline becomes visible. Evidence `.omo/evidence/performance-responsiveness-refactor/task-4-outline.md`.
  Commit: Y | perf(outline): reduce measured preparation cost

- [x] 5. Reduce avoidable workspace rerenders and integrate measured optimizations
  What to do / Must NOT do: Apply memoization or narrowly split subscriptions only when profiler evidence identifies context/render fan-out; keep callbacks and visible behavior stable.
  Parallelization: Wave 2 | Blocked by: 2,3,4 | Blocks: 6
  References (executor has NO interview context - be exhaustive): `app/src/context/ConfigContext.tsx:2069-2148`, `app/src/molecules/StudioCanvas.tsx`, `app/src/molecules/LayoutView.tsx`, profiler evidence, component tests.
  Acceptance criteria (agent-executable): If profiler evidence identifies context/render fan-out, unrelated context updates do not rebuild CAD geometry unnecessarily and the five-repeat comparison meets Todo 1; otherwise record no-change and make no implementation commit. Focused tests pass without unjustified snapshot changes.
  QA scenarios (name the exact tool + invocation): happy targeted app tests plus the 60-key benchmark; failure toggle settings/inspector while dragging and verify no lost pointer, cancel, or selection state. Evidence `.omo/evidence/performance-responsiveness-refactor/task-5-rerender.md`.
  Commit: Y | perf(workspace): limit CAD rerenders

- [x] 6. Run integrated validation and document performance deltas
  What to do / Must NOT do: Run focused unit/browser suites, responsive 390/1440 flows, delayed-worker continuous flows, precommit, and repeated benchmarks; report median/p95 deltas and failures honestly.
  Parallelization: Wave 2 | Blocked by: 5 | Blocks: F1-F4
  References (executor has NO interview context - be exhaustive): all changed files/evidence from Todos 1-5; `studio-performance.spec.ts`, `studio-continuous.spec.ts`, `inspector-resize.spec.ts`, `workbench-layout.spec.ts`, `snapping-disclosure.spec.ts`, package precommit commands.
  Acceptance criteria (agent-executable): Focused correctness and responsiveness checks pass, precommit passes, benchmark artifacts compare baseline/post-change median/p95, and unrelated failures are classified with reproduction evidence.
  QA scenarios (name the exact tool + invocation): happy targeted Playwright/Vitest commands plus `pnpm precommit`; failure run the full relevant suite with zero retries and retain logs/traces for every failure. Evidence `.omo/evidence/performance-responsiveness-refactor/task-6-integration.md`.
  Commit: Y | test(perf): validate CAD responsiveness refactor

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit
  Verify every implementation todo has exact references, acceptance, happy/failure commands, evidence path, dependency, and commit; inspect the final diff and task ledger.
- [x] F2. Code quality review
  Review changed TypeScript and tests for unnecessary abstraction, unsafe scheduling, weakened assertions, untyped escapes, and preserved stale-result/history invariants; run the relevant unit checks. Evidence .omo/evidence/performance-responsiveness-refactor/final-quality.md.
- [x] F3. Real manual QA
  Run the final 60-key benchmark, native layout drag/edit flows, outline recovery, delayed-worker continuous flow, and 390/1440 responsive scenarios in fresh Chromium contexts with zero retries; inspect screenshots, timing JSON, console errors, and cleanup. Evidence .omo/evidence/performance-responsiveness-refactor/final-surface.md.
- [x] F4. Scope fidelity
  Compare the final diff against the approved scope, confirm no schema/visual/engine/footprint changes or unrelated worktree overwrite, and verify baseline/post-change artifacts use the same fixture and environment. Evidence .omo/evidence/performance-responsiveness-refactor/final-scope.md.

## Commit strategy

Use atomic commits per performance seam (baseline, drag, source batching, outline, rerender, integration). Never mix unrelated worktree changes. Preserve benchmark JSON, logs, screenshots, and failure classifications under `.omo/evidence/performance-responsiveness-refactor/`.

## Success criteria

- CAD drag, layout editing, and outline flows remain behaviorally correct at desktop and mobile viewports.
- The final benchmark reports a reproducible improvement in the measured bottleneck or documents that the attempted optimization was not dominant and was omitted.
- No stale worker result, partial source mutation, lost undo step, schema change, or unrelated source modification is introduced.
- F1-F4 all approve with artifact-backed evidence.

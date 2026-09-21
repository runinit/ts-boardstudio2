---
slug: performance-responsiveness-refactor
status: drafting
intent: unclear
review_required: true
plan_path: .omo/plans/performance-responsiveness-refactor.md
plan_sha256: null
review_round_id: null
pending-action: write and review .omo/plans/performance-responsiveness-refactor.md
review:
  momus:
    status: pending
    workspace_root: null
    runtime_home: null
    target: .omo/plans/performance-responsiveness-refactor.md
    round_id: null
    plan_sha256: null
    launch_id: null
    session: null
    result: null
  independent:
    status: pending
    workspace_root: null
    runtime_home: null
    target: .omo/plans/performance-responsiveness-refactor.md
    round_id: null
    plan_sha256: null
    launch_id: null
    session: null
    result: null
approach: Profile the CAD interaction and generation paths first, then plan low-risk batching, memoization, frame-coalescing, and worker-publication changes with behavior-preserving benchmarks and manual UI verification.
---

# Draft: performance-responsiveness-refactor

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->
| drag | Smooth pointer movement and snapping on large layouts | active | app/src/molecules/StudioCanvas.tsx, app/src/utils/studioMove.ts |
| layout-edit | Fast row/column and multi-object source edits with one coherent history update | active | app/src/utils/studioMove.ts, app/src/utils/studioSource.ts, app/src/utils/sourceSnapshot.ts |
| outline | Faster automatic outline preparation and visible outline-stage results | active | app/src/utils/studioOutline.ts, app/src/workers/studioPipeline.ts, app/src/hooks/useStudio.ts |
| render | Reduce avoidable canvas/layout rerenders and repeated parsing | active | app/src/molecules/LayoutView.tsx, app/src/molecules/StudioCanvas.tsx, app/src/context/ConfigContext.tsx |

## Open assumptions (announced defaults)
<!-- Intent is UNCLEAR: research resolves ambiguity, defaults are adopted (not asked), and each is surfaced in the plan's human TL;DR for veto. -->
<!-- assumption | adopted default | rationale | reversible? -->
| scope | Optimize CAD workspace and layout-designer paths identified by profiling; preserve public behavior and data formats | User asked for responsiveness/refactoring, while repository boundaries identify these paths | yes |
| interaction scheduling | Coalesce pointer previews per animation frame and keep final commit semantics unchanged | Current handlers call `setDrag` on every pointer event | yes |
| source mutation | Batch document edits where multiple string-returning mutations currently occur | Avoid repeated parse/clone/serialize work while preserving YAML semantics | yes |
| algorithm changes | Do not replace snapping with a new spatial index until a benchmark proves candidate scanning is dominant | Prevent speculative geometry changes and regressions | yes |
| outline publication | Measure stage latency before exposing partial results earlier | Current pipeline intentionally publishes layout, outline, then final analysis | yes |

## Findings (cited - path:lines)

- `StudioCanvas.tsx:553-598` performs coordinate conversion, `getScreenCTM`, snapping, and React state updates for every pointer move; `:670-769` rebuilds visible SVG geometry on rerender.
- `LayoutView.tsx:88-96,306-370` parses the source twice per render and updates drag state per pointer move, rebuilding the whole SVG.
- `studioMove.ts:212-305` caches extracted edges but still scans moving/fixed edge candidates; `moveTargets` performs serial string mutations for multi-target moves.
- `studioOutline.ts:prepareOutlines` repeatedly calls `removeValue`, `addOutline`, and `setValue` for each board/reference.
- `studioPipeline.ts:28-73` already reuses the solved layout and checkpoints supersession; `useStudio.ts:92` intentionally withholds outline-stage results from visible state.
- `ConfigContext.tsx:1355-1370` debounces auto-generation at 300ms; `:2069-2148` exposes a broad context value that can fan out rerenders.
- Existing coverage includes `app/src/utils/studioLatency.test.ts`, `layoutSource.performance.test.ts`, `studioOutlineReuse.test.ts`, queue/hook tests, and `app/e2e/studio-performance.spec.ts`; no pointer-frequency/rAF or large-board snapping benchmark was found.

## Decisions (with rationale)

- Treat this as an architecture-scale, open-ended performance refactor. Adopt profiling and regression thresholds before implementation so speed claims are measured rather than inferred.
- Prioritize low-risk interaction and parsing work first: frame-coalesced drag previews, cached drag-transaction data, memoized document/geometry work, and batched source writes. Keep context splitting and spatial indexing as evidence-driven follow-ons inside the same plan when measurements justify them.
- Preserve revision/request correlation, stale-result rejection, YAML comments/expressions, undo semantics, snapping/spacing/Alt behavior, and automatic-outline ownership.

## Scope IN

- CAD workspace dragging, snapping, layout-view dragging, row/column resizing and multi-object edits, automatic outline preparation/publication, and render/generation scheduling directly supporting those flows.
- Performance instrumentation or benchmarks needed to establish baseline and prove improvement.

## Scope OUT (Must NOT have)

- No visual redesign, new CAD features, schema/data-format changes, removal of stale-result safeguards, or speculative engine rewrite.
- No unrelated footprint/engine cleanup or changes to active unrelated worktree files.

## Open questions

- None blocking. Repository evidence supports defensible defaults; the approval brief will surface them for veto.

## Approval gate
status: plan-written
approach: Profile the identified interaction, source-edit, outline, and render paths; implement only measured bottlenecks with focused regression benchmarks and real browser responsiveness checks.
next-action: User approval authorizes writing and reviewing the plan only. Execution requires a separate `$start-work performance-responsiveness-refactor` session.
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->

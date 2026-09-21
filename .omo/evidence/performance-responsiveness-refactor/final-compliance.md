# F1 compliance — fresh final review

recommendation: APPROVE
status: PASS (F1 plan-compliance lane)
reviewedSHA: bfaafb4b1aca4fe849d1effdef0872dc6b91672d
baseSHA: 64bfc2e84dc871b191d237fbd3d759f67fc05a76
baseToFinalPatchSHA256: 30945500a2969e2479987b1c14d36263f0bca17d7d01ff1a4b718843ae9a3873
blockers: []

This report supersedes the F1 rejection of b7e3f683. It approves the plan's explicitly permitted omission outcome, not a responsiveness gain or an entirely green browser suite.

originalIntent: Improve CAD responsiveness only through demonstrated optimizations while preserving editing/history/worker correctness.
desiredOutcome: Retain qualifying measured improvements, or omit attempts whose measurements do not establish the required gain; provide honest evidence and a bounded final change.
userOutcomeReview: No production optimization is delivered. The unproven batching candidate and its parser-count test tightening have been omitted. The delivered artifact is a benchmark-only configurable timeout, retaining the 600000 ms default. The plan expressly permits omission and the reports do not claim a speedup.

## Prior blockers resolved

- T3-AC / Success-2: Independently compared both restored files to git-show base bytes. app/src/utils/studioSource.ts and app/src/utils/studioSourceBatch.test.ts exactly match base. Complete base-to-final diff changes only app/e2e/studio-performance.spec.ts:30. The candidate no longer needs to satisfy the improvement threshold because it was omitted. task-3-source-batch.md records that decision; task-3-final-vitest.log independently records 7 files/75 tests passing after restoration, exit 0 in the adjacent ledger.
- T1-AC / T6-AC provenance: task-1-baseline.md now explicitly states that the complete 51-record run had the batching candidate present at the recorded base SHA, and is not a clean delivered-branch baseline. Its comparison section calls it diagnostic only. task-6-integration.md now names the final omission SHA and classifies the delayed-outline failure from subsequent baseline reproduction. Thus baseline-final is no longer accepted as clean before/after proof. The incomplete earlier 50-record run and differing build attribution remain disclosed; no speedup is inferred. This is sufficient for the conservative no-change decision, not acceptance of a performance claim.

## Acceptance audit

- Todo 1: environment/install/build, warm-up, complete five-repeat diagnostic measurements, invalid-fixture nonzero result, action median/p95, long tasks and comparison rule have retained artifacts. Earlier raw inspection independently found 50 records in baseline and 51 in baseline-final with empty error arrays. Fixture SHA256 independently matches e2bb88e1cf3cd9796ff235e13d3be87e6df1f4e3f637d867fc920fa0c886213a. Clean controlled pre/post provenance was not established; omission avoids treating these diagnostics as proof of delivered improvement.
- Todos 2/4/5: evidence-gated no-change decisions remain appropriate. Measurements did not isolate per-event rendering, preparation/freezing or context fan-out as dominant. No speculative frame/cache/publication/subscription implementation remains. Their reports disclose the limits of browser cancellation and profiler coverage.
- Todo 3: candidate omitted, source/test restored, fresh semantic/history regressions pass. No source-format, ownership, locking, undo or worker behavior changes remain.
- Todo 6: independently inspected actual precommit log with 148 files/1038 tests passing and exit 0, focused log with 19 files/157 tests, and browser result with 13 passes/1 failure. These are historical candidate-run receipts, not silently relabeled fresh final-SHA executions. Fresh restored-source tests cover 75 cases. The unchanged delayed-outline failure is explained by connected-region validation, reproduced in candidate and Todo3-OFF worker diagnostics and deterministic geometry toggle. No all-browser-green claim is made.
- Scope: exact final SHA checked; tracked tree is clean. Evidence/plans remain untracked and retained. No production, engine, footprints, schema, UI or unrelated source diff exists against base. Final timeout change preserves existing assertions, action timeouts, retries and fixture behavior.
- Final wave: final-quality.md and final-scope.md now independently approve this exact SHA. Runtime audit explicitly binds final production bytes to the captured OFF source and retains the known failure. F3 and root aggregate completion remain separate responsibilities; this F1 report does not assert every lane has finished or authorize publication.

## Direct programming / remove-ai-slops review

Applied the previously loaded programming, TypeScript and remove-ai-slops criteria directly to the final one-line diff and surrounding benchmark. No production extraction, parsing, normalization, cache, scheduling or abstraction was introduced. No useless tests, deletion-only tests, requested-removal tests, tautologies, implementation-mirroring or prompt-text tests were added. The previous tightened implementation-cost test is restored. Timeout parsing is confined to existing test configuration; ordinary default behavior is unchanged. No added unsafe type escape or error swallowing. Introducing new defensive machinery or expression-pinning tests for this bounded configuration would be unjustified. Confirmed exact-SHA final-quality.md explicitly includes the same skill perspectives and overfit/slop categories; its report complements this direct pass.

## Checked artifacts

- .omo/plans/performance-responsiveness-refactor.md; exact HEAD/status/base-to-final diff; all three formerly changed files, with independent byte comparisons of restored files.
- Evidence root .omo/evidence/performance-responsiveness-refactor/: task-1-baseline.md; task-2-drag.md; task-3-source-batch.md; task-4-outline.md; task-5-rerender.md; corrected task-6-integration.md; task-6-debug.md.
- baseline/timings.json; baseline-final/timings.json; initial-source.yaml for each; timing-summary-final.json; task-1-verification.txt; task-1-final-cleanup.log.
- task-3-final-vitest.log/.exit; task-3-final-status records; task-6-unit/run.log; task-6-precommit.log/.exit and receipt; task-6-browser-run.log.
- task-6-debug candidate/base worker-diagnostics.json; geometry-toggle.log; cleanup.log; final-quality.md; final-scope.md; runtime-audit.md; historical final-surface.md.

## Exact limits and notes

No tests/build/browser runs were initiated by this read-only F1 lane. No clean, attributable before/after performance gain was established and no production speedup is delivered. Some historical task prose still uses “controlled comparison” or reports then-current dirty files; corrected task-1/task-6 provenance and this exact-SHA report supersede that wording. These are documentation notes after omission, not support for a hidden gain. The known delayed-outline geometry failure remains failing. Final-surface report inspected initially described b7e3f683, so root must collect the final F3 disposition separately. No task-specific notepad was supplied. No evidence supports an unrelated checkout overwrite, but snapshot inspection does not prove all filesystem history.

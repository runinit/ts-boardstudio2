# Todo 3: batch layout source mutations

Status: **omitted / no-change**.

The candidate was evaluated against the Todo 1 baseline but did not meet the controlled performance gate: the required post-change browser comparison did not establish at least a 15% median reduction, p95 no worse than 10%, and no new long task. The safe choice is to omit the source-batching production change and retain the existing implementation. No source-format or history behavior is claimed for the omitted candidate.

The candidate in commit `b7e3f6834041b72fdd75767f8048cf9139953626` changed `resizeCluster` to reuse `designSource.editMappingFields` for sibling arrangement fields and tightened a parser-call ceiling from 10 to 9. I reverted exactly those two source/test hunks in the worktree. The measurement-only `PERF_TIMEOUT_MS` support in `app/e2e/studio-performance.spec.ts` remains intact for Todo 1 evidence. No unrelated files were changed.

The available controlled comparison did not pass the plan rule. Add-columns changed from 16,852.2 ms to 16,698.5 ms median (0.9% reduction) while p95 changed from 24,115.2 ms to 26,795.8 ms (11.1% worse). Add-rows changed from 18,800.0 ms to 21,872.8 ms median (16.3% worse). Drag changed from 9,756.6 ms to 11,505.7 ms median, with long tasks increasing from 10 to 12. These measurements support omission; they do not support a performance claim.

## Verification after omission

The restored source behavior passed the focused semantic and history checks:

```text
pnpm --dir app exec vitest run src/utils/studioSource.test.ts src/utils/studioSourceBatch.test.ts src/utils/layoutSource.test.ts src/utils/sourceSnapshot.test.ts src/utils/studioMove.test.ts --reporter=verbose
5 test files, 50 tests passed, exit 0
```

```text
pnpm --dir app exec vitest run src/utils/projectHistory.test.ts src/utils/resizeSpacing.test.ts --reporter=verbose
2 test files, 25 tests passed, exit 0
```

The checks cover matrix growth/shrink semantics, authored comments and expressions, IDs, owned electronics and companions, locks, aliases, malformed YAML, movement, and one-step history behavior. The earlier source/assembly run also remains available in the Todo 1 evidence directory; this report relies on the fresh post-revert runs above for the final verdict.

The final restoration check used `cmp` against `git show b7e3f68^` and found both reverted files byte-for-byte identical to the parent paths. The benchmark timeout support remains at `app/e2e/studio-performance.spec.ts:30` and the e2e file has no worktree diff. The final status/diff receipt records the two intentional source/test reversions, a passing `git diff --check`, empty ports 4184/4185, and no owned browser or preview processes.

## manualQa

### surfaceEvidence

| scenario id | criterion reference | surface | exact invocation | verdict | artifactRefs |
| --- | --- | --- | --- | --- | --- |
| T3-S1 | Todo 3 semantic regression after omission | source/data | `pnpm --dir app exec vitest run src/utils/studioSource.test.ts src/utils/studioSourceBatch.test.ts src/utils/layoutSource.test.ts src/utils/sourceSnapshot.test.ts src/utils/studioMove.test.ts --reporter=verbose` | PASS | `A1`, `A2` |
| T3-S2 | Todo 3 history regression after omission | source/history | `pnpm --dir app exec vitest run src/utils/projectHistory.test.ts src/utils/resizeSpacing.test.ts --reporter=verbose` | PASS | `A3`, `A4` |
| T3-S3 | Todo 3 controlled performance gate | browser benchmark | compared against Todo 1 rule using `.omo/evidence/performance-responsiveness-refactor/timing-summary-final.json`; no qualifying post-change improvement was established | NO_CHANGE | `A5`, `A6` |

### adversarialCases

| scenario id | criterion reference | adversarial class | expected behavior | verdict | artifactRefs |
| --- | --- | --- | --- | --- | --- |
| T3-A1 | Todo 3 malformed/locked resize failure QA | malformed or locked source | Existing validation rejects malformed or locked edits without partial source acceptance | PASS | `A1`, `A3` |
| T3-A2 | Todo 3 stale state/history guard | stale state | Existing history and resize checks preserve one undoable transaction and do not publish a partial candidate | PASS | `A3` |
| T3-A3 | Todo 3 performance acceptance | misleading success | A candidate without the required median/p95/long-task improvement is omitted rather than claimed | PASS | `A5`, `A6` |

## Artifact references

| id | kind | description | path |
| --- | --- | --- | --- |
| A1 | test log | Fresh post-revert source/layout/movement suite; exit 0, 5 files and 50 tests | `.omo/evidence/performance-responsiveness-refactor/task-3-revert-source.log` |
| A2 | exit ledger | SHA and exit code for the post-revert source suite | `.omo/evidence/performance-responsiveness-refactor/task-3-revert-source.exit` |
| A3 | test log | Fresh post-revert history/resize suite; exit 0, 2 files and 25 tests | `.omo/evidence/performance-responsiveness-refactor/task-3-revert-history.log` |
| A4 | exit ledger | SHA and exit code for the post-revert history suite | `.omo/evidence/performance-responsiveness-refactor/task-3-revert-history.exit` |
| A5 | baseline timing JSON | Complete Todo 1 measurement used for the controlled comparison rule | `.omo/evidence/performance-responsiveness-refactor/timing-summary-final.json` |
| A6 | baseline report | Fixture, comparison rule, long-task evidence, and benchmark verdict | `.omo/evidence/performance-responsiveness-refactor/task-1-baseline.md` |
| A7 | cleanup receipt | Final ports, owned-process scan, exact tracked reversion scope, and diff check | `.omo/evidence/performance-responsiveness-refactor/task-3-revert-cleanup.log` |
| A8 | cleanup ledger | Cleanup command exit code and SHA | `.omo/evidence/performance-responsiveness-refactor/task-3-revert-cleanup.exit` |
| A9 | final restoration log | Byte-for-byte parent comparison, timeout preservation, final git status/diff, ports and process scan | `.omo/evidence/performance-responsiveness-refactor/task-3-final-status.log` |
| A10 | final restoration ledger | Final verification exit code and SHA | `.omo/evidence/performance-responsiveness-refactor/task-3-final-status.exit` |
| A11 | final test log | Combined final source, layout, movement and history run; exit 0, 7 files and 75 tests | `.omo/evidence/performance-responsiveness-refactor/task-3-final-vitest.log` |
| A12 | final test ledger | Final focused test exit code and SHA | `.omo/evidence/performance-responsiveness-refactor/task-3-final-vitest.exit` |

## Cleanup and DoneClaim

Cleanup completed at 2026-09-20T21:29:23-04:00. Ports 4184 and 4185 are free, no owned browser/preview Node processes remain, and `git diff --check` passes. The only remaining tracked worktree changes are the exact reversions of the two Todo 3 source/test hunks; the timeout-only benchmark support remains committed. No commit was created by this reversion.

DoneClaim: Todo 3 candidate omitted under the controlled performance gate; source/test changes reverted; focused semantic/history regressions pass; cleanup receipt and no-change evidence are complete.

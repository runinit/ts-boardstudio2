# F3 final surface QA

Verdict: **PASS for the F3 target surface at SHA `bfaafb4b1aca4fe849d1effdef0872dc6b91672d`**, with one retained delayed-outline scenario classified as a pre-existing geometry-fixture failure. The final committed `app/src/utils/studioSource.ts` matches the retained baseline source snapshot (`30f533f8fccb16c17354b3011c7cd89a4d86abcfc326481094a34400ee5099bf`). No product or test files were edited by this QA pass.

The final surface evidence covers the 60-key browser board, matrix and legacy outline recovery, responsive inspector/workbench/snapping controls, rapid edit persistence, frozen contours, and benchmark mutation correctness. A fresh exact-SHA browser run completed 15 tests (14 passes and one delayed-outline failure). The same failure is present in the retained candidate, baseline, and restored runs, so it is not a regression attributable to this commit. If the full delayed-outline scenario is required as an unconditional release gate, it remains a blocker outside this change.

## Scenario plan and reflection

Before execution, I scoped these 20 checks to the changed source path and its existing browser probes:

1. Load the 60-key native fixture and show the board outline.
2. Move a selected component and retain its source/position after reload.
3. Nudge a component through rapid delayed analysis and undo/reload.
4. Edit an inspector value at 1440px.
5. Edit an inspector value at 390px.
6. Create and move a matrix, rebuild its outline, and undo it as one edit.
7. Repair an imported legacy component region only on request and undo exactly.
8. Keep snapping disclosure usable at 1440px.
9. Keep snapping disclosure usable at 390px.
10. Keep snapping disclosure usable at 320px.
11. Keep snapping disclosure usable at 844px.
12. Persist rapid moves through delayed analysis, undo, and reload.
13. Preserve drag, nudge, and inspector edits through delayed outline updates.
14. Preserve exact frozen contours across reload and rebuild.
15. Keep outline controls clear of canvas tools at 1440px.
16. Keep outline controls clear of canvas tools at 390px.
17. Keep outline controls clear of canvas tools at 320px.
18. Complete the 10×6 native LED benchmark's add/remove row, column, and key mutations without source or worker errors.
19. Preserve the source-batching parse-count assertion and focused unit behavior.
20. Run the production build/precommit integrity gate without formatter or lint drift.

Reflection added five adversarial checks before reviewing results:

- Compare candidate, base, and restored builds to detect a stale artifact or wrong checkout.
- Use fresh browser contexts with zero retries to distinguish flakiness from a deterministic failure.
- Reconcile Playwright exit status, discovered count, pass/fail lines, screenshots, and traces so a misleading count cannot pass.
- Require finite command timeouts and verify preview/browser teardown on every lane.
- Replay the captured geometry with one connected boundary, then with multiple components, to detect a hidden-control false pass or fixture validity issue.

## `manualQa`

### `surfaceEvidence`

| Scenario | Criterion reference | Surface | Exact invocation | Verdict | Artifact refs |
|---|---|---|---|---|---|
| F3-001 | 60-key board render/source baseline | Chromium production preview, 1440×1000 | `timeout 1800 env PLAYWRIGHT_PORT=4185 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/studio-continuous.spec.ts e2e/outline-recovery.spec.ts e2e/inspector-resize.spec.ts e2e/workbench-layout.spec.ts e2e/snapping-disclosure.spec.ts --workers=1 --retries=0 --trace=retain-on-failure --reporter=list --output=../.omo/evidence/performance-responsiveness-refactor/task-6-browser` | PASS | A01, A02, A03 |
| F3-002 | Source/position persistence after move | Chromium browser UI | Same exact invocation as F3-001; `studio-performance.spec.ts` benchmark evidence also captured source/reload state | PASS | A01, A04 |
| F3-003 | Rapid move, undo, and reload | Chromium browser UI | Same exact invocation as F3-001; `studio-continuous.spec.ts:98` | PASS | A01, A05 |
| F3-004 | Inspector edit at 1440px | Chromium browser UI | Same exact invocation as F3-001; `inspector-resize.spec.ts:16` | PASS | A01 |
| F3-005 | Inspector edit at 390px | Chromium browser UI | Same exact invocation as F3-001; `inspector-resize.spec.ts:16` | PASS | A01 |
| F3-006 | Matrix outline creation/move/rebuild/undo | Chromium browser UI, 1280×720 capture | Same exact invocation as F3-001; `outline-recovery.spec.ts:39` | PASS | A01, A06 |
| F3-007 | Legacy region repair and exact undo | Chromium browser UI, 1280×720 capture | Same exact invocation as F3-001; `outline-recovery.spec.ts:95` | PASS | A01, A07 |
| F3-008 | Snapping disclosure at 1440px | Chromium browser UI | Same exact invocation as F3-001; `snapping-disclosure.spec.ts:12` | PASS | A01 |
| F3-009 | Snapping disclosure at 390px | Chromium browser UI | Same exact invocation as F3-001; `snapping-disclosure.spec.ts:12` | PASS | A01 |
| F3-010 | Snapping disclosure at 320px | Chromium browser UI | Same exact invocation as F3-001; `snapping-disclosure.spec.ts:12` | PASS | A01 |
| F3-011 | Snapping disclosure at 844px | Chromium browser UI | Same exact invocation as F3-001; `snapping-disclosure.spec.ts:12` | PASS | A01 |
| F3-012 | Frozen contours across reload/rebuild | Chromium browser UI | Same exact invocation as F3-001; `studio-continuous.spec.ts:290` | PASS | A01, A08 |
| F3-013 | Delayed drag/nudge/inspector outline flow | Chromium browser UI | Same exact invocation as F3-001; `studio-continuous.spec.ts:164` | FAIL, known unrelated | A01, A09, A10, A20, A21 |
| F3-014 | Outline controls clear of tools at 1440px | Chromium browser UI | Same exact invocation as F3-001; `workbench-layout.spec.ts:12` | PASS | A01 |
| F3-015 | Outline controls clear of tools at 390px | Chromium browser UI | Same exact invocation as F3-001; `workbench-layout.spec.ts:12` | PASS | A01 |
| F3-016 | Outline controls clear of tools at 320px | Chromium browser UI | Same exact invocation as F3-001; `workbench-layout.spec.ts:12` | PASS | A01 |
| F3-017 | Native mutation benchmark source/worker completion | Chromium production preview, 10×6 native LED fixture | `PLAYWRIGHT_PORT=4184 PERF_TIMEOUT_MS=1800000 PERF_OUTPUT=../.omo/evidence/performance-responsiveness-refactor/baseline-final PERF_COLUMNS=10 PERF_NATIVE_ROWS=6 PERF_LED=1 PERF_REPEATS=5 pnpm --dir app exec playwright test e2e/studio-performance.spec.ts --workers=1 --retries=0 --timeout=1800000 --output=../.omo/evidence/performance-responsiveness-refactor/baseline-final-run --trace=on --reporter=list` | PASS for correctness; no speedup claim | A11, A12 |
| F3-018 | Source batching and parse-count behavior | Vitest/jsdom | Historical focused invocation retained in A13; the final SHA explicitly omits the unproven batching optimization. | N/A for this final surface change | A13 |
| F3-019 | Production build and precommit integrity | Repository precommit | `VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 timeout 1800 pnpm precommit` | PASS | A14 |
| F3-020 | Candidate screenshot inspection | Existing Chromium screenshots, 1440×1000 and 1280×720 | `view_image` inspection of retained PNGs listed in A03, A04, A06, and A07 | PASS | A03, A04, A06, A07 |

The earlier focused reporter discovered 15 tests but emitted 14 result lines. The fresh exact-SHA rerun emitted all 15 result lines: 14 passes and the one known failure. The fresh `.last-run.json`, exit code, result lines, error context, and trace were checked together.

### `adversarialCases`

| Scenario | Criterion reference | Adversarial class | Expected behavior | Verdict | Artifact refs |
|---|---|---|---|---|---|
| ADV-001 | F3-013 classification | Stale artifact/wrong checkout | Candidate and base builds should be independently rebuilt and source hashes recorded. | PASS: final SHA source hash matches the retained baseline snapshot; base and candidate logs are retained. | A09, A15, A16, A20 |
| ADV-002 | F3-013 classification | Flaky fresh context | Zero retries should reproduce or distinguish the failure; a single pass must not hide it. | PASS: candidate, base, and restored fresh runs all fail at the same assertion. | A09, A15, A16 |
| ADV-003 | F3-013 classification | Misleading exit/count/screenshots | Reconcile exit code, `.last-run.json`, reporter lines, screenshots, and trace. | PASS: exit 1 and failure evidence are retained; the unreported fifteenth discovery is explicitly not treated as pass. | A01, A09, A17 |
| ADV-004 | All browser lanes | Unbounded runtime/unclean teardown | Commands must have finite timeouts and leave no preview/browser listeners. | PASS: bounded invocations are recorded; ports 4184/4185 and owned processes are clear. | A01, A14, A18 |
| ADV-005 | F3-013 classification | Hidden-control/invalid-geometry false pass | Geometry replay should distinguish a valid single boundary from disconnected geometry. | PASS: `geometry-toggle.cjs` exits 0 after matching single-fails, multiple-succeeds, single-fails. | A19 |

### `artifactRefs`

| ID | Kind | Description | Path |
|---|---|---|---|
| A01 | browser-log | Focused 5-spec Playwright list output | `.omo/evidence/performance-responsiveness-refactor/task-6-browser-run.log` |
| A02 | browser-exit | Focused browser exit status | `.omo/evidence/performance-responsiveness-refactor/task-6-browser/run.exit` |
| A03 | screenshot | 60-key before/after/reload/nudge PNGs personally inspected | `.omo/evidence/performance-responsiveness-refactor/baseline-final/` |
| A04 | screenshot | Component moved and reloaded state | `.omo/evidence/performance-responsiveness-refactor/baseline-final/component-moved-reloaded.png` |
| A05 | screenshot | Rapid-edit final state | `.omo/evidence/performance-responsiveness-refactor/baseline-final/last-state.png` |
| A06 | screenshot | Matrix outline rebuilt state | `.omo/evidence/performance-responsiveness-refactor/task-6-browser/outline-recovery-creates-m-d9ef5-utline-as-one-undoable-edit-chromium/matrix-rebuilt.png` |
| A07 | screenshot | Legacy outline rebuilt state | `.omo/evidence/performance-responsiveness-refactor/task-6-browser/outline-recovery-repairs-a-6258d--request-and-undoes-exactly-chromium/legacy-rebuilt.png` |
| A08 | screenshot | Frozen contour rebuild state | `.omo/evidence/performance-responsiveness-refactor/baseline-final/post-nudge-rebuilt.png` |
| A09 | failure-trace | Candidate delayed-outline failure, exact locator and UI snapshot | `.omo/evidence/performance-responsiveness-refactor/task-6-debug/candidate-run/` |
| A10 | worker-diagnostics | Candidate worker error: disconnected `main_edge` boundary | `.omo/evidence/performance-responsiveness-refactor/task-6-debug/candidate-diagnostic/diagnostic-keeps-drags-nud-6fdd5-ugh-delayed-outline-updates/worker-diagnostics.json` |
| A11 | benchmark-json | Complete 51-record native benchmark | `.omo/evidence/performance-responsiveness-refactor/baseline-final/timings.json` |
| A12 | benchmark-exit | Benchmark list output and exit receipt | `.omo/evidence/performance-responsiveness-refactor/baseline-final.log` and `.omo/evidence/performance-responsiveness-refactor/baseline-final.exit` |
| A13 | unit-log | 19 files / 157 focused tests, exit 0 | `.omo/evidence/performance-responsiveness-refactor/task-6-unit/run.log` and `run.exit` |
| A14 | precommit-log | Precommit, build, lint, and test receipt | `.omo/evidence/performance-responsiveness-refactor/task-6-precommit.log` and `task-6-precommit.exit` |
| A15 | debug-log | Candidate isolated delayed-outline run | `.omo/evidence/performance-responsiveness-refactor/task-6-debug/candidate-run.log` |
| A16 | debug-log | Baseline and restored isolated delayed-outline runs | `.omo/evidence/performance-responsiveness-refactor/task-6-debug/base-diagnostic.log` and `restored-run.log` |
| A17 | playwright-state | Retained discovered/failed test state | `.omo/evidence/performance-responsiveness-refactor/task-6-browser/.last-run.json` |
| A18 | cleanup | F3 process/port receipt | `.omo/evidence/performance-responsiveness-refactor/final-surface-cleanup.log` |
| A19 | replay-log | Deterministic connected-boundary geometry replay | `.omo/evidence/performance-responsiveness-refactor/task-6-debug/geometry-toggle.log` and `geometry-toggle.exit` |
| A20 | browser-log | Fresh exact-SHA bfaafb4 focused surface run | `.omo/evidence/performance-responsiveness-refactor/final-f3-browser-bfa-run.log` and `final-f3-browser-bfa.exit` |
| A21 | failure-trace | Fresh exact-SHA delayed-outline failure | `.omo/evidence/performance-responsiveness-refactor/final-f3-browser-bfa/studio-continuous-keeps-dr-02a59-ugh-delayed-outline-updates-chromium/` |

## Known unrelated failure

The delayed-outline scenario fails at `studio-continuous.spec.ts:164` when the 2×2 matrix edit produces `designs.boundaries.main_edge: Expected one connected region; found 2`; the outline locator then has no visible geometry. The exact final SHA run, retained candidate run, Todo 3-disabled baseline run, and restored run all fail with the same locator and diagnostic. The evidence-local geometry replay returns exit 0 for the expected single-fails/multiple-succeeds/single-fails sequence. This makes the failure a pre-existing invalid-boundary fixture/validation issue, not a regression from the omitted batching optimization.

## Cleanup

This QA pass launched no server and edited no product/test files. Existing parent-owned dirty files remain untouched. The retained evidence reports no listeners on ports 4184 or 4185 and no running Playwright/Vite processes.

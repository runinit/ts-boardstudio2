# Todo 6 integration validation

Verdict: **INCOMPLETE / DISCLOSED** for the run captured at SHA `64bfc2e84dc871b191d237fbd3d759f67fc05a76`; the delivered branch is finalized at `bfaafb4b1aca4fe849d1effdef0872dc6b91672d`.

The focused unit gate and precommit passed. The focused browser gate ran 14 scenarios with 13 passes and one failure in the delayed-worker continuous flow. Follow-up debugging reproduced the same disconnected-boundary failure with the batching hunk disabled, so it is recorded as a pre-existing fixture/geometry defect. The batching candidate was subsequently omitted; no product or test files were edited by this validation lane.

## Focused unit validation

Surface: Vitest/jsdom unit tests in the task worktree, Node `v24.14.0`, pnpm `11.26.0`, two workers, finite 300-second timeout.

Exact invocation:

```text
VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 timeout 300 pnpm --dir app exec vitest run src/utils/addCellBatch.test.ts src/utils/appendSourceFields.test.ts src/utils/applyAssembly.test.ts src/utils/assemblyInterleaving.test.ts src/utils/layoutSource.test.ts src/utils/removeSourceValues.test.ts src/utils/sourceSnapshot.test.ts src/utils/studioDelete.test.ts src/utils/studioMove.test.ts src/utils/studioSource.test.ts src/utils/studioSourceBatch.test.ts src/utils/studioOutline.test.ts src/utils/studioOutlineReuse.test.ts src/workers/studioPipeline.test.ts src/workers/studioPipeline.stages.test.ts src/utils/studioQueue.test.ts src/hooks/useStudio.test.ts src/molecules/StudioCanvas.test.tsx src/context/ConfigContext.test.tsx --maxWorkers=2 --minWorkers=1 --reporter=verbose
```

Observed: **19 files / 157 tests passed**, exit `0`. This covers source batching, layout/history, outline reuse, worker supersession, canvas interactions, and ConfigContext behavior. Warnings from React `act(...)`, mocked JSCAD errors, and GitHub fixture logging are retained in the log and did not fail assertions.

## Focused browser validation

Surface: Chromium browser UI against a fresh Vite production preview at port `4185`. Port `4184` was already occupied by another actor's benchmark preview and was not stopped or reused. The run used one worker, zero retries, retained failure traces, and list reporting.

Exact invocation:

```text
timeout 1800 env PLAYWRIGHT_PORT=4185 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/studio-continuous.spec.ts e2e/outline-recovery.spec.ts e2e/inspector-resize.spec.ts e2e/workbench-layout.spec.ts e2e/snapping-disclosure.spec.ts --workers=1 --retries=0 --trace=retain-on-failure --reporter=list --output=../.omo/evidence/performance-responsiveness-refactor/task-6-browser
```

Observed results:

- PASS: both 1440px and 390px inspector-resize scenarios.
- PASS: both outline-recovery scenarios.
- PASS: all four snapping-disclosure viewport scenarios.
- PASS: rapid moves through delayed analysis, undo, and reload.
- PASS: frozen contours through reload and rebuild.
- PASS: all three workbench-layout viewport scenarios.
- FAIL: `studio-continuous.spec.ts` — `keeps drags, nudges and inspector edits through delayed outline updates`.

The failed assertion is a real browser assertion, not a process timeout:

```text
expect(locator).toBeVisible() failed
Locator: getByRole('group', { name: 'Interactive board layout' }).locator(':scope > g[transform="scale(1,-1)"][pointer-events="none"]')
Expected: visible
Timeout: 5000ms
```

The failure snapshot showed the app still displaying the last valid geometry and a `designs.boundaries.main_edge: Expected one connected region; found 2` analysis alert after the test created the 2×2 matrix. The retained trace and error context are linked in the artifacts below. This lane does not claim the delayed outline flow complete.

## Precommit

Surface: repository precommit from the task worktree, Node `v24.14.0`, pnpm `11.26.0`, finite 1800-second timeout.

Exact invocation:

```text
VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 timeout 1800 pnpm precommit
```

Observed: **exit `0`**, 148 files / 1,038 Vitest tests passed. Prettier and ESLint reported unchanged files. The post-run status contains only the three pre-existing task files plus the existing `.omo` evidence/plans directories; `git diff --check` passed.

## Benchmark comparison

The plan requires a warm-up plus five measured repeats using the same 10×6 native, LED-enabled 60-key fixture, with a 15% median improvement, p95 no worse than 10%, and no new long task. The parent-owned five-repeat diagnostic run completed with exit `0`; `baseline-final/timings.json` contains all 51 expected records with zero timing errors. Since the candidate was omitted, this run is retained as evidence only and no delivered-branch improvement is claimed.

Against the earlier partial baseline (`baseline/timings.json`, 50/51 records and four `add-key` samples), the completed run does not meet the performance gate. Matched settled medians changed as follows: nudge `9768.7→9726.1ms` (`0.4%` lower) with p95 `+20.0%`; drag `9756.6→11505.7ms` (`17.9%` slower) with p95 `+22.6%`; add-columns `16852.2→16698.5ms` (`0.9%` lower) with p95 `+11.1%`; add-rows `18800.0→21872.8ms` (`16.3%` slower) with p95 `+18.3%`; remove-columns `9549.7→9397.6ms` (`1.6%` lower) with p95 `+14.2%`; remove-rows `9397.9→10297.0ms` (`9.6%` slower) with p95 `+17.8%`; remove-key `12912.4→12929.9ms` (`0.1%` slower) with p95 unchanged; add-key `13511.8→13443.6ms` (`0.5%` lower) with p95 `+0.2%`. Long-task counts increased for drag (`10→12`) and remove-rows (`5→6`), with no group achieving the required median, p95, and long-task conditions. Because the earlier comparison artifact is incomplete and both runs carry the same dirty-worktree SHA, this is diagnostic evidence rather than a clean before/after acceptance proof; it still provides no basis for claiming a gain.

## Scope and cleanup

Tracked source status before and after validation remained:

```text
 M app/e2e/studio-performance.spec.ts
 M app/src/utils/studioSource.ts
 M app/src/utils/studioSourceBatch.test.ts
```

No source/test edit, commit, reset, or formatter drift was introduced by this lane. Port 4185 and this lane's preview/browser processes were released. The parent-owned port 4184 benchmark also exited 0 and released its preview; no listener remains.

## Artifacts

| artifact | description |
|---|---|
| `task-6-unit/run.log` / `run.exit` | 19 focused Vitest files, 157 tests, exit 0 |
| `task-6-browser-run.log` | Complete list reporter output for 14 focused browser scenarios |
| `task-6-browser/run.exit` | Browser command exit 1 |
| `task-6-browser/studio-continuous-keeps-dr-02a59-ugh-delayed-outline-updates-chromium/error-context.md` | Exact delayed-outline assertion failure and snapshot |
| `task-6-browser/studio-continuous-keeps-dr-02a59-ugh-delayed-outline-updates-chromium/trace.zip` | Retained browser trace for the failed scenario |
| `baseline-final/timings.json` | Complete parent-owned five-repeat benchmark: 51 records, zero timing errors |
| `/home/chris/projects/.omo/evidence/performance-responsiveness-refactor/baseline-final.log` / `baseline-final.exit` | Benchmark list output and exit 0 receipt |
| `task-6-precommit.log` / `task-6-precommit.exit` | Precommit output and exit 0 |
| `task-6-precommit-receipt.txt` | Before/after status and diff-check receipt |
| `task-6-cleanup-receipt.log` | Runtime port/process cleanup and tested SHA |

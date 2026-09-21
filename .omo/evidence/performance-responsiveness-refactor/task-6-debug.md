# Delayed-outline failure: confirmed baseline geometry error

**Confirmed, unrelated to Todo 3.** The unchanged delayed-outline scenario reaches a layout with two disconnected regions while `designs.boundaries.main_edge.connected` requires `single`. The worker returns `designs.boundaries.main_edge: Expected one connected region; found 2` with diagnostic code `disconnected`. The UI shows `Layout analysis failed · 39 keys`; the final visible-outline assertion then fails. No worker race or timeout-setting regression is needed to explain this observation.

No product fix was made because the failure persists without the task's production change. The existing failing browser scenario and an evidence-local deterministic geometry replay lock the finding. Changing the product's connectivity contract or weakening the browser assertion would broaden this task.

## Hypotheses and direct evidence

1. **Batched arrangement write:** refuted. Fresh candidate build and fresh baseline build with only Todo3's studioSource.ts hunk removed both fail identically. Test fixture construction also uses the corresponding toggled source. The exact candidate bytes and initial diff were captured before toggling, and restored afterward.
2. **Measurement timeout change:** refuted by module isolation. `studio-performance.spec.ts` is not imported by the isolated studio-continuous scenario or diagnostic harness, and its PERF_TIMEOUT_MS read occurs inside its own test body. No timeout or retry change was made to this scenario.
3. **Existing stale worker/outline behavior:** narrowed to a confirmed baseline geometry-validation error. Passive worker capture shows a correlated error reply for the current request. The captured final source has the second matrix at `[161,0,0]`, a moved outer key, `connected: single` and `bridges: {}`. This alone does not assign blame between fixture expectations and intended automatic bridging; it proves the generation rejection behind the missing drawing.

The exact validation branch is engine/src/designs/geometry.js:112, rejecting a contour count other than one when connected is single. No engine code was edited.

## Reproduction and toggle ledger

All commands ran in `/home/chris/projects/ts-boardstudio2-performance-refactor`, Node 24.14.0, pnpm 11.26.0, base SHA `64bfc2e84dc871b191d237fbd3d759f67fc05a76`, one browser worker, retries zero, owned port 4184. Paths below are relative to `.omo/evidence/performance-responsiveness-refactor/task-6-debug/`.

Build command for candidate, baseline and restored candidate:

```sh
NODE_OPTIONS=--max-old-space-size=3072 timeout 300 pnpm --dir app exec vite build
```

All three builds exited 0. Captured artifacts: candidate-build/base-build/restored-build `.log`, `.exit`, `.sha256`. Each browser result therefore has a fresh build; installed engine and dependencies were unchanged. Builds are recorded individually rather than assumed byte-identical.

Exact existing regression invocation, run before and after the toggle:

```sh
PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never timeout 180 \
pnpm --dir app exec playwright test e2e/studio-continuous.spec.ts \
  --grep 'keeps drags, nudges and inspector edits through delayed outline updates' \
  --workers=1 --trace=retain-on-failure --reporter=list --output=<dedicated-output>
```

Candidate-run and restored-run both exit **1**, one failed scenario with the same missing-outline assertion and analysis-failed UI. Logs/exits and adjacent trace/error-context artifacts are retained under their named directories. This is repeated failure confirmation, not passing QA.

Worker observation uses diagnostic.spec.ts, an evidence-local copy of the same scenario with passive message recording and after-test source/screenshot capture; no assertions/actions were changed. Exact invocation:

```sh
PLAYWRIGHT_HTML_OPEN=never timeout 180 pnpm --dir app exec playwright test \
  --config ../.omo/evidence/performance-responsiveness-refactor/task-6-debug/diagnostic.config.cjs \
  --grep 'keeps drags, nudges and inspector edits through delayed outline updates' \
  --reporter=list --output=<dedicated-output>
```

Candidate-diagnostic and base-diagnostic both exit **1**. Their `worker-diagnostics.json` files contain the identical connected-region error, and `final-source.yaml`/`final-state.png` preserve the source and UI. All diagnostic outputs live in `diagnostic-keeps-drags-nud-6fdd5-ugh-delayed-outline-updates/` below the respective run directory. The original uninstrumented scenario failed before and after, excluding instrumentation as a necessary cause.

Deterministic mechanism/regression command:

```sh
timeout 120 node .omo/evidence/performance-responsiveness-refactor/task-6-debug/geometry-toggle.cjs
```

Actual exit **0**, meaning all three expected outcomes were asserted: captured original source rejects with the exact two-region error; changing only the in-memory boundary connectivity requirement to multiple generates the boundary; replaying the original single-region source rejects again. Artifacts: geometry-toggle.cjs, geometry-toggle.log, geometry-toggle.exit and captured candidate final-source.yaml. This test-only in-memory change was not applied to product files or persisted project fixtures.

## Cleanup and limits

`cleanup.log` proves the full tracked diff matches start.diff (`source_diff_restoration_exit=0`), candidate source hash is restored, diff whitespace check passes, and ports 4184/4185 plus owned browser/preview processes are released. The candidate was rebuilt after restoration. No source instrumentation or permanent product/test edit was introduced; existing owner edits remain intact. Evidence-local harnesses, traces and snapshots are intentionally retained for reproduction. No commit was made.

One attempted read-only debugging subagent was blocked by OMO's existing spawn fan-out cap (63/60); local investigation completed without raising it. No unresolved two-round hypothesis failure required further escalation.

DoneClaim: root cause behind this browser failure and its independence from Todo3 are confirmed by browser toggle and deterministic geometry toggle. The browser scenario remains failing and must remain disclosed in integration results. No unrelated repair or full-suite pass is claimed.

# Browser performance QA — WATCH

Final production artifact: root build-final.log passed. Reviewed staged tree `348e0e5f520a45268ba80a01f90627f8a0f575d8`, base HEAD `347229abc1561a44a2dc6cc0cee50969b49b267e`, frozen-final.patch SHA256 `2629ad6baca3a38072a3edb2777416d82a75e2a16d8a02943047db0ad70623ec`. This is staged content, not a commit. Final two harness corrections were source-key lookup parity and selecting an owned diode through its actual canvas control; production build unchanged.

## Actual browser execution

Chromium147, production Vite preview,1440×1000, one worker, port3107; no concurrent profiling. Actions use real keyboard, pointer and inspector controls. Exact baseline YAML seeds main60. Each measured operation waits for its exact source/requestId/revision outline stage AND success before the next operation, then requires a visible nonempty contour and absence of layout-failure/retained-geometry diagnostics. Success is necessary because outline-stage messages are not themselves published by the UI. JSON packet/source artifacts permit independent correlation.

- `after/final-plain60/`:3 repetitions of nudges, positive drags, row/column additions/removals; all measured actions passed source, geometry and worker assertions. Exact+3mm freeze/rebuild also passed. Test subsequently failed a stale harness source lookup after correctly removing interior c2_r2; failure preserved, never counted as whole-test pass.
- `after/final-plain60-correctness/`: corrected harness1repeat **PASS**, including all movement/structural/individual-key edits, undo/redo exact source and reload. Console/page errors empty. This closes the prior harness failure without discarding valid3repeat metrics.
- `after/final-native39/`: compileSetup13×3, default diodes, LEDfalse. Every key/row/column action, source/worker/contour check, undo/redo/reload passed. The test then failed an incorrect component-tree selector (owned clustered diodes are intentionally omitted from free-object list). This run is a partial pass, not a full-test pass.
- `after/final-component/`: focused current-UI owned diode scenario **PASS** using native39 final source. Select Objects, focus actual canvas diode, Enter, inspectorX=1; exact placement assertion, exact undo/redo source, reload, matching worker success and valid current contour. Permanent helper now uses this proven route. Temporary capture spec archived and removed.
- `after/final-snap/`: existing edge relationship test still **FAILS** serial: Keep relationship · Edge offset remains disabled briefly and disappears before becoming enabled (spec188). No test weakened. Cause not established; remains unresolved, not labeled preexisting merely because test existed.

## Measurements and honest comparison

All milliseconds;3repeat medians unless stated. Original movement baseline measured committed polygon only. Therefore compare it to final committedPolygonMs, NEVER to new transform first-frame measurement. Baseline queue backlog means outline status durations are not isolated engine comparisons. Removal baseline starts at confirmation, excludes preparation.

| Action | Baseline visible polygon | Final comparable polygon | Final first frame | Final persisted source |
| --- | ---: | ---: | ---: | ---: |
| Nudge |82 |75.5 |29.5 |29.3 |
| Drag |about120 |130.9 |31.3 |83.1 |
| Add column |1498 representative |111.8 |111.9 |111.7 |
| Add row |2556 representative |115.7 |115.8 |115.6 |
| Remove column, confirmation |59 representative |52.5 |52.6 |52.4 |
| Remove row, confirmation |52 representative |55 |55 |54.9 |

Structural addition response improved approximately13×/22×. Do not claim a drag polygon speedup: final committed drag is slightly slower; direct first-frame motion is31ms with no comparable baseline frame measurement. First cold nudge was102ms frame/102ms source and162ms polygon. Target100ms is therefore not universally met. Main60 removal preparation medians116ms column/117ms row, measured Tab→review dialog with source unchanged; no baseline preparation comparison exists.

Exact+3mm main60: nudge outline-stage5836ms, matching published success6254ms. Frozen Rebuild outline success6329ms. Both carry exact-source request/revision in `nudge-2-worker.json` and `rebuild-worker.json`; contour screenshot `post-nudge-rebuilt.png`. Baseline exact+3mm stalled beyond60s. Final passes60s completion but fails aspirational5s outline budget. All final main60 structural successes were3.1–4.0s; drag successes3.3–6.2s. Managed region stays exactly `main_keycap`,1→1 throughout every measured action/rebuild, rather than accumulating recipes.

Main60 individual-key1repeat: remove67ms/add92ms source+visible, matching successes6.04/6.14s. Native39 single run: nudge157ms, drag24ms first frame; add column344ms/add row363ms; removal preparation236/242ms, confirmation112/124ms; individual-key remove145ms/add193ms. Native outline successes3.8–6.6s. Thus native structural actions also miss100ms and some5s budgets; no native browser baseline speedup claimed. Direct mutation profiling is separate evidence.

## Correctness, adversarial and prior broad suite

Exact cell/count/source assertions retained, c2_r2 chosen as valid interior deletion. Earlier outer-key removal after outward movement intentionally disconnected the layout: preserved `after/plain60/last-source.yaml`, screenshot/log. Engine comparison proved HEAD and current, raw and prepared, all reject found2; physical nearest-cap gap10mm. This is correct rejection, not a performance regression. Earlier7mm offset fixture improves from HEAD extent failure to current valid contour per engine evidence.

Root broad suite on preceding build:163passed,29failed,1existing skip; all29 contexts and full log archived in `after/full-suite/`. See `FAILURES.md` for individual names and causal source references. Three long CNC/library cases subsequently all passed serial on the same build (`after/serial-failures/run.log`); exact reason for parallel failure not proven. Twenty-two cases have direct unchanged missing/hidden/obsolete-UI proof. Additional native-sideview expectation uses absolute2.5mm while unchanged DimensionField renders local0.5mm; settings rename never reaches rename because inspector is closed (separate audit). Continuous delayed-outline test remains a known unchanged undo/redo request-mode gap: exact raw source fails HEAD/current while prepareOutlines source passes both; unchanged useStudio edit-only rebuild gate sends keep on undo/redo, leaving missing intercluster bridge. Evidence `after/continuous-capture/`; do not claim that test passes. Snap is the remaining unresolved serial failure. No broad claim that pnpm check passes.

Freeze/reload/rebuild and rapid-move coverage from broad suite retained; root independently reruns relevant focused cases after this lane. No optional native80 work or broad unrelated UI fixes performed.

## Visual inspection and cleanup

Opened actual final plain60 after.png and native component-moved-reloaded.png. Both show complete contiguous outlines and current key counts, no error overlays/clipped core controls. Native UI has Review2blockers assembly findings; this is not a claim of manufacturing readiness or zero findings. Console/page error arrays are empty in both final main/native timing files; focused component page errors empty.

Every Playwright preview/browser process exited. Port3107 checked closed after final snap. Temporary component/continuous capture specs removed; evidence copies retained. Task-generated settings screenshots archived then restored from HEAD, including final desktop-snapping. No production edits by QA worker. Harness lint passes; worker probe standalone strict TSC passed (after/worker-probe-typecheck.txt); LSP fresh-diagnostic timeout is recorded rather than misrepresented as diagnostic success.

Verdict WATCH: intended edit/persistence/outline functionality demonstrated with substantial structural responsiveness improvements, but100ms/5s targets not universal and existing broad suite remains red, including unresolved serial snap behavior. Final gate should retain these limits.

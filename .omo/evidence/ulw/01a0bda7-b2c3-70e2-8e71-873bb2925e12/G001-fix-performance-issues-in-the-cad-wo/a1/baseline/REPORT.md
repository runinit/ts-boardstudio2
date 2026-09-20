# Browser baseline: budgets failed

Production build succeeded with Node24 and NODE_OPTIONS=--max-old-space-size=8192 after default heap OOM. Chromium147, viewport1440x1000, 60 keys with automatic outline, real UI interactions. Native event timestamp to rAF observation; no CPU throttling or artificial worker delays. Serial browser runs; other profilers paused.

## Results
- Nudge3 repeats: visible162/82/82ms, saved source103/29/30ms.
- Drag3 repeats: committed polygon119–121ms, saved source69–71ms. Original baseline probe omitted transient SVG transform; these are commit geometry times, not first in-drag frame. Final harness corrects this for followup.
- Add column:1498ms visible/source. Remove column59ms. Add row2556ms. Remove row52ms. Structural measurements one repeat each; source object counts verified.
- Every bounded pass action exceeded5s outline settlement budget. Initial run settled first2 nudges at8.1s/12.1s, then third1mm nudge stayed Updating layout/outline for>60s (failed-first artifacts).
- No console/page errors recorded in completed measurements.

## Scope limits
Initial-key source movement and row/column counts passed. Individual-key add/remove, undo/reload did not execute because outer key was obscured after inspector opened. Final harness adds Fit layout and15s action timeout. A second harness failure was an unhandled removal confirmation dialog; corrected before structural evidence. Final short run interrupted after row/column metrics to release CPU for fixes. Per-action exact YAML saved in structural; first run's3mm stalled YAML was not exported before teardown.

## Artifacts and cleanup
- timings.json:3 nudges,3 drags, add column.
- structural/timings.json and *-source.yaml: representative row/column edits and exact portable source.
- failed-first/:>60s settlement assertion failure, screenshot, timings.
- before.png/last-state.png: rendered real fixture.
- Playwright owns preview/browser teardown. Final runner exited130 after SIGINT. ss showed no3107 listener; process check showed no owned preview or Chromium renderer. Chromium installation retained for future QA.

## Followup
Run production build after fixes, then PLAYWRIGHT_PORT=3107 PERF_OUTPUT=<absolute output> pnpm --dir app exec playwright test e2e/studio-performance.spec.ts --workers=1 --reporter=list. Default3 repeats. Explicit visible/source budgets100ms, outline5s. Final settlement must pass60s assertion.

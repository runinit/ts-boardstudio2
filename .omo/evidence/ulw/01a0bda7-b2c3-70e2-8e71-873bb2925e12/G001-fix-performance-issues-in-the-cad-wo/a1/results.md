# CAD performance results

Implemented batching for key/row/column additions and removals, one-shot outline geometry reuse, duplicate offset elimination, stable analytic repair options, and reuse of managed outline recipes. Mixed LED recipes retain historical wiring order. Existing source IDs, shared/authored recipes and user guide edits are preserved.

| Measured operation | Before | After |
| --- | ---: | ---: |
|60-key add column, visible polygon |1,498ms |112ms median |
|60-key add row, visible polygon |2,556ms |116ms median |
|Exact60-key+3mm engine outline |46.06s |7.759s median |
|Exact60-key+3mm browser outline publication |>60s in baseline sequence |6.254s |

Warm movement first frame is around30ms. Old measurements tracked only committed polygons, so this is not a comparable speedup claim; final drag committed polygon is131ms versus about120ms baseline. Outline work remains seconds, and native39 structural actions remain above100ms. Repeated rebuilds retain one region instead of accumulating duplicates. Historical orphan regions are preserved rather than deleted.

Final build passed. Final precommit passed917 app tests before a small LED-ordering review correction; that correction passed17 focused tests plus typecheck/lint. Engine335tests passed. Root final real-browser run passed all5cases, including full native39 edits/owned diode movement/undo/reload, rapid delayed analysis edits, exact frozen contours, and outline recovery. Corrected fullplain60 flow also passed. Artifacts: verification/parent-qa.md, code-review.md, qa-review.md.

The earlier full integration browser run was163passed/29failed/1existing skip. Three long cases passed serially. The remaining failures were traced to prior UI/test mismatches or existing behavior, including original-HEAD reproductions of the snap source-amendment issue and the undo/redo missing-bridge case. The full pnpm check is not represented as green. See after/full-suite/FAILURES.md, after/failure-audit.md and after/snap-baseline.md.

Changes are staged but uncommitted because Git author identity is unset; no identity was invented. Final content identity is in frozen-content.md. All QA servers/browser processes and temporary checkout/capture specs were cleaned up; durable evidence is retained here.

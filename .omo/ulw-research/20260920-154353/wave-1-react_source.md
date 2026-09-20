# Wave1 B react_source
Observed 2026-09-20, current staged tree348e0e5.

Moving path does not mutate YAML/source; source candidate built on release. Per-event setDrag may rerender all polygon elements; not necessarily one commit per physical event. Repeated snapFrame call; sourceSnapshot caches parse but clones every read. Broad context/drop draft costs unmeasured.

Sources: app/src/molecules/StudioCanvas.tsx:87-218,553-607,741-780; app/src/hooks/useStudio.ts:34-147; app/src/utils/sourceSnapshot.ts:1-35; app/src/context/ConfigContext.tsx:2005-2180

## EXPAND
- LEAD: snapFrame twice per moving pointer event. WHY: redundant pure work. ANGLE: measure/reuse.
- LEAD: all SVG polygons rebuilt per drag-state render. WHY: layoutPolygon map. ANGLE: immutable points cache/memo child experiment.
- LEAD: sourceValue clones despite parse cache. WHY: allocation at release. ANGLE: clone duration versus parse.
- LEAD: broad context fans out committed source changes. WHY: consumer invalidation. ANGLE: React profiler.
- LEAD: useStudio key JSON serialization outside memo. WHY: repeated parent renders. ANGLE: timing and safe key memo.
- LEAD: moveTargets/movingIds scans scale with selection/document. ANGLE: multi-target sensitivity.
- LEAD: persistence/process path needs verification. WHY: debounced normal generation may be disabled CAD. ANGLE: trace rather than assume.

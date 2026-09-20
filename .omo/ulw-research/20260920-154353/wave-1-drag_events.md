# Wave1 A drag_events
Observed 2026-09-20, current staged tree348e0e5.

Code evidence: pointer capture, 4px threshold, synchronous per-event snapping/setDrag, no production rAF gate. Drag movement versus release paths separated. No measured performance claim. Candidate risks: missing explicit capture-loss path (implicit release may make harmless), source-change rejection, first-ID multi-selection snap anchor.

Sources: app/src/molecules/StudioCanvas.tsx:152-294,495-643; app/src/utils/layoutSnapping.ts:45-202; app/src/utils/studioMove.ts:75-99,214-333

## EXPAND
- LEAD: Production drag handling has no rAF/coalescing path. WHY: Every pointermove runs conversion, snapping, spacing checks, and React state updates synchronously. ANGLE: Measure pointermove frequency, React commit frequency, and frame latency during a sustained drag.
- LEAD: Pointer capture is set but never explicitly released. WHY: Capture established but no explicit end release. ANGLE: Trace pointerup/cancel/offcanvas; check normative implicit release.
- LEAD: Relationship prompt disappearance is source/selection gated. WHY: exact source identity. ANGLE: Trace source amendment; prior HEAD reproduction likely duplicate.
- LEAD: Multi-selection snap identity may be first-ID anchored. WHY: ids[0] supplies moving object. ANGLE: heterogeneous selection origins/rotations.
- LEAD: Stale source can reject otherwise valid release. WHY: realtime guard. ANGLE: edit source during active drag.
- DEAD END: No production rAF/coalescing in StudioCanvas; test stubs only.

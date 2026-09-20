# Existing E2E navigation failures

Read-only classification during full production E2E. No concurrent browser run; no source changes.

## app.spec.ts:4 matrix draft
Fails at30s waiting for button New native design, not during PCB generation. Captured snapshot already shows Board Studio / Keyboard with real native design. app/src/App.tsx:315–331 creates compileSetup(defaultSetup()) immediately for /new then navigates home. app/e2e/utils/studio.ts:73–78 still clicks New native design then Apply setup, which current route does not present. app/e2e/app.spec.ts:5–6 invokes this obsolete helper.

## bhk-matrix.spec.ts:9,1440px and390px
Fails after5s looking for visible Add key in column7. Snapshot shows selected Row2 and collapsed Row keys summary. app/src/molecules/RowInspector.tsx:38 puts the key controls inside InspectorSection Row keys. app/src/molecules/InspectorSection.tsx:12 defaults sections closed. The test lines25–39 selects row and opens inspector but never opens Row keys. This is missing UI navigation, not evidence of timing regression.

## Provenance
Ran git diff HEAD -- for App.tsx, InspectorSection.tsx, RowInspector.tsx, shared e2e/utils/studio.ts, app.spec.ts, and bhk-matrix.spec.ts. Output empty for all6: route/helper/section behavior unchanged from HEAD, so incompatibility predates this performance diff. Error snapshots retained in this directory. No history rewrite or production edits. No tests skipped, weakened, or timeout increased.

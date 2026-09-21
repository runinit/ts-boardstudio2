# Export readiness boundary

Changed files: app/src/utils/zip.ts, boardExportReadiness.ts, zip.export.test.ts.

All three ZIP entry points now omit PCB and board-outline outputs for stored setup/electrical/resize blockers and generated layout errors. Per-project error.txt names the findings and how to resolve them. Cases, source config, valid projects, and independently ready material sheets remain exportable. Config-only progressive export is unchanged.

Raw matrix wiring is audited through the shared resolvedMatrixFindings(layout) helper. Existing generated layout reports are reused; native source-only direct ZIP calls fall back to effectiveElectrical(source). Fresh audit results replace stale generated matrix findings while retaining unrelated stored findings. No source rewrite occurs.

RED: initial real-ZIP tests produced 12 failures and 3 valid controls; all three entry points contained unsafe PCBs/outlines. Raw custom-junction matrix regressions then produced 3 failures. A repaired-project stale-finding test separately failed before stale-entry replacement.
GREEN: Node 24.14.0, pnpm --dir app exec vitest run src/utils/zip.export.test.ts src/utils/zip.test.ts: 33 passing. Tests open real JSZip downloads and inspect archived content; worker generation is the narrow seam, and raw-wiring cases use actual native layout resolution. Valid/warning-only exports, blocked categories, direct source fallback, bulk/progressive reports, config-only export, mixed projects, case files, ready sheet output, and compilation-error recovery are covered.

Focused ESLint and app tsc --noEmit passed. No UI/source-generators/schema/storage edits in this lane. No commit. Root owns final integration checks.

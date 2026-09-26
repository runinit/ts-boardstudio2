# Current architecture and validation

This describes the repository after the September 2026 cleanup. Migration reports
and test audits retain their original evidence; their counts are not current
coverage targets. Packages now live directly at the repository root.

## App ownership

The app entrypoint composes controllers and the workbench. Controllers receive
explicit document references and actions; there is no additional global store.

| Owner | Responsibility |
| --- | --- |
| `useProjectSession` | Core worker lifecycle, serialized operation queue, committed versus preview scenes, persistence, project-open invalidation |
| `createProjectActions` | Undo/redo, new/import/duplicate projects, imported parts/models, undoable edits |
| `useCaseGeneration` | Physical-instance resolution, generation state, cancellation, cache reuse, revision/session checks |
| `useElectricalPlanning` | Wiring resolution, pin assignments, locks, protected handoff review data, export wiring preparation |
| `createProjectExporter` | Project, PCB, firmware, footprint, outline, and mechanical packaging; model assets; downloads |

The project session and case controller share the existing preview cache only so
opening a project invalidates it. Async callbacks keep using current document
references and captured revision/context guards. Export protection is persisted
only after the artifact is produced, before its download.

The workbench keeps shared selection state and pointer transaction lifetimes.
`useWorkbenchSelection` handles selection actions; `useWorkbenchTree` derives the
object tree. `createCanvasCamera` handles camera actions, and `CanvasObjects`
renders geometry. `MatrixInspector`, `InspectorControls`, and `createLibraryActions`
separate inspector rendering from library document edits. Existing panel mounts,
keyboard handlers, and drag transactions remain coordinated by the workbench.

Parts preview construction and placement are separate: `sampleAssembly` produces
an isolated preview document; `assemblyPlacement` creates document snapshots.
`assemblyCatalog` is the preset registry used by recipes and selectors.
`AssemblyViewer` is the single preview model-loading owner. Export model packaging
has its own asset resolver because it packages source files rather than meshes.

## Rust ownership and privacy

`core/src/artifact/kicad.rs` retains shared formatting, footprint serialization,
and snapshot/electrical validation helpers. Private child modules handle export
planning and completed board/footprint assembly. The existing `prepare_export`
and `finish_export` entrypoints are re-exported without changing their signatures.
Exporter tests live beside output assembly and can inspect private ancestor helpers.

`cad/wasm/src/lib.rs` is the WASM facade and initialization boundary. Its private
model module owns input/result types, mesh conversion, and STEP import/export.
The construction child owns solid building; its cache child owns preview-region
and body cache lifetimes. Existing WASM entrypoints are re-exported unchanged.
Nested ownership lets children use private ancestor types and helpers without
widening field or helper visibility.

No document schema, renderer protocol, pad identity, net mapping, generator
geometry, mechanical cutting profile, or CAD kernel changes belong to this cleanup.

## Compatibility and cleanup guardrails

Retired footprint IDs, generators, models, licenses, authored case bodies, and
custom/imported definitions remain supported. Catalog visibility is deliberately
separate from definition resolution. Do not infer dead code from a hidden part or
an old-looking CSS class. Current assembly recipes still use stable preset IDs.

TypeScript checks unused locals and parameters. This does not detect orphaned
exports, dynamic CSS use, or compatibility-only definitions; those require caller
and saved-project checks. Transform coverage moved from the removed `CasePreview`
component to `componentPreview`. Preview retry has a regression test.

## Validation entrypoints

- `pnpm check`: contract/catalog drift, runtime imports, native and package tests,
  WASM and production builds, boundary checks, browser tests, and Pages checks.
- `pnpm precommit`: core/CAD/renderer preparation and app/CAD typechecks.
- `pnpm test:e2e:dev`: development-server loading regressions.
- `pnpm test:perf`: the separately budgeted performance suite.

Use `BOARDSTUDIO_CHROMIUM=/usr/bin/chromium` on hosts with system Chromium and no
Playwright-managed browser. Keep browser behavior assertions when updating stale
selectors: selection now uses the Select menu, and canonical assemblies number
both switches and their companion parts.

Geometry-only browser fixtures have no controller and use the explicit draft PCB
handoff. Fixtures with existing manual nets must review their replacement through
the wiring UI first. The real-MCU handoff test covers production PCB and firmware
exports. Authored geometry/model tests use custom definitions rather than relying
on retired parts appearing in the placement catalog. Reload tests wait for the
committed revision and completed local save.

The CAD build removes its generated `wasm/pkg/package.json` before invoking
wasm-pack 0.15. That version otherwise reads its previous full manifest as a
dependency-only map and rejects array fields on repeated builds. Source manifests
and compiled caches are retained.

For export equivalence, the core test
`native_board_output_can_be_written_for_kicad_cli_oracle` accepts
`BOARDSTUDIO_KICAD_ORACLE_PATH` and writes front/back boards. Compare those files
across a structural change. CAD tests verify unchanged-region cache reuse and STEP
round-trip geometry; STEP timestamps are not a byte-equivalence contract.

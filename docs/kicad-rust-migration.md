> Historical migration evidence: paths and commands below describe the recorded
> revisions. Current packages live at the repository root, commands have no `:v2`
> suffix, and timing-only browser tests run through `pnpm test:perf`, not `check`.

# KiCad Rust migration

## Ownership and boundary

Rust owns the shared footprint and artifact contracts, the built-in footprint
catalogue, source projection, and KiCad serialization. `kiutils_sexpr` is pinned
to `0.1.1`; its concrete syntax tree keeps source spans available so edits can
preserve unknown metadata and unchanged source. `kiutils_kicad` `0.3.0` was not
selected because its filesystem-oriented APIs do not fit browser/WASM use. A
narrow escape decoder reads quoted tokens from CST source spans because the
generic atom decoder drops the slash from unknown C-style escapes. The importer
stores the original source in `PartDefinition.kicadSource` (`formatVersion: 1`).
Preview geometry is an approximation and never replaces that source as the
export authority. Unsupported spatial transforms are rejected when placement
changes; unknown nonspatial metadata and unresolved model references remain
available for re-export.

Projection converts source coordinates to the core's local Y-up frame, keeps
KiCad child positions local, and normalizes absolute pad angles from the root
rotation. Back-side local Y reflection and pad layers are normalized for the
front-facing definition frame.
Courtyard arcs and circles use adaptive samples bounded to 0.01 mm. When the
single-polygon document model receives multiple courtyard loops, the preview
uses their conservative convex envelope. Unknown custom-pad primitives produce
an approximation diagnostic and suppress fallback physical bounds.

The artifact API is separate from the stateful document engine. The same
`artifact_request(json)` function is exposed to WASM and the native line driver.
It dispatches footprint compilation/import, export planning/finalization, and
outline export without changing the active document or undo history. Export
planning captures the document, resolved contours, model paths, target,
revision, ordered Ergogen jobs, and reserved net allocator state. Its
fingerprint binds those inputs; finalization rejects stale or reordered job
results and mismatched allocator snapshots before producing files. The caller
runs the bundled Ergogen JavaScript generators between the two Rust requests.
`ExportClient` caches compiled footprint promises by job input and evicts the
oldest entry above 64 items; Rust remains stateless across the request pair.

## Catalogue and contracts

`v2/core/src/model.rs` defines the serialized request, reply, geometry, source,
and export DTOs. `ts-rs` is pinned at `12.0.1` behind the optional
`export-types` feature, which is enabled only by the contract exporter. Ordinary
native and WASM builds do not include it. Generated TypeScript declarations
live in `v2/contracts/src/generated`; `pnpm run generate:contracts:v2` updates
them and `pnpm run check:contracts:v2` compares the complete generated tree
without rewriting it.

`v2/kicad/src/generated/builtin-catalog.json` contains Rust-compiled default
footprint IR for front and back sides. `pnpm run generate:catalogue:v2`
updates it; `pnpm run check:catalogue:v2` detects drift. Both drift checks run
in the v2 CI workflow.

## Compatibility and limits

Source-bearing definitions preserve raw KiCad source through document JSON,
replacement edits, and undo/redo. Geometry shown for imported footprints is a
preview projection; unsupported pad or graphic details may be approximated,
but their original source stays intact. Unknown nonspatial forms are preserved
while managed placement, net, UUID, and model forms are patched. Unsupported
spatial transforms are rejected when placement changes. Built-in definitions
compile from Rust. The browser runs the bundled Ergogen generators as ordered
export jobs; Rust validates their returned forms and net state before writing
KiCad output.

## Review follow-ups

The review follow-up corrected five boundary cases. An omitted pad angle now
defaults to absolute zero before root-relative normalization, retaining a signed
local rotation. Legacy KiCad `fp_arc` and `gr_arc` forms are accepted on import
and upgraded to modern `start`/`mid`/`end` forms for board export; stored
source bytes remain unchanged. Nested modern `stroke(width)` values, including
custom primitives, contribute to fallback geometry bounds. A failed WASM
initialization clears the cached promise so a later attempt can retry. The
Workbench now batches selected and customized assembly companions and keeps
their fingerprints/default checks aligned with edited RGB and geometry.

OpenCascade remains responsible for solid operations, mesh display, and STEP
export. Exported boards still require KiCad review and routing where
applicable. See the [Rust case geometry migration report](rust-migration-implementation.md)
for case geometry choices and performance evidence.

## Verification

All functional post-review `check:v2` stages have passed in component runs:
134 Rust tests passed (5 ignored), with 33 KiCad tests, 7 CAD tests, and 37 app
tests. Build, contract and catalogue drift, and Node runtime-import checks
passed. Native/WASM harnesses returned identical JSON for 165 requests; an
additional focused 18-request parity set also passed. KiCad CLI 10.0.6 parsed
78 generated boards covering all 39 Ergogen generators on both sides, plus
the mixed native/imported/Ergogen board. The final browser rerun passed 77/77
after a test assertion correction. These component results are not a claim
that the original monolithic command exited zero.

The post-review WASM binary is 2,956,909 bytes raw and 973,489 bytes gzip,
SHA-256
`79b86eaf59b14ba24ac4a6edef877210038a7aadb473d3f6a33b034d8aaa6c72`. Before
the artifact migration it was 2,547,632 bytes raw and 822,650 bytes gzip,
SHA-256
`8380abfe6748b589c8122b2927b0eecbfc81476af46b64824ab4b334c1d461b7`.

Five-session same-host measurements used Chromium 153.0.8010.47. Each cell is
the median across sessions of the session p95 in milliseconds:

| Fixture | Before worker / painted | After worker / painted | Existing limit worker / painted |
| --- | ---: | ---: | ---: |
| 100 single | 3.7 / 33.6 | 3.1 / 33.5 | 5.2 / 37.0 |
| 100 row | 3.1 / 34.3 | 3.2 / 35.0 | 4.4 / 37.8 |
| 200 single | 4.6 / 33.6 | 4.5 / 33.5 | 7.6 / 47.0 |
| 200 row | 6.5 / 36.5 | 5.6 / 40.0 | 7.7 / 53.6 |

All four post-review worker and painted p95 values remain within their existing
limits. These measurements are descriptive and do not establish statistical
significance or performance for other machines and workloads.

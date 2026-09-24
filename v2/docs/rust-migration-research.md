# Further Rust and WASM migration

Research dates: 2026-09-23–24, America/Toronto. Inspected HEAD `e43145f` plus
substantial existing, uncommitted v2 changes, including the Ergogen integration.
These are recommendations, not an approved implementation plan. Source counts
and test results describe the working tree inspected during this research.

Start with **case contour preparation in Rust**, which can remove v2's
`clipper-lib` dependency while preserving the current OpenCascade kernel.
Generate shared document/protocol types from Rust as a small enabling step.
Follow with **KiCad and outline import/export** as the next substantial transfer
of application logic. Pursue the React/Vite exit as a separate UI milestone.

Follow-up: the user proposed `bschwind/opencascade-rs` and `lzpel/cadrum` for a
broader Rust CAD migration. The [Cadrum assessment](cadrum-assessment.md) makes
Cadrum the preferred first prototype: it provides an explicit browser-target
build, stream-based STEP APIs, OCCT 8.0.1, and a related live demo that rendered
successfully during this research. Board Studio integration remains unverified.
The [opencascade-rs assessment](opencascade-rs-assessment.md) remains an
alternative. Neither assessment changes the bounded contour migration's value
or makes the React/Vite exit part of replacing the CAD adapter.

For a kernel implemented entirely in Rust, the
[pure Rust CAD assessment](pure-rust-cad-assessment.md) shortlists Monstertruck
and brepkit, with explicit boolean, STEP compatibility and licensing constraints.
These candidates have not been validated against our fixtures.

## Current ownership

| Area | Current implementation | Approximate source lines |
| --- | --- | ---: |
| Core document, transactions, geometry, constraints, matrix, Rhai | Rust | 3,950 |
| KiCad adapter, built-ins, footprint compiler and importer | TypeScript | 1,007 |
| CAD preparation and OpenCascade orchestration | TypeScript; kernel loaded as WASM | 420 |
| Document and worker contracts | TypeScript, overlapping Rust models | 284 |
| Ergogen runtime adapter | TypeScript | 253 |
| Browser app and UI | TypeScript/TSX | 4,539 |

Counts exclude tests, benchmarks, scripts/configuration, generated files,
declarations, and vendor code. They measure maintenance surface, not runtime
cost or migration effort. In addition, the 39 bundled generator JavaScript
files contain 10,297 lines; the generated catalogue is about 542 kB uncompressed.
Porting the adapter alone does not eliminate these generators.

The core already owns the difficult editing semantics. Its current WASM API
accepts and returns JSON strings; workers handle messaging, while React renders
the scene. OpenCascade is already a separately loaded WASM kernel. Moving its
TypeScript caller into Rust would not by itself remove that kernel or its glue.

## Candidate order

| Order | Candidate | Concrete benefit | Main condition |
| --- | --- | --- | --- |
| Enabler | Generate shared types from Rust | Stops maintaining document/protocol definitions twice | Preserve existing JSON and browser-only wrappers |
| 1 | Case contour preparation | Removes v2's `clipper-lib` and its type package | Match offset topology, precision, and join behavior |
| 2 | KiCad import/export, built-ins, SVG/DXF | Moves roughly 1,050 lines of domain code toward Rust | Resolve current net-binding failure; retain Ergogen compatibility |
| 3 | Matrix scene projections | Removes duplicate layout calculations in the UI | Preserve empty slots, legacy members, and preview latency |
| 4 | Archive codec and validation | Can remove v2's `fflate` after both consumers migrate | Bound decoding memory; preserve ZIP and asset compatibility |
| Separate UI milestone | Rust DOM UI and Trunk | Enables removal of React, authored TS UI, and Vite from v2 | Replace asset transforms, worker builds, tests, and offline staging |

These are relative priorities, not effort estimates. The first four runtime
migrations can keep the current React/Vite shell while reducing what it owns.

## First migration: case contour preparation

[`cad/src/index.ts`](../cad/src/index.ts) uses ClipperLib to offset rings for
clearance, cavities, and gasket grooves. Its contract includes 0.001 mm rounding,
a 4x miter limit, winding-dependent hole handling, and a coordinate bound.
[`core/src/outline.rs`](../core/src/outline.rs) already uses
`i_overlay` 9.0.0's `OutlineOffset` at the same 1,000-units/mm scale.
The installed version supports outline construction; see the
[versioned crate documentation](https://docs.rs/i_overlay/9.0.0/i_overlay/).

Proposed boundary: Rust prepares outer, hole, cavity, and gasket rings for a
committed case request. The CAD worker consumes those rings and continues
constructing solids, tessellating, importing STEP, and exporting STEP through
libcascade 3.0.2. Prepare these rings on case requests, not every pointer move.
Keep the revision attached through preparation and kernel completion.

Do not substitute the existing board-outline offset style unchanged: it uses
`LineJoin::Miter(0.1)`, whereas Clipper's limit is expressed as a ratio.
The libraries' join and rounding semantics need comparison. i_overlay documents
angle-based clipping and math-mode differences in its
[9.0.0 mesh construction notes](https://docs.rs/crate/i_overlay/9.0.0/source/docs/stroke_math.md).

Acceptance evidence should include differential ring tests for sharp and nearly
straight corners, holes, negative insets, disappearing cavities, split regions,
narrow notches, and coordinate boundaries. Compare topology and geometry within
the existing precision contract; vertex ordering alone is not a useful oracle.
Then rerun the current STEP reimport, volume/bounds, assembly, and browser CAD
tests. Remove both Clipper dependencies only after the entire case path uses the
Rust preparation. No replacement geometry dependency is presently indicated.

## Enabler: Rust owns shared contracts

[`core/src/model.rs`](../core/src/model.rs) and
[`contracts/src/index.ts`](../contracts/src/index.ts) duplicate document and core
protocol types. Evaluate `ts-rs` 12.0.1 as a pinned type-generation tool, gated
out of the normal WASM build. It generates TypeScript from Rust and supports
Serde naming/tagging, with qualifications around optional fields. Its default
large-integer mapping is `bigint`, while the existing JSON protocol uses numeric
revisions. See the [versioned ts-rs documentation](https://docs.rs/ts-rs/12.0.1/ts_rs/).

Explicitly test absent versus null fields, defaults, enum tags, JSON values,
and `u64` revisions. Several current fields use `skip_serializing_if` without
`default`; a mechanical derive is insufficient. Preserve the numeric revision
contract and define its JavaScript safe-integer limit. Keep diagnostics/timing
wrappers and typed-array CAD results separate where they describe browser
transport rather than Rust JSON. `emptyProject` is executable code, not a type.
CI should regenerate into a temporary location and fail on declaration drift.
This reduces manual TypeScript ownership; it does not remove the TS compiler.

## Second migration: KiCad and file serializers

The KiCad package is a strong larger target because serialization, validation,
coordinate conversion, net allocation, footprint compilation, and parsing are
mostly deterministic domain operations. The existing tests provide useful
reference behavior. SVG/DXF export adds a small, related slice from
[`app/src/outlineExport.ts`](../app/src/outlineExport.ts).

Start with authored/built-in footprints and the supported external-footprint
import subset. Preserve number formatting, Y-up conversion, front/back behavior,
filenames, model paths, reference validation, and the current deterministic
identity algorithm, including Unicode inputs. Carry the committed document and
resolved contours as one revision-consistent export input. Existing identity
behavior must not silently change to a different UUID scheme.

The Ergogen path needs a deliberate second stage. Its adapter calls trusted
JavaScript generator bodies with placement transforms and a net-index callback;
utility generators also emit tracks, vias, zones, and text. Cached pad/courtyard
geometry is not a lossless replacement for this output. Retain the current
Ergogen export route initially. Before moving it behind the Rust writer, define
a lossless generated-form boundary and decide who allocates generated/local
nets. Prove mixed native/generated boards, terminal groups, multiple models,
legacy arcs, and every bundled generator before deleting that TypeScript route.
The vendor source/provenance bundle remains intact.

The current KiCad baseline is not green: `pnpm --dir v2/kicad test` produced
26 passes and one failure, with no skipped tests. The failing test is
`exports document pad-net assignments for Ergogen terminal groups` in
[`kicad/test/ergogen.test.ts`](../kicad/test/ergogen.test.ts), rejected with
`Bind Ergogen nets through per-part generator parameters: j1`.
Reconcile this behavior before treating the suite as a migration oracle.
This research did not change the implementation or fix that failure.

## Other bounded migrations

`app/src/ui/matrixGeometry.ts` recomputes matrix positions, cumulative splay,
mirror transforms, member lookup, and legacy empty-cell poses in TypeScript.
Have Rust return batch cell projections in its scene, including disabled cells,
and retain the UI's optimistic pointer handling. Avoid one WASM call per cell
or adding worker round trips to each render. Test legacy IDs and saved poses,
then use the existing mounted-workbench latency gates.

Project ZIP construction and decoding live in `app/src/storage.ts` and
`app/src/export.worker.ts`; the Project download action calls `packProject`
directly. Both consumers must migrate to remove `fflate`. Keep IndexedDB,
downloads, fetching, and Web Crypto at the browser boundary initially. Moving
compression and validation to a worker can also avoid synchronous ZIP work on
the UI thread. No Rust ZIP crate has been selected or validated in this research.
Require a WASM-compatible, minimal codec configuration, actual decoded-byte
limits, archive path/duplicate checks, asset-hash validation, and old/new archive
interoperability. Account for peak memory and binary transfers, not just speed.

## The Vite exit

Vite 6.3.5 currently supplies more than a development server. The remaining
replacement work includes TS/JSX and npm module bundling; three worker entry
points; `import.meta.glob` model discovery; `?url` WASM/model imports;
`import.meta.env.PROD`; lazy Three.js/OpenCascade chunks; three HTML entry points;
relative asset URLs; and Playwright's Vite preview/dev servers. Vitest also
remains part of the testing toolchain. The Node catalogue generator and
service-worker build script are separate build dependencies.

Trunk is a plausible destination once Rust owns the UI. It builds Rust WASM
applications and workers and stages assets, but its documented script pipeline
copies JavaScript. That alone does not replace this React/TypeScript/npm build.
See the [official Trunk asset guide](https://trunk-rs.github.io/trunk/guide/assets/index.html).
An interim JavaScript bundler hook is possible, but leaves a separate build
dependency to maintain.

Cadrum's [related browser example](cadrum-assessment.md#browser-evidence-and-build-requirements)
provides a concrete Rust DOM + Trunk reference with no TypeScript/Vite build.
It still uses a JavaScript viewer and does not establish an offline replacement
for our workbench shell.

Evaluate a small **Leptos CSR + Trunk** browser shell before committing to a UI
rewrite. Research checked Leptos 0.8.14; no new dependency is installed or chosen.
Leptos supports static browser deployment and JavaScript integration through
wasm-bindgen/web-sys. This makes it a plausible way to retain HTML/SVG/CSS and
bridge the existing 3D adapter. See its
[CSR deployment guide](https://book.leptos.dev/deployment/csr.html) and
[JavaScript integration guide](https://book.leptos.dev/web_sys.html).
This is an architectural fit assessment, not measured proof of lower latency.

A useful prototype would load a project, draw its resolved SVG scene, edit one
inspector field, undo, and export through the existing worker boundary. Check
focus, keyboard input, stale replies, offline reload, subdirectory hosting,
model URL resolution, and cold/warm CAD loading. Replace the model glob with an
explicit generated asset manifest and preserve lazy loading. Retain Playwright
even if v2 application builds stop using Node; browser testing is a separate
concern. The legacy v1 app will still have its own TypeScript/Vite dependencies.

The end state can be Rust-owned application logic and UI with small browser and
vendor JavaScript adapters. Removing all handwritten TS, removing all runtime
JavaScript, removing Vite, and removing Node from builds are separate milestones.
Trusted Ergogen generators and OpenCascade/Three.js integration remain explicit
exceptions until separately replaced.

## Evidence and limits

Executed against the inspected working tree with Node 26.10.0 and KiCad 10.0.6:

| Check | Result |
| --- | --- |
| `pnpm --dir v2/cad test` | 7 passed; STEP import/reimport, geometry, assembly |
| `pnpm --dir v2/kicad test` | 26 passed, 1 failed, 0 skipped; failure described above |

No application build, full `check:v2`, browser suite, or new implementation
benchmark was run for this research. Prior results in
[`performance-baseline.md`](performance-baseline.md) are historical evidence,
not a current validation result. They give no reason to promise faster editing
merely by moving more code across the WASM boundary. Measure compiled download
size, initialization, transport/serialization, and end-to-end latency for each
migration. No implementation files, dependencies, or deployment settings were
changed by this research.

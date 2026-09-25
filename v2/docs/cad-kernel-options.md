# CAD kernel options for v2

Compared 2026-09-24 against Board Studio `b7b7c3d`. This is a source-based
comparison, not an implementation result. No candidate has been built or tested
against the Board Studio CAD fixtures in this comparison.

## First separate the choices

There are two decisions here:

1. **Which geometry kernel?** Keep OpenCascade, or replace it with a Rust B-rep
   kernel such as Monstertruck.
2. **Which API and worker boundary?** Continue using the TypeScript
   `libcascade` adapter, or put the case operations behind a Rust API such as
   Cadrum or a modified `opencascade-rs`.

Cadrum and `opencascade-rs` are both Rust interfaces to the C++ OpenCascade
kernel. They move application-side CAD operations toward Rust, but they do not
remove the C++ kernel. Monstertruck replaces that kernel with its own Rust B-rep
implementation. The current app already uses `libcascade` 3.0.2; the prior
package assessment identifies its OCCT version as 8.0.1. The latest official
OCCT release checked for this comparison is also 8.0.1. Therefore, moving from
`libcascade` to another OCCT wrapper is primarily an API, build, and ownership
decision, not an OCCT-version upgrade.

## Options at a glance

| Option | Geometry kernel | What moves to Rust | Browser evidence | Main uncertainty for Board Studio |
| --- | --- | --- | --- | --- |
| Keep `libcascade` 3.0.2 | OCCT 8.0.1 | Nothing new | Already integrated in the lazy CAD worker | Existing adapter remains TypeScript |
| Cadrum | OCCT 8.0.1 | Case construction, STEP handling, mesh preparation | Upstream has a `wasm32-unknown-unknown` build and a browser example | Fixture parity, artifact size, memory, and worker recovery |
| Fork/update `opencascade-rs` to OCCT 8.0.1 | Target OCCT 8.0.1 | Same operations through a wrapper we can extend | Upstream repository does not demonstrate an in-browser OCCT worker | Updating bindings/build glue and creating the browser build path |
| Monstertruck | Rust B-rep kernel | Kernel and case operations | Upstream has STEP and wasm/JS crates; Board Studio integration is untested | Boolean and STEP behavior against our case and component corpus |
| `occt-wasm` control | OCCT 8.x | Nothing; TypeScript API | Upstream provides a worker API | It does not advance Rust ownership, and its browser feature baseline needs checking |

These are capability statements from upstream sources, not measured compatibility
or performance. Cadrum’s current changelog lists 0.8.20 and records its OCCT
8.0.1 update in 0.8.17. Its recent WASM build changes make exact version and
toolchain pinning part of the first experiment. Monstertruck 0.4.1 documents
solid booleans, STEP read/write, assemblies, meshing, and a WASM bindings crate;
those features still need testing on our inputs.

## Rust wrapper over OpenCascade

### Cadrum

Cadrum is the shortest path to a Rust-owned CAD adapter while keeping the same
kernel family and the already-used OCCT 8.0.1 version. It has a Rust API for
solids, booleans, STEP streams, meshes, volume, and bounds. Its repository
documents a browser WASM build and a small browser STEP-to-mesh example. It
still links C++ OpenCascade, so the kernel license and C++ initialization,
binary, and memory costs remain.

For v2 the work is mainly to express `buildCase`, `buildAssembly`, and
`readStepModel` through Cadrum while matching the existing worker output. The
case worker stays lazy and Three.js remains the mesh consumer. This is the best
first Rust-wrapper prototype if the priority is **move application logic to
Rust while preserving OCCT behavior**. It is not evidence that our booleans,
imported models, or browser memory use will match the current adapter.

### Modified `opencascade-rs`

`opencascade-rs` provides lower-level CXX bindings and a higher-level Rust API
that its README describes as work in progress. The repository builds against
an OCCT source submodule and also documents using a preinstalled library. A
previously inspected source snapshot used OCCT 7.8.1; targeting 8.0.1 means
updating the source/build setup and resolving any C++ binding compile changes.
OCCT 8.0.1 keeps the 8.0.0p1 API/ABI baseline, but that does not promise
compatibility from 7.8.1 or make the update a version-number-only change.

The supplied Wasmtime example runs the model WASM against native host functions;
it does not demonstrate the OCCT kernel itself running in the browser. An
Emscripten or another C++/Rust WASM build is a separate project. This option is
strongest if we want to **own a small, targeted Rust binding over OCCT and
control exactly which operations are exposed**. It has more build and wrapper
maintenance than adopting Cadrum, with no Board Studio browser recipe yet.

The comparison should pin the upstream commit and OCCT submodule before making
claims about the upgrade cost. The prior 7.8.1 snapshot is recorded in
[`opencascade-rs-assessment.md`](opencascade-rs-assessment.md).

## Replacing OpenCascade

### Monstertruck

Monstertruck is a Rust-native B-rep kernel and is the leading option here if the
goal is to remove the C++ OpenCascade kernel, rather than just write the CAD
adapter in Rust. Its current upstream crate separates modeling, boolean
operations, healing, STEP, and wasm/JS bindings; its license is Apache-2.0.
This could avoid shipping OCCT, but it substitutes a less-established kernel
and STEP implementation for a kernel already validated by our current flows.

Boolean robustness is the primary risk. Monstertruck’s own parity notes say it
reverted an upstream boolean rewrite after regressions on punched and adjacent
cubes. That is useful evidence of active regression work, and a direct reason
to test through-holes, adjacent features, nearly touching walls, and split
regions before investing in its browser integration. Its upstream passing tests
are not a substitute for our seven case fixtures or vendor STEP corpus.

Monstertruck is the right first **pure-Rust kernel experiment** only if removing
the C++ kernel is a real requirement. If that is not a requirement, its kernel
rewrite adds risk without helping preserve OCCT behavior.

### Other reference points

`occt-wasm` is a TypeScript-first wrapper around OCCT 8.x with a worker API. It
is not a Rust migration candidate, but it is a useful control if we want to
compare a newer OCCT browser API without changing kernels. Its upstream README
claims a roughly 4.5 MB Brotli payload and requires WASM SIMD, tail calls, and
exceptions, so verify those browser requirements and its artifact against our
existing `libcascade` build before considering it.

The earlier [pure-Rust CAD assessment](pure-rust-cad-assessment.md) also covers
brepkit. Keep it as a secondary comparison: the examined version raised both
license-fit questions and boolean fallback behavior that can return mesh-based
results. Refresh that assessment before promoting it to the shortlist.

## Fit to Board Studio

Every serious option needs the same narrow case-worker contract:

- Input: the committed request revision, Rust-prepared contour regions, case
  features and resolved STEP asset bytes.
- Output: structured failure or mesh buffers with positions, normals and the
  current coordinate convention, plus STEP bytes when requested.
- Runtime: a lazy worker, request identity and revision checks, bounded
  cancellation/restart behavior, no server-side CAD service.

Keep Rust `i_overlay` as the contour preparer. Preserve current tessellation
settings, case units, solids and assembly transforms. Convert an indexed mesh if
necessary at the worker boundary; do not change the Three.js API as part of the
kernel comparison.

Use the seven tests in [`cad/test/case.test.mjs`](../cad/test/case.test.mjs) as
the initial fixture set: imported STEP mesh/bounds, a holed plate, concave
clearance, tray and lid insets, cavities and mounting geometry, vertically
offset multi-body STEP, and authored cutouts. Add touching/coplanar features,
thin walls, disconnected offset regions, and transformed component STEP files.
Compare solid count, volume, bounds, mesh normals, and STEP reimport. Do not
compare textual STEP output or triangle ordering. The existing `libcascade`
results remain the reference during comparison.

Measure five serial runs per candidate on the same host: compressed artifact
size, cold initialization, repeated-operation memory, and case latency. Set
acceptable CAD-specific limits before collecting results; the matrix performance
gate measures a different workload. The current application’s lazy-load behavior
means initial layout startup and CAD cold-start should be reported separately.

## Recommendation and decision gates

The options answer different goals:

| Goal | First option to prototype | Why |
| --- | --- | --- |
| Put case logic in Rust and keep OCCT | Cadrum | Same OCCT 8.0.1 family with an upstream browser build path |
| Own a narrow binding and C++ build | `opencascade-rs` fork on OCCT 8.0.1 | More control over the Rust boundary, but browser support must be built and proven |
| Remove the C++ kernel | Monstertruck | Rust-native B-rep, boolean, STEP, mesh, and wasm/JS components |
| Keep lowest migration risk | Current `libcascade` | Already integrated, lazy-loaded, and used by the passing Board Studio case path |

Do not decide these by assigning one score to all goals. First record whether
removing C++/OCCT is required. If not, compare Cadrum and the updated
`opencascade-rs` wrapper against the same fixtures; Cadrum is the more direct
browser prototype, while the fork is the more customizable route. If yes, test
Monstertruck separately as a kernel replacement. A passing native geometry run
is only the first gate; the selected option must also pass the worker, STEP,
offline, memory, and browser checks before replacing production code.

## Sources checked

- [Cadrum README](https://github.com/lzpel/cadrum) and
  [changelog](https://github.com/lzpel/cadrum/blob/main/CHANGELOG.md).
- [Cadrum browser example](https://github.com/lzpel/opencascade-wasm32-unknown-unknown-example).
- [`opencascade-rs` source and build notes](https://github.com/bschwind/opencascade-rs).
- [OCCT 8.0.1 release notes](https://github.com/Open-Cascade-SAS/OCCT/releases).
- [Monstertruck source](https://github.com/virtualritz/monstertruck),
  [parity notes](https://github.com/virtualritz/monstertruck/blob/master/TRUCK-PARITY.md),
  and [0.4.1 crate documentation](https://docs.rs/crate/monstertruck/0.4.1).
- [`occt-wasm` source](https://github.com/andymai/occt-wasm).

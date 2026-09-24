# Cadrum assessment for v2

Researched 2026-09-24, America/Toronto. Cadrum source inspected at
[`8788df70c60b986b5ab387edb75a2f6f341a8c7a`](https://github.com/lzpel/cadrum/tree/8788df70c60b986b5ab387edb75a2f6f341a8c7a),
dated 2026-09-13, declaring version 0.8.20. Board Studio baseline is HEAD
`e43145f` with existing uncommitted v2 changes.

**Recommendation:** prototype Cadrum first for the broader Rust CAD migration.
It has stronger evidence for our browser deployment than the inspected
opencascade-rs example: an explicit `wasm32-unknown-unknown` build, stream-based
STEP APIs, and a working browser demonstration. This is a candidate preference,
not an adopted dependency or proof of compatibility with Board Studio.

Scope follow-up: if the objective includes removing the C++ kernel itself,
see the [pure Rust assessment](pure-rust-cad-assessment.md). It shortlists
Monstertruck and brepkit for evaluation. Cadrum remains the preferred candidate
among the two OCCT wrappers inspected here.

Cadrum is primarily a Rust library around statically linked C++ OpenCascade.
The related browser application is a separate example. Moving to it could put
our solid construction, STEP handling, and mesh extraction in Rust. It retains
the C++ kernel; the advertised `pure` Cargo feature has no implemented backend
in the inspected [library source](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/src/lib.rs).

## What to reuse

| Upstream capability | Application in v2 | Adaptation needed |
| --- | --- | --- |
| Rust/CXX/OCCT build for `wasm32-unknown-unknown` | Separate, lazily loaded Rust CAD worker artifact | Pin and reproduce the toolchain; keep OCCT out of the layout core download |
| `Solid::read_step` / `write_step` over Rust streams | STEP bytes in and out of the existing worker | Validate assemblies, transforms, errors, and memory use |
| Extrusion, primitives, booleans, volume and bounds | Port plate/tray/lid, mounts and assembly construction | Preserve holes, disconnected regions, elevations, and result checks |
| Indexed vertices/normals and tessellation settings | Feed our existing Three.js preview | Expand indices into current non-indexed `Float32Array` buffers initially |
| Rust DOM + Trunk browser example | Concrete reference for eventually removing Vite | Preserve workers, offline assets, subdirectory URLs and app interactions |

Prefer using a pinned crate behind our own small CAD interface over copying the
whole library. The build and initialization recipe is the most valuable part
to study if a fork or another wrapper later becomes necessary. Cadrum's
[MIT license](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/LICENSE)
requires retaining its notice when copying substantial code; OCCT retains its
separate license and notices.

The [stream implementation](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/src/occt/io.rs)
bridges Rust `Read`/`Write` to C++ streams and returns imported solids. This fits
`readStepModel(bytes)` and our transferable STEP result without adding a virtual
filesystem. Public [mesh data](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/src/common/mesh.rs)
includes indexed double-precision vertices and normals. Keep our existing
browser contract initially; changing to indexed rendering is separate work.

Set [tessellation options](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/src/traits.rs)
explicitly to `deflection_linear: 0.1`, `deflection_angular: 0.5`, and
`relative_linear: false`. Cadrum defaults to relative linear deflection 0.004;
using the default would change current preview behavior.

## Browser evidence and build requirements

Opened the [live browser demo](https://lzpel.github.io/opencascade-wasm32-unknown-unknown-example/)
in Codex's in-app browser. It successfully generated and visibly rendered the
default drum model, reporting 373,408 GLB bytes. The browser log query returned
no warning/error entries. No file was uploaded and STEP import was not exercised.

Inspected the [demo source](https://github.com/lzpel/opencascade-wasm32-unknown-unknown-example/tree/d7eded8c52e985f11eea4c89a03fbd3af60dec03)
at `d7eded8c52e985f11eea4c89a03fbd3af60dec03`. Its lockfile pins Cadrum 0.8.17,
whereas the library source above is 0.8.20. The served artifact was not
fingerprinted against either revision. The demo source generates geometry in
Rust, meshes it to GLB, and connects it to a JavaScript `model-viewer` element.
It also contains an in-memory STEP-to-GLB entry point.

The [WASM Dockerfile](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/docker/Dockerfile_wasm32-unknown-unknown)
uses wasi-sdk 33, compiles C++ with WASM exceptions, and rebuilds the WASI sysroot
for legacy exception encoding. The final Rust target is
`wasm32-unknown-unknown`; the C++ compilation uses `wasm32-wasip1` and statically
linked runtime libraries. This is a concrete alternative to the Emscripten
experiment proposed for opencascade-rs, but still a specialized C++ toolchain.

Initialization anchors Cadrum's
[WASI stubs](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/src/wasi_stub.rs)
and runs C++ global constructors. These stubs provide limited environment,
stdio, and timing behavior, reject filesystem operations, and trap on longjmp.
They are specific to the in-memory CAD path, not a general WASI environment.
Test malformed input and worker recovery rather than assuming every failure
can be returned as a Rust `Result`.

The [build script](https://github.com/lzpel/cadrum/blob/8788df70c60b986b5ab387edb75a2f6f341a8c7a/build.rs)
selects OCCT 8.0.1, matching the kernel version reported by our libcascade 3.0.2
package. It normally downloads target-specific prebuilt OCCT archives and also
supports a source build or supplied `OCCT_ROOT`. Pin the crate, toolchain/container,
and archive checksum for a reproducible prototype. The inspected download path
does not verify a content digest, and the demo recipe uses a `latest` image.
Matching OCCT versions alone does not prove identical patches or geometry.

## How this changes the migration plan

| Question | Cadrum | Previously inspected opencascade-rs |
| --- | --- | --- |
| Full CAD kernel in a browser | Working related demo; local reproduction pending | Supplied WASM example calls a native Wasmtime host |
| Rust browser build target | Documented `wasm32-unknown-unknown` recipe | Emscripten integration still needs investigation |
| Bundled kernel | OCCT 8.0.1 | OCCT 7.8.1 |
| STEP boundary | Rust streams | Paths in the inspected public API |
| Mesh controls | Linear, angular, absolute/relative | One tolerance in the inspected high-level mesher |

Keep the [contour preparation proposal](rust-migration-research.md#first-migration-case-contour-preparation):
Rust `i_overlay` prepares deterministic planar rings and can remove ClipperLib.
Cadrum would own the next stage, constructing solids and producing STEP/mesh
outputs. Neither wrapper establishes a drop-in replacement for our offset
rounding, winding, miter limits, or split-region behavior.

Proposed boundary:

```text
Rust core: case request + prepared rings + revision
  -> lazily loaded CAD worker: Rust case logic + Cadrum + OCCT
  -> transferable STEP bytes + mesh buffers
  -> existing downloads and Three.js preview
```

The demo proves a small Rust-authored browser application can use Trunk here.
It does not port our React UI, and its CDN-loaded viewer is unsuitable as an
unchanged offline deployment recipe. Keep our renderer and worker boundary for
the CAD prototype. The demo's synchronous CAD calls execute on the UI thread;
`spawn_local` around file reading does not move that computation into a worker.

## Proposed prototype and acceptance evidence

1. Reproduce a pinned Cadrum build in a separate browser worker. Return STEP
   bytes and mesh buffers for an extruded plate with a hole; reimport the STEP.
2. Adapt the seven existing [CAD fixtures](../cad/test/case.test.mjs), covering
   cutouts, concave offsets, cavities, mounts, gasket geometry and multiple
   vertically offset bodies. Compare volume, bounds and topology, not STEP text
   or triangle ordering. Keep the existing adapter available for comparison.
3. Import representative transformed component STEP files; verify placement,
   normals, solid count and unit handling. Exercise invalid inputs and restart
   the worker after a trap. Preserve request IDs and revision filtering.
4. Measure compressed download size, cold initialization, repeated-operation
   memory and request latency. Check offline reload, subdirectory deployment
   and supported browsers' WASM exception behavior.

If this passes, port `buildCase`, `buildAssembly`, and `readStepModel` behind the
existing [case worker](../app/src/case.worker.ts). That could remove v2's
libcascade TypeScript adapter dependency as well as ClipperLib after contour
migration. It would not by itself remove React, Three.js, Vite, or browser glue.

## Validation limits

This research inspected pinned sources and the live demo. Context7 had no entry
for Cadrum, so upstream source was used. No Cadrum build, Board Studio integration,
STEP import trial, performance comparison, or cross-browser test was performed.
The earlier seven passing Board Studio CAD tests validate the existing adapter.
Only research documents were changed; no dependencies or production code were
modified by this research.

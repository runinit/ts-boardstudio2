# v2 CAD

The CAD package consumes Rust-prepared case geometry. The core worker handles
`CaseAssemblyIR` through `prepare-case` and returns a revision-matched
`PreparedCaseAssemblyIR` with outer regions, holes, cavities, gasket grooves,
and mounts. This preparation is stateless and validates the supplied snapshot.
The native offset engine uses `i_overlay` on a 0.001 mm coordinate grid; it is
the source of contour cleanup, offsets, containment, and derived regions.

`buildCase(PreparedCaseIR)` and `buildAssembly(PreparedCaseAssemblyIR)` lazily
load single-thread libcascade. They extrude prepared rings, apply the specified
case booleans, and export STEP plus a triangle mesh from the same BRep. Call
them in a dedicated worker and discard results whose revision is no longer
current. `readStepModel(Uint8Array)` imports a STEP file up to 32 MiB and
returns its triangle mesh and millimeter bounds. It rejects unreadable or
empty shapes and removes temporary kernel files after each attempt.

The CAD test suite compiles the native `prepare_case` driver once and sends raw
case fixtures through the public core request protocol before exercising CAD.
This keeps geometry tests on the production preparation path.

`pnpm --dir v2/cad check` typechecks. `pnpm --dir v2/cad test` reimports STEP
for plate, tray, lid, and a two-body assembly, then checks solid volume and
bounds.

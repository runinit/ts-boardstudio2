# v2 CAD

`buildCase(CaseIR)` lazily loads single-thread libcascade. It builds analytic
prisms from the resolved 2D contours, subtracts holes, and returns STEP plus a
triangle mesh from the same BRep. `buildAssembly(CaseAssemblyIR)` groups all
bodies in one STEP compound and returns its combined mesh. Call either in a
dedicated worker and discard results whose revision is no longer current.
`readStepModel(Uint8Array)` imports a STEP file up to 32 MiB and returns its
triangle mesh and millimeter bounds. The importer rejects unreadable or empty
shapes and removes temporary kernel files after each attempt.

`clearance` offsets polygon rings with ClipperLib 6.4.2 (Boost Software
License). Coordinates are rounded to 0.001 mm; miter joins have a 4× limit.
The offset can close narrow notches, shrink holes, and split inset cavities.
Coordinates beyond 1,000,000 mm are rejected. A tray opens upward and a lid
opens downward. Both use `thickness` as
the floor or roof thickness, with `wallHeight` and `wallThickness` defining
their rim. Mount holes pass through the body. Bosses extend into the cavity.
The optional gasket cuts a rectangular groove into the rim. Fillets, fasteners,
and complex internal ribs still need case features in the IR.

`pnpm --dir v2/cad check` typechecks. `pnpm --dir v2/cad test` reimports STEP
for plate, tray, lid, and a two-body assembly, then checks solid volume and bounds.

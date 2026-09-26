# KiCad integration

KiCad import, footprint compilation, board and footprint export, and outline SVG/DXF
serialization run through the stateless Rust artifact API in `core`. The browser
worker sends captured document snapshots to that API; it never changes the
stateful core engine. Board export uses Rust prepare and finish requests around the
existing deterministic Ergogen adapter. JavaScript ZIP packaging and relative model
asset collection stay in the app.

Standalone footprint-library ZIPs contain footprints only; KiCad libraries cannot
carry generated board routing or graphics. Those objects are included by placed
board export. Each library ZIP includes `BOARD-UTILITIES.txt` with this policy and,
when applicable, a separate list of utility generators skipped from the library.

The active footprint catalogue comes from the bundled Ergogen generators. The
worker compiles generated footprints, authored geometry, and imported-source
projections through their respective current pipelines. Generic built-in
footprints and their duplicate compiled catalogue have been removed.

Imported `.kicad_mod` source remains authoritative in `PartDefinition.kicadSource`.
The Rust importer projects supported source geometry for preview and records
approximation or unavailable-model diagnostics. The app allows edits to the name,
kind, authored courtyard envelope, reference, nets, and attached models while
keeping source-derived pads read-only. Export patches permitted instance data into
the source and preserves unrelated source text.

The native regression driver is built once before this package's Node test suite.
Tests send real artifact requests through that driver and keep KiCad CLI parsing,
plotting, and DRC checks. The Ergogen adapter tests cover all bundled generators
on both sides; its output is passed to Rust for final validation and composition.

The adapter suite covers all 37 active generators on both board sides. Current
assembly and electrical tests cover canonical MX/Choc recipes, MINI-E lighting,
and supported reversible jumper mappings. Model attachments use the `models`
list. No old-project footprint or model conversion is performed.

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

`builtinDefinitions()` and the default compiled front/back preview catalogue are
generated from Rust at `src/generated/builtin-catalog.json`. Changed parameters
and imported-source projections are compiled asynchronously by the worker. The
catalogue is checked against Rust during `check`; do not hand-edit it.

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

Built-in coverage includes the MX/Choc solder and hotswap layouts, RGB LED and
matrix diode. KiCad DRC checks the four default switch/socket layouts for copper
and mounting-hole clearance, plus 6 by 5 assemblies at 19.05 mm pitch with the
diode at (6, -10) and RGB LED at (-5, -12), both on the back. These checks use
unassigned nets; assigned, unrouted nets can produce expected unconnected
findings. Vendor silk graphics, specialized hotswap keepouts, plated stabilizer
variants, and physical fit are not proven equivalent. Use solder and hotswap
presets as alternative cell definitions, not coincident parts.

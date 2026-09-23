# KiCad adapter

`exportBoard(document, boardId, contours, revision, models)` serializes a
committed `boardstudio/v2` snapshot to KiCad 10. It rejects stale revisions,
invalid references, malformed nets, and missing model paths. Coordinates are
converted from the document's millimetre Y-up frame at this boundary.

`exportFootprint(definition)` emits a standalone `.kicad_mod`. The board embeds
the same footprint geometry. `models` maps asset IDs to relative paths within
the export bundle; callers must write the corresponding asset bytes beside the
board. External footprint import is handled separately from document import.
`exportFootprintFile(definition, models)` returns the content with a filename
matching its sanitized KiCad footprint name.

`builtinDefinitions()` supplies deterministic MX, Choc, hotswap and RGB
presets. `compileFootprint(definition, side)` derives immutable, cached pad,
courtyard, local trace and via geometry from a named built-in source and its
geometry settings. `previewFootprint(ir)` draws that geometry on demand. Cache
entries exclude placement and net labels; the exporter applies those later.
Board traces and vias serialize as KiCad copper objects. Reversible built-ins
can add local copper bridges; standalone library files represent their vias as
through-hole pads and traces as copper lines.

These presets cover a supported subset, not the full vendor generators. MX and
Choc solder and socket contact locations follow the pinned repository sources;
KiCad DRC checks the four default switch/socket layouts for copper and hole
clearance, plus 6 by 5 assemblies at 19.05 mm pitch with the diode at (6, -10)
and RGB LED at (-5, -12), both on the back. Choc hotswap uses an asymmetric
18 by 16 mm courtyard to enclose its socket pads without overlapping adjacent
cells. These checks use unassigned nets; assigned, unrouted nets can produce
expected unconnected findings. Vendor silk graphics, specialized hotswap keepouts, plated
stabilizer variants, and physical fit are not proven equivalent. Use solder
and hotswap presets as alternative cell definitions, not coincident parts.
Imported
footprints retain the narrower round-trip subset below.
`importFootprint(source, id)` accepts front copper SMD pads, through-hole pads
with circular drills, and one closed front courtyard made of straight lines.
Courtyard lines may appear in any order. Zero-degree pad rotation is accepted.
It rejects nonzero pad rotation, models, zones, custom pad settings, other pad
layers and courtyard shapes. Model assets must be imported separately and
attached to the definition with an asset ID.

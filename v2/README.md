# Board Studio v2

This is a new offline-first application. It reads and writes only
`boardstudio/v2` projects. There is no old-project importer or conversion path.
The existing application and its deployment remain separate during v2 work.

## Package boundaries

| Package | Owns |
| --- | --- |
| `contracts` | Millimetre Y-up document and revisioned worker protocol |
| `core` | Rust document transactions, outline geometry, constraints, scripts, matrix groups, undo/redo and WASM boundary |
| `kicad` | KiCad 10 board and footprint serialization, footprint import and validation |
| `ergogen` | Bundled generator sources, model assets, provenance, and the trusted Ergogen runtime adapter |
| `cad` | Lazy OpenCascade case solids, mesh preview and STEP export |
| `app` | Keyboard workbench, browser persistence, workers and file packaging |

The app calls its worker, the worker calls the core, and exporters consume a
committed snapshot. Exporters must reject a stale revision. The same resolved
contours feed the 2D canvas, PCB edge, DXF and case construction.

## Ergogen library

Parts includes all 39 bundled Ergogen generators from the v1 `footprints/`
library. The complete source and vendor bundle is copied byte for byte to
`v2/ergogen/library/`; `pnpm --dir v2/ergogen test` checks its 188 files and
the generated runtime module against the source. `pnpm build:v2` regenerates
the trusted browser catalogue. User supplied JavaScript generators are not
executed.

Generator settings stay on part definitions. Net and anchor bindings can vary
per placed part. Utility generators that emit zones, routing, or text become
KiCad board objects when their parts are placed; they cannot be represented as
standalone `.kicad_mod` files. A footprint-library export lists these entries
in `BOARD-UTILITIES.txt`, while board export includes their output. Unsupported
or missing model paths fail export explicitly. Model previews load STEP/STP
files on demand; WRL is kept for KiCad export and STL sources are retained.

Project export offers **Embed used models**, enabled by default. It includes
only bundled models used by placed parts. Turning it off leaves bundled models
linked to the installed catalogue; imported local assets remain embedded.

## Run and validate

Install Node 24+, pnpm 11.26.0, Rust with `wasm32-unknown-unknown`,
`wasm-pack` 0.15.0, and KiCad CLI 10. Then run:

```sh
pnpm install --frozen-lockfile
pnpm dev:v2
pnpm check:v2
pnpm test:perf:v2
```

`dev:v2` builds the Rust WASM core and starts Vite. `check:v2` runs native core,
KiCad and CAD tests, app unit tests, the app build, and Chromium browser tests.
Install Playwright Chromium with `pnpm --dir v2/app exec playwright install
chromium` if needed. Run the development-server CAD regression with
`pnpm --dir v2/app test:e2e:dev`. Set `BOARDSTUDIO_CHROMIUM=/usr/bin/chromium` to use a local
Chromium binary.

`test:perf:v2` rebuilds WASM and the app before five serial, same-host
Chromium sessions. It compares the median session p95 against the captured
mounted-workbench baseline. The fixture, limits, and results are in
[`docs/performance-baseline.md`](docs/performance-baseline.md).

The browser benchmark lives at `/bench.html`. It measures a worker preview
request through a painted 2D outline frame for 100 and 200 key fixtures. It
warms ten samples and reports the next hundred. The browser test gates the
95th percentile at 100 ms and 200 ms respectively.

## Automatic outlines

New boards follow the current keycap and component envelopes with a 4 mm margin,
2 mm fillets, and 10 mm bridges between disconnected groups on the same board.
The **Outline** button opens margin, sharp/fillet/chamfer, and bridge settings.
Tight corners are fitted locally; findings report the requested and applied sizes.
Existing procedural envelopes now follow the layout, retaining their margins and
membership; envelopes saved without finishing settings retain sharp corners.
Explicit rectangles and polygons remain authored geometry.

Switch definitions and instances can supply `keycap: {x, y}` dimensions. Built-in
switches default to 18 × 18 mm; custom switches without dimensions use their
courtyards and show a finding. The part inspector can override keycap dimensions,
exclude a part, or give it a separate nonnegative edge margin. A zero margin
supports edge-mounted parts; exclusion does not validate pad support.

**Draw addition** and **Draw cutout** create optional board features. Click snapped
points (Alt bypasses snapping), then Enter or double-click to close; Escape cancels.
Automatic interior voids are filled before authored cutouts are applied. Invalid
polygons block outline exports. All consumers use the committed board contours,
including PCB Edge.Cuts, SVG/DXF and case/plate construction.

## Design workbench

**Add** offers a matrix setup flow and a searchable component catalog. Choose a
matrix’s rows, columns, and key assembly before placing it; choosing a component
starts a standalone cursor preview.
Click to place on the active board using the selected snap increment; Alt bypasses
snapping. Arrow keys move the preview and Enter places it. Escape cancels without
changing the project. Detailed footprint editing and models live in **Parts**;
**Apply to selected key** adds a variant or companion to a selected matrix cell.

The tree defaults to Board → Matrix → Columns → Keys → Components. Its local
Columns/Rows preference changes presentation only, and summaries count enabled
keys. Empty slots remain selectable for restoration. The inspector follows the
selected matrix, row, column, key, or component. Rename boards and matrices in
their inspectors. **Delete matrix** removes the container and its members in one
undoable edit, including an empty matrix. Hover and selection outlines follow the
current scope. Canvas scope and Snap controls stay fixed during pan and zoom.

In **Parts**, the left library groups searchable **Key Assemblies** and
**Components** by category. The right inspector edits the selected definition.
The center switches between compiled **2D footprint** geometry and an attached
**3D model**; missing models have an explicit import prompt. Interactive preview
uses STEP; WRL attachments remain available for export and show that limitation.
Bundled model previews report missing files or download failures with a retry
action. Imported generator settings are grouped into dimensions, footprint
options, identification, connections, model placement, and advanced parameters.

Project → Appearance selects System, Light, or Dark and persists locally.
Keycap overlays follow saved member poses, including old row-major projects,
while disabled slots retain their parametric frame. Starter metadata uses the
same negative-Y row direction as its existing switches. Editing early matrices
retains their existing switch identities and net references.

## Current handoff

The app can create a v2 project with multiple boards and place matrices with
user-selected dimensions. Each cell gets a switch and diode; MX/Choc, solder,
hotswap, and RGB presets change the assembly. Presets can update a matrix or
create a separate design. A matrix can map its diode row-to-column or
column-to-row. The CAD tree selects matrices, rows, columns, keys,
and components; dragging rows/columns sets independent offsets. The column
inspector also exposes cumulative **Stagger** (mm) and **Splay** (degrees): stagger
shifts this and following columns; splay rotates them around this column’s
nominal first-key anchor, carrying later column pivots. Matrix mirror and
rotation apply afterward. These are stored as optional `columnStaggers` and
`columnSplays` arrays, defaulting to zero for existing projects.
Deleted keys disappear from the canvas; restore them by selecting their empty
slot in the tree and checking **Enabled** in the key inspector. The editor has fractional
pitch snapping, Alt bypass, wheel zoom, Space-pan, and fit-to-design. The
Parts workspace previews compiled 2D footprints in the workspace as
generator settings change and loads attached 3D
models on demand. It can also place and group parts,
author component pads, link placements with offset or mirror constraints,
edit outlines, map pads to nets, bind local STEP or WRL models, build
plate/tray/lid case bodies, and save a project ZIP with hashed assets. It
supports keyboard movement of focused parts at 0.1 mm or 1 mm steps, with
one undo step per keypress. Project ZIP imports bound their expanded size.
It exports board outlines as SVG/DXF, placed KiCad boards and a KiCad footprint
library with relative model paths, and analytic case STEP. KiCad
board export includes placed parts and any tracks, vias, zones, and keepouts
emitted by bundled Ergogen utilities. Remaining routing is done in KiCad.
Browser storage and the app shell work offline after the first
load. The CAD kernel loads when a case preview, imported STEP component mesh,
or case STEP is requested.

Validation covers deterministic core transactions, KiCad 10 parsing and DRC,
OpenCascade STEP reimport, browser editing/export, and outline preview latency.
The 6 × 5 MX/Choc solder/hotswap assembly geometry passes KiCad DRC without
nets. Assigned but unrouted matrix nets still require routing and DRC in KiCad.
Fabrication readiness still requires review of the routed KiCad design and
mechanical fit. The 3D component view is visual; it does not prove clearances.
The KiCad footprint importer supports a documented subset, and mirror
constraints reflect placement without changing asymmetric footprint geometry.
The v2 CI workflow runs on pull requests and does not deploy.

### Inspector organization

Parts inspectors focus on placement and part options. Standard built-in footprints
use their existing pad geometry; pad spacing, size and drill tuning are no longer
exposed. Previously saved parameters are retained and still compile unchanged.
Bundled generator assembly choices and keycap dimensions are visible; connection
bindings, model placement and advanced footprint parameters are disclosed separately.

The catalogue owns footprint import and **New custom component**. Raw courtyard
and pad authoring is available only through **Edit footprint** for non-generator
custom/imported definitions. The selected catalogue item is the sole editing target;
there are no separate definition or model-target selectors. Key assemblies show
only their assembly description and placement action. Geometry scripts live under
**Project → Geometry scripts**.

Design inspectors lead with position and layout. Outline overrides, optional
constraints, assembly settings and matrix actions have named disclosure sections.
Electrical connections stay in PCB. Case inspectors show wall dimensions only for
trays/lids and disclose mounting and gasket details. These changes reduce routine
configuration without changing project formats, footprint identities or exports.

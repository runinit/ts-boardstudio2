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
| `cad` | Lazy OpenCascade case solids, mesh preview and STEP export |
| `app` | Keyboard workbench, browser persistence, workers and file packaging |

The app calls its worker, the worker calls the core, and exporters consume a
committed snapshot. Exporters must reject a stale revision. The same resolved
contours feed the 2D canvas, PCB edge, DXF and case construction.

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
chromium` if needed. Set `BOARDSTUDIO_CHROMIUM=/usr/bin/chromium` to use a local
Chromium binary.

`test:perf:v2` rebuilds WASM and the app before five serial, same-host
Chromium sessions. It compares the median session p95 against the captured
mounted-workbench baseline. The fixture, limits, and results are in
[`docs/performance-baseline.md`](docs/performance-baseline.md).

The browser benchmark lives at `/bench.html`. It measures a worker preview
request through a painted 2D outline frame for 100 and 200 key fixtures. It
warms ten samples and reports the next hundred. The browser test gates the
95th percentile at 100 ms and 200 ms respectively.

## Current handoff

The app can create a v2 project with multiple boards and place a guided 6 × 5
matrix in one click. Each cell gets a switch and diode; MX/Choc, solder,
hotswap, and RGB presets change the assembly. Presets can update a matrix or
create a separate design. A matrix can map its diode row-to-column or
column-to-row. The CAD tree selects matrices, rows, columns, keys,
and components; dragging rows/columns sets stagger. The editor has fractional
pitch snapping, Alt bypass, wheel zoom, Space-pan, and fit-to-design. The
contextual library previews compiled 2D footprints in the workspace as
generator settings change and loads attached 3D
models on demand. It can also place and group parts,
author component pads, link placements with offset or mirror constraints,
edit outlines, map pads to nets, bind local STEP or WRL models, build
plate/tray/lid case bodies, and save a project ZIP with hashed assets. It
supports keyboard movement of focused parts at 0.1 mm or 1 mm steps, with
one undo step per keypress. Project ZIP imports bound their expanded size.
It exports board outlines as SVG/DXF, placed KiCad boards and a KiCad footprint
library with relative model paths, and analytic case STEP. KiCad
board export is a placement handoff for routing in KiCad; it does not create
copper traces. Browser storage and the app shell work offline after the first
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

# Browser evidence

Executed `probe.cjs` using Node 24.14.0, installed @playwright/test Chromium headless, 1440×1000 viewport, private 127.0.0.1 server on an ephemeral port. Served actual app/public/dependencies/kicanvas.js without rebuilding. Embedded board sources using the kicad10.spec.ts pattern and waited for kicanvas:load. Opened Nets, selected C1/fingers_c1, opened Objects and Preferences. Used the actual viewer zoom_to_board method for readable PCB captures.

| Fixture | load event | Source / parsed pads | Source / parsed footprints |
|---|---|---|---|
| baseline | load | 46 / 46 | 7 / 7 |
| plain-matrix | load | 46 / 46 | 5 / 5 |
| diode-padless | load | 29 / 29 | 3 / 3 |
| ui-add-cluster | load | 46 / 46 | 5 / 5 |

`summary.json` records footprint-level counts and net sets. `*-parsed.json` records every actual runtime pad and its net/name/type plus the corresponding source pad-number token (source and parser footprint/pad iteration order). In diode-padless, ceoloide:diode_tht_sod123 / Xec10466e has zero pads; the screenshot still shows its silk diode symbol. In plain-matrix and ui-add-cluster, ProMicro's 24 pads have RAW/GND/RST/VCC/P* nets and none has fingers_r1/fingers_c1/fingers_c2. Baseline instead has C1/C2/R1/LED_DATA on controller pads. These are parsed pad assignments, independent of whether copper tracks exist.

`*-dom.txt`, `*-appearance.txt`, and `*-settings.txt` record actual opened panel controls. Objects contains opacity sliders for Tracks, Vias, Pads, Through holes, Zones, Grid, and Page. Preferences contains Theme and Align controls with KiCad. No ratsnest control appeared in the inspected panels. This is not a claim about every possible undocumented capability.

For each fixture, `*.png` shows PCB canvas, `*-nets.png` shows the open Nets panel, and `*-highlight.png` shows C1/fingers_c1 selection. Baseline and padless screenshots were directly inspected. Toolbar material icons are rendered as words in this isolated harness, so these are functional PCB evidence rather than full-app visual-fidelity certification.

Runtime limitations: embed harness requested /$$:0:$$ and received 404 once per board, recorded in probe.log; impact is not established. Numeric unquoted pad tokens have undefined parsed identifiers (serialized null): ProMicro 24/24 in all fixtures; each ComboDiode 6/6; each MX 2/5, with its 3 empty NPTH strings preserved. Ceoloide quoted pad identifiers are preserved. Source numbers remain present. This may affect preview pad labels; it does not erase the observed pads or net assignments.

UI addCluster was not clicked in the full React application. The parent-generated ui-add-cluster PCB was loaded and inspected; source addCluster path at app/src/utils/studioSource.ts:304 delegates its result to syncBoardTopology, but this browser harness does not independently prove the editor interaction.

Cleanup: browser closed and private HTTP server closed in finally; cleanup.json is the exact receipt. No product files edited, no build or regeneration performed. Retained only QA artifacts under this directory. Independent visual-review gate belongs to the parent; this execution does not self-certify a whole-app visual PASS.

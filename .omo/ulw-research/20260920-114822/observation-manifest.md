# observation-manifest

No observations recorded yet.

- matrix_intent: observer=/root/matrix_intent; group=matrix_intent; observed_at=2026-09-20T15:53:26.747Z; valid_at=current dirty checkout; artifact=wave-1-code-matrix_intent.md; contamination=peer findings shared, root verification pending. Native keys derive cluster_cell nets; editor fingers fallback uses Cn/Rn; explicit properties win. Sources engine/src/native/layout.js:218-229, app/src/utils/assemblyNets.ts:9-36. EXPAND none.

- footprint_staging: observer=/root/footprint_staging; group=footprint_staging; observed_at=2026-09-20T15:53:26.747Z; valid_at=current dirty checkout; artifact=wave-1-code-footprint_staging.md; contamination=peer findings shared, root verification pending. Read-only manifest check passed; generated catalogue has 42 entries and public/dist bundles match. Counts are worker measured pending root verification. Sources app/patch/footprints_index.js, footprints/scripts/verify.mjs. EXPAND staging mutation ordering: closed as out of scope, disposable build mutation does not explain current pad/net failure.

- component_defaults: observer=/root/component_defaults; group=component_defaults; observed_at=2026-09-20T15:53:26.748Z; valid_at=current dirty checkout; artifact=wave-1-code-component_defaults.md; contamination=peer findings shared, root verification pending. Placement obtains templates via compileSetup then clears controller GPIO and synchronizes. Power maps differ by provider; LED/diode wiring belongs to key assembly. Sources componentPlacement.ts:62-115, designSetup.ts:80-139, assemblyNets.ts:39. EXPAND provider power pin names: assigned to mcu_pins.

- app_serialization: observer=/root/app_serialization; group=app_serialization; observed_at=2026-09-20T15:53:26.748Z; valid_at=current dirty checkout; artifact=wave-1-code-app_serialization.md; contamination=peer findings shared, root verification pending. Worker runtime candidates: authored switch from AUTH_COL survives applyAssembly while controller remains C1/R1; properties changed to AUTH_COL/AUTH_ROW leave switch old nets and allocate extra controller pins; inherited switch binding overwritten. Await exact probe and root rerun.

- pad_emission: observer=/root/pad_emission; group=pad_emission; observed_at=2026-09-20T15:53:26.748Z; valid_at=current dirty checkout; artifact=wave-1-code-pad_emission.md; contamination=peer findings shared, root verification pending. Worker Node24 probe: default diode 2 pads; include_thru_hole_smd_pads=true alone 0 pads; reversible=true restores 2. Blank-number plated pads can carry nets but inspector labels mechanical. Sources diode_tht_sod123.js:247-262 and engine/src/footprint-tools.js:59. Await exact probe/root rerun.

- net_registry: observer=/root/net_registry; group=net_registry; observed_at=2026-09-20T15:53:26.748Z; valid_at=current dirty checkout; artifact=wave-1-code-net_registry.md; contamination=peer findings shared, root verification pending. Registry reuses exact string names; missing template and numeric metadata zero become empty net; KiCad10 output name-based and KiCad8 index-based. Unregistered quoted names pass normalization. Await exact outputs.

- native_compiler: observer=/root/native_compiler; group=native_compiler; observed_at=2026-09-20T15:53:26.748Z; valid_at=current dirty checkout; artifact=wave-1-code-native_compiler.md; contamination=peer findings shared, root verification pending. Public process worker probe: key metadata template creates nets; component with same template silently emits empty net. Native references stable across label/order changes. Source native/pcbs.js:26-39 and native/layout.js:218-229.

- led_connectivity: observer=/root/led_connectivity; group=led_connectivity; observed_at=2026-09-20T15:53:26.748Z; valid_at=current dirty checkout; artifact=wave-1-code-led_connectivity.md; contamination=peer findings shared, root verification pending. Managed LED pin mapping P1=VCC P2=DOUT P3=GND P4=DIN. Topology changes rewrite managed chain; geometry-only edits preserve. Sources keyAssembly.ts:132-141, designSetup.ts:298-329, assemblyWiring.ts.

- diode_topology: observer=/root/diode_topology; group=diode_topology; observed_at=2026-09-20T15:53:26.749Z; valid_at=current dirty checkout; artifact=wave-1-code-diode_topology.md; contamination=peer findings shared, root verification pending. Expected implemented topology switch column -> local switch net -> diode -> row; diode pad1=row,pad2=local. Source keyAssembly.ts:77-79,133-135 and diode_tht_sod123.js:131-155.

- mcu_pins: observer=/root/mcu_pins; group=mcu_pins; observed_at=2026-09-20T15:53:26.749Z; valid_at=current dirty checkout; artifact=wave-1-code-mcu_pins.md; contamination=peer findings shared, root verification pending. Source candidate: controller capacity 11/26/18; syncControllerNets matches known providers and considers every param value assigned. Pending edge probes.

- legacy_backend: 2026-09-20T15:55:58.498Z; group=legacy_backend; artifact=wave-1-code-legacy_backend.md; current checkout; Upstream pinned SHA 8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37 README describes unrouted PCBs. Parameter net object and local_net align with local backend. Source https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/pcbs.js and README.md. EXPAND compatibility comparison closed by registry/template lanes.

- kicad_semantics: 2026-09-20T15:55:58.499Z; group=kicad_semantics; artifact=wave-1-code-kicad_semantics.md; current checkout; Initial worker claim conflated stale numeric-net developer docs with newer name-only implementation. CORRECTION: official current parser parseNet accepts name-only and creates missing named nets. Root independently fetched https://gitlab.com/kicad/code/kicad/-/raw/master/pcbnew/pcb_io/kicad_sexpr/pcb_io_kicad_sexpr_parser.cpp lines277-320. Release pin expansion pending. No kicad-cli runtime evidence.

- viewer_export: 2026-09-20T15:55:58.499Z; group=viewer_export; artifact=wave-1-code-viewer_export.md; current checkout; Raw PCB export strings preserved; preview normalizes AST only. No ratsnest implementation found, only theme colors. First board shown for multi-board preview. 14 tests pass worker observed. EXPAND analysis/generate equivalence assigned wave2.

- coverage_repro: 2026-09-20T15:55:58.499Z; group=coverage_repro; artifact=wave-1-code-coverage_repro.md; current checkout; 57 focused checks passed: 45 app,9 KiCad10,1 BHK acceptance,2 footprint tools. Setup exports lack actual pad-membership assertions. EXPAND plain matrix+insertController public path assigned wave2.

- skeptic: 2026-09-20T15:55:58.499Z; group=skeptic; artifact=wave-1-code-skeptic.md; current checkout; Independent full setup pad census supports normal 2x2 nice_nano+LED net membership: single/mirrored each 13 footprints zero segments, matrix nets3 pads each, key intermediate2, LED links2 except terminal1. Reversible264 local segments. Counts worker measured. Baseline general missing-net hypothesis refuted for this fixture.

- coverage_repro-expansion: observed_at=2026-09-20T15:59:18.120Z; valid_at=current dirty tree; observer=/root/coverage_repro; independent group=coverage_repro; Wave2 actual export: plain createMatrix+insertComponent promicro produces matrix fingers_c1/fingers_c2/fingers_r1 absent from every controller pad. Baseline setup maps C1/C2/R1 to MCU14/13/17. Root verify-core.jsonl independently confirms. Physical pcb-pad-outside finding also occurs for plain insertion; do not claim no findings at all.

- app_serialization-expansion: observed_at=2026-09-20T15:59:18.120Z; valid_at=current dirty tree; observer=/root/app_serialization; independent group=app_serialization; Wave2 actual pads: manual AUTH_COL remains disconnected before/after; properties rename adds MCU AUTH_COL/AUTH_ROW without changing physical switch/diode C1/R1; inherited preserve overwrites INHERITED_COL with C1. All these report no findings. Root verified all cases.

- viewer_export-expansion: observed_at=2026-09-20T15:59:18.120Z; valid_at=current dirty tree; observer=/root/viewer_export; independent group=viewer_export; Wave2 analysis/generate byte equality in 2x1 ProMicro+LED single/mirrored: each7 footprints46 pads40 net nodes. Six unnetted are mechanical switch holes. EXPAND none.

- matrix_intent-expansion: observed_at=2026-09-20T15:59:18.120Z; valid_at=current dirty tree; observer=/root/matrix_intent; independent group=matrix_intent; Wave3 correction: createMatrix has no UI callers; actual BoardStudio add handler calls addCluster (358-385), matrix resize StudioInspector637-669 and addCell ColumnInspector165-173 are reachable on setup-less native docs. Repro utility equivalent needs direct UI path verification. EXPAND none.

- net_registry-expansion: observed_at=2026-09-20T15:59:18.120Z; valid_at=current dirty tree; observer=/root/net_registry; independent group=net_registry; Wave3 blank numbered stale imported net7 OLD is rejected by final engine: unresolved net7, or name disagrees if index7 allocated NEW. No silent wrong-net claim. EXPAND none.

- kicad_semantics-expansion: observed_at=2026-09-20T15:59:18.121Z; valid_at=current dirty tree; observer=/root/kicad_semantics; independent group=kicad_semantics; Wave3 released KiCad10.0.0 tag SHA0feeca2a807f428ad2b3fa7c1e39625cb769f02c parser supports name-only nets; root tagged header line196 defines20260206 exactly. Published numeric docs stale. No installed KiCad runtime; source compatibility proved. EXPAND closed.

- mcu_pins-expansion: observed_at=2026-09-20T15:59:18.121Z; valid_at=current dirty tree; observer=/root/mcu_pins; independent group=mcu_pins; Wave3 known shortage findings DO block Studio PCB downloads: BoardStudio514-540 error count -> StudioExport50 ready predicate. Generation and source ZIP remain allowed. Undetected net errors evade gate. EXPAND none.

## Root execution group

O-ROOT: source=verify-core.cjs; evidence layer=actual public engine execution and parsed emitted board; observer=/root; observed_at=2026-09-20T16:05:01.965Z; valid_at=current dirty checkout; artifact=verify-core.jsonl and YAML/PCB pairs; independence=independent rerun of member probes plus direct UI-handler addCluster variant; contamination=probe design informed by findings, outputs observed afresh.

O-KICAD: official tagged parser/header SHA0feeca2a807f428ad2b3fa7c1e39625cb769f02c; root fetched header and current parser; observation group=official implementation; root/worker agreement not independent upstream sources; primary-only exception. Header line19620260206; netcode removal comment line193.

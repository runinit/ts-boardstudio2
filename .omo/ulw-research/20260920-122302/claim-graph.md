# Claim graph

## Verified claims digest

C01–C18 supported within stated scopes. Numeric counts derive from exact source/runtime artifacts. Non-code license assertions only describe primary notices, with a primary-source-only exception; no legal interpretation is asserted. R01–R05 refuted. U01–U06 unresolved and excluded from positive assurance.

## C01

- Statement: 39 family modules have complete pin-relative hash/patch accounting
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I1
- Supporting observations: local-provenance.json;verify-inventory.json
- Contradicting observations / counter-search: Integrity record, not correctness proof
- Independent observation groups: inventory worker;root pinned-file hash comparison
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C02

- Statement: Choc B single unplated same-side assigns both socket contacts FROM
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I3
- Supporting observations: verify-switches.jsonl;verify-switches-upstream.jsonl
- Contradicting observations / counter-search: Control variants retain both signals; solder pads may still carry TO
- Independent observation groups: switch family;independent verifier;root native replay
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C03

- Statement: MX reversible default track metadata conflicts with contacted pads
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I3
- Supporting observations: verify-switches.jsonl
- Contradicting observations / counter-search: Geometric short not proven; source chains connect corresponding contacts
- Independent observation groups: switch family;independent verifier;root native replay
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C04

- Statement: Infused MCU fixed numeric segment IDs become wrong board-local named tags
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I4
- Supporting observations: verify-local.json;assets/infused-kim_nice_nano_pretty_named.kicad_pcb
- Contradicting observations / counter-search: Not a claim of physical short
- Independent observation groups: controller source;integration native;root native;fresh controller reviewer
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C05

- Statement: Ceoloide reversible MCU segments omit net fields
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I4
- Supporting observations: verify-local.json;assets/ceoloide_mcu_nice_nano_named.kicad_pcb
- Contradicting observations / counter-search: Desktop rebuild consequences unresolved
- Independent observation groups: controller source;root native;fresh controller reviewer
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C06

- Statement: Accepted diode option combination emits zero pads
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I3
- Supporting observations: verify-local.json;assets/padless_diode.kicad_pcb
- Contradicting observations / counter-search: Option documented reversible; missing incompatible-option validation
- Independent observation groups: peripheral;skeptic;root native
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C07

- Statement: Infused six-pad defaults alias PAD_5 on two pads per face
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2
- Supporting observations: verify-local.json;assets/six_pads_defaults.kicad_pcb
- Contradicting observations / counter-search: F5/6 B1/2; explicit net6 override can avoid default alias
- Independent observation groups: peripheral;root;fresh execution reviewer
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C08

- Statement: MX stabilizer gate/width controls do not implement declared intent
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I3
- Supporting observations: verify-switches.jsonl;/home/chris/projects/ts-boardstudio2/footprints/switch_mx.js
- Contradicting observations / counter-search: Widths source-only; net gates executed
- Independent observation groups: switch source;independent native probe
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C09

- Statement: SSD1306 custom ground width applies VCC-adjacent paths
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I3
- Supporting observations: verify-edge.json;assets/ssd-width-false.kicad_pcb
- Contradicting observations / counter-search: Reversible+traces+unequal widths only; no signal short claim
- Independent observation groups: controller;fresh controller native;root native
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C10

- Statement: Keepout shorthand F&B becomes NaN default layer; F/B rejected
- Type: code/source/runtime or documented limitation
- Risk: high
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I3,I4
- Supporting observations: verify-edge.json;assets/keepout-default.kicad_pcb
- Contradicting observations / counter-search: Explicit F&B yields intended token; no other semantic collision found in local scan
- Independent observation groups: fresh variants;fresh execution;root native
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C11

- Statement: Front/back, reversible, model orientation and layout mirroring differ
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I3
- Supporting observations: local-notes.json;AUDIT.md
- Contradicting observations / counter-search: Provider-specific, not universal parameter semantics
- Independent observation groups: family workers;fresh variants review
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C12

- Statement: Some reversible layouts require routing and selected bridges
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I3
- Supporting observations: verify-local.json;local-notes.json
- Contradicting observations / counter-search: Source omits tracks intentionally in some families
- Independent observation groups: peripheral/controller sources;root native
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C13

- Statement: 132 measured raw/staged result summaries match
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I4
- Supporting observations: compare-staging.cjs;staging-comparison.json;staged/verify-local.json
- Contradicting observations / counter-search: Not all geometry or raw-byte equality
- Independent observation groups: root independent raw/staged generation
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: C02–C10 raw/staged observations
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C14

- Statement: Complete existing footprint suite passed Node24 invocation
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I6
- Supporting observations: footprint-tests.txt;footprint-tests-receipt.json
- Contradicting observations / counter-search: Passing models tests cannot prove net separation
- Independent observation groups: root actual suite run
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C15

- Statement: Catalogue has346records306hashes27positive of34repos
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I5
- Supporting observations: catalogue.json;repositories.json;catalogue-counts.json
- Contradicting observations / counter-search: 26thirdparty+official;7contextonly;no universal GitHub completeness
- Independent observation groups: rootAST extraction;fresh catalogue exhaustive hash review
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C16

- Statement: Legacy top-level nets differ from current executor contract
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I5
- Supporting observations: catalogue.json;catalogue-data.cjs;MASTER_CATALOGUE.md
- Contradicting observations / counter-search: 12legacy records require migration; no external qualification
- Independent observation groups: official source;fresh contract12row probe;root schema extraction
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C17

- Statement: Source licenses require per-file/model scope; identified notices conflict
- Type: source-notice non-code
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I1,I5
- Supporting observations: license-audit.md;catalogue.json;repository-metadata.json
- Contradicting observations / counter-search: Primary-only exception for what each source states; no legal-clearance conclusion
- Independent observation groups: license worker;fresh license reviewer;root actualLICENSE/README check
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## C18

- Statement: Six supplementary runtime registrations generate in default smoke cases
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I6
- Supporting observations: verify-supplement.json;verify-supplement.cjs
- Contradicting observations / counter-search: Single-source execution exception; no full variant/physical audit
- Independent observation groups: root native runtime
- Convergence: source/runtime/review converged or explicit primary-only exception
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: supported
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## R01

- Statement: Matching upstream pins implies electrically correct variants
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2
- Supporting observations: verify-switches-upstream.jsonl
- Contradicting observations / counter-search: Inheritance reproduces defects
- Independent observation groups: upstream generator;independent verifier
- Convergence: refuted
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: refuted
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## R02

- Statement: Repeated pad numbers alone prove physical short
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2
- Supporting observations: https://docs.kicad.org/10.0/en/pcbnew/pcbnew.html#pad_connections_net_ties_and_jumper_pads
- Contradicting observations / counter-search: Same-net duplicates can be intentional
- Independent observation groups: official manual;geometry/source reviewer
- Convergence: refuted
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: refuted
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## R03

- Statement: Keepout B rejection is a correct negative test
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I3
- Supporting observations: verify-edge.json
- Contradicting observations / counter-search: Superseded by C10
- Independent observation groups: source contract;independent runtime
- Convergence: refuted
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: refuted
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## R04

- Statement: Current wizard silently ignores unknown reverse/reversible params
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I4
- Supporting observations: /home/chris/projects/ts-boardstudio2/engine/src/pcbs.js
- Contradicting observations / counter-search: Current executor rejects unknown params except special mirror
- Independent observation groups: engine source;contract review
- Convergence: refuted
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: refuted
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## R05

- Statement: GitHub API null/NOASSERTION establishes absence of license
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I5
- Supporting observations: license-audit.md;MASTER_CATALOGUE.md
- Contradicting observations / counter-search: MIT rawlibrary andUT22README corrected
- Independent observation groups: sourceLICENSE/README;fresh claims review
- Convergence: refuted
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: refuted
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## U01

- Statement: Desktop KiCad normalization and DRC outcome for emitted tracks
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2
- Supporting observations: assets/infused-kim_nice_nano_pretty_named.kicad_pcb;verify-switches.jsonl
- Contradicting observations / counter-search: No installed kicad-cli; generated artifacts retained
- Independent observation groups: root and reviewers
- Convergence: unresolved
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: unresolved
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## U02

- Statement: LED physical-view/pad numbering equivalence across both mounting modes
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2,I3
- Supporting observations: https://github.com/ceoloide/ergogen-footprints/issues/80
- Contradicting observations / counter-search: Logical function table agrees with local header; view-level dispute not closed
- Independent observation groups: issue;manufacturer Rev02;fresh physical reviewer
- Convergence: unresolved
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: unresolved
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## U03

- Statement: Gateron overlapping drill acceptance/custom-pad arbitrary-angle safety
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I3
- Supporting observations: /home/chris/projects/ts-boardstudio2/footprints/switch_gateron_ks27_ks33.js
- Contradicting observations / counter-search: No fabrication or full native DRC
- Independent observation groups: source geometry;switch reviewer
- Convergence: unresolved
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: unresolved
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## U04

- Statement: Schematic-update behavior for same-number/different-net providers
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I2
- Supporting observations: local-notes.json;verify-local.json
- Contradicting observations / counter-search: No native schematic roundtrip
- Independent observation groups: source;root pads inventory
- Convergence: unresolved
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: unresolved
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## U05

- Statement: Unlicensed/conflicting third-party redistribution scope
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I5
- Supporting observations: license-audit.md
- Contradicting observations / counter-search: Requires source-owner clarification/legal scope decision, catalogue remains link-only
- Independent observation groups: source statements;independent license review
- Convergence: unresolved
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: unresolved
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## U06

- Statement: Exact Alps target fit and all optional/physical variants
- Type: code/source/runtime or documented limitation
- Risk: normal
- Scope: current inspected worktree; pinned sources; variants named in artifacts
- Intent IDs: I3
- Supporting observations: /home/chris/projects/ts-boardstudio2/footprints/BOARDSTUDIO.md
- Contradicting observations / counter-search: No new model supplied/physical evidence; no fabrication assurance
- Independent observation groups: existing declared limits;fresh reviewers
- Convergence: unresolved
- Primary backing: actual source or executed generator output in listed artifacts
- Dependencies: none outside listed evidence
- Status: unresolved
- Synthesis location: AUDIT.md / MASTER_CATALOGUE.md

## Catalogue declaration nodes

Every file row below is a source-declaration claim, not support/qualification. Risk normal; intentI5; supporting observation O-C<n> is that exact pinned source parsed by catalogue-data.cjs; countercheck is file SHA-256 and contract shape; no contradicting source observed. Independent groups: root static extraction and fresh catalogue exhaustive pin/hash review (same primary source). Primary-only exception: a file is authoritative for its own declared API. Convergence supported for declared API only; dependencies C15/C16; synthesis MASTER_CATALOGUE per-repo row.

- C-M1: [Pipshag/goosekb/footprints/custom/combo_diode.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/combo_diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C1.
- C-M2: [Pipshag/goosekb/footprints/custom/mounting_hole.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/mounting_hole.js) declares params/body; current nets [], legacy nets []; status supported; O-C2.
- C-M3: [Pipshag/goosekb/footprints/custom/mx.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/mx.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C3.
- C-M4: [Pipshag/goosekb/footprints/custom/pads.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/pads.js) declares params/body; current nets [net_1,net_2,net_3,net_4,net_5,net_6], legacy nets []; status supported; O-C4.
- C-M5: [Pipshag/goosekb/footprints/custom/text.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C5.
- C-M6: [Pipshag/goosekb/footprints/custom/xiao_ble.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/xiao_ble.js) declares params/body; current nets [P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,RAW3V3,GND,RAW5V,BATP,BATN,RST,CLK,DIO,NFC0,NFC1], legacy nets []; status supported; O-C6.
- C-M7: [Pipshag/goosekb/footprints/custom/xiao_ble_smd_reversible.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/xiao_ble_smd_reversible.js) declares params/body; current nets [D0,D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,_3V3,GND,_5V,RST,BATP], legacy nets []; status supported; O-C7.
- C-M8: [Pipshag/goosekb/footprints/custom/xiao_reverse.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/xiao_reverse.js) declares params/body; current nets [], legacy nets []; status supported; O-C8.
- C-M9: [ceoloide/ergogen-footprints/battery_connector_jst_ph_2.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/battery_connector_jst_ph_2.js) declares params/body; current nets [BAT_P,BAT_N], legacy nets []; status supported; O-C9.
- C-M10: [ceoloide/ergogen-footprints/battery_connector_molex_pico_ezmate_1x02.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/battery_connector_molex_pico_ezmate_1x02.js) declares params/body; current nets [BAT_P,BAT_N], legacy nets []; status supported; O-C10.
- C-M11: [ceoloide/ergogen-footprints/diode_tht_sod123.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/diode_tht_sod123.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C11.
- C-M12: [ceoloide/ergogen-footprints/display_nice_view.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/display_nice_view.js) declares params/body; current nets [MOSI,SCK,VCC,GND,CS], legacy nets []; status supported; O-C12.
- C-M13: [ceoloide/ergogen-footprints/display_ssd1306.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/display_ssd1306.js) declares params/body; current nets [SDA,SCL,VCC,GND], legacy nets []; status supported; O-C13.
- C-M14: [ceoloide/ergogen-footprints/led_sk6812mini-e.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/led_sk6812mini-e.js) declares params/body; current nets [P1,P2,P3,P4], legacy nets []; status supported; O-C14.
- C-M15: [ceoloide/ergogen-footprints/mcu_nice_nano.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mcu_nice_nano.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9,P101,P102,P107], legacy nets []; status supported; O-C15.
- C-M16: [ceoloide/ergogen-footprints/mcu_supermini_nrf52840.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mcu_supermini_nrf52840.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9,P101,P102,P107], legacy nets []; status supported; O-C16.
- C-M17: [ceoloide/ergogen-footprints/mounting_hole_npth.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mounting_hole_npth.js) declares params/body; current nets [], legacy nets []; status supported; O-C17.
- C-M18: [ceoloide/ergogen-footprints/mounting_hole_plated.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mounting_hole_plated.js) declares params/body; current nets [], legacy nets []; status supported; O-C18.
- C-M19: [ceoloide/ergogen-footprints/power_switch_smd_side.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/power_switch_smd_side.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C19.
- C-M20: [ceoloide/ergogen-footprints/reset_switch_smd_side.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/reset_switch_smd_side.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C20.
- C-M21: [ceoloide/ergogen-footprints/reset_switch_tht_top.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/reset_switch_tht_top.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C21.
- C-M22: [ceoloide/ergogen-footprints/rotary_encoder_ec11_ec12.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/rotary_encoder_ec11_ec12.js) declares params/body; current nets [S1,S2,A,B,C], legacy nets []; status supported; O-C22.
- C-M23: [ceoloide/ergogen-footprints/switch_choc_v1_v2.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/switch_choc_v1_v2.js) declares params/body; current nets [from,to,CENTERHOLE,LEFTSTAB,RIGHTSTAB], legacy nets []; status supported; O-C23.
- C-M24: [ceoloide/ergogen-footprints/switch_gateron_ks27_ks33.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/switch_gateron_ks27_ks33.js) declares params/body; current nets [from,to,CENTERHOLE], legacy nets []; status supported; O-C24.
- C-M25: [ceoloide/ergogen-footprints/switch_mx.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/switch_mx.js) declares params/body; current nets [from,to,CENTERHOLE,LEFTSTAB,RIGHTSTAB], legacy nets []; status supported; O-C25.
- C-M26: [ceoloide/ergogen-footprints/trrs_pj320a.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/trrs_pj320a.js) declares params/body; current nets [TP,R1,R2,SL], legacy nets []; status supported; O-C26.
- C-M27: [ceoloide/ergogen-footprints/utility_ergogen_logo.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_ergogen_logo.js) declares params/body; current nets [], legacy nets []; status supported; O-C27.
- C-M28: [ceoloide/ergogen-footprints/utility_filled_zone.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_filled_zone.js) declares params/body; current nets [net], legacy nets []; status supported; O-C28.
- C-M29: [ceoloide/ergogen-footprints/utility_keepout_zone.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_keepout_zone.js) declares params/body; current nets [], legacy nets []; status supported; O-C29.
- C-M30: [ceoloide/ergogen-footprints/utility_point_debugger.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_point_debugger.js) declares params/body; current nets [], legacy nets []; status supported; O-C30.
- C-M31: [ceoloide/ergogen-footprints/utility_router.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_router.js) declares params/body; current nets [net], legacy nets []; status supported; O-C31.
- C-M32: [ceoloide/ergogen-footprints/utility_text.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_text.js) declares params/body; current nets [], legacy nets []; status supported; O-C32.
- C-M33: [ergogen/ergogen/src/footprints/alps.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/alps.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C33.
- C-M34: [ergogen/ergogen/src/footprints/button.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/button.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C34.
- C-M35: [ergogen/ergogen/src/footprints/choc.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/choc.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C35.
- C-M36: [ergogen/ergogen/src/footprints/chocmini.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/chocmini.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C36.
- C-M37: [ergogen/ergogen/src/footprints/diode.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C37.
- C-M38: [ergogen/ergogen/src/footprints/jstph.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/jstph.js) declares params/body; current nets [pos,neg], legacy nets []; status supported; O-C38.
- C-M39: [ergogen/ergogen/src/footprints/jumper.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/jumper.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C39.
- C-M40: [ergogen/ergogen/src/footprints/mx.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/mx.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C40.
- C-M41: [ergogen/ergogen/src/footprints/oled.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/oled.js) declares params/body; current nets [VCC,GND,SDA,SCL], legacy nets []; status supported; O-C41.
- C-M42: [ergogen/ergogen/src/footprints/omron.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/omron.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C42.
- C-M43: [ergogen/ergogen/src/footprints/pad.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/pad.js) declares params/body; current nets [net], legacy nets []; status supported; O-C43.
- C-M44: [ergogen/ergogen/src/footprints/promicro.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/promicro.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C44.
- C-M45: [ergogen/ergogen/src/footprints/rgb.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/rgb.js) declares params/body; current nets [din,dout,VCC,GND], legacy nets []; status supported; O-C45.
- C-M46: [ergogen/ergogen/src/footprints/rotary.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/rotary.js) declares params/body; current nets [from,to,A,B,C], legacy nets []; status supported; O-C46.
- C-M47: [ergogen/ergogen/src/footprints/scrollwheel.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/scrollwheel.js) declares params/body; current nets [from,to,A,B,C,D], legacy nets []; status supported; O-C47.
- C-M48: [ergogen/ergogen/src/footprints/slider.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/slider.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C48.
- C-M49: [ergogen/ergogen/src/footprints/trrs.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/trrs.js) declares params/body; current nets [A,B,C,D], legacy nets []; status supported; O-C49.
- C-M50: [ergogen/ergogen/src/footprints/via.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/via.js) declares params/body; current nets [net], legacy nets []; status supported; O-C50.
- C-M51: [AlexSutila/ergogen-footprints/pipicow.js](https://github.com/AlexSutila/ergogen-footprints/blob/eaf27a762721f650575860a2370b6637b1e994d3/pipicow.js) declares params/body; current nets [GND,VBUS,VSYS,EN_3V3,OUT_3V3,ADC_VREF,AGND,RUN,GP0,GP1,GP2,GP3,GP4,GP5,GP6,GP7,GP8,GP9,GP10,GP11,GP12,GP13,GP14,GP15,GP16,GP17,GP18,GP19,GP20,GP21,GP22,GP26,GP27,GP28], legacy nets []; status supported; O-C51.
- C-M52: [AlexSutila/ergogen-footprints/uxcell-jack.js](https://github.com/AlexSutila/ergogen-footprints/blob/eaf27a762721f650575860a2370b6637b1e994d3/uxcell-jack.js) declares params/body; current nets [HOLEA,HOLEB,HOLEC], legacy nets []; status supported; O-C52.
- C-M53: [CardboardMechanic/ergogen_footprints/azoteq_trackpad.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/azoteq_trackpad.js) declares params/body; current nets [SDA,SCL,VCC,GND,RST,RDY], legacy nets []; status supported; O-C53.
- C-M54: [CardboardMechanic/ergogen_footprints/battery_connector_jst_ph_2.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/battery_connector_jst_ph_2.js) declares params/body; current nets [BAT_P,BAT_N], legacy nets []; status supported; O-C54.
- C-M55: [CardboardMechanic/ergogen_footprints/button.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/button.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C55.
- C-M56: [CardboardMechanic/ergogen_footprints/choc.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/choc.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C56.
- C-M57: [CardboardMechanic/ergogen_footprints/chocbackplate.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/chocbackplate.js) declares legacy nets+params; current nets [], legacy nets [from,to]; status supported; O-C57.
- C-M58: [CardboardMechanic/ergogen_footprints/diode.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C58.
- C-M59: [CardboardMechanic/ergogen_footprints/diodebackplate.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/diodebackplate.js) declares legacy nets+params; current nets [], legacy nets [from,to]; status supported; O-C59.
- C-M60: [CardboardMechanic/ergogen_footprints/elite-c.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/elite-c.js) declares params/body; current nets [D3,D2,GND0,GND1,D1,D0,D4,C6,D7,E6,B4,B5,B7,D5,C7,F1,F0,B6,B2,B3,B1,F7,F6,F5,F4,VCC,RST,GND2,B0], legacy nets []; status supported; O-C60.
- C-M61: [CardboardMechanic/ergogen_footprints/magnetic_vik_keyboard_connector.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/magnetic_vik_keyboard_connector.js) declares params/body; current nets [V3V,GND,SDA,SCL,RGB_LED_OUT,V5V,GPIO1,MOSI,GPIO2,SPI_CS,MISO,SCLK], legacy nets []; status supported; O-C61.
- C-M62: [CardboardMechanic/ergogen_footprints/mounting_hole.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/mounting_hole.js) declares params/body; current nets [], legacy nets []; status supported; O-C62.
- C-M63: [CardboardMechanic/ergogen_footprints/nice_nano.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/nice_nano.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C63.
- C-M64: [CardboardMechanic/ergogen_footprints/rotary.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/rotary.js) declares params/body; current nets [from,to,A,B,C], legacy nets []; status supported; O-C64.
- C-M65: [CardboardMechanic/ergogen_footprints/text.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C65.
- C-M66: [CardboardMechanic/ergogen_footprints/text_metal.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/text_metal.js) declares params/body; current nets [], legacy nets []; status supported; O-C66.
- C-M67: [ImStuBTW/ergogen-v4-footprints/buttonrightangle.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/buttonrightangle.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C67.
- C-M68: [ImStuBTW/ergogen-v4-footprints/gbareversible.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/gbareversible.js) declares params/body; current nets [BATOUT,BATIN,RST,GND,VCC,MOSI,MISO,SCK,IO_CS,row0,row1,row2,row3,row4,row5,LCD_CS,col0,col1,col2,col3,col4,col5,col6,col7,NFC0,NFC1], legacy nets []; status supported; O-C68.
- C-M69: [ImStuBTW/ergogen-v4-footprints/lowproro.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/lowproro.js) declares params/body; current nets [A,PUSH,COM,B], legacy nets []; status supported; O-C69.
- C-M70: [ImStuBTW/ergogen-v4-footprints/lowprothumb.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/lowprothumb.js) declares params/body; current nets [A,PUSH,COM,B], legacy nets []; status supported; O-C70.
- C-M71: [ImStuBTW/ergogen-v4-footprints/mountingholem2.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/mountingholem2.js) declares legacy nets+params; current nets [], legacy nets [net]; status supported; O-C71.
- C-M72: [ImStuBTW/ergogen-v4-footprints/mountingholem3.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/mountingholem3.js) declares legacy nets+params; current nets [], legacy nets [net]; status supported; O-C72.
- C-M73: [ImStuBTW/ergogen-v4-footprints/spdt.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/spdt.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C73.
- C-M74: [ImStuBTW/ergogen-v4-footprints/xiao-ble-kicad5.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/xiao-ble-kicad5.js) declares params/body; current nets [P0,P1,P2,P3,P4,P5,P6,RAW5V,GND,RAW3V3,P10,P9,P8,P7,SWCLK,SWDIO,RST,BAT_POS,BAT_NEG,NFC1,NFC2], legacy nets []; status supported; O-C74.
- C-M75: [ImStuBTW/ergogen-v4-footprints/xiao-ble.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/xiao-ble.js) declares params/body; current nets [P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,RAW3V3,GND,RAW5V,SWCLK,SWDIO,RST,BAT_POS,BAT_NEG,NFC1,NFC2], legacy nets []; status supported; O-C75.
- C-M76: [Virginia2244/ergogen_footprints/footprints/choc.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/choc.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C76.
- C-M77: [Virginia2244/ergogen_footprints/footprints/diode.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C77.
- C-M78: [Virginia2244/ergogen_footprints/footprints/elite-c.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/elite-c.js) declares params/body; current nets [D3,D2,D1,D0,D4,C6,D7,E6,B4,B5,B0,F4,F5,F6,F7,B1,B3,B2,B6,VBUS,GND,RST,VCC,B7,D5,C7,F1,F0], legacy nets []; status supported; O-C78.
- C-M79: [Virginia2244/ergogen_footprints/footprints/kb2040.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/kb2040.js) declares params/body; current nets [DPOS,DMIN,TX,RX,GND,P1,P2,P3,P4,P5,P6,P7,P8,P9,RAW,G,RST,V3,A3,A2,A1,A0,CLK,MI,MO,P10], legacy nets []; status supported; O-C79.
- C-M80: [Virginia2244/ergogen_footprints/footprints/mx.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/mx.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C80.
- C-M81: [Virginia2244/ergogen_footprints/footprints/nice_nano.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/nice_nano.js) declares params/body; current nets [P006,P008,P017,P020,P022,P024,P100,P011,P104,P106,P031,P029,P002,P115,P113,P111,P010,P009,BPOS,BNEG,RAW,GND,RST,VCC,P101,P102,P107], legacy nets []; status supported; O-C81.
- C-M82: [Virginia2244/ergogen_footprints/footprints/promicro.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/promicro.js) declares params/body; current nets [P1,P0,P2,P3,P4,P5,P6,P7,P8,P9,P21,P20,P19,P18,P15,P14,P16,P10,RAW,RST,VCC,GND], legacy nets []; status supported; O-C82.
- C-M83: [Virginia2244/ergogen_footprints/footprints/rgb.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/rgb.js) declares params/body; current nets [din,dout,VCC,GND], legacy nets []; status supported; O-C83.
- C-M84: [Virginia2244/ergogen_footprints/footprints/seeed_xaio.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/seeed_xaio.js) declares params/body; current nets [P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,VCC,GND,V3], legacy nets []; status supported; O-C84.
- C-M85: [Virginia2244/ergogen_footprints/footprints/trrs.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/trrs.js) declares params/body; current nets [A,B,C,D], legacy nets []; status supported; O-C85.
- C-M86: [Virginia2244/ergogen_footprints/footprints/waveshare_rp2040_zero.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/waveshare_rp2040_zero.js) declares params/body; current nets [P0,P1,P2,P3,P4,P5,P6,P7,P8,V5,GND,V3,P29,P28,P27,P26,P15,P14,P13,P12,P11,P10,P9], legacy nets []; status supported; O-C86.
- C-M87: [jusdisgi/ergogen-footprints/Magsafe_Silkscreen.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/Magsafe_Silkscreen.js) declares params/body; current nets [], legacy nets []; status supported; O-C87.
- C-M88: [jusdisgi/ergogen-footprints/conn_molex_pico_ezmate_plus_1x02.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_pico_ezmate_plus_1x02.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C88.
- C-M89: [jusdisgi/ergogen-footprints/conn_molex_picoblade_smd_1x08_1mm25_horiz.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_smd_1x08_1mm25_horiz.js) declares params/body; current nets [MP,P1,P2,P3,P4,P5,P6,P7,P8], legacy nets []; status supported; O-C89.
- C-M90: [jusdisgi/ergogen-footprints/conn_molex_picoblade_smd_1x08_1mm25_vert.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_smd_1x08_1mm25_vert.js) declares params/body; current nets [MP,P1,P2,P3,P4,P5,P6,P7,P8], legacy nets []; status supported; O-C90.
- C-M91: [jusdisgi/ergogen-footprints/conn_molex_picoblade_tht_1x08_1mm25_horiz.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_tht_1x08_1mm25_horiz.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8], legacy nets []; status supported; O-C91.
- C-M92: [jusdisgi/ergogen-footprints/conn_molex_picoblade_tht_1x08_1mm25_vert.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_tht_1x08_1mm25_vert.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8], legacy nets []; status supported; O-C92.
- C-M93: [jusdisgi/ergogen-footprints/diode_bav70_hand.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/diode_bav70_hand.js) declares params/body; current nets [from1,from2,to], legacy nets []; status supported; O-C93.
- C-M94: [jusdisgi/ergogen-footprints/diode_bav70_larssont.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/diode_bav70_larssont.js) declares params/body; current nets [A1,A2,C], legacy nets []; status supported; O-C94.
- C-M95: [jusdisgi/ergogen-footprints/diode_smd_sod323f.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/diode_smd_sod323f.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C95.
- C-M96: [jusdisgi/ergogen-footprints/lcd_waveshare_1in69.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/lcd_waveshare_1in69.js) declares params/body; current nets [], legacy nets []; status supported; O-C96.
- C-M97: [jusdisgi/ergogen-footprints/led_load_switch.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/led_load_switch.js) declares params/body; current nets [P1,P2,P3], legacy nets []; status supported; O-C97.
- C-M98: [jusdisgi/ergogen-footprints/led_ws2812b_2020.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/led_ws2812b_2020.js) declares params/body; current nets [P1,P2,P3,P4], legacy nets []; status supported; O-C98.
- C-M99: [jusdisgi/ergogen-footprints/mounting_hole_npth.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mounting_hole_npth.js) declares params/body; current nets [], legacy nets []; status supported; O-C99.
- C-M100: [jusdisgi/ergogen-footprints/mounting_hole_plated.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mounting_hole_plated.js) declares params/body; current nets [], legacy nets []; status supported; O-C100.
- C-M101: [jusdisgi/ergogen-footprints/mousebites_25mm.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mousebites_25mm.js) declares params/body; current nets [], legacy nets []; status supported; O-C101.
- C-M102: [jusdisgi/ergogen-footprints/roller_encoder_ckw12.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/roller_encoder_ckw12.js) declares params/body; current nets [S1,S2,A,B,C], legacy nets []; status supported; O-C102.
- C-M103: [jusdisgi/ergogen-footprints/scrollwheel.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/scrollwheel.js) declares params/body; current nets [from,to,A,B,C,D], legacy nets []; status supported; O-C103.
- C-M104: [jusdisgi/ergogen-footprints/switch_5way_skrh.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/switch_5way_skrh.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6], legacy nets []; status supported; O-C104.
- C-M105: [jusdisgi/ergogen-footprints/switch_pg1316s.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/switch_pg1316s.js) declares params/body; current nets [from,to,mp_net], legacy nets []; status supported; O-C105.
- C-M106: [jusdisgi/ergogen-footprints/util_xiao_ble_cutout.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_cutout.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22], legacy nets []; status supported; O-C106.
- C-M107: [jusdisgi/ergogen-footprints/util_xiao_ble_cutout_simple.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_cutout_simple.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22], legacy nets []; status supported; O-C107.
- C-M108: [jusdisgi/ergogen-footprints/util_xiao_ble_plus_cutout.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_plus_cutout.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22,P23,P24,P25,P26,P27,P28], legacy nets []; status supported; O-C108.
- C-M109: [jusdisgi/ergogen-footprints/util_xiao_ble_plus_cutout_simple.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_plus_cutout_simple.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22,P23,P24,P25,P26,P27,P28], legacy nets []; status supported; O-C109.
- C-M110: [jusdisgi/ergogen-footprints/xiao_ble_breakout_holes.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/xiao_ble_breakout_holes.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22], legacy nets []; status supported; O-C110.
- C-M111: [jusdisgi/ergogen-footprints/xiao_ble_plus_breakout_holes.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/xiao_ble_plus_breakout_holes.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22,P23,P24,P25,P26,P27,P28,P29,P30,P31], legacy nets []; status supported; O-C111.
- C-M112: [jusdisgi/ergogen-footprints/xiao_smd_xl_cutout.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/xiao_smd_xl_cutout.js) declares params/body; current nets [D0,D1,D2,D3,D4,D5,D6,D10,D9,D8,D7,RAW3V3,RAW5V,CLK,DIO,GND,RST,BAT,NFC1,NFC2], legacy nets []; status supported; O-C112.
- C-M113: [lapidot/ergogenFootprintCollection/alps.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/alps.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C113.
- C-M114: [lapidot/ergogenFootprintCollection/azoteq_tps43.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/azoteq_tps43.js) declares params/body; current nets [], legacy nets []; status supported; O-C114.
- C-M115: [lapidot/ergogenFootprintCollection/button.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/button.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C115.
- C-M116: [lapidot/ergogenFootprintCollection/choc.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/choc.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C116.
- C-M117: [lapidot/ergogenFootprintCollection/chocmini.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/chocmini.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C117.
- C-M118: [lapidot/ergogenFootprintCollection/cirque.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/cirque.js) declares params/body; current nets [], legacy nets []; status supported; O-C118.
- C-M119: [lapidot/ergogenFootprintCollection/diode.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C119.
- C-M120: [lapidot/ergogenFootprintCollection/elite.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/elite.js) declares params/body; current nets [GND,VCC,ST,D3,D1,D2,D0,D4,C6,D7,E6,B4,B5,B7,D5,C7,F1,F0,B6,B2,B3,B1,F7,F6,F5,F4,B0], legacy nets []; status supported; O-C120.
- C-M121: [lapidot/ergogenFootprintCollection/helios.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/helios.js) declares params/body; current nets [IO10,TX,RX,GND,IO2,IO3,IO4,IO5,IO6,IO7,IO8,IO9,IO12,IO13,IO14,IO15,IO16,IO21,IO23,IO20,IO22,A0,A1,A2,A3,VCC,RAW,RST,IO11,RGB,Dminus,Dplus], legacy nets []; status supported; O-C121.
- C-M122: [lapidot/ergogenFootprintCollection/jstph.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/jstph.js) declares params/body; current nets [pos,neg], legacy nets []; status supported; O-C122.
- C-M123: [lapidot/ergogenFootprintCollection/jumper.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/jumper.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C123.
- C-M124: [lapidot/ergogenFootprintCollection/mounthole.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mounthole.js) declares legacy nets+params; current nets [], legacy nets [net]; status supported; O-C124.
- C-M125: [lapidot/ergogenFootprintCollection/mountinghole ORIGINAL.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mountinghole%20ORIGINAL.js) declares legacy nets+params; current nets [], legacy nets [net]; status supported; O-C125.
- C-M126: [lapidot/ergogenFootprintCollection/mountinghole.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mountinghole.js) declares legacy nets+params; current nets [], legacy nets [net]; status supported; O-C126.
- C-M127: [lapidot/ergogenFootprintCollection/mx.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mx.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C127.
- C-M128: [lapidot/ergogenFootprintCollection/niceview.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/niceview.js) declares params/body; current nets [VCC,GND,SDA,SCL,CS], legacy nets []; status supported; O-C128.
- C-M129: [lapidot/ergogenFootprintCollection/oled.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/oled.js) declares params/body; current nets [VCC,GND,SDA,SCL], legacy nets []; status supported; O-C129.
- C-M130: [lapidot/ergogenFootprintCollection/omron.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/omron.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C130.
- C-M131: [lapidot/ergogenFootprintCollection/pad.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/pad.js) declares params/body; current nets [net], legacy nets []; status supported; O-C131.
- C-M132: [lapidot/ergogenFootprintCollection/pimoroni_trackball.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/pimoroni_trackball.js) declares params/body; current nets [VCC,SDA,SCL,GND], legacy nets []; status supported; O-C132.
- C-M133: [lapidot/ergogenFootprintCollection/promicro.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/promicro.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C133.
- C-M134: [lapidot/ergogenFootprintCollection/rgb.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/rgb.js) declares params/body; current nets [din,dout,VCC,GND], legacy nets []; status supported; O-C134.
- C-M135: [lapidot/ergogenFootprintCollection/rotary.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/rotary.js) declares params/body; current nets [from,to,A,B,C], legacy nets []; status supported; O-C135.
- C-M136: [lapidot/ergogenFootprintCollection/scrollwheel.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/scrollwheel.js) declares params/body; current nets [from,to,A,B,C,D], legacy nets []; status supported; O-C136.
- C-M137: [lapidot/ergogenFootprintCollection/slider.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/slider.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C137.
- C-M138: [lapidot/ergogenFootprintCollection/smd_resistor.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/smd_resistor.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C138.
- C-M139: [lapidot/ergogenFootprintCollection/tentingpuck.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/tentingpuck.js) declares legacy nets+params; current nets [], legacy nets []; status supported; O-C139.
- C-M140: [lapidot/ergogenFootprintCollection/trackpad_hole.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/trackpad_hole.js) declares params/body; current nets [], legacy nets []; status supported; O-C140.
- C-M141: [lapidot/ergogenFootprintCollection/trrs.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/trrs.js) declares params/body; current nets [A,B,C,D], legacy nets []; status supported; O-C141.
- C-M142: [lapidot/ergogenFootprintCollection/via.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/via.js) declares params/body; current nets [net], legacy nets []; status supported; O-C142.
- C-M143: [larssont/ergogen-footprints/amplifier.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/amplifier.js) declares params/body; current nets [VCC,GND,AUDIO_IN,AUDIO_OUT_POS,AUDIO_OUT_NEG,SDB,AMP_IN_NEG,AMP_IN_POS,HPF,BYPASS], legacy nets []; status supported; O-C143.
- C-M144: [larssont/ergogen-footprints/bav70.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/bav70.js) declares params/body; current nets [A1,A2,C], legacy nets []; status supported; O-C144.
- C-M145: [larssont/ergogen-footprints/magsafe.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/magsafe.js) declares params/body; current nets [], legacy nets []; status supported; O-C145.
- C-M146: [larssont/ergogen-footprints/mh_npth.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/mh_npth.js) declares params/body; current nets [], legacy nets []; status supported; O-C146.
- C-M147: [larssont/ergogen-footprints/piezo.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/piezo.js) declares params/body; current nets [A,B], legacy nets []; status supported; O-C147.
- C-M148: [larssont/ergogen-footprints/rj11.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/rj11.js) declares params/body; current nets [TX,RX,POWER,GND], legacy nets []; status supported; O-C148.
- C-M149: [larssont/ergogen-footprints/rp2040_smd.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/rp2040_smd.js) declares params/body; current nets [V5,GND,V3,P29,P28,P27,P26,P15,P14,P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13], legacy nets []; status supported; O-C149.
- C-M150: [larssont/ergogen-footprints/sprintek_sk8707_01_driver.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/sprintek_sk8707_01_driver.js) declares params/body; current nets [GND,DATA,CLOCK,RESET,VCC,LEFT,MIDDLE,RIGHT,TPS1,TPS2,TPS3,TPS4], legacy nets []; status supported; O-C150.
- C-M151: [larssont/ergogen-footprints/sprintek_sk8707_01_sensor.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/sprintek_sk8707_01_sensor.js) declares params/body; current nets [TPS1,TPS2,TPS3,TPS4], legacy nets []; status supported; O-C151.
- C-M152: [larssont/ergogen-footprints/text.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C152.
- C-M153: [larssont/ergogen-footprints/usb_mini_b.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/usb_mini_b.js) declares params/body; current nets [VBUS,DMIN,DPLUS,ID,GND], legacy nets []; status supported; O-C153.
- C-M154: [infused-kim/kb_ergogen_fp/choc.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/choc.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C154.
- C-M155: [infused-kim/kb_ergogen_fp/conn_molex_pico_ezmate_1x02.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/conn_molex_pico_ezmate_1x02.js) declares params/body; current nets [pad_1,pad_2], legacy nets []; status supported; O-C155.
- C-M156: [infused-kim/kb_ergogen_fp/conn_molex_pico_ezmate_1x05.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/conn_molex_pico_ezmate_1x05.js) declares params/body; current nets [pad_1,pad_2,pad_3,pad_4,pad_5], legacy nets []; status supported; O-C156.
- C-M157: [infused-kim/kb_ergogen_fp/diode.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C157.
- C-M158: [infused-kim/kb_ergogen_fp/icon_bat.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/icon_bat.js) declares params/body; current nets [], legacy nets []; status supported; O-C158.
- C-M159: [infused-kim/kb_ergogen_fp/mounting_hole.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/mounting_hole.js) declares params/body; current nets [], legacy nets []; status supported; O-C159.
- C-M160: [infused-kim/kb_ergogen_fp/nice_nano_pretty.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/nice_nano_pretty.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C160.
- C-M161: [infused-kim/kb_ergogen_fp/nice_view.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/nice_view.js) declares params/body; current nets [MOSI,SCK,VCC,GND,CS], legacy nets []; status supported; O-C161.
- C-M162: [infused-kim/kb_ergogen_fp/pads.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/pads.js) declares params/body; current nets [net_1,net_2,net_3,net_4,net_5,net_6], legacy nets []; status supported; O-C162.
- C-M163: [infused-kim/kb_ergogen_fp/point_debugger.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/point_debugger.js) declares params/body; current nets [], legacy nets []; status supported; O-C163.
- C-M164: [infused-kim/kb_ergogen_fp/smd_0805.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/smd_0805.js) declares params/body; current nets [net_1_from,net_1_to,net_2_from,net_2_to,net_3_from,net_3_to,net_4_from,net_4_to,net_5_from,net_5_to,net_6_from,net_6_to], legacy nets []; status supported; O-C164.
- C-M165: [infused-kim/kb_ergogen_fp/switch_power.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/switch_power.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C165.
- C-M166: [infused-kim/kb_ergogen_fp/switch_reset.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/switch_reset.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C166.
- C-M167: [infused-kim/kb_ergogen_fp/text.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C167.
- C-M168: [infused-kim/kb_ergogen_fp/trackpoint_mount.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/trackpoint_mount.js) declares params/body; current nets [], legacy nets []; status supported; O-C168.
- C-M169: [AminKAli/ergogen_footprints/3mm_kerf_bend_path.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/3mm_kerf_bend_path.js) declares params/body; current nets [], legacy nets []; status supported; O-C169.
- C-M170: [AminKAli/ergogen_footprints/3mm_kerf_bend_path_mirrored.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/3mm_kerf_bend_path_mirrored.js) declares params/body; current nets [], legacy nets []; status supported; O-C170.
- C-M171: [AminKAli/ergogen_footprints/choc_stabilizer.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/choc_stabilizer.js) declares params/body; current nets [], legacy nets []; status supported; O-C171.
- C-M172: [AminKAli/ergogen_footprints/e73_mcu.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/e73_mcu.js) declares params/body; current nets [net_param], legacy nets []; status supported; O-C172.
- C-M173: [AminKAli/ergogen_footprints/he/1_5u_marker.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/1_5u_marker.js) declares params/body; current nets [], legacy nets []; status supported; O-C173.
- C-M174: [AminKAli/ergogen_footprints/he/1u_marker.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/1u_marker.js) declares params/body; current nets [], legacy nets []; status supported; O-C174.
- C-M175: [AminKAli/ergogen_footprints/he/cap.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/cap.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C175.
- C-M176: [AminKAli/ergogen_footprints/he/multiplexer.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/multiplexer.js) declares params/body; current nets [MS0,MS1,MS2,MO,MI1,MI2,MI3,MI4,MI5,MI6,MI7,MI8,GND,VCC], legacy nets []; status supported; O-C176.
- C-M177: [AminKAli/ergogen_footprints/he/multiplexer_vias.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/multiplexer_vias.js) declares params/body; current nets [gnd,ms0,ms1,ms2,mo], legacy nets []; status supported; O-C177.
- C-M178: [AminKAli/ergogen_footprints/he/sensor.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/sensor.js) declares params/body; current nets [P1,P2,P3], legacy nets []; status supported; O-C178.
- C-M179: [AminKAli/ergogen_footprints/he/via_0603x5.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/via_0603x5.js) declares params/body; current nets [net1,net2,net3,net4,net5], legacy nets []; status supported; O-C179.
- C-M180: [AminKAli/ergogen_footprints/kailh_mouse_rotary.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/kailh_mouse_rotary.js) declares params/body; current nets [A,B,C], legacy nets []; status supported; O-C180.
- C-M181: [AminKAli/ergogen_footprints/kerf_bend_path.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/kerf_bend_path.js) declares params/body; current nets [], legacy nets []; status supported; O-C181.
- C-M182: [AminKAli/ergogen_footprints/kerf_bend_path_mirrored.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/kerf_bend_path_mirrored.js) declares params/body; current nets [], legacy nets []; status supported; O-C182.
- C-M183: [AminKAli/ergogen_footprints/n_mosfet_sot23.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/n_mosfet_sot23.js) declares params/body; current nets [G,S,D], legacy nets []; status supported; O-C183.
- C-M184: [AminKAli/ergogen_footprints/siq_rotary.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/siq_rotary.js) declares params/body; current nets [A,B,C,S], legacy nets []; status supported; O-C184.
- C-M185: [AminKAli/ergogen_footprints/tl3342_reset_switch_smd.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/tl3342_reset_switch_smd.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C185.
- C-M186: [AminKAli/ergogen_footprints/via_0603.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/via_0603.js) declares params/body; current nets [net], legacy nets []; status supported; O-C186.
- C-M187: [AminKAli/ergogen_footprints/via_1005x11.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/via_1005x11.js) declares params/body; current nets [net1,net2,net3,net4,net5,net6,net7,net8,net9,net10,net11], legacy nets []; status supported; O-C187.
- C-M188: [arrowtip/ergogen_footprints/elite_c_rev4.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/elite_c_rev4.js) declares params/body; current nets [GND,VCC,ST,D3,D1,D2,D0,D4,C6,D7,E6,B4,B5,B7,D5,C7,F1,F0,B6,B2,B3,B1,F7,F6,F5,F4,B0], legacy nets []; status supported; O-C188.
- C-M189: [arrowtip/ergogen_footprints/grub.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/grub.js) declares params/body; current nets [], legacy nets []; status supported; O-C189.
- C-M190: [arrowtip/ergogen_footprints/kings_idol.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/kings_idol.js) declares params/body; current nets [], legacy nets []; status supported; O-C190.
- C-M191: [arrowtip/ergogen_footprints/knight.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/knight.js) declares params/body; current nets [], legacy nets []; status supported; O-C191.
- C-M192: [arrowtip/ergogen_footprints/madeline.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/madeline.js) declares params/body; current nets [], legacy nets []; status supported; O-C192.
- C-M193: [arrowtip/ergogen_footprints/my_button.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_button.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C193.
- C-M194: [arrowtip/ergogen_footprints/my_choc-mx-hotswap.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_choc-mx-hotswap.js) declares params/body; current nets [in,out,inout], legacy nets []; status supported; O-C194.
- C-M195: [arrowtip/ergogen_footprints/my_diode.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C195.
- C-M196: [arrowtip/ergogen_footprints/my_mountinghole.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_mountinghole.js) declares params/body; current nets [], legacy nets []; status supported; O-C196.
- C-M197: [arrowtip/ergogen_footprints/my_mx-prerouted.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_mx-prerouted.js) declares params/body; current nets [in,out,inout], legacy nets []; status supported; O-C197.
- C-M198: [arrowtip/ergogen_footprints/my_nice-elite.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_nice-elite.js) declares params/body; current nets [B_PLUS,GND,RST,VCC,D21,D20,D19,D18,D15,D14,D16,D10,D1,D0,D2,D3,D4,D5,D6,D7,D8,D9,P1_01,P1_02,P1_07,E_F0,E_F1], legacy nets []; status supported; O-C198.
- C-M199: [arrowtip/ergogen_footprints/my_nice-nano.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_nice-nano.js) declares params/body; current nets [B_PLUS,GND,RST,VCC,D21,D20,D19,D18,D15,D14,D16,D10,D1,D0,D2,D3,D4,D5,D6,D7,D8,D9,P1_01,P1_02,P1_07], legacy nets []; status supported; O-C199.
- C-M200: [arrowtip/ergogen_footprints/my_promicro.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_promicro.js) declares params/body; current nets [RAW,GND,RST,VCC,F4,F5,F6,F7,B1,B3,B2,B6,D3,D2,D1,D0,D4,C6,D7,E6,B4,B5], legacy nets []; status supported; O-C200.
- C-M201: [arrowtip/ergogen_footprints/my_resistor.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_resistor.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C201.
- C-M202: [arrowtip/ergogen_footprints/my_scrollwheel.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_scrollwheel.js) declares params/body; current nets [from,to,A,B,C,D], legacy nets []; status supported; O-C202.
- C-M203: [arrowtip/ergogen_footprints/my_switch.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_switch.js) declares params/body; current nets [A,B,C,X,Y,Z], legacy nets []; status supported; O-C203.
- C-M204: [arrowtip/ergogen_footprints/my_threeway_jumper.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_threeway_jumper.js) declares params/body; current nets [from,to_a,to_b], legacy nets []; status supported; O-C204.
- C-M205: [arrowtip/ergogen_footprints/my_tps65.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_tps65.js) declares params/body; current nets [rdy,nrst,gnd,v_in,scl,sda], legacy nets []; status supported; O-C205.
- C-M206: [arrowtip/ergogen_footprints/my_trrs.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_trrs.js) declares params/body; current nets [A,B,C,D], legacy nets []; status supported; O-C206.
- C-M207: [arrowtip/ergogen_footprints/my_version.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_version.js) declares params/body; current nets [], legacy nets []; status supported; O-C207.
- C-M208: [arrowtip/ergogen_footprints/my_ws2812.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_ws2812.js) declares params/body; current nets [VCC,dout,GND,din], legacy nets []; status supported; O-C208.
- C-M209: [arrowtip/ergogen_footprints/shadow.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/shadow.js) declares params/body; current nets [], legacy nets []; status supported; O-C209.
- C-M210: [arrowtip/ergogen_footprints/winged-berry.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/winged-berry.js) declares params/body; current nets [], legacy nets []; status supported; O-C210.
- C-M211: [dieseltravis/ergogen-footprints-travis/Alps-EC10E1220501.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/Alps-EC10E1220501.js) declares params/body; current nets [P1,P2,P3,P4], legacy nets []; status supported; O-C211.
- C-M212: [dieseltravis/ergogen-footprints-travis/CDiscD38W26P25.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CDiscD38W26P25.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C212.
- C-M213: [dieseltravis/ergogen-footprints-travis/CDiscD47W25P5.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CDiscD47W25P5.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C213.
- C-M214: [dieseltravis/ergogen-footprints-travis/CRadialD63H11P25.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CRadialD63H11P25.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C214.
- C-M215: [dieseltravis/ergogen-footprints-travis/CSMD_0805_2012Metric.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CSMD_0805_2012Metric.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C215.
- C-M216: [dieseltravis/ergogen-footprints-travis/CSMD_1206_3216Metric.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CSMD_1206_3216Metric.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C216.
- C-M217: [dieseltravis/ergogen-footprints-travis/CSMD_D63xL77.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CSMD_D63xL77.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C217.
- C-M218: [dieseltravis/ergogen-footprints-travis/DIP16W762.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/DIP16W762.js) declares params/body; current nets [p01,p02,p03,p04,p05,p06,p07,p08,p09,p10,p11,p12,p13,p14,p15,p16], legacy nets []; status supported; O-C218.
- C-M219: [dieseltravis/ergogen-footprints-travis/DSMD_1206_3216Metric.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/DSMD_1206_3216Metric.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C219.
- C-M220: [dieseltravis/ergogen-footprints-travis/Keebio-I2C_Breakout.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/Keebio-I2C_Breakout.js) declares params/body; current nets [P1,P2,P3,P4], legacy nets []; status supported; O-C220.
- C-M221: [dieseltravis/ergogen-footprints-travis/KiCad-Logo5Copper.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/KiCad-Logo5Copper.js) declares params/body; current nets [], legacy nets []; status supported; O-C221.
- C-M222: [dieseltravis/ergogen-footprints-travis/MX_Stabilizer_Cutout-2u.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/MX_Stabilizer_Cutout-2u.js) declares params/body; current nets [], legacy nets []; status supported; O-C222.
- C-M223: [dieseltravis/ergogen-footprints-travis/OSHW-Symbol67x6Copper.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/OSHW-Symbol67x6Copper.js) declares params/body; current nets [], legacy nets []; status supported; O-C223.
- C-M224: [dieseltravis/ergogen-footprints-travis/RAxialL6D25P10H.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/RAxialL6D25P10H.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C224.
- C-M225: [dieseltravis/ergogen-footprints-travis/SWPUSH6H43.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/SWPUSH6H43.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C225.
- C-M226: [dieseltravis/ergogen-footprints-travis/ScottoKeebs-Arduino_Pro_Micro.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-Arduino_Pro_Micro.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22,P23,P24], legacy nets []; status supported; O-C226.
- C-M227: [dieseltravis/ergogen-footprints-travis/ScottoKeebs-Diode_DO-35.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-Diode_DO-35.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C227.
- C-M228: [dieseltravis/ergogen-footprints-travis/ScottoKeebs-RP2040_Pro_Micro.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-RP2040_Pro_Micro.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22,P23,P24,P25,P26,P27,P28,P29,P30,P31], legacy nets []; status supported; O-C228.
- C-M229: [dieseltravis/ergogen-footprints-travis/ScottoKeebs-Stabilizer_MX_2u.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-Stabilizer_MX_2u.js) declares params/body; current nets [], legacy nets []; status supported; O-C229.
- C-M230: [dieseltravis/ergogen-footprints-travis/Symbol_Danger_Copper_Small.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/Symbol_Danger_Copper_Small.js) declares params/body; current nets [], legacy nets []; status supported; O-C230.
- C-M231: [dieseltravis/ergogen-footprints-travis/USB_C_Receptacle_GCT_USB4085.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/USB_C_Receptacle_GCT_USB4085.js) declares params/body; current nets [A1,A4,A5,A6,A7,A8,A9,A12,B9,B7,B8,B12,B5,B4,B1,B6,S1], legacy nets []; status supported; O-C231.
- C-M232: [dieseltravis/ergogen-footprints-travis/ec11.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ec11.js) declares params/body; current nets [from,to,A,B,C], legacy nets []; status supported; O-C232.
- C-M233: [dieseltravis/ergogen-footprints-travis/ergogen.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ergogen.js) declares params/body; current nets [], legacy nets []; status supported; O-C233.
- C-M234: [dieseltravis/ergogen-footprints-travis/evqwgd001.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/evqwgd001.js) declares params/body; current nets [from,to,A,B,C,D], legacy nets []; status supported; O-C234.
- C-M235: [dieseltravis/ergogen-footprints-travis/key-module.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/key-module.js) declares params/body; current nets [name,colnet,rownet,led_this,led_next,power,gnd], legacy nets []; status supported; O-C235.
- C-M236: [dieseltravis/ergogen-footprints-travis/led_sk6803mini-e.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/led_sk6803mini-e.js) declares params/body; current nets [P3,P4,P1,P2], legacy nets []; status supported; O-C236.
- C-M237: [dieseltravis/ergogen-footprints-travis/led_sk6812mini-e.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/led_sk6812mini-e.js) declares params/body; current nets [P1,P2,P3,P4], legacy nets []; status supported; O-C237.
- C-M238: [dieseltravis/ergogen-footprints-travis/mountinghole.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/mountinghole.js) declares legacy nets+params; current nets [], legacy nets [net]; status supported; O-C238.
- C-M239: [dieseltravis/ergogen-footprints-travis/mx.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/mx.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C239.
- C-M240: [dieseltravis/ergogen-footprints-travis/roc.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/roc.js) declares params/body; current nets [], legacy nets []; status supported; O-C240.
- C-M241: [dieseltravis/ergogen-footprints-travis/switch_mx.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/switch_mx.js) declares params/body; current nets [from,to,CENTERHOLE,LEFTSTAB,RIGHTSTAB], legacy nets []; status supported; O-C241.
- C-M242: [dieseltravis/ergogen-footprints-travis/text.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C242.
- C-M243: [dieseltravis/ergogen-footprints-travis/travis.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/travis.js) declares params/body; current nets [], legacy nets []; status supported; O-C243.
- C-M244: [dieseltravis/ergogen-footprints-travis/xiao-ble.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/xiao-ble.js) declares params/body; current nets [P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,RAW3V3,GND,RAW5V], legacy nets []; status supported; O-C244.
- C-M245: [ezxzeng/ergogen_footprints/b3u1000p.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/b3u1000p.js) declares params/body; current nets [r1,r2], legacy nets []; status supported; O-C245.
- C-M246: [ezxzeng/ergogen_footprints/jstph_reversible.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/jstph_reversible.js) declares params/body; current nets [pos,neg], legacy nets []; status supported; O-C246.
- C-M247: [ezxzeng/ergogen_footprints/key-switches.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/key-switches.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C247.
- C-M248: [ezxzeng/ergogen_footprints/mountinghole.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/mountinghole.js) declares legacy nets+params; current nets [], legacy nets [net]; status supported; O-C248.
- C-M249: [ezxzeng/ergogen_footprints/promicro-pretty.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/promicro-pretty.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C249.
- C-M250: [ezxzeng/ergogen_footprints/reset_button.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/reset_button.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C250.
- C-M251: [ezxzeng/ergogen_footprints/slider_threeway.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/slider_threeway.js) declares params/body; current nets [from,left,right], legacy nets []; status supported; O-C251.
- C-M252: [ezxzeng/ergogen_footprints/text.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C252.
- C-M253: [harshitgoel96/ergogen_footprints/fh12_12.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/fh12_12.js) declares params/body; current nets [GND,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12], legacy nets []; status supported; O-C253.
- C-M254: [harshitgoel96/ergogen_footprints/m3_mounting.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/m3_mounting.js) declares params/body; current nets [GND], legacy nets []; status supported; O-C254.
- C-M255: [harshitgoel96/ergogen_footprints/mx_socket_mxlp_choc.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/mx_socket_mxlp_choc.js) declares params/body; current nets [SCK,VCC,GND,CS,from,to], legacy nets []; status supported; O-C255.
- C-M256: [harshitgoel96/ergogen_footprints/r_0805.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/r_0805.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C256.
- C-M257: [helgederenthal/ergogen-footprints/elite-c.js](https://github.com/helgederenthal/ergogen-footprints/blob/84567480106c3a7a7ed2350b34f0c46ea0e587ce/elite-c.js) declares params/body; current nets [D3,D2,D1,D0,D4,C6,D7,E6,B4,B5,B0,F4,F5,F6,F7,B1,B3,B2,B6,VBUS,GND,RST,VCC,B7,D5,C7,F1,F0], legacy nets []; status supported; O-C257.
- C-M258: [helgederenthal/ergogen-footprints/switch_choc_v1_v2.js](https://github.com/helgederenthal/ergogen-footprints/blob/84567480106c3a7a7ed2350b34f0c46ea0e587ce/switch_choc_v1_v2.js) declares params/body; current nets [from,to,CENTERHOLE,LEFTSTAB,RIGHTSTAB], legacy nets []; status supported; O-C258.
- C-M259: [theb0b12/ergogen-footprints/7mouse_bites.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/7mouse_bites.js) declares params/body; current nets [], legacy nets []; status supported; O-C259.
- C-M260: [theb0b12/ergogen-footprints/chocv1v2b0b.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/chocv1v2b0b.js) declares params/body; current nets [from,to,CENTERHOLE,LEFTSTAB,RIGHTSTAB], legacy nets []; status supported; O-C260.
- C-M261: [theb0b12/ergogen-footprints/cirque.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/cirque.js) declares params/body; current nets [P1,P10,P11,P12,P13,P14,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C261.
- C-M262: [theb0b12/ergogen-footprints/doru-tht.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/doru-tht.js) declares params/body; current nets [P12,P13,P14,P15,P16,P17,P18,P19,P20,P23,P24], legacy nets []; status supported; O-C262.
- C-M263: [theb0b12/ergogen-footprints/haptic.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/haptic.js) declares params/body; current nets [P1,P2,P3,P4,P5], legacy nets []; status supported; O-C263.
- C-M264: [theb0b12/ergogen-footprints/jumper1.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/jumper1.js) declares params/body; current nets [P1,P2], legacy nets []; status supported; O-C264.
- C-M265: [theb0b12/ergogen-footprints/oled2.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/oled2.js) declares params/body; current nets [P1,P2,P3,P4], legacy nets []; status supported; O-C265.
- C-M266: [theb0b12/ergogen-footprints/placeholder.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/placeholder.js) declares params/body; current nets [], legacy nets []; status supported; O-C266.
- C-M267: [theb0b12/ergogen-footprints/rotary.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/rotary.js) declares params/body; current nets [A,B,C,MP,S1,S2], legacy nets []; status supported; O-C267.
- C-M268: [theb0b12/ergogen-footprints/router.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/router.js) declares params/body; current nets [net], legacy nets []; status supported; O-C268.
- C-M269: [theb0b12/ergogen-footprints/seeed-xiao-plus.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/seeed-xiao-plus.js) declares params/body; current nets [D0,D11,D1,D12,D2,D13,D3,D14,D4,D15,D5,BATTERY_LEVEL,D6,VBUS,GND,V3_3,D10,D19,D9,D18,D8,D17,D7,CLK,DIO,RST,BAT_POS,BAT_NEG], legacy nets []; status supported; O-C269.
- C-M270: [theb0b12/ergogen-footprints/shift_reg.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/shift_reg.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16], legacy nets []; status supported; O-C270.
- C-M271: [theb0b12/ergogen-footprints/smd.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/smd.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C271.
- C-M272: [theb0b12/ergogen-footprints/trrs.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/trrs.js) declares params/body; current nets [P1,P2,P3,P4], legacy nets []; status supported; O-C272.
- C-M273: [theb0b12/ergogen-footprints/usbc.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/usbc.js) declares params/body; current nets [A12,A5,A9,B12,B5,B9,SH1,SH2,SH3,SH4], legacy nets []; status supported; O-C273.
- C-M274: [theb0b12/ergogen-footprints/vik_horizontal.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/vik_horizontal.js) declares params/body; current nets [VIK1,VIK2,VIK3,VIK4,VIK5,VIK6,VIK7,VIK8,VIK9,VIK10,VIK11,VIK12], legacy nets []; status supported; O-C274.
- C-M275: [theb0b12/ergogen-footprints/vikout.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/vikout.js) declares params/body; current nets [VIK1,VIK2,VIK3,VIK4,VIK5,VIK6,VIK7,VIK8,VIK9,VIK10,VIK11,VIK12], legacy nets []; status supported; O-C275.
- C-M276: [ykz89/ergogen-footprints/ks27-choc-v1-mx-soldered-and-hotswap.js](https://github.com/ykz89/ergogen-footprints/blob/01c8cd03ff9bd66b283f82c7059b11b7be8ed26f/ks27-choc-v1-mx-soldered-and-hotswap.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C276.
- C-M277: [ykz89/ergogen-footprints/vik-keyboard-connector-horizontal.js](https://github.com/ykz89/ergogen-footprints/blob/01c8cd03ff9bd66b283f82c7059b11b7be8ed26f/vik-keyboard-connector-horizontal.js) declares params/body; current nets [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12], legacy nets []; status supported; O-C277.
- C-M278: [johnlamb/LambBT/ergogen/footprints/b3u1000p.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/b3u1000p.js) declares params/body; current nets [r1,r2], legacy nets []; status supported; O-C278.
- C-M279: [johnlamb/LambBT/ergogen/footprints/bat.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/bat.js) declares params/body; current nets [pos,neg], legacy nets []; status supported; O-C279.
- C-M280: [johnlamb/LambBT/ergogen/footprints/batterypad.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/batterypad.js) declares params/body; current nets [to,from], legacy nets []; status supported; O-C280.
- C-M281: [johnlamb/LambBT/ergogen/footprints/mountinghole.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/mountinghole.js) declares params/body; current nets [], legacy nets []; status supported; O-C281.
- C-M282: [johnlamb/LambBT/ergogen/footprints/pcm12.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/pcm12.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C282.
- C-M283: [johnlamb/LambBT/ergogen/footprints/promicro_pretty.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/promicro_pretty.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C283.
- C-M284: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/battery.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/battery.js) declares params/body; current nets [RAW,GND], legacy nets []; status supported; O-C284.
- C-M285: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/choc.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/choc.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C285.
- C-M286: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/diode.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C286.
- C-M287: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/hole.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/hole.js) declares params/body; current nets [], legacy nets []; status supported; O-C287.
- C-M288: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/jumper.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/jumper.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C288.
- C-M289: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/nicenano.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/nicenano.js) declares params/body; current nets [RAW,GND1,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,GND2,GND3,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C289.
- C-M290: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/niceview.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/niceview.js) declares params/body; current nets [VCC,GND,SDA,SCL,CS], legacy nets []; status supported; O-C290.
- C-M291: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/reset.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/reset.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C291.
- C-M292: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/rotary.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/rotary.js) declares params/body; current nets [from,to,A,B,C], legacy nets []; status supported; O-C292.
- C-M293: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/scrollwheel_mirrored.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/scrollwheel_mirrored.js) declares params/body; current nets [from,to,A,B,C,D], legacy nets []; status supported; O-C293.
- C-M294: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/slider_reversible.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/slider_reversible.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C294.
- C-M295: [dnlbauer/corax-keyboard/corax54/ergogen/footprints/text.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C295.
- C-M296: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/battery.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/battery.js) declares params/body; current nets [RAW,GND], legacy nets []; status supported; O-C296.
- C-M297: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/choc.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/choc.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C297.
- C-M298: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/diode.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C298.
- C-M299: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/hole.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/hole.js) declares params/body; current nets [], legacy nets []; status supported; O-C299.
- C-M300: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/jumper.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/jumper.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C300.
- C-M301: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/nicenano.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/nicenano.js) declares params/body; current nets [RAW,GND1,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,GND2,GND3,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C301.
- C-M302: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/niceview.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/niceview.js) declares params/body; current nets [VCC,GND,SDA,SCL,CS], legacy nets []; status supported; O-C302.
- C-M303: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/reset.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/reset.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C303.
- C-M304: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/rotary.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/rotary.js) declares params/body; current nets [from,to,A,B,C], legacy nets []; status supported; O-C304.
- C-M305: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/scrollwheel_mirrored.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/scrollwheel_mirrored.js) declares params/body; current nets [from,to,A,B,C,D], legacy nets []; status supported; O-C305.
- C-M306: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/slider_reversible.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/slider_reversible.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C306.
- C-M307: [dnlbauer/corax-keyboard/corax56/ergogen/footprints/text.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C307.
- C-M308: [unspecworks/gamma-omega/original/ergogen/footprints/VladAndral/pipico.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/VladAndral/pipico.js) declares params/body; current nets [GP0,GP1,GP2,GP3,GP4,GP5,GP6,GP7,GP8,GP9,GP10,GP11,GP12,GP13,GP14,GP15,GP16,GP17,GP18,GP19,GP20,GP21,GP22,GP26,GP27,GP28,RUN,ADC_VREF,V3V3_OUT,V3V3_EN,VSYS,VBUS,GND,AGND,SWCLK,SWDIO], legacy nets []; status supported; O-C308.
- C-M309: [unspecworks/gamma-omega/original/ergogen/footprints/hesse_logo.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/hesse_logo.js) declares params/body; current nets [], legacy nets []; status supported; O-C309.
- C-M310: [unspecworks/gamma-omega/original/ergogen/footprints/reset_switch_1825027-8.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/reset_switch_1825027-8.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C310.
- C-M311: [unspecworks/gamma-omega/original/ergogen/footprints/tc36k_logo.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/tc36k_logo.js) declares params/body; current nets [], legacy nets []; status supported; O-C311.
- C-M312: [unspecworks/gamma-omega/original/ergogen/footprints/unspecworks/diode_tht.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/unspecworks/diode_tht.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C312.
- C-M313: [unspecworks/gamma-omega/original/ergogen/footprints/unspecworks/pico_oneside.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/unspecworks/pico_oneside.js) declares params/body; current nets [P0,VB,P1,VS,GND,P2,P23,P3,V3,P4,P29,P5,P28,GND,P6,P27,P7,P26,P8,RUN,P9,P22,GND,P10,P21,P11,P20,P12,P19,P13,P18,GND,P14,P17,P15,P16], legacy nets []; status supported; O-C313.
- C-M314: [Narkoleptika/josukey/ergogen/footprints/jst-s2b-ph-kl.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/jst-s2b-ph-kl.js) declares params/body; current nets [pos,neg], legacy nets []; status supported; O-C314.
- C-M315: [Narkoleptika/josukey/ergogen/footprints/keepout.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/keepout.js) declares params/body; current nets [], legacy nets []; status supported; O-C315.
- C-M316: [Narkoleptika/josukey/ergogen/footprints/love.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/love.js) declares params/body; current nets [], legacy nets []; status supported; O-C316.
- C-M317: [Narkoleptika/josukey/ergogen/footprints/pcm12.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/pcm12.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C317.
- C-M318: [Narkoleptika/josukey/ergogen/footprints/peace.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/peace.js) declares params/body; current nets [], legacy nets []; status supported; O-C318.
- C-M319: [Narkoleptika/josukey/ergogen/footprints/promicro_pretty.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/promicro_pretty.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C319.
- C-M320: [Narkoleptika/josukey/ergogen/footprints/route.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/route.js) declares params/body; current nets [net], legacy nets []; status supported; O-C320.
- C-M321: [Narkoleptika/josukey/ergogen/footprints/sk6812mini.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/sk6812mini.js) declares params/body; current nets [din,dout,VCC,GND], legacy nets []; status supported; O-C321.
- C-M322: [Narkoleptika/josukey/ergogen/footprints/sod-123w.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/sod-123w.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C322.
- C-M323: [Narkoleptika/josukey/ergogen/footprints/text.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C323.
- C-M324: [Narkoleptika/josukey/ergogen/footprints/via.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/via.js) declares params/body; current nets [net], legacy nets []; status supported; O-C324.
- C-M325: [Narkoleptika/josukey/ergogen/footprints/wuerth-434121025816.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/wuerth-434121025816.js) declares params/body; current nets [r1,r2], legacy nets []; status supported; O-C325.
- C-M326: [soundmonster/samoklava/footprints/promicro_flippable.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/promicro_flippable.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9], legacy nets []; status supported; O-C326.
- C-M327: [soundmonster/samoklava/footprints/reset_button.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/reset_button.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C327.
- C-M328: [soundmonster/samoklava/footprints/slider_threeway.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/slider_threeway.js) declares params/body; current nets [from,left,right], legacy nets []; status supported; O-C328.
- C-M329: [soundmonster/samoklava/footprints/text.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/text.js) declares params/body; current nets [], legacy nets []; status supported; O-C329.
- C-M330: [soundmonster/samoklava/footprints/trrs_tight.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/trrs_tight.js) declares params/body; current nets [A,B,C,D], legacy nets []; status supported; O-C330.
- C-M331: [thrly/tempest/ergogen/footprints/ceoloide/battery_connector_jst_ph_2.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/battery_connector_jst_ph_2.js) declares params/body; current nets [BAT_P,BAT_N], legacy nets []; status supported; O-C331.
- C-M332: [thrly/tempest/ergogen/footprints/ceoloide/diode_tht_sod123.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/diode_tht_sod123.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C332.
- C-M333: [thrly/tempest/ergogen/footprints/ceoloide/display_nice_view.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/display_nice_view.js) declares params/body; current nets [MOSI,SCK,VCC,GND,CS], legacy nets []; status supported; O-C333.
- C-M334: [thrly/tempest/ergogen/footprints/ceoloide/mcu_nice_nano.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/mcu_nice_nano.js) declares params/body; current nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9,P101,P102,P107], legacy nets []; status supported; O-C334.
- C-M335: [thrly/tempest/ergogen/footprints/ceoloide/mounting_hole_npth.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/mounting_hole_npth.js) declares params/body; current nets [], legacy nets []; status supported; O-C335.
- C-M336: [thrly/tempest/ergogen/footprints/ceoloide/mounting_hole_plated.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/mounting_hole_plated.js) declares params/body; current nets [], legacy nets []; status supported; O-C336.
- C-M337: [thrly/tempest/ergogen/footprints/ceoloide/power_switch_smd_side.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/power_switch_smd_side.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C337.
- C-M338: [thrly/tempest/ergogen/footprints/ceoloide/reset_switch_smd_side.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/reset_switch_smd_side.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C338.
- C-M339: [thrly/tempest/ergogen/footprints/ceoloide/switch_choc_v1_v2.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/switch_choc_v1_v2.js) declares params/body; current nets [from,to,CENTERHOLE,LEFTSTAB,RIGHTSTAB], legacy nets []; status supported; O-C339.
- C-M340: [thrly/tempest/ergogen/footprints/ceoloide/utility_text.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/utility_text.js) declares params/body; current nets [], legacy nets []; status supported; O-C340.
- C-M341: [rschenk/tern/ergogen/footprints/better_diode.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/better_diode.js) declares params/body; current nets [from,to], legacy nets []; status supported; O-C341.
- C-M342: [rschenk/tern/ergogen/footprints/choc_bonus_goodies.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/choc_bonus_goodies.js) declares params/body; current nets [], legacy nets []; status supported; O-C342.
- C-M343: [rschenk/tern/ergogen/footprints/mountinghole.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/mountinghole.js) declares params/body; current nets [], legacy nets []; status supported; O-C343.
- C-M344: [rschenk/tern/ergogen/footprints/xiao.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/xiao.js) declares params/body; current nets [P0,P1,P2,P3,P4,P5,P6,VUSB,GND,VCC,P10,P9,P8,P7,RST,BATP], legacy nets []; status supported; O-C344.
- C-M345: [Albert-IV/ergogen-contrib/src/footprints/promicro_pretty.js](https://github.com/Albert-IV/ergogen-contrib/blob/956da989b56c0950b704d91bed69bb7ec233098a/src/footprints/promicro_pretty.js) declares legacy nets+params; current nets [], legacy nets [RAW,GND,RST,VCC,P21,P20,P19,P18,P15,P14,P16,P10,P1,P0,P2,P3,P4,P5,P6,P7,P8,P9]; status supported; O-C345.
- C-M346: [Albert-IV/ergogen-contrib/src/footprints/tentingpuck.js](https://github.com/Albert-IV/ergogen-contrib/blob/956da989b56c0950b704d91bed69bb7ec233098a/src/footprints/tentingpuck.js) declares legacy nets+params; current nets [], legacy nets []; status supported; O-C346.

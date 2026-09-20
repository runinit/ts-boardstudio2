# Master Ergogen footprint catalogue

Research snapshot: 20 September 2026. Source pins and verification limits are explicit.

## How to use this list

**346 statically recognized source records across 27 repositories containing Ergogen modules**, from 34 inspected repositories. There are 306 unique exact file hashes. These are DERIVED counts from the pinned [source inventory](catalogue.json), not a count of independent designs or approved footprints. Exact-hash duplicates are retained as separate source records; no canonical-alias field is inferred. [CSV](catalogue.csv) includes exact paths, hashes, selected interfaces and immutable source links.

The [existing-footprint audit](AUDIT.md) contains actual local pad mappings and confirmed failures. External entries below are **source-inventoried, not electrically or mechanically qualified**. A declared flag is not evidence that all its combinations work. No local library was expanded or replaced.

The count includes physical components plus graphics, logos, text, mounting aids, keepouts, zones, routing and debugging utilities. There are 26 third-party repositories with records plus the official Ergogen repository (27 total), and 7 context-only repositories. Of 346 records, 334 have the current `params/body` shape and 12 declare legacy top-level `nets`; shape recognition is not runtime support. Local supplementary BHK/custom/catalogue registrations are scoped in the audit rather than presented as newly sourced GitHub libraries.

## Repository shortlist and popularity

Stars/forks are MEASURED GitHub API snapshots on 2026-09-20; the list includes broadly used board projects as well as specialist low-star libraries. It is a discovery ranking, not a quality ranking or a claim to cover every GitHub repository. Repository popularity does not transfer to an individual copied footprint. Pins below identify inspected content; push timestamps describe repository activity, which may occur on another branch. [Metadata ledger](repository-metadata.json)

| Repository / inspected pin | Stars / forks | Ergogen modules | Repository notice / review status |
|---|---:|---:|---|
| [ergogen/ergogen](https://github.com/ergogen/ergogen/tree/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37) · 8286e18f | 1573 / 396 | 18 | MIT repository label; file review required |
| [soundmonster/samoklava](https://github.com/soundmonster/samoklava/tree/a23bf7180eb31e970980c9d20f7c0d886c5032da) · a23bf718 | 389 / 201 | 5 | MIT repository label; file review required |
| [tapioki/cephalopoda](https://github.com/tapioki/cephalopoda/tree/99edfc77033b527f430f8fdb3a7f4530b2e5931f) · 99edfc77 | 240 / 25 | 0 | GPL-3.0 repository label; file review required |
| [Dwctor/Kaly](https://github.com/Dwctor/Kaly/tree/125add8da1050b8a660a39b3761b20304b42fd19) · 125add8d | 232 / 11 | 0 | Apache-2.0 repository label; file review required |
| [dnlbauer/corax-keyboard](https://github.com/dnlbauer/corax-keyboard/tree/7e01724621f12f1c1099f78c978bcb6aca19b795) · 7e017246 | 143 / 13 | 24 | MIT repository label; file review required |
| [mrzealot/absolem](https://github.com/mrzealot/absolem/tree/5f25251cb5a6779091e2a10b2a081946ad0228a9) · 5f25251c | 130 / 16 | 0 | MIT repository label; file review required |
| [ceoloide/ergogen-footprints](https://github.com/ceoloide/ergogen-footprints/tree/48935f54b456ff1503d78d6b17d9d146b54e8ade) · 48935f54 | 129 / 35 | 24 | Mixed per-file MIT / CC-BY-NC-SA; inspect each header |
| [rschenk/tern](https://github.com/rschenk/tern/tree/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a) · 02445d5e | 104 / 2 | 4 | MIT repository label; file review required |
| [thrly/tempest](https://github.com/thrly/tempest/tree/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a) · 8d1ced10 | 95 / 10 | 10 | Unknown / no recognized repository grant |
| [unspecworks/gamma-omega](https://github.com/unspecworks/gamma-omega/tree/840f3c9c7454f699907d58289f54927d6d18ca69) · 840f3c9c | 82 / 10 | 6 | CERN-OHL-W-2.0 repository label; file review required |
| [johnlamb/LambBT](https://github.com/johnlamb/LambBT/tree/c127665660b2f8adc8632cb89790d27262cc3549) · c1276656 | 76 / 7 | 6 | CC0-1.0 repository label; file review required |
| [rwalkr/eskarp](https://github.com/rwalkr/eskarp/tree/d0d32b01d4a3259e5836377b3615694e524b9dd6) · d0d32b01 | 70 / 6 | 0 | MIT repository label; file review required |
| [50an6xy06r6n/keyboard_reversible.pretty](https://github.com/50an6xy06r6n/keyboard_reversible.pretty/tree/3d81455844004524e8221a14f25080c6d08a2e92) · 3d814558 | 69 / 0 | 0 | MIT in pinned LICENSE; derived-file review required |
| [infused-kim/kb_ergogen_fp](https://github.com/infused-kim/kb_ergogen_fp/tree/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612) · bb80a207 | 62 / 8 | 15 | LICENSE BY-NC-SA; README inconsistency |
| [bubbleology/UT22](https://github.com/bubbleology/UT22/tree/40ae664423ce529572001c6476f72c6ce1a4965e) · 40ae6644 | 52 / 2 | 0 | CC BY-NC-SA4.0 stated in pinned README; artwork/file scope review |
| [Narkoleptika/josukey](https://github.com/Narkoleptika/josukey/tree/15bfa535a9876d95c239333d4debe53209aa4b46) · 15bfa535 | 45 / 18 | 12 | MIT repository label; file review required |
| [Pipshag/goosekb](https://github.com/Pipshag/goosekb/tree/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9) · ed0fef52 | 22 / 2 | 8 | Unknown / no recognized repository grant |
| [ImStuBTW/ergogen-v4-footprints](https://github.com/ImStuBTW/ergogen-v4-footprints/tree/be2f02dd05ba3648b0366d443c7342c3a892d70c) · be2f02dd | 13 / 1 | 9 | Unknown / no recognized repository grant |
| [Virginia2244/ergogen_footprints](https://github.com/Virginia2244/ergogen_footprints/tree/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb) · e1e630d3 | 9 / 1 | 11 | MIT repository label; file review required |
| [Albert-IV/ergogen-contrib](https://github.com/Albert-IV/ergogen-contrib/tree/956da989b56c0950b704d91bed69bb7ec233098a) · 956da989 | 8 / 1 | 2 | No detected license; provenance only |
| [CardboardMechanic/ergogen_footprints](https://github.com/CardboardMechanic/ergogen_footprints/tree/36ad629b3bc4595cfb34bc5cc74787305ec58e2d) · 36ad629b | 4 / 0 | 14 | README / LICENSE conflict; file-specific notices |
| [larssont/ergogen-footprints](https://github.com/larssont/ergogen-footprints/tree/708940922192a481cd40c6cef9ae80de49a9e104) · 70894092 | 2 / 0 | 11 | MIT repository label; file review required |
| [AlexSutila/ergogen-footprints](https://github.com/AlexSutila/ergogen-footprints/tree/eaf27a762721f650575860a2370b6637b1e994d3) · eaf27a76 | 1 / 0 | 2 | Unknown / no recognized repository grant |
| [harshitgoel96/ergogen_footprints](https://github.com/harshitgoel96/ergogen_footprints/tree/d569c92090e56dda30fa4d4ed54f65d76980d47e) · d569c920 | 1 / 0 | 4 | Unknown / no recognized repository grant |
| [Woovie/ergogen-footprints](https://github.com/Woovie/ergogen-footprints/tree/866855aaa77f9f65cdbeceeb8a87d32d6f763264) · 866855aa | 0 / 0 | 0 | MIT repository label; file review required |
| [jusdisgi/ergogen-footprints](https://github.com/jusdisgi/ergogen-footprints/tree/ce4311a3b015955fee098d121700e3c9712ef7e0) · ce4311a3 | 0 / 0 | 26 | Unknown / no recognized repository grant |
| [lapidot/ergogenFootprintCollection](https://github.com/lapidot/ergogenFootprintCollection/tree/c2ba34bdb510effebaea448ed5e387543b1796dd) · c2ba34bd | 0 / 0 | 30 | MIT repository label; file review required |
| [AminKAli/ergogen_footprints](https://github.com/AminKAli/ergogen_footprints/tree/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7) · 4fc8c27e | 0 / 0 | 19 | Unknown / no recognized repository grant |
| [arrowtip/ergogen_footprints](https://github.com/arrowtip/ergogen_footprints/tree/43d5965ddf7309cd5b72e2fb5b493e066631f958) · 43d5965d | 0 / 0 | 23 | MIT repository label; file review required |
| [dieseltravis/ergogen-footprints-travis](https://github.com/dieseltravis/ergogen-footprints-travis/tree/df3c65141193792656b296784576ef918283c09b) · df3c6514 | 0 / 0 | 34 | MIT repository label; file review required |
| [ezxzeng/ergogen_footprints](https://github.com/ezxzeng/ergogen_footprints/tree/9811c4d85a8e208ac0709f2da583645530be8fe2) · 9811c4d8 | 0 / 0 | 8 | Unknown / no recognized repository grant |
| [helgederenthal/ergogen-footprints](https://github.com/helgederenthal/ergogen-footprints/tree/84567480106c3a7a7ed2350b34f0c46ea0e587ce) · 84567480 | 0 / 0 | 2 | GPL-3.0 repository label; file review required |
| [theb0b12/ergogen-footprints](https://github.com/theb0b12/ergogen-footprints/tree/ca9a6555edee93f383c81f7c76e2adfb5f449c2d) · ca9a6555 | 0 / 0 | 17 | AGPL-3.0 repository label; file review required |
| [ykz89/ergogen-footprints](https://github.com/ykz89/ergogen-footprints/tree/01c8cd03ff9bd66b283f82c7059b11b7be8ed26f) · 01c8cd03 | 0 / 0 | 2 | MIT repository label; file review required |

## Suggested qualification order

1. Repair and qualify the existing ceoloide/infused variants before adding overlapping replacements. Both source pins matched their inspected upstream heads; known defects remain in those pins.
2. Use the official Ergogen builtins as a baseline interface reference. Source syntax and older community APIs still require compatibility checks against Board Studio’s engine.
3. Prioritize a concrete missing package, then review candidates: Virginia2244 for additional MCUs; ImStuBTW for XIAO/GBA/low-profile controls; jusdisgi for connectors/displays/XIAO variants; larssont for specialist sensors/audio; dieseltravis for converted discrete/connector footprints. These are filename/source coverage recommendations, not preferred fabrication suppliers.
4. Treat project-embedded copies as lineage evidence. Corax54/56 duplicate files should be aliases; Tempest explicitly modifies borrowed ceoloide files; Albert-IV ProMicro lineage has unresolved licensing.

## Compatibility fields

`side`, `reverse`, `reversible`, and `reverse_mount` are listed separately. Values below are literal declared defaults. An absent control means it was not declared in the inspected `params` object; it does not imply the footprint cannot be mounted on the other side. `nets+params` marks an older API needing migration/review. Net-parameter names are interfaces, **not** verified physical pin maps. Full parameter expressions are retained in JSON; code is statically parsed and external modules are not executed.

The selected control columns track only: `side`, `reverse`, `reversible`, `reverse_mount`, `hotswap`, `solder`, `include_traces`, `include_traces_vias`, and `hotswap_pads_same_side`. Other controls may exist in full `params` in JSON. Legacy top-level `nets` is not consumed by the current engine; those entries require migration and individual testing.

### CSV schema

`repo`: owner/name; `sha`: immutable Git commit; `path`: file at that commit; `sha256`: exact file-byte hash; `contract`: detected module shape; `netParams`: current declared net names; `legacyNetParams`: old top-level net declarations; `controls`: JSON object of selected literal defaults; `fileLicense`: detected SPDX header or empty/unknown; `url`: immutable source; `verification`: source-inventory scope. Full parameter expressions are in JSON, not CSV.

## Find candidates by component

These are search entry points, not validated package equivalences. Use the linked full file and the audit before choosing one.

| Need | Source territories to inspect |
|---|---|
| MX / Choc / KS27–KS33 switches | ceoloide; infused-kim; Virginia2244; ykz89; Corax; dieseltravis |
| ProMicro / nice!nano / SuperMini | ceoloide; infused-kim; official Ergogen; Albert-IV lineage; Samoklava |
| XIAO / RP2040 / Pico / Elite-C | ImStuBTW; Virginia2244; GooseKB; jusdisgi; AlexSutila; Tern |
| Encoders / scroll / pointing / haptics | ImStuBTW; larssont; CardboardMechanic; AminKAli; theb0b12; Corax |
| LED / diode / passive arrays | official Ergogen; ceoloide; infused-kim; jusdisgi; dieseltravis |
| Battery / TRRS / USB / FPC / VIK connectors | ceoloide; infused-kim; jusdisgi; harshitgoel96; ykz89; theb0b12 |
| Displays | ceoloide; infused-kim; jusdisgi; lapidot; theb0b12 |
| Mechanical / artwork / routing utilities | ceoloide; infused-kim; arrowtip; AminKAli; dieseltravis |

## Repository navigation

- [Pipshag/goosekb](#pipshaggoosekb)
- [ceoloide/ergogen-footprints](#ceoloideergogen-footprints)
- [ergogen/ergogen](#ergogenergogen)
- [AlexSutila/ergogen-footprints](#alexsutilaergogen-footprints)
- [CardboardMechanic/ergogen_footprints](#cardboardmechanicergogen_footprints)
- [ImStuBTW/ergogen-v4-footprints](#imstubtwergogen-v4-footprints)
- [Virginia2244/ergogen_footprints](#virginia2244ergogen_footprints)
- [jusdisgi/ergogen-footprints](#jusdisgiergogen-footprints)
- [lapidot/ergogenFootprintCollection](#lapidotergogenfootprintcollection)
- [larssont/ergogen-footprints](#larssontergogen-footprints)
- [infused-kim/kb_ergogen_fp](#infused-kimkb_ergogen_fp)
- [AminKAli/ergogen_footprints](#aminkaliergogen_footprints)
- [arrowtip/ergogen_footprints](#arrowtipergogen_footprints)
- [dieseltravis/ergogen-footprints-travis](#dieseltravisergogen-footprints-travis)
- [ezxzeng/ergogen_footprints](#ezxzengergogen_footprints)
- [harshitgoel96/ergogen_footprints](#harshitgoel96ergogen_footprints)
- [helgederenthal/ergogen-footprints](#helgederenthalergogen-footprints)
- [theb0b12/ergogen-footprints](#theb0b12ergogen-footprints)
- [ykz89/ergogen-footprints](#ykz89ergogen-footprints)
- [johnlamb/LambBT](#johnlamblambbt)
- [dnlbauer/corax-keyboard](#dnlbauercorax-keyboard)
- [unspecworks/gamma-omega](#unspecworksgamma-omega)
- [Narkoleptika/josukey](#narkoleptikajosukey)
- [soundmonster/samoklava](#soundmonstersamoklava)
- [thrly/tempest](#thrlytempest)
- [rschenk/tern](#rschenktern)
- [Albert-IV/ergogen-contrib](#albert-ivergogen-contrib)

## Complete module register

### Pipshag/goosekb

[Source tree](https://github.com/Pipshag/goosekb/tree/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9) · revision `ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [footprints/custom/combo_diode.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/combo_diode.js) | from, to | side="B"; reversible=false |
| [footprints/custom/mounting_hole.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/mounting_hole.js) | No declared net interface identified | None of the selected fields declared |
| [footprints/custom/mx.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/mx.js) | from, to | hotswap=false; reverse=false |
| [footprints/custom/pads.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/pads.js) | net_1, net_2, net_3, net_4, net_5, net_6 | side="F"; reverse=true |
| [footprints/custom/text.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/text.js) | No declared net interface identified | side="F"; reverse=false |
| [footprints/custom/xiao_ble.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/xiao_ble.js) | P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, RAW3V3, GND, RAW5V, BATP, BATN, RST, CLK, DIO, NFC0, NFC1 | side="F" |
| [footprints/custom/xiao_ble_smd_reversible.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/xiao_ble_smd_reversible.js) | D0, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, _3V3, GND, _5V, RST, BATP | None of the selected fields declared |
| [footprints/custom/xiao_reverse.js](https://github.com/Pipshag/goosekb/blob/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9/footprints/custom/xiao_reverse.js) | No declared net interface identified | None of the selected fields declared |

### ceoloide/ergogen-footprints

[Source tree](https://github.com/ceoloide/ergogen-footprints/tree/48935f54b456ff1503d78d6b17d9d146b54e8ade) · revision `48935f54b456ff1503d78d6b17d9d146b54e8ade` · Mixed per-file MIT / CC-BY-NC-SA; inspect each header.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [battery_connector_jst_ph_2.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/battery_connector_jst_ph_2.js) | BAT_P, BAT_N | side='F'; reversible=false; include_traces=true |
| [battery_connector_molex_pico_ezmate_1x02.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/battery_connector_molex_pico_ezmate_1x02.js) | BAT_P, BAT_N | side='F'; reversible=false |
| [diode_tht_sod123.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/diode_tht_sod123.js) | from, to | side='B'; reversible=false; include_traces_vias=false |
| [display_nice_view.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/display_nice_view.js) | MOSI, SCK, VCC, GND, CS | side='F'; reversible=false; include_traces=true |
| [display_ssd1306.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/display_ssd1306.js) | SDA, SCL, VCC, GND | side='F'; reversible=false; include_traces=true |
| [led_sk6812mini-e.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/led_sk6812mini-e.js) | P1, P2, P3, P4 | side='B'; reversible=false; reverse_mount=true; include_traces_vias=true |
| [mcu_nice_nano.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mcu_nice_nano.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9, P101, P102, P107 | side='F'; reversible=false; reverse_mount=false; include_traces=true |
| [mcu_supermini_nrf52840.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mcu_supermini_nrf52840.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9, P101, P102, P107 | side='F'; reversible=false; reverse_mount=false; include_traces=true |
| [mounting_hole_npth.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mounting_hole_npth.js) | No declared net interface identified | side='F' |
| [mounting_hole_plated.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/mounting_hole_plated.js) | No declared net interface identified | side='F' |
| [power_switch_smd_side.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/power_switch_smd_side.js) | from, to | side='F'; reversible=false |
| [reset_switch_smd_side.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/reset_switch_smd_side.js) | from, to | side='F'; reversible=false |
| [reset_switch_tht_top.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/reset_switch_tht_top.js) | from, to | side='F'; reversible=false |
| [rotary_encoder_ec11_ec12.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/rotary_encoder_ec11_ec12.js) | S1, S2, A, B, C | side='F'; reversible=false |
| [switch_choc_v1_v2.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/switch_choc_v1_v2.js) | from, to, CENTERHOLE, LEFTSTAB, RIGHTSTAB | side='B'; reversible=false; hotswap_pads_same_side=false; include_traces_vias=true; hotswap=true; solder=false |
| [switch_gateron_ks27_ks33.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/switch_gateron_ks27_ks33.js) | from, to, CENTERHOLE | side='B'; reversible=false; solder=true; hotswap=true |
| [switch_mx.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/switch_mx.js) | from, to, CENTERHOLE, LEFTSTAB, RIGHTSTAB | side='B'; reversible=false; hotswap=true; hotswap_pads_same_side=false; include_traces_vias=true; solder=false |
| [trrs_pj320a.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/trrs_pj320a.js) | TP, R1, R2, SL | side='F'; reversible=false |
| [utility_ergogen_logo.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_ergogen_logo.js) | No declared net interface identified | side='F'; reversible=false |
| [utility_filled_zone.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_filled_zone.js) | net | side='F' |
| [utility_keepout_zone.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_keepout_zone.js) | No declared net interface identified | side='F&B' |
| [utility_point_debugger.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_point_debugger.js) | No declared net interface identified | None of the selected fields declared |
| [utility_router.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_router.js) | net | None of the selected fields declared |
| [utility_text.js](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/utility_text.js) | No declared net interface identified | side='F'; reversible=false |

### ergogen/ergogen

[Source tree](https://github.com/ergogen/ergogen/tree/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37) · revision `8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [src/footprints/alps.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/alps.js) | from, to | None of the selected fields declared |
| [src/footprints/button.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/button.js) | from, to | side='F' |
| [src/footprints/choc.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/choc.js) | from, to | hotswap=false; reverse=false |
| [src/footprints/chocmini.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/chocmini.js) | from, to | side='F'; reverse=false |
| [src/footprints/diode.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/diode.js) | from, to | None of the selected fields declared |
| [src/footprints/jstph.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/jstph.js) | pos, neg | side='F' |
| [src/footprints/jumper.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/jumper.js) | from, to | side='F' |
| [src/footprints/mx.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/mx.js) | from, to | hotswap=false; reverse=false |
| [src/footprints/oled.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/oled.js) | VCC, GND, SDA, SCL | side='F' |
| [src/footprints/omron.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/omron.js) | from, to | None of the selected fields declared |
| [src/footprints/pad.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/pad.js) | net | None of the selected fields declared |
| [src/footprints/promicro.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/promicro.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [src/footprints/rgb.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/rgb.js) | din, dout, VCC, GND | side='F' |
| [src/footprints/rotary.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/rotary.js) | from, to, A, B, C | None of the selected fields declared |
| [src/footprints/scrollwheel.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/scrollwheel.js) | from, to, A, B, C, D | reverse=false |
| [src/footprints/slider.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/slider.js) | from, to | side='F' |
| [src/footprints/trrs.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/trrs.js) | A, B, C, D | reverse=false |
| [src/footprints/via.js](https://github.com/ergogen/ergogen/blob/8286e18f18ac064aa6d2ebca9c449bf2f6ba4d37/src/footprints/via.js) | net | None of the selected fields declared |

### AlexSutila/ergogen-footprints

[Source tree](https://github.com/AlexSutila/ergogen-footprints/tree/eaf27a762721f650575860a2370b6637b1e994d3) · revision `eaf27a762721f650575860a2370b6637b1e994d3` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [pipicow.js](https://github.com/AlexSutila/ergogen-footprints/blob/eaf27a762721f650575860a2370b6637b1e994d3/pipicow.js) | GND, VBUS, VSYS, EN_3V3, OUT_3V3, ADC_VREF, AGND, RUN, GP0, GP1, GP2, GP3, GP4, GP5, GP6, GP7, GP8, GP9, GP10, GP11, GP12, GP13, GP14, GP15, GP16, GP17, GP18, GP19, GP20, GP21, GP22, GP26, GP27, GP28 | None of the selected fields declared |
| [uxcell-jack.js](https://github.com/AlexSutila/ergogen-footprints/blob/eaf27a762721f650575860a2370b6637b1e994d3/uxcell-jack.js) | HOLEA, HOLEB, HOLEC | None of the selected fields declared |

### CardboardMechanic/ergogen_footprints

[Source tree](https://github.com/CardboardMechanic/ergogen_footprints/tree/36ad629b3bc4595cfb34bc5cc74787305ec58e2d) · revision `36ad629b3bc4595cfb34bc5cc74787305ec58e2d` · README / LICENSE conflict; file-specific notices.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [azoteq_trackpad.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/azoteq_trackpad.js) | SDA, SCL, VCC, GND, RST, RDY | side="F" |
| [battery_connector_jst_ph_2.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/battery_connector_jst_ph_2.js) | BAT_P, BAT_N | side='F'; reversible=false; include_traces=true |
| [button.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/button.js) | from, to | side='F' |
| [choc.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/choc.js) | from, to | reverse=false; hotswap=true; solder=false |
| [chocbackplate.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/chocbackplate.js) | Legacy declarations: from, to (migration required) | None of the selected fields declared; LEGACY nets+params |
| [diode.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/diode.js) | from, to | side='back' |
| [diodebackplate.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/diodebackplate.js) | Legacy declarations: from, to (migration required) | None of the selected fields declared; LEGACY nets+params |
| [elite-c.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/elite-c.js) | D3, D2, GND0, GND1, D1, D0, D4, C6, D7, E6, B4, B5, B7, D5, C7, F1, F0, B6, B2, B3, B1, F7, F6, F5, F4, VCC, RST, GND2, B0 | None of the selected fields declared |
| [magnetic_vik_keyboard_connector.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/magnetic_vik_keyboard_connector.js) | V3V, GND, SDA, SCL, RGB_LED_OUT, V5V, GPIO1, MOSI, GPIO2, SPI_CS, MISO, SCLK | side="F" |
| [mounting_hole.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/mounting_hole.js) | No declared net interface identified | None of the selected fields declared |
| [nice_nano.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/nice_nano.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | include_traces=true |
| [rotary.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/rotary.js) | from, to, A, B, C | None of the selected fields declared |
| [text.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/text.js) | No declared net interface identified | side='F' |
| [text_metal.js](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/text_metal.js) | No declared net interface identified | side='F' |

### ImStuBTW/ergogen-v4-footprints

[Source tree](https://github.com/ImStuBTW/ergogen-v4-footprints/tree/be2f02dd05ba3648b0366d443c7342c3a892d70c) · revision `be2f02dd05ba3648b0366d443c7342c3a892d70c` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [buttonrightangle.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/buttonrightangle.js) | from, to | None of the selected fields declared |
| [gbareversible.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/gbareversible.js) | BATOUT, BATIN, RST, GND, VCC, MOSI, MISO, SCK, IO_CS, row0, row1, row2, row3, row4, row5, LCD_CS, col0, col1, col2, col3, col4, col5, col6, col7, NFC0, NFC1 | None of the selected fields declared |
| [lowproro.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/lowproro.js) | A, PUSH, COM, B | None of the selected fields declared |
| [lowprothumb.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/lowprothumb.js) | A, PUSH, COM, B | None of the selected fields declared |
| [mountingholem2.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/mountingholem2.js) | Legacy declarations: net (migration required) | None of the selected fields declared; LEGACY nets+params |
| [mountingholem3.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/mountingholem3.js) | Legacy declarations: net (migration required) | None of the selected fields declared; LEGACY nets+params |
| [spdt.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/spdt.js) | from, to | None of the selected fields declared |
| [xiao-ble-kicad5.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/xiao-ble-kicad5.js) | P0, P1, P2, P3, P4, P5, P6, RAW5V, GND, RAW3V3, P10, P9, P8, P7, SWCLK, SWDIO, RST, BAT_POS, BAT_NEG, NFC1, NFC2 | None of the selected fields declared |
| [xiao-ble.js](https://github.com/ImStuBTW/ergogen-v4-footprints/blob/be2f02dd05ba3648b0366d443c7342c3a892d70c/xiao-ble.js) | P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, RAW3V3, GND, RAW5V, SWCLK, SWDIO, RST, BAT_POS, BAT_NEG, NFC1, NFC2 | side='F' |

### Virginia2244/ergogen_footprints

[Source tree](https://github.com/Virginia2244/ergogen_footprints/tree/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb) · revision `e1e630d3723d3eb00d2bab9b866d9612f1bba5eb` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [footprints/choc.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/choc.js) | from, to | hotswap=false; reverse=false |
| [footprints/diode.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/diode.js) | from, to | None of the selected fields declared |
| [footprints/elite-c.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/elite-c.js) | D3, D2, D1, D0, D4, C6, D7, E6, B4, B5, B0, F4, F5, F6, F7, B1, B3, B2, B6, VBUS, GND, RST, VCC, B7, D5, C7, F1, F0 | None of the selected fields declared |
| [footprints/kb2040.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/kb2040.js) | DPOS, DMIN, TX, RX, GND, P1, P2, P3, P4, P5, P6, P7, P8, P9, RAW, G, RST, V3, A3, A2, A1, A0, CLK, MI, MO, P10 | None of the selected fields declared |
| [footprints/mx.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/mx.js) | from, to | hotswap=false; reverse=false |
| [footprints/nice_nano.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/nice_nano.js) | P006, P008, P017, P020, P022, P024, P100, P011, P104, P106, P031, P029, P002, P115, P113, P111, P010, P009, BPOS, BNEG, RAW, GND, RST, VCC, P101, P102, P107 | None of the selected fields declared |
| [footprints/promicro.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/promicro.js) | P1, P0, P2, P3, P4, P5, P6, P7, P8, P9, P21, P20, P19, P18, P15, P14, P16, P10, RAW, RST, VCC, GND | None of the selected fields declared |
| [footprints/rgb.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/rgb.js) | din, dout, VCC, GND | side='F'; reverse=false |
| [footprints/seeed_xaio.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/seeed_xaio.js) | P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, VCC, GND, V3 | None of the selected fields declared |
| [footprints/trrs.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/trrs.js) | A, B, C, D | reverse=false |
| [footprints/waveshare_rp2040_zero.js](https://github.com/Virginia2244/ergogen_footprints/blob/e1e630d3723d3eb00d2bab9b866d9612f1bba5eb/footprints/waveshare_rp2040_zero.js) | P0, P1, P2, P3, P4, P5, P6, P7, P8, V5, GND, V3, P29, P28, P27, P26, P15, P14, P13, P12, P11, P10, P9 | None of the selected fields declared |

### jusdisgi/ergogen-footprints

[Source tree](https://github.com/jusdisgi/ergogen-footprints/tree/ce4311a3b015955fee098d121700e3c9712ef7e0) · revision `ce4311a3b015955fee098d121700e3c9712ef7e0` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [Magsafe_Silkscreen.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/Magsafe_Silkscreen.js) | No declared net interface identified | side='F' |
| [conn_molex_pico_ezmate_plus_1x02.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_pico_ezmate_plus_1x02.js) | P1, P2 | side='F' |
| [conn_molex_picoblade_smd_1x08_1mm25_horiz.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_smd_1x08_1mm25_horiz.js) | MP, P1, P2, P3, P4, P5, P6, P7, P8 | side='F' |
| [conn_molex_picoblade_smd_1x08_1mm25_vert.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_smd_1x08_1mm25_vert.js) | MP, P1, P2, P3, P4, P5, P6, P7, P8 | side='F' |
| [conn_molex_picoblade_tht_1x08_1mm25_horiz.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_tht_1x08_1mm25_horiz.js) | P1, P2, P3, P4, P5, P6, P7, P8 | side='F' |
| [conn_molex_picoblade_tht_1x08_1mm25_vert.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/conn_molex_picoblade_tht_1x08_1mm25_vert.js) | P1, P2, P3, P4, P5, P6, P7, P8 | side='F' |
| [diode_bav70_hand.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/diode_bav70_hand.js) | from1, from2, to | side='F' |
| [diode_bav70_larssont.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/diode_bav70_larssont.js) | A1, A2, C | side="F"; reversible=false |
| [diode_smd_sod323f.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/diode_smd_sod323f.js) | from, to | side='F' |
| [lcd_waveshare_1in69.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/lcd_waveshare_1in69.js) | No declared net interface identified | side='F' |
| [led_load_switch.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/led_load_switch.js) | P1, P2, P3 | side='F' |
| [led_ws2812b_2020.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/led_ws2812b_2020.js) | P1, P2, P3, P4 | side='F' |
| [mounting_hole_npth.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mounting_hole_npth.js) | No declared net interface identified | side='F' |
| [mounting_hole_plated.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mounting_hole_plated.js) | No declared net interface identified | side='F' |
| [mousebites_25mm.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mousebites_25mm.js) | No declared net interface identified | side='F' |
| [roller_encoder_ckw12.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/roller_encoder_ckw12.js) | S1, S2, A, B, C | side='F' |
| [scrollwheel.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/scrollwheel.js) | from, to, A, B, C, D | reverse=false |
| [switch_5way_skrh.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/switch_5way_skrh.js) | P1, P2, P3, P4, P5, P6 | side='F' |
| [switch_pg1316s.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/switch_pg1316s.js) | from, to, mp_net | reversible=false; side='F' |
| [util_xiao_ble_cutout.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_cutout.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22 | side='F' |
| [util_xiao_ble_cutout_simple.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_cutout_simple.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22 | side='F' |
| [util_xiao_ble_plus_cutout.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_plus_cutout.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24, P25, P26, P27, P28 | side='F' |
| [util_xiao_ble_plus_cutout_simple.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/util_xiao_ble_plus_cutout_simple.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24, P25, P26, P27, P28 | side='F' |
| [xiao_ble_breakout_holes.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/xiao_ble_breakout_holes.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22 | None of the selected fields declared |
| [xiao_ble_plus_breakout_holes.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/xiao_ble_plus_breakout_holes.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24, P25, P26, P27, P28, P29, P30, P31 | None of the selected fields declared |
| [xiao_smd_xl_cutout.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/xiao_smd_xl_cutout.js) | D0, D1, D2, D3, D4, D5, D6, D10, D9, D8, D7, RAW3V3, RAW5V, CLK, DIO, GND, RST, BAT, NFC1, NFC2 | side='F' |

### lapidot/ergogenFootprintCollection

[Source tree](https://github.com/lapidot/ergogenFootprintCollection/tree/c2ba34bdb510effebaea448ed5e387543b1796dd) · revision `c2ba34bdb510effebaea448ed5e387543b1796dd` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [alps.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/alps.js) | from, to | None of the selected fields declared |
| [azoteq_tps43.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/azoteq_tps43.js) | No declared net interface identified | None of the selected fields declared |
| [button.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/button.js) | from, to | side='F' |
| [choc.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/choc.js) | from, to | hotswap=false; reverse=false |
| [chocmini.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/chocmini.js) | from, to | side='F'; reverse=false |
| [cirque.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/cirque.js) | No declared net interface identified | None of the selected fields declared |
| [diode.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/diode.js) | from, to | None of the selected fields declared |
| [elite.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/elite.js) | GND, VCC, ST, D3, D1, D2, D0, D4, C6, D7, E6, B4, B5, B7, D5, C7, F1, F0, B6, B2, B3, B1, F7, F6, F5, F4, B0 | None of the selected fields declared |
| [helios.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/helios.js) | IO10, TX, RX, GND, IO2, IO3, IO4, IO5, IO6, IO7, IO8, IO9, IO12, IO13, IO14, IO15, IO16, IO21, IO23, IO20, IO22, A0, A1, A2, A3, VCC, RAW, RST, IO11, RGB, Dminus, Dplus | None of the selected fields declared |
| [jstph.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/jstph.js) | pos, neg | side='F' |
| [jumper.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/jumper.js) | from, to | side='F' |
| [mounthole.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mounthole.js) | Legacy declarations: net (migration required) | None of the selected fields declared; LEGACY nets+params |
| [mountinghole ORIGINAL.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mountinghole%20ORIGINAL.js) | Legacy declarations: net (migration required) | None of the selected fields declared; LEGACY nets+params |
| [mountinghole.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mountinghole.js) | Legacy declarations: net (migration required) | None of the selected fields declared; LEGACY nets+params |
| [mx.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/mx.js) | from, to | hotswap=false; reverse=false |
| [niceview.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/niceview.js) | VCC, GND, SDA, SCL, CS | side='F' |
| [oled.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/oled.js) | VCC, GND, SDA, SCL | side='F' |
| [omron.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/omron.js) | from, to | None of the selected fields declared |
| [pad.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/pad.js) | net | None of the selected fields declared |
| [pimoroni_trackball.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/pimoroni_trackball.js) | VCC, SDA, SCL, GND | None of the selected fields declared |
| [promicro.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/promicro.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [rgb.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/rgb.js) | din, dout, VCC, GND | side='F' |
| [rotary.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/rotary.js) | from, to, A, B, C | None of the selected fields declared |
| [scrollwheel.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/scrollwheel.js) | from, to, A, B, C, D | reverse=false |
| [slider.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/slider.js) | from, to | side='F' |
| [smd_resistor.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/smd_resistor.js) | from, to | side='F' |
| [tentingpuck.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/tentingpuck.js) | No declared net interface identified | None of the selected fields declared; LEGACY nets+params |
| [trackpad_hole.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/trackpad_hole.js) | No declared net interface identified | None of the selected fields declared |
| [trrs.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/trrs.js) | A, B, C, D | reverse=false |
| [via.js](https://github.com/lapidot/ergogenFootprintCollection/blob/c2ba34bdb510effebaea448ed5e387543b1796dd/via.js) | net | None of the selected fields declared |

### larssont/ergogen-footprints

[Source tree](https://github.com/larssont/ergogen-footprints/tree/708940922192a481cd40c6cef9ae80de49a9e104) · revision `708940922192a481cd40c6cef9ae80de49a9e104` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [amplifier.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/amplifier.js) | VCC, GND, AUDIO_IN, AUDIO_OUT_POS, AUDIO_OUT_NEG, SDB, AMP_IN_NEG, AMP_IN_POS, HPF, BYPASS | side='F'; reversible=false |
| [bav70.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/bav70.js) | A1, A2, C | side="F"; reversible=false |
| [magsafe.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/magsafe.js) | No declared net interface identified | side='B' |
| [mh_npth.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/mh_npth.js) | No declared net interface identified | side='F' |
| [piezo.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/piezo.js) | A, B | side='F'; reversible=false |
| [rj11.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/rj11.js) | TX, RX, POWER, GND | side='F'; reversible=false |
| [rp2040_smd.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/rp2040_smd.js) | V5, GND, V3, P29, P28, P27, P26, P15, P14, P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13 | side='F'; reversible=false |
| [sprintek_sk8707_01_driver.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/sprintek_sk8707_01_driver.js) | GND, DATA, CLOCK, RESET, VCC, LEFT, MIDDLE, RIGHT, TPS1, TPS2, TPS3, TPS4 | side='F' |
| [sprintek_sk8707_01_sensor.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/sprintek_sk8707_01_sensor.js) | TPS1, TPS2, TPS3, TPS4 | side='F' |
| [text.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/text.js) | No declared net interface identified | side='F'; reversible=false |
| [usb_mini_b.js](https://github.com/larssont/ergogen-footprints/blob/708940922192a481cd40c6cef9ae80de49a9e104/usb_mini_b.js) | VBUS, DMIN, DPLUS, ID, GND | side="F" |

### infused-kim/kb_ergogen_fp

[Source tree](https://github.com/infused-kim/kb_ergogen_fp/tree/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612) · revision `bb80a207d8a6fa7b9245caad2c2d97e2adc2f612` · LICENSE BY-NC-SA; README inconsistency.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [choc.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/choc.js) | from, to | reverse=false; hotswap=true; solder=false |
| [conn_molex_pico_ezmate_1x02.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/conn_molex_pico_ezmate_1x02.js) | pad_1, pad_2 | side='F'; reverse=false |
| [conn_molex_pico_ezmate_1x05.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/conn_molex_pico_ezmate_1x05.js) | pad_1, pad_2, pad_3, pad_4, pad_5 | side='F'; reverse=false |
| [diode.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/diode.js) | from, to | None of the selected fields declared |
| [icon_bat.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/icon_bat.js) | No declared net interface identified | side='F'; reverse=false |
| [mounting_hole.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/mounting_hole.js) | No declared net interface identified | None of the selected fields declared |
| [nice_nano_pretty.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/nice_nano_pretty.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [nice_view.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/nice_view.js) | MOSI, SCK, VCC, GND, CS | side='F'; reverse=false |
| [pads.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/pads.js) | net_1, net_2, net_3, net_4, net_5, net_6 | side='F'; reverse=true |
| [point_debugger.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/point_debugger.js) | No declared net interface identified | None of the selected fields declared |
| [smd_0805.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/smd_0805.js) | net_1_from, net_1_to, net_2_from, net_2_to, net_3_from, net_3_to, net_4_from, net_4_to, net_5_from, net_5_to, net_6_from, net_6_to | side='F'; reverse=true |
| [switch_power.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/switch_power.js) | from, to | side='F'; reverse=false |
| [switch_reset.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/switch_reset.js) | from, to | side='F'; reverse=false |
| [text.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/text.js) | No declared net interface identified | side='F'; reverse=false |
| [trackpoint_mount.js](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/trackpoint_mount.js) | No declared net interface identified | side='B'; reverse=false |

### AminKAli/ergogen_footprints

[Source tree](https://github.com/AminKAli/ergogen_footprints/tree/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7) · revision `4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [3mm_kerf_bend_path.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/3mm_kerf_bend_path.js) | No declared net interface identified | None of the selected fields declared |
| [3mm_kerf_bend_path_mirrored.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/3mm_kerf_bend_path_mirrored.js) | No declared net interface identified | None of the selected fields declared |
| [choc_stabilizer.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/choc_stabilizer.js) | No declared net interface identified | None of the selected fields declared |
| [e73_mcu.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/e73_mcu.js) | net_param | None of the selected fields declared |
| [he/1_5u_marker.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/1_5u_marker.js) | No declared net interface identified | None of the selected fields declared |
| [he/1u_marker.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/1u_marker.js) | No declared net interface identified | None of the selected fields declared |
| [he/cap.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/cap.js) | P1, P2 | None of the selected fields declared |
| [he/multiplexer.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/multiplexer.js) | MS0, MS1, MS2, MO, MI1, MI2, MI3, MI4, MI5, MI6, MI7, MI8, GND, VCC | None of the selected fields declared |
| [he/multiplexer_vias.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/multiplexer_vias.js) | gnd, ms0, ms1, ms2, mo | None of the selected fields declared |
| [he/sensor.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/sensor.js) | P1, P2, P3 | None of the selected fields declared |
| [he/via_0603x5.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/he/via_0603x5.js) | net1, net2, net3, net4, net5 | None of the selected fields declared |
| [kailh_mouse_rotary.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/kailh_mouse_rotary.js) | A, B, C | side='F' |
| [kerf_bend_path.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/kerf_bend_path.js) | No declared net interface identified | None of the selected fields declared |
| [kerf_bend_path_mirrored.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/kerf_bend_path_mirrored.js) | No declared net interface identified | None of the selected fields declared |
| [n_mosfet_sot23.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/n_mosfet_sot23.js) | G, S, D | side='B' |
| [siq_rotary.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/siq_rotary.js) | A, B, C, S | side='F' |
| [tl3342_reset_switch_smd.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/tl3342_reset_switch_smd.js) | from, to | side='F' |
| [via_0603.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/via_0603.js) | net | None of the selected fields declared |
| [via_1005x11.js](https://github.com/AminKAli/ergogen_footprints/blob/4fc8c27e4e2ffb8594f6b7daa2306d8c59b8a2c7/via_1005x11.js) | net1, net2, net3, net4, net5, net6, net7, net8, net9, net10, net11 | None of the selected fields declared |

### arrowtip/ergogen_footprints

[Source tree](https://github.com/arrowtip/ergogen_footprints/tree/43d5965ddf7309cd5b72e2fb5b493e066631f958) · revision `43d5965ddf7309cd5b72e2fb5b493e066631f958` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [elite_c_rev4.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/elite_c_rev4.js) | GND, VCC, ST, D3, D1, D2, D0, D4, C6, D7, E6, B4, B5, B7, D5, C7, F1, F0, B6, B2, B3, B1, F7, F6, F5, F4, B0 | None of the selected fields declared |
| [grub.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/grub.js) | No declared net interface identified | side='F' |
| [kings_idol.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/kings_idol.js) | No declared net interface identified | side='F' |
| [knight.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/knight.js) | No declared net interface identified | side='F' |
| [madeline.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/madeline.js) | No declared net interface identified | side='F' |
| [my_button.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_button.js) | from, to | side='both' |
| [my_choc-mx-hotswap.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_choc-mx-hotswap.js) | in, out, inout | None of the selected fields declared |
| [my_diode.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_diode.js) | from, to | side='both' |
| [my_mountinghole.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_mountinghole.js) | No declared net interface identified | None of the selected fields declared |
| [my_mx-prerouted.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_mx-prerouted.js) | in, out, inout | None of the selected fields declared |
| [my_nice-elite.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_nice-elite.js) | B_PLUS, GND, RST, VCC, D21, D20, D19, D18, D15, D14, D16, D10, D1, D0, D2, D3, D4, D5, D6, D7, D8, D9, P1_01, P1_02, P1_07, E_F0, E_F1 | side='both' |
| [my_nice-nano.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_nice-nano.js) | B_PLUS, GND, RST, VCC, D21, D20, D19, D18, D15, D14, D16, D10, D1, D0, D2, D3, D4, D5, D6, D7, D8, D9, P1_01, P1_02, P1_07 | side='both' |
| [my_promicro.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_promicro.js) | RAW, GND, RST, VCC, F4, F5, F6, F7, B1, B3, B2, B6, D3, D2, D1, D0, D4, C6, D7, E6, B4, B5 | side='both' |
| [my_resistor.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_resistor.js) | from, to | None of the selected fields declared |
| [my_scrollwheel.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_scrollwheel.js) | from, to, A, B, C, D | None of the selected fields declared |
| [my_switch.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_switch.js) | A, B, C, X, Y, Z | side='F' |
| [my_threeway_jumper.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_threeway_jumper.js) | from, to_a, to_b | side='F' |
| [my_tps65.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_tps65.js) | rdy, nrst, gnd, v_in, scl, sda | side='F' |
| [my_trrs.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_trrs.js) | A, B, C, D | reverse=false |
| [my_version.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_version.js) | No declared net interface identified | side='F' |
| [my_ws2812.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/my_ws2812.js) | VCC, dout, GND, din | None of the selected fields declared |
| [shadow.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/shadow.js) | No declared net interface identified | side='F' |
| [winged-berry.js](https://github.com/arrowtip/ergogen_footprints/blob/43d5965ddf7309cd5b72e2fb5b493e066631f958/winged-berry.js) | No declared net interface identified | side='F' |

### dieseltravis/ergogen-footprints-travis

[Source tree](https://github.com/dieseltravis/ergogen-footprints-travis/tree/df3c65141193792656b296784576ef918283c09b) · revision `df3c65141193792656b296784576ef918283c09b` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [Alps-EC10E1220501.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/Alps-EC10E1220501.js) | P1, P2, P3, P4 | None of the selected fields declared |
| [CDiscD38W26P25.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CDiscD38W26P25.js) | P1, P2 | side='F' |
| [CDiscD47W25P5.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CDiscD47W25P5.js) | P1, P2 | side='F' |
| [CRadialD63H11P25.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CRadialD63H11P25.js) | P1, P2 | side='F' |
| [CSMD_0805_2012Metric.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CSMD_0805_2012Metric.js) | P1, P2 | side='F' |
| [CSMD_1206_3216Metric.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CSMD_1206_3216Metric.js) | P1, P2 | side='F' |
| [CSMD_D63xL77.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/CSMD_D63xL77.js) | P1, P2 | side='F' |
| [DIP16W762.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/DIP16W762.js) | p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16 | side='F' |
| [DSMD_1206_3216Metric.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/DSMD_1206_3216Metric.js) | from, to | side='F' |
| [Keebio-I2C_Breakout.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/Keebio-I2C_Breakout.js) | P1, P2, P3, P4 | None of the selected fields declared |
| [KiCad-Logo5Copper.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/KiCad-Logo5Copper.js) | No declared net interface identified | side='F' |
| [MX_Stabilizer_Cutout-2u.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/MX_Stabilizer_Cutout-2u.js) | No declared net interface identified | side='F' |
| [OSHW-Symbol67x6Copper.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/OSHW-Symbol67x6Copper.js) | No declared net interface identified | side='F' |
| [RAxialL6D25P10H.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/RAxialL6D25P10H.js) | from, to | side='F' |
| [SWPUSH6H43.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/SWPUSH6H43.js) | P1, P2 | side='F' |
| [ScottoKeebs-Arduino_Pro_Micro.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-Arduino_Pro_Micro.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24 | None of the selected fields declared |
| [ScottoKeebs-Diode_DO-35.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-Diode_DO-35.js) | from, to | side='F' |
| [ScottoKeebs-RP2040_Pro_Micro.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-RP2040_Pro_Micro.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23, P24, P25, P26, P27, P28, P29, P30, P31 | None of the selected fields declared |
| [ScottoKeebs-Stabilizer_MX_2u.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ScottoKeebs-Stabilizer_MX_2u.js) | No declared net interface identified | side='F' |
| [Symbol_Danger_Copper_Small.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/Symbol_Danger_Copper_Small.js) | No declared net interface identified | side='F' |
| [USB_C_Receptacle_GCT_USB4085.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/USB_C_Receptacle_GCT_USB4085.js) | A1, A4, A5, A6, A7, A8, A9, A12, B9, B7, B8, B12, B5, B4, B1, B6, S1 | side='F' |
| [ec11.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ec11.js) | from, to, A, B, C | None of the selected fields declared |
| [ergogen.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/ergogen.js) | No declared net interface identified | side='F' |
| [evqwgd001.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/evqwgd001.js) | from, to, A, B, C, D | reverse=false |
| [key-module.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/key-module.js) | name, colnet, rownet, led_this, led_next, power, gnd | None of the selected fields declared |
| [led_sk6803mini-e.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/led_sk6803mini-e.js) | P3, P4, P1, P2 | side='B'; reversible=false; reverse_mount=true; include_traces_vias=true |
| [led_sk6812mini-e.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/led_sk6812mini-e.js) | P1, P2, P3, P4 | side='B'; reversible=false; reverse_mount=true; include_traces_vias=true |
| [mountinghole.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/mountinghole.js) | Legacy declarations: net (migration required) | side='F'; LEGACY nets+params |
| [mx.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/mx.js) | from, to | hotswap=false; reverse=false |
| [roc.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/roc.js) | No declared net interface identified | side='F'; reversible=false |
| [switch_mx.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/switch_mx.js) | from, to, CENTERHOLE, LEFTSTAB, RIGHTSTAB | side='B'; reversible=false; hotswap=true; hotswap_pads_same_side=false; include_traces_vias=true; solder=false |
| [text.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/text.js) | No declared net interface identified | side='F'; reversible=false |
| [travis.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/travis.js) | No declared net interface identified | side='F'; reversible=false |
| [xiao-ble.js](https://github.com/dieseltravis/ergogen-footprints-travis/blob/df3c65141193792656b296784576ef918283c09b/xiao-ble.js) | P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, RAW3V3, GND, RAW5V | side='F' |

### ezxzeng/ergogen_footprints

[Source tree](https://github.com/ezxzeng/ergogen_footprints/tree/9811c4d85a8e208ac0709f2da583645530be8fe2) · revision `9811c4d85a8e208ac0709f2da583645530be8fe2` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [b3u1000p.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/b3u1000p.js) | r1, r2 | reverse=true |
| [jstph_reversible.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/jstph_reversible.js) | pos, neg | None of the selected fields declared |
| [key-switches.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/key-switches.js) | from, to | None of the selected fields declared |
| [mountinghole.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/mountinghole.js) | Legacy declarations: net (migration required) | None of the selected fields declared; LEGACY nets+params |
| [promicro-pretty.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/promicro-pretty.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [reset_button.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/reset_button.js) | from, to | None of the selected fields declared |
| [slider_threeway.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/slider_threeway.js) | from, left, right | side='F'; reversible=false |
| [text.js](https://github.com/ezxzeng/ergogen_footprints/blob/9811c4d85a8e208ac0709f2da583645530be8fe2/text.js) | No declared net interface identified | side="F" |

### harshitgoel96/ergogen_footprints

[Source tree](https://github.com/harshitgoel96/ergogen_footprints/tree/d569c92090e56dda30fa4d4ed54f65d76980d47e) · revision `d569c92090e56dda30fa4d4ed54f65d76980d47e` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [fh12_12.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/fh12_12.js) | GND, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12 | side='F' |
| [m3_mounting.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/m3_mounting.js) | GND | side='F' |
| [mx_socket_mxlp_choc.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/mx_socket_mxlp_choc.js) | SCK, VCC, GND, CS, from, to | side='F' |
| [r_0805.js](https://github.com/harshitgoel96/ergogen_footprints/blob/d569c92090e56dda30fa4d4ed54f65d76980d47e/r_0805.js) | P1, P2 | side='F' |

### helgederenthal/ergogen-footprints

[Source tree](https://github.com/helgederenthal/ergogen-footprints/tree/84567480106c3a7a7ed2350b34f0c46ea0e587ce) · revision `84567480106c3a7a7ed2350b34f0c46ea0e587ce` · GPL-3.0 repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [elite-c.js](https://github.com/helgederenthal/ergogen-footprints/blob/84567480106c3a7a7ed2350b34f0c46ea0e587ce/elite-c.js) | D3, D2, D1, D0, D4, C6, D7, E6, B4, B5, B0, F4, F5, F6, F7, B1, B3, B2, B6, VBUS, GND, RST, VCC, B7, D5, C7, F1, F0 | None of the selected fields declared |
| [switch_choc_v1_v2.js](https://github.com/helgederenthal/ergogen-footprints/blob/84567480106c3a7a7ed2350b34f0c46ea0e587ce/switch_choc_v1_v2.js) | from, to, CENTERHOLE, LEFTSTAB, RIGHTSTAB | side='B'; reversible=false; hotswap=true; solder=false |

### theb0b12/ergogen-footprints

[Source tree](https://github.com/theb0b12/ergogen-footprints/tree/ca9a6555edee93f383c81f7c76e2adfb5f449c2d) · revision `ca9a6555edee93f383c81f7c76e2adfb5f449c2d` · AGPL-3.0 repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [7mouse_bites.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/7mouse_bites.js) | No declared net interface identified | side='F' |
| [chocv1v2b0b.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/chocv1v2b0b.js) | from, to, CENTERHOLE, LEFTSTAB, RIGHTSTAB | side='B'; reversible=false; hotswap_pads_same_side=false; include_traces_vias=true; hotswap=true; solder=false |
| [cirque.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/cirque.js) | P1, P10, P11, P12, P13, P14, P2, P3, P4, P5, P6, P7, P8, P9 | side='F' |
| [doru-tht.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/doru-tht.js) | P12, P13, P14, P15, P16, P17, P18, P19, P20, P23, P24 | side='F' |
| [haptic.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/haptic.js) | P1, P2, P3, P4, P5 | side='F' |
| [jumper1.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/jumper1.js) | P1, P2 | side='F' |
| [oled2.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/oled2.js) | P1, P2, P3, P4 | side='F' |
| [placeholder.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/placeholder.js) | No declared net interface identified | side='B' |
| [rotary.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/rotary.js) | A, B, C, MP, S1, S2 | side='F' |
| [router.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/router.js) | net | None of the selected fields declared |
| [seeed-xiao-plus.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/seeed-xiao-plus.js) | D0, D11, D1, D12, D2, D13, D3, D14, D4, D15, D5, BATTERY_LEVEL, D6, VBUS, GND, V3_3, D10, D19, D9, D18, D8, D17, D7, CLK, DIO, RST, BAT_POS, BAT_NEG | reverse_mount=false; reversible=true |
| [shift_reg.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/shift_reg.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16 | side='F' |
| [smd.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/smd.js) | from, to | None of the selected fields declared |
| [trrs.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/trrs.js) | P1, P2, P3, P4 | side='F' |
| [usbc.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/usbc.js) | A12, A5, A9, B12, B5, B9, SH1, SH2, SH3, SH4 | side='F' |
| [vik_horizontal.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/vik_horizontal.js) | VIK1, VIK2, VIK3, VIK4, VIK5, VIK6, VIK7, VIK8, VIK9, VIK10, VIK11, VIK12 | side='F' |
| [vikout.js](https://github.com/theb0b12/ergogen-footprints/blob/ca9a6555edee93f383c81f7c76e2adfb5f449c2d/vikout.js) | VIK1, VIK2, VIK3, VIK4, VIK5, VIK6, VIK7, VIK8, VIK9, VIK10, VIK11, VIK12 | side='F' |

### ykz89/ergogen-footprints

[Source tree](https://github.com/ykz89/ergogen-footprints/tree/01c8cd03ff9bd66b283f82c7059b11b7be8ed26f) · revision `01c8cd03ff9bd66b283f82c7059b11b7be8ed26f` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [ks27-choc-v1-mx-soldered-and-hotswap.js](https://github.com/ykz89/ergogen-footprints/blob/01c8cd03ff9bd66b283f82c7059b11b7be8ed26f/ks27-choc-v1-mx-soldered-and-hotswap.js) | from, to | side='B'; include_traces={type: 'boolean', value: false} |
| [vik-keyboard-connector-horizontal.js](https://github.com/ykz89/ergogen-footprints/blob/01c8cd03ff9bd66b283f82c7059b11b7be8ed26f/vik-keyboard-connector-horizontal.js) | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12 | side='F' |

### johnlamb/LambBT

[Source tree](https://github.com/johnlamb/LambBT/tree/c127665660b2f8adc8632cb89790d27262cc3549) · revision `c127665660b2f8adc8632cb89790d27262cc3549` · CC0-1.0 repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [ergogen/footprints/b3u1000p.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/b3u1000p.js) | r1, r2 | reverse=true |
| [ergogen/footprints/bat.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/bat.js) | pos, neg | None of the selected fields declared |
| [ergogen/footprints/batterypad.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/batterypad.js) | to, from | None of the selected fields declared |
| [ergogen/footprints/mountinghole.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/mountinghole.js) | No declared net interface identified | None of the selected fields declared |
| [ergogen/footprints/pcm12.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/pcm12.js) | from, to | reverse=false |
| [ergogen/footprints/promicro_pretty.js](https://github.com/johnlamb/LambBT/blob/c127665660b2f8adc8632cb89790d27262cc3549/ergogen/footprints/promicro_pretty.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |

### dnlbauer/corax-keyboard

[Source tree](https://github.com/dnlbauer/corax-keyboard/tree/7e01724621f12f1c1099f78c978bcb6aca19b795) · revision `7e01724621f12f1c1099f78c978bcb6aca19b795` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [corax54/ergogen/footprints/battery.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/battery.js) | RAW, GND | None of the selected fields declared |
| [corax54/ergogen/footprints/choc.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/choc.js) | from, to | hotswap=false; reverse=false |
| [corax54/ergogen/footprints/diode.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/diode.js) | from, to | None of the selected fields declared |
| [corax54/ergogen/footprints/hole.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/hole.js) | No declared net interface identified | None of the selected fields declared |
| [corax54/ergogen/footprints/jumper.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/jumper.js) | from, to | side='F' |
| [corax54/ergogen/footprints/nicenano.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/nicenano.js) | RAW, GND1, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, GND2, GND3, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [corax54/ergogen/footprints/niceview.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/niceview.js) | VCC, GND, SDA, SCL, CS | side='F' |
| [corax54/ergogen/footprints/reset.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/reset.js) | from, to | side="F" |
| [corax54/ergogen/footprints/rotary.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/rotary.js) | from, to, A, B, C | None of the selected fields declared |
| [corax54/ergogen/footprints/scrollwheel_mirrored.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/scrollwheel_mirrored.js) | from, to, A, B, C, D | reverse=false |
| [corax54/ergogen/footprints/slider_reversible.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/slider_reversible.js) | from, to | side='F'; reverse=false |
| [corax54/ergogen/footprints/text.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax54/ergogen/footprints/text.js) | No declared net interface identified | side='F' |
| [corax56/ergogen/footprints/battery.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/battery.js) | RAW, GND | None of the selected fields declared |
| [corax56/ergogen/footprints/choc.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/choc.js) | from, to | hotswap=false; reverse=false |
| [corax56/ergogen/footprints/diode.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/diode.js) | from, to | None of the selected fields declared |
| [corax56/ergogen/footprints/hole.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/hole.js) | No declared net interface identified | None of the selected fields declared |
| [corax56/ergogen/footprints/jumper.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/jumper.js) | from, to | side='F' |
| [corax56/ergogen/footprints/nicenano.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/nicenano.js) | RAW, GND1, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, GND2, GND3, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [corax56/ergogen/footprints/niceview.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/niceview.js) | VCC, GND, SDA, SCL, CS | side='F' |
| [corax56/ergogen/footprints/reset.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/reset.js) | from, to | side="F" |
| [corax56/ergogen/footprints/rotary.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/rotary.js) | from, to, A, B, C | None of the selected fields declared |
| [corax56/ergogen/footprints/scrollwheel_mirrored.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/scrollwheel_mirrored.js) | from, to, A, B, C, D | reverse=false |
| [corax56/ergogen/footprints/slider_reversible.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/slider_reversible.js) | from, to | side='F'; reverse=false |
| [corax56/ergogen/footprints/text.js](https://github.com/dnlbauer/corax-keyboard/blob/7e01724621f12f1c1099f78c978bcb6aca19b795/corax56/ergogen/footprints/text.js) | No declared net interface identified | side='F' |

### unspecworks/gamma-omega

[Source tree](https://github.com/unspecworks/gamma-omega/tree/840f3c9c7454f699907d58289f54927d6d18ca69) · revision `840f3c9c7454f699907d58289f54927d6d18ca69` · CERN-OHL-W-2.0 repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [original/ergogen/footprints/VladAndral/pipico.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/VladAndral/pipico.js) | GP0, GP1, GP2, GP3, GP4, GP5, GP6, GP7, GP8, GP9, GP10, GP11, GP12, GP13, GP14, GP15, GP16, GP17, GP18, GP19, GP20, GP21, GP22, GP26, GP27, GP28, RUN, ADC_VREF, V3V3_OUT, V3V3_EN, VSYS, VBUS, GND, AGND, SWCLK, SWDIO | None of the selected fields declared |
| [original/ergogen/footprints/hesse_logo.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/hesse_logo.js) | No declared net interface identified | None of the selected fields declared |
| [original/ergogen/footprints/reset_switch_1825027-8.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/reset_switch_1825027-8.js) | from, to | side='F'; reversible=false |
| [original/ergogen/footprints/tc36k_logo.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/tc36k_logo.js) | No declared net interface identified | None of the selected fields declared |
| [original/ergogen/footprints/unspecworks/diode_tht.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/unspecworks/diode_tht.js) | from, to | side='B'; reversible=false; include_traces_vias=false |
| [original/ergogen/footprints/unspecworks/pico_oneside.js](https://github.com/unspecworks/gamma-omega/blob/840f3c9c7454f699907d58289f54927d6d18ca69/original/ergogen/footprints/unspecworks/pico_oneside.js) | P0, VB, P1, VS, GND, P2, P23, P3, V3, P4, P29, P5, P28, GND, P6, P27, P7, P26, P8, RUN, P9, P22, GND, P10, P21, P11, P20, P12, P19, P13, P18, GND, P14, P17, P15, P16 | None of the selected fields declared |

### Narkoleptika/josukey

[Source tree](https://github.com/Narkoleptika/josukey/tree/15bfa535a9876d95c239333d4debe53209aa4b46) · revision `15bfa535a9876d95c239333d4debe53209aa4b46` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [ergogen/footprints/jst-s2b-ph-kl.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/jst-s2b-ph-kl.js) | pos, neg | None of the selected fields declared |
| [ergogen/footprints/keepout.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/keepout.js) | No declared net interface identified | None of the selected fields declared |
| [ergogen/footprints/love.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/love.js) | No declared net interface identified | None of the selected fields declared |
| [ergogen/footprints/pcm12.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/pcm12.js) | from, to | None of the selected fields declared |
| [ergogen/footprints/peace.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/peace.js) | No declared net interface identified | None of the selected fields declared |
| [ergogen/footprints/promicro_pretty.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/promicro_pretty.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [ergogen/footprints/route.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/route.js) | net | side='F' |
| [ergogen/footprints/sk6812mini.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/sk6812mini.js) | din, dout, VCC, GND | None of the selected fields declared |
| [ergogen/footprints/sod-123w.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/sod-123w.js) | from, to | None of the selected fields declared |
| [ergogen/footprints/text.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/text.js) | No declared net interface identified | None of the selected fields declared |
| [ergogen/footprints/via.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/via.js) | net | None of the selected fields declared |
| [ergogen/footprints/wuerth-434121025816.js](https://github.com/Narkoleptika/josukey/blob/15bfa535a9876d95c239333d4debe53209aa4b46/ergogen/footprints/wuerth-434121025816.js) | r1, r2 | reverse=true |

### soundmonster/samoklava

[Source tree](https://github.com/soundmonster/samoklava/tree/a23bf7180eb31e970980c9d20f7c0d886c5032da) · revision `a23bf7180eb31e970980c9d20f7c0d886c5032da` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [footprints/promicro_flippable.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/promicro_flippable.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 | None of the selected fields declared |
| [footprints/reset_button.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/reset_button.js) | from, to | None of the selected fields declared |
| [footprints/slider_threeway.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/slider_threeway.js) | from, left, right | side='F' |
| [footprints/text.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/text.js) | No declared net interface identified | None of the selected fields declared |
| [footprints/trrs_tight.js](https://github.com/soundmonster/samoklava/blob/a23bf7180eb31e970980c9d20f7c0d886c5032da/footprints/trrs_tight.js) | A, B, C, D | reverse=false |

### thrly/tempest

[Source tree](https://github.com/thrly/tempest/tree/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a) · revision `8d1ced109a41dfb5647e67cf5924c7ce4c70b38a` · Unknown / no recognized repository grant.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [ergogen/footprints/ceoloide/battery_connector_jst_ph_2.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/battery_connector_jst_ph_2.js) | BAT_P, BAT_N | side='F'; reversible=false; include_traces=true |
| [ergogen/footprints/ceoloide/diode_tht_sod123.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/diode_tht_sod123.js) | from, to | side='B'; reversible=false; include_traces_vias=false |
| [ergogen/footprints/ceoloide/display_nice_view.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/display_nice_view.js) | MOSI, SCK, VCC, GND, CS | side="F"; reversible=false; include_traces=true |
| [ergogen/footprints/ceoloide/mcu_nice_nano.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/mcu_nice_nano.js) | RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9, P101, P102, P107 | side="F"; reversible=false; reverse_mount=false; include_traces=true |
| [ergogen/footprints/ceoloide/mounting_hole_npth.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/mounting_hole_npth.js) | No declared net interface identified | side='F' |
| [ergogen/footprints/ceoloide/mounting_hole_plated.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/mounting_hole_plated.js) | No declared net interface identified | side='F' |
| [ergogen/footprints/ceoloide/power_switch_smd_side.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/power_switch_smd_side.js) | from, to | side="F"; reversible=false |
| [ergogen/footprints/ceoloide/reset_switch_smd_side.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/reset_switch_smd_side.js) | from, to | side='F'; reversible=false |
| [ergogen/footprints/ceoloide/switch_choc_v1_v2.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/switch_choc_v1_v2.js) | from, to, CENTERHOLE, LEFTSTAB, RIGHTSTAB | side='B'; reversible=false; hotswap_pads_same_side=false; include_traces_vias=true; hotswap=true; solder=false |
| [ergogen/footprints/ceoloide/utility_text.js](https://github.com/thrly/tempest/blob/8d1ced109a41dfb5647e67cf5924c7ce4c70b38a/ergogen/footprints/ceoloide/utility_text.js) | No declared net interface identified | side="F"; reversible=false |

### rschenk/tern

[Source tree](https://github.com/rschenk/tern/tree/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a) · revision `02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a` · MIT repository label; file review required.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [ergogen/footprints/better_diode.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/better_diode.js) | from, to | None of the selected fields declared |
| [ergogen/footprints/choc_bonus_goodies.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/choc_bonus_goodies.js) | No declared net interface identified | reverse=false |
| [ergogen/footprints/mountinghole.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/mountinghole.js) | No declared net interface identified | None of the selected fields declared |
| [ergogen/footprints/xiao.js](https://github.com/rschenk/tern/blob/02445d5ecc4fb8d357fbc5e9103daed2c0a2df6a/ergogen/footprints/xiao.js) | P0, P1, P2, P3, P4, P5, P6, VUSB, GND, VCC, P10, P9, P8, P7, RST, BATP | None of the selected fields declared |

### Albert-IV/ergogen-contrib

[Source tree](https://github.com/Albert-IV/ergogen-contrib/tree/956da989b56c0950b704d91bed69bb7ec233098a) · revision `956da989b56c0950b704d91bed69bb7ec233098a` · No detected license; provenance only.

| Module: pinned source | Net interface | Selected declared controls |
|---|---|---|
| [src/footprints/promicro_pretty.js](https://github.com/Albert-IV/ergogen-contrib/blob/956da989b56c0950b704d91bed69bb7ec233098a/src/footprints/promicro_pretty.js) | Legacy declarations: RAW, GND, RST, VCC, P21, P20, P19, P18, P15, P14, P16, P10, P1, P0, P2, P3, P4, P5, P6, P7, P8, P9 (migration required) | None of the selected fields declared; LEGACY nets+params |
| [src/footprints/tentingpuck.js](https://github.com/Albert-IV/ergogen-contrib/blob/956da989b56c0950b704d91bed69bb7ec233098a/src/footprints/tentingpuck.js) | No declared net interface identified | None of the selected fields declared; LEGACY nets+params |

## Copies, omitted assets and uncertainty

The exact-hash field allows deduplication without assuming similarly named generators are interchangeable. Corax54/56 have 12 identical file pairs. Other project copies may change drill sizes, pad mapping or labels and remain separate records. Tempest’s files retain ceoloide provenance and local edits. A different SHA-256 is not proof of a different circuit; an identical file does not establish a new independent source.

Raw `.kicad_mod` libraries such as `50an6xy06r6n/keyboard_reversible.pretty` are provenance/conversion candidates, not native Ergogen modules. Board Studio has a separate single-footprint import/conversion path that synthesizes `params/body` and pad-number net bindings; conversion does not qualify the physical design. Context-only repositories with 0 identified modules are retained in the repository table, not counted as available generators. Official template files and test fixtures are excluded. Models, generated boards, helper index modules and arbitrary text snippets are outside the module count.

Detected file-level SPDX notices are in [JSON](catalogue.json); repository notices above must not overwrite them. ImStuBTW, AlexSutila, GooseKB, and most jusdisgi files lack a detected grant; CardboardMechanic has conflicting statements. Listing links does not establish permission to redistribute their source. [Detailed license audit](license-audit.md)

Gamma-Omega `pico_oneside.js` combines a Pico-oriented title with ProMicro-derived implementation commentary; its exact physical package mapping remains unqualified. `pcm12.js` in LambBT is a slide power switch, not a rotary encoder. No hardware function is inferred solely from a filename.

## Source and verification ledger

[Repository metadata](repository-metadata.json), [immutable inventory](catalogue.json), [source ledger](sources.md), [claim graph](claim-graph.md), [local verification](AUDIT.md#verification-and-confidence), [research trace](expansion-log.md). Each module row is grounded in its pinned file; primary-source-only is the appropriate evidence scope for its declared API. No claim of complete GitHub coverage, external runtime qualification, KiCad DRC, or fabrication readiness is made.

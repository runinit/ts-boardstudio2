# Footprint provenance and reuse-status audit

Observed 2026-09-20. This is an evidence inventory and operational catalogue taxonomy, not legal advice or legal clearance. Counts are scoped to the checked commits and the local `footprints/manifest/sources.json` inventory.

## Recommended catalogue taxonomy

| Status | Evidence state | Catalogue behavior |
| --- | --- | --- |
| `P-MIT` | Applicable file or repository statement is MIT, with coherent authorship/provenance | Candidate for source borrowing; retain copyright and permission notice and pin the exact source. |
| `R-SA` | Applicable source says CC BY-SA 4.0 or CC BY-SA 4.0 plus the KiCad design exception | Keep as a separate reciprocal source. Record author, license, source URI, pin and modifications. KiCad's exception applies to designs/generated files; redistribution as a library collection still carries BY-SA/attribution requirements. |
| `R-NC-SA` | Applicable source says CC BY-NC-SA 4.0 | Restricted candidate: attribution, modification notice and ShareAlike apply, and commercial use is outside the license grant. Do not fold into a blanket MIT namespace. |
| `R-OHL-S` | Applicable source says CERN-OHL-S-2.0 | Strong-reciprocal hardware source. Preserve notices/source location; modification and product conveyance have Complete Source obligations. Review the actual distribution path before borrowing. |
| `F-FILE` | Repository is unlicensed or conflicted, but this exact file has an explicit coherent license header | Only the specifically headed file is a candidate, under its own terms. Do not infer a repository-wide license. |
| `H-CONFLICT` | LICENSE, README, badge, headers, or upstream provenance disagree | Hold source copying. Catalogue may retain factual metadata and pinned links with the conflict recorded. Seek clarification or choose a clean source. |
| `L-ONLY` | No applicable license statement found at the checked commit | Discovery metadata and pinned link only; do not copy, modify, bundle, or publish the source. GitHub states that default copyright applies without a license. |
| `H-3P` | A bundled binary/source is attributed to a third party whose applicable terms were not established | Hold that artifact independently of the repository's umbrella license. Link to the original source and resolve its terms before bundling. |

Authoritative term summaries:

- MIT requires the copyright and permission notice in copies/substantial portions: <https://opensource.org/license/mit>.
- CC BY-SA permits commercial sharing/adaptation subject to attribution and ShareAlike: <https://creativecommons.org/licenses/by-sa/4.0/legalcode>.
- CC BY-NC-SA adds the NonCommercial limit and requires attribution/ShareAlike: <https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode>.
- KiCad explains that its design exception does not apply to redistribution of library collections, which remain BY-SA with attribution/license documents: <https://www.kicad.org/libraries/license/>.
- GitHub's own licensing guide says that without a license default copyright applies and others may not reproduce, distribute, or create derivative works (apart from platform rights to view/fork): <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository>.

## Local footprint sources

### Ceoloide pin: mixed, file-specific

Pinned tree: <https://github.com/ceoloide/ergogen-footprints/tree/48935f54b456ff1503d78d6b17d9d146b54e8ade>. Upstream license evidence: [README](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/README.md) and [root MIT LICENSE](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/LICENSE).

Observed scope: 24 root JavaScript footprint modules at the pin. All 24 have an SPDX header: 13 `MIT`, 11 `CC-BY-NC-SA-4.0`. The file header is the controlling catalogue fact; the root MIT file must not be applied to the 11 NC-SA files.

`P-MIT` (13):

`battery_connector_jst_ph_2.js`, `led_sk6812mini-e.js`, `mounting_hole_npth.js`, `reset_switch_smd_side.js`, `reset_switch_tht_top.js`, `rotary_encoder_ec11_ec12.js`, `switch_gateron_ks27_ks33.js`, `switch_mx.js`, `trrs_pj320a.js`, `utility_ergogen_logo.js`, `utility_filled_zone.js`, `utility_keepout_zone.js`, `utility_router.js`.

`R-NC-SA` (11):

`battery_connector_molex_pico_ezmate_1x02.js`, `diode_tht_sod123.js`, `display_nice_view.js`, `display_ssd1306.js`, `mcu_nice_nano.js`, `mcu_supermini_nrf52840.js`, `mounting_hole_plated.js`, `power_switch_smd_side.js`, `switch_choc_v1_v2.js`, `utility_point_debugger.js`, `utility_text.js`.

Pinned examples: [MIT header](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/battery_connector_jst_ph_2.js), [NC-SA header](https://github.com/ceoloide/ergogen-footprints/blob/48935f54b456ff1503d78d6b17d9d146b54e8ade/battery_connector_molex_pico_ezmate_1x02.js). The local `manifest/patches.json` records modifications; modification notices must travel with CC-derived reuse.

### Infused-Kim pin: repository conflict and third-party model boundary

Pinned tree: <https://github.com/infused-kim/kb_ergogen_fp/tree/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612>.

Observed scope: 15 root JavaScript footprint modules, none with an SPDX or other license marker in the first 30 lines. The pinned [LICENSE](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/LICENSE) contains the CC BY-NC-SA 4.0 legal text, while the pinned [README license section](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/README.md#L158-L171) says CC BY-SA 4.0 but simultaneously says commercial use is not allowed. BY-SA itself permits commercial use. Classification: `H-CONFLICT` for all 15 until the author clarifies the intended license. A conservative operational filter may flag them NC-restricted, but that is not a resolution of the conflicting repository statements.

The 33 local Infused-Kim model assets are a separate provenance unit. The pinned [model-source README](https://github.com/infused-kim/kb_ergogen_fp/blob/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612/3d_models/README.md) attributes binaries to Thingiverse, DigiKey, Joe Scotto, Infused-Kim generator repositories, GrabCAD, Molex, SnapEDA, Discord, and local generators. An umbrella repository license does not establish that the repository owner had authority to relicense all third-party artifacts. Classification: `H-3P` unless the original artifact's terms are separately documented.

Bounded provenance anomaly: local `vendor/infused-kim/3d_models/Choc_V1_Hotswap.step` and `Choc_V1_Switch.step` are byte-identical to the pinned KiSwitch Choc models. KiSwitch history first contains the switch model in 2021-11 and the hotswap model in 2021-12; ScottoKeebs added identical paths in 2023-08; Infused-Kim added them in 2024-06 while crediting Scotto. This supports KiSwitch as the earlier checked source, but it does not by itself settle authorship. Record the chain as a provenance ambiguity rather than attaching ScottoKeebs' present NC license to the older files.

## Local model inventory: artifact licenses are independent of footprint licenses

The local manifest contains 54 model assets: 49 STEP/STP, four STL companions, one WRL. This is an inventory count, not a clearance count.

| Scope | Count | Pin/license evidence | Classification |
| --- | ---: | --- | --- |
| Infused-Kim | 33 | Pin and source list above; mixed third-party origins plus repository license conflict | `H-3P` / `H-CONFLICT` |
| KiSwitch | 8 (4 STP + 4 STL companions) | [pin](https://github.com/kiswitch/kiswitch/tree/aefcf65038d48d2666ff14530d482be3c350fa6e), [CC-BY-SA + design exception](https://github.com/kiswitch/kiswitch/blob/aefcf65038d48d2666ff14530d482be3c350fa6e/LICENSE-CC-BY-SA); upstream README says library is dual licensed MIT/CC-BY-SA, while local manifest names only the CC license | `R-SA`; preserve exception/license and confirm intended branch of dual license in any reuse record |
| KiCad | 6 (5 upstream models/license inputs + one locally assembled 2x12 model derived from the 1x12 source) | [pin/license](https://gitlab.com/kicad/libraries/kicad-packages3D/-/blob/e62ed1fc7862da83f789bd562671b5e4b82afcdf/LICENSE.md), local `manifest/kicad.json` records generator and translations | `R-SA`; assembled model is modified/derived library material, and library redistribution is outside the design exception |
| Keebio | 2 | [pin](https://github.com/keebio/Keebio-Parts.pretty/tree/1486bef23f020c31bf69123c93da199850cc7243), [MIT](https://github.com/keebio/Keebio-Parts.pretty/blob/1486bef23f020c31bf69123c93da199850cc7243/LICENSE) | `P-MIT` |
| Koktoh | 2 (STEP + WRL) | [pin](https://github.com/koktoh/keyswitch_model/tree/2b6bcfac0032f1547e27b18b9a897e065e544b37), [README license statement](https://github.com/koktoh/keyswitch_model/blob/2b6bcfac0032f1547e27b18b9a897e065e544b37/README.md#L61-L67); no upstream LICENSE file at this pin | `R-NC-SA`; retain author/source/README evidence and local legal-code copy |
| Foostan | 1 | [pin](https://github.com/foostan/kbd/tree/1f12004a1c9714d0eabec4028c9ae4b259b41562), [MIT](https://github.com/foostan/kbd/blob/1f12004a1c9714d0eabec4028c9ae4b259b41562/LICENSE) | `P-MIT` |
| GDEK | 1 | [pin](https://github.com/GilDev/GDEK/tree/629946873bc59c02567fb481bec7ae97d9bc59f8), [CERN-OHL-S-2.0](https://github.com/GilDev/GDEK/blob/629946873bc59c02567fb481bec7ae97d9bc59f8/LICENCE.txt) | `R-OHL-S` |
| Tsuki | 1 | [pin](https://github.com/42willow/tsuki/tree/6ec3f66f3d0cb087d3a061690aaaaf412537c12d), [MIT](https://github.com/42willow/tsuki/blob/6ec3f66f3d0cb087d3a061690aaaaf412537c12d/LICENSE) | `P-MIT` |

Model binding does not transfer the footprint's license to the model or the model's license to the JavaScript source. Catalogue rows should therefore carry separate `footprint_license_status` and `model_license_status` fields.

## External catalogue candidates

These checks used each repository's exact HEAD below and searched the complete tree for root or nested `LICENSE`, `LICENCE`, `COPYING`, and `NOTICE` files plus the first 50 lines of every JavaScript file for license statements.

| Candidate and checked pin | Observed evidence | Status |
| --- | --- | --- |
| [ImStuBTW/ergogen-v4-footprints@be2f02d](https://github.com/ImStuBTW/ergogen-v4-footprints/tree/be2f02dd05ba3648b0366d443c7342c3a892d70c) | 9 JS; no repository license file; 0 license headers. README says `gbareversible.js` is based on HDR's Game Boy library, which adds a downstream provenance dependency rather than permission. | All 9 `L-ONLY`; metadata/link only. |
| [jusdisgi/ergogen-footprints@ce4311a](https://github.com/jusdisgi/ergogen-footprints/tree/ce4311a3b015955fee098d121700e3c9712ef7e0) | 26 JS; no repository license file. Exactly two files preserve SPDX: [mounting_hole_npth.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mounting_hole_npth.js) is MIT and [mounting_hole_plated.js](https://github.com/jusdisgi/ergogen-footprints/blob/ce4311a3b015955fee098d121700e3c9712ef7e0/mounting_hole_plated.js) is CC-BY-NC-SA-4.0. Many other files name authors/bases but state no license. | Two `F-FILE`; remaining 24 `L-ONLY`/possible `H-3P`. |
| [AlexSutila/ergogen-footprints@eaf27a7](https://github.com/AlexSutila/ergogen-footprints/tree/eaf27a762721f650575860a2370b6637b1e994d3) | 2 JS; no repository license file; 0 license headers. One file links to product imagery, not a reuse license. | Both `L-ONLY`. |
| [Pipshag/goosekb@ed0fef5](https://github.com/Pipshag/goosekb/tree/ed0fef52e41dc3ddbab6c6e5f7f4706600499ad9) | 8 JS under `footprints/custom`; no repository license file; 0 license headers. Four headers credit Infused-Kim/Ergogen but supply no license statement. | All 8 `L-ONLY`, with four additional provenance dependencies. |
| [CardboardMechanic/ergogen_footprints@36ad629](https://github.com/CardboardMechanic/ergogen_footprints/tree/36ad629b3bc4595cfb34bc5cc74787305ec58e2d) | 14 JS. [README](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/README.md#L119-L132) displays CC-BY-NC-SA. [LICENSE.txt](https://github.com/CardboardMechanic/ergogen_footprints/blob/36ad629b3bc4595cfb34bc5cc74787305ec58e2d/LICENSE.txt) is MIT but names Marco Massarelli, not the repository owner. Exactly two files preserve specific headers: `battery_connector_jst_ph_2.js` MIT and `nice_nano.js` CC-BY-NC-SA-4.0. | Whole repository `H-CONFLICT`; two `F-FILE`; other 12 hold pending author clarification and upstream provenance. |

Do not interpret a GitHub API `license: null`, `NOASSERTION`, or license detector result as the sole evidence. The classifications above come from the pinned tree, README, license-file and file-header checks together.

## Conflict and unknown list

1. Infused-Kim README says BY-SA, its TLDR says no commercial use, and its LICENSE is BY-NC-SA. No per-file markers resolve the 15 JavaScript files.
2. Infused-Kim's 33 model assets include many third-party sources whose original artifact terms are not carried as file-specific records. Treat model and footprint rights separately.
3. Two Infused-Kim Choc models are byte-identical to older KiSwitch files, while the Infused source README credits later ScottoKeebs copies. Original authorship was not resolved by the two bounded chronology probes.
4. KiSwitch upstream describes the library as dual MIT/CC-BY-SA; local `manifest/kiswitch.json` and the bundled license preserve only the CC-BY-SA branch. This is safe as a conservative statement but incomplete provenance metadata.
5. Koktoh has an explicit NC-SA statement in README but no LICENSE file at the pin. The local package adds a full legal-code copy; record that it is a local preservation of the referenced license, not an upstream file.
6. CardboardMechanic's README and LICENSE.txt conflict, and LICENSE.txt carries another author's copyright. Repository-wide reuse is not supported by coherent evidence.
7. ImStuBTW, AlexSutila and Pipshag have no repository license and no headed JS files. Jusdisgi has only two headed exceptions; CardboardMechanic has only two headed exceptions.
8. Several candidate files say “based on,” “adapted,” or credit another project without stating the upstream artifact's license. Credit is provenance evidence, not a permission grant.

## Catalogue fields that preserve the boundary

For every borrowable item record: `source_repository`, immutable `source_commit`, exact `source_path`, `artifact_kind` (`footprint-source`, `model-source`, `generated-model`, `reference-footprint`), `license_expression_as_stated`, `license_evidence_url`, `copyright_or_author`, `derived_from`, `modifications`, `redistribution_status`, and `unresolved_conflicts`. Keep one row per artifact; do not inherit repository license into third-party bundled models.

## EXPAND

none — the assigned repository candidates, local manifests, per-file headers, model/footprint boundary, and authoritative license statements were checked; the unresolved items require author/original-source clarification rather than another catalogue search angle.

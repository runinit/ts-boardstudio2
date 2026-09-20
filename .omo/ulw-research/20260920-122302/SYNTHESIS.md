# Footprint audit and master catalogue

- [Existing-footprint audit](AUDIT.md): all 39 borrowed modules, pad/net mappings, side and reversible behavior, confirmed defects, and qualification gaps.
- [Master GitHub catalogue](MASTER_CATALOGUE.md): 346 module records across 27 repositories, plus seven context-only repositories. Includes immutable source links, declared net interfaces, selected options, and license caveats.
- [CSV inventory](catalogue.csv) and [full JSON inventory](catalogue.json).

The most urgent findings are a Choc option combination that assigns both socket contacts to one net, incorrect MX track net metadata, hardcoded Infused MCU track net IDs, and keepout side parsing that can emit `NaN.Cu`. A diode option combination emits no pads. These findings are reproduced and scoped in the audit; no product fixes were made.

Native generation checks ran through Board Studio. Desktop KiCad roundtrip/DRC and physical assembly were not verified because KiCad CLI is unavailable and no physical hardware was tested. External catalogue entries are source inventories, not approved footprints.

[Independent refinement](REFINEMENT.md), [execution review](execution-review.md), [visual QA](VISUAL_QA.md), [source ledger](sources.md), and [run statistics](RUN.json) retain the evidence.

# Intent versus reality

| ID | Expected truth | Observed reality | Diff / invariant | Intent source | Observations | Status | Claims |
|---|---|---|---|---|---|---|---|
| I1 | Borrowed source traceable to pins/patches |39 hashes accounted; patch descriptions sometimes incomplete | Integrity true; narrative provenance needs precision | User borrowed footprints audit | provenance and actual diffs | true with documented caveat | C01,C17 |
| I2 | Pads and tracks preserve intended independent signals | Choc collapse, MX/vendor MCU tags, pad6 alias, padless option | Signal membership / copper ownership violated | User correct pad mappings | native PCB outputs | violated | C02–C09,U01,U02,U04 |
| I3 | Side/reversible variants implement declared intent | family-specific semantics; keepout invalid default; selected options misleading | Variant contracts violated in named cases | User front/back/reversible | verify-switches/edge/local | violated | C02,C03,C06,C08–C12,U03,U06 |
| I4 | Staging preserves copper and native conversion correctly interprets it | raw/staged summaries equal; fixed IDs remain wrong; shorthand typing fails | Fidelity is not repair | User changes KiCad footprint | staging-comparison/native outputs | violated for interpretation; measured staging fidelity true | C04,C10,C13,R04 |
| I5 | Master list has pinned source, contract and provenance |346records27positive/34inspectedrepos; legacy flags and license gaps explicit | Source inventory complete within inspected set; no runtime/fabrication claim | User popular GitHub master list | catalogue/repo metadata/license audit | true within declared scope | C15–C17,U05 |
| I6 | Audit evidence distinguishes proof levels | repeated root execution, fresh reviews, DRC unavailable, supplementary6smoke only | limitations retained | Research workflow | receipts and QA | true | C14,C18,U01–U06 |

# Intent versus reality

| ID | Expected | Observed/diff | Violated invariant | Intent source | Observations | Status | Claims |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I1 | Electrical footprints retain required pads | Diode incompatible options emit0; normal contacts remain | Component terminal presence | User missing-pads report | verify-core diode-padless and baseline | violated | C03,R03 |
| I2 | Matrix connects through diodes to MCU | Setup-less matrix absent MCU nets; custom toggle mismatches | Required bus/junction membership | User matrix-net request | ui-add-cluster,diode-toggle | violated | C01,C02,C06,C08 |
| I3 | Components receive intended assignments | Inherited override loss, metadata divergence, blank-template disconnect | Effective wiring preserved and complete | User diode/LED/MCU request | core probes, imported-pad probes | violated | C04–C08,C11,C12 |
| I4 | KiCad output preserves usable intended connectivity | Serialization preserves supplied logical nets, including bad app assignments; name-only is valid; exact user/desktop unknown | Correct net identity and membership | User KiCad requirement | exported PCB/source parser | unknown | C01–C14,U01 |

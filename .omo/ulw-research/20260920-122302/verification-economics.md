# Verification decisions

| Claim / batch | Risk / error cost | Verification cost | Chosen path | Decision and result | Residual risk |
|---|---|---|---|---|---|
|C01 provenance|medium, wrong borrowed source|39hash comparisons cheap|pinned clones+manifest+retained diffs|verify;39complete|semantic patch reason omissions|
|C02/C03/C08 switches|high defective PCBs|45cases/source cheap|distinct nets+rotations native+upstream|verify; defects scoped|desktop DRC/physical assembly|
|C04–C07 family scope|high wrong copper|132raw cases cheap|native generation+parsedpads/tracks|verify;131generate1reject, not131electrical passes|zones initially absent fromsummary, corrected edge batch|
|C13 staging|medium incorrect blame|132staged cases cheap|raw/staged132case comparison|verify;selected inventories equal|models/full geometry not compared|
|C09/C10 options|high invalidboard|10native calls cheap|keepout4,SSD2,MCUtoggles4|verify; retained PCB/JSON|desktop acceptance unknown|
|C18 supplementary|medium scope ambiguity|6native cases cheap|default distinct-net smoke|verify;6generate|no fullvariant orphysical audit|
|C14 existing suite|medium falseassurance|seconds|actualpnpm+Node24|pass;limited test scope|electrical separation not universally tested|
|C15/C16 external inventory|medium incorrect catalogue|AST+allhashes modest|346pinnedfiles34repos|verify;legacy12 marked|notexternal runtimequalification|
|C17 license notices|high incorrect permission|read primary records modest|perfile notices+actualLICENSE/README|verify statements only;unknowns retained|no legal clearance|
|U01–U06 physical/DRC|high fabrication risk|requires absent binary/hardware|do not infer from source|defer explicit unresolved|fabricationnotqualified|

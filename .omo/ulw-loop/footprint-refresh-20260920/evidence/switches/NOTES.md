# Switch electrical corrections

Hypotheses distinguished by the native engine regression: (1) Choc B single-side same-side contact selects wrong net; (2) MX unplated reversible route tags disagree with independently assigned contact nets; (3) mount control flags and width controls do not affect their declared geometry. The passing controls isolate option-specific failures rather than parser/rotation behavior.

RED: refreshSwitches.test.mjs initially ran 180 native-engine cases and produced 18 assertion failures (six per rotation). 162 controls passed before production edits. See red.txt. GREEN: strengthened endpoint-in-pad checks and default/narrow route width variants produce 186 passing cases. See green.txt. Native probe separately generates all original audit cases and asserts direct-body/native equivalence and engine-inspector pad counts: native.jsonl.

Corrections:
- Choc B full inner contact now uses TO when hotswap_pads_same_side, matching the existing chamfered inner contact selection. Distinct FROM/TO survives the single-side unplated option.
- MX normal reversible routing: inner-pad chain and its via use TO, outer-pad chain and its via use FROM. This corrects net metadata, not a demonstrated physical short. Geometry remains unchanged.
- MX stabilizer nets depend on include_stabilizer_nets, independently of the center-hole net flag. Plating remains required.
- MX outer widths now use the literal front/back controls. The inward edge stays at abs(x)=5.81. Default width deliberately changes from hardcoded2.55 to declared2.6, moving the outward edge from8.36 to8.41. Minimum documented1.6 retains route endpoint coverage. No hidden0.05 offset is added to user parameters.

Validation: Node24.14.0. mxModels.test.mjs, chocModels.test.mjs, chocStabilizers.test.mjs, and chocV2Models.test.mjs passed. No model transformations changed. No debug instrumentation remains in production. Native probe and RED/GREEN logs are retained intentionally as requested evidence.

Limits: engine-native KiCad output and semantic geometry checks only. No fresh KiCad GUI/export, global DRC, whole-board edge clearance, manufacturer fit proof or complete segment-intersection analysis was performed. Width increase can reduce clearance to an existing board edge by0.05mm. Historical model export evidence is not renewed by these tests. Choc combined mounting pad-number/net conventions remain outside this correction.

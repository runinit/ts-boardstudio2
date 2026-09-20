# Wave1 D geometry_graph
Observed 2026-09-20, current staged tree348e0e5.

One-shot scene-identity/full-config handoff is not cross-edit incremental caching. Per-parse JSON model offset memo. Potential costs: all-feature resolution, pairwise validation, containment, region union. Freeze key miss is expected candidate because snapshot source changes; must measure work not infer duplicated fullcost. Cache dependencies include selected matrices/envelopes/units/assets/bridges/exports.

Sources: engine/src/ergogen.js:20-105; engine/src/designs/index.js:48-349; engine/src/designs/geometry.js:42-190; engine/src/native/geometry.js:6-96

## EXPAND
- LEAD: Outline staging may miss after freezeOutlines because source/config changes. WHY: full serialized config key. ANGLE: count geometry operations for keep/rebuild/freeze and validate whether snapshots make recomputation cheap.

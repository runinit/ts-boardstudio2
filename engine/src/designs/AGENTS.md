# Design Compiler Guidelines

## OVERVIEW

Mechanical feature graph, enclosure analysis, and CAD output; distinct domain, score 8.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Feature resolution | `index.js` | Named dependencies, cycle checks, publication, caches |
| Planar geometry | `geometry.js`, `finishing.js`, `bridges.js` | Tolerances, containment, offsets, finishing |
| Sketch constraints | `sketches.js`, `solver.js` | Asynchronous solve before deterministic graph resolution |
| Assembly variants | `assemblies.js`, `enclosure-spec.js` | Assembly compilation and enclosure normalization |
| Guided analysis | `enclosure-analysis.js`, `mounts.js` | Findings, contact placement, mounting plans |
| Board integration | `board-inventory.js`, `board-link.js` | Imported inventory and adapter attachment |
| Solid generation | `enclosures.js`, `solid-kernel.js` | Shared solids, exports, native handle lifecycle |
| Manufacturing | `manufacturing.js`, `pocket-plan.js`, `tooling.js` | Process constraints and machining operations |
| Model references | `native-models.js`, `mesh-import.js`, `overlap.js` | Component geometry and intersection checks |

## CONVENTIONS

- Features reference `section.id`; missing references and cycles are errors.
  Published profile names must not collide with existing outputs.
- Snapshots contain finished paths in feature coordinates. Do not re-evaluate
  the recipes from which a snapshot was frozen.
- Use the shared geometry tolerance and diagnostics helpers for geometric
  operations; findings retain feature/source paths and repair information.
- `analysis: true` resolves outlines, inventory, and plans without opening
  the CAD kernel. Full compilation produces solids from those design inputs.
- A stable `analysisCache` permits mount/gasket/count/spacing changes to reuse
  contours; other configuration or asset changes invalidate cached analysis.
  Rebuild layout/mounting findings for each request; solids do not use that cache.
- Outline transfer is scoped to a prepared scene and consumed once. Keep cached
  geometry isolated from callers that can mutate returned models.

## ANTI-PATTERNS

- Do not join separate regions by clearance alone; use named bridges.
  Aligned bridges require feature-only anchors and cannot specify `ends`.
- Protected gaps and intentional cutouts must survive filling and finishing.
- Do not reconstruct native board inventory by reparsing its exported PCB.
- STEP and mesh exports come from the same compiled solids. Keep native handle
  cleanup in the kernel adapter; STEP must not be a wrapper around mesh triangles.

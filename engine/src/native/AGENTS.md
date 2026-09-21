# Native Compiler Guidelines

## OVERVIEW

Document-to-scene compilation and physical placement; distinct domain, score 8.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Parse and locate diagnostics | `document.js` | YAML ranges, duplicate keys, validation, stackup linking |
| Schema changes | `schema.js` | Source for JSON Schema and standalone AJV validator |
| Nominal placement | `layout.js`, `draft.js` | Dependency resolution, clusters, mirrors, layout-only report |
| Constraint solving | `constraints.js`, `alignment-seed.js` | Planar solver freedoms and follower seeds |
| Transform math | `frames.js` | Row-major matrices, column vectors, millimetres and degrees |
| Physical geometry | `geometry.js`, `guides.js`, `clearance.js` | Envelopes, projections, reference guides, findings |
| Board compilation | `pcbs.js`, `boards.js` | Stable references, inventory, assembly attachment |
| Sheet stacks and models | `stackups.js`, `footprint-models.js` | Nominal sheets, reference solids, model bindings |

## CONVENTIONS

- Edit `schema.js`, then run `pnpm --dir engine build:schema` from repository
  root. `engine/scripts/build-schema.js` produces `ergogen-v1.schema.json` and
  `validate.js`. Update public declarations and native tests with contract changes.
- AJV validation must not coerce, default, or remove authored values. Parsing
  clones validated data before stackup linking.
- Diagnostics carry `feature`, `sourcePath`, `code`, `severity`, and `message`;
  `document.locate` enriches findings with YAML locations when available.
- Placement composes parent frame, local translation, Z rotation, then X tilt.
  Assembly coordinates are right-handed, with positive Y and Z upward.
- Mirrored IDs derive from source IDs, not array position. Physical layer
  membership and electrical PCB membership remain separate.
- Constraint solving changes only declared freedoms; locks remove freedoms.
  Re-resolve dependent frames after solving without mutating the authored input.

## ANTI-PATTERNS

- Never hand-edit `ergogen-v1.schema.json` or `validate.js`.
- Guides and physical centers are references, not additional layout objects.
- Do not replace unknown component dimensions with generic key rectangles.
- Do not apply KiCad's Y-axis conversion in the shared assembly frame math;
  footprint emission handles the export convention.
- Do not tie PCB references to presentation labels or model overrides.

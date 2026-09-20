# Wave1 H geometry_alternatives
Observed 2026-09-20, current staged tree348e0e5.

Candidate Clipper2 integer/double-scaled polygons and offsets; Martinez JS boolean-only. Native vs browser packaging and analytic-to-polygon fidelity costs unresolved. Claimed pinned SHAs must independently verify. No product speedup measured.

Sources: https://github.com/AngusJohnson/Clipper2; https://github.com/w8r/martinez; https://www.boost.org/doc/libs/latest/libs/geometry/doc/html/geometry/reference/algorithms/buffer/buffer_7_with_strategies.html

## EXPAND
- LEAD: Verify maintained Clipper2 Emscripten/TypeScript wrapper and real browser distribution. WHY: upstream languages do not establish WASM packaging. ANGLE: source/build/license/precision/holes/worker transfer.

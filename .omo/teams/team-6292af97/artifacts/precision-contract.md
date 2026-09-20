# Geometry correctness and precision contract research

Accessed 2026-09-20T11:56:31-04:00. Scope: Board Studio engine geometry, finishing,
serialization, export, tests, and the app publication boundary. This is a
research handoff, not a performance result. No runtime experiment was run.

## Executive finding

Board Studio currently has several independent precision regimes rather than a
single precision contract:

| Regime | Observed value | Use | Anchor |
| --- | ---: | --- | --- |
| Design tolerance | 0.01 mm | General acceptance; also documented as maximum Bézier chord error | `engine/src/designs/geometry.js:5` |
| Predicate epsilon | 0.000001 | Near-zero offset and point-on-path checks | `engine/src/designs/geometry.js:6,66,117` |
| Arc collapse adjustment | 0.001 mm | Retrying nearly degenerate rounded arcs | `engine/src/designs/geometry.js:7,155-180` |
| Offset repair increment | 0.1 mm | Repeated offset repair | `engine/src/designs/geometry.js:9,85-92` |
| Solver residual | 0.00001 | Sketch fixed-constraint residual; dimensions and angles have different units | `engine/src/designs/sketches.js:8,201-210` |
| MakerJS chain matching | 0.005 mm | Chain connectivity and closure | `engine/node_modules/makerjs/dist/index.js:5937-5961,6033-6037` |
| MakerJS ignored short path | 0.001 mm | Non-circle paths below matching distance / 5 are omitted from chains | `engine/node_modules/makerjs/dist/index.js:5972-6000` |
| SVG numeric accuracy | 0.001 mm | Default MakerJS SVG coordinate rounding | `engine/node_modules/makerjs/dist/index.js:7366-7378` |
| DXF numeric accuracy | 0.0000001 | MakerJS default numeric rounding when Board Studio passes no accuracy option; coordinates/radii are millimetres and arc angles are degrees | `engine/node_modules/makerjs/dist/index.js:153-158,4586-...`; `engine/src/io.js:99-116` |
| Solid mesh tolerance | 0.01 mm | STL tessellation linear tolerance | `engine/src/designs/solid-kernel.js:4,141-145` |

**Observation:** these values are independently applied and their errors are
not allocated or composed. `TOLERANCE` serves both as an approximation budget
and as a geometric acceptance threshold. A second approximation can therefore
consume another 0.01 mm without any code checking a total budget.

**Recommended contract:** keep one canonical committed analytic model, name the
individual budgets by purpose, and keep all approximate interaction geometry
outside clearance, findings, snapshots, source mutation, and export. If a
committed approximation is introduced, its certified error must be deducted
from a declared total budget rather than compared independently with 0.01 mm.

## Local geometry and finishing behavior

### Canonical curves and validation

- `engine/src/designs/geometry.js:65-96` performs analytic MakerJS offsets.
  Positive offsets are extent-checked within 0.01 mm, retried in smaller steps,
  and then repaired in 0.1 mm increments. Negative offsets are returned without
  this extent check; downstream callers supply validity and containment checks.
- `geometry.js:98-128` obtains chains with MakerJS's default matching distance,
  requires closed contours and no loose/endless paths, and allows a pairwise
  path intersection only when it lies at endpoints within `EPSILON`.
- `geometry.js:129-149` implements containment by splitting at analytic
  intersections and sampling each split path with `m.path.toPoints(path, 3)`.
  For a non-circle line or arc, MakerJS produces endpoints and one midpoint
  (`makerjs/dist/index.js:1393-1405`). Boundary membership is accepted within
  0.01 mm.
- `geometry.js:192-215` recursively flattens cubic Béziers by de Casteljau
  subdivision. A chord is accepted when both inner control points are at most
  0.01 mm from the finite chord segment. Recursion fails after depth 24.
- `engine/src/designs/sketches.js:39-45,224-227` turns an authored cubic into
  the flattened line model above; arcs and circles remain analytic.
- `engine/src/native/schema.js:25-31` allows snapshot geometry to contain only
  lines, arcs, and circles. `engine/test/unit/outline_snapshot.js:18-27` confirms
  that analytic arcs and circles are preserved.

**Derived error bound, cubic Bézier:** each emitted Bézier chord has symmetric
Hausdorff distance at most 0.01 mm from its corresponding curve segment. The
finite-segment 0.01 mm neighborhood is convex. All four Bézier control points
are inside it, so every convex combination forming the Bézier lies inside it.
Conversely, scalar projection of the continuous curve onto the chord direction
runs continuously between both chord endpoints, so every chord position has a
curve point with the same projection and at most 0.01 mm normal displacement.
This is a mathematical consequence of the implemented test, not a measured
result. The current unit test checks only closure and the reported tolerance
(`engine/test/unit/design_sketches.js:59-66`).

**Counterexample / limitation:** the containment routine's three samples after
intersection splitting are an implementation heuristic, not a certificate of
set containment. A narrow excursion between samples or a numerically missed
intersection can evade it. Its 0.01 mm boundary band also permits a boundary to
be treated as coincident without recording how much of the total error budget
was consumed.

### Finishing and simplification

- `engine/src/designs/finishing.js:53-83` repeatedly removes a connector when
  its cumulative path length is at most the user `limit`, both adjacent retained
  lines are longer than `limit`, and the lines intersect within `limit` of their
  endpoints. Each accepted mutation is validated and must contain the current
  model.
- `finishing.js:85-89,229-255` compares the number of outer and nested contours
  before and after corner operations, then validates and requires containment.
- `finishing.js:147-166` subdivides bevel arcs into spans of at most 90 degrees.
  It uses circumscribed segments on outside arcs to retain clearance and chords
  on inside arcs.
- `engine/src/designs/index.js:140-172` computes required clearance, then applies
  rounding, simplification, corner treatment, and modifications. Each
  modification is validated and must contain the required model; the final
  result is validated and containment-checked again.
- `engine/test/unit/native_finishing.js:65-99,112-121,141-150` verifies selected
  fillet/chamfer/clearance examples and one short-jog simplification case.

**Observation:** the simplifier has no global Hausdorff guarantee relative to
the original input. It mutates the model after each local shortcut and does not
retain the original as an error reference. Repeated individually bounded moves
can accumulate beyond `limit`. The containment checks preserve an intended
one-sided clearance relation on the examples, but do not prove a global metric
bound. `topology()` counts nested contours; equality of those counts is weaker
than isotopy and does not rule out all changes in adjacency or narrow features.

**Recommendation:** either describe the existing parameter as a local shortcut
budget, or use a topology-preserving simplifier with an explicit stop predicate
against the original geometry. CGAL's official polyline simplification manual
defines topology preservation as avoiding new intersections and nesting changes
and offers a maximum squared-distance cost from removed input vertices to the
replacement segment. That result applies to polylines; analytic arcs must first
receive a declared tessellation budget or use an analytic circular-arc kernel.

Primary source: [CGAL 2D Polyline Simplification User
Manual](https://doc.cgal.org/latest/Polyline_simplification_2/index.html).

### Clearance invariants

- `engine/src/designs/index.js:140-172` establishes the intended committed
  invariant: when clearance is positive, the required set is the occupied model
  offset outward by that clearance; all accepted finishing/modification output
  must contain the required set.
- `index.js:260-277` fills incidental holes before finishing, subtracts protected
  gaps, rejects boundary intersections with protected gaps, rejects unbridged
  mergers of regions, applies intentional cutouts only after occupied-area
  validation, and validates the result.
- `geometry.js:129-149` is therefore the enforcement mechanism and inherits the
  sampling and floating-intersection limitations above.

**Derived conservative rule for an approximate proxy:** if the exact occupied
set `A` and proxy `P` have symmetric Hausdorff distance at most `e`, then
`A ⊆ P ⊕ e`. Testing the proxy after outward dilation by `clearance + e`
avoids a false-safe result for a single approximated occupied boundary. If both
opposing boundaries have independent error `e`, reserve `2e`. This metric bound
does not preserve topology. Holes and inward offsets require directional error
bounds with the opposite sense, so the safest current rule is to exclude preview
geometry from acceptance entirely.

## Export invariants

- `engine/src/io.js:99-116` originates the model in millimetres and exports DXF
  for every outline, with SVG optionally emitted. It supplies no explicit
  accuracy option.
- MakerJS DXF emits analytic `LINE`, `CIRCLE`, and `ARC` entities
  (`makerjs/dist/index.js:4586-...`). Because no accuracy is supplied, its
  implementation default rounds numbers to 1e-7. This is an observed dependency
  implementation detail, not an explicit Board Studio API promise.
- MakerJS SVG also retains line/arc/circle path commands but defaults coordinate
  accuracy to 0.001. Its official exporting documentation exposes that default.
- `engine/src/templates/kicad8.js:6-35` emits analytic lines, arcs (start/mid/end),
  and circles with JavaScript numeric strings and no additional tessellation.
- `engine/src/designs/solid-kernel.js:30-61` builds analytic OCCT edges and wires,
  snaps the next endpoint only when its gap is at most 0.01 mm, and otherwise
  fails. `solid-kernel.js:75,87-93` applies 2D validation and OCCT BRep validity
  and positive-volume checks. STEP retains BRep geometry; STL uses linear mesh
  tolerance 0.01 mm (`solid-kernel.js:141-145`).

Primary sources:

- [MakerJS exporting documentation](https://maker.js.org/docs/exporting/)
- [MakerJS model API: simplify](https://maker.js.org/docs/api/modules/makerjs.model.html)
- [Open CASCADE Mesh User's Guide](https://occt3d.com/dev/doc/overview/html/occt_user_guides__mesh.html)
- [Open CASCADE `IMeshTools_Parameters`](https://occt3d.com/dev/doc/refman/html/struct_i_mesh_tools___parameters.html)

**Observed endpoint risk:** MakerJS chain closure accepts endpoints within 0.005
mm rather than requiring equal coordinates, and excludes a non-circle path
shorter than 0.001 mm from chain construction. The raw analytic coordinates can
therefore describe a contour that Board Studio calls closed while adjacent
exported entity endpoints remain distinct. Whether a given downstream CAD/CAM
consumer heals that gap is external behavior and was not measured.

**Recommended export contract:**

1. The committed model remains analytic lines/arcs/circles; an authored cubic is
   the sole currently certified flattening, with 0.01 mm Hausdorff error.
2. DXF, SVG, and mesh accuracy are passed explicitly. Do not inherit dependency
   defaults silently.
3. Connectivity is canonicalized or rejected under a named `joinTolerance`.
   Closedness should not imply coordinate identity unless snapping was performed.
4. STEP/DXF/KiCad keep analytic curves. STL is explicitly an approximate mesh;
   its metadata should report the linear deflection used.
5. SVG's 0.001 mm rounding and any earlier approximation are included in the
   declared total committed error budget.

## Tessellation

For a circular arc of radius `r`, chord central angle `d`, and sagitta `e`:

`e = r * (1 - cos(d/2))`

Therefore a tessellation constrained to sagitta `e_max` uses

`d_max = 2 * acos(1 - e_max/r)` and
`N = ceil(abs(sweep) / d_max)`.

**Derived examples for `e_max = 0.01 mm`:**

| Radius | Full circle segments | Quarter-circle segments |
| ---: | ---: | ---: |
| 2 mm | 32 | 8 |
| 10 mm | 71 | 18 |
| 100 mm | 223 | 56 |

An angular-deflection limit can require more segments. Open CASCADE documents
linear deflection as the maximum distance between the tessellation and source
curve and angular deflection as the maximum angle between consecutive segments.
It also documents the quality/mesh-size tradeoff; no Board Studio runtime or
memory conclusion follows without an experiment.

Clipper2's official documentation says offset arcs are flattened. Its default
arc tolerance is `offset_radius / 500`; that is 0.004 mm for a 2 mm offset and
0.02 mm for a 10 mm offset. **Derived consequence:** the default exceeds Board
Studio's 0.01 mm design budget whenever the offset radius exceeds 5 mm. A
Clipper2 implementation would need an explicit arc tolerance at or below the
allocated budget.

Primary sources:

- [Clipper2 `ArcTolerance`](https://www.angusj.com/clipper2/Docs/Units/Clipper.Offset/Classes/ClipperOffset/Properties/ArcTolerance.htm)
- [Clipper2 offset notes](https://www.angusj.com/clipper2/Docs/Units/Clipper.Offset/Classes/ClipperOffset/_Body.htm)
- [Clipper2 `InflatePaths`](https://www.angusj.com/clipper2/Docs/Units/Clipper/Functions/InflatePaths.htm)
- [Clipper2 FAQ](https://www.angusj.com/clipper2/Docs/FAQ.htm)

## Robust predicates and kernels

Jonathan Shewchuk's primary paper establishes why a fixed floating epsilon is
not a robust substitute for the sign of orientation and incircle determinants:
ordinary floating arithmetic can return the wrong sign near degeneracy. His
adaptive predicates use exact arithmetic only to the degree required by the
input's uncertainty.

Primary sources:

- [Adaptive Precision Floating-Point Arithmetic and Fast Robust Geometric
  Predicates](https://people.eecs.berkeley.edu/~jrs/papers/robust-predicates.pdf)
- [Official robust predicates code page](https://www.cs.cmu.edu/~quake/robust.html)

**Boundary of that result:** `orient2d`/`incircle` harden polygon classification
but do not by themselves construct robust line-circle or circle-circle
intersections, offsets, or booleans. Board Studio's committed model retains arcs
and circles, so adopting only polygon predicates is incomplete.

Evaluated choices:

| Choice | What it certifies | Cost / disconfirming case |
| --- | --- | --- |
| Harden current MakerJS path | Keeps analytic output and smallest semantic change | Still needs explicit join/rounding policies, adversarial tests, and robust construction around tangency/near-degeneracy |
| Adaptive exact polygon predicates | Correct orientation/incircle signs | Does not cover circular constructions or analytic offset/boolean operations |
| Clipper2 integer polygon kernel | Robust polygon clipping/offset on a declared coordinate grid | Requires tessellating every curve and loses analytic arcs; arc fitting back adds another approximation |
| CGAL exact circular kernel | Exact predicates and exact constructions for lines and circular arcs | C++/WASM integration and Board Studio performance are unknown until measured |

CGAL's official `Exact_circular_kernel_2` documentation explicitly promises
exact predicates and exact constructions for line and circular-arc types:
[CGAL circular kernel geometric classes](https://doc.cgal.org/latest/Circular_kernel_2/group__PkgCircularKernel2GeometricClasses.html).

Clipper2 internally uses integer coordinates and converts floating inputs at a
selected decimal precision. If grid spacing is `q` and coordinates are rounded
to the nearest grid point, **derived bounds** are at most `q/2` per axis and
`q/sqrt(2)` Euclidean displacement per point. For `q = 0.001 mm`, that is about
0.000707 mm per point; the worst independent displacement difference between
two points is `sqrt(2)q`, about 0.001414 mm. Grid robustness still removes or
merges features below the grid scale.

PostGIS/GEOS documentation reinforces an explicit boundary policy: reduced
precision can preserve validity while removing features smaller than the grid,
and a precision/tolerance policy belongs at API boundaries rather than as one
global magic value.

- [PostGIS `ST_ReducePrecision`](https://postgis.net/docs/manual-dev/en/ST_ReducePrecision.html)
- [PostGIS/GEOS precision and tolerance internals](https://postgis.net/development/docs/internals/precision-tolerance/)

## Arc fitting

Arc fitting should not replace arcs that Board Studio already stores
analytically. Fitting is relevant only if a polyline-only preview or kernel is
later compressed.

The Held/Eibl biarc work describes approximation inside a user-specified
tolerance band and preservation of simplicity; Gribov distinguishes the cheap
candidate arc fit from the material work of verifying that the arc remains
within tolerance and respects endpoint/direction constraints.

Primary sources:

- [Held and Eibl, *Biarc approximation of polygons within a prescribed
  tolerance*](https://www.sciencedirect.com/science/article/pii/S0010448504000983)
- [Gribov, *Approximation of a polyline with a sequence of geometric
  primitives*](https://arxiv.org/abs/1604.07476)

**Evaluation:** a three-point circle or least-squares residual is insufficient
for committed geometry. A candidate fit needs continuous maximum-error
verification, endpoint and tangent/direction constraints, a simplicity/topology
check, and a one-sided/asymmetric error band where clearance is involved. Arc
fitting after tessellation cannot restore the exact original arc and spends a
second approximation budget. No runtime claim follows from the papers for this
codebase.

For metric terminology, directed Hausdorff distance supports one-sided
clearance statements while symmetric Hausdorff distance bounds mutual geometric
deviation. Neither alone preserves topology. Source: [Bringmann et al., curve
simplification and Hausdorff/Fréchet definitions](https://arxiv.org/abs/1803.03550).

## Approximate preview versus exact committed geometry

The app already has the right publication boundary:

- `app/src/workers/studioPipeline.ts:36-73` solves layout, produces the outline
  stage, optionally freezes exact feature geometry, and then runs the full
  `ergogen.process`; success is published only after the full process.
- `app/src/hooks/useStudio.ts:83-115` deliberately does not merge outline-stage
  `results` into the committed result. `useStudio.ts:165-171` treats results as
  stale until completion.
- `app/src/molecules/StudioExport.tsx:50-55,98-107,153-185` requires a non-stale
  result and no blockers for archive/per-sheet exports.
- `app/src/utils/studioOutline.ts:28-67,193-211` snapshots exact line/arc/circle
  models and freezes all managed exact feature models.

**Proposed invariant:** an approximate drag preview may enter only a render-only
message/state channel. It must not update the committed `result`, source,
snapshots, clearance/findings, PCB generation, or any export. During preview,
continue to show the last exact result as stale or show a separately labelled
proxy. On drag settlement, run the existing exact pipeline; only its successful,
current generation can clear stale state and enable export.

If the renderer wants a pixel-space preview budget, use
`previewErrorMm <= pixelBudget / pixelsPerMm`. Selecting a perceptual
`pixelBudget` (for example 0.25 px) is an **assumption/product choice**, not a
mathematical or measured threshold. It must never relax the committed 0.01 mm
contract.

## Tests needed to enforce a contract

These are proposed verification cases, not completed experiments:

1. Property-sample random and adversarial cubic segments and compute dense
   bidirectional distances to verify the derived 0.01 mm chord bound, including
   cusp-like and near-zero-chord cases.
2. Construct adjacent endpoints separated by 0.0049, 0.0051, and 0.0009 mm;
   assert the intended chain, validation, canonicalization, and every export's
   endpoint behavior.
3. Repeated zig-zag simplification where several legal local shortcuts move the
   boundary in the same direction; measure global directed and symmetric
   Hausdorff error against the original.
4. Near-tangent line/arc and arc/arc intersections on both sides of every
   predicate threshold; assert stable topology and containment under translation
   and scale.
5. Narrow holes, short connectors, and contours whose excursion lies between
   endpoint/midpoint samples; verify `contains` does not produce false inclusion.
6. Export/re-import DXF, SVG, KiCad, STEP, and STL and compare analytic entity
   preservation, endpoint continuity, topology, and directed/symmetric error.
7. Preview protocol test: issue a preview result followed by export while exact
   processing is pending; prove the archive and per-sheet actions cannot consume
   the proxy or a stale exact result.

The existing fixture hashes and the `native_outline_offset` call-count assertion
are useful regression evidence for those fixtures. They do not establish a
general performance result. Any speed recommendation requires a separately
approved benchmark on representative interactive and adversarial designs.

## Claim candidates for synthesis

1. **Observed, high independence:** the local precision stack is mixed and has
   no composed error budget. This comes directly from Board Studio and vendored
   dependency source, independent of the external literature.
2. **Derived from local code, high confidence:** the implemented cubic chord
   acceptance yields a 0.01 mm symmetric Hausdorff bound per emitted segment;
   the suite does not currently test that metric.
3. **Observed, high confidence:** current finishing simplification is an
   iterative local-shortcut procedure and cannot be described as globally
   `limit`-bounded from the original without additional proof or tests.
4. **Observed plus primary-source support:** polygon simplification can preserve
   topology and use explicit distance costs, but the CGAL guarantee does not
   directly cover Board Studio's analytic circular arcs.
5. **Observed plus derived:** Clipper2 would improve polygonal robustness only
   after curve tessellation; its default arc tolerance exceeds 0.01 mm for
   offsets above 5 mm, so an explicit value and grid budget are mandatory.
6. **Primary-source boundary:** adaptive exact orientation/incircle predicates
   solve sign errors for those predicates, not Board Studio's full circular-arc
   construction problem.
7. **Observed app invariant:** the current stage/stale/export flow can host a
   fast render-only approximation while preserving exact committed geometry,
   because outline-stage results are excluded from committed results and stale
   exports are disabled.
8. **No performance claim:** none of the source inspection or cited algorithms
   measures Board Studio latency. Backend selection and interactive benefit
   remain experimental questions.

## Disconfirming cases to keep attached to recommendations

- A 0.004 mm endpoint gap may satisfy MakerJS chain closure while remaining two
  distinct coordinates in an analytic export.
- Several valid local simplifications can accumulate more than one local limit
  from the original boundary.
- Three point samples per split path do not certify containment of a curved set.
- Equal counts of outer/nested contours do not prove unchanged adjacency or
  isotopy.
- Robust `orient2d` does not robustly construct line-circle/circle-circle
  intersections.
- A polygon kernel loses analytic arcs; fitting arcs back is a new approximation.
- Clipper2's default offset arc tolerance violates 0.01 mm above 5 mm radius.
- Reusing 0.01 mm independently for Bézier flattening, acceptance, mesh
  deflection, and a future preview silently stacks error.
- Existing unit fixtures demonstrate examples, not a universal tolerance or
  topology theorem.

## Search coverage

The external sweep used more than ten varied English queries, including exact
phrase, site-restricted, paper-title, documentation, PDF, and implementation
queries across: topology-preserving polyline simplification; maximum Hausdorff
error; adaptive exact predicates; exact circular-arc kernels; Clipper2 arc
tolerance and integer precision; OCCT linear/angular deflection; PostGIS/GEOS
precision reduction; biarc tolerance bands; polyline-to-arc fitting; MakerJS
export precision; DXF analytic entities; and approximate-versus-exact CAD
preview architecture. Claims above link the full primary pages used for
evaluation rather than search-result summaries.

## EXPAND

- **LEAD:** execute the 0.0049/0.0051 mm endpoint-gap fixtures through every
  exporter. **WHY:** source inspection establishes the mismatch but not downstream
  healing/re-import behavior. **ANGLE:** one adversarial model, export and parse
  DXF/SVG/KiCad/STEP, compare endpoint identity and topology.
- **LEAD:** measure cumulative error of current finishing simplification.
  **WHY:** local mutation proves absence of a simple global guarantee, but the
  practical worst case is unknown. **ANGLE:** generated same-direction zig-zags,
  directed/symmetric Hausdorff measurement against the preserved original.
- **LEAD:** benchmark exact MakerJS, integer-polyline, and exact-circular-kernel
  candidates only after choosing representative corpus and receiving CPU-slot
  approval. **WHY:** sources support correctness tradeoffs but no Board Studio
  speed claim. **ANGLE:** interactive p50/p95/p99 latency, output topology/error,
  and memory on ordinary plus adversarial outlines.

# Engine measurement and contract

Fixture: engine/test/fixtures/native/matrix-outline-recovery.json (33 keys, 58 components).
Runtime: Node 24.14.0, source CommonJS engine, SVG/debug/analysis enabled.

The original staged path rebuilds identical geometry: outline pass 1095.7 ms and analysis pass 980.1 ms. Both output hashes match. Existing complete-analysis cache hit costs 20.7 ms, establishing that retaining geometry removes the measured hot path. Each uncached pass performs 69 geometry unions, 123 closes, 64 offsets, and seven descriptions. Native clearance is under 0.03 ms per warm pass; two SVG/DXF serializations total about 6 ms. Timings inside wrappers are inclusive and must not be summed.

Original outline SHA256: 1eb82f1b99004f490e957249f7d36d7d627de33e88227b3a1d1837d988b26f29.
Original feature SHA256: 8b059258e09975f330d83edda26044b410876ba583c8cbbefa5eb963e058529b.

Selected contract: only analysis calls with a preparedLayout can stage geometry. A WeakMap indexed by preparedLayout.scene stores one geometry snapshot on outlineOnly. The complete parsed configuration and assets signature must match. Reading consumes the snapshot even on a signature miss. A fresh prepared scene cannot reuse another request's snapshot. Existing analysisCache behavior remains independent. The snapshot is copied before publishing output; analysis attaches and compiles boards normally with new closures over the current scene.

Regression checks compare complete fresh and staged analysis outputs, pin original complex geometry hashes, mutate outline output before analysis, verify one-shot use, verify source/assets/scene misses, and preserve PCB output. Initial RED: output equality passes, then seven additional geometry descriptions cause 14 !== 7. Clean RED/GREEN and after timings pending browser baseline gate.

## Actual60-key third-nudge cause and fix

The browser fixture uses 60 separated 18mm keycaps on 19mm pitch, close2, clearance2, simplify2, fillet2. Moving fingers_c10_r1 right 3mm succeeds, but the original outline takes 46.06s and 52 MakerJS outline operations. Most cost is two identical occupied-geometry+2mm expansions: one inside morphological closing and one for required-clearance containment.

MakerJS 0.18.1 expandPaths deletes its caller-supplied farPoint after individual path unions. That discards the engine's explicit stable intersection ray and triggers numerically unstable contour repair. In-process toggling this deletion behavior reduces 52 calls to 10 and 46.06s to 8.31s. Stable-classifier-only toggling had no effect; distributing dilation across components was rejected because it changed subsequent fillet behavior.

Production passes a fresh object with an inherited farPoint default: deleting temporary own overrides safely reveals the same explicit ray, including strict browser bundles. No global prototype or installed dependency is modified. A regression caught and prevented a nonconfigurable-property approach that would throw on strict delete.

A per-parse exact-model/distance/joints memo then shares completed offsets between closing and required-clearance checking. Cached models are privately cloned and zero-distance requests bypass the map. The 60-key regression pins all 15 final profile analytic paths and exact DXF/SVG bytes from the original 46-second result. Intermediate region representations can differ under stable-ray arithmetic, but the final exported contour remains identical. The original 91-object fixture's full outline and feature hashes also remain identical.

Evidence: red-clean.log (stage RED), green.log (legacy cache checks), offset-red.log (52 calls), offset-green.log (10 calls), memo-red.log (10 calls exceeds 7), memo-green.log, strict-red.log (strict-delete failure), final-targeted.log (7 passing). Full suite and final serialized timings are recorded separately.

## Full-suite correction

The first broad fixed-ray implementation passed targeted pins but full engine tests found a splayed-cavity topology regression (333 passing,1 failing; full-engine.log). Restricting the ray to positive offsets was insufficient. The final implementation retains original direct-offset behavior, including erosions, and uses the inherited stable ray only in subdivision/repair loops after a direct positive offset fails its extent check. This preserves previously successful contours and reduces the pathological moved-key fixture from52 to9 outline operations. Existing splayed-cavity and all focused regressions pass (10 passing; repair-targeted.log). Full final engine rerun uses this final source.

## Final validated result

Full final engine suite: 335 passing in 4 minutes (`full-engine-final.log`). Final isolated actual browser 60-key benchmark (`final-benchmark.cjs`, `final-timings.json`) verifies full uncached-versus-memoized/staged analysis equality for every sample, plus original moved-key profile paths and DXF/SVG parity. No stderr, exit 0. Full final outputs saved as `final60-0-output.json` and `final60-3-output.json`.

Median of three samples:

| Fixture | Outline | Following analysis | Combined |
| --- | ---: | ---: | ---: |
| Original 60-key matrix |3224 ms |378 ms |3603 ms |
| Third 3mm key nudge |7759 ms |571 ms |8330 ms |

The original moved-key outline alone took 46056 ms, with 52 analytic outline operations versus 9 after the fix. The final narrowed repair-only implementation intentionally retains original successful direct offsets; its cost is slightly higher than the discarded broad-ray experiment, and it passes the existing splayed-cavity regression.

Owned production files: engine/src/ergogen.js, engine/src/designs/index.js, engine/src/designs/geometry.js. New tests: engine/test/unit/native_outline_cache.js, engine/test/unit/native_outline_offset.js. Root/engine AGENTS.md edits predate this work and were preserved. No commits, installed-dependency edits, or production instrumentation. Real production browser validation belongs to the parent QA worker.

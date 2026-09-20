# Bounded queue and offset increment review

Date: 2026-09-20. codeQualityStatus: CLEAR. recommendation: APPROVE. blockers: []

Scope is ONLY the current unstaged changes to app/src/utils/studioQueue.ts, app/src/utils/studioQueue.test.ts, engine/src/designs/geometry.js, and engine/test/unit/native_outline_offset.js. This does not approve the entire performance task, its browser behavior, or a warmed latency claim. Notepad inspected: /tmp/ulw-20260920-133831.PoGBFl.md.

`omo ulw-loop status --json` reports an existing completed G001 plan, attempt 1, but no currentAttemptDir field. This report uses its existing a1 evidence directory and prescribed goal-specific filename, without replacing the older code-review.md.

## Findings by severity

- CRITICAL: None.
- HIGH: None.
- MEDIUM: None introduced by this increment.
- LOW: None requiring changes.

## Correctness and regression scope

app/src/utils/studioQueue.ts:144 resets the cleared grace handle. Without this, cancel/dispose during grace followed by reuse leaves schedule() believing a grace callback still exists; a subsequently stuck worker is never replaced. The new test at studioQueue.test.ts:63 executes exactly this lifecycle and verifies the latest request reaches the worker and publishes success. Existing tests additionally cover stale stage replies, mismatched revisions, grace timing and worker reuse. It uses the existing narrow worker fake and deterministic timers, with no new type escape hatch.

engine/src/designs/geometry.js:69 applies the existing offsetOptions helper to the direct offset as well as repairs. MakerJS 0.18.1 dist/index.js:245 uses for-in to copy inherited enumerable properties. combine at 2697 reads farPoint and at 2739 copies its output options back; expandPaths at 3286-3287 and 3320-3321 reads and deletes the own property between unions. The inherited fallback thus survives the delete and gets reused by subsequent unions. The helper is fresh per offset call and introduces no cross-call mutation or new abstraction. Existing caller models remain cloned on the direct path.

The semantic change is broader than one notched fixture: direct contractions and positive offsets with all joint modes now retain the explicit ray. This is why adjacent geometry suites matter. The fixed global ray and its requirement to remain outside geometry are existing architectural constraints; the exact-hash fixture is not proof for arbitrary coordinates. No newly demonstrated defect was found. Full enclosures, enclosure_analysis and guided_mounts remain appropriate for the parent's full engine regression run because they call positive and negative offsets; parent confirmed it will run the full suite after isolated benchmarking.

## Evidence inspected and independently exercised

Inspected .omo/evidence/performance-20260920/{queue-red,queue-green,outline-red,outline-green,outline-probe}.log. Queue RED fails on the absent replacement worker, then GREEN passes 4 tests. Outline RED fails because 9 calls exceed 7; GREEN preserves all three unchanged analytic/SVG/DXF hashes within 7 calls. Probe reports deep equality and 9-to-7 reduction, but its single timing sample is not accepted as a warmed benchmark.

Independent Node 24 queue rerun: 4 tests passed. Independent engine runs: 19 tests passed (native_outline_offset, native_finishing, native_bhk plus matching outline helper suite), and 33 tests passed (designs, design_assemblies, outline_recovery, native_outline_cache). Durable outputs: .omo/evidence/performance-20260920/reviewer-engine.log and reviewer-adjacent.log. The source/export hashes are checked by real engine processing rather than manufactured return values. Existing hole preservation, disconnected regions, exact-radius contraction, rotated/reversed finishing and cutout cases all pass within those suites.

## Skill-perspective check

Loaded and consulted omo:remove-ai-slops/SKILL.md, omo:programming/SKILL.md, and programming/references/typescript/README.md. Applied both perspectives to the complete four-file diff and its surrounding tests/production code. No new deletion-only, requested-removal-only, tautological, prose, or implementation-constant-mirroring test; no unnecessary extraction/parsing/normalization; no new defensive abstraction or untyped escape hatch. The outline call-count bound directly measures the stated redundant-work regression, alongside independent fixed output hashes. The existing strict deletion test intentionally exercises a dependency interoperability contract and checks actual geometric extents afterward. Existing fake-worker casts were not introduced or broadened. Neither perspective is violated by this diff.

The required broader browser, warmed timing, build and whole-task checks belong to the parent and are not claimed by this approval.

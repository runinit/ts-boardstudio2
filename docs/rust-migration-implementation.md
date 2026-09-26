# Rust Migration Implementation Report

> Historical validation record. Counts, paths, and commands describe the recorded migration. See [current architecture and validation](architecture.md) for the maintained entrypoints.

**Base revision:** `17f9380418b9c30314027e98bab6db853a1e19bb`  
**Implementation:** GPT-6 Luna, medium  
**Independent review:** GPT-6 Astra, low  
**Status:** Complete

## Scope and architecture

Rust now owns the shared document, edit, scene, and core worker protocol declarations. TypeScript declarations are generated with optional, pinned `ts-rs` 12.0.1 support. Explicit generate and drift-check commands compare the complete generated directory; CI also tests direct Node imports of the contracts helpers. Ordinary Rust and WASM builds do not enable the exporter.

Case contour preparation moved to `i_overlay` 9 in Rust. OpenCascade remains responsible for solid construction, mesh output, and STEP export. Clipper was removed. The browser is the primary runtime; Clipper corner parity was not retained, as requested.

The preparation request carries the assembly revision supplied by the caller and does not mutate the core document. Preview and publication paths reject stale results. Coordinates are scaled by 1,000 units per millimetre and use `i64`: the accepted input span of ±1e9 scaled units exceeds the safe ±2^29 span of `i32`. Geometry handling preserves sub-grid contours at zero clearance, uses a 5° near-straight threshold, and applies a minimum miter angle of `2 * asin(0.25)`.

## Validation

Passed: Rust tests (75 passed, 5 ignored), CAD tests (7), app tests (24), KiCad tests (27), contract drift check, direct Node import test, contract serialization tests with exporter both enabled and disabled, feature-off WASM check, Rust formatting, TypeScript checks, and build.

The component checks and build passed, and the final browser rerun passed 75/75 tests. It covered lazy CAD loading, Rust preparation, offline reload and STEP export, and existing workbench flows. Reproduce the browser run with:

```sh
NODE_OPTIONS=--no-experimental-webstorage BOARDSTUDIO_CHROMIUM=/usr/bin/chromium pnpm --dir v2/app test:e2e
```

## Performance evidence

The controlled core comparison used the same UI and glue code, five sessions, and 100 samples per fixture, on an AMD Ryzen 9 8945HS with Chromium 153.0.8010.47. Values below are median session p95 milliseconds. “Limit” is the historical 10% gate.

| Fixture | Worker old | Worker new | Limit | Painted old | Painted new | Limit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 keys, single | 5.5 | 5.5 | 5.2 | 33.8 | 33.9 | 37.0 |
| 100 keys, row | 7.9 | 8.4 | 4.4 | 49.6 | 47.9 | 37.8 |
| 200 keys, single | 12.1 | 12.2 | 7.6 | 33.5 | 33.5 | 47.0 |
| 200 keys, row | 13.2 | 13.1 | 7.7 | 71.3 | 71.6 | 53.6 |

All four historical fixture gates fail on both cores. Worker p95 changed by at most 6.4%; painted p95 increased by at most 0.5%. This is sample evidence, not proof of performance across all workloads. The thresholds were not rebaselined or claimed as passing.

A small case-browser fixture (one body, 20 vertices, two warmups, eight samples) measured preparation total p50/p95 of 1.9/2.1 ms and WASM p50/p95 of 1.4/1.7 ms. This result should not be generalized to larger cases.

WASM size changed from 2,201,769 raw / 712,117 gzip bytes at the exact base revision to 2,547,632 raw / 822,650 gzip bytes: +345,863 raw and +110,533 gzip. Native current/before p95 timings in microseconds were 496/497 for guided, 505/488 for 100 keys, and 985/980 for 200 keys.

No commit was created.

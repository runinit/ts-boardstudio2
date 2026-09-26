# V2-only repository and test audit

> Historical validation record. Counts, paths, and commands describe the recorded migration. See [current architecture and validation](architecture.md) for the maintained entrypoints.

## Migration boundary

Branch `codex/v2-only-cleanup` starts at `aaaf3f8` with the existing staged and
unstaged UI/mechanical work included. It uses an isolated worktree because another
task was editing and validating the original checkout. Later edits in that checkout
are not implicitly imported. The original checkout and its staging remain intact.

Promote the six v2 packages to the root. Retire the v1 app, engine, footprint
workspace, their tests/build tools, v1 operating docs, and the legacy-only
`local:/refs_search.mjs` helper. Git history retains those sources. Keep vendor
licenses, manifests, reference assets, and library bytes in `ergogen/library`.
The library's old maintenance scripts are preserved provenance, not active
workspace tests or a dependency on the removed engine.

No runtime package names, document format, storage keys, or geometry semantics
change. Generated contracts and built-in catalogue bytes are preserved. Ergogen's
runtime catalogue is regenerated only to update its source-location comment.

## Coverage decisions

Default validation is `pnpm check`: drift checks, runtime import, native/package/
unit tests, production build (including app type checking), CAD type checking,
Rust/WASM boundaries, functional browser tests, and a Pages-subpath smoke test.
`pnpm precommit` prepares WASM and checks app/CAD types independently.
`pnpm test:e2e:dev` retains the separate Vite development loading regressions.
`pnpm test:perf` builds once, runs the five serial reference-host sessions, then
runs the pointer/matrix/outline latency checks serially. No thresholds change.

| Suite | Protected behavior | Decision / execution cost |
| --- | --- | --- |
| Rust core unit/integration tests | Transactions, histories, geometry, source parsing/serialization, archive integrity, matrices and mechanical preparation | Keep all 208 ordinary tests; six existing ignored timing tests remain explicitly opt-in |
| Contract generation, catalogue drift, runtime import | Rust authority, exact generated inventory/content, runtime-safe TS facade | Keep; cheap relative to browser/CAD tests |
| Rust/WASM boundary script | Native/WASM agreement and browser archive transport | Keep and add to canonical CI; previously absent from the v2 workflow |
| Ergogen verification/runtime | Reviewed source inventory/hashes, generated runtime, both-side rendering of all 39 generators | Replace comparison to removed v1 files with standalone integrity manifest; add one negative integrity test for missing/extra/changed files |
| KiCad package tests | 39 cases including real CLI parsing/DRC, imported source authority, board/footprint adapter integration | Keep; about 27 seconds in the initial local package run |
| CAD package tests | 11 solid/STEP roundtrip and mechanical-fit geometry cases | Keep; about 15 seconds in the initial local package run |
| App unit tests | 101 cases in 29 files: clients, stale replies, storage, previews, transforms, geometry, mechanical helpers | Keep; 1.73 seconds in the initial run |
| Legacy root suites | Retired v1 application/compiler and release/staging rules | Remove with their workspaces; no replacement needed for unsupported v1 behavior |

Browser filenames below are under `app/e2e/`. Costs are summed durations from the
pre-migration 122-case browser run, rounded to seconds. That run overlapped another
build early on, so these are audit hints, not controlled performance comparisons.

| Browser suite | Coverage and disposition | Observed cost |
| --- | --- | ---: |
| `workbench` | Keep integration workflows, archives, undo, board scope, models and exports. Remove plate-to-tray case duplicated by `case-preparation`; move outline latency case to `outline-performance` | 43 s |
| `add-panel-sizing` | Remove separate file/setup; retain every icon-count/size and button-height assertion in `workspace-panels`, including 1440/600 widths; also check 1280/390 in both themes | 1 s |
| `scroll-layout` | Keep wheel/page-scroll and inspector-overflow coverage. Merge toolbar-width assertion into the existing 1024×576 inspector case | 2 s |
| `workspace-panels` | Keep resize/persistence, auto-hide/focus, project actions, theme/drawer and menu sizing; absorb Add sizing | 8 s |
| `workbench-refinement` | Keep scope-specific inspectors, transformed/sparse matrices, snapping and mirrored/splayed behavior; remove review-only screenshot captures | 15 s |
| `unified-design` | Keep shared selection, origin/splay transactions, focus and compact inspector; remove review-only screenshots and writes to `.impeccable` | 7 s |
| `library-workflow` | Keep Parts catalog, scope outlines, matrix lifecycle, assemblies, model viewing and compact inspector; remove review-only screenshots | 11 s |
| `case-preview-design` | Keep actual 3D controls and themed viewport assertions; remove review-only screenshots | 8 s |
| `usability` | Keep compact fit actions, save status, and failed-save recovery; remove review-only screenshots | 2 s |
| `assembly-preview` | Keep visibility, routed-reference/model persistence, and assembly creation/application | 15 s |
| `cad-loading` | Keep glue loading/no failed requests; exercised against production and development | 2 s |
| `case-preparation` | Keep lazy loading, revision progression, preparation diagnostics, offline reopening and STEP export; owns plate-to-tray regression | 7 s |
| `canvas-layers` | Keep view-only layers and anchored Snap dialog/focus at distinct breakpoints | 1 s |
| `ergogen-library` | Keep both-side geometry, undo/reload, generator settings, bundled models, and network recovery | 30 s |
| `inspector-distill` | Keep keyboard disclosure, committed edits and retained advanced values | 4 s |
| `key-sizing` | Keep wide/tall keys and row/column sizing through undo/reload | 3 s |
| `kicad-artifact` | Keep imported pads read-only and source export after reload | 1 s |
| `library-preview` | Keep drawing-only layers, companion visibility, generated copper and defaults | 5 s |
| `matrix-projections` | Keep cached projection/request counts and stale/cancelled ghost rejection | 3 s |
| `matrix-resize` | Keep all three moved/staggered/surviving-key resize regressions | 4 s |
| `mechanical-assembly` | Keep all six configuration, selection, hardware/persistence and scoped-export cases; baseline failure is not grounds for deletion | 65 s |
| `mirrored-layouts` | Keep atomic creation, linked persistence, unlink, keyboard cancellation and alignment exclusion | 8 s |
| `outline` | Keep all authored/automatic contour, inclusion, validation and export regressions | 9 s |
| `workbench-annotations` | Keep missing metadata, linked halves, view-only transforms and accessible stagger | 4 s |
| `performance`, `matrix-performance`, `pointer-performance`, extracted `outline-performance` | Move all four to explicit serial performance config. Preserve fixtures, sample counts and limits | At least 67 s, plus outline scenario |
| `e2e-pages/deployment` (new) | Subpath workers/WASM, real bundled models, CAD, service-worker scope, offline reload and STEP export | Measured separately |

Three functional test setups are removed; all their distinct assertions survive.
Four timing scenarios leave functional discovery. Nineteen unasserted screenshot
capture calls are removed; failure screenshots remain enabled. The routine suite has 115 cases
instead of 122, plus one new deployment smoke case (116 total). Global
`only-on-failure` screenshots replace redundant captures in six UI suites.
Distinct layer/view/keyboard assertions are retained even when titles look similar.

## Validation record

Initial package baseline passed: 208 Rust tests (six pre-existing ignored), all
Ergogen checks, 39 KiCad tests, 11 CAD tests, and 101 app unit tests. The concurrent
checkout's browser baseline was 121 passed / 1 failed in 5.5 minutes. The failure
was `mechanical-assembly`: a critical-fit label reverted after redo/reload. No test
was removed because it failed. The independent baseline command was stopped
before completing its build to avoid interfering with that browser run.

The frozen pnpm installation passed. The lockfile shrank from 1,126 to 224
package entries with zero new package versions. Vitest's existing optional peer
resolution changed when the legacy workspace disappeared; package versions did
not change. The tracked tree is 577 files (86.3 MiB), down from 1,758 files (205.1 MiB)
at the starting commit, even with the inherited new work included.

The preservation audit compared all 562 transferred v2 files against SHA-256
snapshots: 530 are byte-identical, 31 have reviewed path/test/documentation changes,
and the standalone Add sizing test was absorbed into workspace-panel coverage.
All application runtime, Rust implementation, contract declarations, built-in
catalogue, and vendored library bytes are preserved. The Ergogen runtime catalogue
has only a regenerated source-path comment change. Two existing font-license
files retain upstream CRLF bytes; `git diff --check` flags those inherited lines,
not newly introduced source whitespace.

Final `pnpm check` passed, including all generated/runtime/native/WASM checks,
208 Rust tests, the Ergogen integrity negative test and generator checks, 39 KiCad
tests, 11 CAD tests, 101 app unit tests, production build/type checks, 115 functional
browser cases (4.0 minutes), and one Pages-subpath smoke test (13.0 seconds).
The earlier browser baseline took 5.5 minutes, but had a failure and early build
contention; the comparable claim is reduced routine scope, not a speedup guarantee. The initial migrated browser run
found a merged-test setup error (an already-open drawer was toggled closed). The
setup was corrected; all six panel tests and then the entire combined gate passed.
The baseline hardware-persistence failure did not recur in either migrated full
run; its test and application behavior remain unchanged.

`pnpm test:e2e:dev` passed all 10 cases in 30.7 seconds.
`pnpm test:perf` passed on the recorded Ryzen 9 8945HS / Chromium 153.0.8010.47:
all five reference sessions and all three additional interaction cases passed.
No baseline, allowance, sample count, or latency limit was changed.

| Reference scenario | Median worker p95 / limit | Median painted p95 / limit |
| --- | --- | --- |
| 100 keys, single | 3.7 / 5.2 ms | 33.9 / 37.0 ms |
| 100 keys, row | 3.5 / 4.4 ms | 33.9 / 37.8 ms |
| 200 keys, single | 5.7 / 7.6 ms | 34.0 / 47.0 ms |
| 200 keys, row | 5.1 / 7.7 ms | 34.3 / 53.6 ms |

The 200-key matrix/row/column painted p95 values were 59.5/58.3/58.6 ms
(limit 200 ms). Outline p95 values were 34.0/33.9 ms at 100/200 keys
(limits 100/200 ms). Pointer p95 values were 20.5/21.6/23.7 ms at 30/100/200
keys (limits 33/50/100 ms). These are migration validation results, not new baselines.
`pnpm precommit` passed after all validation. Pages was validated locally; no
remote deployment or publication was performed.

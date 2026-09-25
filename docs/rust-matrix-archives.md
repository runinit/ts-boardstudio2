> Historical migration evidence: paths and commands below describe the recorded
> revisions. Current packages live at the repository root, commands have no `:v2`
> suffix, and timing-only browser tests run through `pnpm test:perf`, not `check`.

# Rust matrix projections and project archives

This migration starts at `7703d273d46e6716149928b38d97466e9abe60ef` on
`codex/rust-matrix-archives`, in the isolated `rust-matrix-archives` worktree.
The active UI checkout and its uncommitted `columnOrigins`/splay changes were
excluded. No combined UI merge or deployment is covered by these results.

## Ownership and compatibility

Rust produces required `SceneDelta.matrixScenes` alongside part transforms from
the same candidate document. Cells are row-major, include disabled poses, and
omit member IDs for disabled cells. Existing members use resolved saved poses;
missing cells use parametric geometry and the legacy residual interpolation.
Equal-distance residual ties prefer the earlier row/column, matching the captured
TypeScript behavior. Per-column unit bases include splay, reflection and rotation.
The source fixture records baseline TypeScript results independently of Rust.

The read-only `project-matrices` request checks `baseRevision`, validates the
entire batch and returns `matrix-projections`. Drafts have no saved member
residuals or member IDs and do not modify history or the client snapshot. The UI
caches an origin-zero projection, translates its SVG group during pointer motion,
and invalidates replies by request identity and document revision. One indexed
adapter supplies cells, membership, bounds and handle anchors. Missing projections
have no TypeScript geometry fallback. Rendering, pointer state and snapping stay
in the browser.

The stateless archive ABI is independent of `CoreEngine` and artifact preparation:

```text
archive_request(request JSON, Uint8Array[]) -> [reply JSON, Uint8Array[]]
```

Rust-generated metadata specifies buffer indexes for `pack-project`,
`unpack-project` and ordered `pack-files`. The existing export worker handles all
three operations and all v2 ZIP encoding. Clients copy input views before
transfer so caller caches remain usable. The WASM adapter copies bytes across
linear memory; this is not a zero-copy ABI. Worker startup failures remain
retryable. Browser asset fetching, model selection, downloads and IndexedDB stay
in TypeScript. Imported assets are persisted in one transaction after complete
verification; an abort rolls the entire import back.

`project.json` is validated as JSON without typed document reserialization, so
unknown fields and the supplied JSON text survive the Rust codec. Full document
semantics are still checked on core open. `archive.json` remains informational.
Shared SHA-256 references share one ZIP entry while retaining document identities.
Local assets always travel with the document; bundled models retain their existing
inclusion option. ZIP compatibility is content equivalence, not compressed-byte
identity. Generic KiCad/footprint exports retain their filenames and do not use
project-specific numeric limits; plain KiCad downloads remain plain files.

Project packing and unpacking enforce 128 MiB compressed, 8 MiB project JSON,
64 MiB per other entry, 256 MiB decoded total and 256 entries. Preflight parses the
bounded central directory before the ZIP library can collapse duplicate names.
It checks every raw record, allowed paths, local/central agreement, offsets,
nonoverlapping entry spans, ZIP64 metadata and signed/unsigned data descriptors.
Split archives, encryption and unsupported compression are rejected. Extraction
uses bounded reads, checks actual lengths/CRCs, and verifies every referenced
SHA-256 before returning buffers. Unreferenced allowed entries still count toward
limits and have CRCs checked, but are not persisted.

Dependencies are pinned to `zip = 8.6.0` with default features disabled and
`deflate-flate2-zlib-rs`, and `sha2 = 0.10.9` with defaults disabled. V2 `fflate`
is now a development-only interoperability oracle. V1 dependencies are unchanged.

## Verification evidence

Baseline native/package tests and `pnpm precommit` passed on the isolated base.
The old importer was also executed against the new duplicate-record regression:
it accepted the archive, demonstrating the gap; the Rust-backed test rejects it.
A projection-boundary regression failed before the shared geometry validator was
called from the projection function, then passed after the fix.

Coverage includes captured matrix parity (mirrors, rotations, successive splays,
offsets, disabled cells, mixed identities, saved poses and negative-Y residuals),
revision/history behavior, invalid dimensions, delayed/superseded/cancelled drafts,
ZIP32/ZIP64/descriptors, malformed records, CRC/hash failures, shared references,
bundled-model options, generic archives, bidirectional fflate interoperability,
and transaction rollback. Native and WASM drivers compare core replies and archive
metadata/content directly. Existing resize, constraints, undo/redo, export,
matrix latency and pointer latency browser tests remain part of `check:v2`.

Implementation revision: `6fcac78b45137381afb6579714de4c0856d50368` (Rust producer
commit `cc3fff2`; browser consumer commit `6fcac78`). Validation used Node 26.10.0,
pnpm 11.26.0 and installed Chromium 153.0.8010.47 on the baseline host. The first
browser attempt could not launch Playwright's absent default binary; the full
gate subsequently passed using `BOARDSTUDIO_CHROMIUM=/usr/bin/chromium` and
`NODE_OPTIONS=--no-experimental-webstorage`.

- `pnpm run check:v2`: passed, including contract/catalogue drift, runtime imports,
  native/package tests, feature-off WASM build, native/WASM parity and all 79
  browser tests. App unit tests: 40 passed.
- `pnpm run check:boundaries:v2`: passed again after extending the driver to test
  direct draft translation for all mirrors and a 500-cell payload. Final coverage:
  11 core requests and 9 archive requests, comparing native/WASM metadata and
  content, with numeric geometry tolerance of 1e-9.
- `pnpm precommit`: passed, including 1,069 legacy tests.
- `pnpm run test:perf:v2`: all five serial sessions passed existing thresholds;
  the baseline file was unchanged. No other agent builds/tests ran alongside
  latency suites; the UI servers were left running and their ports were unused.
- Native release matrix performance test: passed; 6×5 with diode/RGB (90 parts),
  preview p50 413 µs and p95 425 µs.
- Independent review: completed; findings about ZIP preflight, bounded reads,
  world-space bases and projection validation were addressed before final gates.

Five-session median p95 measurements, in milliseconds:

| Scenario | Worker | Painted |
| --- | ---: | ---: |
| 100 keys, single | 3.7 | 33.7 |
| 100 keys, row | 3.1 | 34.2 |
| 200 keys, single | 4.7 | 33.7 |
| 200 keys, row | 5.8 | 36.4 |

The existing matrix browser gate passed through 200 keys / 600 assembly parts.
Pointer feedback at 30/100/200 keys measured 24.5/32.2/44.0 ms, with no frame gaps
over 50 ms. These are diagnostics from the recorded run, not new thresholds.

Boundary diagnostics from the final driver run:

- Raw WASM: 3,286,677 bytes; Node synchronous initialization: 3.6 ms (one sample).
- Matrix JSON: 1,215 bytes for the nine-cell scene; 55,019 bytes for a 500-cell draft.
- Four-MiB incompressible asset: 4,196,433-byte ZIP; WASM linear-memory high water
  14,614,528 bytes, from 1,835,008 bytes before that operation pair. Node peak RSS
  was 168,898,560 bytes at measurement. This includes the parity harness and is
  not a browser peak-memory guarantee or a worst-case archive-limit stress test.

## Original UI integration checkpoint

Before any combined merge, wait for the UI work to be committed, compare its final
matrix schema and splay semantics against this branch, and reconcile
`columnOrigins` explicitly. Regenerate Rust contracts and run custom-origin,
projection-parity and UI interaction tests on that combined revision. Passing
results on this isolated branch do not establish compatibility with pending UI
changes. Keep the mechanical Workbench adapter commit separate for that review.

## Completed UI reconciliation

The reconciliation recorded with this report integrates UI commit `1695dba`
(`Unify v2 workbench and add linked mirrored layouts`) into the migration branch
at `ec48a5b`. The active `codex/rearchitecture` checkout was left unchanged.
The earlier isolated validation above remains historical; the combined checks
below apply to the reconciliation committed with this report.

Rust now preserves `columnOrigins` in document and draft projections, including
custom pivots through successive splays, matrix rotation and mirrors. Each column
projection also carries its world-space splay origin, local angle and custom-origin
flag. The new `set-matrix-splay` edit owns origin compensation and the distinction
between one-column and following-column edits, synchronizing linked layouts from
either half. The browser retains pointer angles, snapping and request scheduling.
The UI's three former TypeScript geometry tests were ported to Rust; the duplicated
TypeScript splay geometry implementation was removed.

Paired placement requests both halves in one origin-zero draft batch. Pointer
movement translates their shared SVG group without further projection requests.
The existing revision/request guards reject cancelled and superseded replies.
The finished UI's navigation, panels and styles are preserved.

Additional verification includes:

- Four native splay tests and three real mirrored-pair protocol tests covering
  custom origins, compensation, preview/snapshot isolation, commit equivalence,
  edits from either half, and undo/redo.
- Three custom-origin projection fixtures captured directly from the UI geometry
  implementation at `1695dba`, covering none/X/Y mirrors with rotation and splay.
- Draft origin bounds/finite validation and paired ghost caching/cancellation.
- Native/WASM parity expanded to 13 core requests and 9 archive requests.
- Independent review of the full Workbench reconciliation and linked tests.

The first browser attempt exposed a conflict-resolution omission of the new
Layout/PCB/Case tree branches; the original UI branches were restored. A subsequent
run passed 96/97 tests and exposed a narrow-screen test race: CSS responded to the
viewport before React's media-query state applied `is-compact`. The test now waits
for that state before its unchanged overflow assertion. Ten repeated focused runs
passed. No CSS change or threshold adjustment was needed.

Final combined validation:

- `pnpm run check:v2`: passed, including generated contracts/catalogue, runtime
  imports, native/package tests, feature-off WASM, native/WASM parity, 43 app unit
  tests and all 97 browser tests. This includes custom-origin interaction,
  cancellation, mirrored-layout archive save/reopen, matrix and pointer latency.
- `pnpm run test:perf:v2`: all five serial sessions passed unchanged thresholds,
  with no other agent builds/tests running during measurement. Median worker /
  painted p95: 100-single 3.7 / 33.7 ms; 100-row 3.2 / 33.5 ms; 200-single
  5.4 / 33.7 ms; 200-row 4.6 / 35.2 ms.

`pnpm precommit` also passed: 155 test files and 1,069 legacy tests. Its existing
DesignSetupPanel hook-dependency lint warning remains unrelated to this change.

Combined diagnostics: raw WASM 3,362,186 bytes; synchronous initialization 5.2 ms
(one Node sample); nine-cell scene 1,493 bytes; 500-cell draft 55,945 bytes. The
four-MiB archive probe produced a 4,196,452-byte ZIP with 14,614,528-byte WASM
linear-memory high water and 180,187,136-byte Node peak RSS. These remain limited
harness observations, not worst-case archive or browser memory guarantees.

The active UI checkout remains at `1695dba`; no merge back, push or deployment was
performed. Further UI work beyond that revision requires another integration
check. Validation used the same installed Chromium/environment described above.

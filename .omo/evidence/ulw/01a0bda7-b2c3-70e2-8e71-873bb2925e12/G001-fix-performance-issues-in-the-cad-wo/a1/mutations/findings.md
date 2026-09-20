# Mutation performance findings

The repeated whole-document YAML parsing was observed directly with a counter-only wrapper that calls the real parser. No mocked parse results, timers, engine responses, or source editors are used.

## Evidence

- `before.jsonl`: native 39/80-key full sweep plus partial150-key sweep; every result checked source comment and actual key count.
- `batch-red.log`: native row addition retained actual keys/owners/nets but performed30 parses (budget20).
- `legacy-red.log`: legacy inline electronics13 parses (budget12).
- `removal-red.log`: native row removal18 parses (budget8).
- `single-red.log`: loose key addition9 parses (budget6).
- `collision-red.log`: batching exposed generated diode identity collision; reserved identities now match sequential allocation.
- `final-all-green.log`:104 tests passed covering helpers, mutations, native assembly, mirrors, PCB generation, ownership, templates and source isolation.
- `single-green.log`:32 tests passed after single-key path reuse.
- `handoff-green.log`:nine focused final batch regressions passed, including heterogeneous column recipes and locked owned components.
- `typecheck-final.log`: app typecheck passed before final reuse of the tested single-key path; parent precommit performs final typecheck.

Initial wall-clock baseline39-key add-row10,128ms/111 parses; final preliminary514ms/8 parses. Remove-row3,042ms/68 parses ->283ms/6. Captured browser60-key source adds row in114ms/2 parses in preliminary final direct run. These final timings overlapped the engine suite start; isolated final evidence is recorded separately in `after-isolated.jsonl` when available. Parser work counts are deterministic.

## Implementation

- Complete new key records and legacy electronics metadata are appended in a single mapping operation each.
- Compatible native assembly defaults compile in groups. Only new-key application defers writes into parts/objects/template mappings; ordinary assembly editing retains its existing path.
- Matrix removals check selected keys, locks, outside references and owned components together, then remove all source ranges and synchronize board state once.
- Bulk source helpers share the existing editor's rendering, preserve unrelated bytes/comments/formulas and CRLF, and retain final dangling-alias validation for deletions.
- Source storage/history APIs are unchanged; resize still produces one complete string candidate and preserves the ResizeReview barrier.

## Cleanup / limitations

The temporary profile test was moved out of app test discovery to this evidence directory with its own config. The abandoned two-snapshot cache candidate is evidence only; no sourceSnapshot production change shipped. Early profile harness failures (ESM spy restriction; vi.fn AST retention) were measurement failures and were not used as runtime proof. LSP diagnostic refresh repeatedly timed out or reported stale export names; compiler validation is recorded separately. No commits made by this worker.

## Final isolated verification

`profile-isolated.log` PASS after the engine worker explicitly released CPU. `after-isolated.jsonl` records the final single-key optimization too.

| Native39 operation | Before ms / parses | After ms / parses |
| --- | --- | --- |
| Add row (13 keys) | 10128 /111 | 506 /8 |
| Add column (3 keys) | 2430 /31 | 457 /8 |
| Remove row | 3042 /68 | 280 /6 |
| Remove column | 1002 /18 | 334 /6 |
| Add key | 589 /9 | 325 /6 |
| Remove key | 288 /6 | 131 /3 |
| Move key | 225 /2 | 217 /2 |

Captured browser60 source add-row:99.7ms,2 parses,53,257 parsed bytes. This is direct source-mutation measurement; parent performs final browser interaction QA separately. The move source edit was not changed by the structural batching fix.

Final nine `studioSourceBatch` tests pass (`handoff-green.log`). Additional coverage explicitly checks differing LED/diode defaults across columns and locked owned components. `app/CHANGELOG.md` documents the user-visible layout/outline speed improvement. No temporary source instrumentation remains in app code.

## Actual selected-cell UI path follow-up

Root identified that matrix UI insertion calls `addCell`, distinct from loose-key `addObject`. `addCellBatch.test.ts` compares the entire native/legacy output against the previous public-operation composition, including two independent holes, a reserved key identity, LED/diode defaults, explicit size/offsets, and original-source isolation.

- RED (`cell-red.log`): complex nativeLED16 parses (budget7), legacy9 (budget3).
- Initial fast insertion yielded native9. The budget was NOT changed. `cell-traces.json` identified two redundant LED synchronization reads: reparsing an already available original document, and late immutable-source findings lookup causing cache ping-pong.
- Approved narrow correction reuses the original document only in deferred new-key assembly and reads findings before writes. No LED chain writing behavior changed.
- GREEN (`cell-final-green.log`):44 tests pass. Final source-isolation parity rerun2/2 (`cell-isolation-green.log`). Final app `tsc --noEmit` passed (`cell-final-typecheck.log`).
- Actual selected-cell benchmark (`cell-before.jsonl` / `cell-final-after.jsonl`): warm native39 falls737ms/10 parses ->275ms/4; legacy60 falls355ms/7 ->72ms/1. Baseline overlapped precommit; parser counts and exact output parity are the deterministic evidence.
- `layoutSource` remains unchanged: movement already performs one field edit; no speculative cache work was added.

## Repeated managed-outline region accumulation

Captured `after/plain60/last-source.yaml` contains20 regions (`main_keycap` through `_20`) while the current boundary references only `_20`. The same ref in `meta.studio.outline.managed.main` caused addOutline's general reference scan to incorrectly classify its own active region as shared.

- RED `outline-reuse-red.log`: three tests fail. Five rebuilds grow1 region to6; shared/custom replacement recipes grow2 to3 on the next rebuild.
- Fix: skip only the exact reference-walker path `meta/studio/outline/managed/<currently rebuilt board>`. Real profile/boundary references, authored selectors, unrelated metadata and other boards' ownership remain protected. No historical regions are deleted or renamed.
- GREEN `outline-reuse-green.log`:30 focused tests pass; final fourth ownership-path guard also passes in `outline-reuse-final-green.log`.
- Historical fixture replay `outline-reuse-historical.json`: five rebuilds retain all20 exact regionIDs; source bytes26730 ->26713 ->26713 ->26713 ->26713 ->26713. The first rebuild reduces source size by17bytes; subsequent source size is stable.
- `outline-reuse-typecheck.log`: `tsc --noEmit` passes. No engine/browser/build profiling performed in this lane.
- Changelog updated. Commit not attempted: parent reports missing Git author configuration, which remains the commit blocker.

## Interleaved assembly recipe LED parity

The reviewer flagged that global signature grouping reorders A/B/A recipes into A/A/B. `assemblyInterleaving.test.ts` reproduced a material pin-level discrepancy: the new middle-column LED consumed the third-column output instead of the first-column output. The test independently pins the historical sequence against the prior sequential public API composition; RED saved in `led-interleaving/red.log`.

Minimal fix uses consecutive compatible groups, retaining full batching for homogeneous rows. Pending groups are applied before a fallback `applyKeyDefaults` operation. No LED chain writer or source-editor changes. Seventeen focused tests, including homogeneous parse-volume guards and native/legacy cell parity, pass (`led-interleaving/final-green.log`). The new test's iterator was adjusted to the repository TypeScript target; final lint/typecheck logs are in the same directory.

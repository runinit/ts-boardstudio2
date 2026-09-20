# CAD performance review input
User requested faster CAD/layout component movement, row/column/key insertion/removal, and outline generation. Preserve source identities, ownership, comments, undo/redo, frozen contours, exports and unrelated user work. No UI redesign or public schema changes.

## Implementation
- App batches new key skeletons/defaults/assembly mappings and selected cell insertion; batches removal with source-range editing, preserving review/locks/reference validation. Reuses the original read for new-key LED synchronization and moves immutable findings read before writes.
- Engine reuses outline geometry once for an identical config/assets/prepared scene; exact invalidation and caller-mutation isolation. Per-parse offset memo avoids duplicate work. Retains explicit MakerJS intersection ray only during repair subdivisions; successful original direct offsets untouched.
- Generated browser engine bundle rebuilt via temporary staging pipeline.
- Regression tests include source parity/ownership, aliases/CRLF/comments, heterogeneous recipes, collision IDs, lock/review rollback, exact contour/SVG/DXF pins, strict-browser delete semantics and staged/full result equality.

## Evidence already verified
- verification/precommit.log: parent gate before final cell insertion,911tests.
- verification/check.log: final335engine tests,913app tests, footprint/release/typecheck/build passed; full193browsercases completed163pass29fail1preexisting skip.
- verification/engine-parent.log: parent10focused geometry tests pass.
- verification/invalid-input-parent.log: actual empty/malformed engine calls reject with useful diagnostics.
- engine/findings.md, final-timings.json: exact3mm60key outline46.06s baseline ->7.759s median; followinganalysis0.571s. Finalprofile paths/SVG/DXF unchanged.
- mutations/findings.md and cell logs: regression-first sources and timings, counters paired with actual semantic assertions. Some initial mutation timings were contended; final browser comparison is strongest UI evidence.
- after/full-suite/performance: parent-run real browser1repeat allactions/undo/reload/freeze pass; column1498ms ->120ms,row2556ms ->142ms under suite contention. after/plain60 and after/native39 are final isolated runs, pending at this note's creation.
- Existing continuous first rapid-edit test, frozen exactcontour reload/rebuild, bothoutline recovery tests, native edited-column cancellation/confirmation/exactundo, aliasmove/undo passed fullsuite.
- after/full-suite/FAILURES.md preserves all29 failures.22 causal unchangedUI test mismatches; remaining investigations documented separately. Do not treat unchanged files alone as baseline proof.
- engine/continuous-regression.md: exact39key stress finalsource fails same on original/current rawengine; bothpass with prepareOutlines bridge. Parent inspected unchanged useStudio action===edit gate, undo/redo keep; preexisting request-mode gap remains, not a geometry regression.
- Same report:60key7mm move failed original offset repair, nowvalid singlecontour.

## Review cautions
Old browser inputToVisible measured committed polygons only. New probe also captures transient transform. Compare old movement visibility only to new committedPolygonMs for nudges AND drags; current first-frame is an absolute figure, not before/after speedup. Persisted/structural metrics comparable.
Do not claim every100ms or5s observational budget passes. Outline generation is faster, stillseconds.
Some LSP requests timed out; final fulltypecheck passes. Root caught and fixed one actual new E2Etyping error;3harnessfiles then LSPclean.
Git commit failed because user.name/email unset; async identity question unanswered. No invented identity. Verified units remain staged, with no-commit blocker recorded. Final reviewers must bind actual frozen patch/tree fingerprint plus baseHEAD, not pretend this content is committed.
Existing AGENTS.md hierarchy edits predate this task; preserved byte-for-byte and excluded from implementation staging.

## Final delta and classification
- Own outline ownership metadata incorrectly counted as an external recipe consumer. `studioSource.ts` now excludes only exact meta/studio/outline/managed/<current board> reference path. Repeated prepareOutlines no longer allocates duplicate regions. Real shared/custom/other-board references remain protected. No deletion of historical orphan recipes. `studioOutlineReuse.test.ts` regression-first; root rerun31tests passed (verification/outline-reuse-parent.log). Historical20-region source retains exact20IDs through5rebuilds (mutations/outline-reuse-historical.json).
- Final harness fourth helper studioPerformanceWorker.ts observes real worker messages; exact input source/requestId/revision must receive outline stage plus success. Old status-only settlement figures may be premature and are not definitive outline timings. It also checks no region ID growth during repeated real edits.
- Serial current build all3 formerly ambiguous long tests PASS: CNC45.2s, portable KiCad import/export/offline25.9s, native controller model binding1.4min; after/serial-failures/run.log. Remaining snap relationship assertion will run after final rebuild.
- Disconnected outer-key removal is expected: all4 HEAD/current raw/prepared fail same guard;10mmphysicalgap confirmed. Valid performance flow removes interior cell. after/plain60 incomplete run preserved and never represented as fullpass.
- First code-review found genuine mixed LED A/B/A grouping chain-order regression. RED at mutations/led-interleaving/red.log; fix only groups consecutive compatible keys and flushes groups before fallback. Regression pins historical actual P4 values. Parent12focusedtests passed; final scopedlint/tsc and17worker tests recorded. Final precommit prior to this smalldelta passed917tests138files; finaldelta verification supplements it. No previous browser performance assertions are used as validation of changed mixedLED behavior.
- Frozen-final.patch staged tree6b20edc487ea64844e137cfae164e7fca1b36d07; SHA256bf8e6d411dd7cc6fd101580a7764a6ca2290c6f830bbfe0e2b20dcfd345b4d6d. Actual base HEAD remains347229abc1561a44a2dc6cc0cee50969b49b267e, no commit due author configuration.

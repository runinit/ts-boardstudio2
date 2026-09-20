# Ultrawork Notepad — CAD drag and outline performance
Started: 2026-09-20

## Plan (exhaustively detailed)
1. Read report, code and applicable skills; capture reproducible baselines.
2. Pin queue lifecycle; capture cancel/reuse/supersede RED, fix, capture GREEN.
3. Profile release and outline with matched fixture; choose smallest measured interventions.
4. Capture performance/correctness RED before production edits; implement and verify.
5. Drive browser drag, cancel, re-grab, undo and outline completion; capture and clean resources.
6. Run checks, precommit/build, independent review; commit verified increments.

## Success criteria + QA scenarios
HEAVY: queue concurrency and geometry/render caching boundaries.
C1: cancel during grace then reuse/supersede terminates obsolete worker and runs latest request; pin exact regression in studioQueue.test.ts before editing production.
C2: matched 60-key browser drag reduces measured work/latency preserving pose, cancellation, re-grab and undo; pin exact producer before edits.
C3: matched 60-key outline reduces warmed runtime preserving analytic paths/SVG/DXF and adjacent geometry regressions; pin exact producer and hashes before edits.
Stop when criteria have proofs, cleanup receipts, checks, independent approval and verified commits.

## Now
Discovery and skill loading; no production edits.

## Todo
Complete discovery; specify exact scenario commands; RED/GREEN increments; browser QA; review; commits.

## Findings
Working tree clean. Report confirms stale grace handle after disposal. Existing outline cache is baseline.
Skills: ultrawork evidence loop; debugging runtime attribution; programming TypeScript; frontend performance; visual-qa browser regression; lsp diagnostics; git-master commits; impeccable frontend optimization.
No update_plan tool listed; use this durable checklist.

## Learnings
Preserve historical research. Never compare browser and engine timings for different moved keys.

## Now
Queue regression: existing three tests characterize scheduling; capture RED with new reuse lifecycle. Outline read-only lane returned no safe demonstrated intervention; exact retry attribution needs runtime profiling before changes.
## Scenario C1
PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH pnpm --dir app exec vitest run src/utils/studioQueue.test.ts
PASS: latest request after dispose/reuse and blocked predecessor reaches publish; old replies never publish. RED/GREEN logs in .omo/evidence/performance-20260920/queue-{red,green}.log.

## Findings
C1 RED: expected replacement worker undefined; queue-red.log. GREEN: four tests pass; queue-green.log; LSP production clean. Fix resets grace after clearTimeout.
Outline intervention probe: original 8037ms, inherited farPoint 5250ms; analytic paths/SVG/DXF deep equality passed. Initial direct call currently uses own-property farPoint that MakerJS deletes; repair steps already use inherited property. Keeping ray on all calls removes d2.001 retry (9 -> 7 calls). This is one diagnostic sample, not final speedup claim.
## Scenario C3
PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH npm_config_what=native_outline_offset pnpm --dir engine test
PASS: same existing exact analytic/SVG/DXF hashes with <=7 calls (baseline9); RED before direct offset change. Warm matched repetitions will follow.

## Findings
C3 RED captured 9 outline calls exceeding7; GREEN preserves all three exact output hashes at7 calls, outline-green.log. Production change uses existing offsetOptions() for direct offset too. No geometry approximation or recipe changes.
## Now
Await browser release attribution while preparing matched outline benchmark and broader geometry regression coverage. No further production changes yet.

## Scenario C3 matched benchmark
node .omo/evidence/performance-20260920/outline-matched.cjs under Node24. One warmup each; sequence before/after/after/before/before/after; freshly prepared layout each run; require deep equality of paths, bounds, contours, SVG and DXF for every run. Binary PASS: after median lower and all outputs equal. Baseline source from HEAD in temporary directory recorded in baseline-path.txt; remove after capture.

## Findings
Read-only queue/offset reviewer APPROVE four-file increment; 4 queue and52 engine tests passed. Report copied to queue-offset-review.md. Reviewer used older task evidence path; preserve historical original content when reconciling artifacts (do not replace previous task report in commit).
Browser CPU profile: moveTargets75.97ms -> moveLayout74.84 -> setLayout74.28; editField63.01 includes sourceDocument42.76 (clone16.86 + parse25.90), editDesign20.25. BoardStudio81.4 includes snapshot41.74 and draft layout28.15. This supports batching missing override coordinates+fixed metadata, not speculative rendering changes. release_edit worker owns only layoutSource.ts and new test; no other source writes delegated.

## Findings
Matched engine experiment PASS: before 7817/7766/7648ms; after5269/5439/5297ms. Median7766->5297ms (31.8% lower) with identical contour digest across all six samples. All analytic paths/bounds/contours/SVG/DXF deep equality. Full engine suite started, engine-suite.log.
## Scenario C2 surface
Node24 node .omo/evidence/performance-20260920/browser-matched.cjs after production build. Owned preview ports4182 baseline and4183 current. Six fresh contexts ordered before/after/after/before/before/after; real mouse36 moves ending12px left. Require source/polygon change, worker success, no errors; compare release median. Then real Escape cancellation, cumulative re-grab, undo/redo pose checks; screenshots375/768/1280; cleanup finally closes browser and servers.

## Findings
Queue real-browser Worker scenario PASS: after cancel during grace and reuse, replacement publishes only revision d; three worker creations; queue-browser.json and .log. All workers terminated/blob revoked/browser closed in finally.
Release edit RED: real YAML parser calls2 and document clones5; GREEN1 parse/3 clones, exact source and pose preserved;21 focused tests pass. Current source edits confined queue, offset option, first override batching; no rendering changes or extra dependencies.
## Now
Finalize source handoff, run precommit and production build, then matched browser/functional QA. Full engine suite progressing.

## Findings
Validation resource failure: full engine killed exit137 while build/precommit overlapped. Build PID2037561 retained~3GB; stopped it with SIGTERM to let precommit finish and rerun heavy checks serially. Release suite20 pass. LSP all changed source/test files clean. No product assertion failed in engine before kill.

## Findings
Validation initial precommit also ended143 before suite completion; retrying serial with Vitest pool capped2 via environment only. No tests skipped/disabled or configuration changes. Initial build intentionally stopped143. Full engine needs serial retry after app checks/build. Release20 tests passed.

## Cleanup receipt
Reviewer report was a new untracked file under old task path, not overwrite. Moved by copy+removal into queue-offset-review.md; no historical file changed.

## Completed increment C1
54c90c2 Restore cancellation grace after reusing the studio queue. RED/GREEN, real browser Worker completion, clean LSP, precommit922 tests and production build passed; independent bounded reviewer approved. Queue evidence committed with fix.
## Findings
Serial precommit PASS (140 files/922 tests,106.77s). Serial production build PASS at3072MB heap. No source changes after validation. Matched browser scenario running alone.

## Scenario C2 PASS
browser-matched.cjs exited0. Before release-to-polygon samples159.6/154.6/162.3ms; after118.8/118.4/119.8ms. Median25.6% lower, six same layout/final polygon. Escape cancellation, cumulative re-grab, exact undo/redo pose and375/768/1280 viewport/noerror assertions passed. Root directly viewed qa-after.png and qa-375.png: key and outline follow committed pose, controls remain visible. Browser cleanup.json confirms browserclosed and previewPIDs2052129/2052170 exited0.
## Now
Full engine serial rerun; independent surface review underway. Need remaining browser integration checks, final review, remaining commits, temp teardown.

## Regression gate
Full engine serial:334 passing/1 failing, rounding.js splayed cavity becomes two contours. Isolated baseline passes. C3 is NOT complete despite benchmark parity. Dedicated bounded worker investigating; root hypothesis negative contraction ray behavior must remain original. Surface reviewer C2 APPROVE, timing is DOM observation not physical latency and re-grab proves cumulative motion only. Final reviewer C1/C2 underway; C3 explicitly excluded pending corrected evidence.

## Browser integration
Existing studio-performance.spec.ts PASS57.8s for drag, nudge, freeze/rebuild, add/remove rows/columns/key, undo/redo and reload. e2e-performance.log and e2e-performance-initial/. Full browser suite stopped maxfailures3: same historical app missing New native design and BHK1440/390 hidden Add key in column7; 1interrupted189notrun. e2e-suite.log and e2e-known-failures/ capture current results. Historical baseline proof in G001.../a1/after/preexisting-failures/REPORT.md. No test weakened. Will rerun affected performance surface after corrected engine rebuild.

## Corrected C3 scope
Initial broad retained-ray change regressed splayed rounding. Positive-only fails and loses7call benefit; negative-only passes existing rounding and exact7call hashes. Final minimal change retains ray only for direct contractions, preserving original expansion path ordering. Topology guard experiment passed but rejected as broader validation-policy change. New full engine/build and matched proofs required on corrected source; original benchmark evidence provisional until replacement.

## Final verification
Corrected contraction-only source: fullengine335PASS engine-final.log, clean geometry LSP. Final reviewer approves C1/C2 and corrected C3 source; final whole-task verdict awaits currentbuild/benchmark. Serialpipeline65572 runs precommit-final, build-final, matchedengine, matchedbrowser then existing performance E2E includingcomponentmove (PERF_NATIVE_ROWS=6). No parallel CPUheavyjobs.

## Corrected C3 PASS
Finalprecommit922PASS; finalbuildPASS regeneratedbrowserbundle contraction-only. Matchedengine rerun six outputs same digest; median7537.485->5232.323ms (30.6% lower). Before7593.53/7534.56/7537.49; after5232.43/5210.16/5232.32. Initialbroadoffset measurements archived initial-broad-offset/. Finalbrowser/performance-E2E running.

## Corrected C2 PASS
Browser rerun median158.3->118.9ms (24.9% lower), sixlayout/polygonparity plusEscape/regrab/undo/responsivePASS. Root directly viewed newqa-after/qa-375; intact. Browserproducer cleanup finallyclosedbrowser/previewservers. Final existingperformanceE2Ewithcomponentmove stillrunning.

## Final surface and cleanup
Serialpipeline65572 exit0. Native60key existingperformanceE2E1PASS1.8min includingcomponentmove/reload. Allfinalchecks nowcomplete. Browserclosed,preview2066582/2066623exit0; Playwrightexit0; ssports4181-4184empty. Removedexactbaseline/tmp/boardstudio-perf-baseline.nxCdZS; archiveddebugjournalandremovedrootcopy. Reviewerfinalevidencepassinprogress; remainingcommits/docs only.

## Completed plan
1.completed discovery/report/skills/baselines.
2.completed C1 RED/GREEN/latestWorker surface, commit54c90c2.
3.completed profile-driven attribution/matchedbaseline.
4.completed C2/C3 RED/GREEN, correctedcontraction-onlyregression, commits765e979 andf33af6b.
5.completed finalbrowser/nativeediting/componentmove/responsivechecks andcleanup.
6.completed335engine/922app/20release/build/LSP; independentfinalreviewAPPROVEallcriteria,no blockers. Remaining evidencecommit records this completed work. No pending implementation, no active children, no push requested for new increments.

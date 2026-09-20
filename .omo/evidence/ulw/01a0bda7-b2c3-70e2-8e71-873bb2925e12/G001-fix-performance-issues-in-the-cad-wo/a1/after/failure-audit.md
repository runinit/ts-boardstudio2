# Remaining failure audit

Read-only investigation against HEAD `347229abc1561a44a2dc6cc0cee50969b49b267e`. No browser, tests, builds, production changes, test weakening, skips, or timeout changes performed. Evidence root below is `full-suite/` relative to this report. Captured runtime assertions and accessibility snapshots are distinguished from source-only hypotheses. This audit covers six failures, not the 22 previously classified or the separately investigated continuous-geometry case.

## Two additional causally classified existing UI failures

### Settings defaults through rename: closed inspector, before rename

Exact failure: `app/e2e/settings-consolidation.spec.ts:58`, `Column spacing.scrollIntoViewIfNeeded()`. `full-suite/check.log:10324–10349` records repeated “element is not visible”; the abbreviated JSON omitted this second error. The test first proves one matching DOM element exists, but never opens Inspector. Snapshot `settings-consolidation-kee-e8a62-s-defaults-through-a-rename-chromium/error-context.md:110–129` shows the Inspector trigger and then canvas main, without a visible inspector. The rename at spec:62 is never reached.

Causal path: `app/src/molecules/BoardStudio.tsx:144` initializes `sheet=''`; lines 992–997 pass `$open={!!sheet}` to StudioPane. `app/src/molecules/StudioStyles.tsx:282` uses `display:none` whenever closed, including desktop. `StudioInspector.tsx:671` supplies the existing Column spacing field inside that pane. `git diff HEAD -- app/src/molecules app/e2e` is empty. This establishes a preexisting visibility mismatch, not a rename/default persistence regression.

### Native side view: local dimension hint instead of world position

Exact failure: `app/e2e/native-layout.spec.ts:169`, expects visible text `= 2.5 mm`. Snapshot `native-layout-shows-indepe-9a193-nd-generates-their-assembly-chromium/error-context.md:250–274` shows battery X=10, Y=8, Z input `0.5`, hint `= 0.5 mm`.

Causal path: `StudioInspector.tsx:730–739` passes resolved position as `options.actual` to its field helper. But numeric/placement fields take the early DimensionField return at lines 179–202, which does not pass that option. The world-position rendering at lines 236–240 belongs to the other branch. `DimensionField.tsx:54–56` computes its displayed value from the local draft; lines 144–146 render that result. Both files are byte-unchanged relative to HEAD. The existing UI necessarily displays the local 0.5 hint for this captured value; the performance changes cannot make that branch render the expected world 2.5 hint. This classifies the failing assertion only, not later generation steps that were never reached.

## Four failures still require serial runtime evidence

### BHK CNC relief

Failure: `enclosures.spec.ts:298` calls ready; assertion at line 56 waits for Case designer status `/Current geometry/`; 180s overall timeout, 90s assertion budget (`check.log:9898–9928`). Snapshot `enclosures-generates-BHK-C-cd4a9-f-from-the-process-controls-chromium/error-context.md:472` says `Updating geometry…`; line 488 says `Generating… · 39 components · PCB 1.6 mm`. This is a real unfinished generation state, not an obsolete status label.

Competing hypotheses: contention during parallel full suite; an existing slow/stuck CNC generation; changed outline offset/cache behavior. The performance diff changes `engine/src/designs/geometry.js` offset ray lifetime and `designs/index.js` offset reuse, and so source inspection cannot exclude changed generation behavior. The passing engine CNC case (`check.log:3143`) is useful but does not prove this browser sequence. Next: run only this exact test with one worker on current, capture worker completion/error timings and source at generation, then repeat identical fixture/sequence against HEAD if failure persists. Keep original timeout and assertion.

### Native BHK controller model binding

Failure: `footprint-library.spec.ts:279`, selecting `top process=fdm`; 15s action timeout, locator resolved to select but waited for visible/enabled (`check.log:9959–9976`). Snapshot `footprint-library-assigns--71080--exports-the-object-binding-chromium/error-context.md:325–327` contains top process combobox; line 446 says `Case needs regeneration · 39 components · PCB 1.6 mm`. Snapshot alone does not establish the transient visibility/enabled state, responsiveness, or whether the timeout was scheduling contention.

Next: serial exact test, capture bounding box, computed visibility/disabled state, page responsiveness, source after bottom-process change and before top-process action. If repeatable, compare HEAD under same fixture. Do not classify as hidden-control or performance regression without this evidence.

### Portable KiCad bundle import

Failure: `footprint-library.spec.ts:224`, Current geometry assertion on `reopened`, which belongs to **offlinePage** (`spec:205–224`, `check.log:9932–9955`). Snapshot `footprint-library-imports--4398a--exports-a-portable-project-chromium/error-context.md:130–155` shows original page Export with current PCB/case files and `3D preview current · 0 keys`. That snapshot does not describe the failing offline page.

Next: exact serial test; capture offlinePage separately after ZIP import and Case opening, including status, alerts, console/page errors and worker/network completion. Distinguish offline asset availability, generation completion and total test budget before comparing identical exported archive on HEAD. Existing primary-page snapshot cannot settle runtime cause.

### Snapped edge relationship

Failure: `settings-consolidation.spec.ts:188`, Keep relationship · Edge offset should be enabled. Captured call log resolves a disabled button three times and then no matching element (`check.log:10355–10380`). Snapshot `settings-consolidation-ret-6b4b5-only-after-the-snapped-drop-chromium/error-context.md:199–200` has layout current and no Keep relationship button.

Relevant unchanged mechanism: `StudioCanvas.tsx:95–97` clears lastSnap when source differs; lines 260–264/275–279 save snap with candidate source; lines 394–410 require exact source equality and disable while stale. This fits, but does not prove, post-drop source rewriting invalidating the affordance. Other possibilities include selection/attachment predicate changes or snap lifecycle timing. Performance changes include source-edit utilities, so unchanged canvas code alone is insufficient baseline proof.

Next: exact serial test, capture candidate source, committed source and subsequent source revisions, lastSnap/selection/stale and attachment eligibility at drop and analysis completion. Compare HEAD with same fixture and drag coordinates. If a source rewrite removes the button, identify the exact writer before assigning regression status.

## Scope and verification

Inspected FAILURES.md, failure-classification.json, check.log, all six archived error-context files, exact test locations and current causal source. Verified no HEAD diff in `app/e2e`, `app/src/molecules`, and `app/src/hooks/useStudio.tsx`; reviewed actual changed engine geometry/cache diff. No assumption that unchanged UI files prove unchanged upstream state. Four ambiguous cases remain explicitly unresolved. Findings sent to perf_browser, which owns subsequent serial QA after the isolated benchmark.

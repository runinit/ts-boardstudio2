# repair-browser-test-flows - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->
<!-- Plain English for a non-engineer: NO file paths, NO todo numbers, NO wave/agent/tool names. -->

**What you'll get:** Three repaired browser tests that follow the current project-creation and inspector flows while retaining their checks.

**Why this approach:** Update obsolete test actions instead of changing working product behavior. Isolate validation from ongoing footprint work.

**What it will NOT do:** Change the application, weaken tests, fix unrelated suite failures, or publish changes.

**Effort:** Short
**Risk:** Low for code changes; medium for verification because the broader suite has unrelated stale flows.
**Decisions to sanity-check:** Failing-first browser verification; preserve default project creation and collapsed inspector behavior.

Your next move: Start execution separately, or request high-accuracy plan review first.. Full execution detail follows below.

---

> TL;DR (machine): Short; bounded test repairs in an isolated worktree; three execution tasks and four final verifiers.

## Scope
### Must have
- Repair the three reported failures: native matrix creation/PCB preview and BHK row editing at1440px and390px.
- Limit test edits to `app/e2e/utils/studio.ts`, `app/e2e/app.spec.ts`, and `app/e2e/bhk-matrix.spec.ts`.
- Preserve every existing meaningful source, preview, electrical, undo and responsive assertion. Replace obsolete matrix-creation clicks with assertions on the matrix actually created by `/new`.
- Validate all shared-helper consumers and record complete browser-suite results.
### Must NOT have (guardrails, anti-slop, scope boundaries)
- No production UI/router/engine changes, default-expanded inspector, fixture seeding that bypasses creation, skipped tests, forced clicks, arbitrary sleeps, timeout increases or weakened assertions.
- No unrelated footprint/PCB/KiCanvas changes, broad test modernization, push, PR or merge. Additional unrelated browser failures are reported, not silently fixed.
- Do not reset, stash, format, rebuild or otherwise modify the active dirty source checkout. No shared-node_modules symlinks into it.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: failing-first existing Playwright scenarios (RED → GREEN); no redundant unit tests for test helpers.
- Runtime: Node24+ and pnpm11.26.0. On this host prepend `/home/chris/.nvm/versions/node/v24.14.0/bin` to PATH.
- Worktree: `/home/chris/projects/ts-boardstudio2-browser-test-flows`, branch `fix/browser-test-flows`, base `6a130dcf655dee60414e1f43fe76134d84ea20e3`. Create with `git worktree add -b fix/browser-test-flows /home/chris/projects/ts-boardstudio2-browser-test-flows 6a130dcf655dee60414e1f43fe76134d84ea20e3`. If already present, verify ownership/base and resume; never overwrite another checkout. A user-provided task-owned `--worktree` overrides this path.
- All execution commands below run inside that worktree. Install its own dependencies with `pnpm install --frozen-lockfile`; install Chromium if missing using `pnpm --dir app exec playwright install chromium`.
- Set `PLAYWRIGHT_PORT=4184` and `PLAYWRIGHT_HTML_OPEN=never`. Verify port4184 free; use4185 if occupied, recording the choice. Never stop a user server. Playwright owns and closes its preview server.
- Evidence root: `.omo/evidence/repair-browser-test-flows/` inside the task worktree. Create it before redirects. Capture each command's actual exit code, log and tested SHA/diff. Do not pipe away failure status.
- Build once before RED with `NODE_OPTIONS=--max-old-space-size=3072 pnpm build`. Tests-only edits do not require another build. Do not claim an old `app/dist` is current.
- Append `--trace=retain-on-failure --reporter=list` to all Playwright commands below. Paths passed to `--output` are relative to app because commands use `pnpm --dir app`.
- Heavy checks run serially. Full-suite failures must be classified against unchanged baseline; no full-suite success claim unless every test passed.

## Execution strategy
### Parallel execution waves
One implementation wave with three tasks: native repair and BHK repair have independent edits, but browser runs share a server and run serially. Task3 follows both. One final verification wave follows task3; read-only reviews may run in parallel with the sole browser QA runner.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 | none | 2,3 | none; establishes isolated baseline |
| 2 | 1 baseline setup | 3 | task1 edits only; never concurrent browser runs |
| 3 | 1,2 | F1–F4 | none |
| F1–F4 | 3 | handoff | each other; only F3 owns browser execution |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [x] 1. Repair native draft readiness and matrix/PCB acceptance
  What to do: establish the isolated worktree and fresh build above. Before any test edit, run `pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/red --trace=retain-on-failure --reporter=list`; capture the three failures. Historical proof in `.omo/evidence/performance-20260920/e2e-suite.log` is context only. If a target no longer fails, record current behavior before deciding whether its stale interaction still needs repair; never manufacture a failure.
  In `createDraft`, remove obsolete Import-only navigation and Apply setup clicks. Wait for the deployment root URL, visible Board Studio and exactly20 default `fingers_cN_rN` key buttons. Use the existing role selectors and web-first assertions. Never navigate or create another project inside this readiness helper; existing callers already trigger creation. Retain the exported name to avoid unrelated call-site changes.
  In `app.spec.ts`, preserve `/new` navigation; replace obsolete Add matrix/form/Create actions with polled saved-YAML assertions: schema `ergogen/v1`, fingers arrangement `type: columns`, columns `c1`–`c5`, rows `r1`–`r4`, and20 matching layout objects/rendered keys. Parse YAML using the existing `yaml` dependency. Keep interactive-layout, schema, KiCad canvas, unavailable-message absence and hidden-source assertions. Do not change expected data to match whatever output happens to return.
  Parallelization: Wave1 | Depends on:none | Blocks:2 baseline,3.
  References: `AGENTS.md`; `app/AGENTS.md`; `app/src/App.tsx:314` NewProject and root route near681; `app/src/utils/designSetup.ts:139,230,276`; `app/e2e/utils/studio.ts:73`; `app/e2e/app.spec.ts:4`; `app/src/pages/Welcome.tsx:835` valid Import navigation; `app/e2e/routing.spec.ts:39` second-project flow; `app/e2e/icons.spec.ts:67` Import navigation already occurs before helper.
  Acceptance: app scenario exits0 with exactly20 keys, expected persisted arrangement and live PCB canvas. No helper-created duplicate project.
  QA happy: `pnpm --dir app exec playwright test e2e/app.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/native-green --trace=retain-on-failure --reporter=list`; capture PCB screenshot via `test.info().outputPath('native-pcb.png')` after canvas assertion.
  QA failure: preserve pre-edit RED log/trace showing missing New native design at helper call; unchanged assertions must still fail if source matrix or PCB preview is absent. Inspect diff to reject removed/relaxed assertions rather than adding synthetic unit tests.
  Evidence: evidence root `red.log`, `red/`, `native-green.log`, `native-green/` and exit-code ledger.
  Commit: deferred to task3 so required precommit runs once; include helper and app scenario together.

- [x] 2. Open BHK Row keys before interacting at both widths
  What to do: after asserting heading Row2, click the exact Row keys summary before checking Add key in column7. Scope to the Design inspector if needed to avoid duplicate matches. Assert the disclosure is open and the add button visible/enabled through ordinary browser interaction. Preserve every movement, existing properties, untouched neighboring row, added cell, column_net/row_net, bhk_pcb, two undos, column stagger and no-overflow assertion. Keep both1440×900 and390×844 cases and their screenshots. Execution discovery: initial disclosure repair exposes a second stale Relative x step (fresh traces bhk-green/). Also repair navigation to the current row-adjustment controls in this same spec, keeping the exact +1mm row/source/undo assertions. Preserve each failed attempt under a distinct evidence path. Do not globally expand the production inspector or bypass actionability.
  Parallelization: Wave1 | Depends on:task1 RED/build setup | Blocks:3.
  References: `app/e2e/bhk-matrix.spec.ts:9,34,37,58`; `app/src/molecules/RowInspector.tsx:38`; `app/src/molecules/InspectorSection.tsx:12`; `app/e2e/studio-performance.spec.ts:172` disclosure-click precedent; `.omo/evidence/performance-20260920/e2e-known-failures/` historical contexts.
  Acceptance: both cases pass all existing assertions and retained screenshots show the selected inspector content without horizontal page overflow.
  QA happy: `pnpm --dir app exec playwright test e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/bhk-green --trace=retain-on-failure --reporter=list`.
  QA failure: task1 RED captures both hidden-button failures. Confirm the repair performs a real summary click; retain source assertions proving adding a cell and undoing it, rather than merely making the selector visible.
  Evidence: `bhk-green.log`, `bhk-green/`, RED traces and exit-code ledger.
  Commit: deferred to task3; separate BHK test commit from native helper repair.

- [x] 3. Verify shared consumers, classify the full suite and prepare local commits
  What to do: run helper consumers, then the full browser suite without max-failure cutoff. Read all failures and classify as introduced, target, or unrelated using baseline source/results. Fix only regressions caused by these test edits. Existing independent stale `/new` navigation in `layout-units.spec.ts:22` is a known possible broader failure, outside this approved repair. Do not claim it fixed or hide it. Run required precommit inside the isolated worktree, inspect its modifications, and stage only owned files/evidence. If unrelated formatting changes occur, restore only changes demonstrably produced by this isolated run; never operate on the original checkout.
  Parallelization: Wave1 | Depends on:1,2 | Blocks:F1–F4.
  References: `app/e2e/routing.spec.ts`; `app/e2e/responsive.spec.ts`; `app/e2e/icons.spec.ts`; `app/e2e/studio-settings-and-svg.spec.ts`; `app/playwright.config.ts`; `app/package.json` precommit; root/app AGENTS; `.omo/drafts/repair-browser-test-flows.md` scope and dirty-worktree constraints.
  Acceptance: all three target cases pass; helper change introduces no consumer regression; routing still creates exactly two distinct saved projects in the second-project test. All remaining full-suite failures have named evidence and are not relabeled passes. Changed-file diagnostics/typecheck clean; precommit succeeds or an unrelated baseline blocker is explicitly reported without claiming commit readiness.
  QA happy: `pnpm --dir app exec playwright test e2e/routing.spec.ts e2e/responsive.spec.ts e2e/icons.spec.ts e2e/studio-settings-and-svg.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/consumers --trace=retain-on-failure --reporter=list`.
  QA failure/regression: `pnpm --dir app exec playwright test --workers=2 --output=../.omo/evidence/repair-browser-test-flows/full --trace=retain-on-failure --reporter=list`; retain all failed traces and exact totals. For uncertain attribution, run that unchanged scenario at the task base in another owned checkout; never revert unrelated source to force a pass.
  Gate: `VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 pnpm precommit`. Check final diff for skips, forced actions, sleeps, timeout changes or weakened assertions. Verify owned preview ports are released and browsers closed.
  Evidence: `consumers.log`, `full.log`, `precommit.log`, their output directories, `completion.md` with command/exit/SHA ledger and cleanup receipts.
  Commit: yes after gates, two local atomic test commits plus evidence as needed. Read `git log --oneline -20` and path history first; use imperative subjects consistent with repository. No push or integration into the dirty original branch.

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit
  Read this plan, final diff and completion ledger; verify all three target scenarios and every preserved assertion. Report APPROVE or criterion-specific blocker to `final-compliance.md`. Do not accept historical RED as fresh evidence.
- [x] F2. Code quality review
  Independently inspect only changed test code for deterministic readiness, semantic selectors and absent assertion weakening. Verify precommit/diagnostic receipts match final source. Report to `final-quality.md`.
- [x] F3. Real manual QA
  Sole browser owner: run `pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/final-surface --trace=retain-on-failure --reporter=list`; personally inspect desktop PCB and both BHK screenshots. Require three passes and visible real canvas/disclosure interactions, verify no QA processes remain. Report to `final-surface.md`.
- [x] F4. Scope fidelity
  Compare task branch with its recorded base and confirm only the three allowed test files plus task evidence changed. Verify the original dirty checkout was never formatted, built, reset or staged by this task. Check all unrelated failure disclosures. Report to `final-scope.md`.

## Commit strategy
Keep native helper/app assertions together and BHK disclosure repair separate; attach evidence or record it in a final documentation commit. No changelog required for test-only changes. Retain the task worktree for handoff; clean only owned runtime resources. Do not merge/cherry-pick into active unrelated work without a separate user instruction.

## Success criteria
- Three previously reported tests pass on a fresh build without weakening behavioral coverage.
- Shared draft readiness cannot create duplicate projects; matrix dimensions/source and PCB canvas remain proven.
- Both BHK widths prove row movement, add-cell electrical properties and undo, with no overflow.
- Full-suite results are honestly classified, all four final reviewers approve, and runtime cleanup is recorded.
- Surface verification results for the user's final okay as required by this workflow; never use that handoff as permission to push or merge.

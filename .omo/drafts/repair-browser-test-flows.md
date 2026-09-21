---
slug: repair-browser-test-flows
status: plan-ready
intent: clear
review_required: false
pending-action: user selects start-work or optional high-accuracy review
approach: Repair stale test interactions against current routes and collapsed inspector sections; preserve behavioral coverage and production UI.
---

# Draft: repair-browser-test-flows

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->

## Findings (cited - path:lines)

## Decisions (with rationale)

## Scope IN

## Scope OUT (Must NOT have)

## Open questions

## Approval gate
status: plan-ready
<!-- When exploration is exhausted and unknowns are answered, set status: plan-ready. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->


## Grounded approval brief

Classification: Standard. Intent clear; review_required false. No owner-decision remains beyond approval of this test-only approach.

Components:
- C1 active: native draft creation and PCB preview. app/src/App.tsx:314 NewProject creates compileSetup(defaultSetup()) and redirects to root. app/src/utils/designSetup.ts:139 defaults5x4, :230 compiles fingers cluster. app/e2e/utils/studio.ts:73 instead clicks Import-only navigation and Apply setup. app/e2e/app.spec.ts:7 then tries obsolete empty-board Add matrix flow despite default20-key board already existing.
- C2 active: BHK row interaction at1440/390. app/e2e/bhk-matrix.spec.ts:34-39 must open Row keys summary before child-button visibility/click. app/src/molecules/RowInspector.tsx:38 and InspectorSection.tsx:12 establish default collapsed state. Existing precedent app/e2e/studio-performance.spec.ts:172.
- C3 active: preserve shared-helper callers and record browser evidence, independent of unrelated footprint work.

Approach to encode after approval:
1. Capture current failures against a fresh build before changes (existing historical logs are provenance, not fresh RED). Make createDraft wait for actual completed native draft state, no duplicate project creation, no obsolete navigation/setup clicks. Keep valid Import-page New native design navigation intact in icons.spec.ts.
2. Align app.spec.ts with /new auto-creating fingers5x4; replace obsolete Add matrix actions with explicit saved-source arrangement/20-key assertions, retaining all PCB preview/schema assertions. Do not remove matrix-creation behavior coverage: /new is its actual creation action.
3. Open Row keys disclosure in BHK spec before expecting Add key in column7, preserving relative movement, electrical properties, PCB assignment, add-cell, undo, column stagger and viewport overflow checks.
4. Run focused app/BHK tests, all createDraft consumers (routing, responsive, icons, studio-settings-and-svg), then full browser suite without max-failure cutoff to distinguish newly exposed failures. Preserve assertions, no forced clicks, sleeps, skips, timeout inflation or product changes to accommodate stale tests. New unrelated failures are recorded separately, not silently included in this repair.

Test strategy: failing-first existing Playwright scenarios (RED then GREEN), no redundant unit tests for test helpers. Node24/pnpm11.26; fresh pnpm build, PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --reporter=list. Capture logs/screenshots/source checks under .omo/evidence/repair-browser-test-flows/ during execution. Final pnpm precommit required before implementation commit. Run serial heavy checks.

Scope IN: app/e2e/utils/studio.ts, app/e2e/app.spec.ts, app/e2e/bhk-matrix.spec.ts; behavior-preserving validation of shared helper consumers; evidence. Scope OUT: production UI/router changes, fixture seeding that bypasses creation, unrelated footprint/engine changes, fixes for every historical browser failure, automatic push/PR.

Dirty-worktree risk: extensive active footprint/PCB/KiCanvas edits already exist, including BoardStudio.tsx, engine and generated bundles. Preserve them, re-read affected contracts at execution, stage only task-owned paths; do not use reset/stash or indiscriminate add. Planning has not run builds/tests or modified product code.

Additional known stale direct navigation in layout-units.spec.ts:22 is outside the three requested failures and does not consume createDraft; report separately if full suite exposes it. Do not claim full suite green until actually observed.

Approval gate satisfied by user reply "go". Plan now exists at .omo/plans/repair-browser-test-flows.md; execution requires separate start-work invocation.

## Approval receipt
User replied "go" after the approval brief. Plan creation authorized; implementation not started. Metis gap review in progress. Current base SHA6a130dcf655dee60414e1f43fe76134d84ea20e3; the three proposed test files have no existing edits. Use a task-owned worktree for execution because build/precommit mutate generated assets and unrelated source in the active checkout.

## Plan completion
Metis browser_plan_metis terminal: gaps found and incorporated: isolated worktree for mutating checks; explicit helper readiness; exact source arrangement assertions; retained failure traces and separate output dirs; exact consumer command; corrected approval metadata. No remaining blocking ambiguity. Structural check PASS:3 execution tasks,4 final-verification tasks, correct section order. High-accuracy review not requested/performed. Product code unchanged by planner.

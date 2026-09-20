# Snap failure: confirmed on original HEAD

Original HEAD `347229abc1561a44a2dc6cc0cee50969b49b267e` reproduces the same failure as final current production: `settings-consolidation.spec.ts:188`, Keep relationship · Edge offset briefly exists disabled, then disappears. This is an existing bug, not introduced by the performance patch.

## Baseline and evidence

Isolated git archive of HEAD; production source and engine were not edited. App dependencies reused workspace modules individually, but **ergogen points to isolated HEAD engine**, not current engine. Workers import that package directly. Tracked HEAD public bundle retained. Generated footprint JSON copied from workspace (footprints unchanged).

Node24.14.0 direct Vite production build with 8GB heap succeeded in43.34s (`snap-head/build.log`); isolated preview port3109. Exact original fixture, drag, assertion and timeout retained. Only appended beforeEach logs Worker requests/source replies without changing them; archived `snap-head/instrumented-spec.txt` and `snap-head/snap-audit.config.mjs`.

`snap-head/run.log:24–30`: no matching element at timeout; four previous polls found disabled button. Failure is original line188. Snapshot/trace: `snap-head/results/settings-consolidation-ret-6b4b5-only-after-the-snapped-drop-chromium/{error-context.md,trace.zip}`. Current production counterpart: `final-snap/run.log` and `final-snap/test-results/`.

Earlier dev attempts never reached scenario due to module/asset startup issues; excluded from conclusion. Temporary dev config edits restored before production build; `snap-head/dev-startup.log` records limitation.

## Observed rewrite and causal path

`snap-head/worker-messages.json` and numbered YAML captures:

1. Initial studio keep request (`source-0.yaml`,4596 bytes), identical success (`source-1.yaml`).
2. Drag submits studio rebuild (`source-2.yaml`,4649 bytes).
3. Success returns rewritten source (`source-3.yaml`,5093 bytes).

`source-amendment.diff` shows exact rewrite: adds regions.main_body to main boundary, creates fingers_c1_r1_follower automatic bridge, and adds managed-outline metadata. Follower placement is unchanged between request and reply. Outline preparation changes source identity after accepted snapped move.

Unchanged code connects observations:

- `app/src/hooks/useStudio.ts:130–136`: subsequent edit with automatic outline requests rebuild.
- `app/src/workers/studioPipeline.ts:43–46`: rebuild invokes prepareOutlines; `app/src/utils/studioOutline.ts:214–231` calls addOutline and writes managed metadata. Pipeline returns rewritten source with success.
- `useStudio.ts:103–110`: changed success source adopted through session.amend.
- `StudioCanvas.tsx:260–264`/`275–279`: lastSnap saved with candidate source. Lines394–410 require exact source identity and disable button while stale; lines95–97 clear lastSnap on source change.

Captured automatic-outline amendment invalidates candidate identity associated with Keep relationship. Baseline runtime proves bug predates performance changes. No production fix, weakened assertion, skip or timeout increase.

## Cleanup

Playwright preview server exited. Temporary checkout cleanup tracked separately below; retained logs, trace, messages and instrumentation. Workspace source, installed engine and user edits preserved.

Cleanup completed: isolated checkout/build removed with non-force recursive removal; ports3109/3110 have no listeners. Initial force-removal command was automatically rejected before execution; reran evidence writes separately and used ordinary removal.

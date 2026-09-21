# Separate runtime audit

Verdict: **PASS** for exact SHA `c096debd89cf8b77b0b9f30dad99467a37ee599d`.

This is a debugging-method audit of the already-run browser scenarios. It did not modify source or tests, rebuild the app, rerun the full 193-test suite, or add retries. The runtime was Node `v24.14.0`, pnpm `11.26.0`, Chromium, and a Vite production preview on port `4184`.

## Distinguishing hypotheses and observed checks

| hypothesis | distinguishing runtime check | observed evidence | verdict |
|---|---|---|---|
| H1 — `createDraft` still creates or navigates to a duplicate project | Run the real routing test: call `createDraft`, save the first source, create a second project through Projects → New, call `createDraft` again, reload, compare the source, then inspect persisted configs and ID cardinality. | `routing-final.log` reports the real test passed. Its existing assertions require first-source equality, `configs.length === 2`, and two distinct IDs; `routing-final.exit` is `0`. | PASS / refuted |
| H2 — the row nudge changes only the first key | Run the real BHK test at both 1440×900 and 390×844. It polls all six `matrix_c1_r4` through `matrix_c6_r4` objects and requires every pose to be `[1, 0, 0]`, then checks neighbors, add-cell wiring, and both undos. | `final-surface.log` reports both BHK tests passed. The 1440 and 390 screenshots show the resulting live BHK layouts and inspector surfaces; the source assertions are in `bhk-matrix.spec.ts:58-76`. | PASS / refuted |
| H3 — stale artifact, wrong checkout, or hidden-control false pass | Bind the run to the exact SHA, use the task-owned production preview, compare build/source receipts, require semantic browser assertions and non-empty screenshots, and inspect the actual screenshots personally. | Both run preflights printed SHA `c096debd89cf8b77b0b9f30dad99467a37ee599d`; final surface produced three passes and three screenshots; current production-path diff against base is `0`; the desktop screenshot contains the actual KiCad canvas and the mobile screenshot contains the real inspector. | PASS / refuted |

The final-surface invocation was:

```text
timeout 1800 env PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/final-surface --trace=retain-on-failure --reporter=list
```

The duplicate-project invocation was:

```text
timeout 900 env PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/routing.spec.ts --grep 'creates a second project' --workers=1 --output=../.omo/evidence/repair-browser-test-flows/routing-final --trace=retain-on-failure --reporter=list
```

## Five reflection cases

1. Helper duplication: the routing test is the direct discriminator and passed with exactly two distinct persisted IDs.
2. One-key nudge: both viewport cases require all six populated Row 4 keys to move together and passed.
3. Stale or wrong artifact: SHA, stable `app/dist/index.html` hash `c54faa3c0529095f2948e7828276bb2a747928df2a1f461c10be74eac6c7c59a`, and zero production-path diff were checked.
4. Hidden-control false pass: the tests click the real Row keys summary and KiCad PCB controls, assert disclosure/canvas state, and the captured screenshots show those surfaces.
5. Flake or misleading success: Playwright config has `retries: 0`; one worker used fresh contexts; exit ledgers are `0`; list logs contain 3 and 1 semantic passes; all three screenshots are non-empty; no process remained.

## Applicable adversarial audit

| class | result | evidence |
|---|---|---|
| stale state: build hash and production diff | PASS — final run stayed on exact SHA; stable build hash and zero production-path diff | `integration-start.txt`, `final-port-receipt.txt`, current `git diff --name-only ... -- app/src engine/src footprints/src app/public app/patch` output |
| dirty worktree: scoped checkout | PASS — task-owned worktree; only `app/e2e/app.spec.ts`, `app/e2e/bhk-matrix.spec.ts`, and `app/e2e/utils/studio.ts` are tracked source paths changed from base | `integration-start.txt`, `integration-done.md` |
| flaky contexts: fresh contexts and zero retries | PASS — one worker and `retries: 0`; no rerun/retry wrapper | `app/playwright.config.ts`, `final-surface.log` |
| misleading exit counts/screenshots | PASS — semantic assertions, exit files, list logs, and three non-empty screenshots agree | `final-surface.log`, `final-surface.exit`, `routing-final.log`, `routing-final.exit`, final screenshots |
| long commands | PASS — finite `timeout 1800` and `timeout 900`, both completed within bounds with preserved exits | the two command logs and exit ledgers |
| cleanup finally | PASS — port 4184 free and no owned vite/playwright process after each command | `final-port-receipt.txt` |

Classes genuinely not triggered by this local static-preview test change are `N/A`: authentication/session expiry, external API outage, destructive migration rollback, and multi-user concurrency. No blocker was found. No debug source instrumentation, temporary test file, or inspector process was created.

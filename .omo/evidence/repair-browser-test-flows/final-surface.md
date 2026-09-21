# Final surface manual QA

`manualQa` verdict: **PASS** for exact SHA `c096debd89cf8b77b0b9f30dad99467a37ee599d` in `/home/chris/projects/ts-boardstudio2-browser-test-flows`.

The tested surface was a fresh Chromium browser against the existing production preview at `http://127.0.0.1:4184/boardstudio/`. The production build was left unchanged. The bounded inventory below was prepared from the plan and mapped to the existing assertions before execution; no new test flow or source change was introduced.

## Scoped scenario inventory

These 30 checks were the complete target surface:

1. `/new` reaches the root URL.
2. Board Studio is visible.
3. Exactly 20 `fingers_cN_rN` key buttons render.
4. Persisted YAML has `schema: ergogen/v1`.
5. Fingers arrangement has `type: columns`.
6. Persisted columns are `c1` through `c5`.
7. Persisted rows are `r1` through `r4`.
8. Persisted layout objects contain 20 matching finger objects.
9. Interactive board layout group is visible.
10. PCB navigation and the exact `KiCad PCB` control work.
11. A KiCad canvas is visible.
12. `PCB preview unavailable` is absent.
13. `kicanvas-source` is hidden.
14. BHK import loads Studio and the selected `matrix_c4_r4` key.
15. The `Row 2` inspector heading is visible.
16. The real `Row keys` disclosure opens.
17. `Add key in column 7` is visible and enabled.
18. The six populated Row 4 IDs are all affected by the row nudge.
19. Each of those six IDs has pose `[1, 0, 0]`.
20. Existing object properties remain unchanged after the nudge.
21. `matrix_c7_r4` remains absent before add and `matrix_c1_r3` remains without placement.
22. Add key creates `matrix_c7_r4` with cell `['c7', 'r4']`.
23. Added key wiring properties are `column_net: c7` and `row_net: r4`.
24. Added key uses `bhk_pcb`.
25. First undo removes the added cell.
26. Second undo restores the exact original object map.
27. Column 3 retains stagger value `ky / 4`.
28. The 390px page has no horizontal overflow.
29. The routing flow retains the first project's exact source after creating the second.
30. The routing flow persists exactly two projects with two distinct IDs.

Existing assertion/probe mapping: checks 1–13 are asserted by `app/e2e/utils/studio.ts:73-79` and `app/e2e/app.spec.ts:5-58`; checks 14–28 are asserted by `app/e2e/bhk-matrix.spec.ts:9-128` at both viewports; checks 29–30 are asserted by `app/e2e/routing.spec.ts:39-58`.

## Exact invocations and surface evidence

The exact surface and invocation were stated before each run. Both commands use Node `v24.14.0` through the task PATH, Playwright Chromium, one worker, zero retries, retained failure traces, and list reporting.

| scenario id | criterion reference | surface | exact invocation | verdict | artifactRefs |
|---|---|---|---|---|---|
| F3-NATIVE | Plan F3 / native matrix + PCB | Chromium browser UI, `/boardstudio/new` → native Studio → PCB canvas at the default desktop viewport | `timeout 1800 env PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/final-surface --trace=retain-on-failure --reporter=list` | PASS | FS-A1, FS-A2, FS-A3 |
| F3-BHK-1440 | Plan F3 / BHK row and column editing | Chromium browser UI, `/boardstudio/import` BHK flow at 1440×900; real Row keys disclosure, row nudge, add cell, two undo actions, column stagger, overflow probe | `timeout 1800 env PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/final-surface --trace=retain-on-failure --reporter=list` | PASS | FS-A1, FS-A2, FS-A4 |
| F3-BHK-390 | Plan F3 / responsive BHK editing | Chromium browser UI, `/boardstudio/import` BHK flow at 390×844; same real editing and no-overflow assertions | `timeout 1800 env PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/final-surface --trace=retain-on-failure --reporter=list` | PASS | FS-A1, FS-A2, FS-A5 |
| F3-ROUTING | Plan Todo 3 / duplicate-project regression | Chromium browser UI, root route, two saved native projects, reload, localStorage project count and distinct-ID assertions | `timeout 900 env PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/routing.spec.ts --grep 'creates a second project' --workers=1 --output=../.omo/evidence/repair-browser-test-flows/routing-final --trace=retain-on-failure --reporter=list` | PASS | FS-A6, FS-A7 |

The final-surface command reported `3 passed (14.4s)` and exit `0`. The sequential routing command reported `1 passed (4.8s)` and exit `0`. The three screenshots were personally inspected: the desktop PCB image contains a visible KiCad canvas with 20 keys; the 1440px image shows the BHK layout and selected column inspector; the 390px image shows the usable inspector and no clipped horizontal page. The screenshots are non-empty (48,077, 91,382, and 49,004 bytes).

## adversarialCases

| scenario id | criterion reference | adversarial class | expected behavior | verdict | artifactRefs |
|---|---|---|---|---|---|
| ADV-STALE-FINAL | Plan verification strategy | stale_state / build-hash-and-production-diff | The browser must exercise the requested SHA's existing production preview; the build hash must remain stable and production source paths must have zero diff from base. | PASS | FS-A8, FS-A9, FS-A10 |
| ADV-DIRTY-FINAL | Repository safeguards | dirty_worktree / scoped-checkout | Evidence and runtime state stay in the task-owned checkout; only the three allowed e2e files differ from base among tracked source paths. | PASS | FS-A8, FS-A9, FS-A10 |
| ADV-FRESH-FINAL | Plan verification strategy | flaky / fresh-contexts-and-zero-retries | Each Playwright test uses a fresh context, serial worker execution, and `retries: 0`; a pass must be a real assertion pass. | PASS | FS-A1, FS-A2, FS-A10 |
| ADV-SUCCESS-FINAL | Manual QA protocol | misleading-exit-counts-or-screenshots | Exit 0 must agree with semantic assertions, non-empty screenshots, and the list reporter; a screenshot alone cannot establish a pass. | PASS | FS-A1, FS-A2, FS-A3, FS-A4, FS-A5, FS-A6, FS-A7 |
| ADV-LONG-FINAL | Plan verification strategy | long-command / finite-timeout | Browser commands must have finite bounds and preserve their real exit codes. | PASS | FS-A1, FS-A2, FS-A6, FS-A7 |
| ADV-CLEANUP-FINAL | Repository safeguards | cleanup-finally / owned-runtime-resources | Port 4184 and owned preview/browser processes must be released after both commands. | PASS | FS-A11 |

No other adversarial class was triggered by this test-only browser change; network authentication, destructive data migration, and external-service failure classes are not applicable because the exercised flows are local static-preview UI interactions with no account or external write boundary.

## artifactRefs

| id | kind | description | path |
|---|---|---|---|
| FS-A1 | log | Fresh final-surface Playwright list output; three target tests passed | `.omo/evidence/repair-browser-test-flows/final-surface.log` |
| FS-A2 | exit ledger | Final-surface command exit code `0` | `.omo/evidence/repair-browser-test-flows/final-surface.exit` |
| FS-A3 | screenshot | Desktop native PCB canvas with 20 keys | `.omo/evidence/repair-browser-test-flows/final-surface/app-creates-a-matrix-draft-and-previews-its-PCB-chromium/native-pcb.png` |
| FS-A4 | screenshot | BHK row/column editing at 1440×900 | `.omo/evidence/repair-browser-test-flows/final-surface/bhk-matrix-edits-BHK-rows-and-columns-at-1440px-chromium/bhk-matrix-1440.png` |
| FS-A5 | screenshot | BHK row/column editing at 390×844 | `.omo/evidence/repair-browser-test-flows/final-surface/bhk-matrix-edits-BHK-rows-and-columns-at-390px-chromium/bhk-matrix-390.png` |
| FS-A6 | log | Fresh routing duplicate-project Playwright output; one test passed | `.omo/evidence/repair-browser-test-flows/routing-final.log` |
| FS-A7 | exit ledger | Routing command exit code `0` | `.omo/evidence/repair-browser-test-flows/routing-final.exit` |
| FS-A8 | source receipt | Tested SHA, base SHA, exact three-file test diff, and unchanged production build receipt | `.omo/evidence/repair-browser-test-flows/integration-start.txt` |
| FS-A9 | cleanup log | Preview port and process cleanup receipt from the integrated run | `.omo/evidence/repair-browser-test-flows/integration-cleanup.txt` |
| FS-A10 | source/config probe | Current SHA, zero production-path diff, allowed source paths, retries, and screenshot/process checks recorded during final audit | `.omo/evidence/repair-browser-test-flows/final-runtime-checks.txt` |
| FS-A11 | cleanup receipt | Final port 4184 free, no owned vite/playwright processes, three non-empty final screenshots | `.omo/evidence/repair-browser-test-flows/final-port-receipt.txt` |

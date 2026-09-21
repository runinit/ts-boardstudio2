# manualQa — repair-browser-test-flows baseline

## surfaceEvidence

| scenario id | criterion reference | surface | exact invocation | verdict | artifactRefs |
|---|---|---|---|---|---|
| BASE-NEW-CHAR | Plan Todo 1 baseline characterization | Chromium browser UI, fresh production preview, `/boardstudio/new` | `PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test ../.omo/evidence/repair-browser-test-flows/characterization.spec.ts --config=../.omo/evidence/repair-browser-test-flows/characterization.config.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/characterization-pass --trace=on --reporter=list` | PASS | A08, A09, A10 |
| BASE-BHK-CHAR | Plan Todo 2 baseline characterization | Chromium browser UI, fresh production preview, `/boardstudio/import` BHK Row 2 inspector | Same characterization invocation as BASE-NEW-CHAR; action sequence loads BHK, selects Rows then `matrix_c4_r4`, clicks the exact `Row keys` summary, asserts `Add key in column 7` | PASS | A08, A11, A12 |
| RED-NATIVE | Plan Todo 1 QA failure baseline | Chromium browser UI, fresh production preview, native `/new` flow | `PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/red --trace=retain-on-failure --reporter=list` | FAIL (expected RED) | A04, A05 |
| RED-BHK-1440 | Plan Todo 2 QA failure baseline | Chromium browser UI, 1440×900 BHK flow | Same plan RED invocation; target `edits BHK rows and columns at 1440px` | FAIL (expected RED) | A04, A06 |
| RED-BHK-390 | Plan Todo 2 QA failure baseline | Chromium browser UI, 390×844 BHK flow | Same plan RED invocation; target `edits BHK rows and columns at 390px` | FAIL (expected RED) | A04, A07 |

## adversarialCases

| scenario id | criterion reference | adversarial class | expected behavior | verdict | artifactRefs |
|---|---|---|---|---|---|
| ADV-STALE | Plan verification strategy | stale_state freshbuild | Browser evidence must come from a fresh build of the tested SHA, with no stale preview bundle accepted. | PASS | A03, A08, A13 |
| ADV-DIRTY | Repository safeguards | dirty_worktree isolation | Only the isolated worktree is installed/built/run; tracked product and allowed test paths remain unchanged. | PASS | A13 |
| ADV-LONG | Plan verification strategy | longcommands monitor | Install, build, RED, and characterization commands complete with recorded exit codes and tested SHA. | PASS | A01, A02, A03, A04, A08 |
| ADV-FRESH | Plan verification strategy | flaky tests freshcontexts | Playwright runs serially with worker-owned fresh browser contexts and assertions against live DOM/source state. | PASS | A04, A08, A10, A11 |
| ADV-SUCCESS | Plan verification strategy | misleading_success explicit_assertions+exitcodes | A zero exit must include semantic assertions and non-empty browser artifacts; the expected RED must retain non-zero exit and failure traces. | PASS | A04, A05, A08, A09, A11 |
| ADV-CLEANUP | Plan verification strategy | interruptions cleanup finally | After each browser command, owned preview/browser processes and selected ports are released; temporary probes are removed. | PASS | A13 |

## artifactRefs

| id | kind | description | path |
|---|---|---|---|
| A01 | log | Frozen dependency install output, exit 0 | `.omo/evidence/repair-browser-test-flows/install.log` |
| A02 | ledger | Chromium installation exit 0 (installer emitted no stdout/stderr) | `.omo/evidence/repair-browser-test-flows/chromium-install.exit` |
| A03 | log+ledger | Fresh 3072 MB build output and tested SHA/exit | `.omo/evidence/repair-browser-test-flows/build.log` and `.omo/evidence/repair-browser-test-flows/build.exit` |
| A04 | log+ledger | Exact plan RED output, exit 1, three failures | `.omo/evidence/repair-browser-test-flows/red.log` and `.omo/evidence/repair-browser-test-flows/red.exit` |
| A05 | trace | Native stale `New native design` timeout | `.omo/evidence/repair-browser-test-flows/red/app-creates-a-matrix-draft-and-previews-its-PCB-chromium/trace.zip` |
| A06 | trace | BHK 1440px collapsed Row keys / missing Add key failure | `.omo/evidence/repair-browser-test-flows/red/bhk-matrix-edits-BHK-rows-and-columns-at-1440px-chromium/trace.zip` |
| A07 | trace | BHK 390px collapsed Row keys / missing Add key failure | `.omo/evidence/repair-browser-test-flows/red/bhk-matrix-edits-BHK-rows-and-columns-at-390px-chromium/trace.zip` |
| A08 | log+ledger | Passing browser characterization, exit 0, SHA, port | `.omo/evidence/repair-browser-test-flows/characterization-pass.log` and `.omo/evidence/repair-browser-test-flows/characterization-pass.exit` |
| A09 | screenshot | `/new` root redirect and 20-key rendered matrix | `.omo/evidence/repair-browser-test-flows/characterization-pass/characterization-character-cb384-trix-and-BHK-row-disclosure/new-redirect-default-20-keys.png` |
| A10 | trace | Passing characterization browser trace | `.omo/evidence/repair-browser-test-flows/characterization-pass/characterization-character-cb384-trix-and-BHK-row-disclosure/trace.zip` |
| A11 | screenshot | BHK Row keys after real summary click with Add key visible | `.omo/evidence/repair-browser-test-flows/characterization-pass/characterization-character-cb384-trix-and-BHK-row-disclosure/bhk-row-keys-open-after-summary-click.png` |
| A12 | source assertion | Characterization log records persisted YAML/schema/5×4/20-object checks | `.omo/evidence/repair-browser-test-flows/characterization-pass.log` |
| A13 | cleanup receipt | Ports/processes/temp probes/tracked source diff verification | `.omo/evidence/repair-browser-test-flows/cleanup-receipt.log` |

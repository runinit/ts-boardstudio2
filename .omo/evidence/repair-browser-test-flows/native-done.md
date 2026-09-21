# Native repair DoneClaim

Status: PASS for task 1 implementation and focused browser verification. No commit made. Broader consumer, full-suite and precommit gates remain root-owned.

Worktree: /home/chris/projects/ts-boardstudio2-browser-test-flows
Tested base SHA: 6a130dcf655dee60414e1f43fe76134d84ea20e3
Owned changes: app/e2e/utils/studio.ts and app/e2e/app.spec.ts only.
Frozen diff: native-source.diff; exact file and built-index hashes: native-source-receipt.log.

## Invocation and binary observables

Environment: PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never

Invocation: `pnpm --dir app exec playwright test e2e/app.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/native-green --trace=retain-on-failure --reporter=list`

Actual exit: 0 in native-green.exit; native-green.log records 1 passed (6.3s). Fresh Playwright context, retries 0. Every assertion ran through the actual built app.

| Criterion/scenario | Binary observable | Captured artifact |
| --- | --- | --- |
| /new creates native draft; readiness performs no further creation | root URL, visible Board Studio, exactly 20 matching buttons; helper diff contains only assertions | native-green.log; native-source.diff |
| Default saved design | polled YAML matches ergogen/v1, fingers columns arrangement c1–c5/r1–r4; exactly 20 matching layout map entries | native-green.log; native-source.diff |
| Interactive layout and source retained | interactive layout visible, 20 rendered keys, Code opens and source contains schema | native-green.log; native-source.diff |
| Live PCB preview | KiCad canvas visible; unavailable text absent; source hidden | native-green.log; native-green/app-creates-a-matrix-draft-and-previews-its-PCB-chromium/native-pcb.png |
| Scoped static check | `pnpm --dir app exec eslint e2e/utils/studio.ts e2e/app.spec.ts` exit 0 | native-lint.exit; native-source-receipt.log (empty lint log means no diagnostics) |
| Teardown | runner returned exit 0; no port 4184 listener | native-cleanup.log |

Screenshot viewed directly: KiCad PCB tab active, real canvas with PCB geometry and status of 20 keys. Screenshot is 48100 bytes. Capture is evidence of rendering, not a claim about viewport framing quality.

## Baseline and adversarial checks

Read actual red.log and characterization-pass.log; RED contains native missing New native design and both BHK hidden-button failures. Fresh build completed before RED, current app/dist/index.html timestamp 2026-09-20 16:42:38 -0400. No production changes or rebuild since; tested index hash captured. Browser launch served the isolated worktree, not original dirty checkout. No new navigation/create operation in helper, seeded fixture, retry, timeout increase, force action, sleep, or skip. Native runner actual status captured separately from output. Current browser is a fresh context with no persistent storage reuse. No external inputs involved.

Self-review: helper file owns studio interactions (96 nonblank/noncomment lines); native spec owns native PCB acceptance (55 lines). YAML node-map narrowing uses isMap; persisted document goes directly to test matchers. No new casts, non-null assertions, variants, logging, one-off helper, or parameter expansion. Existing PCB assertions preserved verbatim; stale matrix creation actions replaced with stronger default-source assertions.

LSP hook limitation: tool reports sibling-worktree paths outside request cwd, so LSP was not available; this is not a clean-LSP claim. Root precommit/compiler validation remains required. Scoped ESLint passed. No active currentAttemptDir was returned by omo status; completed unrelated loop state does not own this task, so evidence lives in the task evidence directory.

Cleanup receipt pgrep includes its own inspection shell only; ss confirms port release. Parent notified browser ownership released before BHK run. No user process stopped.

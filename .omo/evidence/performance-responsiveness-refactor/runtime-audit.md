# Final runtime audit

Audited exact SHA: `bfaafb4b1aca4fe849d1effdef0872dc6b91672d`.

**Verdict: APPROVE runtime attribution and evidence integrity, with the known browser failure retained.** This is not an all-browser-green or performance-improvement verdict.

The final SHA removes the experimental Todo3 batching change and parse-budget tightening. Its only diff from baseline `64bfc2e84dc871b191d237fbd3d759f67fc05a76` is the benchmark-only configurable timeout in studio-performance.spec.ts. Directly hashed final studioSource.ts matches the captured Todo3-OFF source exactly: `30f533f8fccb16c17354b3011c7cd89a4d86abcfc326481094a34400ee5099bf`. Receipt: runtime-audit-receipt.log. Historical reports describing a retained production batching candidate must not be applied to this final SHA.

## Hypotheses and evidence

1. **Arrangement batching caused delayed-outline failure:** rejected. Fresh candidate and Todo3-OFF builds both failed the same browser scenario. Both passive worker recordings report `designs.boundaries.main_edge: Expected one connected region; found 2`. The OFF source matches final production bytes.
2. **Benchmark timeout parameter caused the failure:** rejected by isolated module execution. The scenario runs studio-continuous.spec.ts; it does not import studio-performance.spec.ts. PERF_TIMEOUT_MS is read only inside the separate benchmark test. No timeout/retry adjustment was applied to the delayed-outline test.
3. **Baseline outline/worker behavior caused the failure:** confirmed more narrowly as disconnected geometry validation. Captured source requires `connected: single` with no bridges, while the engine finds two regions. The UI reports `Layout analysis failed · 39 keys`, and the final outline assertion fails. This does not establish a worker race or distinguish a stale fixture expectation from a desired automatic-bridging enhancement.

## Direct runtime proof

- Existing scenario, fresh candidate and restored candidate: task-6-debug/candidate-run.exit and restored-run.exit are **1**, with matching retained trace/error-context and logs.
- Same scenario with passive recording, fresh candidate and fresh Todo3-OFF builds: candidate-diagnostic.exit and base-diagnostic.exit are **1**. Each run's `diagnostic-keeps-drags-nud-6fdd5-ugh-delayed-outline-updates/worker-diagnostics.json` contains the identical connected-region error. Final-source.yaml and screenshots are retained alongside.
- Deterministic captured-source replay: `timeout 120 node .omo/evidence/performance-responsiveness-refactor/task-6-debug/geometry-toggle.cjs` exits **0** only after asserting single-region rejection, successful boundary generation when allowing multiple regions, and rejection again with original single-region source. Artifacts: geometry-toggle.log/.exit. This diagnostic toggle is not a product fix.
- Exact browser/build invocations, three successful fresh-build receipts, source restoration and resources are documented in task-6-debug.md and task-6-debug/cleanup.log. No raw failure has been relabeled a pass.

The final SHA itself was not rerun by this audit. Attribution is tied to the exact matching final production source through the already executed OFF build, while the only final test edit is independent of this failing scenario. No final-SHA browser pass or speedup is inferred.

## Cleanup

This audit made no product/test edits, commits, builds or browser runs. Current tracked worktree diff is empty and ports 4184/4185 are free, as captured in runtime-audit-receipt.log. Earlier debug toggles were restored before handoff; subsequent removal of the unsuccessful optimization is reflected in the final SHA. Evidence and other review reports remain intentionally untracked.

# Delayed-outline debug journal

Scope: reproduce existing delayed-outline case; isolate current Todo3 production hunk via candidate/base rebuilds. No unrelated cleanup. References read this session: debugging SKILL, Node runtime, Playwright tool, setup, investigate, flaky triage, fix, QA and cleanup.

H1: batching arrangement fields changes source or worker outcomes. Distinguishing evidence: same fresh-context scenario changes outcome when only studioSource production diff is toggled and rebuilt.
H2: PERF_TIMEOUT_MS change alters delayed-outline scenario. Distinguishing evidence: module import graph/current command; scenario does not import studio-performance.spec.ts and no PERF_TIMEOUT_MS is set.
H3: baseline stale outline/worker or obsolete test selector causes failure independent of current diff. Distinguishing evidence: baseline rebuilt scenario fails identically; retained packet/DOM trace identifies missing outline or other assertion state.

Planned artifacts: source snapshots/diff before toggle; fresh candidate and baseline build logs/exits/hashes; isolated Playwright logs/exits/traces; optional task-local instrumentation only if needed. Source toggle confined to studioSource.ts and always restored from captured candidate bytes. Test edits only for confirmed task regression; no speculative change. Preview port4184 initially free; all servers test-owned. Existing task state remains untouched.

## Round 1 findings

- Fresh candidate exact isolated scenario failed with missing outline and UI `Layout analysis failed · 39 keys`.
- Passive worker-message capture in an evidence-local copy of the unchanged scenario reported `designs.boundaries.main_edge: Expected one connected region; found 2`.
- Todo3 OFF, fresh baseline Vite build, same diagnostic scenario: same boundary error and same missing-outline failure. H1 refuted.
- H2 refuted by isolation: exact studio-continuous file / diagnostic.testMatch loads no studio-performance module; PERF_TIMEOUT_MS is only read inside that separate benchmark test body. No timeout increase or retry was applied here.
- H3 narrowed: this is a baseline geometry validation error, not an established worker timing race. Captured source requires one connected boundary, has bridges {}, and produces two components.
- Deterministic replay geometry-toggle.cjs: captured source single fails with diagnostic code disconnected; changing only connected to multiple generates boundary; original single fails again. Exit0 means all three expected outcomes matched. No production fix or weakened test assertion introduced.
- Candidate studioSource bytes restored exactly from captured snapshot, then rebuilt successfully. Final exact focused browser rerun follows before cleanup.

## Artifact retention

Evidence-local diagnostic.spec.ts/config are retained reproduction harnesses, not production instrumentation. Worker diagnostics, captured final sources, traces, screenshots, build logs and the geometry replay remain task evidence. No instrumentation was added to application or standard e2e files. Temporary product toggle restored; final diff compared byte-for-byte with start.diff.

# Debug Journal — CAD performance
## Environment
HEAD 0ce7f8e; initially clean. Shell Node22; commands use PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH. pnpm/Vitest/Playwright already installed. No QA process started.
References read: Node runtime, Playwright, setup, investigate, fix.
## Hypotheses
1. Queue stale grace handle prevents cancellation after reuse; distinguish latest request never starting after grace, fix reset handle.
2. Release repeats source parsing/layout work; distinguish CPU sampled stacks around pointerup, fix dominant repeated work.
3. Outline incremental path combinations dominate; distinguish expansion call stacks and matched geometry/runtime, fix combination input work.
## Artifacts to revert
- .debug-journal.md: remove after final evidence archive.
- /tmp/ulw-20260920-133831.PoGBFl.md: durable notepad retained per ultrawork.
- .omo/evidence/performance-20260920/: durable tracked evidence requested by user, retain.
## Findings
- .omo/evidence/performance-20260920/outline-probe.cjs: durable probe testing original versus inherited farPoint options with byte parity; retain.
- Temporary baseline engine directory to be created with mktemp and recorded below; remove after matched benchmark.

- Baseline engine path: /tmp/boardstudio-perf-baseline.nxCdZS; remove after benchmark.
- Baseline app/dist copied under same baseline-path.txt temp root for matched browser comparison; remove after QA.

## Offset regression investigation (offset_regression agent)
- Hypothesis 1: persistent ray changes negative contraction topology, which has no extent validation. Distinguish by limiting persistent ray to positive offsets.
- Hypothesis 2: positive direct expansion accepts extra closed contours because extent validity cannot detect topology changes. Distinguish by retaining negative baseline semantics and observing cavity.
- Hypothesis 3: runtime library/options mutation differs from source expectation. Distinguish loaded require path plus option prototype tracing.
- Planned artifacts: .omo/evidence/performance-20260920/offset-regression*.log and offset-regression.md retained as evidence; temporary instrumentation via node harness only, no dependency edits.
- References read: debugging node runtime and methodology 00-setup,02-investigate,06-fix,08-qa,09-cleanup.

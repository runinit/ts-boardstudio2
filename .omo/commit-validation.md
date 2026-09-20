# Debug Journal — commit validation memory

Runtime Node24.14.0; pnpm workspace build invokes Vite5.4.21. Goal: commit existing changes after validation, no product/build configuration edits.

Hypotheses: default V8 heap too small (confirmed explicit2GB heap exhaustion); host memory pressure (supported exit137 and only3.7GB available/no swap); source compilation failure (no syntax/type diagnostic, precommit/typecheck passed).

Validation logs: /tmp/boardstudio-commit-build.log, /tmp/boardstudio-commit-build-retry.log, /tmp/boardstudio-commit-build-bounded.log. Environment overrides are command-local; no debugger or source instrumentation. Bounded retry uses3GB heap. Journal is temporary and removed before commit. Existing staged changes preserved.

Outcome: production build passes with NODE_OPTIONS=--max-old-space-size=3072. Command-local override only; no product edits. Full browser tests running with2workers. Precommit918app tests, engine335tests, release20tests passed.

Commits: e0d0da7 guides; 2fb82f9 engine geometry and generated bundle; fe0a17b batched layout edits and tests.
Browser rerun:49passed,3failed matching documented baseline navigation/closed-section mismatches in app.spec.ts and bhk-matrix.spec.ts (both widths). Stopped broad run:2interrupted,139notrun. Prior classification: .omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/after/preexisting-failures/REPORT.md. No passing full-browser-suite claim.
Cleanup: SIGINT to owned Playwright runner2013563; runner and preview PIDs2013581/2013582/2013597 absent. Command-local environment only, temporary debug journal removed. Tracked working tree clean; .omo remains untracked. No push.

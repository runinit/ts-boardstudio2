# Integration runtime journal

Scope: test verification only; no product or test edits. Port 4184 free before start. Node 24.14.0, pnpm 11.26.0. Playwright owns preview server and fresh test contexts; retries=0.

Hypotheses for potential suite failures:
1. Changed helper rejects a caller still on Import. Distinguish by actual URL and trace action at helper versus caller source.
2. Existing stale independent test actions fail against unchanged production. Distinguish by unchanged scenario source and missing action trace; baseline probe if uncertain.
3. Build/environment or concurrent resource issue. Distinguish by captured dist hash, zero production diff, owned/free port, per-test fresh contexts and exact runtime errors.

Artifacts planned: consumers.log/exit and consumers traces; full.log/exit and full traces; precommit.log/exit; integration-start.txt with SHA/diff/dist hash; classification and completion receipts. Retain these as requested task evidence. No inspector/source instrumentation. All shell environments are process-local. All Playwright servers must terminate before next heavy check.

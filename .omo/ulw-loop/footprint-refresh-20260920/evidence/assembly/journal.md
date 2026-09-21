# Assembly electrical fixes
Skills: programming TypeScript; debugging Node and fix methodology.
Hypotheses: (1) raw source properties miss native implicit nets; (2) inherited bindings are absent from assembly preservation; (3) recreation independently generates a diode junction; (4) stale viewer output could misidentify missing nets, distinguished with source-engine pad inventory.
Artifacts: retained regression tests, pin.txt, red.txt, green.txt, native proof files; no temporary product instrumentation.

## Verification
- Initial 7 regression tests failed for the measured missing nets, CUSTOM junction, inherited binding and absent diagnostics (`red.txt`).
- Added boundary RED/GREEN cases for incomplete parts, custom templates/free keys, inherited controller reservation, inherited partial placement, non-key declared matrix nets, raw YAML readiness, and raw repair of saved stale matrix findings.
- `green.txt`: 85 tests across 9 assembly/component/source suites passed before readiness extension.
- `green-final.txt`: 78 tests across final assembly/helper/BoardStudio suites passed; includes 30 BoardStudio UI tests, raw source conflict/repair and stale generation readiness.
- `native.cjs` / `native.json`: Node v24.14.0 source-engine generation, five cases passed. Actual KiCad pad net membership proves setup-less MCU allocation, CUSTOM and key-context template diode junctions, inherited column preservation/allocation, mirrored right-board MCU and LED nets. YAML and KiCad PCB files retained beside report.
- `typecheck.txt`: global app tsc check (see exit receipt in REPORT).
- `lint.txt`: scoped ESLint check (see exit receipt in REPORT).
- New `app/e2e/footprint-wiring.spec.ts` enumerates successfully. Root integration QA runs it against final built app and retains screenshot artifacts; not yet executed by this worker.

## Artifact cleanup
No debugger statements, servers, temporary product instrumentation or package installations. Retained files are implementation/tests and explicitly requested evidence. No commits by worker.

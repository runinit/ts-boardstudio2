# Assembly electrical refresh

Implemented effective native matrix-net allocation, GPIO-only reservations, inherited controller/binding preservation, custom diode junction restoration (including key-context templates), and effective switch/diode-versus-property diagnostics. Incomplete native layouts stay editable with an explicit unresolved-wiring finding; unexpected errors propagate.

`assemblyElectrical.ts` consumes native resolved layout and native template expansion. `mirrored:false` matches native PCB compilation, which resolves geometric mirroring before preparing footprint metadata. Authored bindings preserve their original templates and references when materialized for editing.

BoardStudio audits only current generated layout, memoized by layout identity and stale state. Raw source conflicts therefore block PCB/outline download; repaired raw source replaces stale generated matrix findings. Source text is unchanged by this audit. ZIP readiness shares the exported `resolvedMatrixFindings` through the export worker's integration.

## Files
- app/src/utils/assemblyNets.ts
- app/src/utils/applyAssembly.ts
- app/src/utils/assemblyElectrical.ts
- app/src/utils/assemblyNets.test.ts
- app/src/utils/assemblyElectrical.test.ts
- app/src/molecules/BoardStudio.tsx
- app/src/molecules/BoardStudio.test.tsx
- app/e2e/footprint-wiring.spec.ts

## Validation
- Pin and failing-first evidence: pin.txt, red*.txt.
- Final focused assembly + BoardStudio: 78 passing tests (green-final.txt).
- Expanded earlier source/component call-site coverage: 85 passing tests across nine files (green.txt).
- Native pad-to-net proof: five passing source-engine cases under Node 24.14.0 (native.json, native.txt, native.cjs).
- Global TypeScript and scoped ESLint: exit 0, no diagnostics (typecheck.txt, lint.txt).
- E2E spec discovery: one test enumerated successfully. Root owns built-app execution and screenshot collection.

## Limits
These checks establish logical net membership and readiness behavior, not copper routing, physical fit, manufacturing tolerances or desktop KiCad DRC. Diagnostic scope follows known switch from/to, owned or inline diode topology, and declared matrix properties; arbitrary custom-footprint electrical semantics remain provider-specific.

## Full-suite loose-key regression correction
The full precommit run exposed a real source-contract regression: wizard-managed loose keys historically author `extra_c1`; the native `extra_column` default applies only when explicit properties are absent. `keyNets` now preserves the wizard's `_cN` convention whenever saved setup metadata exists, while setup-less keys retain native implicit identities. The original batch test is unchanged.

- `loose-key-pin.txt` and `loose-key-red.txt`: exact failing batch assertion captured before correction.
- `loose-key-green.txt`: all ten assembly/batch suites pass, 69 tests, including the unchanged `extra_c1` assertion and opposite setup-less `free_column` regression.
- Scoped ESLint and diff check pass.
- `loose-key-native.cjs`, `loose-key-native.json`, `loose-key-native.txt`: source-engine PCB proof under Node 24.14.0 shows the wizard-authored property and emitted switch/MCU pads all use `extra_c1`; native implicit free-key output uses `free_column`. The proof substitutes a rectangular board profile to isolate electrical output from unrelated automatic-contour joins after adding a loose key.

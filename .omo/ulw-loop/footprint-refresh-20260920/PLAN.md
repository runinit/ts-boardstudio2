# Footprint refresh execution

HEAVY delivery. Independent workers own disjoint files in the shared checkout; no team/worktrees are necessary. Root owns integration, manifests and commits via a later integration worker. Current GitHub HEADs equal both existing pins; local fixes preserve their provenance.

- [x] Reconcile latest upstream, all research findings and preview architecture.
- [x] Capture failing-first regressions and implement six disjoint units below.
- [x] Reconcile provenance and wire new checks after generator workers finish.
- [x] Extend inspected/rendered custom-pad and drill geometry, preserving real reversible jumper shapes.
- [x] Repair numeric pad viewer parsing through its source patch after engine boundary work.
- [x] Run required precommit, engine/build/release/integration checks and commit verified units; document unchanged baseline E2E failures.
- [x] Drive browser parameter, geometry/model, save/reopen and error scenarios; inspect 54 fresh screenshots at 64bfc2e/treebfa1fde and close owned browser resources.
- [x] Freeze and complete independent reviews: code APPROVE/WATCH, manual QA PASS, Visual A/B PASS, final gate APPROVE with no blockers at full64bfc2e/treebfa1fde; owned resources cleaned.

| Unit | Ownership | Depends on | Proof |
|---|---|---|---|
| Switches | switch_choc_v1_v2.js, switch_mx.js, dedicated scripts | upstream audit | native distinct-net side/reversible/rotation matrix; width and stabilizer independent options |
| Controllers | three MCU sources, dedicated scripts | upstream audit | all trace endpoints/net assignments, unrelated nets allocated first, rotations; explicit unsupported inversion rejection |
| Peripherals | diode, pads, SSD1306, Gateron, dedicated scripts | audit | pad count/net/width and incompatible-option checks; drilled geometry evidence |
| Engine boundary | pcbs.js, footprint-tools.js, dedicated engine tests | audit | keepout F/B/F&B, finite expressions, unresolved templates, blank electrical pads |
| Assembly wiring | assemblyNets/applyAssembly/keyAssembly + tests | audit | setup-less matrix MCU nets, custom junction toggle, inherited bindings, allocation collisions and diagnostics |
| Library GUI | footprint TS types/engine/service/library UI + tests | preview map | parameter types, saved defaults and override precedence, stale results/model sync, real generated geometry |

Critical path: generator fixes → source manifest integration → staged engine build → real library browser QA → final review. UI and assembly work run alongside generator fixes. KiCanvas source-patch work uses freed lane after first wave.

Exact initial commands: Node 24 via PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH; node footprints/scripts/refreshSwitches.test.mjs; node footprints/scripts/refreshControllers.test.mjs; node footprints/scripts/refreshPeripherals.test.mjs; npm_config_what=footprint_refresh pnpm --dir engine test; pnpm --dir app exec vitest run src/utils/assemblyNets.test.ts src/utils/applyAssembly.test.ts src/utils/keyAssembly.test.ts; pnpm --dir app exec vitest run src/utils/footprintEngine.test.ts src/molecules/FootprintLibrary.test.tsx. Workers may add focused test files and record exact commands.

Browser criteria: open Part library, select ceoloide/switch_choc_v1_v2, change generated side and reversible, observe pad layers/counts; change diode pad flags and show explicit error with no stale successful preview; change model-affecting parameter and observe updated model binding; save configured footprint, browse/reopen and export with same defaults; placement override still wins. Controls must be accessible at desktop and narrow viewport. Concrete selectors are fixed by named accessible controls and captured in the dedicated e2e spec before UI production edits.

Stop when confirmed research defects are reconciled with tests, parameter-driven emitted/displayed footprints match, required checks and browser evidence pass, final review approves, and resources are cleaned. Manufacturing-only uncertainties retain explicit limitations and must not be described as proven defects or fabrication approval.

# Finding disposition — footprint refresh, September 20, 2026

Scope: reconcile the [PCB creation investigation](../../ulw-research/20260920-114822/SYNTHESIS.md)
and [registered footprint audit](../../ulw-research/20260920-122302/AUDIT.md).
“Verified” below means the cited software test/native engine evidence, not
KiCad desktop acceptance, manufacturing qualification or physical routing.
Product HEAD is `64bfc2e`. Latest precommit passes 148 files/1,038 tests. The fresh
54-capture visual executor, build and focused integration gates pass at `64bfc2e`
/tree `bfa1fde848b9d8501a5fd19285133afc05d28e20`. Code review approves with
WATCH; independent manual QA and Visual A/B pass. The final gate approves with
no blockers: the scoped software refresh is implemented, committed and verified. The full E2E suite is not passing. See
[delivery status](evidence/final/DELIVERY.md) for exact validation and commit scope.

## Generator defects and source contracts

| Finding | Disposition and implementation | Verification / limitation |
| --- | --- | --- |
| Choc B single-side unplated same-side contacts collapse | Fixed `footprints/switch_choc_v1_v2.js`: full inner contact selects TO when same-side | Verified `refreshSwitches.test.mjs`; matches open upstream PR82, not a mainline update |
| MX reversible track/via ownership conflicts | Fixed `footprints/switch_mx.js`: inner chain/via TO, outer chain/via FROM | Verified distinct-net endpoints/native serialization; no claim of a demonstrated physical short |
| MX stabilizer flag ignored | Fixed independent `include_stabilizer_nets` gate; plating still required | Verified independent flag combinations |
| MX outer width controls unused | Fixed literal front/back widths with inward edge fixed at 5.81 mm | Verified widths/endpoint coverage; default 2.55 → 2.6 mm moves outer edge 0.05 mm; whole-board edge clearance remains user-specific |
| Infused nice!nano hardcoded IDs 1/13/23/24 | Fixed `vendor/infused-kim/nice_nano_pretty.js` with per-row signal/local IDs | Verified `refreshControllers.test.mjs`, unrelated allocation offsets, native names |
| Ceoloide nice!nano/SuperMini 192 netless segments | Fixed both MCU generators to attach intended signal/local IDs with existing pin inversion | Verified chain ownership, full/reduced, rectangular/chevron, mounting variants |
| Infused pin-name globals and track precision | Local declarations follow open PR4; six-decimal coordinates preserve rotated geometry | Verified no global pin-name leakage and arbitrary-angle topology; PR3 custom-pad rotations preserved |
| MCU `invert_jumpers_position` unused | Explicitly reject true in both Ceoloide generators; retain false default/declaration | Verified actionable rejection; inverted jumper topology remains unsupported |
| Drilled-SMD diode emits zero pads / silently ignores option | Reject `include_thru_hole_smd_pads && !reversible` in `diode_tht_sod123.js` | Verified `refreshPeripherals.test.mjs`; reversible drilled-SMD and ordinary alternatives retain nets |
| Generic pads 5/6 alias by default | Fixed Infused `pads.js` net_6 to PAD_6 | Verified six distinct defaults; explicit sharing remains allowed |
| SSD1306 GND width applied to VCC paths | Fixed width selection using each face's GND destination jumper | Verified unequal widths and inversion variants |
| Gateron reversible hotswap overlapping 3 mm drills | Reject `hotswap && reversible` in `switch_gateron_ks27_ks33.js` | Verified guard; no unsupported merged-slot design invented |
| Gateron custom polygons fail arbitrary rotation | Add footprint rotation to all eight solder polygon templates | Verified distinct nets and transformed drill containment at arbitrary angle |
| Gateron transform / Infused Choc socket suppression patch reasons incomplete | Updated `manifest/patches.json` to describe both existing corrections and new changes | Verified original upstream URLs/hashes unchanged |
| Keepout F&B inferred as NaN, F/B rejected | Engine lane changes in `engine/src/pcbs.js`, `engine/test/unit/footprint_refresh.js` | Verified engine refresh tests; source footprint pin unchanged |

Generator evidence: [switches](evidence/switches/NOTES.md),
[controllers](evidence/controllers/REPORT.md), [peripherals](evidence/peripherals/journal.md).
Integrated [footprint test transcript](evidence/integration/footprint-tests.log) passes
new and existing suites. [Inventory review](evidence/integration/inventory-review.json)
records exactly nine corrected generator hashes, unchanged upstream pins/original
patch hashes, unchanged model assets and candidate mappings.

## Electrical assembly, import, preview and export findings

| Finding | Disposition / implementation | Verification status |
| --- | --- | --- |
| Setup-less native matrix implicit nets absent from MCU | Assembly lane adds effective electrical resolution in `app/src/utils/assemblyElectrical.ts` / `assemblyNets.ts` | Verified assembly regression suite and five source-engine pad-to-net cases |
| Manual switch net disagrees with MCU without diagnostic | Resolved authored endpoint nets drive allocation; generated conflicts block exports | Verified assembly/BoardStudio regressions and native cases |
| Renamed key properties leave authored switch/diode nets stale | Preserve authored endpoint wiring and surface incompatible identities | Verified conflict diagnostics; authored wiring stays intact |
| Inherited binding loses effective wiring during assembly preservation | `applyAssembly.ts` materializes resolved bindings while retaining authored templates/references | Verified assembly preservation regressions |
| Diode toggle recreates only one custom junction endpoint | Restores effective switch/diode junction, including key-context templates | Verified diode toggle regressions and native net membership |
| Non-GPIO parameter value masks missing MCU net | Allocation accounts only for declared electrical GPIO assignments | Verified non-GPIO collision regression |
| Unresolved net template becomes empty string | Engine lane rejects unresolved templates, retains explicit empty no-connect | Verified `engine/test/unit/footprint_refresh.js`; explicit-empty control passes |
| Blank-number plated copper excluded from import mapping | Engine lane classifies copper semantics and remaps original net groups | Verified native import/export and persisted A/B blank-group roundtrip using optional mappingKey |
| Imported stale numeric IDs | Retain backend rejection of inconsistent/unresolved IDs; importer repairs source relationships | Verified engine refresh/tools/kicad10 tests |
| Viewer unquoted numeric pad IDs become undefined | KiCanvas patch adds narrow numeric pad-number conversion; existing quoted strings stay exact | Pinned fixture/build and real Chromium native-board probe pass at current64bfc2e; unquoted lexical leading zeros remain tokenizer-limited |
| Footprint library uses synthetic preview nets | Intentional preview boundary: generated geometry/options are useful, preview labels do not certify project wiring | Verified parameter/geometry unit suites; project connectivity still needs project generation |
| Library parameter display/preview ignores actual variants | Typed settings regenerate source-selected models and inspected pad/drill/track geometry; defaults persist in entries, snapshots and exported modules with placement overrides winning | Verified defaults/undo/renderer suites and fresh-archive browser persistence; 54 fresh captures pass at exact HEAD64bfc2e/treebfa1fde; independent manual QA and final gate pass |
| Multi-board preview shows only first PCB | Existing preview limitation; exports can contain all boards | Not a missing-pad defect; no multi-board viewer redesign in this correction |
| Viewer has no ratsnest/airwire implementation | Existing viewer limitation; missing airwires do not establish missing nets | No routing or ratsnest implementation claimed |
| Template-placeholder viewer URL returns 404 | Research impact unproven | Reproduced in isolated final KiCanvas browser probe with no page errors; impact unproven, not promoted to an electrical defect |
| Bulk download bypasses normal generated-output blockers | All three ZIP entry points share readiness checks, omit blocked PCB/outline outputs, and write per-project error.txt while retaining safe artifacts | Verified 33 real-ZIP tests including raw wiring, stale findings and valid/config-only/mixed-project controls; no browser-click claim |
| General pad-terminal/connectivity diagnostic absent | Source guards and generated-layout matrix audits cover reproduced padless and switch/diode/property conflicts | Verified known matrix topology only. Universal arbitrary-provider terminal/connectivity validation remains an explicit limitation; no generic two-pad-per-net rule is imposed |
| Custom providers outside controller allocation list | Existing supported-provider contract | No arbitrary custom-MCU auto-allocation added |
| `pcbs.*.asset` accepted but apparently unused | Research excluded from primary diagnosis; normal UI import uses supported assembly asset path | Retained API observation; no unrelated public API removal |

Engine evidence: [journal](evidence/engine/journal.md), [initial green](evidence/engine/green.log),
[roundtrip green](evidence/engine/roundtrip-green.log): 76 initial related tests and 30 captured
refresh/import/KiCad10 tests pass; these are lane receipts, not a final aggregate count.

Additional lane evidence:

- [Assembly report](evidence/assembly/REPORT.md): 78 final focused tests, five native
  pad-to-net cases, and clean scoped lint/typecheck. E2E discovery is recorded;
  later [wiring browser proof](evidence/assembly/browser-wiring/REPORT.md) passes after exact Monaco-model editing.
- [Export report](evidence/export/REPORT.md): 33 real-ZIP tests check archived output
  from all three entry points; source-only fallback uses native electrical resolution.
- [Library report](evidence/library/README.md), [root verification](evidence/library/root-verification.log)
  and [face/undo follow-up](evidence/library/face-green.log): typed defaults, native
  default generation, model regeneration, persistence data, undo and stale replies pass.
- [Renderer report](evidence/renderer/NOTES.md): nine SVG/Three geometry tests and 26
  inspector/boundary tests pass, including native reversible MCU geometry at 37 degrees.
  Zones/keepouts show boundaries only; unsupported primitives and multi-footprint
  board-copper ownership produce warnings. No fill/clearance solver or exact analytic
  curve representation is claimed.
- [KiCanvas rebuild receipt](evidence/kicanvas/receipt.json): pinned numeric-pad fixture
  and rebuilt bundle pass with Node24/pnpm11; [current browser receipt](evidence/kicanvas/browser-current/receipt.json) confirms IDs/nets/lookup at 64bfc2e.
- [Browser baseline](evidence/browser/journal.md): old build only, retained for comparison.
  It is not a passing final visual review. The [new-build executor](evidence/browser-final/journal.md)
  subsequently passed [54 fresh captures](evidence/browser-final/FINAL.md) at exact
  HEAD64bfc2e/treebfa1fde. [Enumeration](evidence/browser-final/enumeration.md) and
  capture-validation.json identify current images; owned browser/preview resources closed.
- [Code/Visual A review](evidence/final/reviews/code-review.md): APPROVE, WATCH for
  baseline E2E limits, Visual A PASS. [Independent manual QA](evidence/final/reviews/manual-qa.md) passes
  Visual B and two fresh browser scenarios, and inspects all 54 states. The
  [final gate](evidence/final/reviews/gate-review.md) approves with no blockers at
  full commit64bfc2e84dc871b191d237fbd3d759f67fc05a76/treebfa1fde848b9d8501a5fd19285133afc05d28e20.

Additional runtime corrections: `388d1e0` prevents empty drill contour closePath
crashes; `64bfc2e` moves preview warnings clear of model drag handles. The
[fresh archive browser test](evidence/library/browser-feature-tests/fresh-archive-run.log)
passes after harness correction `d18a7d0`; wiring harness correction is `2579357`.
The [full E2E triage](evidence/final/e2e-triage.md) records three unchanged-baseline
failures, one interrupted case and 172 unrun cases; no full-suite pass is claimed.

Current-HEAD integration receipts: [build](evidence/final/build-notice.log) passes;
[engine](evidence/final/engine-final.log) passes 35 tests;
[electrical/defaults](evidence/final/electrical-final.log) passes 99 tests;
[footprint package](evidence/final/footprints-final.log) passes. The
[final browser run](evidence/final/e2e-final.log) passes all four imported-library,
model-drag, fresh-archive and raw-wiring scenarios in 2.1 minutes, resolving both
failures from the earlier 34/36 batch. The 32 earlier model tests remain scoped to
their prior pass at 388d1e0 and unchanged model paths; no full-suite pass is implied.

## Preserved behavior and physical/provenance limits

| Finding or concern | Disposition |
| --- | --- |
| Normal wizard single/mirrored switch/diode/MCU/LED membership works | Preserve baseline; BHK stays independent and unchanged |
| Analysis/export output agree; viewer operates on parsed copy | Preserve raw export; preview work must not rewrite PCB text |
| KiCad 10 named nets lack legacy numeric table | Valid format behavior, not a defect; retain format 20260206 named-net serialization |
| Six unnetted switch holes in baseline | Intentional mechanical holes, not missing electrical contacts |
| Ordinary single-side designs have no intercomponent tracks | Expected unrouted design; some reversible footprints include local copper only |
| Combined Choc / Infused MCU pad numbers reused across differing nets | Existing conventions preserved; schematic-update compatibility not certified |
| Different two-pin Molex default polarity between vendors | Preserve namespace-specific pin maps; explicit cable mapping required |
| TRRS symmetric mode merges signals | Intentional three-net topology, not a drop-in four-signal connector |
| Infused nice!view emits pads without local tracks | Manual local routing still required; model alignment does not add copper |
| MCU optional pins differ by package/reduced jumpers | Preserve existing package rules, including SuperMini reduced P107 omission; firmware mapping remains relevant |
| SK6812mini-e issue80 physical pin/view allegation | Unresolved manufacturer-view question; logical net mapping does not settle physical orientation |
| Gateron KS27 equivalence / exact socket geometry | Exact Y31 model target retained; KS27 equivalence, socket model and fabrication tolerance remain unverified |
| Reset/encoder model coverage incomplete | User-provided exact models still pending; no new default model assignments |
| Model transforms, empty disable paths, board thickness | Explicit overrides preserved; historical fit checks remain scoped to measured variants/thickness |
| Native KiCad load/save, DRC, selected solder-bridge assembly | Unavailable/unperformed in this run; native engine PCB fixtures are software evidence only |
| Source HEAD refresh | Both upstream HEADs equal existing pins; no blanket overwrite or imports; original hashes retained |
| Infused README/license inconsistency | Preserve CC BY-NC-SA notice and attribution; no blanket MIT relicensing or legal clearance |
| External master catalogue admission | Catalogue is research inventory only; no new footprints imported or physically qualified |
| No exact user PCB supplied | Reproductions establish failure classes; no claim to certify every existing project |

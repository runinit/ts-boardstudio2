# Footprint refresh delivery status

Product HEAD: `64bfc2e` (September 20, 2026). Software corrections are committed.
Build, focused integration and the fresh 54-capture browser executor pass at this
HEAD/tree `bfa1fde848b9d8501a5fd19285133afc05d28e20`. Code review approves with
WATCH for baseline E2E limits; independent Visual Passes A/B and manual QA pass.
The final gate approves with no blocking findings at the exact full commit/tree.
The scoped refresh is implemented, committed and verified; the full E2E suite
and physical manufacturing qualification remain outside that passing claim.

## Behavior delivered

- Correct switch, controller, diode, display and generic-pad electrical output;
  explicit rejection of unsupported MCU jumper inversion, single-sided drilled-SMD
  diodes and reversible Gateron hotswap. MX outer pad default width is now the
  declared 2.6 mm rather than 2.55 mm (outer edge moves 0.05 mm).
- Resolve matrix wiring consistently through inheritance and edits; preserve custom
  diode junctions; reject unresolved net templates; correctly remap blank electrical
  pads. Current wiring conflicts block PCB/outline downloads, including ZIP exports.
- Configurable library settings and persisted defaults regenerate actual pad, drill,
  local copper and source-selected model geometry. All 18 engine builtins are restored
  alongside the existing catalogue. Explicit placement values and model overrides win.
- Numeric KiCanvas pad IDs retain names/nets and lookup identity. Custom preview copper
  supports drilled holes; empty contours no longer crash Three. Preview warnings no
  longer cover model drag handles.

## Observed verification

| Evidence | Observed result / boundary |
| --- | --- |
| [Latest precommit](precommit-notice.log) | Pass: 148 app test files, 1,038 tests; required precommit checks completed |
| [Latest build log](build-notice.log) | Pass at `64bfc2e`; root completion receipt received |
| [Final footprint package](footprints-final.log) | Existing/new source integrity, models and generator regressions pass at current HEAD |
| [Final engine](engine-final.log) | 35 focused engine tests pass |
| [Final electrical/defaults](electrical-final.log) | 99 tests across four files pass |
| [Final refresh browser](e2e-final.log) | Four tests pass in 2.1 minutes: imported library, unchanged model-drag scenario, fresh-archive settings and raw wiring |
| [Manifest review](../integration/inventory-review.json) | 39 sources retained; exactly nine corrected source hashes; unchanged pins, original upstream hashes, 54 models and mappings |
| [Wiring browser](../assembly/browser-wiring/REPORT.md) | Pass: exact Monaco source edits block downloads on RAW_BREAK and re-enable after repair |
| [Fresh archive browser](../library/browser-feature-tests/fresh-archive-run.log) | Pass: settings/save/reload and freshly downloaded archive assertions; archived ZIP/screenshots retained alongside log |
| [Current KiCanvas browser](../kicanvas/browser-current/receipt.json) | Pass at `64bfc2e`: real native board, numeric/quoted/blank pad identities, nets and lookup; source text unchanged |
| [Current visual executor](../browser-final/FINAL.md) | Pass at `64bfc2e`/tree `bfa1fde`: 54 fresh originals, responsive 1280/768/375, variants, model views, disclosure controls and bare copper; browser/preview resources closed |
| [Code/Visual A review](reviews/code-review.md) | APPROVE, codeQualityStatus WATCH for baseline E2E limits, Visual A PASS at exact current commit/tree |
| [Independent manual QA](reviews/manual-qa.md) | PASS, Visual B PASS at exact current commit/tree; two fresh browser scenarios, four screenshots and fresh ZIP; all 54 visual states inspected |
| [Final gate](reviews/gate-review.md) | APPROVE, no blocking findings; exact full commit/tree, current capture hashes and KiCanvas bundle verified; full E2E WATCH retained |
| [Notice regression](../renderer/model-drag/notice-green.txt) | 11 focused tests pass for revised preview warnings/geometry behavior |
| [Relevant browser batch](e2e-refresh.log) | 34 passed, two failed initially. Both failures are resolved in current four-test browser rerun; 32 model tests retain their earlier pass at 388d1e0 with model paths unchanged. No fresh 36/36 aggregate run is claimed |
| [Full E2E triage](e2e-triage.md) | Initial 195-case run: 19 passed, three failed, one interrupted, 172 not run. Three failures have unchanged baseline test/UI causes; the full suite is not passing |

## Product commits

| Commit | Change |
| --- | --- |
| `41a59b2` | Preserve numeric pad identifiers in KiCanvas |
| `6d60566` | Preserve resolved matrix nets and block conflicting exports |
| `0b5beb8` | Correct footprint geometry and electrical net generation |
| `98398de` | Preview and save configurable footprint variants |
| `388d1e0` | Skip empty drill contours in footprint previews |
| `2579357` | Exercise raw wiring edits through the Monaco model |
| `d18a7d0` | Verify the freshly downloaded footprint archive |
| `64bfc2e` | Keep preview warnings clear of model drag handles |

## Limits retained

Both upstream HEADs equal the existing pins: ceoloide
`48935f54b456ff1503d78d6b17d9d146b54e8ade`, Infused-Kim
`bb80a207d8a6fa7b9245caad2c2d97e2adc2f612`.
[Upstream comparison](../../upstream-reference.md) verified all 39 originals.
No blanket source replacement, new catalogue imports, license changes, deployment
or publishing occurred. BHK product behavior remains independent.

Native engine PCB output and preview checks do not establish desktop KiCad
roundtrip, schematic-update compatibility, whole-board DRC, fabrication tolerance
or physical assembly. LED physical-view issue80 remains unresolved. Gateron KS27
and reversible hotswap manufacturing are not qualified. Infused nice!view still
needs manual routing; no autorouter or ratsnest was added. Zones display boundaries
only; unsupported preview primitives are reported. Arbitrary custom-provider
connectivity semantics, missing exact reset/encoder models and the baseline viewer
placeholder 404 remain explicit limits. See the complete
[finding disposition](../../finding-disposition.md).

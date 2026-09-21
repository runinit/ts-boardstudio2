# Independent manual QA and Visual Pass B: PASS

Commit: `64bfc2e84dc871b191d237fbd3d759f67fc05a76`
Tree: `bfa1fde848b9d8501a5fd19285133afc05d28e20`

Verified directly with git rev-parse. Product remained read-only. Confidence: HIGH for the scoped browser behavior and visual acceptance below. Blocking findings: none.

## Independent execution

Ran against the existing built app with Node 24.14.0, isolated port 3084:

```sh
PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH PLAYWRIGHT_PORT=3084 pnpm --dir app exec playwright test e2e/footprint-parameters.spec.ts e2e/footprint-wiring.spec.ts --workers=1 --reporter=list --output=../.omo/ulw-loop/footprint-refresh-20260920/evidence/final/reviews/qa-results
```

Observed exit 0: **2 passed (14.1s)**. Parameter scenario 7.9s; wiring scenario 3.8s. The real browser imported a generator, selected back copper/reversible/width 3, saved, downloaded a fresh ZIP, checked its manifest and usage YAML, reloaded persisted defaults and captured mobile controls. The wiring scenario edited the actual Monaco model to RAW_BREAK, verified blocked export before and after layout update, displayed the finding, repaired source, and verified enabled export. Read both specs to establish assertion scope. Independent screenshots and downloaded ZIP are retained under qa-results; all four screenshots were opened with view_image.

Playwright closed its browser and managed preview server. Subsequent `ss -ltnp 'sport = :3084'` showed no listener. No rebuild, product edits or foreign server termination occurred.

## Visual acceptance coverage

Read browser-final/FINAL.md, enumeration.md and every capture-validation.json entry. Independently recomputed SHA-256 for all 54 current originals: no mismatches (qa-results/capture-hash-check.json). Prior-build-388d1e0 and first-run were excluded.

Opened all five current contact sheets with view_image: switch_choc_v1_v2 (12 states), switch_mx (12), mcu_nice_nano (12), models (8), controls (9). Opened the remaining bare-copper original separately, completing all 54 enumerated views. Also opened full-size invalid number, invalid JSON, narrow invalid diode and expanded notice originals to inspect text and error/control details.

- Responsive: all 36 F/B × single/reversible × 1280/768/375 combinations inspected. Desktop sidebars become Catalog/Inspector controls on narrow surfaces; toolbars wrap and copper remains visible within viewport. Full-width mobile inspector keeps Save/Undo, side, reversible and numeric controls readable. Capture metadata body widths equal viewport widths; no horizontal document overflow recorded.
- Geometry: Choc and MX pad labels exchange sides in front/back views; reversible variants add the expected holes/local traces. nice!nano single rows become custom jumper rows with additional copper on reversal; back-side routing differs visibly. Gateron solder polygons contain real holes and are visible at all three widths. These are visual checks, not fabrication qualification.
- Invalid inputs: number and malformed JSON clear successful geometry and disable Save. JSON helper text is readable. Invalid diode views show zero pads and the explicit requires-reversible error, including at 375px; recovered diode shows two drilled pads and restored copper. The number field itself is scrolled outside its screenshot; its invalidity is supported by the executor assertions, not independently inferred from the image.
- Models: all six before/after parameter model views are fully composited; Choc/MX model placement changes and MCU reverse mounting are visible. Bare-copper 3D original visibly contains jumper shapes, tracks and open drill holes with the model filename empty. No blank-canvas or opaque drill-fill defect observed.
- Notices: native details/summary source in FootprintCanvas.tsx confirms functional disclosure. Current collapsed/expanded screenshots show readable preview limitations while leaving the model and handles visible. Unsupported gr_line is expressly disclosed.
- CJK: N/A; no CJK text appears in these surfaces. Latin labels, error text and control baselines show no missing glyphs or clipping that prevents these flows.

## Drag and export evidence trace

Opened all ten current e2e-final-results PNGs: four inset interaction states, desktop/narrow BHK CAD, parameter desktop/mobile, raw-wiring blocked/repaired. This supplements the independently executed two tests; the model-drag test was not independently rerun here.

Consumed every inset-visual-diff.json field: matching 280×201 dimensions, 56,280 total pixels, 1,291 differing pixels, ratio 0.0229, similarity 98, alpha intact. Seven hotspots at (70,75), (105,75), (35,75), (140,100), (0,75), (105,100), (140,75), each 35×25, have ratios .3303/.3166/.3063/.192/.1486/.1143/.0674. These cells intersect the disclosure label/model and drag-handle band; inspected before/hover/click/after images show transient handle/copper presentation and the final moved blue model covering the prior copper. The title/buttons, inset boundary and collapsed notice remain stable. This is expected interaction state change, not a reference-clone mismatch; no hotspot indicates displaced controls or notice obstruction.

Raw-wiring screenshots visibly distinguish disabled PCB exports plus RAW_BREAK finding from repaired enabled downloads. Parameter screenshots visibly preserve side B, checked reversible and width 3 after reload; desktop shows the widened pad and second pad. Existing BHK desktop/narrow shots retain the usable model alignment inset.

## Boundaries

PASS is scoped to these executed scenarios and all 54 fresh visual states. Root's four-test run remains separate corroboration. The full 195-case suite is **not green**: three documented baseline failures remain; no full-suite pass is claimed. No desktop KiCad roundtrip, whole-board DRC, manufacturing tolerance or physical assembly validation is claimed. DELIVERY.md's pending visual language is stale relative to browser-final/FINAL.md and this review; root should reconcile it in the final receipt.

# Layout redesign verification

September 12, 2026. Local enclosure-work engine and GUI; existing work preserved.

The checkout already contained empty-board setup, assembly compilation,
relationships and material exports. This pass completed expression/keycap setup,
mouse-picked distance, origin snapping, snap caching and parent-frame increments.
Regression fixes cover mixed-size row guides, mirrored splay, double mounting
height on mirrored objects, the grid coordinate left free by edge snapping, and
alignment followers pulling unconstrained targets. Directed alignment chains
retain their targets through reload. Managed distance cycles are rejected.

## Verification

- GUI precommit: typecheck, ESLint, Markdownlint, Knip and 749 unit tests passed.
- Engine: 287 passed, 18 failed. A disposable untouched checkout using the same
  dependencies produced 280 passes and the identical 18 DXF fixture failures.
  [Exact comparison](layout-redesign/engine-comparison.json).
- All 23 focused native guide, constraint and material tests passed. The full
  engine run used a 10-second timeout after one existing CNC test exceeded its
  default two seconds under concurrent load; that test passed separately in 494 ms.
- Production build passed. Existing bundle-size, WASM externalization and
  dependency warnings remain.
- Twenty-one Chromium scenarios passed across setup, layout, materials,
  settings, inspector resize and workbench continuity. Three final scenarios
  additionally cover staged expression undo, canvas distance picking and narrow
  snapping-menu bounds.
- Browser-loaded KiCad sample opened in PCB Editor and exported through
  `kicad-cli`: switch/diode pads, drills, nets and a closed PCB outline are visible.
  [KiCad capture](layout-redesign/kicad-sample.png).
- Independent ezdxf inspection confirmed 1:1 millimetres, five closed contours
  (one outside and four holes), and bounds -11 to 30.05 mm in both axes. The ZIP
  and individual DXF match; metadata bounds agree with the preview model.
  [DXF result](layout-redesign/dxf-verification.json).
- Selected engine archive: `ergogen-layout-b1d6bc749442.tgz`, SHA-256
  `b1d6bc7494426680ca7935102a730f1c6957062ed902f10d670190cf99b5105d`.
  All 76 packaged runtime sources match the sibling engine.

## Bounded Impeccable review

One desktop/narrow capture batch, one correction batch and one confirmation
batch. The 320 px snapping menu initially overlapped camera controls. It now
reserves that space and scrolls; a browser regression checks its bounds after
layout settles. No further visual correction was needed in the reviewed scope.

The graphite palette, Roboto type, rectangular fields and blue selection remain.
1440, 320 and 390 px contexts showed no horizontal overflow or page errors.
Expression labels, separate cap dimensions, assembly editing, material fit and
independent origin snapping remain reachable. The detector reported no findings
on the changed UI surfaces. This is a scoped review, not a whole-application audit.

[Desktop setup](layout-redesign/1440-setup.png),
[narrow keycaps](layout-redesign/320-keycaps.png),
[narrow snapping](layout-redesign/320-snapping.png),
[assembly](layout-redesign/390-assembly.png).
Captures are unedited browser images from the production build in a hidden
Agent Workspace desktop. KiCad was opened on that same isolated display.

The sample is unrouted. Undeclared keycap/component heights remain explicitly
unresolved. These checks do not certify physical compression, fabrication or
routing. No installation or deployment was performed.

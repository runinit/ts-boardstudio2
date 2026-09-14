# Snapping disclosure QA

September 13, 2026

The canvas has one snapping toggle, with a settings chevron directly beneath it.
Only the settings section expands beneath the chevron. The tool strip keeps its
width, without an empty shared surface above the settings. Guide toggles are
paired, numeric fields use short rows, and longer help stays collapsed.
Settings scroll within available space; short landscape canvases have a scrollable
minimum height. Escape and Close restore focus. Closed controls remain inert.

## Verification

- Focused verification: 10 unit tests, formatting, lint, and typecheck.
- Production build passed.
- Four disclosure browser tests passed at 1440×1000, 390×844, 320×740, and 844×390.
- Browser assertions cover inline layout, unchanged rail width, intermediate collapse
  heights, horizontal clipping, retained values, and focus restoration.
- Thorium in an isolated Agent Workspace confirmed desktop and narrow layouts.
  See [desktop](desktop.png) and [narrow](narrow.png) captures.

During the preceding popover implementation, two broader tests failed at unchanged
geometry assertions: the edge-offset
relationship action disappears after a drop, and the delayed-edit scenario loses
its outline. Both failures reproduced in an isolated production build with the
previous snapping UI and identical engine/dependency versions. Geometry assertions
remain intact; these checks are not counted as passing.

The Impeccable Live overlay loaded, but existing development startup errors
(dependency paths and CommonJS imports) prevented the app from rendering there.
Visual verification used the production preview. Temporary Live injection was
removed; the opt-in Live configuration remains available.

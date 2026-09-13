# Settings consolidation documentation QA

September 12, 2026

This ordinary extension records the shipped settings consolidation in the
existing graphite CAD drafting console. `DESIGN.md` and the Board Studio
surface contract remain the visual source of truth.

## Evidence checked

- Setup preserves effective pitch and legacy or matrix overrides after rename;
  the single Spacing section owns the visible axes.
- Assembly scopes are shared across Board, matrix, column, and key selection;
  Reset to inherited is available at each override scope.
- One Snapping master contains increments, guides, and edge gap controls.
- Post-drop Keep relationship distinguishes center alignment from edge offset.
- Setup and Case use the same mechanical stack editor, including gap and the
  derived plate height. Unlinked legacy cases retain local dimensions.
- Expression helper text is explicit: `Expression = value`.
- Desktop captures checked: `desktop-setup-stack.png`, `desktop-matrix.png`,
  `desktop-assembly.png`, `desktop-snapping.png`, and `desktop-case-stack.png`.
- Mobile captures checked: `mobile-320-assembly-scope.png`,
  `mobile-390-assembly-scope.png`, `mobile-320-snapping.png`,
  `mobile-320-assembly.png`, and `mobile-390-assembly.png`.

## Validation boundary

The source QA record reports precommit, production build, 734 unit tests, and
21 Chromium scenarios passing. The captures cover 1440px desktop and 320px or
390px mobile scoped editors. Case captures show stack editing before case
generation; they do not certify fabricated geometry or material fit.

The fresh finish reviewer's correction verdict is **ship**: all three requested
fixes were resolved. The final six settings browser scenarios passed again after
the expression-label correction. `DESIGN.md` and `.impeccable/design.json` were
preserved; this extension uses their existing tokens and patterns.

# Settings consolidation

September 12, 2026

Scope: reduce duplicate settings while preserving keyboard-design capabilities.
The existing graphite CAD console and blue selection treatment remain.

| Finding | Change | Regression evidence |
| --- | --- | --- |
| Setup resets spacing on rename | Setup reads effective pitch and preserves defaults unless pitch changes | `boardDefaults.test.ts`; browser rename scenario |
| Duplicate matrix pitch | One Spacing section beside dimensions | Browser counts one field per axis |
| Scattered electronics | Shared assembly editor with Board, matrix, column and key scopes; Reset to inherited | `assemblyScope.test.ts`; browser column/key edits and reset |
| Duplicate snapping menus | One Snapping master/menu with increments, guides and edge gap | `SnapControls.test.tsx`; browser toggle and mobile bounds |
| Overlapping retention actions | Post-drop Keep relationship identifies center alignment or edge offset | `layoutRelations.test.ts`; browser center and edge retention |
| Duplicate mechanical dimensions | Shared stack editor with gap and derived plate height | `stackDimensions.test.ts`; Case/Setup round trip |

Explicit matrix spacing, legacy defaults, parameter expressions and more-specific
assembly overrides survive unrelated edits. Unlinked legacy cases keep their local
dimensions. The derived height uses the engine's 6 mm enclosure PCB datum when the
source omits it; without a case, the diagram remains relative to the PCB underside.

## Validation

- Precommit passed: formatting, ESLint, Markdownlint, Knip, typecheck and 734 unit tests.
- Production Vite build passed; existing bundle-size and dependency warnings remain.
- 21 Chromium scenarios passed across settings consolidation, layout units,
  workbench, workspace navigation and inspector resize.
- Fresh isolated browser contexts covered 1440 px desktop and 320/390 px phones.
- Red regressions were observed for spacing reset, inheritance, omitted case datum
  and a snapping menu extending 45 px off-screen before fixes.

Screenshots in `settings-consolidation/` are browser captures of this checkout's
production build. They are QA evidence, not generated art. Case screenshots show
the stack editing state before case generation; they do not certify fabricated
geometry or material fit. The fresh finish reviewer returned **ship** after scoring all three requested
corrections resolved: explicit expression labels, updated mobile stack evidence,
and mobile key-scope evidence. The final six settings browser scenarios passed
again after these corrections. This verdict covers the listed fixes, not a new
whole-application audit.

# Workbench Component Guidelines

## Overview

Feature components and editor surfaces; score 12, a distinct interaction domain.

## Where to Look

| Task | Location |
| --- | --- |
| Workflow, selection, edit dispatch | `BoardStudio.tsx` |
| Pointer editing and immediate draft display | `StudioCanvas.tsx` |
| Object properties and numeric expressions | `StudioInspector.tsx`, `DimensionField.tsx` |
| Persistent drawers and editor layout | `StudioStyles.tsx` |
| Sketches and assembly rendering | `DesignView.tsx`, `AssemblyPreview.tsx` |
| Case drafts and explicit solid builds | `CaseWizard.tsx`, `CaseField.tsx` |
| Footprint defaults and model editing | `FootprintLibrary.tsx`, `ModelEditor.tsx` |
| New native project and setup | `NewDesignWorkspace.tsx`, `DesignSetupPanel.tsx` |

## Conventions

- Files expose components directly; there is no directory barrel.
- `StudioStyles.tsx` supplies shared workbench primitives and layout selectors.
- Source edits flow through document utilities and project state; synchronous
  draft poses remain usable while background analysis catches up.
- `DimensionField` and `ModelEditor` retain unfinished input locally.
- Footprint defaults are resolved for display without altering the saved draft.
- Hidden studio drawers/editors retain layout or mounting where required to
  preserve drafts, scroll position, and editor state.

## Anti-Patterns

- Do not replace a current draft pose with an older analysis result.
- Do not normalize away an incomplete number or expression during typing.
- Do not trigger CAD solid generation for preview-mode/control-only changes.
- Do not unmount persistent editor content merely to hide another project view.

## Focused Checks

Run from the repository root:

```sh
pnpm --dir app exec vitest run src/molecules
```

For edits crossing the source/generation seam, also inspect `../hooks/useStudio.ts`
and `../context/ConfigContext.tsx`; browser tests exercise the assembled workbench.

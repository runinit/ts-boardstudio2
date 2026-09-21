# App Atom Guidelines

## Overview

Reusable controls and preview adapters; score 9, a distinct rendering boundary.

## Where to Look

| Task | Location |
| --- | --- |
| Button variants and text fields | `Button.tsx`, `Input.tsx` |
| Icon names and icon buttons | `Icon.tsx`, `OutlineIconButton.tsx` |
| Settings card structure | `SettingsLayout.tsx` |
| KiCanvas custom-element integration | `PcbPreview.tsx` |
| Three.js STL rendering | `StlPreview.tsx` |
| SVG and text output | `SvgPreview.tsx`, `TextPreview.tsx` |
| Preview loading state | `PreviewLoader.tsx`, `LoadingBar.tsx` |
| Installation/update state | `InstallChip.tsx`, `UpdateChip.tsx` |

## Conventions

- Import atoms from their file; exports mix defaults and named variants.
- Preview atoms adapt generated output for viewing, not document editing.
- `PcbPreview` loads its viewer through `../utils/pcbViewer.ts`.
- Attach KiCanvas load/error listeners before the custom element loads;
  remove listeners when the source/key changes or the atom unmounts.
- PCB regeneration clears stale viewer errors. Startup failures expose a retry;
  viewer failure must leave the downloadable board available.
- Resolve served asset URLs against `import.meta.env.BASE_URL`.

## Anti-Patterns

- Do not modify PCB source as a workaround for a preview-only failure.
- Do not silently replace a preview error with a successful empty view.
- Do not make a shared atom own workbench document-editing state.

## Focused Checks

```sh
pnpm --dir app exec vitest run src/atoms
```

Run from the repository root. Exercise the actual viewer for adapter changes;
jsdom tests alone cannot validate WebGL or KiCanvas rendering.

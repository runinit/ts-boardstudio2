# App Utility Guidelines

## Overview

Source editing, geometry, persistence, and export; score 12, a shared domain layer.

## Where to Look

| Task                                       | Modules                                                        |
| ------------------------------------------ | -------------------------------------------------------------- |
| Native document operations                 | `studioSource.ts`, `designSource.ts`                           |
| Immediate poses, selection, and movement   | `studioMove.ts`, `studioSelection.ts`                          |
| Outline preparation and freezing           | `studioOutline.ts`, `boardOutlines.ts`                         |
| Generation request coordination            | `studioQueue.ts`                                               |
| Setup compilation and dimensions           | `designSetup.ts`, `designUnits.ts`                             |
| Assembly and electrical intent             | `applyAssembly.ts`, `assemblyElectrical.ts`, `assemblyNets.ts` |
| Footprint conflicts and library operations | `injections.ts`, `footprintLibrary.ts`, `footprintService.ts`  |
| Portable projects and downloads            | `share.ts`, `zip.ts`                                           |
| Remote providers                           | `gitProvider.ts`                                               |

## Conventions

- Import named functions directly from their module; no utility barrel exists.
- Native studio helpers expect `schema: ergogen/v1` and a layout document.
- Source edits return new source text; preserve unrelated authored YAML.
- Range-based field removal validates both parsing and aliases before returning.
- Keep source transforms independent from display-only component state.
- Callers include workers as well as React components; consider both import paths.

## Anti-Patterns

- Do not add new callers of deprecated footprint-only injection wrappers.
  Use generic injection conflict/name/merge APIs documented in `injections.ts`.
- Do not replace source-range edits with whole-document serialization when
  that would discard comments, formatting, aliases, or unrelated expressions.
- Do not treat preview success as proof that portable export retained assets.
- Do not bypass queue correlation from a component; the worker guide owns
  revision and publication contracts.

## Focused Checks

Run from the repository root:

```sh
pnpm --dir app exec vitest run src/utils
```

Keep export, source-preservation, and request-order regressions at their utility
seams; include the relevant hook/worker tests when a utility coordinates jobs.

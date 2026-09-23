# App Guidelines

## Overview

React workbench; root instructions cover workspace commands and shared safeguards.
Package boundary retained: score 13; browser runtime, assets, and release tooling.

## Structure

- `src/`: application runtime; atoms, molecules, utilities, workers, and
  context have guides.
- `e2e/`: built-app browser checks and their own guide.
- `patch/`: browser bundle and footprint staging; see its guide.
- `scripts/`: preview generation, release-policy tests, and QA tools.
- `public/`: served models, licenses, and dependency bundles.
- `docs/`: validation records and archived examples, not runtime entries.
- `vendor/`: pinned BHK footprint assets under their own license terms.
- `.impeccable/`: visual-review evidence and decisions, not runtime code.

## Where to Look

| Task                                    | Location                                             |
| --------------------------------------- | ---------------------------------------------------- |
| Browser bootstrap, routing, shared URLs | `src/index.tsx`, `src/App.tsx`                       |
| Main workbench                          | `src/Ergogen.tsx`, `src/molecules/BoardStudio.tsx`   |
| Project state and generation lifecycle  | `src/context/` and its guide                         |
| File, repository, and example loading   | `src/pages/Welcome.tsx`                              |
| Live editing and request queues         | `src/hooks/useStudio.ts`, `src/utils/studioQueue.ts` |
| Worker protocols                        | `src/workers/` and its guide                         |
| Source transformations and export       | `src/utils/` and its guide                           |
| Preview atoms and shared controls       | `src/atoms/` and its guide                           |
| Theme tokens                            | `src/theme/theme.ts`                                 |
| Staged engine and footprint assets      | `patch/` and its guide                               |
| Architecture notes                      | `DEVELOPMENT.md`                                     |

## UI Conventions

- Centralize colors and spacing in theme tokens; use styled-components.
- Prefix styling-only props with `$` so they do not reach DOM elements.
- Use inline styles for high-frequency drag updates to avoid class proliferation.
- Prefer semantic HTML and accessible names; tests select role/name/text before IDs.
- Keep `vite.config.mts` for native ESM configuration loading.
- ESLint configuration belongs in `eslint.config.mjs`, not package.json.
- Declare directly imported libraries as direct dependencies.

## Tests and Generated Files

- Focused unit tests: `pnpm --dir app exec vitest run src/utils/studioQueue.test.ts`.
- Arrange/Act/Assert tests use `src/setupTests.tsx`; mock heavy CAD work.
- Browser configuration is in `playwright.config.ts`; see `e2e/AGENTS.md`.
- `postinstall` stages Ergogen; `prestart`/`prebuild` also regenerate previews.
- Generated catalogs live in `.generated/`; bundles in `public/dependencies/`.
  Change their source scripts or patches, then regenerate.
- Release-script regressions live in `scripts/tests/*.test.cjs`.
- Model contact/terminal QA (`scripts/qa/`) needs kicad-cli and FreeCAD/pcbnew.

## Anti-Patterns

- Do not edit generated catalogs or browser bundles to change source behavior.
- Do not treat archived examples or screenshots as executable validation.
- Do not move browser-only APIs into modules imported by workers.

## Documentation and Change Boundaries

Update `DEVELOPMENT.md` for architecture changes. User-facing changelog entries
belong in `CHANGELOG.md`, newest first, with a title/date and concise explanation;
skip documentation-only and internal refactoring entries.
Keep lint fixes scoped to touched files. Report unrelated failures separately.
Historical upstream issue numbering and external-repository PR instructions are
not the workflow for this consolidated workspace.

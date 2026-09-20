# App Guidelines

## Overview

React workbench; root instructions cover workspace commands and shared safeguards.

## Where to Look

| Task                                    | Location                                             |
| --------------------------------------- | ---------------------------------------------------- |
| Browser bootstrap, routing, shared URLs | `src/index.tsx`, `src/App.tsx`                       |
| Main workbench                          | `src/Ergogen.tsx`, `src/molecules/BoardStudio.tsx`   |
| Project state and generation lifecycle  | `src/context/ConfigContext.tsx`                      |
| Live editing and request queues         | `src/hooks/useStudio.ts`, `src/utils/studioQueue.ts` |
| Worker protocols                        | `src/workers/` and its guide                         |
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
- Browser specs live in `e2e/`; shared studio interactions live in
  `e2e/utils/studio.ts`. Playwright starts its own preview server.
- Set `PLAYWRIGHT_PORT` for port conflicts; it does not reuse an existing server.
- `postinstall` stages Ergogen; `prestart`/`prebuild` also regenerate previews.
- Generated catalogs live in `.generated/`; bundles in `public/dependencies/`.
  Change their source scripts or patches, then regenerate.
- Release-script regressions live in `scripts/tests/*.test.cjs`.

## Documentation and Change Boundaries

Update `DEVELOPMENT.md` for architecture changes. User-facing changelog entries
belong in `CHANGELOG.md`, newest first, with a title/date and concise explanation;
skip documentation-only and internal refactoring entries.
Keep lint fixes scoped to touched files. Report unrelated failures separately.
Historical upstream issue numbering and external-repository PR instructions are
not the workflow for this consolidated workspace.

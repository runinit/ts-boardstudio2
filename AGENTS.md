# Repository Guidelines

## Project Structure & Module Organization

Board Studio is one Git repository and pnpm workspace:

- `app/src/`: React/TypeScript workbench, components, utilities, and workers.
  Static assets live in `app/public/`; browser patches live in `app/patch/`.
- `engine/src/`: Ergogen generator; fixtures and tests live in `engine/test/`.
- `footprints/`: footprint sources, manifests, models, and vendor attribution;
  verification scripts live in `footprints/scripts/`.
- `docs/integration.md`: integration history and provenance.

Read the nearest child `AGENTS.md` for package-specific contracts and checks.

## Code Map

| Entry | Location | Responsibility |
| --- | --- | --- |
| `App` | `app/src/App.tsx` | Shared-project loading and context composition |
| `ConfigContextProvider` | `app/src/context/ConfigContext.tsx` | Project state and generation lifecycle |
| `solveLayout`, `process` | `engine/src/ergogen.js` | Layout solving and output compilation |
| `bindDefaults` | `footprints/src/defaultModels.mjs` | Model defaults in staged footprints |

Map grounded in codegraph and source inspection; TypeScript LSP unavailable.

## Build, Test, and Development Commands

Use Node.js 24+ and pnpm 11.26.0. Run commands from the repository root:

- `pnpm install --frozen-lockfile`: install workspace dependencies.
- `pnpm dev`: start the workbench at `http://localhost:3000/boardstudio/`.
- `pnpm build`: build the engine and app.
- `pnpm test`: run engine, footprint, and app unit tests.
- `pnpm test:release`: run release-script tests.
- `pnpm test:e2e`: test the built app; run `pnpm build` first. Install Chromium with
  `pnpm --dir app exec playwright install chromium`.
- `pnpm precommit`: format, lint, typecheck, and run footprint/app unit tests;
  required before implementation commits. Formatting and linting can modify files.
- `pnpm check`: run integration gates, including builds and browser tests;
  required for integration changes.

## Coding Style & Naming Conventions

Follow surrounding module conventions. App Prettier uses two-space indentation,
semicolons, single quotes, and ES5 trailing commas. ESLint, markdownlint, and
Knip provide additional checks. Use PascalCase for React components and camelCase
for utilities/hooks. Preserve the engine's existing CommonJS and local formatting.

## Testing Guidelines

For bug fixes, write a regression, observe failure, then implement the fix.
App tests use Vitest/jsdom and Testing Library (`*.test.ts`/`*.test.tsx` beside
sources); Playwright specs live in `app/e2e/*.spec.ts`. Engine tests use
Mocha/Chai; footprint checks use Node scripts. On Node 26, set
`NODE_OPTIONS=--no-experimental-webstorage` for jsdom tests.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects matching history, such as
`Keep canvas edits live during analysis`. Describe behavior changes, link relevant
issues, report validation, and include screenshots for UI changes in PRs.
Source snapshots are provenance, not passing validation.

## Repository Safeguards

Preserve unrelated edits, source APIs, project storage identifiers, footprint
namespaces, licenses, and attribution. BHK remains independent. Browser patches
must use a temporary engine copy and workspace `node_modules`; never mutate the
installed engine or depend on sibling checkouts. Repository consolidation does
not authorize deployment or package publication.

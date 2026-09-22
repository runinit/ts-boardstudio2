# PROJECT KNOWLEDGE BASE

**Generated:** 2026-09-21
**Commit:** 8b5b214
**Branch:** main

## OVERVIEW

Board Studio is a React/TypeScript keyboard-design workbench, an Ergogen generator, and a footprint collection in one Git repository and pnpm workspace, deployed to GitHub Pages from `main`.

## STRUCTURE

```text
ts-boardstudio2/
|-- app/          # React workbench, worker protocols and browser staging (TypeScript/ESM)
|-- engine/       # Private @runinit/ergogen package; CommonJS runtime and Rollup bundles
|-- footprints/   # Generators, model manifests and mixed-license vendor assets
|-- docs/         # Integration history, validation evidence and provenance
`-- .github/      # CI checks (check.yaml) and GitHub Pages deploy (pages.yaml)
```

Read the nearest child `AGENTS.md` for package-specific contracts and checks.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Browser startup and workspace | `app/src/index.tsx`, `app/src/Ergogen.tsx` | Bootstrap and workspace surface |
| Project state and generation lifecycle | `app/src/context/ConfigContext.tsx` | Hotspot: ~2.2k LOC, 33 consumers; see `app/src/context/AGENTS.md` |
| Editing and generation | `app/src/molecules/BoardStudio.tsx`, `app/src/hooks/useStudio.ts` | Drafts and revision-filtered background work |
| Generation stages | `app/src/utils/studioPipeline.ts`, `app/src/workers/` | Solve once; reuse layout; worker request/reply and supersession contracts |
| Browser engine staging | `app/patch/` | Temporary engine copy; hash-verified staging contracts |
| Native input and PCB semantics | `engine/src/native/` | Schema, physical frames, placement, constraints; `ergogen-v1.schema.json` |
| Engine test harness | `engine/test/` | Single dispatcher `test/index.js`; see `engine/test/AGENTS.md` |
| Built-in footprint emitters | `engine/src/footprints/` | CommonJS registry; distinct from repo-root `footprints/` |
| Mechanical output | `engine/src/designs/` | Geometry features, assemblies and CAD |
| Model defaults and provenance | `footprints/manifest/`, `footprints/vendor/` | Manifest-owned mappings and vendor-specific terms |
| Integration history | `docs/integration.md` | Consolidation provenance; hashes in `source-snapshots.json` |
| Engine ownership changes | `engine/docs/architecture.md` | Contract and dependency documentation |
| Runnable native examples | `docs/examples/native/*.yaml` | Try `node engine/src/cli.js docs/examples/native/columns.yaml --svg` |

## CODE MAP

| Symbol | Type | Location | Refs | Role |
| --- | --- | --- | --- | --- |
| `App` | Component | `app/src/App.tsx` | Unmeasured | Shared-project loading and context composition |
| `ConfigContextProvider` | Provider | `app/src/context/ConfigContext.tsx` | Unmeasured | Project state, storage, undo/redo, generation lifecycle |
| `resolveLayout` | Function | `engine/src/ergogen.js` | Unmeasured | Synchronous nominal layout |
| `solveLayout` | Function | `engine/src/ergogen.js` | Unmeasured | Asynchronous constraint solving |
| `process` | Function | `engine/src/ergogen.js` | Unmeasured | Layout and output compilation |
| `inject` / `footprints` | Exports | `engine/src/ergogen.js` | Unmeasured | Public API; declarations in `engine/src/native/index.d.ts` |
| `bindDefaults` | Function | `footprints/src/defaultModels.mjs` | Unmeasured | Apply manifest defaults during app staging |

Map consolidated from subtree digests and the previous root guide. Digest authors
confirmed working JS/TS LSP symbols; reliable cross-workspace counts are not supplied here.

## CONVENTIONS

- Use Node.js 24+ and pnpm 11.26.0; run workspace commands from the root.
- Engine is CommonJS with local compact formatting; app is TypeScript/ESM. Preserve both.
- App Prettier uses two spaces, semicolons, single quotes and ES5 trailing commas;
  React components use PascalCase, utilities/hooks camelCase.
- ESLint, markdownlint and Knip provide additional repository checks.
- `schema: ergogen/v1` selects input semantics, not the package version.
- Browser-only APIs must never move into modules imported by workers.
- Default-model changes always have two sides: footprints package tests and app staging
  (`app/patch/stage_boardstudio.cjs` consumes manifests via `bindDefaults`).
- Engine test determinism: `test/helpers/mock.js` pins `Date` to `1760558400000`;
  `test/helpers/register.js` restores Sinon after each test.
- For bug fixes, observe a failing regression before implementing the fix.

## ANTI-PATTERNS (THIS PROJECT)

- Do not overwrite unrelated edits, source APIs, project storage identifiers,
  stable object/footprint/net identities, footprint namespaces or attribution.
- Do not mutate installed engine source or depend on sibling checkouts:
  browser patches use a temporary engine copy and workspace `node_modules`.
- Do not hand-edit generated artifacts: `engine/src/native/ergogen-v1.schema.json`
  and `validate.js` (regenerate via `pnpm --dir engine build:schema`),
  `engine/dist/ergogen.js`, `app/.generated/` catalogs, `app/public/dependencies/`
  bundles and `app/src/catalogue/footprints.json`.
- Never validate engine tests with `npm_config_dump` set: any nonempty value,
  even `false`, overwrites `___*` fixture references.
- Do not apply blanket MIT terms to vendor assets; BHK and each `vendor/<collection>`
  keep their own license terms.
- Do not treat source snapshots, passing model checks or the `native-baseline`
  parity fixture as fabrication readiness; the baseline is parity evidence only.
- npm/package publication remains excluded. GitHub Pages deployment from `main`
  is live CI behavior; do not deploy manually or re-run release steps by hand.

## UNIQUE STYLES

- Root `footprints/*.js` provide `ceoloide/`; Infused-Kim generators stay independent.
- `footprints/manifest/default-models.json` owns model mappings; explicit filenames
  and transforms win. `sources.json` tracks current hashes, `patches.json` original
  hashes; recorded hashes are re-recorded through the integration process, never edited.
- App drafts remain synchronous while background generation filters stale revisions.
- Use short, imperative commit subjects, such as `Keep canvas edits live during analysis`.
  PRs describe behavior, link relevant issues, report checks and include UI screenshots.

## COMMANDS

```bash
pnpm install --frozen-lockfile
pnpm dev                          # http://localhost:3000/boardstudio/
pnpm build                        # Engine and app
pnpm test                         # Engine, footprints and app unit tests
pnpm test:footprints               # Inventory, defaults, models and electrical checks
pnpm test:release                  # Release-script regressions
pnpm --dir app exec playwright install chromium
pnpm test:e2e                     # Requires pnpm build first
pnpm precommit                    # Required before implementation commits; can modify files
pnpm check                        # Required for integration changes; includes build/browser gates
pnpm --dir engine build:schema     # Regenerate schema and standalone AJV validator
```

## NOTES

- App unit tests use Vitest/jsdom and Testing Library beside sources; Playwright
  specs live in `app/e2e/`. Engine uses Mocha/Chai; footprints use Node scripts.
- On Node 26, set `NODE_OPTIONS=--no-experimental-webstorage` for jsdom tests.
- Playwright uses built-app Vite preview, strict ports, no server reuse and zero retries.
- `pnpm precommit` formats, lints, typechecks and runs footprint/app unit tests.
- CI `check.yaml` runs install, engine/footprints/release tests, precommit, build and
  Playwright. `pages.yaml` deploys `app/dist` to GitHub Pages with
  `VITE_PUBLIC_URL=/ts-boardstudio2/` on push to `main`.
- `docs/publication.md` is a historical blocked-publication record, not current state.
- `docs/validation.md` holds dated gate evidence (2026-09-13); treat it as a record,
  not a green light. Local preview restart: `pnpm --dir app exec vite preview --host 127.0.0.1 --port 4327 --strictPort`.
- Historical engine fixture adapters and archived CLI snapshots are not current API coverage.
- `footprints/BOARDSTUDIO.md` records evidence limits; the PTS636SL43LFS reset and
  EC11E15244G1 encoder default models await user-provided files, with further
  sourcing/model creation paused.
- This root update synthesizes subtree digests and the previous root guide, not a
  fresh source audit.

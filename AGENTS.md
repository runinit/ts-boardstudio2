# PROJECT KNOWLEDGE BASE

**Generated:** 2026-09-21
**Commit:** 380650b
**Branch:** main

## OVERVIEW

Board Studio is a React/TypeScript keyboard-design workbench, an Ergogen generator,
and a footprint collection in one Git repository and pnpm workspace.

## STRUCTURE

```text
ts-boardstudio2/
|-- app/          # Browser workbench, worker protocols and browser staging
|-- engine/       # Private @runinit/ergogen package; CommonJS runtime and Rollup bundles
|-- footprints/   # Generators, model manifests and mixed-license vendor assets
`-- docs/         # Integration history and provenance
```

Read the nearest child `AGENTS.md` for package-specific contracts and checks.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Browser startup and workspace | `app/src/index.tsx`, `app/src/Ergogen.tsx` | Bootstrap and workspace surface |
| Editing and generation | `app/src/molecules/BoardStudio.tsx`, `app/src/hooks/useStudio.ts` | Drafts and revision-filtered background work |
| Generation stages | `app/src/utils/studioPipeline.ts`, `app/src/workers/` | Solve once; reuse layout and check supersession |
| Browser engine staging | `app/patch/` | Temporary engine copy; generated browser dependencies |
| Native input and PCB semantics | `engine/src/native/` | Schema, physical frames, placement and constraints |
| Mechanical output | `engine/src/designs/` | Geometry features, assemblies and CAD |
| Model defaults and provenance | `footprints/manifest/`, `footprints/vendor/` | Manifest-owned mappings and vendor-specific terms |
| Integration history | `docs/integration.md` | Consolidation provenance |
| Engine ownership changes | `engine/docs/architecture.md` | Contract and dependency documentation |

## CODE MAP

| Symbol | Type | Location | Refs | Role |
| --- | --- | --- | --- | --- |
| `App` | Component | `app/src/App.tsx` | Unmeasured | Shared-project loading and context composition |
| `ConfigContextProvider` | Provider | `app/src/context/ConfigContext.tsx` | Unmeasured | Project state and generation lifecycle |
| `resolveLayout` | Function | `engine/src/ergogen.js` | Unmeasured | Synchronous nominal layout |
| `solveLayout` | Function | `engine/src/ergogen.js` | Unmeasured | Asynchronous constraint solving |
| `process` | Function | `engine/src/ergogen.js` | Unmeasured | Layout and output compilation |
| `bindDefaults` | Function | `footprints/src/defaultModels.mjs` | Unmeasured | Apply manifest defaults during app staging |

Map consolidated from subtree digests and the previous root guide. Digest authors
confirmed working JS/TS LSP symbols; reliable cross-workspace counts are not supplied here.

## CONVENTIONS

- Use Node.js 24+ and pnpm 11.26.0; run workspace commands from the root.
- Preserve engine CommonJS and local formatting alongside app TypeScript.
- App Prettier uses two spaces, semicolons, single quotes and ES5 trailing commas;
  React components use PascalCase, utilities/hooks camelCase.
- ESLint, markdownlint and Knip provide additional repository checks.
- `schema: ergogen/v1` selects input semantics, not the package version.
- For bug fixes, observe a failing regression before implementing the fix.

## ANTI-PATTERNS (THIS PROJECT)

- Do not overwrite unrelated edits, source APIs, project storage identifiers,
  stable object/footprint/net identities, footprint namespaces or attribution.
- Do not mutate installed engine source or depend on sibling checkouts:
  browser patches use a temporary engine copy and workspace `node_modules`.
- Do not hand-edit generated schema/validator artifacts, `.generated/` catalogs
  or `app/public/dependencies/` bundles.
- Never validate engine tests with `npm_config_dump` set: even `false` overwrites references.
- Do not treat source snapshots or passing model checks as fabrication readiness.
- Do not apply blanket MIT terms to vendor assets; BHK remains independent.
- Repository consolidation does not authorize deployment or package publication.

## UNIQUE STYLES

- Root `footprints/*.js` provide `ceoloide/`; Infused-Kim generators stay independent.
- `footprints/manifest/default-models.json` owns model mappings; explicit filenames
  and transforms win. `sources.json` tracks current hashes, `patches.json` original hashes.
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
- Historical engine fixture adapters and archived CLI snapshots are not current API coverage.
- `footprints/BOARDSTUDIO.md` records evidence limits; reset/encoder default models
  await user-provided files, with further sourcing/model creation paused.
- This root update uses existing guidance and subtree digests, not a fresh source audit.

# Engine Guidelines

## OVERVIEW

Native keyboard compiler and CLI; distinct package boundary, score 12.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Public API | `src/ergogen.js` | `process`, `solveLayout`, `resolveLayout`, `inject`, `footprints`, `version` |
| CLI behavior | `src/cli.js` | Keep accepted native inputs aligned with the library |
| Native compiler | `src/native/AGENTS.md` | Parsing, frames, solver, schema, PCB compilation |
| Mechanical design | `src/designs/AGENTS.md` | Feature graph, analysis, assemblies, solids |
| Footprint emission | `src/footprints/`, `src/pcbs.js` | Registry, parameter parsing, emitter adapter |
| KiCad serialization | `src/templates/` | KiCad 5/8/10 templates and quoted-atom handling |
| Contract documentation | `docs/architecture.md` | Update with ownership, contract, or dependency changes |
| Runnable native examples | `docs/examples/native/` | Feature guides: `docs/designs.md`, `docs/enclosures.md` |
| Tests and fixtures | `test/index.js`, `test/unit/`, `test/fixtures/` | Mocha loader, behavior specs, reference data |

## CONVENTIONS

- Public input declares `schema: ergogen/v1`; package versions do not select
  configuration semantics. Historical preprocessing stays outside the public API.
- The engine owns physical classification and geometry. Renderers consume resolved
  results rather than infer object kinds from names, tags, or footprint filenames.
- Preserve authored values and stable object, footprint, and net identities.
- Public declarations live in `src/native/index.d.ts`; `draft.d.ts` re-exports
  the synchronous layout resolver. Keep declarations aligned with the entry API.
- `solveLayout` resolves constraints without PCB/case compilation; `process`
  compiles outputs. `resolveLayout` is the synchronous nominal-layout surface.

## COMMANDS

Run from the repository root:

- `pnpm --dir engine test` runs Mocha with shared Chai/Sinon setup.
- `npm_config_what=native,native_cli pnpm --dir engine test` selects unit files
  by basename, not glob. Comma-separated selectors also accept fixture categories
  such as `points` or fixture prefixes such as `points/default`.
- `pnpm --dir engine build` regenerates the schema and builds Rollup outputs.

## ANTI-PATTERNS

- `test/helpers/adapter-engine.js` is retained historical fixture support, not a
  supported legacy API. Native API tests import `src/ergogen` directly.
- Historical `test/cli/` snapshots are archival; current CLI coverage lives in
  `test/unit/native_cli.js`.
- Keep `npm_config_dump` unset during validation. Any nonempty value, including
  `false`, overwrites existing `___*` fixture references instead of comparing them.
  Use it only for intentional regeneration, restrict selectors, and inspect all
  changed references. It does nothing for unit tests; absent references cause it
  to list candidate output paths rather than create a baseline.
- Do not substitute `meta/schema.json`, the historical schema, for the native
  contract. Schema source and regeneration rules are in `src/native/AGENTS.md`.

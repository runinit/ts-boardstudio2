# Engine Guidelines

## Source Map

- `src/ergogen.js` is the public CommonJS entry; `src/cli.js` implements the
  `ergogen` executable. Keep their native configuration behavior aligned.
- `src/native/` owns document parsing, layout resolution, physical frames,
  constraints, and PCB compilation. Public declarations start at
  `src/native/index.d.ts`; draft declarations live in `src/native/draft.d.ts`.
- `src/designs/` owns regions, boundaries, sketches, profiles, assemblies,
  enclosure analysis, and solid generation. Start with `src/designs/index.js`.
- `docs/architecture.md` describes ownership and contracts; update it alongside
  contract, ownership, or dependency changes. `docs/examples/native/` contains
  native document examples; feature guides include `docs/designs.md` and
  `docs/enclosures.md`.

## Native Contract and Generated Files

Public input declares `schema: ergogen/v1`; package versions do not choose
configuration semantics. Keep historical preprocessing outside the public API.
The engine owns physical classification and geometry; renderers consume resolved
results. Preserve authored values and stable object, footprint, and net identities.

Edit `src/native/schema.js` for schema changes, then run
`pnpm --dir engine build:schema` from the repository root. This invokes
`scripts/build-schema.js` to regenerate both `src/native/ergogen-v1.schema.json`
and the standalone AJV validator `src/native/validate.js`. Do not hand-edit these
outputs. Validation must not coerce, default, or remove authored values; update
public declarations and native tests when the contract changes.

## Focused Validation

Run commands below from the repository root:

- `pnpm --dir engine test` runs the Mocha loader with shared Chai/Sinon setup.
- `npm_config_what=native,native_cli pnpm --dir engine test` selects unit files by
  basename. Comma-separated selectors also accept fixture categories such as
  `points` or fixture prefixes such as `points/default`.
- `pnpm --dir engine build` regenerates the schema and builds Rollup outputs.

`test/unit/native*.js` exercises the supported API and CLI directly.
`test/helpers/adapter-engine.js` supports retained historical backend fixtures;
it is not a supported legacy API. Historical CLI snapshots are archival;
`test/unit/native_cli.js` defines current CLI coverage.

Keep `npm_config_dump` unset during validation. Any nonempty value makes the
fixture loader overwrite existing `___*` references instead of comparing them
(including the string `false`). Use it only for intentional fixture regeneration,
restrict selectors, and inspect every changed reference. It does nothing for unit
tests; when references do not exist, it lists candidate output paths.

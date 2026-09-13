# Board Studio

Keyboard layout, PCB generation, footprint models, and case design in one workbench.

## Develop

Requires Node.js 24 or newer and pnpm 11.26.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:3000/boardstudio/>. Set `VITE_PUBLIC_URL` (or `PUBLIC_URL`)
to override the base path. Saved project identifiers and `schema: ergogen/v1`
remain unchanged.

## Workspace

- `app/`: React workbench and browser patches.
- `engine/`: Ergogen generator, imported as `ergogen` through a workspace alias.
- `footprints/`: verified footprint sources, models, and upstream attribution.

Browser builds patch a temporary engine copy and reuse workspace-installed
dependencies. No sibling checkout or submodule initialization is required.
The separate BHK repository is untouched; its bundled example stays in the app.

## Verify

```sh
pnpm test
pnpm test:release
pnpm precommit
pnpm build
pnpm --dir app exec playwright install chromium
pnpm test:e2e
```

`pnpm check` runs all gates. On Node 26, set
`NODE_OPTIONS=--no-experimental-webstorage` for jsdom tests.
Enable the optional commit hook with `git config core.hooksPath .githooks`.
CI validates pull requests and main; it does not deploy or publish packages.

## History and licenses

See [integration provenance](docs/integration.md) for source commits and merge
choices. Component histories are retained without squashing. Component licenses
and footprint/model attribution remain in their original directories.
Board Studio builds on [Ergogen](https://github.com/ergogen/ergogen) and
[Ergogen Web UI](https://github.com/ceoloide/ergogen-gui).

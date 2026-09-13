# Consolidation validation

## Verified locally

- Original HEADs, staged/unstaged patches, and 196 changed/untracked source files
  remain unchanged.
- GUI precommit: formatting, Markdown/ESLint/Knip, typecheck, and 842 unit tests
  across 130 files pass.
- Release checks: all 10 Node test files pass, including workspace package links,
  default model portability, patched-build isolation, and configurable base paths.
- Footprints: complete package verification passes.
- Root production build: passes, including schema, patched engine bundle,
  catalogs, models, gallery previews, app, and PWA generation.
- Engine: all 328 tests pass. The CLI regression retains subprocess, diagnostic,
  and output-preservation assertions while capturing child output in temporary
  files to support this sandbox.

MakerJS is pinned to the source snapshot's 0.18.1. Resolving 0.18.2 introduced
18 DXF fixture differences; fixtures were retained. Existing circular dependency,
legacy script, and upstream browser-module build warnings remain.

## Environment limits

The isolated dependency store was seeded from existing pnpm and npm caches.
Recovered npm archives were checked against their recorded SHA-512 integrity.
Temporary trust-lockfile mode was used during offline resolution; no such policy
exception is committed to the workspace. The fresh clone at `/tmp/boardstudio-fresh-20260913` resolves all packages with
`--frozen-lockfile --offline --ignore-scripts` and no policy bypass. The app's
postinstall and complete root build then pass from that clone, with no sibling
repositories or Git submodules. Normal install with lifecycle scripts is blocked
by esbuild's child-process version check (`spawnSync EPERM`); that check was not
removed or modified. Therefore a normal install on an unrestricted machine
remains unverified.

Chromium cannot start its preview server: `listen EPERM 127.0.0.1:4327`.
Thorium is the requested browser for visual review. The local agent workspace
launcher is installed, but startup fails because
`/run/user/1000/agent-workspace-linux` is read-only in this session. No visual or
browser acceptance is claimed.

GitHub lookup for `runinit/boardstudio` returned 404; `gh api user` could not
connect to `api.github.com`. Repository creation, history
upload, PR validation/merge, private visibility, and remote SHA remain unverified.
No deployment or package publication was performed.

## Resume review

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

Use Thorium in the agent workspace to open
<http://localhost:3000/boardstudio/> after starting the server. This URL is the
configured review address, not a currently running server from this session.
Do not merge the integration PR until browser validation passes.

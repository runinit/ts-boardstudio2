# Consolidation validation

## Initial consolidation checks

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

## Install and publication limits

The isolated dependency store was seeded from existing pnpm and npm caches.
Recovered npm archives were checked against their recorded SHA-512 integrity.
Temporary trust-lockfile mode was used during offline resolution; no such policy
exception is committed to the workspace. The fresh clone at `/tmp/boardstudio-fresh-20260913` resolves all packages with
`--frozen-lockfile --offline --ignore-scripts` and no policy bypass. The app's
postinstall and complete root build then pass from that clone, with no sibling
repositories or Git submodules. During initial sandbox validation, install with lifecycle scripts was blocked
by esbuild's child-process version check (`spawnSync EPERM`); that check was not
removed or modified. A normal install with lifecycle scripts has not been retested in the current
unrestricted session.

Initial GitHub lookup for `runinit/boardstudio` returned 404; `gh api user` could not
connect to `api.github.com`. Repository creation, history
upload, PR validation/merge, private visibility, and remote SHA remain unverified.
No deployment or package publication was performed.

## Review fixes (2026-09-13)

Canvas moves now use the current synchronous draft while background analysis is
pending. Accepted moves redraw immediately. Source conflicts, missing reports,
parse/analysis errors, and authored locks remain guarded. Browser tests explicitly
open the Inspector and use current controls and an explicit 1 mm nudge step.

- Regressions failed before the fixes: three stale/pending move cases and the
  unchanged rendered pose after a committed move.
- GUI precommit passes: formatting, Markdown/ESLint/Knip, typecheck, footprint
  verification, and 850 unit tests across 130 files.
- Root production build passes, including engine, schema, browser patches,
  previews, app, and PWA generation.
- Focused Chromium checks pass for rapid moves, visible poses, delayed replies,
  undo/redo, reload persistence, and manual Inspector/resize behavior at 1440 px
  and 390 px.
- Thorium verification used the isolated `boardstudio-thorium` profile. Rapid
  nudges accumulated in saved placement; Inspector stayed closed on selection
  and opened manually on desktop and at a 500 px viewport. The workspace was
  stopped after review.

The full Chromium run completed: **151 passed, 23 failed, 1 existing skip**
(175 tests, six workers). Failures cover old new-design/setup selectors, BHK
relative controls, snap/material controls, a default nudge-step assumption, case
readiness, and outline visibility/toggle overlap. Browser acceptance and
integration merge remain blocked; these failures require separate triage.

Baseline checks against the unmodified `1d1cc14` production build reproduce the
covered Automatic outline checkbox and absent `New native design` helper button.
Loading the larger movement scenario's saved source into that build reproduces
`Expected one connected region; found 2`. The larger scenario retains its outline
assertion; no failing checks were skipped or forced past blocked controls.

## Local review

The production preview is running at <http://127.0.0.1:4327/boardstudio/>.
Restart it with:

```sh
pnpm --dir app exec vite preview --host 127.0.0.1 --port 4327 --strictPort
```

No remote changes, deployment, or package publication were made during this review.

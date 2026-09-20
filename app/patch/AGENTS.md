# Browser Patch Guidelines

## Overview

This directory builds browser bundles and stages verified footprint assets.
Run commands below from the repository root; app and root guides also apply.

## Pipeline Ownership

| File                    | Responsibility                                         |
| ----------------------- | ------------------------------------------------------ |
| `patch_ergogen.sh`      | Orchestrates staged Ergogen build and bundle copy      |
| `stage_ergogen.js`      | Dereferenced temporary copy with dependency-tree reuse |
| `stage_boardstudio.cjs` | Manifest verification, model defaults, assets/licenses |
| `stage_footprints.js`   | Generates `app/.generated/footprints.json`             |
| `footprints_index.js`   | Explicit namespaced footprint registry                 |
| `kicanvas/build.sh`     | Pinned upstream checkout, patch, fixture, and build    |

## Staging Contracts

- Validate source/model hashes before changing footprint staging outputs.
- Keep native engine footprint files when staging additional providers.
- Preserve registry aliases, including the compatibility name `infused-kimo/isde`.
- Rebuild generated bundles through scripts; do not hand-edit their output.
- KiCanvas uses its own pinned revision, patch, fixture, and committed lockfile.
  Its bundle is replaced only after the fixture and build succeed.
- Review `kicanvas/README.md` when changing the upstream pin or compatibility patch.

## Commands and Checks

- `pnpm --dir app run build-ergogen`: rebuild staged Ergogen assets.
- `pnpm --dir app run build-kicanvas`: rebuild the pinned KiCanvas bundle.
- `pnpm test:release`: run staging and release-policy regressions.
- Focused checks: `pnpm --dir app exec node --test scripts/tests/stage-ergogen.test.cjs scripts/tests/stage-boardstudio.test.cjs`.

Release tests must continue to prove that source trees remain unchanged and bad
manifest hashes fail before asset output mutation. KiCanvas viewer compatibility
must not rewrite the downloadable board source.

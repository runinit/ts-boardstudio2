# Footprint Package Guidelines

## OVERVIEW

Footprint source fork, staged model defaults and geometry evidence; score 8,
retained as a distinct workspace package and provenance boundary.

## WHERE TO LOOK

| Task | Location | Contract |
| --- | --- | --- |
| Supported options and known limitations | `BOARDSTUDIO.md` | Includes electrical corrections and model status |
| Ceoloide generators | Root `*.js` | `ceoloide/` namespace, CommonJS modules |
| Infused-Kim generators and model assets | `vendor/` | Separate namespace; read its `AGENTS.md` |
| Staged model wrapper | `src/defaultModels.mjs` | `bindDefaults(source, name)` returns module source |
| Source integrity and pins | `manifest/sources.json` | Footprint/model SHA-256 hashes and candidates |
| Model parameter bindings | `manifest/default-models.json` | Keys must exist in the target footprint |
| Intentional source corrections | `manifest/patches.json` | Original upstream hashes, URLs and reasons |
| Coverage and placement evidence | `manifest/coverage.json`, `alignment.json` | Binding coverage is separate from checked geometry |
| Electrical regression checks | `scripts/refresh*.test.mjs` | Raw/native pad nets, traces, rotations and rejection paths |
| Python geometry helpers | `scripts/assembleNanoSockets.py`, `scripts/gateronDimensions.py` | Require system FreeCAD; provenance recorded in `manifest/kicad.json`, `manifest/gdek.json` |

## CONVENTIONS

- Helpers and Node verification scripts use `.mjs`; footprint emitters retain
  their existing CommonJS format and local style. The two Python helpers need
  system FreeCAD and are geometry-assembly tooling, not package test steps.
- `defaultModels(name)` returns a clone of the manifest entry; `bindDefaults`
  applies defaults during staging, not by rewriting upstream geometry.
- Explicit filenames and XYZ transforms win, including empty filenames used
  to disable models. Preserve conditional Choc V2, reset-boss and trackpoint logic.
- `app/patch/stage_boardstudio.cjs` consumes this wrapper. Default changes have
  both package tests and an app staging consumer.
- Current-file hashes belong in `sources.json`; keep original upstream hashes
  in `patches.json` when correcting a source file.
- Vendor-specific manifests own model revisions, licenses, source hashes and
  assembly/transformation provenance.
- Record only checked sides, rotations and variants in `alignment.json`;
  geometry changes need placement/net checks and native KiCad export evidence.

## CHECKS AND INVENTORY

- Run `pnpm test:footprints` from the repository root for package validation.
- The package test chain is in `package.json`: inventory/defaults, verification,
  coverage, model checks and electrical refresh regressions.
- `node footprints/scripts/verify.mjs` is read-only: it checks hashes, missing
  or unlisted files, candidate references and default parameter keys.
- `node footprints/scripts/coverage.mjs --check` compares the coverage report;
  without `--check`, the script prints JSON rather than updating the manifest.
- `node footprints/scripts/inventory.mjs [output-path]` writes
  `manifest/sources.json` unless an alternate output path is supplied.
- Refresh regressions do not renew historical KiCad exports or prove desktop
  roundtrip, whole-board DRC, physical assembly or fabrication readiness.

## ANTI-PATTERNS

- Never regenerate the inventory merely to conceal an integrity failure;
  review intentional source/asset changes first.
- Do not normalize unpatched upstream bytes as incidental cleanup.
- Do not apply a blanket MIT license: ceoloide includes attributed
  CC BY-NC-SA-derived material; vendor-specific terms live under `vendor/`.
- Do not assign the pending PTS636SL43LFS reset or EC11E15244G1 encoder models
  from candidates: `BOARDSTUDIO.md` records that user-provided files are awaited.
- Do not revive unsupported parameter combinations to make a model render;
  the documented rejection paths protect electrical and physical constraints.

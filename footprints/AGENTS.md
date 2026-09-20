# Footprint Package Guidelines

## Sources and Integration

- Read `BOARDSTUDIO.md` for model decisions, known limitations, and pending work.
- Root-level `.js` modules provide the `ceoloide/` namespace;
  `vendor/infused-kim/` provides the separate `infused-kim/` namespace.
- Keep footprint modules in their existing CommonJS format. Integration helpers
  and Node verification scripts use `.mjs`.
- `src/defaultModels.mjs` exports `bindDefaults(source, name)` for staged modules.
  Preserve explicit user filenames and transform parameters, including empty
  filenames used to disable models; automatic defaults must not take precedence.
- Apply model defaults during staging rather than rewriting upstream sources.
  Record intentional source corrections separately from default bindings.

## Manifest Ownership

- `manifest/sources.json` records source pins and SHA-256 hashes of footprint
  modules and model assets, plus candidate mappings; it is an integrity inventory.
- `manifest/default-models.json` owns model parameter mappings by footprint name.
  Keys must correspond to parameters declared by the target footprint.
- `manifest/patches.json` records intentional source changes, upstream URLs,
  original upstream hashes, and reasons. Preserve those original hashes when
  updating the current-file hashes in the source inventory.
- Vendor-specific manifests record model origins, revisions, hashes, licenses,
  and any assembly or transformation provenance.
- `manifest/coverage.json` tracks default coverage and missing/nonphysical entries.
- `manifest/alignment.json` records only the geometry cases actually checked,
  including sides, rotations, variants, and limitations. Default coverage or
  passing source checks does not establish fabrication readiness.

## Verification and Inventory Updates

- Run `pnpm test:footprints` from the repository root for package validation.
- `node footprints/scripts/verify.mjs` is read-only: it checks hashes, missing or
  unlisted files, candidate references, and default parameter keys.
- `node footprints/scripts/inventory.mjs` **mutates** `manifest/sources.json`
  by default. Its optional output argument selects another destination.
  Regenerate only after reviewing intentional asset/source changes; never use
  regeneration merely to hide a failing integrity check.
- Geometry changes need relevant placement/net checks and native KiCad export
  evidence before extending alignment claims. Preserve documented limitations.

## Vendor Boundaries

- Retain vendor license files, attribution, model sources, and revision records.
  Do not apply a blanket MIT license to this package or its assets.
- Ceoloide includes attributed CC BY-NC-SA-derived material; Infused-Kim and
  koktoh assets retain CC BY-NC-SA 4.0 terms. KiCad models retain their license
  and model exception; GDEK retains CERN-OHL-S-2.0. Consult each vendor's records.
- Unpatched source files retain upstream bytes. Do not normalize or reformat
  vendored sources as incidental cleanup.

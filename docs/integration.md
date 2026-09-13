# Integration provenance

Board Studio combines these source histories without squashing:

| Component | Source HEAD | Local snapshot |
| --- | --- | --- |
| Consolidated engine | `fcd5e0f0993a5bb96b40898086a984c88b61d0da` | `403ca3647927695e77a65f42a1badd6a5cc23703` |
| Enclosure engine | `2a0754a03188de650b6437db106f9edf57e348bf` | `90c6e2b3af8b57b8ef189eb049bfb2ba3dabbb88` |
| Consolidated app | `ae538eeb9f076d810c8f0aa9d23d53213e21fbee` | `4eb7e3287e3fe3aa72c15fb11dd022f4a28bcbb5` |
| Enclosure app | `5e9ad3ce923ee36fe223062d297fd6b842cc95b1` | `39e1a41b13e03f05e4dc3bfa1a0a2179689ecef0` |
| Footprints (`boardstudio/models`) | `f100c4d2808f799b1a77cb669f3d5ba9df7af6fd` | unchanged |

[source-snapshots.json](source-snapshots.json) records original paths, full SHAs,
and hashes for local changes. Original checkouts are preserved. Separate history
bundles, staged/unstaged binary patches, and untracked file copies are stored in
`../.boardstudio-integration/` outside this repository.

## Merge choices

- Engine schema and geometry combine layout guides, aligned constraints, material
  stackups, placement offsets, model frames, draft layout, and outline snapshots.
- The enclosure workbench supplies the unified Inspector and settings layout.
  The consolidated Studio coordinator supplies immediate editing and revision
  guards. Sparse row/column selections and portable model exports remain supported.
- Selection-triggered popovers are removed; the Inspector opens manually.
- The engine archive and footprint submodule are replaced by workspace packages.
  Old archives remain in source history. Browser patches apply to a temporary
  engine copy using the same installed dependencies as the source engine.
- Bundles, schema, footprint catalogs, and previews are regenerated from merged
  sources. One root pnpm lockfile resolves all components.
- CI runs validation only. Deployment and package publication are excluded.
- BHK remains a separate project, with its bundled example retained here.

The component licenses, model attribution, `ergogen` import alias,
`schema: ergogen/v1`, saved project keys, and footprint namespaces are preserved.

## Validation

See `validation.md` for the final gate results and their limits. Source snapshots
and historical QA captures do not certify this merged candidate.

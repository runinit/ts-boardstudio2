# Local Ergogen source

`ergogen-415fd3a.tgz` contains generator source from
[`runinit/ergogen@415fd3a`](https://github.com/runinit/ergogen/commit/415fd3ae1895a7ccc5ed5a3a28e90b2dd6846b41).
It retains the upstream MIT license and attribution.

SHA-256: `fdc593ebf31d0c51ae92d260fc51ace88498e9d4ae12aa9826f70bd8de79e30b`

The archive supplies the full enclosure and parametric design pipeline. pnpm
installs it locally; the patch recipe builds it in a temporary directory.
No npm publication or version override is required.

To update: validate and commit the engine, pack that exact checkout, replace
the archive, record its commit and hash, then refresh the lockfile and build.
The older 5.0.0 archive records the production baseline.

## Guided mounting follow-up

`ergogen-guided-d8de34fdf6bb.tgz` is the local enclosure-work source snapshot
for optional component envelopes, requested contact counts and cached analysis.
It retains the upstream license and attribution.

SHA-256: `d8de34fdf6bb70a1d1c7c45bcf2af4c8f23bb919dc69313d16f2756e10ade6e1`

## CAD workspace snapshot

`ergogen-cad-e2d947209f40.tgz` contains the earlier `enclosure-work/ergogen`
source, including the guided mounting work and reusable footprint/model helpers.
This is a local source snapshot, not a published release.

SHA-256: `e2d947209f4023d15ebeeb1582b6dedce72762b227f202b4f319b29a95b9fdd7`

The normal build repackages the selected engine into
`public/dependencies/ergogen.js` before Vite builds the GUI.

## Native configuration snapshot

The previous dependency `ergogen-native-78485e1ac8c1.tgz` was built from the
local enclosure checkout at engine commit `a9d1cc4`, including
CNC plate-hole, post-height and relief-bound fixes. This snapshot includes `schema: ergogen/v1`,
physical layers, typed objects, and native PCB inventory. It is not a published
release; the historical archives above are inactive.

SHA-256: `78485e1ac8c13ab799501787fc196a123f3107b5e9f67392c0741026ed75c73f`

Installed engine sources match the enclosure checkout byte for byte. The package
excludes the historical test harness. Keep the upstream license and attribution.

## Board Studio snapshot

The selected dependency is `ergogen-studio-7f774f2566c3.tgz`, a local source snapshot
of engine commit `44bbc26`. It includes planar layout constraints,
column transforms, automatic matrix nets, validated corner rounding and
sub-tolerance offset repair during solid conversion.
The source is committed; this is not an npm release.

SHA-256: `7f774f2566c399d658ffc2662937b2190c8eb0f00bd200339848c3ffe3ba8f39`

## Corner relief repair

Selected dependency: `ergogen-studio-b3293ff8a4fe.tgz`. Source matches engine commit
`44bbc26` plus the local `src/designs/finishing.js` repair for newly enclosed
voids during corner relief. This is an uncommitted local snapshot.

SHA-256: `b3293ff8a4feac421449e12a65546723b8890db533fdeddf3233012fa2574491`

## Consolidated Studio engine

Selected dependency: `ergogen-studio-f24848e.tgz` from committed source
[`runinit/ergogen@f24848e`](https://github.com/runinit/ergogen/commit/f24848e9f408c1c7ad16c68e9689854db8482446).
Includes corner-relief repair and native SVG outline injection.

SHA-256: `fc1a51a28329c1bbfb82b80d230005582fb580b76f503c695a10557f75f3eaa8`

## Matrix outline recovery

Selected dependency: `ergogen-outlines-f7ae08662ede.tgz`, built from consolidated engine
`d83f04115c33c57f5139b72b1705b5dc266d4db2` plus the local outline-recovery changes.
Includes exact-radius gap-closing repair and `holes: preserve | fill`.
The generated schema and engine bundle are rebuilt from those sources.
This is an uncommitted local snapshot, not a published release.

SHA-256: `f7ae08662ede8a9d13a6a19f74c8284d38019912423a024c9612e5369c68b966`

## Continuous editing and frozen outlines

Selected dependency: `ergogen-continuous-1510d1b1ff58.tgz` from consolidated engine `d83f04115c33c57f5139b72b1705b5dc266d4db2`
plus local outline repairs and continuous editing changes. Includes synchronous
draft resolution, reusable solved layouts, fixed placement axes, and exact
native contour snapshots. Built locally; no publication.

SHA-256: `1510d1b1ff581780b28c66d7b8adaafbdca31e06b7bf7e3318af4f6b7375e76e`

## Footprint models

`boardstudio-footprints` is a pinned Git submodule containing upstream sources,
model assets, provenance and default bindings. Initialize it with
`git submodule update --init --recursive`; `build-ergogen` stages it automatically.

## Footprint model frames

`ergogen-footprint-frames-fcd5e0f.tgz` packages engine commit `fcd5e0f`.
Its source matches that commit; 300 isolated engine tests pass. The GUI
resolves bundled assets before generating native model solids.

SHA-256: `ca3ee5173801990d9b7ce9b13d027df67ab9d638b36cf44f0351e008bb8dafee`.

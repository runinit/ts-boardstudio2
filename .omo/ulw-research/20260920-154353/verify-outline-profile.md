# Exact fixture outline verification

Node 24.14.0, engine MakerJS 0.18.1; 60 keys with `fingers_c10_r1` placed at `[3, 0, 0]`. Baseline YAML SHA-256 is `aac51972a25285321902e491412184a69bc4c820eaa594cf54979ebf6f555779`; executed moved-source hash is `30f6f555b883140f9e8fd288e8156349cc2767bbea84c767b0806664f22a1312`.

## Repeated uninstrumented measurements

After one completed untimed outline-only warmup, three sequential samples each solved a fresh prepared layout. Outline times exclude layout solving:

|Run|Layout solve|Outline only|Following same-source analysis|
|---|---:|---:|---:|
|1|40.32 ms|7621.31 ms|665.26 ms|
|2|31.89 ms|7798.75 ms|666.45 ms|
|3|33.51 ms|7887.09 ms|603.40 ms|

The immediate outline→actual `freezeOutlines`→analysis experiment measured **626.20 ms for following analysis only**. It excludes layout, outline generation and the freeze operation. The frozen source has three snapshots and `auto: false`. One unrandomized sample does not isolate avoidable cache-miss cost.

Exact assertions cover `profiles.main_outline` extracted analytic paths, bounds and contour count, plus `main_outline` SVG and DXF: 15 paths, one contour. They do not establish equality of full design reports, diagnostics, PCB or case outputs.

[Repeated raw data](artifacts/outline-repeat.json) · [exact producer](artifacts/outline-repeat.cjs).

## Separate diagnostic

The first full direct run took 8510.94 ms. The subsequent warmed instrumented outline pass took 7673.44 ms; wrapped MakerJS outline time was 6472.13 ms and validation 94.87 ms. Wrappers nest: never add these times or derive a before/after speedup from the different stages.

Counts: nine outline calls, 600,107 path intersections and 173,024 point-inside calls. A separate lightweight call diagnostic found three 240-path positive expansions at distances 2, 1 and 2.001 mm taking 1861.76, 1836.36 and 1957.64 ms. Distinct parameters do not establish an identical-offset memo miss.

The earlier 611.78 ms frozen analysis happened after a same-source analysis consumed the cache; use the later immediate-pipeline experiment for that path. Profile/repeat output hashes serialize different field names and are not comparable across files. The emitted `patchSha256` annotation is not a runtime hash check; use [baseline identity](artifacts/baseline-identity.json) and frozen producer hashes.

[Diagnostic raw](artifacts/outline-profile.json) · [exact producer](artifacts/outline-profile.cjs) · [reproduction](REPRODUCE.md).

Both isolated engine directories were removed after archiving. No production files were edited.

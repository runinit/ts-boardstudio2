# Reproducing the research probes

The archived `.cjs` files are the exact producers, including their original absolute temporary paths. Do not edit those evidence files. Adapt copies for a rerun and record the adapted hashes and environment separately.

## Baseline and dependencies

Use this repository's existing staged source, identified in [baseline-identity.json](artifacts/baseline-identity.json). HEAD alone does not identify the tested code. The engine tests used Node 24.14.0 and MakerJS 0.18.1. The browser used the existing production `app/dist`, Playwright 1.59.1 and Chromium 147.0.7727.15. The listed JavaScript asset hashes are recorded, not a full byte manifest of HTML/CSS/service-worker/fonts; full-build byte identity is not established. A new build is a new measurement condition.

Install the repository's locked dependencies if needed. Use a temporary engine copy whose `node_modules` points to the workspace's **engine** dependencies. Do not substitute the app's MakerJS 0.19.2. Retain the exact archived [60-key fixture](artifacts/fixture-60.yaml).

## Engine

1. Create a temporary directory, copy `engine/src` and `engine/package.json` into its `engine/` directory, and link `engine/node_modules` to this checkout's absolute `engine/node_modules` path. Copy any additional engine resources required by a broader fixture.
2. Copy [outline-repeat.cjs](artifacts/outline-repeat.cjs) into the temporary directory and copy the archived [freeze-helper.cjs](artifacts/freeze-helper.cjs) there under the required name `studioOutline.cjs`. Create `<temporary-directory>/node_modules/ergogen` as a symlink to `../engine`. The latter bundles the actual app helper used in the experiment; it is not a hand-written substitute.
3. In the copied producer only, replace the `root` constant with the new temporary directory and `sourcePath` with the absolute archived fixture path. The script itself changes `fingers_c10_r1` to `[3, 0, 0]` and serializes the moved source.
4. Run the copied producer with Node 24 and `NODE_PATH` set to this checkout's absolute `app/node_modules` directory, which resolves the helper's external imports. Preserve stdout/stderr, output JSON and the adapted producer hash.
5. The script performs an untimed outline warmup, three separately prepared timed samples, immediate outline/freeze/following analysis, then a separate instrumented per-call diagnostic. Keep these endpoints separate. Exact assertions cover the named profile, not all engine outputs.

Baseline YAML SHA-256: `aac51972a25285321902e491412184a69bc4c820eaa594cf54979ebf6f555779`.

Executed moved-source SHA-256: `30f6f555b883140f9e8fd288e8156349cc2767bbea84c767b0806664f22a1312`.

## Browser

1. Serve the existing build with the repository's Vite preview command on an unused loopback port. The probe defaults to `http://127.0.0.1:4173/boardstudio/`; override `DRAG_BASE_URL` if needed.
2. Copy [drag-final.cjs](artifacts/drag-final.cjs). Adapt its Playwright require path and fixture path to this checkout. Keep the archived original unchanged.
3. Run `DRAG_REPEATS=3 node <copied-probe.cjs> <new-output.json>` with Node 24. The producer creates fresh contexts in one browser process and uses real Playwright mouse commands. No warmup drag is discarded.
4. Count attempted moves and terminal outcomes. For successful sustained cases, check the request source against the first observed saved source, match request ID/revision, and compare success source with final stored source. Do not treat the `workerSuccessObserved` boolean as success: it means a terminal response, including errors.
5. The valid sustained cases end 12 screen pixels left of the start. Additional re-grab/off-canvas cases intentionally expose validation outcomes; do not include those errors in successful timing ranges. The zoom/cancel cases do not establish valid pointer-capture lifecycle coverage.

The probe reads storage and DOM every animation frame. Its overhead is uncontrolled, and its timestamps are observation/receipt endpoints, not physical presentation. Run an observer-light control and a causally matched frame trace before using it to claim an optimization improved sustained dragging.

## Cleanup and comparison

Serialize CPU-heavy runs. Stop preview servers and browser processes, archive results, and remove only the temporary directories created for the rerun. Compare like fixtures, warmup, instrumentation, browser/runtime versions and endpoints. The browser and engine runs here move different keys and cannot be divided into a speedup ratio.

The emitted engine `patchSha256` field is a hard-coded annotation, not a runtime hash check. Use the separately verified index tree, frozen producer/helper hashes and archived fixture hashes for provenance.

Concrete browser invocation from this checkout (serve preview in a separate terminal):

```bash
export PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH
pnpm --dir app exec vite preview --host 127.0.0.1 --port 4173 --strictPort
```

```bash
DRAG_REPEATS=3 DRAG_BASE_URL=http://127.0.0.1:4173/boardstudio/ node .omo/ulw-research/20260920-154353/artifacts/drag-final.cjs /tmp/drag-rerun.json
```

Exact local engine reconstruction can use `git archive 348e0e5f520a45268ba80a01f90627f8a0f575d8 engine` extracted to a newly created `/tmp/outline-runtime.fEjAny`, then the engine dependency symlink, top-level `node_modules/ergogen` symlink and frozen `studioOutline.cjs` described above. Verify that destination is absent first; do not overwrite another task’s directory. The archived producer can then run unchanged. This module-loading setup was verified separately without rerunning the benchmark.

Engine dependency versions resolved in the validation: js-yaml3.15.2; browser build tooling Vite5.4.21. The archived Chromium executable was147.0.7727.15. Elapsed results depend on the host and are not expected to reproduce byte-for-byte.

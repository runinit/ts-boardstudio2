# Drag-release baseline (existing production build)

One valid real mouse drag of fingers_c1_r1 in the 60-key fixture. Chromium 1440×1000, Node 24, no CPU throttling, existing app/dist, no rebuild or source instrumentation. Screenshot after.png shows the selected key displaced left and the final outline following it. Footer confirms 60 keys. No console or page errors. Profile samples only the page main thread; worker attribution must come from a separate worker profile.

Run from repository root:

```sh
/home/chris/.nvm/versions/node/v24.14.0/bin/node .omo/evidence/performance-20260920/release-baseline/probe.cjs
```

The probe owns port 4181, starts vite preview, and closes browser and server in finally. It reuses saved fixture.yaml. Reruns measure whichever app/dist is present, so compare build provenance. Original profiled main bundle is retained as profiled-index.js and its SHA256 in profiled-index.sha256. The historical probe was not edited.

## Observed timing

| Event | performance.now / event timestamp (ms) | Since pointer up (ms) |
|---|---:|---:|
| Pointer up event timestamp | 5208.300 | 0 |
| Pointer up capture listener | 5209.900 | 1.600 |
| First frame observing saved source | 5297.200 | 88.900 |
| First frame observing committed polygon | 5366.000 | 157.700 |
| Worker request | 5541.600 | 333.300 |
| Worker outline stage | 8614.300 | 3406.000 |
| Worker terminal success | 9098.400 | 3890.100 |

Initial polygon `-9,9 9,9 9,-9 -9,-9` became `-20,9 -2,9 -2,-9 -20,-9`; committed transform returned to `translate(0,0)`. Source differs and is retained in committed-source.yaml. First drag transform occurred 23.8ms after first move. Two release long tasks started at 5209.6ms and 5298.2ms, lasting 87ms and 64ms.

## Actual sampled stacks

Inclusive sampled times below overlap down the stack and must not be summed across parent/child rows.

- `StudioCanvas → useMemo → moveTargets` **75.97ms** → `moveLayout` 74.84ms → `setLayout` 74.28ms. Inside `setLayout`, `editField` consumed 63.01ms; its `sourceDocument` consumed 42.76ms (clone 16.86ms and snapshot/parse 25.90ms); `editDesign` consumed 20.25ms, mostly another document clone (16.88ms). A separate `sourceDocument` call under `setLayout` consumed 10.14ms.
- `BoardStudio` **81.40ms** inclusive: `useMemo → readStudio → sourceValue → snapshot$1` 41.74ms, including `parseDocument$1` 38.96ms; `useStudio → useMemo → resolveLayout` 28.15ms.
- Main-thread profile duration 4327.48ms, sampled idle 3515.64ms, `(program)` 507.95ms. Probe sampling/frame observation is itself visible (snapshot 52.61ms). These are profiling diagnostics, not an uninstrumented latency benchmark.

The first stack is located at profiled-index.js:20335 (StudioCanvas) → :18603 (moveTargets) → :14168 (moveLayout/setLayout). The second begins :20415 (BoardStudio), then :19235 (useStudio/resolveLayout). Exact sampled columns and complete descendant trees are saved in attribution.json, aggregate.json, StudioCanvas-tree.json, moveTargets-tree.json, and BoardStudio-tree.json.

## Bounded recommendation

For the roughly 150ms release commitment, investigate reusing the already-computed drag edit and parsed source snapshot across the canvas release and subsequent BoardStudio render, reducing repeated YAML clone/parse work while preserving immutable document ownership and source formatting. Runtime evidence supports this as a main-thread hotspot; this capture does not prove a proposed cache is correct or quantify its speedup.

The multi-second outline wait is predominantly asynchronous worker time; this page profile does not identify the worker's expensive function. Keep worker/engine optimization separate from the main-thread commitment measurements.

One sample establishes a valid baseline and stacks, not a percentile distribution. Profiler.start delayed dispatch by about 350ms before pointer up; reported release deltas use actual pointer-up timestamps and exclude that setup delay. rAF timestamps are first-observed source/polygon values, not exact mutation instants. Browser probe instrumentation reads localStorage and DOM each frame and adds overhead. No Lighthouse, broad React audit, or visual redesign claim is made.

Cleanup receipt: cleanup.json reports browserClosed=true and serverExited=true. Only artifacts in this folder were written.

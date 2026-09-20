# CAD performance implementation evidence

Baseline commit: `0ce7f8e87dccba6fbba194e0b2e4f9a102e5405e`.
Research: `.omo/ulw-research/20260920-154353/SYNTHESIS.md`.

## Changes and proofs

- Queue reuse: reset the cleared grace timer handle on disposal. The failing
  cancel-during-grace/reuse/supersede test now passes. `queue-pin.log`,
  `queue-red.log`, `queue-green.log`; real Chromium Worker execution in
  `queue-browser.json`, with resource cleanup in the producer's `finally`.
- First movement/rotation: write a missing placement override and fixed axes
  together. Real YAML parse count falls from two to one; document clones from
  five to three. Exact source, formulas, comments and resolved position remain
  covered. `release-edit/red.log` and `release-edit/green.log`.
- Outline offsets: retain the explicit intersection ray on direct contraction;
  preserve existing expansion behavior and repair steps. The notched matrix uses seven rather than nine
  outline calls with unchanged exact path/SVG/DXF hashes. `outline-red.log`
  and `outline-green.log`.

## Matched engine measurement

`outline-matched.cjs` compares unchanged baseline geometry against current code,
with one untimed warmup per variant and six interleaved samples. Each sample has
its own prepared layout. Results: median **7,537 ms before, 5,232 ms after**
(**30.6% lower**). All six samples have identical analytic paths, bounds,
contour count, SVG and DXF. See `outline-matched.json`.

This is one 60-key notched fixture, not a population latency estimate. It moves
`fingers_c10_r1` by +3 mm. Browser measurements move a different key and must not
be divided by these numbers. No polygon approximation or kernel replacement was
introduced.

## Browser diagnosis and comparison

`release-baseline/report.md` identifies repeated YAML cloning/parsing in actual
sampled release stacks. Its single profiled sample is diagnostic, not a benchmark.
`browser-matched.cjs` is the separate interleaved before/after producer and
functional QA driver. Browser source/polygon observations are DOM/rAF endpoints,
not physical display latency; its observer adds overhead.

## Reproduction

Use Node 24 and locked workspace dependencies. The producers derive this checkout
from their location except the archived diagnostic profile producer, which retains
its original absolute path. `baseline-path.txt` records a temporary baseline engine
and app build copy for this run. Recreate that copy from the baseline revision and
build before rerunning; the temporary directory is removed after QA. Never edit
historical research producers or installed engine dependencies.

Validation, browser results, reviewer verdicts and cleanup receipts are appended
in `completion.md` when available. Initial resource-failed validation logs are
retained separately from successful retries.

The captured baseline bundle is archived byte-for-byte as
`release-baseline/profiled-index.js.gz`; decompress it to inspect profile source
locations. Page-context transcripts and logs have trailing whitespace normalized.

# Performance implementation acceptance

Scope: the mouse-drag and outline hotspots identified in the linked research.
Baseline: `0ce7f8e87dccba6fbba194e0b2e4f9a102e5405e`.

## Criteria

- C1: queue disposal clears its grace handle, so reuse/supersession can terminate
  obsolete work and publish the latest request. Failing-first unit proof and
  actual Chromium Worker proof pass (`queue-red.log`, `queue-green.log`,
  `queue-browser.json`).
- C2: first placement override creation batches coordinates and fixed axes.
  Real YAML parsing falls from two calls to one and document clones from five
  to three, with exact source and resolved-pose assertions (`release-edit/`).
  The real browser drives drag, Escape cancellation, cumulative re-grab,
  undo/redo and responsive widths. Timing is DOM/rAF observation, not physical
  display latency; this fixture is not a population performance estimate.
- C3: direct contraction retains MakerJS's explicit intersection ray, reducing
  the notched matrix from nine outline calls to seven with existing exact
  analytic-path, SVG and DXF hashes. Direct expansion retains baseline behavior.
  The initial broader change failed a splayed-cavity regression; it was narrowed
  before acceptance (`offset-regression.md`). No geometry approximation added.

## Validation boundaries

Initial overlapping checks exhausted resources: engine exited137; build and
precommit ended143. Serial retries supersede them without configuration changes
or weakened tests. Precommit passed 140 files/922 app tests; release tests20 pass.

Full browser suite reproduced the three previously documented failures in
`app.spec.ts` (missing New native design) and `bhk-matrix.spec.ts` (hidden Add key
in column7 at1440/390px). It stopped at the requested three-failure cap:
1 interrupted and189 not run. This is not an all-browser-suite pass.
Current logs and page contexts: `e2e-suite.log`, `e2e-known-failures/`.
Historical baseline confirmation:
`../ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/after/preexisting-failures/REPORT.md`.

Final corrected-source results and cleanup are appended below after completion.

## Corrected-source results

- Full engine:335 tests pass (`engine-final.log`).
- Final precommit:140 files/922 tests pass, with formatting/lint/typecheck,
  footprint checks (`precommit-final.log`); release20 pass (`release-suite.log`).
- Production build passes (`build-final.log`); regenerated browser engine bundle
  matches contraction-only source. Changed-file LSP reports no errors.
- Matched warmed outline:7537.485 →5232.323ms median,30.6% lower; all six outputs
  deeply equal across paths, bounds, contour count, SVG and DXF
  (`outline-matched.json`). Fixture moves `fingers_c10_r1`+3mm.
- Matched browser:158.3 →118.9ms median,24.9% lower; all six final layouts and
  polygon strings equal (`browser-matched.json`). Fixture moves `fingers_c1_r1`;
  do not compare/divide browser and engine durations across these fixtures.
- Escape cancellation, cumulative re-grab, undo/redo exact pose, no page errors
  and no horizontal overflow at375/768/1280 all pass. Root viewed final desktop
  and375px captures; selection and outline match, controls remain legible.
- Earlier broad-offset measurements are archived in `initial-broad-offset/`;
  they are superseded, not final acceptance evidence.
- Final built-app integration passes (`e2e-performance-final.log`,1test/1.8min),
  including native60-key drag/nudge, freeze/rebuild, row/column/key add/remove,
  undo/redo, reload persistence and component movement/reload. Full artifacts
  live in `e2e-performance-final/`.

## Cleanup

Matched browser closed; preview PIDs2066582/2066623 exited0
(`browser-cleanup.json`). Final Playwright exited0 and released its server.
Ports4181–4184 have no listeners (`ss -ltnp` checked). Removed the exact owned
baseline directory `/tmp/boardstudio-perf-baseline.nxCdZS`. Archived the debug
journal here and removed its temporary root copy. Durable notepad is retained
and copied here. No installed dependencies or user services were modified.

## Review and commits

Independent final reviewer APPROVE for C1/C2/C3, no blockers (`final-review.md`).
The reviewed production changes are now committed as:

- `54c90c2` Restore cancellation grace after reusing the studio queue
- `765e979` Retain contraction rays to avoid redundant outline repairs
- `f33af6b` Batch initial placement overrides to shorten drag commits

No production edits followed the final successful checks. Evidence logs have
trailing whitespace normalized for Git; substantive output is unchanged.
Commits remain local; this implementation task did not request another push.

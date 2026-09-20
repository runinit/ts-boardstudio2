# Corrected browser trace: scoped pass

MEASURED on Chromium147.0.7727.15, Playwright1.59.1, Node24.14.0; production app/dist;3 fresh browser contexts. Same60key fixture sha aac51972a25285321902e491412184a69bc4c820eaa594cf54979ebf6f555779. Real Playwright mouse movement36-command outward/return path ends-12px from start, followed by actual pointerup. Raw records37moves including setup.

Frozen producer artifacts/drag-final.cjs SHA654acceaa5b3db82edc9bc0c2582c459cab75f13eced8126730dd3ad284c0cc3. Raw artifacts/drag-final.json SHA12e1ad444ec9ce063e6ed3eb4fa0cc8050b0239bf127ab4d9b2b77327ee39514. Root verified hashes. Observer O independently verified request.source equals first saved moved source, matching requestId+revision SUCCESS, and success.reply.source equals final stored amended source for all3.

First post-down move→first DOM transform23.9/30.3/34.5ms; pointerup→saved source98.5/103.1/104.2ms; pointerup→changed polygon157.6/164.1/164.9ms; pointerup→request333.4/339.4/340.2ms; pointerup→outline stage2798.3/2800.6/2876ms; pointerup→success receipt3228.6/3238.3/3309ms. n=3 exploratory independent contexts, same machine; no population percentile/tail claims.

Each run captured long tasks about98–103ms and55–56ms around release. These are observational overlap, not attributed function timings. Per-frame DOM+storage sampling has uncontrolled overhead; no observer-free control. rAF observations are not physical presentation; arbitrary move→next transform is not causally matched, excluded. EventTiming/LoAF supported; presentationTime not obtained.

Final UI publication was not timed: one scenario still displayed lastvalid/pending when collected46ms after success receipt. Never call workerreceipt visibleoutline completion.

Corrected extra scenarios: rapidregrab ended with explicit spacing rejection and no source change; offcanvas committed local move then exact worker error Expected one connected region; found2. These demonstrate terminal validation outcomes, not latency successes. Zoom/syntheticcancel not valid lifecycle evidence.

Initial diagnosis excluded as producer mismatch; see verify-drag-diagnosis-audit.md. Preview server/browser processes stopped. Raw/script now archived; K cleans owned tempdir.

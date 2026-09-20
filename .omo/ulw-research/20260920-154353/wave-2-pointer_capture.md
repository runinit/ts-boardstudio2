# E: capture semantics
https://www.w3.org/TR/pointerevents3/#implicit-release-of-pointer-capture requires pointerup/cancel then capture clear/lostcapture. Missing explicit release is not a bug. Terminal event remains captured. Explicit early release useful but inactive pointer can throw. touch-action must be established before gesture. Primary-only exception: normative standard establishes requirement, not cross-engine conformance.
EXPAND browser WPT edge cases: wave3 bounded review needed; K tests actual Chromium lifecycle.

Refinement correction: terminal dispatch precedes implicit release only if capture is still active; it may have been explicitly released earlier. NotFoundError condition is pointerId matching no active pointer. A dated official WPT mouse test reports conformance in its listed engines; this project did not execute a browser matrix.

# Initial drag probe audit: partial, not a successful benchmark

The exact producer harness for `artifacts/drag-diagnose.json` is unavailable: the archived script was already changed after the run. Its SHA is e8e1a5d1dca4ec219400c8d08ecbe2e53a46e31c7af7ce54ea228786b1dc4cfe. The raw trajectory has positive216px movement and vertical change, while the script has a negative horizontal return path.

Excluded fields/claims:

- Negative last-move-to-first-transform is a reversed endpoint, not latency.
- First nonbaseline worker request can be obsolete after regrab.
- Missing success included a correlated error (+2776.6ms offcanvas); error payload omitted.
- Source parsing/string retention every rAF has uncontrolled observer overhead.
- Zoom pointerdown was outside viewport; cancellation was synthetic with immediate collection.
- Null samples omitted from summaries and percentile(0) indexed-1.

Retained bounded observations: a local group translation changed over sustained input without source mutation; one offcanvas move changed saved source and committed polygon but outline processing failed. No cause is assigned to the sustained no-commit outcome. No distribution or physical presentation claim is supported.

The new run must freeze its producing script and hashes, capture status/error, validate the hit target, correlate the final source/revision and distinguish no-request/error/timeout/success.

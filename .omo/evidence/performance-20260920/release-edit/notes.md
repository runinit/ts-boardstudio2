# Release source-edit regression

Scope: first movement/rotation creation of placement.override only.

Hypotheses distinguished by focused instrumentation:
1. Sequential at/fixed edits parse an intermediate YAML document: count real parseDocument calls.
2. YAML document cloning adds redundant work beyond parsing: count real Document.clone calls.
3. Solver work accounts for the measured source-edit delay: source-edit counters are captured before resolveLayout, separating edit from pose verification.

Artifacts: permanent focused regression test and minimal production edit; evidence logs retained here. No background process, port, installed-package mutation, or temporary source instrumentation.

The parent coordinates broader browser QA and benchmark work. This worker runs only focused tests and scoped lint/format checks.

## Result

- RED: `red.log` observes 2 real YAML parses and 5 real document clones for both first movement and rotation; exact YAML and pose checks passed before cost assertions.
- GREEN: `green.log` records 21 passing tests across layoutSource.performance, layoutSource, designSource. New budgets require 1 parse and at most 3 clones, using real implementation wrappers.
- First flow-mapping characterization is in `characterization-flow.log`: batching intentionally changes only whitespace inside the newly generated override; existing source remains untouched.
- Scoped Prettier completed for both owned files. Automatic LSP timed out on the test file during intermediate edits; parent owns final precommit/typecheck and browser QA.
- No resources remain running. No cache, installed package, UI, or unrelated source edits.

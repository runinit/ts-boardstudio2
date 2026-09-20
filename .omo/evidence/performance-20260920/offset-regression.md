# Offset regression fix

Owned source: `engine/src/designs/geometry.js`; existing regression tests remain unchanged by this subtask. The caller's performance test still requires at most seven outline calls and the three existing hashes.

## Mechanism and minimal fix

MakerJS 0.18.1 `expandPaths` deletes `combineOptions.farPoint` between path unions. The inherited property keeps the explicit intersection ray available after deletion. Applying this behavior to every direct outline call changes expansion geometry and eventually fragments the splayed cavity. Extent validation alone cannot detect that fragmentation.

The final implementation retains the inherited ray for direct contractions, preserving the optimization that avoids closing retries, while retaining the original own-property options for direct expansions. Repair-step behavior is unchanged. This is a narrow regression fix, not a proof of universal numerical robustness in MakerJS.

## Hypotheses and experiments

1. Negative contraction was responsible: refuted. Positive-only inherited ray still produced two cavity regions and regressed to nine performance calls (`offset-regression-positive-only.log`).
2. Positive direct expansion changed geometry accepted by extent-only validity: confirmed by switching positive calls back to baseline options, which restores a single cavity and preserves seven calls (`offset-regression-negative-only.log`, final log).
3. Runtime dependency mismatch: trace used `engine/node_modules/makerjs`, matching the engine's pinned 0.18.1 dependency. No installed dependency was edited.

The library trace (`offset-regression-trace.log`) records the all-retained-ray sequence. Its eighth call expands a one-component model by 2.5 mm into two components while retaining expected bounds. Earlier calls have matching bounds and component counts under both rays, but this does not establish identical path coordinates or ordering. A topology-guard experiment also passed (`offset-regression-topology.log`), but was removed to keep this increment limited to the existing expansion contract.

## Reproducible validation

Runtime: `/home/chris/.nvm/versions/node/v24.14.0/bin` prepended to PATH.

Invocation for both red and final focused suite:

```sh
PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH npm_config_what=native_outline_offset,rounding pnpm --dir engine test
```

| Criterion | Scenario and binary observable | Artifact |
| --- | --- | --- |
| Reproduce regression | `rounds a splayed matrix cavity into closed contours`; exit 1, 4 passing / 1 failing, found 2 regions | `offset-regression-red.log` |
| Fix cavity without changing export expectations | Same invocation with final source; exit 0, all 5 tests pass, including single connected cavity and strict option deletion | `offset-regression-final.log` |
| Preserve exact paths, SVG, DXF | Native notched matrix test checks existing SHA256 values `55512e…`, `e20e55…`, `19ebb8…`; all assertions pass | `offset-regression-final.log` |
| Seven real outline invocations | Execute native notched matrix test through a minimal Node driver wrapping MakerJS outline and collecting distance/inside; three hash assertions pass and exactly 7 calls | `offset-regression-count.log` |
| Source scope | Final diff only alters direct option selection and explanatory comment; inherited-ray helper/repair path unchanged; test's existing caller change is <=7 | `offset-regression-final.diff` |

Full engine suite, browser validation, and wall-clock benchmark belong to the root executor and are not claimed here. No temporary debug source, dependency modifications, or processes remain. Existing shared `.debug-journal.md` retained for root cleanup.

Exact count-driver invocation (from repository root):

```sh
PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH node .omo/evidence/performance-20260920/offset-regression-count.cjs
```

The retained `.cjs` driver is evidence infrastructure only and is not imported by production or tests.

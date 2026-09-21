# Todo 1 baseline report

Status: **complete**. The timeout-safe measurement harness completed one warm-up and five measured repeats. The recorded base SHA was `64bfc2e84dc871b191d237fbd3d759f67fc05a76`, with the batching candidate present during this diagnostic run; all 51 expected timing records were captured with zero benchmark errors. The artifacts are not a clean delivered-branch baseline.

## Environment and execution receipts

| Item | Recorded value | Evidence |
| --- | --- | --- |
| Node | v24.14.0 (`/home/chris/.nvm/versions/node/v24.14.0/bin/node`) | `environment.log` |
| pnpm | 11.26.0 | `environment.log` |
| Playwright | 1.59.1 | `environment.log` |
| Chromium | 147.0.7727.15 from retained trace metadata | `baseline-final-run/.../trace.zip` |
| SHA | `64bfc2e84dc871b191d237fbd3d759f67fc05a76` | `warmup-final.exit`, `baseline-final.exit` |
| Fixture | native 10 columns × 6 rows, 60 keys, LED enabled; SHA256 `e2bb88e1cf3cd9796ff235e13d3be87e6df1f4e3f637d867fc920fa0c886213a` | `warmup-final/initial-source.yaml`, `baseline-final/initial-source.yaml` |
| Build/install | frozen install and fresh build exit 0 | `install.exit`, `build.exit`, `environment.log` |
| Preview port | 4184; 4185 was initially occupied by a separate native worker and was free during final cleanup | `warmup-final.exit`, `baseline-final.exit`, `task-1-final-cleanup.log` |

The measurement-only harness change makes the existing Playwright timeout configurable through `PERF_TIMEOUT_MS`, retaining the 600,000 ms default. It does not alter assertions or product behavior. The measured invocation was:

```sh
export PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH
export PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never PERF_TIMEOUT_MS=1800000
export PERF_OUTPUT=../.omo/evidence/performance-responsiveness-refactor/baseline-final
export PERF_COLUMNS=10 PERF_NATIVE_ROWS=6 PERF_LED=1 PERF_REPEATS=5
pnpm --dir app exec playwright test e2e/studio-performance.spec.ts \
  --workers=1 --retries=0 --timeout=1800000 \
  --output=../.omo/evidence/performance-responsiveness-refactor/baseline-final-run \
  --trace=on --reporter=list
```

The warm-up used the identical command with `PERF_REPEATS=1`, `PERF_OUTPUT=.../warmup-final`, and `--output=.../warmup-final-run`. Warm-up passed in 3.5 minutes. The measured run passed in 12.2 minutes. Its retained trace is 266,972,432 bytes.

## Measured baseline

Settled latency is the end-to-end action result used for comparison. p95 is the higher observed sample at n=5. Long-task counts and maxima come from the retained browser performance records.

| Action | Samples | Settled median ms | Settled p95 ms | Long tasks | Max long task ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Nudge | 5 | 9,726.1 | 12,351.6 | 12 | 491.0 |
| Drag | 5 | 11,505.7 | 12,560.3 | 12 | 442.0 |
| Add columns | 5 | 16,698.5 | 26,795.8 | 5 | 13,978.0 |
| Remove columns | 5 | 9,397.6 | 10,943.9 | 5 | 387.0 |
| Add rows | 5 | 21,872.8 | 22,356.3 | 5 | 8,174.0 |
| Remove rows | 5 | 10,297.0 | 11,151.6 | 6 | 389.0 |
| Remove key | 5 | 12,929.9 | 12,962.5 | 5 | 4,083.0 |
| Add key | 5 | 13,443.6 | 13,599.2 | 5 | 4,522.0 |

Matrix resize preparation records: 10 samples, median 4,465.2 ms, p95 4,880.2 ms. The dominant measured path is matrix growth and outline preparation: row growth has the highest settled median, while column growth has the highest p95 and longest task. Nudge and drag have lower input-to-visible timings but remain outline-settle bound.

The raw result file contains `results.length === 51` and `errors.length === 0`. `timing-summary-final.json` is the independently generated summary. Source snapshots, worker packets, screenshots, and the retained Playwright trace are present under `baseline-final/` and `baseline-final-run/`.

## Invalid fixture diagnostic

The required failure scenario used `invalid-missing-matrix.yaml` with the same benchmark and `PERF_REPEATS=1`. It exited 1 because the page contained zero of the expected 60 key buttons. The retained error context and Playwright trace show the fixture was rejected before action measurement; this is the expected nonzero diagnostic.

## Comparison rule and handoff

For post-change comparisons, improvement requires at least a 15% median reduction, p95 no worse than 10%, and no new long task, using this same fixture, environment, and warm-up exclusion. This complete run was captured before the batching candidate was omitted, so it is diagnostic evidence only and does not support a delivered-branch improvement claim.

## manualQa

### surfaceEvidence

| scenario id | criterion reference | surface | exact invocation | verdict | artifactRefs |
| --- | --- | --- | --- | --- | --- |
| T1-S1 | Todo 1: repeatable baseline | browser UI / Playwright | `PERF_REPEATS=1 ... pnpm --dir app exec playwright test e2e/studio-performance.spec.ts --workers=1 --retries=0 --timeout=1800000 --trace=on --reporter=list` | PASS | `A1`, `A2` |
| T1-S2 | Todo 1: five measured repeats | browser UI / Playwright | `PERF_REPEATS=5 ... pnpm --dir app exec playwright test e2e/studio-performance.spec.ts --workers=1 --retries=0 --timeout=1800000 --trace=on --reporter=list` | PASS | `A3`, `A4`, `A5` |
| T1-S3 | Todo 1: source and worker evidence | browser UI / retained files | inspected `baseline-final/timings.json`, `worker-packets.json`, per-action `*-source.yaml`, screenshots, and retained `trace.zip` | PASS | `A5`, `A6` |

### adversarialCases

| scenario id | criterion reference | adversarial class | expected behavior | verdict | artifactRefs |
| --- | --- | --- | --- | --- | --- |
| T1-A1 | Todo 1 failure run | invalid fixture | Benchmark exits nonzero and retains diagnostics when the matrix field is missing | PASS | `A7`, `A8` |
| T1-A2 | Todo 1 stale-state guard | fresh context / zero retries | Run uses one worker, zero retries, a fresh Playwright context, and completes all assertions | PASS | `A3`, `A4`, `A5` |
| T1-A3 | Todo 1 cleanup | process leakage | Owned preview/test processes close and ports are verified after the run | PASS | `A9` |

## Artifact references

| id | kind | description | path |
| --- | --- | --- | --- |
| A1 | browser log | Warm-up command, server startup, and pass output | `.omo/evidence/performance-responsiveness-refactor/warmup-final.log` |
| A2 | exit ledger | Warm-up exit 0, SHA, port, timestamp | `.omo/evidence/performance-responsiveness-refactor/warmup-final.exit` |
| A3 | browser log | Five-repeat command and pass output; exit 0 after 12.2 minutes | `.omo/evidence/performance-responsiveness-refactor/baseline-final.log` |
| A4 | exit ledger | Measured exit 0, SHA, port, timestamp | `.omo/evidence/performance-responsiveness-refactor/baseline-final.exit` |
| A5 | timing JSON | 51 records, zero errors, per-action timing and long-task data | `.omo/evidence/performance-responsiveness-refactor/baseline-final/timings.json` |
| A6 | summary JSON | Recomputed medians, p95, long-task totals, fixture and comparison rule | `.omo/evidence/performance-responsiveness-refactor/timing-summary-final.json` |
| A7 | failure log | Invalid missing-matrix fixture nonzero diagnostic | `.omo/evidence/performance-responsiveness-refactor/invalid-run.log` |
| A8 | failure trace | Retained Playwright trace and error context for invalid fixture | `.omo/evidence/performance-responsiveness-refactor/invalid-run-artifacts/` |
| A9 | cleanup receipt | Port/process cleanup verification after final measured run | `.omo/evidence/performance-responsiveness-refactor/task-1-final-cleanup.log` |

## Cleanup and DoneClaim

The final browser run left ports 4184 and 4185 free, with no owned browser or preview Node processes. No further source changes were made for Todo 1; the existing Todo 3 source edits and the measurement-only timeout line remain in the shared worktree.

DoneClaim: Todo 1 baseline, required invalid-fixture diagnostic, complete timing summary, and cleanup receipt are complete. The result is ready for parallel implementation workers.

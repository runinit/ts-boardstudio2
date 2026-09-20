# OMO workspace artifacts

This directory is tracked so research, plans, and validation evidence travel
with the repository between development machines.

- `ulw-research/`: research reports, source ledgers, probes, and supporting assets.
- `ulw-loop/`: workflow briefs, goals, and evidence ledgers.
- `teams/`: recorded team assignments and handoffs.
- `evidence/`: test output, browser captures, traces, and review records.
- `commit-validation.md`: validation notes for the performance commits.

## Continuing on another machine

Pull the commits, install the repository dependencies, and configure OMO on that
machine. Read the relevant workflow brief, goals, ledger, and report before
continuing. These files preserve context; they do not recreate live agents,
browser sessions, or the coding tool's native session state.

Historical records and probes may contain `/home/chris/...`, `/tmp/...`, local
file URLs, process IDs, and session IDs from the originating machine. Treat
those as provenance. Adapt a copy of a probe to the new checkout and follow its
reproduction notes; preserve the original evidence and hashes. Relative report
links work when their referenced artifacts remain together.

Keep credentials, environment secrets, dependency installations, and temporary
runtime files out of this directory. Retained screenshots and traces are part
of the evidence archive.

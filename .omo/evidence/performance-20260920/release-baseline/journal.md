# Release CPU profile journal

Read-only production bundle. Artifacts owned in this folder: probe.cjs, release.cpuprofile, raw.json, after.png, fixture.yaml, server.log, attribution.json, report.md, cleanup.json. Temporary processes: owned vite preview port 4181; Playwright browser/context. Both closed in finally. Evidence artifacts retained as requested.

Hypotheses: H1 synchronous engine/YAML transformation dominates release (sample stacks before source save); H2 React/render/layout dominates release (React/layout stacks); H3 worker latency dominates committed geometry (low main-thread busy time, request/reply timestamps dominate). Profile and timestamp probes distinguish them. No production changes or rebuild.

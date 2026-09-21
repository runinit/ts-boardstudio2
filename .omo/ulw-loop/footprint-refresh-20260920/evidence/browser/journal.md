# Browser baseline capture
Scope: existing built app only; NOT final acceptance for ongoing source changes.
Read visual-qa and debugging Playwright references, app/AGENTS.md.
Artifacts retained in this directory: baseline provenance, headed Playwright screenshots, browser action log, tracing, preview log, capture harness.
Owned process: upcoming Vite preview on uniquely assigned 127.0.0.1:43179, stopped after capture; no rebuild.

## Baseline run completed
- Existing build: app version 0.20.0, engine UI version 6.0.0-develop; app/dist/index.html timestamp 2026-09-20 14:49:35 -0400. Checksums retained in baseline-version.txt. No build/staging commands run.
- Preview: cwd app; Node v24.14.0 node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 43179 --strictPort. PID 2087084; tool session 94812.
- Runtime: headed Chromium through xvfb-run, fresh browser context, service workers blocked. Source seed is a minimal native YAML project and does not modify user's project storage.
- Main harness: baseline.cjs. Execute from repository root with `xvfb-run -a /home/chris/.nvm/versions/node/v24.14.0/bin/node .omo/ulw-loop/footprint-refresh-20260920/evidence/browser/baseline.cjs` while preview runs.
- Surfaces: ceoloide switch_choc_v1_v2, switch_mx, mcu_nice_nano; each 2D preview and expanded Parameters & source settings at widths 1280, 768, 375, height 900. 18 PNGs and trace retained. actions.json records exact visible text, viewport and document overflow. capture-validation.json verifies every PNG signature and dimensions.
- Readiness correction: initial capture saw transient zero pads because pad summary exists during inspection. Main harness now waits for Inspecting footprint to disappear AND nonzero pad count; all 18 baseline captures replaced with settled output.
- Observed native library counts: Choc 8 pads, MX 7 pads, nice!nano 24 pads. These include mechanical pads; not electrical pin counts.
- No page errors or failed requests in completed action log; document scroll width equals viewport width in all captures.

## Known baseline deficiencies / final acceptance scenarios
- Settings are buried under Parameters & source. Boolean options including reversible appear as raw text boxes rather than checkboxes; side is a free-text field rather than a bounded choice. Compare new promoted Footprint settings controls and typed validation.
- Pads & nets shows Defined by body(p) rather than precise parameter identity for bundled generators. Check distinct FROM/TO and MCU mappings against actual output, not this label alone.
- Inspector has horizontal overflow (visible inner scrollbar at desktop/mobile), although document itself does not overflow. Keep new settings within the drawer and retain access to Close inspector at 375 px.
- MCU options require lengthy scrolling through pads and raw fields. Final UI should permit direct settings discovery and preserve readable labels.
- Final e2e owner uses imported Settings.js for deterministic side/reversible/width -> generated pad count -> save/reopen checks (app/e2e/footprint-parameters.spec.ts). Final real-bundled scenarios should additionally toggle Choc/MX/MCU side/reversible, verify regenerated copper/net output and reload saved defaults at all three widths.
- This is old-build baseline evidence, explicitly NOT final visual approval, fabricated-board proof, or acceptance of currently edited source.

## Cleanup
Browser contexts, traces and headed Chromium close in harness finally blocks. Preview PID 2087084 stopped after capture. No product files/test specs changed by this task.

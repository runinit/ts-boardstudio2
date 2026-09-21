# Wiring browser harness correction

Changed only app/e2e/footprint-wiring.spec.ts. Monaco's actual YAML model.setValue now sends exact multiline source through its normal onChange handler. The test visits Design to inspect the current-layout status, because Export correctly displays preview status instead. Source equality, immediate disabled export, current analysis, RAW_BREAK finding and repaired enabled export assertions remain.

Validation: scoped Prettier/ESLint pass; isolated Chromium test on port 3078 passes (1 test, 7.3 s). Log: run.log. Screenshots in results/footprint-wiring-blocks-a--2a64f-estores-export-after-repair-chromium/. Both images were opened and inspected: broken state shows RAW_BREAK finding and disabled PCB downloads; repaired state shows current-project output and enabled downloads. No clipped finding in desktop view.

Playwright cleaned up the port-3078 preview process. Root port 3074 was not touched. No production edits or commits.

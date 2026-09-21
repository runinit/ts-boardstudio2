# KiCanvas numeric pad browser proof

PASS for the scoped parser/lookup/label behavior at source HEAD `98398de14820d7e8435b8901f992ed48e73e65fb`.

A real Chromium page loaded `app/dist/dependencies/kicanvas.js` through `kicanvas-embed`, using a PCB produced by native `engine.process` with a test-only injected footprint. The retained PCB contains unquoted numeric pad tokens 1, 2 and 0 plus quoted 01, A1, empty and 3 controls. No parser mock or board text rewriting was used.

The actual viewer's parsed pad numbers exactly match those identifiers as strings. Every pad retains its distinct signal net and resolves to itself through `pad_by_number`. The source DOM text remains byte-identical to the generated input. Final screenshot visually displays all seven pads and appropriate labels; empty pad has no identifier label, as intended.

Bundle SHA-256: `cbf7a578f3c825c1838f6d29274d79ce06c72208a34476e86b526cbf68ef92c2`.

`result.json` records the load event, mappings, source hash and network observations. The pre-existing template placeholder request `/$$:0:$$` returns 404; no page errors occurred. Isolated harness lacks the app's fonts, so viewer icon names appear as text; no claim of integrated application styling is made.

First screenshot preceded compositor completion; the harness now waits one second before capture. Fixture pads were centered inside the outline so every control is visible. These were harness-only changes. Final image was inspected after recapture.

`cleanup.json` confirms Chromium and the HTTP server on port43183 are closed. No app/test-results files or product sources were changed.

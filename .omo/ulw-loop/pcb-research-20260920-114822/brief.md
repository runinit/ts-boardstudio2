# PCB footprint and net connectivity investigation

Status: awaiting required deliverable-format answer before wave 1.

Core question: Why do Board Studio PCB outputs lose expected footprint pads or fail to populate correct KiCad nets when users define a matrix and add diodes, LEDs, and MCUs?

Priority: electrical connectivity first, missing pads second. Separate net assignment, ratsnest display, and copper routing.

Research axes: matrix net intent; app configuration serialization; component defaults; footprint catalogue/staging; footprint pad emission; engine net registry; native PCB compilation; legacy PCB compilation; switch/diode topology; LED connectivity; MCU pin assignments; KiCad file semantics; viewer versus exported file; regression coverage and reproduction; skeptical end-to-end verification.

Sources: local app/engine/footprints, executed reproductions, official KiCad and upstream generator documentation/source. Lifecycle: research team then refinement team. No findings established yet.

Proposed report: English, approximately 6–10 pages plus evidence appendix; executive diagnosis, reproductions, pad/net pipeline diagram, verified causes with file/line citations, prioritized remedies and regression cases, unresolved questions. Numbered sources and linked execution artifacts. Formats pending user choice: PDF+DOCX baseline, Markdown engineering report alternative.

Format approved: Markdown (user reply). Research only; no product edits or commits. Current HEAD 347229abc1561a44a2dc6cc0cee50969b49b267e with pre-existing staged and unstaged edits. Runtime available: Node 24.14.0 at /home/chris/.nvm/versions/node/v24.14.0/bin/node; default shell Node 22 is below repository requirement. KiCad CLI not on PATH.

Hypotheses: H1 app assembly omits/overwrites intended component net parameters; H2 footprint variants or staging omit expected pads; H3 engine serialization loses net identity or pad membership; H4 viewer hides correct exported connectivity; H5 configured topology is incomplete despite valid serialization. Distinguish each by comparing authored document, compiled footprint parameters, exported S-expressions, and viewer evidence.

# Intent versus observed reality

|Intent|Expected truth|Observed reality and difference|Invariant/status|Evidence|Claims|
|---|---|---|---|---|---|
|I1|Prompt continuous mouse motion|Three valid instrumented drags show first observed preview23.9–34.5ms; release has ~100ms main-thread tasks. Native sustained presentation unmeasured.|Unknown against unspecified human responsiveness budget|verify-drag-final.md|C-DRAG-RUNTIME,C-RENDER,C-POINTCACHE|
|I2|Exact drop/snap without lost edits|Three source/request/success chains agree. Re-grab spacing and disconnected-outline errors observed. General multi-selection/capture correctness not proven.|Scoped source preservation true; broad guarantee unknown|verify-drag-final.md; S01/S02|C-DRAG-RUNTIME,C-CAPTURE|
|I3|Bounded outline recomputation|Source lacks persistent cross-edit geometry reuse; warm outline 7.62–7.89 s on difficult fixture and 240-path expansions dominate. Snapshot-following analysis626ms, no measured avoidable overhead.|Violated for dependency-bounded cross-edit reuse: no persistent cross-edit geometry cache; latency alone is not this proof|outline-repeat.json|C-OUTLINE-REPEAT,C-EXPANSIONS,C-FREEZE|
|I4|Only latest revision publishes|Source guards and revision gates inspected; final-source correlation verified for3single-request runs. Full supersession race not proven.|Scoped agreement true; broad concurrency unknown|S03/S04/S05; verify-drag-final.md|C-QUEUE,C-CANCEL,C-DRAG-RUNTIME|
|I5|Faster changes preserve geometry/exports|Named profile paths/SVG/DXF/bounds/contours match staged/frozen routes. No replacement kernel or optimization implemented.|Existing tested scope true; alternatives unknown|outline-repeat.json; precision-contract digest|C-PRECISION,C-KERNEL,C-OUTLINE-REPEAT|
|I6|Reproducible ranked recommendations|Frozen corrected producers, hashes and raw outputs archived; invalid prior comparisons excluded. Independent refinement and visualQA underway.|Final delivery pending|REPRODUCE.md; source-ledger.md; correction notes|All measurement/methodology nodes|

Intent sources: user's request for fast mouse dragging and outline generation, approved Markdown format, and repository correctness safeguards. Observed_at:2026-09-20; valid_at: archived staged-source/dist hashes. No arbitrary latency target is treated as user requirement.

# Drag and outline speed research
Started UTC: 2026-09-20T15:43:53Z
User: "$omo:ulw-research look into mouse drag issues and outline speed, we want this to be fast!"
Format gate: user answered "Markdown". Binding deliverable: Markdown engineering report, measured bottlenecks, reproducible benchmarks, ranked fixes, citations and evidence appendix. No implementation requested in this research turn; preserve existing staged performance patch and unrelated guides.
Core question: What still makes actual mouse dragging and current outline generation slow or unreliable, and which verified changes offer the largest safe improvements?
Expected truths: continuous dragging follows input without large stalls; release commits exactly once without snap-back/lost edits; outline work is bounded by changed geometry and latest revision; export/curves/ownership/undo remain correct; claims separate measured findings from proposals.
Scale:15 axes across local code/runtime, official browser/React docs and pinned OSS geometry/editor sources. Research team then independent refinement team; max15members+root. CPU-heavy benchmarks serialized.
Current base HEAD347229abc1561a44a2dc6cc0cee50969b49b267e, staged tree348e0e5f520a45268ba80a01f90627f8a0f575d8. Previous evidence: .omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1. Old measurements are historical; reconfirm current code/fixtures.

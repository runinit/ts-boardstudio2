# Claim graph
## Verified claims digest
No high-risk non-code assertion is made. Normative API claims use documented primary-source exceptions; runtime claims below are scoped to executed code and artifacts.
## Nodes
Required fields: claim_id; statement; type; risk; scope; intent_ids; supporting/contradicting observations; independent observation groups; convergence; counter-search; primary backing; dependencies; status; synthesis location.

## C-RFC-INVALID
Statement: supplied ReactRFC SHA permalink is usable evidence. Type: citation integrity; risk high; scope external; intent I6; support none; contradiction O-O-01 HTTP404; independent group directfetch; convergence refuted; countersearch official docs replacement; primary backing absent for URL; dependencies none; status refuted; synthesis correction annex.

## C-DRAG-SOURCE
Statement: moving events update local Canvas state, not YAML per move. Type code; risk normal; scope current staged tree; intents I1,I2; support O-S01,O-S02; contradiction none; independent groups local-source only (primary-only code-reading exception); convergence source supported, runtime cost unresolved; countersearch release path distinguished; primary StudioCanvas.tsx/studioMove.ts; dependencies none; status supported; synthesis drag lifecycle.
## C-CAPTURE
Statement: absent explicit capture release after up/cancel is not by itself a defect. Type API semantics; risk normal; scope PE3; intent I2; support wave-2-pointer_capture.md; contradiction initial suspicion; group W3C primary-only normative exception; convergence supported for required behavior, project browser matrix untested; dated WPT external evidence exists; countersearch explicit early release differs; primary PE3 section9.5; dependencies none; status supported; synthesis corrections.
## C-PRIOR-RATIO
Statement: prior engine 46.056/7.759 gives clean matched-harness speedup. Type performance; risk high; scope historical a1; intent I6; support prior report; contradiction wave-1-skeptic_final.md; group direct harness audit; convergence refuted; countersearch instrumentation/warmup/endpoints differ; primary local scripts; dependencies none; status refuted; synthesis evidence limits.
## C-RAF
Statement: adding rAF improves local drag latency. Type performance hypothesis; risk high; scope current browser; intent I1; support source opportunities only; contradiction browser may already coalesce/add frame; groups none; convergence pending runtime; countersearch O skeptic; primary none; dependencies K; status unresolved; synthesis ranked experiments.
## C-KERNEL
Statement: replacing MakerJS preserves geometry and improves speed. Type performance/compatibility hypothesis; risk high; scope outlines; intents I3,I5; support alternatives sources only; contradiction analytic curves/tolerance/export contract; groups source family and precision analysis; convergence unresolved; countersearch I/M; primary no local execution; dependencies L,H,I; status unresolved; synthesis deferred architecture.

## C-RENDER
Statement: Every Canvas render rebuilds base point strings while React owns transient group translation.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I1,I2. Supporting observations: O-S01,O-S11. Contradicting observations/countersearch: B no-transform allegation retracted by root. Independent observation groups: source family in sources.json (same family counts once); primary backing: S01,S11. Convergence: source-supported. Dependencies: cited sources; status: supported; synthesis location: Drag path.

## C-CAD-GATE
Statement: CAD cancels/gates ordinary context auto-generation.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I1,I3. Supporting observations: O-S10. Contradicting observations/countersearch: Duplicate-generation suspicion refuted. Independent observation groups: source family in sources.json (same family counts once); primary backing: S10. Convergence: source-supported. Dependencies: cited sources; status: supported; synthesis location: Corrections.

## C-CANCEL
Statement: Queue remains reusable after cancel; no terminal flag/ref clear there.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I4. Supporting observations: O-S03,O-S04. Contradicting observations/countersearch: Initial terminal-queue allegation retracted; the narrower grace-timer lifecycle is executed under C-GRACE below. Independent observation groups: source family in sources.json (same family counts once); primary backing: S03,S04. Convergence: source-supported. Dependencies: cited sources; status: supported; synthesis location: Corrections.

## C-QUEUE
Statement: Single inflight/replaceable pending,180ms settle,1000ms termination grace and acceptance gates.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I4. Supporting observations: O-S04,O-S05. Contradicting observations/countersearch: Timers are not latency guarantees. Independent observation groups: source family in sources.json (same family counts once); primary backing: S04,S05. Convergence: source-supported. Dependencies: cited sources; status: supported; synthesis location: Outline path.

## C-TERMINATE
Statement: Hard worker termination can abort current script; revision guards protect acceptance separately.
Type: API; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I4. Supporting observations: O-S16. Contradicting observations/countersearch: Cooperative message handling does not preempt synchronous stages. Independent observation groups: source family in sources.json (same family counts once); primary backing: S16. Convergence: primary-only normative exception. Dependencies: cited sources; status: supported; synthesis location: Outline path.

## C-SERIALIZE
Statement: Worker message delegates to MessagePort serialization and queued delivery.
Type: API; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I4. Supporting observations: O-S16,O-S17. Contradicting observations/countersearch: Corrected Window-vs-Worker algorithm attribution. Independent observation groups: source family in sources.json (same family counts once); primary backing: S16,S17. Convergence: primary-only normative exception. Dependencies: cited sources; status: supported; synthesis location: Methodology.

## C-CACHE
Statement: One-shot scene+config/assets cache differs from cross-edit caching.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I3,I5. Supporting observations: O-S07. Contradicting observations/countersearch: Identity-key improvement has no measured proof. Independent observation groups: source family in sources.json (same family counts once); primary backing: S07. Convergence: source-supported. Dependencies: cited sources; status: supported; synthesis location: Outline path.

## C-FREEZE
Statement: Freeze representation rewrite changes outline key; snapshot-following analysis is measured; avoidable cache-miss cost is unmeasured.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I3. Supporting observations: O-S05,O-S06,O-S07,O-L-REPEAT. Contradicting observations/countersearch: Key miss does not establish equally expensive duplicate computation. Independent observation groups: source family in sources.json (same family counts once); primary backing: S05,S06,S07. Convergence: source-supported; immediate analog626.20ms, no matched counterfactual. Dependencies: cited sources; status: supported; synthesis location: Outline path.

## C-MAKERJS
Statement: Incremental path expansion unions and intersection classification are source-visible cost candidates.
Type: algorithm; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I3. Supporting observations: O-S08,O-S18,O-S19. Contradicting observations/countersearch: Atlas pruning reduces candidate set; asymptotic shape is not local timing. Independent observation groups: source family in sources.json (same family counts once); primary backing: S08,S18,S19. Convergence: primary-only implementation exception. Dependencies: cited sources; status: supported; synthesis location: Outline path.

## C-PRECISION
Statement: Different tolerances and local simplification do not establish global original-shape error guarantee.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I5. Supporting observations: O-S08,O-S09. Contradicting observations/countersearch: No claim that concrete exported fixture violates clearance. Independent observation groups: source family in sources.json (same family counts once); primary backing: S08,S09. Convergence: source-supported. Dependencies: cited sources; status: supported; synthesis location: Geometry correctness.

## C-POLYGON
Statement: clipper2-ts supplies polygon boolean/offset APIs with approximation/numeric conversion requirements.
Type: API; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I5. Supporting observations: O-S20,O-S21. Contradicting observations/countersearch: Not analytic-curve preserving and no local speed proof. Independent observation groups: source family in sources.json (same family counts once); primary backing: S20,S21. Convergence: primary-only library contract exception. Dependencies: cited sources; status: supported; synthesis location: Geometry correctness.

## C-EDITORS
Statement: tldraw caches geometry; Excalidraw ordinary drag differs from its visual override API.
Type: code; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I1. Supporting observations: O-S22,O-S23. Contradicting observations/countersearch: Override does not prove default preview-only/rAF architecture. Independent observation groups: source family in sources.json (same family counts once); primary backing: S22,S23. Convergence: primary-only implementation exception. Dependencies: cited sources; status: supported; synthesis location: External editors.

## C-REACT
Statement: Transitions/external-store API semantics do not establish a local performance fix.
Type: API; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I1,I6. Supporting observations: O-S14,O-S15,O-S26. Contradicting observations/countersearch: Same React project provenance, no independent benchmark. Independent observation groups: source family in sources.json (same family counts once); primary backing: S14,S15,S26. Convergence: primary-only API exception. Dependencies: cited sources; status: supported; synthesis location: External editors.

## C-MEASURE
Statement: Continuous pointermove excluded from Event Timing; rAF DOM observation differs from physical presentation.
Type: API/methodology; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I6. Supporting observations: O-S13,O-S24,O-S25. Contradicting observations/countersearch: LoAF threshold misses shorter jank; automation differs from hardware. Independent observation groups: source family in sources.json (same family counts once); primary backing: S13,S24,S25. Convergence: primary-only specification/tool exception. Dependencies: cited sources; status: supported; synthesis location: Evidence limits.

## C-POINTCACHE
Statement: Cache base polygon points/isolate transforms as first bounded rendering experiment.
Type: recommendation; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I1,I2. Supporting observations: O-S01,O-S11. Contradicting observations/countersearch: No measured intervention; item identity may change. Independent observation groups: source family in sources.json (same family counts once); primary backing: S01,S11. Convergence: provisional recommendation, not speed claim. Dependencies: cited sources; status: partial; synthesis location: Ranked experiments.

## C-DEPENDENCY
Statement: Cross-edit cache requires exact geometry/recipe/asset dependency invalidation.
Type: recommendation; risk: normal; scope: staged repository or linked pinned/API source as applicable; intent_ids: I3,I5. Supporting observations: O-S06,O-S07,O-S08. Contradicting observations/countersearch: Stale output can be worse than latency; no implementation validation. Independent observation groups: source family in sources.json (same family counts once); primary backing: S06,S07,S08. Convergence: provisional design requirements. Dependencies: cited sources; status: partial; synthesis location: Outline path.

## C-K-DIAGNOSE
Statement: first diagnosis is a valid repeatable commit-latency benchmark. Type performance; risk high; scope initial browser raw; intent I6; support raw source/DOM events only; contradiction no commit on sustained path and script changed after run; independent group actual Chromium operational trace; convergence refuted as benchmark; countersearch O inspected script/raw path mismatch; primary artifacts/drag-diagnose.json; dependencies none; status refuted; synthesis limits.

## C-OUTLINE-PROFILE
Statement: on exact60key+3mm fixture, closing/outline dominates diagnostic time; validation is much smaller. Type measured profiling; risk high; scope Node24.14 MakerJS0.18.1 temporary current engine, one warm instrumented sample; intent I3,I6; support O-L-RUNTIME artifacts/outline-profile.json and O-L-REPEAT; dependency C-OUTLINE-REPEAT; contradiction nested wrappers not additive and overhead uncontrolled; independent group executed engine (primary-only direct measurement exception); convergence completed with repeated uninstrumented runs; diagnostic attribution remains instrumented; countersearch snapshot pass611.78ms and validation94.87ms, so freeze miss/validation not equally costly; primary producer script and raw; dependencies fixed fixture; status supported with scope; synthesis Current measurements.

## C-DRAG-RUNTIME
Statement:3 fresh synthetic bounded drags commit source and receive correlated worker success; first preview23.9–34.5ms, post-release polygon157.6–164.9ms, successreceipt3228.6–3309ms. Type measured; risk high; scope currentdist Chromium147 onefixture with observer; intents I1,I2,I4,I6; support O-K-FINAL and O-O-audit; contradiction physicalpaint/end-to-endvisible publication not measured, observeroverhead unknown; independent groups execution+independent raw audit (one experiment, not two datasets); convergence scoped; countersearch initial invalidtrace rejected and finalsource correlation checked; primary raw+frozenproducer; dependencies fixedfixture/currentdist; status supported within scope; synthesis measurements.

## C-OUTLINE-REPEAT
Statement: three warm uninstrumented prepared outline calls took7621.31/7798.75/7887.09ms; immediate freeze-following analysis626.20ms excluding freeze/outline/solve; exact namedprofile parity. Type measured; risk high; scope Node24.14/MakerJS0.18.1 exact movedfixture; intents I3,I5,I6; support O-L-REPEAT; contradiction no fullengine/PCB equality, no cachecounterfactual; independentgroup executed engine, primary-only directmeasurement exception; convergence supported within scope; countersearch independent refine_outline_evidence reviewed producer/raw and narrowed endpoints; primary artifacts/outline-repeat.*; dependencies archivedbaseline/movedsource; status supported; synthesis measurements.
## C-EXPANSIONS
Statement: three distinct240path expansions take1.86/1.84/1.96s in separate diagnostic. Type measured diagnostic; risk high; scope samefixture, instrumentation; intent I3; support O-L-REPEAT; contradiction distinctdistances, not identicalmemo miss, no measuredcandidate speedup; independentgroup engineprobe; primary-only measurement exception; countersearch raw9calls and code fallback branches; convergence supported; primary outline-repeat diagnosticOnly; dependencies C-OUTLINE-REPEAT; status supported; synthesis outlinepriority.

C-FREEZE update: following snapshot analysis now measured626.20ms by immediate pipeline analog, but avoidable cache-miss overhead remains unmeasured. Status supported for key change and timing scope. C-CANCEL update: ref remains reusable; narrower stalegrace timer defect confirmed in C-GRACE-REUSE, broad cancellation guarantee not asserted.

## C-GRACE-REUSE
Statement: disposing during grace leaves a truthy cleared handle, so later reused-queue supersession can skip forced termination. Type executed defect; risk high; scope actual StudioQueue with fake workers/real timers, Node22+24; intents I4,I6; support O-GRACE; contradiction queue is still schedulable, no frequency/wastedCPU claim; groups one executed provenance group with freshqueue control and Node-version rerun; primary-only direct-measurement exception (not full browser); convergence confirmed; countersearch freshcontrol terminates while reusedworker does not; primary verify-queue-grace.md; dependencies sourcehash in proof; status supported; synthesis corrections/priority.
## C-RELEASE-WORK
Statement: release-adjacent longtasks98–103ms and55–56ms observed, no function attribution; prioritize profiling release as provisional engineering judgment. Type observation/recommendation; risk normal; intents I1,I6; support O-K-FINAL; counterevidence observeroverhead uncontrolled; groups samebrowserdataset; convergence scoped; primary raw; dependencies C-DRAG-RUNTIME; status supported for observation/partial for recommendation; synthesis rankedexperiments.
## C-SNAPFRAME
Statement: eligible snapping expression invokes same pure frame lookup twice; no material latency attributed. Type source; risk normal; scope StudioCanvas577–589; intent I1; support O-S01; countersearch lookup small; primary code; groups repository only; convergence source; dependencies none; status supported; synthesis dragpath.
## C-FREEZE-PRIORITY
Statement: keep freeze-handoff optimization secondary to observed multi-second offsets;626ms is total followinganalysis not promised savings. Type recommendation; risk normal; intent I3; support O-L-REPEAT; countersearch no counterfactual/fulloutputparity; groups oneengineexperiment; convergence provisional; primary repeat; dependencies C-FREEZE,C-OUTLINE-REPEAT; status partial; synthesis ranking.

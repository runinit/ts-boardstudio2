# Wave1 C worker_queue
Observed 2026-09-20, current staged tree348e0e5.

One running/one replaceable pending request;180ms settle,1000ms termination grace; revision gates at worker/queue/hook. Cancellation checkpoints between synchronous stages. Source amendments revision guarded. Cancel/retry terminal behavior is an unverified candidate, not confirmed defect.

Sources: app/src/utils/studioQueue.ts:24-149; app/src/hooks/useStudio.ts:82-177; app/src/workers/studioPipeline.ts:13-91; app/src/workers/ergogen.worker.ts:43-135

## EXPAND
- LEAD: Measure actual stage cancellation latency and wasted CPU. WHY: constants are not measured guarantees. ANGLE: current fixture plus supersession.
- LEAD: Verify analysis.cancel terminal behavior/retry. WHY: queue disposed while hook remains. ANGLE: focused hook execution.
- LEAD: Probe amend races with edit/undo. WHY: guards source-backed but execution needed. ANGLE: delayed success/revision changes.

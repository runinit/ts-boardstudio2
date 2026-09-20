# Wave1 G worker_docs
Observed 2026-09-20, current staged tree348e0e5.

Current WHATWG terminate algorithm hard-stops worker; logical acceptance still required. Structured clone vs transfer, cooperative yielding/AbortSignal not syncpreemption, SAB deployment constraints. Window postMessage citation must be followed to Worker-specific algorithm before asserting exact overhead.

Sources: https://html.spec.whatwg.org/multipage/workers.html#terminate-a-worker; https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects; https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield

## EXPAND
none — worker termination, transfer semantics, scheduling/yield behavior, shared-memory isolation, historical counterevidence, and verification designs covered; no unresolved source lead.

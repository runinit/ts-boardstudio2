# Confirmed queue grace reset defect

Actual StudioQueue source is loaded through ts-node10.9.2; fake workers record messages/termination, while real timers execute. Worker verification used Node22.22.3; root rerun uses repository-supported Node24.14.0. The code source SHA-256 is cc2c05c6a28baa2a25150d7f8015d80c690c7cd51acc16036cf21dab5a468d9e.

Sequence: schedule first job; supersede to arm grace; dispose; schedule a fresh job on the same queue; supersede again; wait beyond the1000ms application grace. Result: reused worker gets studio+supersede but0termination calls. Fresh-queue control gets1termination and starts its pending replacement.

Cause: app/src/utils/studioQueue.ts:141–149 clears the timer but does not set this.grace=undefined. The subsequent schedule at54–55 sees a truthy handle and returns before arming a new timer. The queue itself remains schedulable, so this is not a terminal-cancel defect.

Scope: actual queue logic with fake worker endpoints and real timers, not a browser worker/CPU experiment. It proves the timer/termination-call failure. It does not measure how often users hit this sequence or how much CPU it wastes. No product fix was made during research. Recommended fix: clear/reset the grace handle consistently in dispose, with this exact lifecycle as a regression.

[Producer](artifacts/queue-grace.cjs), [worker execution](artifacts/queue-grace-node22.txt), [root Node24 output](artifacts/queue-grace-node24.json). The copied producer's relative import retains the same directory depth and loads the repository source; execute with ts-node/register/transpile-only and CommonJS/Node compiler options as shown in the worker transcript. Both queues dispose at end; no workers/timers retained.

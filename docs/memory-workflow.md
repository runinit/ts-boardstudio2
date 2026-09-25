# Project milestone crystals

This workflow keeps durable project knowledge useful without turning routine work
into memory traffic. Project scope is the canonical AgentMemory identity
`ts-boardstudio2`, not the filesystem path or a session-specific name. The parent
agent owns captures by default.

## When to capture

Create zero or one crystal for a coherent milestone when it preserves information
that should change a future implementation or review. Good candidates include:

- A reusable architecture decision or invariant, settled and checked against code.
- A subtle compatibility fix verified by a regression test, runtime oracle, or
  format parser. For example, the KiCad root/pad angle relationship is worth
  retaining because omitted pad angles default to absolute zero before root
  normalization, and front/back board exports were checked against pcbnew.
- A completed, substantial migration with meaningful validation evidence and
  explicit limits.
- A diagnostic result with its cause verified, even if a separate implementation
  remains blocked. Keep the diagnostic as its own completed finding.

Skip routine CSS or copy edits, ordinary test runs, small cleanup, repeated status
updates, commit-only milestones, speculation, and unfinished implementation. Do
not infer a reusable rule from one observation. Do not create a crystal merely
because a task ended. Split unrelated substantial milestones only when each has
independent evidence and future value; there is no quota to fill.

## Capture workflow

1. **Recall and deduplicate.** For history-dependent work, search the
   `ts-boardstudio2` memory scope first. Supply the project parameter when the
   available tool supports it; otherwise qualify the query and filter returned
   records by project. Do not invent unsupported arguments. List scoped actions
   and crystals and inspect likely matches. If a matching crystal exists, skip a
   new retrospective capture. Reuse/update a matching uncrystallized action. If
   its action is already crystallized, skip; do not create a duplicate. Create a
   clearly labeled retrospective action only when no matching action or crystal
   exists, and keep its status truthful.
2. **Check completion.** Mark an action done only when the described milestone is
   complete and the evidence supports it. A blocked implementation stays open.
   A verified diagnostic insight can qualify separately if it is independently
   reusable; it must not imply the implementation passed.
3. **Assemble evidence.** Record the project identity, commit/revision or explicitly
   uncommitted state, relevant paths, checks actually run and outcomes, the
   rationale or invariant, and practical limits. Separate observation from
   inference. Name pending checks instead of implying they passed. Never invent
   action IDs, memory IDs, revisions, or validation results.
4. **Write narrowly.** Prefer surfaced AgentMemory action/crystal tools. An action
   may need a create/update call before the single crystal write; “one write” means
   one crystal per coherent milestone. If a needed capability is unavailable,
   inspect the installed tool reference and endpoint schema before using its
   documented REST fallback. Do not copy volatile API tables here. Do not also
   save the same fact as a standalone memory and lesson; crystal generation
   derives lessons.
5. **Read back and verify.** Inspect the creation result, then retrieve the saved
   crystal and its generated lessons. Compare every claim against source, test
   output, and the recorded revision. Reject softened failed-check claims and
   universal rules inferred from a single case. If the service has no edit route,
   use a supported corrective record that references the old crystal, or report
   the correction as pending. Never silently endorse a known error.

## Examples

**Capture:** a verified KiCad angle transformation, with the exact omitted-angle
rule, signed local offset, front/back output, pcbnew oracle result, touched files,
and the checks performed.

**Skip:** “fixed some CSS,” “all tests passed” without scope or evidence, a
commit-hash-only note, a speculative cause, or an implementation whose required
checks remain blocked. A separately reproduced and explained diagnostic may be
captured if it will prevent future wasted investigation.

A later commit, repeated test run, or status update does not warrant a duplicate
crystal. A later verified correction is append-only and points back to the old
crystal; it does not rewrite project history.

## Operational checks

- Use the project filter for lookups and writes where supported; if a lookup has
  no project parameter, search with `ts-boardstudio2` and verify/filter returned
  project metadata before relying on a record. Do not invent arguments. Local
  counters or summaries do not prove a milestone is complete.
- If a write response is uncertain, inspect the scoped crystal/action list before
  retrying to avoid duplicates.
- If the memory service is unavailable, leave the meaningful capture pending and
  report that once. Do not change daemon, hook, or configuration behavior.
- Never crystallize unfinished implementation. If a blocked handoff needs
  continuation, record only the narrow resume context (outcome, next step, blocker,
  revision, paths, and checks) as a handoff memory. This does not justify a
  milestone crystal or marking its action done.
- Do not capture routine command output, raw logs, secrets, personal data, or
  unverified conclusions.

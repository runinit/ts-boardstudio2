# Worker Guidelines

## Overview

Workers isolate generation, CAD conversion, and footprint/model processing.
Protocol changes must account for the consumers outside this directory.
Existing protocol boundary retained despite a conservative score below 8.

## Where to Look

| File                                            | Contract                                              |
| ----------------------------------------------- | ----------------------------------------------------- |
| `ergogen.worker.ts` / `ergogen.worker.types.ts` | Generation, analysis, layout, studio messages         |
| `studioPipeline.ts`                             | Layout, outline, and final analysis stages            |
| `workerFactory.ts`                              | Browser-only module worker creation and null fallback |
| `jscad.worker.ts` / `jscad.worker.types.ts`     | Sequential case conversion and `configVersion`        |
| `footprint.worker.ts`                           | Inspect/count/prepare requests correlated by ID       |
| `model.worker.ts`                               | STL/VRML/STEP import and preview geometry             |

## Revision and Lifecycle Contracts

- Keep request IDs and revisions correlated across Ergogen messages and replies.
- `../utils/studioQueue.ts` owns active/pending requests, supersession, and cleanup.
  Preserve latest-revision filtering when changing publication behavior.
- Studio stages yield and check supersession between expensive operations;
  reuse the solved layout instead of independently solving each stage.
- Ergogen analysis cache is worker-local; account for worker reuse and injection
  changes when modifying cache lifetime.
- JSCAD replies echo numeric `configVersion`; consumers reject stale conversions.
  Preserve non-JSCAD cases and propagate conversion failures.
- Factory tests cover construction failures and execution outside the browser.

## Cross-Layer Checks

Review `../hooks/useStudio.ts`, `../hooks/useCasePreview.ts`,
`../context/ConfigContext.tsx`, and `../utils/zip.ts` for protocol changes.
Footprint/model callers also live in `../utils/footprintService.ts`.

From the repository root, run:

```sh
pnpm --dir app exec vitest run src/workers src/utils/studioQueue.test.ts src/hooks/useStudio.test.ts
```

Keep regressions for stale replies, supersession, layout reuse, and converter
failures; a successful single worker request does not exercise queue behavior.

## Anti-Patterns

- Do not publish a stale stage after a newer studio revision supersedes it.
- Do not solve the same layout independently for each pipeline stage.

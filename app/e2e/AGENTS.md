# Browser Test Guidelines

## Overview

Built-app integration tests; score 9, separate from the jsdom unit-test runtime.

## Where to Look

| Task                               | Location                      |
| ---------------------------------- | ----------------------------- |
| Browser/server configuration       | `../playwright.config.ts`     |
| Studio navigation and saved source | `utils/studio.ts`             |
| GitHub request fixtures            | `utils/githubMocks.ts`        |
| Screenshot naming/output           | `utils/screenshots.ts`        |
| Performance capture                | `utils/studioPerformance*.ts` |
| Import payloads                    | `fixtures/`                   |

## Conventions

- Playwright runs Chromium against Vite preview, not the dev server.
- The server uses strict port binding and never reuses an existing server.
  Set `PLAYWRIGHT_PORT` when the default port 3000 is occupied.
- Base paths derive from `VITE_PUBLIC_URL`, then `PUBLIC_URL`, then
  `/boardstudio/`; avoid hard-coded origin/root assumptions.
- Specs run fully parallel with zero configured retries.
- Use shared studio helpers for Code, Case, Export, library, and inspector flows.
- `readSource` reads the saved active project even when Code is closed;
  preview deployment storage uses the `preview:` prefix.
- Install provider route mocks before navigation triggers remote requests.
- `makeShooter` writes labeled full-page captures under `e2e/screenshots/`.

## Anti-Patterns

- Do not expect Vitest to discover browser specs; it excludes this directory.
- Do not rely on another spec's project, storage, port, or output files.
- Do not count a screenshot as an assertion of persisted source correctness.
- Do not wait a fixed duration for generation; await the observable completion.

## Focused Checks

After the root build, run a selected browser spec from the repository root:

```sh
pnpm --dir app exec playwright test e2e/app.spec.ts
```

The suite requires built `app/dist` and the installed Chromium browser.

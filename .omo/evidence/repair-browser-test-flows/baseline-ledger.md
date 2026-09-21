# repair-browser-test-flows baseline ledger

Worktree: `/home/chris/projects/ts-boardstudio2-browser-test-flows`
Base/tested SHA: `6a130dcf655dee60414e1f43fe76134d84ea20e3`
Selected Playwright port: `4184` (free before run; released after each run)

| Phase | Exact invocation | Exit | Evidence |
|---|---|---:|---|
| Dependency install | `PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH pnpm install --frozen-lockfile` | 0 | `install.log`, `install.exit` |
| Chromium install | `PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH pnpm --dir app exec playwright install chromium` | 0 | `chromium-install.log`, `chromium-install.exit` |
| Fresh build | `PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH NODE_OPTIONS=--max-old-space-size=3072 pnpm build` | 0 | `build.log`, `build.exit`; fresh `app/dist` timestamps |
| Plan RED | `PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never pnpm --dir app exec playwright test e2e/app.spec.ts e2e/bhk-matrix.spec.ts --workers=1 --output=../.omo/evidence/repair-browser-test-flows/red --trace=retain-on-failure --reporter=list` | 1 | `red.log`, `red.exit`, three non-empty `trace.zip` files |
| Browser characterization | Evidence-local probe config; `/new` redirect/default matrix and BHK Row keys disclosure click | 0 | `characterization-pass.log`, `characterization-pass.exit`, two non-empty screenshots, non-empty trace |

The RED run produced exactly three failures: native `New native design` timeout in `createDraft`, and `Add key in column 7` visibility timeouts at 1440px and 390px. The characterization observed `/new` redirecting to the deployment root, persisted 5×4 `fingers` arrangement with 20 rendered keys, and Row keys initially collapsed until clicked.

Cleanup receipt: `cleanup-receipt.log`. No tracked product/test files changed; temporary probe/config files were removed.

# Footprint settings implementation evidence

Owned app changes: types/footprint.ts parameter contract/defaults and optional net mappingKey; utils/footprintParameters.ts, footprintEngine.ts, footprintService.ts; molecules/FootprintParameters.tsx, FootprintLibrary.tsx and tests; e2e/footprint-parameters.spec.ts plus existing library disclosure selector.

Behavior: visible typed settings regenerate emitted pads and source-selected models. Entry parameter defaults survive browsing, undo, saved snapshots and exported module defaults. Ergogen placement values retain precedence. Original source/provenance remains unchanged. Geometry is revision-owned; pending/invalid settings cannot save or export. Preserve-mode models regenerate, manually replaced models remain owned by the draft. Viewing direction is labelled separately.

## RED

- engine-red.log: real prepareEntry failed structured array default extraction (actual object/empty string versus array [1,2]).
- browser-red.log: real browser running original dist imported Settings.js and failed to find the Footprint settings group. This is the UI behavioral RED.
- ui-red.log: missing component import is harness setup evidence only, not behavioral RED.

## Verification before integration build

- unit.log: 54 passed (42 all-bundled defaults, 12 service/engine/component/library/hook regressions).
- bundled.log: original staged catalog 42 defaults prepare with zero errors; rerun after final staging.
- lint.log: scoped ESLint clean.
- typecheck.log: latest global run observes concurrent Set-spread TS2802 errors outside this ownership. Earlier run passed before those changes; owners notified.

Node 24 command prefix: PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH

Final browser command, after root staged build:

    PLAYWRIGHT_PORT=3074 pnpm --dir app exec playwright test e2e/footprint-parameters.spec.ts --reporter=list

The browser scenario imports actual JS, changes side/reversible/width, checks regenerated pad count, saves, exports ZIP (defaults/provenance/YAML checked), reloads, and checks persisted controls. Expected artifacts: app/test-results/footprint-parameters-{desktop,mobile}.png and footprint-parameters.zip. Browser GREEN is pending integration build; do not treat baseline RED captures as current UI verification.

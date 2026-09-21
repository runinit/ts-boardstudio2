# Full E2E early-failure triage

Read-only product investigation at HEAD 98398de against baseline 6a130dc. No product edits, commits, browser interactions, test reruns, server changes, or changes to shared app/test-results were made. This report is the sole new artifact. Existing Playwright error contexts and final/e2e.log are the runtime evidence; baseline classification uses exact Git blob equality rather than an unrun baseline suite.

Hypotheses considered: (1) stale test flow against the baseline UI; (2) refresh regression changing the relevant UI or model generation; (3) runtime interruption/timing rather than an assertion reaching its deadline.

## 1. Matrix draft creation — pre-existing test/UI mismatch

`app/test-results/app-creates-a-matrix-draft-and-previews-its-PCB-chromium/error-context.md` reports a 30-second timeout waiting for button `New native design`. The snapshot already shows the saved Keyboard project in Board Studio.

`app/e2e/app.spec.ts:5` navigates to `./new`, then invokes `createDraft`. `app/e2e/utils/studio.ts:73` waits for the import-page `New native design` button and then `Apply setup`. However, `app/src/App.tsx:314` defines NewProject to immediately call `create(compileSetup(defaultSetup()))`, then navigate to `/`; `/new` mounts NewProject at line 685. `app/src/pages/Welcome.tsx:837` contains the requested button on the import page and its action itself navigates to `/new`. Thus the test has already passed the step it tries to click, consistent with the runtime snapshot.

Exact baseline/current proof (`git ls-tree 6a130dc <paths>` and `git ls-tree 98398de <paths>`):

- App.tsx: a54f76f7d0abd813c4dc0c81679c0309e9019b7b at both revisions.
- Welcome.tsx: d9d3c740a0c5597fc6d31f10d1b63b294f046e4f at both.
- e2e/app.spec.ts: edf752e905c79416a7879fd8edec6e903cda4e60 at both.
- e2e/utils/studio.ts: 9cd206934f1b0ff8441a4b7453450a691f77665a at both.

Refresh cause: none found. Separate test-maintenance owner should align the helper with direct draft creation; merely changing the initial route still leaves the outdated Apply setup expectation. The failure occurs before PCB preview assertions and supplies no evidence against the footprint changes.

## 2. BHK row editing at 1440px and 390px — pre-existing collapsed-section mismatch

Both `app/test-results/bhk-matrix-edits-BHK-rows-and-columns-at-{1440,390}px-chromium/error-context.md` report a five-second timeout locating the accessible button `Add key in column 7`. Both snapshots already display Row 2 and the collapsed Row keys summary, without row-key contents.

`app/e2e/bhk-matrix.spec.ts:34–39` confirms Row 2 then directly expects the add-key button; it never opens Row keys. `app/src/molecules/RowInspector.tsx:38` wraps those buttons in `InspectorSection name="Row keys"`. `app/src/molecules/InspectorSection.tsx:12` defaults each unseen section to false and binds that to `<details open={open}>`. The accessible role selector therefore cannot find a hidden descendant until the summary is expanded. The selector text is still correct; its visibility precondition is missing.

Exact baseline/current proof:

- e2e/bhk-matrix.spec.ts: 9531b8f481d4880fb6cb68d6d8a577d9b72321fb at both revisions.
- RowInspector.tsx: c49de777acf689039e300efb4cc9bd89dcfd71af at both.
- InspectorSection.tsx: f93d41ca1b0270f7d3288525357f96d9ce95fc5f at both.

`git log -3 --oneline -- app/src/molecules/InspectorSection.tsx` identifies 347229a, Rework the Board Studio GUI, as the existing section implementation. The refresh BoardStudio.tsx delta adds resolved electrical findings only; it does not modify row selection or section visibility. Refresh cause: none found. Separate test-maintenance owner should explicitly expand Row keys before accessing its controls and check other collapsed inspector controls later in the flow. This does not justify changing BHK product behavior.

## 3. Trackpoint assembly rendering — interrupted, not a demonstrated failure

A fourth error context appeared during triage: `app/test-results/default-model-assembly-ren-2bb1c-default-trackpoint-assembly-chromium/error-context.md`. Read alone, it shows a pending expectation for Current geometry with a 180-second timeout. The controlling final/e2e.log explicitly says `Test was interrupted`, records only 7.6 seconds for this test, and concludes **3 failed, 1 interrupted, 172 did not run, 19 passed**, exit code 130. It is incorrect to classify this as a completed geometry timeout or refresh regression.

The preceding native default-trackpoint assembly test passed in 8.1 seconds in the same log. Its browser-render counterpart remains unverified; no claim that it passes baseline or current HEAD is made. No refresh fix is supported by this interrupted observation.

## Disposition

The three completed early failures have concrete unchanged baseline test/UI causes. The fourth case was interrupted. The overall E2E gate is not passing and most scenarios did not run. This report classifies observed failures only; it does not waive the gate, certify the entire baseline suite, or prove the unexecuted refresh scenarios.

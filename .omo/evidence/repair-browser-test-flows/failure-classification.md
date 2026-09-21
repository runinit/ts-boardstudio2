# Full-suite failure classification

Actual invocation: `PLAYWRIGHT_PORT=4184 PLAYWRIGHT_HTML_OPEN=never timeout 3600 pnpm --dir app exec playwright test --workers=2 --output=../.omo/evidence/repair-browser-test-flows/full --trace=retain-on-failure --reporter=list`. Node 24.14.0 / pnpm 11.26.0. Actual exit 1; 172 passed, 20 failed, 1 skipped, 193 total, 24.2 minutes. No retries or max-failure cutoff. Full results are not green.

Baseline SHA: `6a130dcf655dee60414e1f43fe76134d84ea20e3`. `baseline-source-receipt.json` proves all failed specs match baseline bytes. Product code is unchanged, as recorded by integration-start.txt and final cleanup. Only responsive and Settings scenarios call changed createDraft. Their old downstream failures reproduce using baseline helper functions and direct current-UI readiness, without invoking changed createDraft: baseline-probe/results.json, probe.log, screenshots and traces. Both remain at /boardstudio/ after /new redirect with 20 keys.

Other 18 failures run unchanged baseline scenarios and unchanged helper exports on unchanged production, in fresh browser contexts. They are unrelated to this test-only repair by source-path isolation. We did not rerun those 18 in a separate baseline checkout, and do not claim deterministic root causes or that export/drag timing cannot vary with load. Failure names, exact runtime errors, and artifact paths are retained below and in failure-details.json.

## 1. footprint-library.spec.ts >> assigns a model to a native BHK controller and exports the object binding

- Location: e2e/footprint-library.spec.ts:244:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/footprint-library-assigns--71080--exports-the-object-binding-chromium/error-context.md. Adjacent trace.zip retained locally.

```
TimeoutError: page.waitForEvent: Timeout 15000ms exceeded while waiting for event "download"
=========================== logs ===========================
waiting for event "download"
============================================================
```

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('region', { name: 'Board Studio' }).getByRole('main').getByRole('button', { name: 'Download case ZIP', exact: true })
    - locator resolved to <button>Download case ZIP</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action

```

## 2. layout-units.spec.ts >> exports fitting material separately from an interfering layer

- Location: e2e/layout-units.spec.ts:258:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/layout-units-exports-fitti-3d81a-y-from-an-interfering-layer-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('status').filter({ hasText: 'Layout resolved' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('status').filter({ hasText: 'Layout resolved' })

```

## 3. layout-units.spec.ts >> keeps setup and the layout usable at 320px

- Location: e2e/layout-units.spec.ts:145:7.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/layout-units-keeps-setup-and-the-layout-usable-at-320px-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'Design setup panel' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('region', { name: 'Design setup panel' })

```

## 4. layout-units.spec.ts >> keeps setup and the layout usable at 390px

- Location: e2e/layout-units.spec.ts:145:7.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/layout-units-keeps-setup-and-the-layout-usable-at-390px-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'Design setup panel' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('region', { name: 'Design setup panel' })

```

## 5. layout-units.spec.ts >> sets up an empty board, edits stagger, inserts and aligns an encoder

- Location: e2e/layout-units.spec.ts:14:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/layout-units-sets-up-an-em-beea6-serts-and-aligns-an-encoder-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'New native design', exact: true })

```

## 6. layout-units.spec.ts >> shows named material layers and gap fit in setup

- Location: e2e/layout-units.spec.ts:327:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/layout-units-shows-named-m-d5458-layers-and-gap-fit-in-setup-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('tab', { name: 'Stackup', exact: true })

```

## 7. layout-units.spec.ts >> snaps a component to a column center and optionally keeps the alignment

- Location: e2e/layout-units.spec.ts:192:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/layout-units-snaps-a-compo-601ea-ionally-keeps-the-alignment-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('status').filter({ hasText: 'Layout resolved' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('status').filter({ hasText: 'Layout resolved' })

```

## 8. native-layout.spec.ts >> edits local key overrides, preserves arrangements, and enforces locks

- Location: e2e/native-layout.spec.ts:76:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/native-layout-edits-local--b489a-ngements-and-enforces-locks-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.check: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByLabel('Locked', { exact: true })
    - locator resolved to <input type="checkbox" aria-label="Locked"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    223 × waiting for element to be visible, enabled and stable
        - element is not visible
      - retrying click action
        - waiting 500ms

```

## 9. native-layout.spec.ts >> grows an onboarding matrix and adds an owned thumb assembly

- Location: e2e/native-layout.spec.ts:252:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/native-layout-grows-an-onb-55208-dds-an-owned-thumb-assembly-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('status').filter({ hasText: /Layout resolved/ })
Expected: visible
Timeout: 120000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 120000ms
  - waiting for getByRole('status').filter({ hasText: /Layout resolved/ })

```

## 10. native-layout.spec.ts >> shows independent floor and PCB layers in side view and generates their assembly

- Location: e2e/native-layout.spec.ts:157:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/native-layout-shows-indepe-9a193-nd-generates-their-assembly-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('= 2.5 mm', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('= 2.5 mm', { exact: true })

```

## 11. responsive.spec.ts >> opens the shared mobile inspector and opens YAML

- Location: e2e/responsive.spec.ts:4:5.
- Classification: unrelated (baseline helper runtime probe reproduces downstream failure).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/responsive-opens-the-shared-mobile-inspector-and-opens-YAML-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Code', exact: true })

```

## 12. settings-consolidation.spec.ts >> keeps consolidated controls usable at 320px

- Location: e2e/settings-consolidation.spec.ts:255:7.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/settings-consolidation-kee-57d6c-ed-controls-usable-at-320px-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Design setup', exact: true })

```

## 13. settings-consolidation.spec.ts >> keeps consolidated controls usable at 390px

- Location: e2e/settings-consolidation.spec.ts:255:7.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/settings-consolidation-kee-766cd-ed-controls-usable-at-390px-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Design setup', exact: true })

```

## 14. settings-consolidation.spec.ts >> keeps one matrix spacing editor and preserves defaults through a rename

- Location: e2e/settings-consolidation.spec.ts:33:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/settings-consolidation-kee-e8a62-s-defaults-through-a-rename-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

## 15. settings-consolidation.spec.ts >> retains an edge relationship only after the snapped drop

- Location: e2e/settings-consolidation.spec.ts:133:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/settings-consolidation-ret-6b4b5-only-after-the-snapped-drop-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeEnabled() failed

Locator: getByRole('button', { name: /Keep relationship · Edge offset/ })
Expected: enabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeEnabled" with timeout 5000ms
  - waiting for getByRole('button', { name: /Keep relationship · Edge offset/ })
    3 × locator resolved to <button disabled>…</button>
      - unexpected value "disabled"

```

## 16. studio-continuous.spec.ts >> keeps drags, nudges and inspector edits through delayed outline updates

- Location: e2e/studio-continuous.spec.ts:164:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/studio-continuous-keeps-dr-02a59-ugh-delayed-outline-updates-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('group', { name: 'Interactive board layout' }).locator(':scope > g[transform="scale(1,-1)"][pointer-events="none"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('group', { name: 'Interactive board layout' }).locator(':scope > g[transform="scale(1,-1)"][pointer-events="none"]')

```

## 17. studio-settings-and-svg.spec.ts >> shows the Offline App control in native Settings

- Location: e2e/studio-settings-and-svg.spec.ts:5:5.
- Classification: unrelated (baseline helper runtime probe reproduces downstream failure).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/studio-settings-and-svg-sh-ba963--control-in-native-Settings-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Project settings' }).getByText('Offline App', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Project settings' }).getByText('Offline App', { exact: true })

```

## 18. studio-workflow.spec.ts >> keeps navigation, selection and camera through Settings without editing source

- Location: e2e/studio-workflow.spec.ts:15:5.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/studio-workflow-keeps-navi-91434-ings-without-editing-source-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Settings', exact: true })

```

## 19. workbench.spec.ts >> uses complete mobile drawers at 320px

- Location: e2e/workbench.spec.ts:87:7.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/workbench-uses-complete-mobile-drawers-at-320px-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeInViewport() failed

Locator: getByRole('button', { name: 'Code', exact: true })
Expected: in viewport
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeInViewport" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Code', exact: true })

```

## 20. workbench.spec.ts >> uses complete mobile drawers at 390px

- Location: e2e/workbench.spec.ts:87:7.
- Classification: unrelated (unchanged baseline source; does not call changed createDraft).
- Captured artifact: .omo/evidence/repair-browser-test-flows/full/workbench-uses-complete-mobile-drawers-at-390px-chromium/error-context.md. Adjacent trace.zip retained locally.

```
Error: expect(locator).toBeInViewport() failed

Locator: getByRole('button', { name: 'Code', exact: true })
Expected: in viewport
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeInViewport" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Code', exact: true })

```

## Existing skip

`github-loading.spec.ts:83:8`, GitHub Loading / should load config with URL parameter and footprints. The pre-existing test.skip is byte-identical to baseline. It was not executed and is not claimed passing.

## Target and duplicate-project checks

Full log records native matrix/PCB and BHK 1440px/390px passing. Routing second-project scenario passed in both consumers and full suite with unchanged assertions: saved.configs length 2 and Set(ids).size 2. Consumers totals: 11 passed / 2 failed, exit 1. Changed readiness helper performs assertions only, no navigation or creation.

# Full browser suite failure classification

29 failed,163 passed,1 skipped. Every failurecontext archived here. Classification is causal only where a missing/hiddencontrol or obsolete status is directly proven by unchangedUI source; unchangedtestfiles alone are not evidence.

1. **app.spec.ts >> creates a matrix draft and previews its PCB** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: app-creates-a-matrix-draft-and-previews-its-PCB-chromium/error-context.md

2. **bhk-matrix.spec.ts >> edits BHK rows and columns at 1440px** — Existing collapsed inspector section. RowInspector.tsx38 wraps in Row keys; InspectorSection.tsx12 defaults closed. Evidence: bhk-matrix-edits-BHK-rows-and-columns-at-1440px-chromium/error-context.md

3. **bhk-matrix.spec.ts >> edits BHK rows and columns at 390px** — Existing collapsed inspector section. RowInspector.tsx38 wraps in Row keys; InspectorSection.tsx12 defaults closed. Evidence: bhk-matrix-edits-BHK-rows-and-columns-at-390px-chromium/error-context.md

4. **enclosures.spec.ts >> generates BHK CNC relief from the process controls** — Unresolved; requires runtime or baseline comparison.  Evidence: enclosures-generates-BHK-C-cd4a9-f-from-the-process-controls-chromium/error-context.md

5. **footprint-library.spec.ts >> assigns a model to a native BHK controller and exports the object binding** — Unresolved; requires runtime or baseline comparison.  Evidence: footprint-library-assigns--71080--exports-the-object-binding-chromium/error-context.md

6. **footprint-library.spec.ts >> imports a KiCad bundle, aligns models, links placements, and exports a portable project** — Unresolved; requires runtime or baseline comparison.  Evidence: footprint-library-imports--4398a--exports-a-portable-project-chromium/error-context.md

7. **icons.spec.ts >> renders menu icons with external fonts blocked** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: icons-renders-menu-icons-with-external-fonts-blocked-chromium/error-context.md

8. **layout-units.spec.ts >> exports fitting material separately from an interfering layer** — Existing obsolete status text. BoardStudio.tsx566 renders Layout positions current; snapshots show current layout. Evidence: layout-units-exports-fitti-3d81a-y-from-an-interfering-layer-chromium/error-context.md

9. **layout-units.spec.ts >> keeps setup and the layout usable at 320px** — Existing unopened inspector. BoardStudio.tsx144 initializes sheetclosed; StudioStyles.tsx282 hides StudioPane when !$open. Tests do not open inspector before querying setup. Evidence: layout-units-keeps-setup-and-the-layout-usable-at-320px-chromium/error-context.md

10. **layout-units.spec.ts >> keeps setup and the layout usable at 390px** — Existing unopened inspector. BoardStudio.tsx144 initializes sheetclosed; StudioStyles.tsx282 hides StudioPane when !$open. Tests do not open inspector before querying setup. Evidence: layout-units-keeps-setup-and-the-layout-usable-at-390px-chromium/error-context.md

11. **layout-units.spec.ts >> sets up an empty board, edits stagger, inserts and aligns an encoder** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: layout-units-sets-up-an-em-beea6-serts-and-aligns-an-encoder-chromium/error-context.md

12. **layout-units.spec.ts >> shows named material layers and gap fit in setup** — Existing unopened inspector. BoardStudio.tsx144 initializes sheetclosed; StudioStyles.tsx282 hides StudioPane when !$open. Tests do not open inspector before querying setup. Evidence: layout-units-shows-named-m-d5458-layers-and-gap-fit-in-setup-chromium/error-context.md

13. **layout-units.spec.ts >> snaps a component to a column center and optionally keeps the alignment** — Existing obsolete status text. BoardStudio.tsx566 renders Layout positions current; snapshots show current layout. Evidence: layout-units-snaps-a-compo-601ea-ionally-keeps-the-alignment-chromium/error-context.md

14. **native-layout.spec.ts >> edits local key overrides, preserves arrangements, and enforces locks** — Existing collapsed inspector section. StudioInspector.tsx750 wraps Locked in Advanced placement, defaultclosed. Evidence: native-layout-edits-local--b489a-ngements-and-enforces-locks-chromium/error-context.md

15. **native-layout.spec.ts >> grows an onboarding matrix and adds an owned thumb assembly** — Existing obsolete status text. BoardStudio.tsx566 renders Layout positions current; snapshots show current layout. Evidence: native-layout-grows-an-onb-55208-dds-an-owned-thumb-assembly-chromium/error-context.md

16. **native-layout.spec.ts >> shows independent floor and PCB layers in side view and generates their assembly** — Unresolved; requires runtime or baseline comparison.  Evidence: native-layout-shows-indepe-9a193-nd-generates-their-assembly-chromium/error-context.md

17. **responsive.spec.ts >> opens the shared mobile inspector and opens YAML** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: responsive-opens-the-shared-mobile-inspector-and-opens-YAML-chromium/error-context.md

18. **routing.spec.ts >> creates a second project while retaining the first** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: routing-creates-a-second-project-while-retaining-the-first-chromium/error-context.md

19. **routing.spec.ts >> opens native Board Studio directly at /new** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: routing-opens-native-Board-Studio-directly-at-new-chromium/error-context.md

20. **routing.spec.ts >> opens native Board Studio on a fresh root route** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: routing-opens-native-Board-Studio-on-a-fresh-root-route-chromium/error-context.md

21. **settings-consolidation.spec.ts >> keeps consolidated controls usable at 320px** — Existing unopened mobile Project actions menu. ProjectMenu.tsx16–23 hides actions until menuopened at narrowwidth; captures show Project actions trigger, tests query hidden child. Evidence: settings-consolidation-kee-57d6c-ed-controls-usable-at-320px-chromium/error-context.md

22. **settings-consolidation.spec.ts >> keeps consolidated controls usable at 390px** — Existing unopened mobile Project actions menu. ProjectMenu.tsx16–23 hides actions until menuopened at narrowwidth; captures show Project actions trigger, tests query hidden child. Evidence: settings-consolidation-kee-766cd-ed-controls-usable-at-390px-chromium/error-context.md

23. **settings-consolidation.spec.ts >> keeps one matrix spacing editor and preserves defaults through a rename** — Unresolved; requires runtime or baseline comparison.  Evidence: settings-consolidation-kee-e8a62-s-defaults-through-a-rename-chromium/error-context.md

24. **settings-consolidation.spec.ts >> retains an edge relationship only after the snapped drop** — Unresolved; requires runtime or baseline comparison.  Evidence: settings-consolidation-ret-6b4b5-only-after-the-snapped-drop-chromium/error-context.md

25. **studio-continuous.spec.ts >> keeps drags, nudges and inspector edits through delayed outline updates** — Unresolved; requires runtime or baseline comparison.  Evidence: studio-continuous-keeps-dr-02a59-ugh-delayed-outline-updates-chromium/error-context.md

26. **studio-settings-and-svg.spec.ts >> shows the Offline App control in native Settings** — Existing obsolete navigation. App.tsx325 creates draft immediately; sharedhelper waits removed control. Evidence: studio-settings-and-svg-sh-ba963--control-in-native-Settings-chromium/error-context.md

27. **studio-workflow.spec.ts >> keeps navigation, selection and camera through Settings without editing source** — Existing unopened mobile Project actions menu. ProjectMenu.tsx16–23 hides actions until menuopened at narrowwidth; captures show Project actions trigger, tests query hidden child. Evidence: studio-workflow-keeps-navi-91434-ings-without-editing-source-chromium/error-context.md

28. **workbench.spec.ts >> uses complete mobile drawers at 320px** — Existing unopened mobile Project actions menu. ProjectMenu.tsx16–23 hides actions until menuopened at narrowwidth; captures show Project actions trigger, tests query hidden child. Evidence: workbench-uses-complete-mobile-drawers-at-320px-chromium/error-context.md

29. **workbench.spec.ts >> uses complete mobile drawers at 390px** — Existing unopened mobile Project actions menu. ProjectMenu.tsx16–23 hides actions until menuopened at narrowwidth; captures show Project actions trigger, tests query hidden child. Evidence: workbench-uses-complete-mobile-drawers-at-390px-chromium/error-context.md

Unresolved cases stay unclassified until isolated reproduction or exactbaselinecomparison. No unrelatedtests/UI changed; no newskips, ignoredfailures or timeoutincreases.

## Subsequent classification updates

- Cases4,5,6: all PASS serial on same production build; `../serial-failures/run.log`. Parallel failure not reproduced; exact contention cause unproven.
- Case16: unchanged numeric DimensionField shows local0.5mm while test expects absolute2.5mm; source-backed audit in `../failure-audit.md`.
- Case23: fails before rename at hidden Column spacing; unchanged closed inspector proof in `../failure-audit.md`.
- Case25: serial exact source captured `../continuous-capture/`; raw source fails HEAD/current, prepared source passes both. Unchanged useStudio edit-only rebuild gate leaves undo/redo without bridge preparation. Known preexisting request-mode gap, not a passing test.
- Case24: final serial still fails at disabled/disappearing Keep relationship control. `../final-snap/run.log`; baseline investigation delegated separately. Remains unresolved until that evidence arrives.

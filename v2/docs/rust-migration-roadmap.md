# Next Rust migration milestones

Planning baseline: `b7b7c3d` (`Reconcile UI layouts with Rust matrix
projections`). The matrix projection and project archive migrations are complete
on this revision. This plan covers the next two proposed milestones only. It
does not adopt a CAD crate, UI framework, or build tool.

The two efforts can be investigated independently. Keep their production
cutovers separate: a CAD kernel change and a full UI/build rewrite need
independent evidence and rollback points.

## Milestone 3: prototype Rust CAD in the browser

### Goal and boundary

Compare Rust interfaces to OpenCascade with a Rust-native B-rep kernel before
choosing an implementation. Preserve project data, case request semantics, and
the Three.js mesh consumer. The options and their current evidence are recorded
in [CAD kernel options](cad-kernel-options.md).

The intended boundary is:

```text
Rust core: revisioned request and prepared contours
  -> lazy CAD worker: chosen Rust case API + OCCT or a Rust-native kernel
  -> STEP bytes and mesh buffers
  -> existing CaseClient and Three.js preview
```

Rust `i_overlay` remains responsible for planar contour preparation. The
prototype must preserve its offset behavior and must not move case work into the
interactive layout core's initial download. Cadrum and an updated
`opencascade-rs` keep the C++ OCCT kernel; Monstertruck is a separate,
higher-risk kernel-replacement path.

### Work sequence

1. **Set the objective.** Decide whether removing the C++ kernel is required.
   If preserving OCCT behavior is the goal, compare Cadrum with an
   `opencascade-rs` fork targeting OCCT 8.0.1. Test Monstertruck as its own
   kernel-replacement path only if removing OCCT is in scope.
2. **Build a common native fixture runner.** Pass the same prepared contours,
   case settings, and STEP bytes into each candidate. Start with the seven
   fixtures in `v2/cad/test/case.test.mjs`, then add touching/coplanar features,
   split offsets, thin walls, and transformed component STEP files. Compare
   solid count, volume, bounds, normals, and STEP reimport, not STEP text or
   triangle ordering. Stop a candidate early if it cannot meet the geometry
   contract natively.
3. **Pin and prove the browser-worker ABI for finalists.** Pin candidate and
   kernel revisions, Rust/C++ toolchains, WASM glue, build containers, and
   downloaded artifacts. Build the kernel lazily into a worker, produce a holed
   plate mesh and STEP file, read the STEP back, report invalid input, and
   replace the worker after a trap. Preserve request identity and revision
   rejection.
4. **Exercise deployed-browser conditions.** Check every currently supported
   browser, offline reload, relative/subpath asset loading, repeated case
   operations, stale replies, and worker recovery. Measure artifact size, cold
   start, peak memory, and operation time; the current adapter remains the
   behavior reference.
5. **Make a go/no-go decision.** Set CAD-specific size, initialization, memory,
   and latency limits before measurement. The layout performance gate is not a
   substitute for CAD measurements. Record fixture results, differences, and
   unresolved cases in a separate assessment.

### Gate to production migration

Proceed only if the pinned build is reproducible, all seven case fixtures and
the transformed-import checks pass, STEP roundtrips preserve required geometry,
invalid requests and worker traps recover, and the recorded size/memory/latency
limits are met. Then migrate `buildCase`, `buildAssembly`, and `readStepModel`
behind the existing case-worker client contract. Remove the old adapter only
after all three paths pass on the integrated application. Review each
candidate's distribution terms before shipping its artifact.

If a gate fails, keep the current CAD path and record the failure and whether a
bounded upstream fix or another candidate could address it. Do not infer success
from an upstream demo or test suite.

### Not in this milestone

- Replacing Three.js, changing the case request/result contract, or moving the
  CAD kernel into the core worker.
- Treating an OCCT wrapper migration and a kernel replacement as the same
  project. They have different goals, geometry risks, and go/no-go decisions.
- Rewriting React, Vite, or the application shell.

## Milestone 4: evaluate a Rust UI and Vite exit

### Goal and scope

Evaluate Leptos client-side rendering and Trunk as a path to a Rust-authored v2
workbench, while keeping the browser application static and offline-capable.
Preserve the current worker boundaries, Rust-owned documents and archive
protocols, local storage, project format, and shipped interactions. Treat the
current `b7b7c3d` UI—including linked mirrored layouts and custom-origin splay—as
the behavior reference.

Separate three outcomes that are often conflated:

1. Replace authored React/TSX UI with a Rust UI.
2. Remove Vite from the v2 production and development build.
3. Remove Node from v2 builds.

The first does not prove the second. Trunk builds and serves the Rust/WASM UI,
but the current app also needs worker bundles, model asset discovery, lazy JS
libraries, and generated browser scripts. A small explicit asset/compatibility
bundle may remain. Playwright and repository tooling may also keep Node in use.
Vite removal should not be described as a Node exit.

### Work sequence

1. **Inventory build and interaction contracts.** Record the responsibilities
   currently supplied by Vite and React: the three HTML entries (`index.html`,
   `bench.html`, and `bench-workbench.html`); module workers for core, case, and
   export; the generated service worker; the bundled-model glob; WASM and model
   URLs; lazy Three.js/OpenCascade chunks; relative asset paths; and production
   mode. Create a feature inventory from the current workbench and its browser
   flows before deciding which Rust UI pieces to port.
2. **Build a separate vertical-slice prototype.** Use Leptos CSR + Trunk in an
   isolated v2 prototype, not as a replacement for the current app. It should
   open a starter project through the existing core boundary, render the Rust
   scene, edit one inspector value, undo/redo, save and reopen a project archive
   through the Rust archive boundary, and export through the existing worker
   path. Keep the core as the source of document and revision truth; the UI must
   not grow a second geometry or history model.
3. **Prove browser integration and packaging.** Show how the Rust UI starts and
   talks to the existing workers, then package the JS still required by
   Ergogen, Three.js, CAD, and worker adapters without Vite. Trunk can stage
   assets, but do not assume it replaces npm module bundling. Compare a small
   explicit bundle step with other minimal packaging options and select one only
   after it builds the prototype. Generate a model asset manifest in place of
   `import.meta.glob`; retain lazy model and CAD loading. Keep CSS and relative
   paths compatible with offline reload and subdirectory hosting.
4. **Audit interaction and accessibility parity.** Cover project open/save,
   selection and tree navigation, keyboard commands, inspector focus,
   pointer previews and cancellation, snapping, undo/redo, linked mirrored
   edits, custom splay origins, responsive panels, dark/light/system themes,
   error recovery, and stale worker replies. Use the current browser suite and
   screenshots as evidence; do not claim parity from the vertical slice alone.
5. **Replace the UI by product area.** Once the bridge is viable, port the
   unified workbench, Parts, PCB, Case, and Export flows in reviewable slices.
   Keep the current app runnable until each area and its connected workflows
   have evidence. Preserve lazy CAD, bundled generator behavior, and
   revision-tagged worker results throughout.
6. **Remove Vite after the asset map is complete.** Replace the production,
   development, preview, and benchmark entry points; worker construction;
   service-worker generation; static asset mapping; and offline/subpath
   deployment. Keep Playwright as the browser-level acceptance route even if
   its server changes. Decide separately whether Vitest or Node-based catalogue
   and service-worker scripts remain useful.

### Gate to cutover

Do not replace the current app until the new build can produce every required
entry point and asset, and all product workflows above have implementation and
browser evidence. Require offline first-load/reload behavior after initial
asset acquisition, project save/reopen compatibility, stale-reply rejection,
keyboard operation, responsive behavior, and the existing five-session
performance gate on the target build. Verify the app under its production base
path and with CAD/model assets loaded on demand. Preserve the current build as a
rollback until these checks pass.

At cutover, remove React and Vite from the v2 app only when they have no live
imports or build role. Keep v1's independent React/Vite toolchain intact. Make
Node removal a separate goal with its own dependency and CI inventory.

### Not in this milestone

- Changing `boardstudio/v2`, project ZIP contents, Rust core contracts, or the
  linked-layout/splay behavior.
- Porting trusted Ergogen generator source, Three.js, or browser APIs into Rust
  solely to make the language boundary look uniform.
- Removing Node or Playwright as an unstated side effect of replacing Vite.

## Suggested order and outputs

Start with the CAD worker prototype because it has a bounded API and seven
existing geometry fixtures. In parallel, the UI effort can complete its build
inventory and parity checklist; begin the Leptos vertical slice after agreeing
on the worker and packaging boundary. Keep both prototypes isolated from the
current app. Each should end with a short evidence report and a go/no-go
decision before production migration begins.

Expected planning artifacts are a kernel choice and pinned prototype
specification with recorded measurement limits, and one UI feature/build
inventory with an agreed vertical-slice boundary. This roadmap defines the
questions and gates; it does not claim either migration has started or passed.

## References checked 2026-09-24

- [Cadrum upstream build and browser notes](https://github.com/lzpel/cadrum):
  confirm the exact version, WASM exception and toolchain requirements again
  when pinning the prototype.
- [Cadrum browser example](https://github.com/lzpel/opencascade-wasm32-unknown-unknown-example):
  useful build reference, not evidence of Board Studio fixture parity.
- [Leptos CSR deployment](https://book.leptos.dev/deployment/csr.html) and
  [JavaScript integration](https://book.leptos.dev/web_sys.html):
  framework references for the shell and browser bridge.
- [Trunk asset guide](https://trunk-rs.github.io/trunk/guide/assets/index.html):
  asset staging reference; it does not by itself bundle the app's npm modules.

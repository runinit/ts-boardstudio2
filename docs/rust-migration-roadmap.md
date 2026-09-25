# Next Rust migration milestones

Planning baseline: `b7b7c3d` (`Reconcile UI layouts with Rust matrix
projections`). The matrix projection and project archive migrations are complete
on this revision. This roadmap now records the completed CAD adapter migration
and the remaining, separate Rust UI/build evaluation.

The CAD adapter cutover is complete. A full UI/build rewrite and any replacement
of the C++ kernel remain separate efforts with independent evidence and
rollback points.

## Milestone 3: move the CAD adapter to Rust/WASM — complete

### Goal and boundary

Use Cadrum 0.8.20 with OpenCascade 8.0.1 for case construction, STEP handling,
and mesh preparation. Preserve project data, case request semantics, and the
Three.js mesh consumer. Kernel alternatives remain documented in
[CAD kernel options](cad-kernel-options.md).

The intended boundary is:

```text
Rust core: revisioned request and prepared contours
  -> lazy CAD worker: Cadrum Rust/WASM bridge + OCCT
  -> STEP bytes and mesh buffers
  -> existing CaseClient and Three.js preview
```

Rust `i_overlay` remains responsible for planar contour preparation. CAD stays
lazy in its worker and outside the interactive layout core's initial download.
Cadrum moves the adapter to Rust but retains the C++ OpenCascade kernel.

### Delivered and verified

- The bridge exposes `buildCase`, `buildAssembly`, and `readStepModel` behind
  the existing TypeScript API and case-worker protocol. Request IDs, revisions,
  queue/restart behavior, and transferable buffers remain unchanged.
- Cadrum, OCCT archives, the builder image, wasi-sdk, Rust, wasm-pack, and
  wasm-bindgen-cli are pinned. OCCT downloads are SHA-256 verified, and the
  same `pnpm run build:cad` step is used by validation and Pages workflows.
- All 11 original CAD integration fixtures pass on optimized WASM, covering
  STEP roundtrips, cutouts, concave regions, tray/lid cavities, mounts, gasket
  grooves, multi-body assemblies, battery stacks, integrated frames, and
  component-local openings. A transformed 63-solid component STEP import test
  also passes placement, bounds, millimeter units, mesh, and normal checks.
- Malformed STEP input rejects. The worker failure test verifies pending work
  rejects and a replacement worker completes a later request.
- Five serial performance samples are recorded in
  [the Cadrum assessment](cadrum-assessment.md). They are diagnostic; geometry
  and deployment parity are the cutover gates.

### Not in this milestone

- Replacing Three.js, changing the case request/result contract, or moving the
  CAD kernel into the core worker.
- Treating an OCCT wrapper migration and a kernel replacement as the same
  project. They have different goals, geometry risks, and go/no-go decisions.
- Rewriting React, Vite, or the application shell.

The production Chromium preview/export suite and Pages subpath/offline suite
passed; their commands and outcomes are recorded in the
[assessment](cadrum-assessment.md).

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

The CAD worker migration is implemented and has its own evidence report. The UI
effort can complete its build inventory and parity checklist before a Leptos
vertical slice begins. Keep that work separate from the CAD boundary.

The completed CAD output is the pinned production adapter and integration
assessment. The remaining planning artifact is a UI feature/build inventory
with an agreed vertical-slice boundary.

## References checked 2026-09-24

- [Pinned Cadrum source](https://github.com/lzpel/cadrum/tree/8788df70c60b986b5ab387edb75a2f6f341a8c7a):
  production bridge API and WASM exception details.
- [Cadrum browser example](https://github.com/lzpel/opencascade-wasm32-unknown-unknown-example):
  useful build reference, not evidence of Board Studio fixture parity.
- [Leptos CSR deployment](https://book.leptos.dev/deployment/csr.html) and
  [JavaScript integration](https://book.leptos.dev/web_sys.html):
  framework references for the shell and browser bridge.
- [Trunk asset guide](https://trunk-rs.github.io/trunk/guide/assets/index.html):
  asset staging reference; it does not by itself bundle the app's npm modules.

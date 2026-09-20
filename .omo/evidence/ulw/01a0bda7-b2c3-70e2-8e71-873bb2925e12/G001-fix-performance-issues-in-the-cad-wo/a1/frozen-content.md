# Frozen content identity

Base HEAD: 347229abc1561a44a2dc6cc0cee50969b49b267e
Base HEAD tree: a891ca589cb4f3edfa73a7445d24c501dfe82209
Actual staged implementation tree: 6b20edc487ea64844e137cfae164e7fca1b36d07
Patch: frozen-final.patch
Patch SHA256: bf8e6d411dd7cc6fd101580a7764a6ca2290c6f830bbfe0e2b20dcfd345b4d6d

The implementation is staged but uncommitted. An attempted checkpoint commit failed because no author name/email is configured. The user has been asked; no answer was received. No identity was invented. Reviews and final QA bind the actual staged tree, not the old HEAD content. Existing AGENTS.md guide changes remain unstaged and are excluded from this implementation tree.

Final production build exited0 at verification/build-final.log. Final precommit passed917 app tests138files before the small mixed-LED ordering review delta. The delta's17 focused tests, typecheck and lint passed; RED/GREEN and final logs are under mutations/led-interleaving. Full integration check was run earlier and its browser failures remain explicitly reported and classified rather than hidden.

## Final harness correction
Two test-only source lookup IDs now match the interior cell actually clicked. Production sources/build unchanged. Final actual staged tree: 1fdba0718f9c4e9cdb4f1b739969998459d80198. Current frozen-final.patch SHA256: 6744f97826c0bbc3b29f778cff39ab674d5a86dc5f08281afd42a31853824eb6. Previous staged patch is retained as frozen-led.patch; its digest equals the prior bf8e6d... value above. Final corrected browser flow runs against this version.

## Owned component selection correction
The native QA helper now selects the owned diode through Select Objects and the canvas keyboard handler. Same X=1, exact undo/redo/reload, worker completion and source assertions remain. Focused real browser proof passed (after/final-component). Final staged tree348e0e5f520a45268ba80a01f90627f8a0f575d8; current frozen-final.patch SHA2562629ad6baca3a38072a3edb2777416d82a75e2a16d8a02943047db0ad70623ec. Prior6744f978 patch retained as frozen-cell-assertion.patch. Production sources/build unchanged.

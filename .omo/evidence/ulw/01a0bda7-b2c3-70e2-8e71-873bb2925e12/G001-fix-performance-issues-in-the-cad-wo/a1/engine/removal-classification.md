# Removal after outward movement is physically disconnected

Exact source: `../after/plain60/last-source.yaml`. The moved `fingers_c10_r1` has override `[9, 0, 0]`; its adjacent `fingers_c10_r2` was removed. Baseline engine is HEAD `347229abc1561a44a2dc6cc0cee50969b49b267e`, loaded in a separate process without modifying the worktree or installed dependency.

All four runs return `designs.boundaries.main_edge: Expected one connected region; found 2`, diagnostic code `disconnected`:

| Input | HEAD | Current |
| --- | ---: | ---: |
| Exact raw source | 54.24 s | 12.50 s |
| Same prepareOutlines transformation | 58.92 s | 13.41 s |

These are classification runs, not general workload performance claims. The captured source contains 20 duplicate keycap region recipes, making baseline evaluation unusually expensive.

Input identity was verified:

- Raw SHA256: `92fded08342c8418024dad2ebdcc6a08d222f8fa2c0df636f174255a2e8f1945` for both engines.
- Prepared SHA256: `f2279de6f3eb5224b2cc379da06add3d914ac3536caaff81cb1a33baa1964c87` for both engines.

Resolved geometry proves the separation independently: the moved keycap spans `[171, -9]` to `[189, 9]`; its nearest surviving neighbor spans `[143, -9]` to `[161, 9]`. The 10 mm gap exceeds the 4 mm reach of radius-2 closing. Applying 2 mm clearance on both sides still leaves a 6 mm gap. Other neighboring keycaps are farther away. See `removal60-physical.json`.

Conclusion: this is a valid rejection of a disconnected outline, not a performance-change regression. A valid-outline performance scenario may delete an interior key while retaining the disconnected-removal scenario as rejection evidence. No geometry guard or production source was changed.

Runtime evidence: `removal60-{head,current}-{raw,prepared}.json`; exact raw and prepared YAML snapshots are saved alongside them. All processes completed and CPU was released to browser QA.

# Continuous editing failure classification

Baseline: 347229abc1561a44a2dc6cc0cee50969b49b267e. Original versions of the three changed engine modules were loaded in a separate process using process-local CommonJS loader hooks and `git show HEAD:<path>`. Neither the worktree nor installed dependencies were replaced.

Exact serial browser capture: `../after/continuous-capture/final-source.yaml`. 39 keys; matrix cluster placement [161,0,0]; moved matrix_c2_r1 placement.override.at [12.029546,1,0]. Its keycap remains connected to its matrix neighbors. The source has no bridge between the fingers and matrix clusters: designs.boundaries.main_edge.bridges is empty.

| Input mode | HEAD engine | Current engine |
| --- | --- | --- |
| Captured raw YAML | Fails: Expected one connected region; found 2 | Same failure |
| prepareOutlines(raw,solveLayout(raw).results.layout) | Succeeds, 1 final contour, 3.66s | Succeeds, 1 final contour, 3.66s |

Both prepared YAML files have SHA256 `c17d56e607de1578d3046cbc410f97dd70e9bbcffe261652b6ee8e6ddbff3ceb`. Preparation adds bridge `fingers_c7_r1_matrix_c1_r1` connecting [114,0] to [161,0], width 10. Final board bounds [-11,-11] to[203.029546,87]. Evidence: continuous-{head,current}.json and continuous-{head,current}-raw.json.

Conclusion: the 39-key error is not an engine regression and not a detached edited key. The browser processed source lacking its required generated bridge; inspect automatic-outline rebuild request handling. No engine production change was needed.

## Saved 60-key outward 7mm drag

Exact input: `../baseline/structural/drag-2-source.yaml`, run through the same preparation step.

- HEAD: fails after 16.11s with `designs.boundaries.main_edge: Offset failed to preserve the profile extent`.
- Current: succeeds after 7.06s, one contour, board bounds [-11,-11] to [189,106].

Evidence: drag60-head.json and drag60-current.json. This is an existing offset robustness failure that the repair-ray change improves; it is not evidence of physical detachment. The unsaved 9mm scenario was not inferred or claimed as tested.

All comparison processes completed. No production source changes were made for this follow-up.

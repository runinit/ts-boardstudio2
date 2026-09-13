# Publication state

The local `main` branch contains only the bootstrap README at `5218ed3`.
The candidate lives on `integrate/boardstudio`; all five source snapshot commits
are ancestors of its history-import commit, `53e8e30`.

Publication is blocked in this session: GitHub shell requests cannot connect,
and the connected GitHub tool cannot create repositories. The repository lookup
returned 404; neither creation nor private visibility is claimed.

When write access and browser validation are available:

1. Create private `runinit/boardstudio` with `main` as its default branch.
2. Push the local bootstrap `main`, then `integrate/boardstudio`.
3. Open an integration PR against `main` and run all validation gates.
4. Review locally using Thorium in the agent workspace.
5. Merge the PR with a merge commit to retain component ancestry.
6. Verify the resulting remote SHA, default branch, and private visibility.

Do not squash the integration history. Existing repositories, branches, BHK,
and deployments remain intact. Deployment and package publication are excluded.

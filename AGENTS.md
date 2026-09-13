# Board Studio

Use pnpm from the repository root. Sources live in `app/`, `engine/`, and
`footprints/`; these are one Git repository and one pnpm workspace.

Preserve unrelated edits, source APIs, project storage identifiers, footprint
namespaces, licenses, and attribution. BHK remains independent.

For bug fixes, write a regression, observe failure, then implement the fix.
Run `pnpm precommit` before implementation commits. Run `pnpm check` for
integration changes. Source snapshots preserve unverified historical work;
they are provenance, not passing validation.

Browser patches must run in a temporary engine copy and reuse workspace
node_modules. Never mutate the installed engine or depend on sibling checkouts.
No deployment or package publication is part of repository consolidation.

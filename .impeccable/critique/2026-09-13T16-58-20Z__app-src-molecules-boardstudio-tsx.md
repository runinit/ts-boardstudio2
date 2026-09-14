---
target: Board Studio workbench and Inspector
total_score: 28
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 1
target_identity: "file:/home/chris/01_Projects/ergogen10/boardstudio/app/src/molecules/BoardStudio.tsx"
target_fingerprint: "sha256:33825444e7caef5ab77ddcd8b15abb15b3247fbbc9690c4c4c9ba833302061e3"
target_path: /home/chris/01_Projects/ergogen10/boardstudio/app/src/molecules/BoardStudio.tsx
timestamp: 2026-09-13T16-58-20Z
slug: app-src-molecules-boardstudio-tsx
---
Method: dual-agent (A: /root/critique_design · B: /root/critique_evidence)

The palette is coherent. The remaining problems are control placement and Inspector density.

Design specificity: the graphite/blue palette, matrix vocabulary, numeric editing and dominant drawing field fit a keyboard CAD workbench. No identity redesign is needed.

| Heuristic | Score /4 | Main finding |
|---|---:|---|
| System status | 3 | Analysis, geometry and blocker messages compete |
| Real-world match | 4 | Rows, columns, pitch and splay match the task |
| Control and freedom | 4 | Manual Inspector, undo and Escape |
| Consistency | 2 | Floating tools collide with normal-flow controls |
| Error prevention | 3 | Locks, validation and resize safeguards |
| Recognition | 2 | Long property lists require repeated searching |
| Efficiency | 3 | Numeric editing and keyboard accelerators |
| Minimalism | 2 | Too many control groups share the foreground |
| Error recovery | 3 | Findings already open and navigate to affected items |
| Help | 2 | Advanced relationship/solver effects need local explanation |
| Total | 28/40 | Good; structural fixes remain |

What works: the restored blue/graphite palette separates surfaces and geometry; aligned key rows distinguish selection from removal; explicit Inspector opening preserves user control.

Priority issues:

1. P1 — Canvas tools obscure outline controls. The current desktop capture shows the rail/snapping dock covering Automatic outline and analysis text. BoardStudio.tsx:1361 renders the outline bar in normal flow while CanvasTools.tsx:42 anchors the rail independently. Reserve one toolbar band or anchor floating tools below it. Keep status text outside their footprint. Suggested command: impeccable layout.
2. P2 — The Inspector remains a long form. Stagger, splay, offsets, membership, matrix actions and relative adjustments follow one another; cluster editing adds further placement and constraints. Keep common edits first, then disclose membership/matrix and advanced constraints separately. Preserve section state and manual opening. Suggested command: impeccable distill.
3. P2 — Narrow headers crowd the editing area. Wrapped project actions, stage navigation, workspace actions and drawer navigation stack before properties. The narrow capture also loses the board reference while editing. Consolidate secondary project actions and shorten the drawer header first; assess a canvas peek only after reclaiming that space. Suggested command: impeccable adapt.
4. P2 — Readiness wording needs clearer scope. Layout resolved and 2 blockers can coexist legitimately, but the relationship is unexplained. The blocker count already opens findings and those findings navigate to objects. Label it Review 2 blockers and distinguish layout resolution from PCB/case/export readiness. Suggested command: impeccable clarify.

Cognitive load: the problem is simultaneous groups, not the number of options inside a closed select. The canvas rail exposes more than four modes, and properties mix geometry, membership, resizing and constraints. Group by the edit being performed.

Journey: the canvas gives orientation, the long Inspector introduces searching, and an unexplained blocker count weakens confidence at the end.

Persona red flags: Alex repeats scrolling for exact edits; Jordan must interpret layout success versus blockers; Casey loses board context beneath stacked mobile controls.

Minor observations: keep domain terms such as splay, but explain consequential solver controls locally. Browser warning banners belong to the QA environment and are excluded from product findings.

Evidence: independent detector scan found zero issues across five TSX targets. A inspected live Thorium plus existing current-build narrow captures. B's disposable Thorium launch timed out and exposed no DevTools target; its browser/injection checks fell back to source. No live overlay or new interaction verification is claimed. The retained current-build desktop capture supplies visual evidence of the collision.

Questions to consider: Could common edits fit in the first Inspector viewport? Can one toolbar band own outline, snapping and analysis controls?

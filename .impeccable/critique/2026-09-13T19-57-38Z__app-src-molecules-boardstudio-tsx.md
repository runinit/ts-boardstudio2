---
target: Board Studio workbench and Inspector
total_score: 29
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 1
target_identity: "file:/home/chris/01_Projects/ergogen10/boardstudio/app/src/molecules/BoardStudio.tsx"
target_fingerprint: "sha256:f374949c01b79e9856df83f0a9588ff3e9c3dd37e4c3ad0a3d525ac7807bdc63"
target_path: /home/chris/01_Projects/ergogen10/boardstudio/app/src/molecules/BoardStudio.tsx
timestamp: 2026-09-13T19-57-38Z
slug: app-src-molecules-boardstudio-tsx
closed: true
---
Method: dual-agent (A: /root/critique_current_design · B: /root/critique_current_evidence)

Board Studio has a coherent keyboard CAD identity. The graphite/blue palette, matrix controls, and persistent canvas fit the task. The main remaining problem is recovery: one blocker action sends users to the wrong editor.

Design health: **29/40 — Good.**

| Heuristic | Score | Assessment |
|---|---:|---|
| System status | 3 | Analysis, saving, and blockers are named. |
| Real-world fit | 4 | Matrix, PCB, and case terminology fit keyboard design. |
| User control | 3 | Manual Inspector, undo, close, and cancel paths. |
| Consistency | 3 | Shared controls and predictable stage navigation. |
| Error prevention | 3 | Stale outputs and blocked downloads have guards. |
| Recognition | 3 | Named groups help; narrow selection context is sparse. |
| Efficiency | 3 | Direct editing and keyboard paths support routine work. |
| Visual hierarchy | 3 | Canvas leads on desktop; phone editing hides it. |
| Error recovery | 2 | Controller blocker opens case creation. |
| Help | 2 | Technical verification messages lack a concrete procedure. |
| **Total** | **29/40** | **Good** |

What works: the Inspector opens manually; secondary fields use disclosure; outline controls remain above the canvas tools. Desktop Code and Design setup are already visible, and phone stage tabs correctly omit icons. These do not need another redesign.

1. **P1 — A controller blocker opens the wrong workflow.** Clicking “Choose a controller before PCB review” opens **Add a case**. Setup findings receive `meta.studio.setup`, which falls through to the Case route. The findings panel closes, leaving no controller control in view. Route each finding to its actual editor and label the recovery action, such as “Open controller setup.” Suggested command: **impeccable harden**. [Source](/home/chris/01_Projects/ergogen10/boardstudio/app/src/molecules/BoardStudio.tsx:539)

2. **P2 — The phone Inspector hides visual feedback.** At a 500px browser width, properties fill the editing area. Users must close the Inspector to inspect the effect of a size or alignment change. Add a canvas peek or a preview toggle that preserves the field, scroll position, and selection. Keep manual Inspector opening. Suggested command: **impeccable adapt**. [Source](/home/chris/01_Projects/ergogen10/boardstudio/app/src/molecules/StudioStyles.tsx:342)

Cognitive load is moderate: the eight canvas tools are visible, but closed dropdown options and collapsed sections are not simultaneous decisions. The main costs are switching between properties and geometry, then finding a recovery destination.

The emotional path starts with clear project context and a visible drawing. It weakens when phone editing removes that drawing, and most sharply when a blocker leads somewhere unrelated. Fixing that path matters more than adding decoration.

Persona risks: **Jordan**, a newcomer, cannot infer how case creation fixes a controller warning. **Casey**, using a phone, repeatedly switches between properties and the board. **Alex**, an experienced designer, benefits from retained shortcuts and disclosure state; those should remain.

Minor improvement: strengthen “Selected: fingers” to include object type and affected count, for example “Matrix fingers · 20 keys.” Keep save state, geometry state, and download readiness distinct.

The deterministic scan found **0 issues across 7 markup files**. That scan cannot detect the incorrect recovery destination or judge the lost board context. Fresh parent verification confirmed the controller route and compared a 1430px desktop window with a 500px narrow window.

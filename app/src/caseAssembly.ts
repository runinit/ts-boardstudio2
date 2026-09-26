import type { ProjectDoc, SceneDelta, CaseAssemblyIR } from '@boardstudio/v2-contracts';

export function caseAssembly(document: ProjectDoc, scene: SceneDelta, boardId: string): CaseAssemblyIR {
  return {
    revision: scene.revision,
    bodies: document.caseBodies.filter((body) => body.boardId === boardId).map((body) => ({
      revision: scene.revision,
      body,
      contours: scene.boardContours.find((entry) => entry.boardId === body.boardId)?.contours ?? [],
    })),
  };
}

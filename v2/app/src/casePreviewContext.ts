import type { SceneDelta } from '@boardstudio/v2-contracts';

export type CasePreviewContext = {
  documentId: string;
  boardId: string;
  revision: number;
  scene: SceneDelta;
  committedScene: SceneDelta;
};

export type ContextualCaseResult<T> = { context: CasePreviewContext; result: T };

export function casePreviewContextMatches(captured: CasePreviewContext, current: CasePreviewContext): boolean {
  return captured.documentId === current.documentId
    && captured.boardId === current.boardId
    && captured.revision === current.revision
    && captured.scene.revision === captured.revision
    && current.scene.revision === current.revision
    && captured.scene === captured.committedScene
    && current.scene === current.committedScene
    && captured.scene === current.scene;
}

export function currentCaseResult<T extends { revision: number }>(
  value: ContextualCaseResult<T> | undefined,
  context: CasePreviewContext,
): T | undefined {
  return value && value.result.revision === context.revision && casePreviewContextMatches(value.context, context)
    ? value.result : undefined;
}

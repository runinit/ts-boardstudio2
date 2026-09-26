import type { Dispatch, SetStateAction, MutableRefObject } from 'react';
import { useCallback } from 'react';
import type {
  Matrix,
  PartDefinition
} from '../../../contracts/src/index';
import { matrixCellId } from './matrixGeometry';
import { SelectionScope } from './workbenchTypes';

type Inputs = {
  outlineActive: boolean;
  pendingPart: PartDefinition | null;
  setOutlineSettingsOpen: Dispatch<SetStateAction<boolean>>;
  suppressClick: MutableRefObject<boolean>;
  matrixPartLookup: Map<string, { matrixId: string; row: number; column: number; assemblyId?: string | undefined; }>;
  selectionAnchor: { matrixId: string; row: number; column: number; } | null;
  matrixMap: Map<string, Matrix>;
  memberMaps: Map<string, Map<string, string>>;
  boardPartIds: Set<string>;
  setSelectionMode: Dispatch<SetStateAction<"matrix" | "row" | "column" | "key" | "component">>;
  setScope: Dispatch<SetStateAction<SelectionScope | null>>;
  setSelected: Dispatch<SetStateAction<string[]>>;
  setRightOpen: Dispatch<SetStateAction<boolean>>;
  selected: string[];
  setSelectionAnchor: Dispatch<SetStateAction<{ matrixId: string; row: number; column: number; } | null>>;
  selectionMode: SelectionScope['kind']
};

export function useWorkbenchSelection({ outlineActive, pendingPart, setOutlineSettingsOpen, suppressClick, matrixPartLookup, selectionAnchor, matrixMap, memberMaps, boardPartIds, setSelectionMode, setScope, setSelected, setRightOpen, selected, setSelectionAnchor, selectionMode }: Inputs) {
  const choosePart = (id: string, modifiers: { additive?: boolean; range?: boolean } = {}) => {
    if (outlineActive || pendingPart) return;
    setOutlineSettingsOpen(false);
    if (suppressClick.current) return;
    const matrixCell = matrixPartLookup.get(id);
    const isMatrixKey = Boolean(matrixCell && !matrixCell.assemblyId);

    if (modifiers.range && matrixCell && isMatrixKey) {
      const anchor = selectionAnchor;
      const matrix = anchor?.matrixId === matrixCell.matrixId ? matrixMap.get(matrixCell.matrixId) : undefined;
      const members = matrix ? memberMaps.get(matrix.id) : undefined;
      const anchorMember = anchor ? members?.get(`${anchor.row}:${anchor.column}`) : undefined;
      if (matrix && anchor && anchorMember && boardPartIds.has(anchorMember)) {
        const ids: string[] = [];
        for (let row = Math.min(anchor.row, matrixCell.row); row <= Math.max(anchor.row, matrixCell.row); row += 1) {
          for (let column = Math.min(anchor.column, matrixCell.column); column <= Math.max(anchor.column, matrixCell.column); column += 1) {
            const member = members?.get(`${row}:${column}`);
            if (member && matrix.partIds.includes(member) && boardPartIds.has(member)) ids.push(member);
          }
        }
        setSelectionMode('key');
        setScope({ kind: 'key', matrixId: matrix.id, row: matrixCell.row, column: matrixCell.column });
        setSelected(ids);
        setRightOpen(true);
        return;
      }
    }

    if (modifiers.additive) {
      const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
      setSelected(next);
      setSelectionAnchor(isMatrixKey && matrixCell ? { matrixId: matrixCell.matrixId, row: matrixCell.row, column: matrixCell.column } : null);
      setScope(isMatrixKey && matrixCell
        ? { kind: 'key', matrixId: matrixCell.matrixId, row: matrixCell.row, column: matrixCell.column }
        : { kind: 'component', ...(matrixCell ?? {}), partId: id });
      setSelectionMode(isMatrixKey ? 'key' : 'component');
      setRightOpen(true);
      return;
    }

    if (isMatrixKey && matrixCell) {
      setSelectionAnchor({ matrixId: matrixCell.matrixId, row: matrixCell.row, column: matrixCell.column });
      if (selectionMode === 'component') {
        setSelected([id]);
        setScope({ kind: 'component', ...matrixCell, partId: id });
      } else {
        selectScope({ kind: selectionMode, ...matrixCell });
      }
    } else {
      setSelectionAnchor(null);
      setSelected([id]);
      setSelectionMode('component');
      setScope({ kind: 'component', ...(matrixCell ?? {}), partId: id });
    }
    setRightOpen(true);
  };

  const selectScope = useCallback((next: SelectionScope) => {
    setOutlineSettingsOpen(false);
    const matrix = next.matrixId ? matrixMap.get(next.matrixId) : undefined;
    let ids: string[] = [];
    if (next.kind === 'component' && next.partId) {
      ids = [next.partId];
    } else if (matrix) {
      if (next.kind === 'matrix') ids = matrix.partIds;
      if (next.kind === 'row' && next.row !== undefined) {
        ids = matrix.partIds.filter((id) => matrixPartLookup.get(id)?.row === next.row);
      }
      if (next.kind === 'column' && next.column !== undefined) {
        ids = matrix.partIds.filter((id) => matrixPartLookup.get(id)?.column === next.column);
      }
      if (next.kind === 'key' && next.row !== undefined && next.column !== undefined) {
        ids = [memberMaps.get(matrix.id)?.get(`${next.row}:${next.column}`) ?? matrixCellId(matrix.id, next.row, next.column)];
      }
    }
    const liveIds = ids.filter((id) => boardPartIds.has(id));
    setSelectionMode(next.kind);
    if (next.kind === 'key' && next.matrixId && next.row !== undefined && next.column !== undefined) {
      setSelectionAnchor({ matrixId: next.matrixId, row: next.row, column: next.column });
    }
    setScope(next);
    setSelected(liveIds);
    setRightOpen(true);
  }, [matrixMap, boardPartIds, matrixPartLookup, memberMaps]);
  return { choosePart, selectScope };
}

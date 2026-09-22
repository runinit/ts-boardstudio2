import type { ReactNode } from 'react';
import {
  MousePointer2,
  Columns3,
  Rows3,
  Grid2X2,
  Trash2,
  Hand,
  Maximize,
  Minus,
  Plus,
} from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../theme/theme';

const Dock = styled.div`
  position: absolute;
  z-index: ${theme.studio.panelLayer};
  display: flex;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.cad.fieldRadius};
  background: ${theme.colors.backgroundLight};
  box-shadow: ${theme.studio.toolShadow};
  button {
    padding: ${theme.spacing.sm};
    min-width: ${theme.studio.touchSize};
    border: 0;
    border-radius: ${theme.cad.fieldRadius};
    background: transparent;
  }
  button:hover {
    background: ${theme.colors.buttonHover};
  }
  button[aria-pressed='true'],
  button[aria-expanded='true'] {
    background: ${theme.studio.selected};
    color: ${theme.colors.accent};
  }
`;
const Rail = styled(Dock)`
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  width: ${theme.studio.touchSize};
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  > button {
    background: ${theme.colors.backgroundLight};
  }
  @container canvas (height < ${theme.studio
    .shortRailHeight}) and (width > ${theme.workbench.phoneBreakpoint}) {
    flex-direction: row;
    width: max-content;
  }
`;
const Primary = styled(Dock)`
  position: static;
  display: grid;
  padding: 0;
  border: 0;
  grid-template-columns: ${theme.studio.touchSize};
  @container canvas (height < ${theme.studio.compactRailHeight}) {
    grid-template-columns: repeat(5, ${theme.studio.touchSize});
  }
`;
const Zoom = styled(Dock)`
  z-index: ${theme.studio.panelLayer - 1};
  bottom: ${theme.spacing.md};
  right: ${theme.spacing.md};
  align-items: center;
  small {
    min-width: 3em;
    text-align: center;
  }
`;
export default function CanvasTools({
  tool,
  setTool,
  scope,
  setScope,
  side,
  setSide,
  reset,
  zoom,
  scale,
  snapTools,
  quickEdit,
  onDelete,
}: {
  tool: string;
  setTool: (value: string) => void;
  scope: string;
  setScope: (value: string) => void;
  side: 'top' | 'side';
  setSide: (value: 'top' | 'side') => void;
  reset: () => void;
  zoom: (direction: 'in' | 'out') => void;
  scale: number;
  snapTools: ReactNode;
  quickEdit?: ReactNode;
  onDelete?: () => void;
}) {
  return (
    <>
      <Rail role="toolbar" aria-label="Canvas tools">
        <Primary>
          {[
            [MousePointer2, 'keys', 'Objects'],
            [Columns3, 'columns', 'Columns'],
            [Rows3, 'rows', 'Rows'],
            [Grid2X2, 'clusters', 'Matrices'],
          ].map(([Icon, id, label]) => {
            const Glyph = Icon as typeof Hand;
            return (
              <button
                key={String(id)}
                aria-label={`Select ${label}`}
                title={`Select ${label}`}
                aria-pressed={tool === 'select' && scope === id}
                onClick={() => {
                  setScope(String(id));
                  setTool('select');
                }}
              >
                <Glyph size={18} />
              </button>
            );
          })}
          <button
            aria-label="Pan"
            title="Pan"
            aria-pressed={tool === 'pan'}
            onClick={() => setTool('pan')}
          >
            <Hand size={18} />
          </button>
        </Primary>
        {snapTools}
        {quickEdit}
        {onDelete && (
          <button
            aria-label="Delete selection"
            title="Delete selection · Delete"
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        )}
      </Rail>
      <Zoom role="toolbar" aria-label="View controls">
        <button
          onClick={() => {
            setSide(side === 'top' ? 'side' : 'top');
            reset();
          }}
          title="Change viewing plane"
        >
          {side === 'top' ? 'Side' : '2D'}
        </button>
        <button aria-label="Fit layout" title="Fit layout" onClick={reset}>
          <Maximize size={16} />
        </button>
        <button
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => zoom('out')}
        >
          <Minus size={16} />
        </button>
        <small>{scale}%</small>
        <button aria-label="Zoom in" title="Zoom in" onClick={() => zoom('in')}>
          <Plus size={16} />
        </button>
      </Zoom>
    </>
  );
}

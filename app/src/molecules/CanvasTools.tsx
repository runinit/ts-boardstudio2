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
  background: ${theme.colors.background};
  box-shadow: ${theme.studio.toolShadow};
  button {
    padding: ${theme.spacing.sm};
    min-width: ${theme.workbench.controlHeight};
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
  @media (max-width: ${theme.studio.breakpoint}) {
    button {
      min-width: ${theme.studio.touchSize};
    }
  }
`;
const Rail = styled(Dock)`
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  flex-direction: column;
  border-radius: ${theme.studio.dockRadius};
  > button {
    color: ${theme.colors.error};
    border-top: 1px solid ${theme.colors.border};
  }
  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    flex-direction: row;
    left: ${theme.spacing.sm};
    top: ${theme.spacing.sm};
    > button {
      border-top: 0;
      border-left: 1px solid ${theme.colors.border};
    }
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
  box-shadow: none;
  grid-template-columns: ${theme.workbench.controlHeight};
  @media (max-width: ${theme.studio.breakpoint}) {
    grid-template-columns: ${theme.studio.touchSize};
  }
  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    grid-template-columns: repeat(5, ${theme.studio.touchSize});
  }
  @container canvas (height < ${theme.studio.shortRailHeight}) {
    grid-template-columns: repeat(
      5,
      minmax(${theme.workbench.controlHeight}, auto)
    );
  }
`;
const Zoom = styled(Dock)`
  z-index: ${theme.studio.panelLayer};
  bottom: ${theme.spacing.md};
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - ${theme.spacing.lg});
  flex-wrap: wrap;
  justify-content: center;
  border-radius: ${theme.studio.dockRadius};
  align-items: center;
  small {
    min-width: 3em;
    text-align: center;
    font-family: ${theme.fonts.code};
    font-variant-numeric: tabular-nums;
  }
  .view-actions {
    display: flex;
    align-items: center;
    border-left: 1px solid ${theme.colors.border};
    padding-left: ${theme.spacing.xs};
  }
  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    bottom: ${theme.spacing.sm};
    .view-actions {
      border-left: 0;
    }
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
        {snapTools}
        <div className="view-actions">
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
          <button
            aria-label="Zoom in"
            title="Zoom in"
            onClick={() => zoom('in')}
          >
            <Plus size={16} />
          </button>
        </div>
      </Zoom>
    </>
  );
}

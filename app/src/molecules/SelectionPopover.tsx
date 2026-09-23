import { Plus, SlidersHorizontal, Trash2, X } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import type { LayoutReport } from 'ergogen/src/native';
import type { StudioSelection } from '../utils/studioTargets';
import { targets } from '../utils/studioTargets';
import { theme } from '../theme/theme';
import SelectionControls from './SelectionControls';
import { StudioActions } from './StudioStyles';

const trayEntry = keyframes`
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Popover = styled.aside`
  position: absolute;
  z-index: ${theme.studio.popoverLayer};
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  width: min(
    ${theme.studio.quickActionsWidth},
    calc(100% - ${theme.spacing.lg})
  );
  max-height: min(70vh, ${theme.studio.quickActionsHeight});
  box-sizing: border-box;
  overflow: auto;
  padding: ${theme.spacing.md};
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.studio.dockRadius};
  box-shadow: ${theme.studio.toolShadow};

  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: min(52dvh, ${theme.studio.quickActionsHeight});
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing.sm} ${theme.spacing.md}
      calc(${theme.spacing.md} + env(safe-area-inset-bottom));
    border-right: 0;
    border-bottom: 0;
    border-radius: ${theme.studio.dockRadius} ${theme.studio.dockRadius} 0 0;
    animation: ${trayEntry} ${theme.workbench.paneMotion};
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const TrayGrip = styled.span`
  display: none;

  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    display: block;
    align-self: center;
    width: 2.5rem;
    height: 0.25rem;
    margin: 0.125rem 0 ${theme.spacing.sm};
    border-radius: ${theme.studio.pillRadius};
    background: ${theme.workbench.borderHover};
  }
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  > div {
    flex: 1;
    align-self: center;
  }
  .open-inspector {
    padding: ${theme.spacing.xs};
    font-size: ${theme.studio.metadataSize};
    border: 0;
    background: transparent;
    color: ${theme.colors.accent};
  }
  h2 {
    margin: 0;
    font-size: ${theme.workbench.textSize};
  }
  p {
    margin: ${theme.spacing.xs} 0 0;
    color: ${theme.colors.textDarker};
    font-size: ${theme.studio.metadataSize};
  }

  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    position: sticky;
    top: 0;
    z-index: 1;
    flex-shrink: 0;
    margin: 0;
    padding-bottom: ${theme.spacing.sm};
    background: ${theme.colors.background};
  }
`;

const TrayBody = styled.div`
  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding-right: ${theme.spacing.xs};
  }
`;

const IconButton = styled.button`
  && {
    width: ${theme.workbench.controlHeight};
    min-width: ${theme.workbench.controlHeight};
    padding: 0;
    flex-shrink: 0;
  }
`;

const QuickActions = styled(StudioActions)`
  margin: ${theme.spacing.sm} 0;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border};
  button {
    padding: ${theme.spacing.sm};
    font-size: ${theme.studio.metadataSize};
    gap: ${theme.spacing.xs};
    justify-content: flex-start;
  }
  button:last-child {
    color: ${theme.colors.error};
  }

  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    position: sticky;
    bottom: 0;
    z-index: 1;
    margin-bottom: 0;
    background: ${theme.colors.background};
  }
`;

type Props = {
  source: string;
  selection: StudioSelection;
  report?: LayoutReport;
  edit: (change: (source: string) => string) => void;
  onClose: () => void;
  onOpenInspector: () => void;
  onDelete: () => void;
  onAdd: (kind: 'key' | 'rows' | 'columns') => void;
};

export default function SelectionPopover({
  source,
  selection,
  report,
  edit,
  onClose,
  onOpenInspector,
  onDelete,
  onAdd,
}: Props) {
  const count = targets(selection).length;
  const label =
    selection.section === 'objects'
      ? count === 1
        ? 'Selected part'
        : `${count} selected objects`
      : selection.section === 'columns'
        ? 'Selected column'
        : selection.section === 'rows'
          ? 'Selected row'
          : 'Selected cluster';

  return (
    <Popover
      aria-label="Selection quick actions"
      aria-labelledby="selection-quick-actions-title"
      data-testid="selection-quick-actions"
    >
      <TrayGrip aria-hidden="true" />
      <Header>
        <div>
          <h2 id="selection-quick-actions-title">{label}</h2>
        </div>
        <button className="open-inspector" onClick={onOpenInspector}>
          <SlidersHorizontal size={16} /> Open Inspector
        </button>
        <IconButton aria-label="Close selection actions" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </Header>
      <TrayBody>
        <SelectionControls
          source={source}
          selection={selection}
          report={report}
          edit={edit}
          compact
        />
        <QuickActions>
          <button aria-label="Add key" onClick={() => onAdd('key')}>
            <Plus size={16} /> Key
          </button>
          <button aria-label="Add row" onClick={() => onAdd('rows')}>
            <Plus size={16} /> Row
          </button>
          <button aria-label="Add column" onClick={() => onAdd('columns')}>
            <Plus size={16} /> Column
          </button>
          <button aria-label="Delete selection" onClick={onDelete}>
            <Trash2 size={16} /> Delete
          </button>
        </QuickActions>
      </TrayBody>
    </Popover>
  );
}

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
  z-index: 4;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  width: min(360px, calc(100% - ${theme.spacing.lg}));
  max-height: min(70vh, 520px);
  overflow: auto;
  padding: ${theme.spacing.md};
  color: ${theme.colors.text};
  background: ${theme.colors.backgroundLight};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.cad.fieldRadius};
  box-shadow: 0 12px 28px rgb(0 0 0 / 28%);

  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: min(52dvh, 520px);
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing.sm} ${theme.spacing.md}
      calc(${theme.spacing.md} + env(safe-area-inset-bottom));
    border-right: 0;
    border-bottom: 0;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -12px 28px rgb(0 0 0 / 28%);
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
  h2 {
    margin: 0;
    font-size: 14px;
  }
  p {
    margin: 0.2rem 0 0;
    color: ${theme.colors.textDarker};
    font-size: 12px;
  }

  @media (max-width: ${theme.workbench.phoneBreakpoint}) {
    position: sticky;
    top: 0;
    z-index: 1;
    flex-shrink: 0;
    margin: 0;
    padding-bottom: ${theme.spacing.sm};
    background: ${theme.colors.backgroundLight};
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
  display: inline-grid;
  place-items: center;
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
`;

const QuickActions = styled(StudioActions)`
  margin: ${theme.spacing.sm} 0;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border};
  button {
    gap: ${theme.spacing.xs};
    justify-content: flex-start;
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
          <p>Adjust the draft without opening the Inspector.</p>
        </div>
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
          <button onClick={onOpenInspector}>
            <SlidersHorizontal size={16} /> Open Inspector
          </button>
          <button onClick={() => onAdd('key')}>
            <Plus size={16} /> Add key
          </button>
          <button onClick={() => onAdd('rows')}>
            <Plus size={16} /> Add row
          </button>
          <button onClick={() => onAdd('columns')}>
            <Plus size={16} /> Add column
          </button>
          <button onClick={onDelete}>
            <Trash2 size={16} /> Delete selection
          </button>
        </QuickActions>
      </TrayBody>
    </Popover>
  );
}

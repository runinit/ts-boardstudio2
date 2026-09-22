import { Plus, SlidersHorizontal, Trash2, X } from 'lucide-react';
import styled from 'styled-components';
import type { LayoutReport } from 'ergogen/src/native';
import type { StudioSelection } from '../utils/studioTargets';
import { targets } from '../utils/studioTargets';
import { theme } from '../theme/theme';
import SelectionControls from './SelectionControls';
import { StudioActions } from './StudioStyles';

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
    <Popover aria-label="Selection quick actions">
      <Header>
        <div>
          <h2>{label}</h2>
          <p>Adjust the draft without opening the Inspector.</p>
        </div>
        <IconButton aria-label="Close selection actions" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </Header>
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
    </Popover>
  );
}

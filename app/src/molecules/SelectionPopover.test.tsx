import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SelectionPopover from './SelectionPopover';

vi.mock('./SelectionControls', () => ({
  default: () => <div aria-label="Selection adjustments" />,
}));

describe('SelectionPopover', () => {
  it('exposes common selection actions without opening the inspector', () => {
    const onAdd = vi.fn();
    const onDelete = vi.fn();
    const onOpenInspector = vi.fn();

    render(
      <SelectionPopover
        source="schema: ergogen/v1\nlayout: {objects: {key: {kind: key}}}\n"
        selection={{ section: 'objects', id: 'key' }}
        edit={vi.fn()}
        onClose={vi.fn()}
        onOpenInspector={onOpenInspector}
        onDelete={onDelete}
        onAdd={onAdd}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add row' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open Inspector' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete selection' }));

    expect(onAdd).toHaveBeenCalledWith('rows');
    expect(onOpenInspector).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
  });
});

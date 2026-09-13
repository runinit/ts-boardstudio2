import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SnapControls from './SnapControls';
import { defaultSnapping } from '../utils/layoutSnapping';
it('keeps increments, guides and edge gap in one snapping menu', () => {
  function Harness() {
    const [enabled, onEnabled] = useState(true);
    const [options, onChange] = useState(defaultSnapping);
    return (
      <SnapControls
        enabled={enabled}
        onEnabled={onEnabled}
        options={options}
        onChange={onChange}
        units={{ u: 19, v: 19 }}
      />
    );
  }
  render(<Harness />);
  fireEvent.click(screen.getByText('Options'));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Center guides' }));
  fireEvent.change(screen.getByLabelText('Snap edge gap'), {
    target: { value: '3' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Snapping' }));
  expect(
    screen.getByRole('button', { name: 'Snap increment 0.25u' })
  ).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Snapping' }));
  expect(
    screen.getByRole('checkbox', { name: 'Center guides' })
  ).not.toBeChecked();
  expect(screen.getByLabelText('Snap edge gap')).toHaveValue(3);
  expect(screen.queryByRole('button', { name: 'Canvas options' })).toBeNull();
});

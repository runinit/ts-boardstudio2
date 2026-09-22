import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SnapControls from './SnapControls';
import { defaultSnapping } from '../utils/layoutSnapping';
it('keeps increments, guides and edge gap in an inline snapping accordion', () => {
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
  const disclosure = screen.getByRole('button', { name: 'Snapping settings' });
  expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  expect(
    screen.queryByRole('button', { name: 'Snap increment 0.25u' })
  ).not.toBeInTheDocument();
  fireEvent.click(disclosure);
  fireEvent.click(screen.getByRole('button', { name: 'Center guides' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'More snapping settings' })
  );
  fireEvent.change(screen.getByLabelText('Snap edge gap'), {
    target: { value: '3' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Snapping' }));
  expect(
    screen.getByRole('button', { name: 'Snap increment 0.25u' })
  ).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Snapping' }));
  expect(screen.getByRole('button', { name: 'Center guides' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  expect(screen.getByLabelText('Snap edge gap')).toHaveValue(3);
  fireEvent.keyDown(screen.getByLabelText('Snap edge gap'), { key: 'Escape' });
  expect(disclosure).toHaveFocus();
  expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(disclosure);
  fireEvent.click(
    screen.getByRole('button', { name: 'More snapping settings' })
  );
  expect(screen.getByLabelText('Snap edge gap')).toHaveValue(3);
  fireEvent.pointerDown(document.body);
  expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(disclosure);
  expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  expect(
    screen.getByRole('region', { name: 'Snapping settings', hidden: true })
      .parentElement?.parentElement
  ).toHaveAttribute('inert');
  expect(screen.queryByRole('button', { name: 'Canvas options' })).toBeNull();
});

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DimensionField from './DimensionField';

it('labels expressions without replacing editable parameters with resolved numbers', () => {
  const commit = vi.fn();
  render(
    <DimensionField
      label="Gap"
      value="plate_gap"
      units={{ plate_gap: 5.4 }}
      onCommit={commit}
    />
  );
  const field = screen.getByLabelText('Gap');
  expect(field).toHaveValue('plate_gap');
  expect(field).toHaveAccessibleDescription('Expression = 5.4 mm');
  fireEvent.blur(field);
  expect(commit).not.toHaveBeenCalled();
  fireEvent.change(field, { target: { value: 'plate_gap / 2' } });
  fireEvent.keyDown(field, { key: 'Enter' });
  expect(commit).toHaveBeenCalledWith('plate_gap / 2');
});

it('rejects invalid edits and cancels them without a commit', () => {
  const commit = vi.fn();
  render(
    <DimensionField
      label="Stagger"
      value="0.25u"
      units={{ u: 19 }}
      onCommit={commit}
    />
  );
  const field = screen.getByLabelText('Stagger');
  expect(field).toHaveAccessibleDescription('Expression = 4.75 mm');
  fireEvent.change(field, { target: { value: 'missing + 1' } });
  fireEvent.blur(field);
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(commit).not.toHaveBeenCalled();
  fireEvent.keyDown(field, { key: 'Escape' });
  fireEvent.blur(field);
  expect(field).toHaveValue('0.25u');
  expect(field).toHaveAttribute('aria-invalid', 'false');
  expect(commit).not.toHaveBeenCalled();
});

it('updates the resolved measurement when a parameter changes', () => {
  const commit = vi.fn();
  const { rerender } = render(
    <DimensionField
      label="Stagger"
      value="0.25u"
      units={{ u: 19 }}
      onCommit={commit}
    />
  );
  rerender(
    <DimensionField
      label="Stagger"
      value="0.25u"
      units={{ u: 20 }}
      onCommit={commit}
    />
  );
  expect(screen.getByLabelText('Stagger')).toHaveAccessibleDescription(
    'Expression = 5 mm'
  );
  expect(screen.getByLabelText('Stagger')).toHaveValue('0.25u');
  expect(commit).not.toHaveBeenCalled();
});

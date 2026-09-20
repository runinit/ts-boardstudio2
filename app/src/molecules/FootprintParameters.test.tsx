import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { FootprintParameters } from './FootprintParameters';

it('exposes typed controls and rejects invalid finite numbers and JSON', () => {
  const change = vi.fn(),
    valid = vi.fn();
  render(
    <FootprintParameters
      definitions={{
        side: { type: 'string', value: 'F', choices: ['F', 'B'] },
        reversible: { type: 'boolean', value: false },
        width: { type: 'number', value: 1 },
        offset: { type: 'array', value: [0, 0, 0] },
      }}
      values={{}}
      onChange={change}
      onValidity={valid}
    />
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'reversible' }));
  expect(change).toHaveBeenLastCalledWith('reversible', true);
  fireEvent.change(screen.getByRole('combobox', { name: 'side' }), {
    target: { value: 'B' },
  });
  expect(change).toHaveBeenLastCalledWith('side', 'B');
  const width = screen.getByRole('spinbutton', { name: 'width' });
  fireEvent.change(width, { target: { value: '' } });
  fireEvent.blur(width);
  expect(width).toHaveAttribute('aria-invalid', 'true');
  expect(valid).toHaveBeenLastCalledWith(false);
  const offset = screen.getByRole('textbox', { name: 'offset' });
  fireEvent.change(offset, { target: { value: '[1,' } });
  fireEvent.blur(offset);
  expect(offset).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(width, { target: { value: '2' } });
  fireEvent.blur(width);
  fireEvent.change(offset, { target: { value: '[1,2,3]' } });
  fireEvent.blur(offset);
  expect(change).toHaveBeenLastCalledWith('offset', [1, 2, 3]);
  expect(valid).toHaveBeenLastCalledWith(true);
});

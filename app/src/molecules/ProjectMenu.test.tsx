import { fireEvent, render, screen } from '@testing-library/react';
import ProjectMenu from './ProjectMenu';

it('dismisses project actions with Escape and restores focus', () => {
  render(
    <ProjectMenu>
      <button>Design setup</button>
    </ProjectMenu>
  );
  const trigger = screen.getByLabelText('Project actions');
  fireEvent.click(trigger);
  const action = screen.getByRole('button', { name: 'Design setup' });
  action.focus();
  fireEvent.keyDown(action, { key: 'Escape' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveFocus();
});

it('closes after an action or an outside pointer press', () => {
  const apply = vi.fn();
  render(
    <ProjectMenu>
      <button onClick={apply}>Design setup</button>
    </ProjectMenu>
  );
  const trigger = screen.getByLabelText('Project actions');
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Design setup' }));
  expect(apply).toHaveBeenCalledOnce();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

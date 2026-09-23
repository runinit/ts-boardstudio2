import { useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SnapControls from './SnapControls';
import { defaultSnapping } from '../utils/layoutSnapping';

it('sizes the upward panel from the snap dock instead of its trailing button', () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
  const bounds = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const viewport = this.dataset.viewport !== undefined;
      const x = viewport ? 0 : this.tagName === 'BUTTON' ? 300 : 60;
      const y = viewport ? 200 : 650;
      const width = viewport ? 390 : 44;
      const height = viewport ? 580 : 44;
      return {
        x,
        y,
        width,
        height,
        left: x,
        top: y,
        right: x + width,
        bottom: y + height,
        toJSON: () => ({}),
      };
    });
  function Harness() {
    const viewport = useRef<HTMLDivElement>(null);
    return (
      <div ref={viewport} data-viewport>
        <SnapControls
          enabled
          onEnabled={() => {}}
          options={defaultSnapping}
          onChange={() => {}}
          units={{ u: 19, v: 19 }}
          viewport={viewport}
        />
      </div>
    );
  }
  try {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Snapping settings' }));
    const panel = screen.getByRole('region', { name: 'Snapping settings' });
    expect(panel.parentElement?.parentElement).toHaveStyle({ width: '272px' });
  } finally {
    bounds.mockRestore();
    vi.unstubAllGlobals();
  }
});
it('clamps the upward panel to available width and height near a narrow right edge', () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
  const bounds = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const viewport = this.dataset.viewport !== undefined;
      // The upward dock sits near the right edge of a short mobile canvas.
      const x = viewport ? 0 : 350;
      const y = viewport ? 0 : 120;
      const width = viewport ? 390 : 44;
      const height = viewport ? 580 : 40;
      return {
        x,
        y,
        width,
        height,
        left: x,
        top: y,
        right: x + width,
        bottom: y + height,
        toJSON: () => ({}),
      };
    });
  function Harness() {
    const viewport = useRef<HTMLDivElement>(null);
    return (
      <div ref={viewport} data-viewport>
        <SnapControls
          enabled
          onEnabled={() => {}}
          options={defaultSnapping}
          onChange={() => {}}
          units={{ u: 19, v: 19 }}
          viewport={viewport}
        />
      </div>
    );
  }
  try {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Snapping settings' }));
    const panel = screen.getByRole('region', { name: 'Snapping settings' });
    const slide = panel.parentElement?.parentElement as HTMLElement;
    // 272px tool options would overflow the 40px between dock and viewport edge.
    const width = parseFloat(slide.style.width);
    expect(width).toBeGreaterThan(0);
    expect(width).toBeLessThan(272);
    // Short canvas: cap the upward height to the space above the dock.
    const maxHeight = parseFloat(panel.style.maxHeight);
    expect(maxHeight).toBeGreaterThan(0);
    expect(maxHeight).toBeLessThan(580);
  } finally {
    bounds.mockRestore();
    vi.unstubAllGlobals();
  }
});
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

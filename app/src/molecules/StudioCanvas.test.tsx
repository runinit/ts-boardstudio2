import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { parse } from 'yaml';
import { resolveLayout } from 'ergogen/src/native/draft';
import type { LayoutReport } from 'ergogen/src/native';
import StudioCanvas from './StudioCanvas';
import { theme } from '../theme/theme';
const report = {
  objects: {
    key: {
      id: 'key',
      label: 'key',
      kind: 'key',
      position: [0, 0, 0],
      cluster: 'fingers',
      cell: ['c1', 'r1'],
      envelopes: { keycap: { size: [18, 18] } },
      matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    },
  },
  clusters: {},
  layers: {},
  findings: [],
} as unknown as LayoutReport;
it('keeps the viewport stable while selecting a column to move', () => {
  const select = vi.fn();
  Object.defineProperty(SVGSVGElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    value: () => null,
  });
  try {
    render(
      <StudioCanvas
        report={report}
        selection={{ section: 'columns', id: 'c1', cluster: 'fingers' }}
        onSelect={select}
        onMove={vi.fn()}
        stale={false}
        source=""
        side="top"
        onSide={vi.fn()}
        rules={{}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select Columns' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Select key' }));
    expect(select).toHaveBeenLastCalledWith(
      { section: 'columns', id: 'c1', cluster: 'fingers' },
      'keep'
    );
    fireEvent.pointerCancel(
      screen.getByRole('group', { name: 'Interactive board layout' })
    );
  } finally {
    Reflect.deleteProperty(SVGSVGElement.prototype, 'setPointerCapture');
    Reflect.deleteProperty(SVGSVGElement.prototype, 'getScreenCTM');
  }
});

it('starts an object move in Select mode without changing tools', () => {
  const select = vi.fn();
  Object.defineProperty(SVGSVGElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    value: () => null,
  });
  try {
    render(
      <StudioCanvas
        report={report}
        selection={{ section: 'objects', id: '' }}
        onSelect={select}
        onMove={vi.fn()}
        stale={false}
        source=""
        side="top"
        onSide={vi.fn()}
        rules={{}}
      />
    );
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Select key' }));
    expect(select).toHaveBeenCalledWith(
      { section: 'objects', id: 'key' },
      'keep'
    );
    expect(screen.getByRole('status')).toHaveTextContent(/drag/i);
  } finally {
    Reflect.deleteProperty(SVGSVGElement.prototype, 'setPointerCapture');
    Reflect.deleteProperty(SVGSVGElement.prototype, 'getScreenCTM');
  }
});

it('keeps the camera fixed when a dropped object changes the layout bounds', () => {
  Object.defineProperty(SVGSVGElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    value: () => null,
  });
  try {
    const props = {
      selection: { section: 'objects' as const, id: 'key' },
      onSelect: vi.fn(),
      onMove: vi.fn(),
      stale: false,
      source: '',
      side: 'top' as const,
      onSide: vi.fn(),
      rules: {},
    };
    const view = render(<StudioCanvas {...props} report={report} />);
    const svg = screen.getByRole('group', { name: 'Interactive board layout' });
    const before = svg.getAttribute('viewBox');
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Select key' }));
    fireEvent.pointerUp(svg);
    const matrix = [...report.objects.key.matrix];
    matrix[3] = 20;
    view.rerender(
      <StudioCanvas
        {...props}
        report={{
          ...report,
          objects: {
            key: { ...report.objects.key, matrix, position: [20, 0, 0] },
          },
        }}
      />
    );
    expect(svg.getAttribute('viewBox')).toBe(before);
  } finally {
    Reflect.deleteProperty(SVGSVGElement.prototype, 'setPointerCapture');
    Reflect.deleteProperty(SVGSVGElement.prototype, 'getScreenCTM');
  }
});

it('commits keyboard nudges while analysis is stale', () => {
  const move = vi.fn();
  const props = {
    selection: { section: 'objects' as const, id: 'key' },
    onSelect: vi.fn(),
    onMove: move,
    stale: false,
    source: 'schema: ergogen/v1\nlayout: {objects: {key: {kind: key}}}',
    side: 'top' as const,
    onSide: vi.fn(),
    rules: {},
  };
  render(<StudioCanvas {...props} report={report} stale />);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Select key' }), {
    key: 'ArrowRight',
  });
  expect(move).toHaveBeenCalledOnce();
});

it('draws each accepted draft pose while background analysis is pending', () => {
  const quarterUnit = 4.75;
  let source =
    'schema: ergogen/v1\nlayout: {objects: {key: {kind: key, envelopes: {keycap: {size: [18, 18]}}}}}';
  function Draft() {
    const [draft, setDraft] = useState(source);
    source = draft;
    return (
      <StudioCanvas
        source={draft}
        report={resolveLayout(parse(draft))}
        stale
        selection={{ section: 'objects', id: 'key' }}
        onSelect={vi.fn()}
        onMove={(_selection, _delta, _before, candidate) =>
          setDraft(candidate!)
        }
        side="top"
        onSide={vi.fn()}
        rules={{}}
      />
    );
  }
  render(<Draft />);
  const key = screen.getByRole('button', { name: 'Select key' });
  const canvas = screen.getByRole('group', {
    name: 'Interactive board layout',
  });
  const camera = canvas.getAttribute('viewBox');
  const start = key.querySelector('polygon')!.getAttribute('points');

  fireEvent.keyDown(key, { key: 'ArrowRight' });
  expect(parse(source).layout.objects.key.placement.override.at).toEqual([
    quarterUnit,
    0,
    0,
  ]);
  const first = key.querySelector('polygon')!.getAttribute('points');
  expect(first).not.toBe(start);

  fireEvent.keyDown(key, { key: 'ArrowUp' });
  expect(parse(source).layout.objects.key.placement.override.at).toEqual([
    quarterUnit,
    quarterUnit,
    0,
  ]);
  expect(key.querySelector('polygon')!.getAttribute('points')).not.toBe(first);
  expect(canvas).toHaveAttribute('viewBox', camera!);
});
it('opens selection controls after a click without opening them during pointer movement', () => {
  Object.defineProperty(SVGSVGElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    value: () => null,
  });
  try {
    const select = vi.fn();
    render(
      <StudioCanvas
        report={report}
        selection={{ section: 'objects', id: '' }}
        onSelect={select}
        onMove={vi.fn()}
        stale={false}
        source=""
        side="top"
        onSide={vi.fn()}
        rules={{}}
      />
    );
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Select key' }));
    expect(select).toHaveBeenCalledWith(
      { section: 'objects', id: 'key' },
      'keep'
    );
    fireEvent.pointerUp(
      screen.getByRole('group', { name: 'Interactive board layout' })
    );
    expect(select).toHaveBeenCalledTimes(1);
  } finally {
    Reflect.deleteProperty(SVGSVGElement.prototype, 'setPointerCapture');
    Reflect.deleteProperty(SVGSVGElement.prototype, 'getScreenCTM');
  }
});

it('preserves the chosen scope when selection changes outside the canvas', () => {
  const props = {
    report,
    onSelect: vi.fn(),
    onMove: vi.fn(),
    stale: false,
    source: '',
    side: 'top' as const,
    onSide: vi.fn(),
    rules: {},
  };
  const { rerender } = render(
    <StudioCanvas {...props} selection={{ section: 'columns', id: 'c1' }} />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select Matrices' }));
  rerender(
    <StudioCanvas {...props} selection={{ section: 'objects', id: 'key' }} />
  );
  expect(
    screen.getByRole('button', { name: 'Select Matrices' })
  ).toHaveAttribute('aria-pressed', 'true');
});

it('flushes the final pointer delta on release before its animation frame', () => {
  const move = vi.fn();
  vi.stubGlobal('PointerEvent', MouseEvent);
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1)
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal(
    'DOMPoint',
    class {
      constructor(
        public x: number,
        public y: number
      ) {}
      matrixTransform() {
        return this;
      }
    }
  );
  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    value: () => ({ a: 1, b: 0, inverse: () => ({}) }),
  });
  Object.defineProperty(SVGSVGElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(SVGSVGElement.prototype, 'hasPointerCapture', {
    configurable: true,
    value: () => false,
  });
  const props = {
    report,
    selection: { section: 'objects' as const, id: 'key' },
    onSelect: vi.fn(),
    onMove: move,
    stale: true,
    source: 'schema: ergogen/v1\nlayout: {objects: {key: {kind: key}}}\n',
    side: 'top' as const,
    onSide: vi.fn(),
    rules: {},
  };
  try {
    const view = render(<StudioCanvas {...props} />);
    const key = screen.getByRole('button', { name: 'Select key' });
    const svg = screen.getByRole('group', { name: 'Interactive board layout' });
    fireEvent.pointerDown(key, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(svg, { clientX: 5, clientY: 0, altKey: true });
    view.rerender(
      <StudioCanvas
        {...props}
        source={props.source + 'meta: {name: changed}\n'}
      />
    );
    fireEvent.pointerUp(svg, { clientX: 5, clientY: 0 });
    expect(move).toHaveBeenCalledOnce();
    expect(move.mock.calls[0][1]).toEqual([5, 0, 0]);
    expect(move.mock.calls[0][3]).toContain('name: changed');
  } finally {
    vi.unstubAllGlobals();
    for (const name of [
      'getScreenCTM',
      'setPointerCapture',
      'hasPointerCapture',
    ]) {
      Reflect.deleteProperty(SVGSVGElement.prototype, name);
    }
  }
});

it('selects the physical row from the canvas row tool', () => {
  const select = vi.fn();
  Object.defineProperty(SVGSVGElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    value: () => null,
  });
  try {
    render(
      <StudioCanvas
        report={report}
        selection={{ section: 'objects', id: '' }}
        onSelect={select}
        onMove={vi.fn()}
        stale={false}
        source=""
        side="top"
        onSide={vi.fn()}
        rules={{}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select Rows' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Select key' }));
    expect(select).toHaveBeenLastCalledWith(
      { section: 'rows', cluster: 'fingers', id: 'r1' },
      'keep'
    );
  } finally {
    Reflect.deleteProperty(SVGSVGElement.prototype, 'setPointerCapture');
    Reflect.deleteProperty(SVGSVGElement.prototype, 'getScreenCTM');
  }
});

it('draws a dashed boundary, amber cross, and pitch annotation for a row', () => {
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const rowObjects = Object.fromEntries(
    [0, 1, 2].map((i) => {
      const matrix = [...identity];
      matrix[3] = i * 19.05;
      return [
        `c${i + 1}r1`,
        {
          id: `c${i + 1}r1`,
          label: `c${i + 1}r1`,
          kind: 'key',
          position: [i * 19.05, 0, 0],
          cluster: 'fingers',
          cell: [`c${i + 1}`, 'r1'],
          envelopes: { keycap: { size: [18, 18] } },
          matrix,
        },
      ];
    })
  );
  const rowReport = {
    objects: rowObjects,
    clusters: {},
    layers: {},
    findings: [],
  } as unknown as LayoutReport;
  render(
    <StudioCanvas
      report={rowReport}
      selection={{ section: 'rows', cluster: 'fingers', id: 'r1' }}
      onSelect={vi.fn()}
      onMove={vi.fn()}
      stale={false}
      source="schema: ergogen/v1\nunits: {u: 19.05}\n"
      side="top"
      onSide={vi.fn()}
      rules={{}}
    />
  );
  expect(
    screen.getByRole('img', { name: 'Selected area' })
  ).toBeInTheDocument();
  expect(screen.getByText(/pitch: .* × 3 keys \(/)).toBeInTheDocument();
  const key = screen.getByRole('button', { name: 'Select c2r1' });
  expect(key.querySelector('polygon')).toHaveAttribute(
    'stroke',
    theme.studio.selection.stroke
  );
  expect(key.querySelectorAll('path').length).toBe(1);
});

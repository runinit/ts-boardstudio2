import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { parse } from 'yaml';
import { resolveLayout } from 'ergogen/src/native/draft';
import type StudioCanvas from './StudioCanvas';
import { compileSetup, defaultSetup } from '../utils/designSetup';
import { setValue } from '../utils/studioSource';
import BoardStudio from './BoardStudio';
import { useCasePreview } from '../hooks/useCasePreview';
import { useStudio } from '../hooks/useStudio';

let current = '';
const hooks = vi.hoisted(() => ({ useConfigContext: vi.fn() }));
const canvas = vi.hoisted(() => ({
  props: null as ComponentProps<typeof StudioCanvas> | null,
}));
vi.mock('../context/ConfigContext', () => hooks);
vi.mock('../hooks/useCasePreview', () => ({
  useCasePreview: vi.fn(() => ({
    result: null,
    stale: true,
    pending: false,
    error: '',
    diagnostics: [],
    generate: vi.fn(),
    cancel: vi.fn(),
  })),
  useLayoutAnalysis: vi.fn(() => ({
    result: null,
    stale: false,
    pending: false,
    error: '',
    generate: vi.fn(),
  })),
}));
vi.mock('../hooks/useStudio', () => ({
  useStudio: vi.fn(() => ({
    analysis: {
      result: {
        layout: {
          objects: {},
          clusters: {},
          layers: {},
          units: {},
          findings: [],
        },
      },
      diagnostics: [],
      error: '',
      pending: false,
      stale: false,
      generate: vi.fn(),
      cancel: vi.fn(),
    },
    report: { objects: {}, clusters: {}, layers: {}, units: {}, findings: [] },
    automatic: true,
    toggle: vi.fn(),
    rebuild: vi.fn(),
  })),
}));
vi.mock('./StudioCanvas', () => ({
  default: (props: ComponentProps<typeof StudioCanvas>) => {
    canvas.props = props;
    return (
      <div aria-label="Layout canvas" data-stale={String(props.stale)}>
        {Object.keys(props.report?.objects || {}).join(',')}
      </div>
    );
  },
}));
vi.mock('../utils/caseAssets', () => ({ loadAssets: async () => ({}) }));
vi.mock('./ConfigEditor', () => ({ default: () => <div>Code editor</div> }));
vi.mock('./FootprintLibrary', () => ({
  default: ({ onPreview }: { onPreview: () => void }) => (
    <button onClick={onPreview}>Preview in case</button>
  ),
}));
vi.mock('./CaseWizard', () => ({ default: () => <div>Case tools</div> }));
vi.mock('./FilePreview', () => ({ default: () => <div>PCB viewer</div> }));
function Harness({ initial }: { initial?: string }) {
  const [source, setSource] = useState(
    initial || 'schema: ergogen/v1\nunits: {pitch: 19}\nlayout: {objects: {}}\n'
  );
  current = source;
  hooks.useConfigContext.mockReturnValue({
    configInput: source,
    getRealtimeConfigInput: () => source,
    editSource: setSource,
    activeConfigName: 'Test board',
    injectionInput: [],
    setCadActive: vi.fn(),
    setShowSideNav: vi.fn(),
    setShowSettings: vi.fn(),
    canUndo: false,
    canRedo: false,
  });
  return <BoardStudio />;
}
const openInspector = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Inspector' }));
const toggleCode = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Project actions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Code' }));
};
it('keeps the Inspector closed until explicitly opened on desktop', () => {
  const width = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1400,
  });
  try {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Inspector' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  } finally {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
    });
  }
});
it('creates and edits a parametric thumb cluster without opening Code', async () => {
  render(<Harness />);
  openInspector();
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  fireEvent.change(screen.getByLabelText('New item kind'), {
    target: { value: 'arc' },
  });
  fireEvent.change(screen.getByLabelText('New item name'), {
    target: { value: 'thumbs' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  expect(parse(current).layout.clusters.thumbs.arrangement.type).toBe('arc');
  expect(Object.keys(parse(current).layout.objects)).toHaveLength(3);
  fireEvent.blur(screen.getByLabelText('Radius'), {
    target: { value: 'pitch * 2' },
  });
  expect(parse(current).layout.clusters.thumbs.arrangement.radius).toBe(
    'pitch * 2'
  );
  fireEvent.click(screen.getByLabelText('Solve x'));
  expect(parse(current).layout.clusters.thumbs.placement.solve).toEqual(['x']);
  expect(screen.queryByText('Code editor')).not.toBeInTheDocument();
});
it('keeps workflow destinations and code accessible', () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Case' }));
  expect(screen.getByText('Case tools')).toBeInTheDocument();
  toggleCode();
  expect(screen.getByText('Code editor')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Export' }));
  expect(screen.getByRole('button', { name: 'Download YAML' })).toBeEnabled();
  expect(
    screen.getByRole('button', { name: 'Download PCB and outlines ZIP' })
  ).toBeDisabled();
});

it('uses the same generation controller across case and export navigation', () => {
  const generate = vi.fn();
  vi.mocked(useCasePreview).mockReturnValue({
    result: null,
    stale: true,
    pending: false,
    error: '',
    diagnostics: [],
    generate,
    cancel: vi.fn(),
  });
  vi.mocked(useStudio).mockReturnValue({
    ...vi.mocked(useStudio).mock.results[0].value,
    analysis: {
      ...vi.mocked(useStudio).mock.results[0].value.analysis,
      result: null,
      stale: false,
      pending: false,
      error: '',
      diagnostics: [],
      generate: vi.fn(),
      cancel: vi.fn(),
    },
  });
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Generate project' }));
  expect(generate).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Case' }));
  fireEvent.click(screen.getByRole('button', { name: 'Export' }));
  fireEvent.click(screen.getByRole('button', { name: 'Generate project' }));
  expect(generate).toHaveBeenCalledTimes(2);
});
it('creates a 5 by 4 matrix and edits a whole column and its individual cells', () => {
  render(<Harness />);
  openInspector();
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  fireEvent.change(screen.getByLabelText('New item name'), {
    target: { value: 'matrix' },
  });
  expect(screen.getByLabelText('New matrix columns')).toHaveValue(5);
  expect(screen.getByLabelText('New matrix rows')).toHaveValue(4);
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  expect(Object.keys(parse(current).layout.objects)).toHaveLength(20);
  fireEvent.click(screen.getAllByRole('button', { name: 'Column 2 · c2' })[0]);
  fireEvent.blur(screen.getByLabelText('Column splay'), {
    target: { value: '8' },
  });
  expect(parse(current).layout.clusters.matrix.arrangement.splay.c2).toBe(8);
  fireEvent.click(screen.getByRole('button', { name: 'Remove matrix_c2_r1' }));
  expect(parse(current).layout.objects.matrix_c2_r1).toBeUndefined();
  fireEvent.click(screen.getByRole('button', { name: 'Add key in row 1' }));
  expect(parse(current).layout.objects.matrix_c2_r1.cell).toEqual(['c2', 'r1']);
  expect(parse(current).layout.objects.matrix_c2_r1.properties).toBeUndefined();
});
it('shows authored cluster counts even before outline analysis succeeds', () => {
  render(<Harness />);
  openInspector();
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  fireEvent.change(screen.getByLabelText('New item name'), {
    target: { value: 'thumbs' },
  });
  fireEvent.change(screen.getByLabelText('New item kind'), {
    target: { value: 'arc' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  expect(screen.getByRole('button', { name: 'thumbs 3 keys' })).toBeVisible();
});
it('keeps an empty free cluster selectable and deletable', () => {
  render(<Harness />);
  openInspector();
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  fireEvent.change(screen.getByLabelText('New item name'), {
    target: { value: 'free' },
  });
  fireEvent.change(screen.getByLabelText('New item kind'), {
    target: { value: 'free' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  expect(screen.getByRole('button', { name: 'free 0 keys' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(parse(current).layout.clusters.free).toBeUndefined();
});

it('opens the case from the footprint library preview action', async () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Library' }));
  fireEvent.click(
    await screen.findByRole('button', { name: 'Preview in case' })
  );
  expect(screen.getByText('Case tools')).toBeInTheDocument();
});

it('reviews an edited column removal and preserves the source on Cancel', () => {
  const source = setValue(
    compileSetup({ ...defaultSetup(), columns: 2, rows: 1 }),
    ['layout', 'objects', 'fingers_c2_r1', 'placement'],
    { override: { at: [2, 0, 0] } }
  );
  render(<Harness initial={source} />);
  openInspector();
  fireEvent.click(screen.getByRole('button', { name: 'fingers 2 keys' }));
  fireEvent.change(screen.getByLabelText('Matrix columns'), {
    target: { value: '1' },
  });
  expect(
    screen.getByRole('dialog', { name: 'Review matrix resize' })
  ).toBeVisible();
  expect(current).toBe(source);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(current).toBe(source);
  expect(screen.getByLabelText('Matrix columns')).toHaveValue(2);
  fireEvent.change(screen.getByLabelText('Matrix columns'), {
    target: { value: '1' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove keys and resize' })
  );
  const objects = parse(current).layout.objects;
  expect(objects.fingers_c2_r1).toBeUndefined();
  expect(objects.fingers_c2_r1_diode).toBeUndefined();
  expect(parse(current).layout.clusters.fingers.arrangement.columns).toEqual([
    'c1',
  ]);
});

it('applies an arrangement count while the field is edited', () => {
  const source = setValue(
    compileSetup({ ...defaultSetup(), columns: 2, rows: 1 }),
    ['layout', 'objects', 'fingers_c2_r1', 'placement'],
    { override: { at: [2, 0, 0] } }
  );
  render(<Harness initial={source} />);
  openInspector();
  fireEvent.click(screen.getByRole('button', { name: 'fingers 2 keys' }));
  fireEvent.change(screen.getByLabelText('Matrix columns'), {
    target: { value: '1' },
  });

  expect(
    screen.getByRole('dialog', { name: 'Review matrix resize' })
  ).toBeVisible();
});

it('deletes the selected column but leaves Delete in text fields alone', () => {
  vi.mocked(useStudio).mockReturnValue({
    ...vi.mocked(useStudio).mock.results[0].value,
    analysis: {
      ...vi.mocked(useStudio).mock.results[0].value.analysis,
      result: {
        layout: {
          objects: {},
          clusters: {},
          layers: {},
          units: {},
          findings: [],
        },
      },
      pending: false,
      stale: false,
      error: '',
      diagnostics: [],
    },
  });
  render(
    <Harness
      initial={
        'schema: ergogen/v1\nlayout: {clusters: {main: {arrangement: {type: columns, columns: [c1,c2], rows: [r1]}}}, objects: {a: {kind: key, cluster: main, cell: [c1,r1]}, b: {kind: key, cluster: main, cell: [c2,r1]}}}'
      }
    />
  );
  openInspector();
  fireEvent.click(screen.getAllByRole('button', { name: 'Column 1 · c1' })[0]);
  const before = current;
  fireEvent.keyDown(screen.getByLabelText('Column splay'), { key: 'Delete' });
  expect(current).toBe(before);
  fireEvent.keyDown(screen.getByRole('region', { name: 'Board Studio' }), {
    key: 'Delete',
  });
  expect(Object.keys(parse(current).layout.objects)).toEqual(['b']);
  expect(parse(current).layout.clusters.main.arrangement.columns).toEqual([
    'c2',
  ]);
});

it('keeps cancellation available while Case is generating', () => {
  const cancel = vi.fn();
  vi.mocked(useCasePreview).mockReturnValue({
    result: null,
    stale: true,
    pending: true,
    error: '',
    diagnostics: [],
    generate: vi.fn(),
    cancel,
  });
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Case' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel generation' }));
  expect(cancel).toHaveBeenCalledOnce();
});

it('returns to the part library after closing Code', async () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Library' }));
  expect(
    await screen.findByRole('button', { name: 'Preview in case' })
  ).toBeVisible();
  toggleCode();
  expect(screen.getByText('Code editor')).toBeVisible();
  toggleCode();
  expect(
    await screen.findByRole('button', { name: 'Preview in case' })
  ).toBeVisible();
});

it('opens case creation from Export when the project has no assembly', () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Export' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'Review case and manufacturing' })
  );
  expect(screen.getByText('Case tools')).toBeVisible();
});

const MOVE_SOURCE = `schema: ergogen/v1
layout:
  objects:
    key: {kind: key, envelopes: {keycap: {size: [18, 18]}}}
`;
it.each([
  { stale: true, pending: false },
  { stale: false, pending: true },
  { stale: true, pending: true },
])('accumulates moves with analysis %j', (status) => {
  const original = vi.mocked(useStudio).getMockImplementation()!;
  const state = original({} as Parameters<typeof useStudio>[0]);
  vi.mocked(useStudio).mockImplementation(({ source }) => ({
    ...state,
    report: resolveLayout(parse(source)),
    analysis: { ...state.analysis, ...status, error: '' },
  }));
  try {
    render(<Harness initial={MOVE_SOURCE} />);
    for (const delta of [
      [1, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
    ]) {
      act(() => {
        expect(
          canvas.props!.onMove(
            { section: 'objects', id: 'key' },
            delta,
            current
          )
        ).toBe(true);
      });
    }
    expect(parse(current).layout.objects.key.placement.override.at).toEqual([
      2, 1, 0,
    ]);
  } finally {
    vi.mocked(useStudio).mockImplementation(original);
  }
});

it.each(['race', 'locked', 'missing report', 'analysis error'])(
  'rejects a move with %s without changing source',
  (reason) => {
    const original = vi.mocked(useStudio).getMockImplementation()!;
    const state = original({} as Parameters<typeof useStudio>[0]);
    const source =
      reason === 'locked'
        ? setValue(MOVE_SOURCE, ['layout', 'objects', 'key', 'locked'], true)
        : MOVE_SOURCE;
    vi.mocked(useStudio).mockReturnValue({
      ...state,
      report:
        reason === 'missing report' ? undefined : resolveLayout(parse(source)),
      analysis: {
        ...state.analysis,
        stale: false,
        pending: false,
        error: reason === 'analysis error' ? 'Invalid geometry' : '',
      },
    });
    try {
      render(<Harness initial={source} />);
      act(() => {
        expect(
          canvas.props!.onMove(
            { section: 'objects', id: 'key' },
            [1, 0, 0],
            reason === 'race' ? source + '# older revision' : source
          )
        ).toBe(false);
      });
      expect(current).toBe(source);
    } finally {
      vi.mocked(useStudio).mockImplementation(original);
    }
  }
);

describe('project status copy', () => {
  let original: typeof useStudio;
  let state: ReturnType<typeof useStudio>;
  beforeEach(() => {
    original = vi.mocked(useStudio).getMockImplementation()!;
    const previous = original({ source: MOVE_SOURCE } as Parameters<
      typeof useStudio
    >[0]);
    const report = resolveLayout(parse(MOVE_SOURCE));
    state = {
      ...previous,
      report,
      analysis: {
        ...previous.analysis,
        result: { layout: report },
        error: '',
        pending: false,
        stale: false,
        diagnostics: [],
      },
    };
    vi.mocked(useStudio).mockReturnValue(state);
  });
  afterEach(() => vi.mocked(useStudio).mockImplementation(original));

  it('shows fitted corner locations in project findings', () => {
    vi.mocked(useStudio).mockReturnValue({
      ...state,
      analysis: {
        ...state.analysis,
        result: {
          ...state.analysis.result,
          designs: {
            features: {},
            adjustments: [],
            assemblies: {},
            diagnostics: [
              {
                feature: 'designs.boundaries.main',
                sourcePath: 'designs.boundaries.main.corners',
                code: 'corner-relief-fit',
                severity: 'warning',
                at: [20, 30],
                requested: 2,
                applied: 1,
                message: 'Corner relief at (20, 30) mm fitted to 1 mm',
              },
            ],
          },
        },
      },
    });
    render(<Harness initial={MOVE_SOURCE} />);
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 finding' }));
    expect(
      screen.getByRole('region', { name: 'Project findings' })
    ).toHaveTextContent('Corner relief at (20, 30) mm fitted to 1 mm');
  });

  it.each([1, 2])(
    'distinguishes current positions from %i export blockers',
    (count) => {
      vi.mocked(useStudio).mockReturnValue({
        ...state,
        analysis: {
          ...state.analysis,
          diagnostics: Array.from({ length: count }, (_, index) => ({
            severity: 'error' as const,
            code: `missing-${index}`,
            feature: 'layout.objects.key',
            message: `Missing part ${index + 1}`,
          })),
        },
      });
      render(<Harness initial={MOVE_SOURCE} />);
      expect(
        screen.getByRole('status', { name: 'Project status' })
      ).toHaveTextContent('Layout positions current');
      const review = screen.getByRole('button', {
        name: `Review ${count} ${count === 1 ? 'blocker' : 'blockers'}`,
      });
      fireEvent.click(review);
      expect(review).toHaveAttribute('aria-expanded', 'true');
      const findings = screen.getByRole('region', { name: 'Project findings' });
      expect(findings).toHaveTextContent(
        'Resolve blockers before downloading PCB and outline files.'
      );
      expect(findings).toHaveTextContent(
        'Case downloads have separate checks in Export.'
      );
      expect(
        within(findings).getByRole('button', { name: /Missing part 1/ })
      ).toBeEnabled();
    }
  );

  it('does not describe an analysis error as a clean findings result', () => {
    vi.mocked(useStudio).mockReturnValue({
      ...state,
      analysis: { ...state.analysis, error: 'Invalid board contour' },
    });
    render(<Harness initial={MOVE_SOURCE} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Review analysis error' })
    );
    const findings = screen.getByRole('region', { name: 'Project findings' });
    expect(within(findings).getByRole('alert')).toHaveTextContent(
      'Invalid board contour'
    );
    expect(findings).not.toHaveTextContent(/No (current|findings)/);
    expect(
      screen.getByRole('status', { name: 'Project status' })
    ).toHaveTextContent('Layout analysis failed');
  });

  it('names an empty findings result without claiming export readiness', () => {
    render(<Harness initial={MOVE_SOURCE} />);
    fireEvent.click(screen.getByRole('button', { name: 'View findings' }));
    expect(
      screen.getByRole('region', { name: 'Project findings' })
    ).toHaveTextContent(
      'No findings from the current analysis. Check Export for download readiness.'
    );
  });

  it('opens the controller picker from a missing-controller blocker', () => {
    const source = compileSetup({ ...defaultSetup(), columns: 2, rows: 2 });
    render(<Harness initial={source} />);
    toggleCode();
    fireEvent.click(screen.getByRole('button', { name: /Review .* blockers/ }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /Choose a controller before PCB review/,
      })
    );

    expect(screen.getByLabelText('Component catalogue')).toBeVisible();
    expect(screen.getByLabelText('New item kind')).toHaveValue('component');
    expect(screen.getByRole('button', { name: 'Inspector' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.queryByText('Case tools')).not.toBeInTheDocument();
    expect(screen.queryByText('Code editor')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Project findings' })
    ).not.toBeInTheDocument();
  });

  it('identifies findings as pending while analysis is updating', () => {
    vi.mocked(useStudio).mockReturnValue({
      ...state,
      analysis: { ...state.analysis, pending: true },
    });
    render(<Harness initial={MOVE_SOURCE} />);
    fireEvent.click(screen.getByRole('button', { name: 'View findings' }));
    expect(
      screen.getByRole('region', { name: 'Project findings' })
    ).toHaveTextContent('Findings update when layout analysis finishes.');
    expect(
      screen.getByRole('status', { name: 'Project status' })
    ).toHaveTextContent('Updating layout…');
  });
});

describe('raw matrix wiring readiness', () => {
  it.each([
    ['clean', false, false],
    ['conflict', true, false],
    ['repaired', false, true],
  ] as const)(
    'sets PCB readiness from the current resolved junction %s',
    (_label, conflict, stored) => {
      const setup = {
        ...defaultSetup(),
        columns: 1,
        rows: 1,
        controller: 'promicro',
      };
      const clean = setValue(
        compileSetup(setup),
        ['meta', 'studio', 'findings'],
        []
      );
      const edited = conflict
        ? setValue(
            clean,
            [
              'layout',
              'objects',
              'fingers_c1_r1_diode',
              'footprints',
              'main',
              'params',
              'from',
            ],
            'RAW_BREAK'
          )
        : clean;
      const source = stored
        ? setValue(
            edited,
            ['meta', 'studio', 'electricalFindings'],
            [
              'main: matrix wiring fingers_c1_r1 diode.from uses OLD_BREAK, expected fingers_c1_r1_switch.',
            ]
          )
        : edited;
      const original = vi.mocked(useStudio).getMockImplementation();
      if (!original) throw new Error('Missing studio test harness');
      const state = original({ source } as Parameters<typeof useStudio>[0]);
      const report = resolveLayout(source);
      vi.mocked(useStudio).mockReturnValue({
        ...state,
        report,
        analysis: {
          ...state.analysis,
          result: { layout: report, pcbs: { main: '(kicad_pcb)' } },
          error: '',
          diagnostics: [],
          pending: false,
          stale: false,
        },
      });
      try {
        render(<Harness initial={source} />);
        fireEvent.click(screen.getByRole('button', { name: 'Export' }));
        const download = screen.getByRole('button', {
          name: 'Download PCB and outlines ZIP',
        });
        if (conflict) {
          expect(download).toBeDisabled();
          fireEvent.click(
            screen.getByRole('button', { name: /Review .*blocker/ })
          );
          expect(
            screen.getByRole('region', { name: 'Project findings' })
          ).toHaveTextContent('RAW_BREAK');
        } else {
          expect(download).toBeEnabled();
        }
        expect(current).toBe(source);
      } finally {
        vi.mocked(useStudio).mockImplementation(original);
      }
    }
  );

  it('keeps PCB download blocked while a raw edit has only stale clean analysis', () => {
    const clean = setValue(
      compileSetup({
        ...defaultSetup(),
        columns: 1,
        rows: 1,
        controller: 'promicro',
      }),
      ['meta', 'studio', 'findings'],
      []
    );
    const source = setValue(
      clean,
      [
        'layout',
        'objects',
        'fingers_c1_r1_diode',
        'footprints',
        'main',
        'params',
        'from',
      ],
      'RAW_BREAK'
    );
    const original = vi.mocked(useStudio).getMockImplementation();
    if (!original) throw new Error('Missing studio test harness');
    const state = original({ source } as Parameters<typeof useStudio>[0]);
    const report = resolveLayout(clean);
    vi.mocked(useStudio).mockReturnValue({
      ...state,
      report,
      analysis: {
        ...state.analysis,
        result: { layout: report, pcbs: { main: '(kicad_pcb)' } },
        error: '',
        diagnostics: [],
        pending: false,
        stale: true,
      },
    });
    try {
      render(<Harness initial={source} />);
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      expect(
        screen.getByRole('button', { name: 'Download PCB and outlines ZIP' })
      ).toBeDisabled();
    } finally {
      vi.mocked(useStudio).mockImplementation(original);
    }
  });
});

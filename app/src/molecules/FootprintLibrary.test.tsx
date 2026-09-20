import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act, cleanup } from '@testing-library/react';
import { prepareFootprint } from '../utils/footprintService';
import type { LibraryEntry } from '../types/footprint';
import { afterEach, expect, it, vi } from 'vitest';
import FootprintLibrary from './FootprintLibrary';
import { bundledPreviews } from '../utils/bundledPreviews';
import { modelPreview } from '../utils/cachedModelPreview';
import type { CaseAssets } from '../utils/caseAssets';
import type { ModelBinding } from '../types/footprint';

vi.mock('../context/ConfigContext', () => ({ useConfigContext: () => null }));
vi.mock('../hooks/useFootprintLibrary', () => ({
  useFootprintLibrary: () => ({ entries: [], error: '' }),
}));
vi.mock('../utils/bundledPreviews', () => ({
  bundledPreviews: vi.fn(async (paths: string[]) =>
    Object.fromEntries(
      paths.flatMap((path) => {
        const name = path.replace('${KIPRJMOD}/models/', '');
        return [
          [name, 'STEP'],
          [`__model_${name}.json`, '{"stl":"mesh"}'],
        ];
      })
    )
  ),
  BUNDLED_PREFIX: '${KIPRJMOD}/models/boardstudio/',
  PROJECT_MODELS: '${KIPRJMOD}/models/',
}));
vi.mock('../utils/footprintService', () => ({
  prepareFootprint: vi.fn(async (entry: { module: string }) => ({
    module: entry.module,
    mapping: {},
    parameters: {},
    yaml: '',
    info: {
      targets: [],
      pads: [],
      nets: [],
      graphics: [],
      diagnostics: [],
      models: [
        {
          path: '${KIPRJMOD}/models/boardstudio/infused-kim/Nice_Nano_V2.step',
          offset: [0, 0, 8.5],
          rotate: [0, 0, 0],
          scale: [1, 1, 1],
        },
      ],
    },
  })),
  countUses: async () => 0,
}));
vi.mock('./FootprintCanvas', () => ({
  default: ({
    models,
    assets,
  }: {
    models: ModelBinding[];
    assets: CaseAssets;
  }) => (
    <div aria-label="Canvas models">
      {models
        .filter((model) => modelPreview(model, assets))
        .map((model) => model.path)
        .join(',')}
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('loads attached library models automatically into the canvas and editor', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  render(<FootprintLibrary initialQuery="mcu_nice_nano" />);
  fireEvent.click(
    screen.getByRole('button', { name: /ceoloide\/mcu_nice_nano/ })
  );
  await waitFor(() =>
    expect(screen.getAllByLabelText('Canvas models')[0]).toHaveTextContent(
      'Nice_Nano_V2.step'
    )
  );
  expect(bundledPreviews).toHaveBeenCalledWith(
    ['${KIPRJMOD}/models/boardstudio/infused-kim/Nice_Nano_V2.step'],
    {},
    expect.any(AbortSignal)
  );
  expect(
    screen.queryByRole('button', { name: 'Resolve model reference' })
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Bundled models')).not.toBeInTheDocument();
  expect(
    screen.getByRole('combobox', { name: 'Active model' })
  ).toHaveTextContent('Nice_Nano_V2.step');
});

it('regenerates model bindings, preserves undo defaults, and rejects obsolete previews', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const implementation = vi.mocked(prepareFootprint).getMockImplementation();
  if (!implementation) throw new Error('Missing footprint preparation fixture');
  const pending: {
    entry: LibraryEntry;
    signal: AbortSignal;
    params: Record<string, unknown>;
    resolve: (value: Awaited<ReturnType<typeof prepareFootprint>>) => void;
  }[] = [];
  vi.mocked(prepareFootprint).mockImplementation(
    (entry, signal, params = {}) =>
      new Promise((resolve) => pending.push({ entry, signal, params, resolve }))
  );
  render(<FootprintLibrary initialQuery="mcu_nice_nano" />);
  fireEvent.click(
    screen.getByRole('button', { name: /ceoloide\/mcu_nice_nano/ })
  );
  const finish = async (index: number, side: string) =>
    act(async () => {
      const request = pending[index];
      const prepared = await implementation(
        request.entry,
        request.signal,
        request.params
      );
      request.resolve({
        ...prepared,
        parameters: {
          side: { type: 'string', value: 'F', choices: ['F', 'B', 'F&B'] },
        },
        info: {
          ...prepared.info,
          models: prepared.info.models.map((model) => ({
            ...model,
            path: model.path.replace('Nice_Nano_V2', side),
          })),
        },
      });
    });
  await finish(0, 'Front');
  await waitFor(() =>
    expect(screen.getAllByLabelText('Canvas models')[0]).toHaveTextContent(
      'Front.step'
    )
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'side' }), {
    target: { value: 'B' },
  });
  expect(screen.getByRole('button', { name: 'Save footprint' })).toBeDisabled();
  expect(screen.getAllByLabelText('Canvas models')[0]).toBeEmptyDOMElement();
  fireEvent.change(screen.getByRole('combobox', { name: 'side' }), {
    target: { value: 'F' },
  });
  expect(pending[1].signal.aborted).toBe(true);
  await finish(2, 'Current');
  await finish(1, 'Obsolete');
  await waitFor(() =>
    expect(screen.getAllByLabelText('Canvas models')[0]).toHaveTextContent(
      'Current.step'
    )
  );
  expect(screen.getAllByLabelText('Canvas models')[0]).not.toHaveTextContent(
    'Obsolete'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Undo footprint edit' }));
  expect(screen.getByRole('combobox', { name: 'side' })).toHaveValue('B');
  expect(pending[3].params.side).toBe('B');
  await finish(3, 'Back');
  expect(
    screen.getByRole('button', { name: 'View front' })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'View front' }));
  expect(screen.getByRole('button', { name: 'View back' })).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getAllByLabelText('Canvas models')[0]).toHaveTextContent(
      'Back.step'
    )
  );
  const offset = screen.getByRole('spinbutton', { name: 'Model offset Z' });
  fireEvent.change(offset, { target: { value: '10' } });
  fireEvent.blur(offset);
  fireEvent.change(screen.getByRole('combobox', { name: 'side' }), {
    target: { value: 'F' },
  });
  await finish(4, 'Ignored');
  expect(screen.getAllByLabelText('Canvas models')[0]).toHaveTextContent(
    'Back.step'
  );
  expect(offset).toHaveValue(10);
  fireEvent.click(screen.getByRole('button', { name: 'View back' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'side' }), {
    target: { value: 'F&B' },
  });
  await finish(5, 'Both');
  expect(
    screen.getByRole('button', { name: 'View front' })
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: /ceoloide\/mcu_nice_nano/ })
  );
  expect(screen.getAllByLabelText('Canvas models')[0]).toHaveTextContent(
    'Back.step'
  );
  await act(async () => {});
  vi.mocked(prepareFootprint).mockImplementation(implementation);
});

it('opens back-side source geometry on its declared face', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const implementation = vi.mocked(prepareFootprint).getMockImplementation();
  if (!implementation) throw new Error('Missing footprint preparation fixture');
  vi.mocked(prepareFootprint).mockImplementationOnce(
    async (entry, signal, params) => {
      const prepared = await implementation(entry, signal, params);
      return { ...prepared, info: { ...prepared.info, side: 'B' } };
    }
  );
  render(<FootprintLibrary initialQuery="mcu_nice_nano" />);
  fireEvent.click(
    screen.getByRole('button', { name: /ceoloide\/mcu_nice_nano/ })
  );
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'View front' })
    ).toBeInTheDocument()
  );
});

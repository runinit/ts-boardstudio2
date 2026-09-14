import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  prepareFootprint: async (entry: { module: string }) => ({
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
  }),
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

afterEach(() => vi.unstubAllGlobals());

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

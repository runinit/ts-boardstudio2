import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { createBoard } from '../utils/boardDefaults';
import { defaultSetup } from '../utils/designSetup';
import DesignSetupPanel from './DesignSetupPanel';

const { loadComponentModel } = vi.hoisted(() => ({
  loadComponentModel: vi.fn((name: string) =>
    Promise.resolve({
      model: {
        path: `models/${name}`,
        asset: name,
        offset: [0, 0, 0],
        rotate: [0, 0, 0],
        scale: [1, 1, 1],
      },
      assets: { [name]: `asset:${name}` },
    })
  ),
}));

vi.mock('../utils/componentModels', () => ({
  loadComponentModel,
  setupModels: (setup: { family: string }) =>
    setup.family === 'mx' ? ['SW_Cherry_MX_PCB.stp'] : [],
}));

vi.mock('../hooks/useCasePreview', () => ({
  useCasePreview: () => ({
    generate: vi.fn(),
    pending: false,
    stale: false,
    result: null,
    error: '',
  }),
}));

vi.mock('./NewDesignWorkspace', () => ({
  default: () => <div aria-label="Key assembly editor" />,
}));

vi.mock('./StackupPanel', () => ({
  default: () => <div aria-label="Stackup editor" />,
}));

describe('DesignSetupPanel', () => {
  it('preloads assembly models before Apply setup is clicked', async () => {
    const source = createBoard(defaultSetup());

    render(
      <DesignSetupPanel
        source={source}
        currentSource={() => source}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => expect(loadComponentModel).toHaveBeenCalled());
    expect(loadComponentModel.mock.calls[0]?.[0]).toBe(
      'SW_Cherry_MX_PCB.stp'
    );
    expect(screen.getByRole('button', { name: 'Apply setup' })).toBeEnabled();
  });
});

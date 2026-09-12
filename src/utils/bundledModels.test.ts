import { expect, it, vi } from 'vitest';
import { loadBoardModels } from './bundledModels';

const source = `(kicad_pcb
  (footprint "part" (layer "F.Cu") (at 0 0)
    (model "\${KIPRJMOD}/models/boardstudio/infused-kim/Switch_Reset.step"
      (offset (xyz 0 0 0)) (rotate (xyz 0 0 0)) (scale (xyz 1 1 1)))))`;

it('loads referenced bundled models for a portable board export', async () => {
  const download = vi
    .fn()
    .mockImplementation(async () => new Response('ISO-10303-21;'));
  const assets = await loadBoardModels({ main: source }, {}, download);
  expect(assets['boardstudio/infused-kim/Switch_Reset.step']).toBe(
    'ISO-10303-21;'
  );
  expect(download).toHaveBeenCalledTimes(2);
  expect(assets['boardstudio/infused-kim/LICENSE']).toBeTruthy();
});

it('preserves project-owned model bytes and ignores unrelated paths', async () => {
  const download = vi.fn();
  const owned = { 'boardstudio/infused-kim/Switch_Reset.step': 'owned' };
  expect(await loadBoardModels({ main: source }, owned, download)).toEqual(
    owned
  );
  expect(
    await loadBoardModels(
      { main: source.replace('boardstudio/', 'custom/') },
      {},
      download
    )
  ).toEqual({});
  expect(download).not.toHaveBeenCalled();
});

it('fails export when a referenced bundled model cannot be loaded', async () => {
  const download = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
  await expect(loadBoardModels({ main: source }, {}, download)).rejects.toThrow(
    'Switch_Reset.step'
  );
});

it('includes the Keebio license with a bundled model', async () => {
  const download = vi
    .fn()
    .mockImplementation(async () => new Response('model or license'));
  const assets = await loadBoardModels(
    {
      main: source.replace(
        'infused-kim/Switch_Reset.step',
        'keebio/PJ-320A.step'
      ),
    },
    {},
    download
  );
  expect(assets['boardstudio/keebio/LICENSE']).toBeTruthy();
});

it('includes the Foostan license with its OLED assembly', async () => {
  const download = vi
    .fn()
    .mockImplementation(async () => new Response('model or license'));
  const assets = await loadBoardModels(
    {
      main: source.replace(
        'infused-kim/Switch_Reset.step',
        'foostan/OLED-Module-with-Pins.step'
      ),
    },
    {},
    download
  );
  expect(assets['boardstudio/foostan/LICENSE']).toBeTruthy();
});

it('preserves plus signs while encoding spaces and URL delimiters', async () => {
  const download = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response('ISO-10303-21;'));
  const board = source.replace('Switch_Reset.step', 'offset_+0.0 part#1?.step');
  await loadBoardModels({ main: board }, {}, download);
  expect(download.mock.calls[0][0]).toContain('offset_+0.0%20part%231%3F.step');
});

import { afterEach, expect, test, vi } from 'vitest';
import { createRendererCanvas } from './renderClient';

const render = vi.hoisted(() => vi.fn());
vi.mock('../../renderer/pkg/boardstudio_renderer_wasm.js', () => ({
  default: async () => {},
  Renderer: class { resize() {} render = render; dispose() {} free() {} setState() {} },
}));

afterEach(() => { vi.unstubAllGlobals(); render.mockClear(); });

test('draws once for a coalesced frame and stays idle afterwards', async () => {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('Worker', class { terminate() {} });
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('window', { devicePixelRatio: 1, addEventListener() {}, removeEventListener() {} });
  const canvas = { clientWidth: 640, clientHeight: 480, addEventListener() {}, removeEventListener() {} } as unknown as HTMLCanvasElement;
  const renderer = await createRendererCanvas(canvas);
  renderer.setState({ hidden: [], selectedLayer: '', view: 'assembled', mode: 'hybrid', theme: 'dark' });
  expect(frames).toHaveLength(1);
  frames.shift()!(0);
  expect(render).toHaveBeenCalledOnce();
  expect(frames).toHaveLength(0);
  renderer.dispose();
});

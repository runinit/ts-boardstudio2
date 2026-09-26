import { afterEach, expect, test, vi } from 'vitest';
import { createRendererCanvas } from './renderClient';

const render = vi.hoisted(() => vi.fn());
const preparedScenes = vi.hoisted(() => [] as unknown[]);
vi.mock('../../renderer/pkg/boardstudio_renderer_wasm.js', () => ({
  default: async () => {},
  Renderer: class {
    resize() {}
    render = render;
    dispose() {}
    free() {}
    setState() {}
    setPreparedScene(scene: unknown) { preparedScenes.push(scene); return true; }
    fit() {}
    view() {}
    zoom() {}
  },
}));

afterEach(() => { vi.unstubAllGlobals(); render.mockClear(); preparedScenes.length = 0; });

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

test('preserves a camera change made while a scene is being prepared', async () => {
  let worker: { onmessage?: (event: MessageEvent) => void; terminate(): void; postMessage(message: unknown): void };
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('window', { devicePixelRatio: 1, addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal('Worker', class {
    onmessage?: (event: MessageEvent) => void;
    constructor() { worker = this; }
    terminate() {}
    postMessage(message: unknown) { this.lastMessage = message; }
    lastMessage?: unknown;
  });
  const canvas = { clientWidth: 640, clientHeight: 480, addEventListener() {}, removeEventListener() {} } as unknown as HTMLCanvasElement;
  const renderer = await createRendererCanvas(canvas);
  const update = renderer.setScene({ keepCamera: false });
  renderer.view('top');
  worker!.onmessage!({ data: { id: 1, prepared: { revision: 1, keepCamera: false, objects: [] }, elapsed: 0 } } as MessageEvent);
  await expect(update).resolves.toBe(true);
  expect(preparedScenes).toEqual([{ revision: 1, keepCamera: true, objects: [] }]);
  renderer.dispose();
});

let modulePromise: Promise<typeof import('../../renderer/pkg/boardstudio_renderer_wasm.js')> | undefined;
let latest = 0;
self.onmessage = async (event: MessageEvent<{ id: number; scene: unknown }>) => {
  const { id, scene } = event.data;
  latest = id;
  try {
    modulePromise ??= import('../../renderer/pkg/boardstudio_renderer_wasm.js').then(async module => { await module.default(); return module; });
    const module = await modulePromise;
    await new Promise(resolve => setTimeout(resolve, 0));
    if (id !== latest) return;
    const started = performance.now();
    const prepared = module.prepareScene(scene);
    const buffers = new Set<ArrayBuffer>();
    const collect = (value: unknown) => {
      if (ArrayBuffer.isView(value) && value.buffer instanceof ArrayBuffer) buffers.add(value.buffer);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(prepared);
    self.postMessage({ id, prepared, elapsed: performance.now() - started }, [...buffers]);
  } catch (cause) {
    modulePromise = undefined;
    self.postMessage({ id, error: String(cause) });
  }
};

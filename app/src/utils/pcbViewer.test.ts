import { beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  document.head
    .querySelectorAll('script[src*="kicanvas.js"]')
    .forEach((script) => {
      script.remove();
    });
});

it('loads one public script for concurrent preview requests', async () => {
  const elements = vi.spyOn(customElements, 'get').mockReturnValue(undefined);
  const { loadPcbViewer } = await import('./pcbViewer');

  const first = loadPcbViewer();
  const second = loadPcbViewer();
  const script = document.head.querySelector<HTMLScriptElement>(
    'script[src*="dependencies/kicanvas.js"]'
  );

  expect(first).toBe(second);
  expect(script?.src).toContain(
    '/dependencies/kicanvas.js?v=kicad10-unconnected-pads-1'
  );
  expect(
    document.head.querySelectorAll('script[src*="kicanvas.js"]')
  ).toHaveLength(1);

  elements.mockReturnValue(class extends HTMLElement {});
  script?.dispatchEvent(new Event('load'));
  await expect(first).resolves.toBeUndefined();
  await expect(second).resolves.toBeUndefined();
  elements.mockRestore();
});

it('retries after a script load fails', async () => {
  const elements = vi.spyOn(customElements, 'get').mockReturnValue(undefined);
  const { loadPcbViewer } = await import('./pcbViewer');

  const first = loadPcbViewer();
  const failedScript = document.head.querySelector<HTMLScriptElement>(
    'script[src*="dependencies/kicanvas.js"]'
  );
  failedScript?.dispatchEvent(new Event('error'));
  await expect(first).rejects.toThrow();

  const retry = loadPcbViewer();
  const scripts = document.head.querySelectorAll<HTMLScriptElement>(
    'script[src*="dependencies/kicanvas.js"]'
  );
  expect(scripts).toHaveLength(1);
  expect(scripts[0]).not.toBe(failedScript);

  elements.mockReturnValue(class extends HTMLElement {});
  scripts[0].dispatchEvent(new Event('load'));
  await expect(retry).resolves.toBeUndefined();
  elements.mockRestore();
});

it('rejects a script that does not register both viewer elements', async () => {
  const elements = vi.spyOn(customElements, 'get').mockReturnValue(undefined);
  const { loadPcbViewer } = await import('./pcbViewer');

  const pending = loadPcbViewer();
  const script = document.head.querySelector<HTMLScriptElement>(
    'script[src*="dependencies/kicanvas.js"]'
  );
  script?.dispatchEvent(new Event('load'));

  await expect(pending).rejects.toThrow('KiCanvas did not initialize.');
  expect(script?.isConnected).toBe(false);
  elements.mockRestore();
});

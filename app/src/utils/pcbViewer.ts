const VIEWER_REVISION = 'kicad10-unconnected-pads-1';
let pending: Promise<void> | undefined;

// Load on demand, with a revisioned URL so offline caches cannot retain an older parser.
export function loadPcbViewer(): Promise<void> {
  if (
    customElements.get('kicanvas-embed') &&
    customElements.get('kicanvas-source')
  ) {
    return Promise.resolve();
  }
  if (!pending) {
    const url = `${import.meta.env.BASE_URL}dependencies/kicanvas.js?v=${VIEWER_REVISION}`;
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    // Public bundles load as scripts; confirm registration before showing the viewer.
    pending = new Promise<void>((resolve, reject) => {
      script.onload = () => {
        if (
          !customElements.get('kicanvas-embed') ||
          !customElements.get('kicanvas-source')
        ) {
          reject(new Error('KiCanvas did not initialize.'));
          return;
        }
        resolve();
      };
      script.onerror = () => reject(new Error('KiCanvas failed to load.'));
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      script.remove();
      pending = undefined;
      throw error;
    });
  }
  return pending;
}

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [react()],
  // The CAD loader resolves its glue relative to import.meta.url. Keep them together.
  optimizeDeps: { exclude: ['libcascade'] },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        bench: fileURLToPath(new URL('./bench.html', import.meta.url)),
        workbenchBench: fileURLToPath(new URL('./bench-workbench.html', import.meta.url)),
      },
    },
  },
  worker: { format: 'es' },
});

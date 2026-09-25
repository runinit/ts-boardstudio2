import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const baseURL = 'http://127.0.0.1:4328/boardstudio/';

export default defineConfig({
  ...base,
  testDir: './e2e-pages',
  use: { ...base.use, baseURL },
  webServer: {
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 4328 --strictPort --base /boardstudio/',
    url: baseURL,
    reuseExistingServer: false,
  },
});

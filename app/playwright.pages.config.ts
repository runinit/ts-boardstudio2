import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const baseURL = 'http://127.0.0.1:4328/ts-boardstudio2/';

export default defineConfig({
  ...base,
  testDir: './e2e-pages',
  use: { ...base.use, baseURL },
  webServer: {
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 4328 --strictPort --base /ts-boardstudio2/',
    url: baseURL,
    reuseExistingServer: false,
  },
});

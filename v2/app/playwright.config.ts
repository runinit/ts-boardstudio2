import { defineConfig, devices } from '@playwright/test';

const PORT = 4328;

export default defineConfig({
  testDir: './e2e',
  retries: 0,
  // This suite includes real-time latency gates; browser workers must not contend.
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    launchOptions: {
      executablePath: process.env.BOARDSTUDIO_CHROMIUM || undefined,
    },
  },
  webServer: {
    command: `pnpm exec vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});

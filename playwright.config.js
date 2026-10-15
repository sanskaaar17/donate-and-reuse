import { defineConfig } from '@playwright/test';
import { getAppUrl, getE2EConfig } from './scripts/e2e-config.js';

const config = getE2EConfig();
const baseURL = getAppUrl();
const port = new URL(baseURL).port || '80';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `npm.cmd run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      VITE_SUPABASE_URL: config.url,
      VITE_SUPABASE_PUBLISHABLE_KEY: config.key
    }
  }
});

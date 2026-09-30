import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  outputDir: "./dist/test-results",
  workers: 1,
  timeout: 90000,
  use: {
    channel: process.env.UI_BROWSER,
    baseURL: "http://localhost:3100",
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100/internal/components",
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
});

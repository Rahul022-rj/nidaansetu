import { defineConfig, devices } from "@playwright/test";

// Smoke tests run against a throwaway API (in-memory MongoDB, seeded) and the Vite dev server.
const API_PORT = 5055;
const WEB_PORT = 5174;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    ...devices["Pixel 7"],
    // Full Chromium in new headless mode: `npx playwright install chromium` is all that's needed
    channel: "chromium",
  },
  webServer: [
    {
      command: "node server/src/scripts/e2e-server.js",
      env: { PORT: String(API_PORT), CLIENT_ORIGIN: `http://localhost:${WEB_PORT}` },
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      cwd: "client",
      env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});

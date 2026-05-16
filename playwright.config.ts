import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3014",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      'bash -lc "export NVM_DIR=\\"$HOME/.nvm\\" && . \\"$NVM_DIR/nvm.sh\\" && nvm use 20 && npm run dev -- -p 3014"',
    url: "http://localhost:3014",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
});

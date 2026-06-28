import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./web",
  timeout: 120_000,
  use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:4173" },
  webServer: {
    command: "pnpm --filter @buckspay/example-passkey-hero preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "node",
    // .e2e.test.ts = network-gated (BUCKSPAY_E2E); .test.ts = always-on unit checks.
    include: ["src/**/*.e2e.test.ts", "src/**/*.test.ts"],
    environment: "node",
    hookTimeout: 120_000,
    testTimeout: 120_000,
    pool: "forks"
  }
});

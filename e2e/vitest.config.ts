import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "node",
    // .e2e.test.ts = network-gated (BUCKSPAY_E2E); .test.ts = always-on unit checks.
    include: ["src/**/*.e2e.test.ts", "src/**/*.test.ts"],
    environment: "node",
    hookTimeout: 120_000,
    testTimeout: 120_000,
    pool: "forks",
    // Network e2e hit a shared facilitator + the load-balanced public testnet RPC.
    // Running files concurrently amplifies RPC eventual-consistency races (one node
    // sees a freshly-deployed contract, another lags). Serialize for determinism.
    fileParallelism: false
  }
});

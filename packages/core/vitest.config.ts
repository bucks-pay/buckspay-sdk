import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Type-level tests (*.test-d.ts) are compiled by vitest's typecheck so the
    // expectTypeOf assertions are enforced, not runtime no-ops.
    typecheck: {
      enabled: true,
      include: ["test/**/*.test-d.ts"],
      tsconfig: "./tsconfig.json"
    }
  }
});

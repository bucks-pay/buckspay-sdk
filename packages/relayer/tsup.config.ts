import { defineConfig } from "tsup";

export default defineConfig({
  // Object entries → nested dist output (dist/buckspay-facilitator/index.js …) so
  // each subpath export resolves to its own folder and tree-shakes independently.
  entry: {
    index: "src/index.ts",
    "buckspay-facilitator/index": "src/buckspay-facilitator/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022"
});

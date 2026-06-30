import { defineConfig } from "tsup";

export default defineConfig({
  // Object entries → nested dist output (dist/classic/index.js …) so each subpath
  // export resolves to its own folder and tree-shakes independently.
  entry: {
    index: "src/index.ts",
    "classic/index": "src/classic/index.ts",
    "oz-contract/index": "src/oz-contract/index.ts",
    "policy/index": "src/policy/index.ts",
    "policy-account/index": "src/policy-account/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022"
});

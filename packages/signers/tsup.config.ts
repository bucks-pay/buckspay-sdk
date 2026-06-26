import { defineConfig } from "tsup";

export default defineConfig({
  // Object entries → nested dist output (dist/wallets-kit/index.js …) so each
  // subpath export resolves to its own folder and tree-shakes independently.
  entry: {
    index: "src/index.ts",
    "wallets-kit/index": "src/wallets-kit/index.ts",
    "passkey/index": "src/passkey/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022"
});

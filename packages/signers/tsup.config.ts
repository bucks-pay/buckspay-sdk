import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/wallets-kit.ts", "src/passkey.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022"
});

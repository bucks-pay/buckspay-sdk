import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/classic.ts", "src/oz-contract.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022"
});

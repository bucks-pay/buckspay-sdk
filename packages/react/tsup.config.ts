import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  // Keep react/react-dom/core as peers — never bundle them into the client island.
  external: ["react", "react-dom", "@buckspay/core"]
});

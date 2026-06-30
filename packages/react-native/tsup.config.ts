import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  // Native peers + workspace siblings are never bundled — the consuming app provides them.
  external: [
    "react",
    "react-native",
    "react-native-passkey",
    "react-native-get-random-values",
    "expo-secure-store",
    "react-native-keychain",
    "@buckspay/core",
    "@buckspay/react",
    "@buckspay/signers"
  ]
});

import { defineConfig } from "vitest/config";

// RN unit tests run in the NODE env by default; the native modules (react-native-passkey,
// react-native-get-random-values, expo-secure-store, react-native-keychain) are mocked per-test
// or in the setup file. The provider/hooks wiring test opts into jsdom via a per-file docblock
// (`// @vitest-environment jsdom`) since @testing-library/react renders pure React context.
export default defineConfig({
  test: { environment: "node", setupFiles: ["./vitest.setup.ts"] }
});

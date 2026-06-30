import { vi } from "vitest";

// react-native-get-random-values touches a native module; a no-op under node, where
// crypto.getRandomValues already exists (the polyfill is only load-bearing on Hermes).
vi.mock("react-native-get-random-values", () => ({}));

// Default react-native-passkey stub so importing the package never reaches the real native
// binary in node. The native-passkey test overrides this with a real P-256 authenticator.
vi.mock("react-native-passkey", () => ({ Passkey: { create: vi.fn(), get: vi.fn() } }));

// The optional storage peers are not installed in this workspace (apps provide the one they use).
// Stub them so the lazy dynamic import() resolves; the secure-storage test overrides these with
// in-memory backings.
vi.mock("expo-secure-store", () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn() }));
vi.mock("react-native-keychain", () => ({
  getGenericPassword: vi.fn(),
  setGenericPassword: vi.fn(),
  resetGenericPassword: vi.fn()
}));

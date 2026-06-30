import { describe, it, expect, vi } from "vitest";
import { BuckspayError } from "@buckspay/core";

// Hoisted backings so the vi.mock factories (hoisted above imports) can reference them safely.
const expoBacking = vi.hoisted(() => new Map<string, string>());
const kcBacking = vi.hoisted(() => new Map<string, string>());

vi.mock("expo-secure-store", () => ({
  setItemAsync: vi.fn((k: string, v: string) => {
    expoBacking.set(k, v);
    return Promise.resolve();
  }),
  getItemAsync: vi.fn((k: string) => Promise.resolve(expoBacking.get(k) ?? null)),
  deleteItemAsync: vi.fn((k: string) => {
    expoBacking.delete(k);
    return Promise.resolve();
  })
}));
vi.mock("react-native-keychain", () => ({
  setGenericPassword: vi.fn((_u: string, v: string, o: { service: string }) => {
    kcBacking.set(o.service, v);
    return Promise.resolve(true);
  }),
  getGenericPassword: vi.fn((o: { service: string }) =>
    Promise.resolve(kcBacking.has(o.service) ? { password: kcBacking.get(o.service) } : false)
  ),
  resetGenericPassword: vi.fn((o: { service: string }) => {
    kcBacking.delete(o.service);
    return Promise.resolve(true);
  })
}));

import { memorySecureStore, expoSecureStore, keychainSecureStore } from "../src/secure-storage";

describe.each([
  ["memory", () => memorySecureStore()],
  ["expo-secure-store", () => expoSecureStore()],
  ["react-native-keychain", () => keychainSecureStore({ service: "buckspay.session" })]
])("SecureStore conformance (%s)", (_name, make) => {
  it("set → get round-trips, get(absent) is null, delete removes", async () => {
    const store = make();
    expect(await store.get("buckspay.session")).toBeNull();
    await store.set("buckspay.session", "blob-123");
    expect(await store.get("buckspay.session")).toBe("blob-123");
    await store.delete("buckspay.session");
    expect(await store.get("buckspay.session")).toBeNull();
  });
});

describe("session persistence (scoped key only)", () => {
  it("rejects an empty key with INVALID_CONFIG (no silent no-op)", async () => {
    await expect(memorySecureStore().set("", "x")).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });
  it("keychainSecureStore requires a service", () => {
    expect(() => keychainSecureStore({ service: "" })).toThrowError(/service/i);
  });
  it("persists a serialized session blob and reads it back", async () => {
    const store = memorySecureStore();
    // The blob is whatever @buckspay/core's serializeSession(session) produced — opaque to the
    // store; the store never inspects or holds the root passkey.
    await store.set("buckspay.session.CACC", "v1.eyJpZCI6Li4ufQ==");
    expect(await store.get("buckspay.session.CACC")).toBe("v1.eyJpZCI6Li4ufQ==");
    expect(BuckspayError).toBeTypeOf("function");
  });
});

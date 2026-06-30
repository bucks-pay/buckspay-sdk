// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import * as ReactBinding from "@buckspay/react";
import * as RN from "../src/index";

describe("polyfills (Hermes parity)", () => {
  it("importing the package installs Buffer / getRandomValues / TextEncoder / base64 shims", async () => {
    await import("../src/polyfills");
    expect(typeof (globalThis as { Buffer?: unknown }).Buffer).toBe("function");
    expect(typeof globalThis.TextEncoder).toBe("function");
    expect(typeof (globalThis as { atob?: unknown }).atob).toBe("function");
    expect(typeof (globalThis as { btoa?: unknown }).btoa).toBe("function");
    const rnd = new Uint8Array(8);
    crypto.getRandomValues(rnd);
    expect(rnd.some((b) => b !== 0)).toBe(true);
  });
});

describe("RN provider/hooks are re-exported from @buckspay/react (NO fork)", () => {
  it("the three exports are the SAME references as the web binding", () => {
    expect(RN.BuckspayProvider).toBe(ReactBinding.BuckspayProvider);
    expect(RN.useWallet).toBe(ReactBinding.useWallet);
    expect(RN.useStellarPay).toBe(ReactBinding.useStellarPay);
  });
  it("the package also exports nativePasskey + the SecureStore port", () => {
    expect(RN.nativePasskey).toBeTypeOf("function");
    expect(RN.memorySecureStore).toBeTypeOf("function");
    expect(RN.expoSecureStore).toBeTypeOf("function");
  });
  it("useWallet mounts under the re-exported provider and reports idle", () => {
    // A connect-only config (no sim): inert account/relayer doubles + the native passkey signer.
    const config = makeRnMockConfig();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RN.BuckspayProvider config={config}>{children}</RN.BuckspayProvider>
    );
    const { result } = renderHook(() => RN.useWallet(), { wrapper });
    expect(result.current.status).toBe("idle");
    expect(result.current.connect).toBeTypeOf("function");
    expect(result.current.address).toBeNull();
  });
});

// Minimal mocked BuckspayConfig — the binding under test is the provider wiring, not the relay,
// so account/relayer are inert doubles. (This file is not typechecked by tsc; `as never` is fine.)
function makeRnMockConfig() {
  return {
    network: "testnet" as const,
    account: {
      model: "contract" as const,
      resolveAddress: async () => "C".padEnd(56, "A"),
      ensureReady: async () => {}
    } as never,
    signer: RN.nativePasskey({ rpId: "buckspay.app" }),
    relayer: {
      relay: async () => ({}) as never,
      getAccountState: async () => ({ exists: true }) as never
    } as never,
    gas: { mode: "sponsored" as const }
  };
}

import { describe, it, expect } from "vitest";
import { resolveNetwork } from "../src/network-gate.js";

describe("mainnet gating", () => {
  it("allows testnet freely", () => {
    expect(resolveNetwork("testnet", { allowMainnet: false })).toBe("testnet");
  });
  it("blocks pubnet without explicit opt-in", () => {
    expect(() => resolveNetwork("pubnet", { allowMainnet: false })).toThrow(/INVALID_CONFIG|mainnet|pubnet/i);
  });
  it("allows pubnet only with explicit opt-in", () => {
    expect(resolveNetwork("pubnet", { allowMainnet: true })).toBe("pubnet");
  });
});

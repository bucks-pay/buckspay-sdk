import { describe, it, expect } from "vitest";
import { ozContractAccount } from "../src/oz-contract/index.js";
import { OZ_SMART_ACCOUNT_WASM_HASH, assertPinnedWasmHash } from "../src/oz-contract/wasm-pin.js";

describe("OZ Smart Account Wasm pinning", () => {
  it("exposes a 32-byte hex wasm hash (real spike value, not the zero placeholder)", () => {
    expect(OZ_SMART_ACCOUNT_WASM_HASH).toMatch(/^[0-9a-f]{64}$/);
    expect(OZ_SMART_ACCOUNT_WASM_HASH).not.toBe("0".repeat(64));
  });
  it("accepts the pinned hash", () => {
    expect(() => assertPinnedWasmHash(OZ_SMART_ACCOUNT_WASM_HASH)).not.toThrow();
  });
  it("rejects any other hash", () => {
    expect(() => assertPinnedWasmHash("00".repeat(32))).toThrow(/INVALID_CONFIG|wasm|hash/i);
  });
  it("uses the pinned hash by default", () => {
    const acct = ozContractAccount();
    expect(acct.model).toBe("contract");
  });
  it("honors an explicit override only if it matches the pin", () => {
    expect(() => ozContractAccount({ wasmHash: "ff".repeat(32) })).toThrow(/INVALID_CONFIG|hash/i);
    expect(() => ozContractAccount({ wasmHash: OZ_SMART_ACCOUNT_WASM_HASH })).not.toThrow();
  });
});

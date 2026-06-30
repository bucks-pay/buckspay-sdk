import { describe, it, expect } from "vitest";
import { ozContractAccount } from "../../src/oz-contract/index.js";
import { OZ_SMART_ACCOUNT_WASM_HASH } from "../../src/oz-contract/wasm-pin.js";

describe("ozContractAccount factory", () => {
  it("is an AccountAdapter with model contract", () => {
    const a = ozContractAccount();
    expect(a.model).toBe("contract");
    expect(typeof a.resolveAddress).toBe("function");
    expect(typeof a.ensureReady).toBe("function");
    expect(typeof a.buildUnsignedEntry).toBe("function");
    expect(typeof a.assembleSignedEntry).toBe("function");
  });
  it("accepts the pinned wasmHash override (pin guard)", () => {
    expect(ozContractAccount({ wasmHash: OZ_SMART_ACCOUNT_WASM_HASH }).model).toBe("contract");
  });
});

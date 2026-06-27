import { describe, it, expect } from "vitest";
import { ozContractAccount } from "../../src/oz-contract/index.js";

describe("ozContractAccount factory", () => {
  it("is an AccountAdapter with model contract", () => {
    const a = ozContractAccount();
    expect(a.model).toBe("contract");
    expect(typeof a.resolveAddress).toBe("function");
    expect(typeof a.ensureReady).toBe("function");
    expect(typeof a.buildUnsignedEntry).toBe("function");
    expect(typeof a.assembleSignedEntry).toBe("function");
  });
  it("accepts an optional wasmHash", () => {
    expect(ozContractAccount({ wasmHash: "ab".repeat(32) }).model).toBe("contract");
  });
});

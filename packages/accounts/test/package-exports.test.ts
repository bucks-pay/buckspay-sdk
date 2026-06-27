import { describe, it, expect } from "vitest";

describe("@buckspay/accounts package surface", () => {
  it("classic subpath exports classicAccount returning a classic AccountAdapter", async () => {
    const { classicAccount } = await import("../src/classic/index.js");
    expect(typeof classicAccount).toBe("function");
    const adapter = classicAccount();
    expect(adapter.model).toBe("classic");
    expect(typeof adapter.resolveAddress).toBe("function");
    expect(typeof adapter.ensureReady).toBe("function");
    expect(typeof adapter.buildUnsignedEntry).toBe("function");
    expect(typeof adapter.assembleSignedEntry).toBe("function");
  });

  it("root resolves and oz-contract subpath exports a contract AccountAdapter (Sprint 4)", async () => {
    const root = await import("../src/index.js");
    const { ozContractAccount } = await import("../src/oz-contract/index.js");
    expect(typeof root.version).toBe("string");
    expect(typeof ozContractAccount).toBe("function");
    expect(ozContractAccount().model).toBe("contract");
  });
});

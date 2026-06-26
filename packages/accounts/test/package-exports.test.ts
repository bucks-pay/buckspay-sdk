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

  it("root + oz-contract subpaths still resolve (kept for Sprint 4)", async () => {
    const root = await import("../src/index.js");
    const oz = await import("../src/oz-contract/index.js");
    expect(typeof root.version).toBe("string");
    expect(typeof oz.version).toBe("string");
  });
});

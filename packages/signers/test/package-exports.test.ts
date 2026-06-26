import { describe, it, expect } from "vitest";

describe("@buckspay/signers package surface", () => {
  it("wallets-kit subpath exports walletsKit and normalizeSignature", async () => {
    const mod = await import("../src/wallets-kit/index.js");
    expect(typeof mod.walletsKit).toBe("function");
    expect(typeof mod.normalizeSignature).toBe("function");
  });

  it("root + passkey subpaths still resolve (kept for Sprint 4)", async () => {
    const root = await import("../src/index.js");
    const passkey = await import("../src/passkey/index.js");
    expect(typeof root.version).toBe("string");
    expect(typeof passkey.version).toBe("string");
  });
});

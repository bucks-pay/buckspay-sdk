import { describe, it, expect } from "vitest";

describe("@buckspay/signers package surface", () => {
  it("wallets-kit subpath exports walletsKit and normalizeSignature", async () => {
    const mod = await import("../src/wallets-kit/index.js");
    expect(typeof mod.walletsKit).toBe("function");
    expect(typeof mod.normalizeSignature).toBe("function");
  });

  it("root resolves and passkey subpath exports the passkey factory (Sprint 4)", async () => {
    const root = await import("../src/index.js");
    const passkey = await import("../src/passkey/index.js");
    expect(typeof root.version).toBe("string");
    expect(typeof passkey.passkey).toBe("function");
  });
});

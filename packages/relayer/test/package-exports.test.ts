import { describe, it, expect } from "vitest";

describe("@buckspay/relayer/buckspay-facilitator package surface", () => {
  it("exports buckspayFacilitator returning a Relayer", async () => {
    const { buckspayFacilitator } = await import("../src/buckspay-facilitator/index.js");
    expect(typeof buckspayFacilitator).toBe("function");
    const relayer = buckspayFacilitator({ url: "https://fac.test", network: "testnet" });
    for (const m of [
      "relay",
      "getAccountState",
      "buildOnboard",
      "submitOnboard",
      "deployContract",
      "deploySessionAccount"
    ]) {
      expect(typeof (relayer as unknown as Record<string, unknown>)[m]).toBe("function");
    }
  });

  it("root subpath still resolves (kept for the package root)", async () => {
    const root = await import("../src/index.js");
    expect(typeof root.version).toBe("string");
  });
});

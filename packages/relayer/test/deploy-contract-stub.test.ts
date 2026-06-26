import { describe, it, expect, vi } from "vitest";
import { buckspayFacilitator } from "../src/buckspay-facilitator/facilitator.js";

describe("buckspayFacilitator.deployContract (Sprint 4 stub)", () => {
  it("throws BuckspayError INVALID_CONFIG without calling fetch", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const fetchMock = vi.fn();
    const relayer = buckspayFacilitator(
      { url: "https://fac.test", network: "testnet", apiKey: "k" },
      { fetch: fetchMock }
    );
    await expect(relayer.deployContract({ passkeyPublicKey: "04abcd" })).rejects.toBeInstanceOf(BuckspayError);
    await expect(relayer.deployContract({ passkeyPublicKey: "04abcd" })).rejects.toMatchObject({
      code: "INVALID_CONFIG"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

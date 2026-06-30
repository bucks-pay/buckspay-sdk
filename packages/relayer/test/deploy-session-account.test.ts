import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buckspayFacilitator } from "../src/buckspay-facilitator/facilitator.js";

const ROOT = "G" + "A".repeat(55);
const C = "C" + "A".repeat(55);

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buckspayFacilitator.deploySessionAccount", () => {
  it("POSTs to /stellar/session-account/deploy with the chain + api key and returns the address", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, address: C, chain: "stellar-testnet" })
    });
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "testnet" });
    const out = await r.deploySessionAccount!({ rootPublicKey: ROOT });
    expect(out).toEqual({ address: C });
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(url).toBe("https://fac.test/stellar/session-account/deploy");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ rootPublicKey: ROOT, chain: "stellar-testnet" });
    expect(init.headers["x-api-key"]).toBe("k".repeat(16));
  });

  it("maps a 4xx to RELAYER_REJECTED", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "invalid_payload" })
    });
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "testnet" });
    await expect(r.deploySessionAccount!({ rootPublicKey: ROOT })).rejects.toMatchObject({ code: "RELAYER_REJECTED" });
  });

  it("maps a network error to RELAYER_UNREACHABLE", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fetch failed"));
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "testnet" });
    await expect(r.deploySessionAccount!({ rootPublicKey: ROOT })).rejects.toMatchObject({
      code: "RELAYER_UNREACHABLE"
    });
  });

  it("uses stellar-pubnet chain when network is pubnet", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, address: C })
    });
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "pubnet" });
    await r.deploySessionAccount!({ rootPublicKey: ROOT });
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(JSON.parse(init.body).chain).toBe("stellar-pubnet");
  });
});

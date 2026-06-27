import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buckspayFacilitator } from "../src/buckspay-facilitator/facilitator.js";

const PUBKEY = "04" + "ab".repeat(64);
const C = "C" + "A".repeat(55);

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buckspayFacilitator.deployContract", () => {
  it("POSTs to /stellar/contract/deploy with the chain + api key and returns the address", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, address: C, chain: "stellar-testnet" })
    });
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "testnet" });
    const out = await r.deployContract({ passkeyPublicKey: PUBKEY });
    expect(out).toEqual({ address: C });
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(url).toBe("https://fac.test/stellar/contract/deploy");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ passkeyPublicKey: PUBKEY, chain: "stellar-testnet" });
    expect(init.headers["x-api-key"]).toBe("k".repeat(16));
  });

  it("maps a 4xx to RELAYER_REJECTED", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "invalid_payload" })
    });
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "testnet" });
    await expect(r.deployContract({ passkeyPublicKey: PUBKEY })).rejects.toMatchObject({ code: "RELAYER_REJECTED" });
  });

  it("maps a network error to RELAYER_UNREACHABLE", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fetch failed"));
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "testnet" });
    await expect(r.deployContract({ passkeyPublicKey: PUBKEY })).rejects.toMatchObject({ code: "RELAYER_UNREACHABLE" });
  });

  it("uses stellar-pubnet chain when network is pubnet", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, address: C })
    });
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "pubnet" });
    await r.deployContract({ passkeyPublicKey: PUBKEY });
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(JSON.parse(init.body).chain).toBe("stellar-pubnet");
  });

  it("routes a C… address to GET /stellar/contract/:address in getAccountState", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ exists: true, hasUsdcTrustline: false, usdcBalance: "12500000", xlmBalance: null })
    });
    const r = buckspayFacilitator({ url: "https://fac.test", apiKey: "k".repeat(16), network: "testnet" });
    await r.getAccountState(C);
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(url).toBe(`https://fac.test/stellar/contract/${C}?chain=stellar-testnet`);
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { FacilitatorClient } from "./facilitator.js";

const BASE = "https://facilitator.example";
const KEY = "test-key";

afterEach(() => vi.restoreAllMocks());

describe("FacilitatorClient", () => {
  it("getAccountState parses Horizon-derived state and sends the api key", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ exists: true, hasUsdcTrustline: true, usdcBalance: "5.0", nativeBalance: "3.0" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    const client = new FacilitatorClient({ baseUrl: BASE, apiKey: KEY, chain: "stellar-testnet" });
    const state = await client.getAccountState("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
    expect(state.exists).toBe(true);
    expect(state.hasUsdcTrustline).toBe(true);
    const [, init] = fetchSpy.mock.calls[0]!;
    expect((init?.headers as Record<string, string>)["x-api-key"]).toBe(KEY);
  });

  it("relay rejects a non-ok HTTP status with the facilitator error body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "auth_expired", message: "expired" }), { status: 400 })
    );
    const client = new FacilitatorClient({ baseUrl: BASE, apiKey: KEY, chain: "stellar-testnet" });
    await expect(
      client.relay({
        token: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
        from: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        to: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        value: "10000000",
        authorizationEntryXdr: "AAAA",
        nonce: "7",
        signatureExpirationLedger: 999
      })
    ).rejects.toThrow(/auth_expired/);
  });

  it("relay parses a soroban Receipt on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          via: "buckspay_self",
          token: "USDC",
          chain: "stellar-testnet",
          transferTx: "abc123",
          blockNumber: "555",
          status: "success"
        }),
        { status: 200 }
      )
    );
    const client = new FacilitatorClient({ baseUrl: BASE, apiKey: KEY, chain: "stellar-testnet" });
    const receipt = await client.relay({
      token: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
      from: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      to: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      value: "10000000",
      authorizationEntryXdr: "AAAA",
      nonce: "7",
      signatureExpirationLedger: 999
    });
    expect(receipt.ok).toBe(true);
    expect(receipt.via).toBe("buckspay_self");
    expect(receipt.transferTx).toBe("abc123");
  });
});

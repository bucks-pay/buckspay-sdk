import { describe, it, expect, vi } from "vitest";
import { buckspayFacilitator } from "../src/buckspay-facilitator/facilitator.js";
import type { RelayPayload } from "@buckspay/core";

// Addresses are opaque strings to the relayer (no StrKey decoding) — used as-is.
const G_FROM = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF5";
const G_TO = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBQ4DH";
const SAC = "CBIELTK6YBZJU2MZWVHTM6JJ4WB73UODXLYWQWWBT4F2HPKBGSU5DAMA";

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const payload: RelayPayload = {
  token: SAC,
  from: G_FROM,
  to: G_TO,
  value: "15000000",
  authorizationEntryXdr: "AAAA",
  nonce: "7",
  signatureExpirationLedger: 5_000_000
};

describe("buckspayFacilitator.relay", () => {
  it("POSTs /relay with the payload and returns a validated Receipt (blockNumber → ledger)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        ok: true,
        via: "buckspay_self",
        token: "USDC",
        chain: "stellar-testnet",
        transferTx: "deadbeef",
        blockNumber: "555",
        status: "success"
      })
    );
    const relayer = buckspayFacilitator({ url: "https://fac.test", network: "testnet" }, { fetch: fetchMock });
    const receipt = await relayer.relay(payload);
    expect(receipt.transferTx).toBe("deadbeef");
    expect(receipt.chain).toBe("stellar-testnet");
    expect(receipt.ledger).toBe(555);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://fac.test/relay");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual(payload);
  });

  it("omits x-api-key in the browser path (no apiKey) and sends it server-side", async () => {
    // mockImplementation → a FRESH Response per call (a Response body is single-use,
    // and this test relays twice: browser then server).
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse(200, {
          ok: true,
          via: "buckspay_self",
          token: "USDC",
          chain: "stellar-testnet",
          transferTx: "tx",
          status: "success"
        })
      )
    );
    // Browser: no apiKey.
    await buckspayFacilitator({ url: "https://fac.test", network: "testnet" }, { fetch: fetchMock }).relay(payload);
    const browserHeaders = (fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(browserHeaders["x-api-key"]).toBeUndefined();

    // Server: apiKey present.
    await buckspayFacilitator(
      { url: "https://fac.test", network: "testnet", apiKey: "secret" },
      { fetch: fetchMock }
    ).relay(payload);
    const serverHeaders = (fetchMock.mock.calls[1]?.[1] as RequestInit).headers as Record<string, string>;
    expect(serverHeaders["x-api-key"]).toBe("secret");
  });

  it("maps an auth_expired 400 to AUTH_EXPIRED", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(400, { error: "auth_expired", message: "expired" }));
    const relayer = buckspayFacilitator({ url: "https://fac.test", network: "testnet" }, { fetch: fetchMock });
    // Single relay call (the Response body is single-use); capture and assert both.
    const err: unknown = await relayer.relay(payload).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BuckspayError);
    expect((err as InstanceType<typeof BuckspayError>).code).toBe("AUTH_EXPIRED");
  });

  it("maps a network failure to RELAYER_UNREACHABLE", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const relayer = buckspayFacilitator({ url: "https://fac.test", network: "testnet" }, { fetch: fetchMock });
    await expect(relayer.relay(payload)).rejects.toMatchObject({ code: "RELAYER_UNREACHABLE" });
  });

  it("rejects an invalid receipt (missing transferTx) as RELAYER_REJECTED", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { ok: true, via: "buckspay_self", token: "USDC", chain: "stellar-testnet", status: "ok" })
    );
    const relayer = buckspayFacilitator({ url: "https://fac.test", network: "testnet" }, { fetch: fetchMock });
    await expect(relayer.relay(payload)).rejects.toMatchObject({ code: "RELAYER_REJECTED" });
  });
});

describe("buckspayFacilitator account + onboard", () => {
  it("getAccountState GETs /stellar/account/:pk?chain= and validates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        chain: "stellar-testnet",
        publicKey: G_FROM,
        exists: true,
        hasUsdcTrustline: true,
        usdcBalance: "10",
        nativeBalance: "1.5",
        usdcTrustlineSponsor: null,
        accountSponsor: null
      })
    );
    const relayer = buckspayFacilitator({ url: "https://fac.test", network: "testnet" }, { fetch: fetchMock });
    const state = await relayer.getAccountState(G_FROM);
    expect(state).toEqual({ exists: true, hasUsdcTrustline: true, usdcBalance: "10", xlmBalance: "1.5" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://fac.test/stellar/account/${G_FROM}?chain=stellar-testnet`);
    expect(init.method ?? "GET").toBe("GET");
  });

  it("buildOnboard POSTs /stellar/onboard/build and returns { xdr }", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true, unsignedTxXdr: "UNSIGNED" }));
    const relayer = buckspayFacilitator(
      { url: "https://fac.test", network: "testnet", apiKey: "secret" },
      { fetch: fetchMock }
    );
    const res = await relayer.buildOnboard({ publicKey: G_FROM });
    expect(res).toEqual({ xdr: "UNSIGNED" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://fac.test/stellar/onboard/build");
    expect(JSON.parse(init.body as string)).toEqual({ publicKey: G_FROM, chain: "stellar-testnet" });
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("secret");
  });

  it("buildOnboard returns empty xdr when nothingToDo (already onboarded)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true, nothingToDo: true }));
    const relayer = buckspayFacilitator(
      { url: "https://fac.test", network: "testnet", apiKey: "k" },
      { fetch: fetchMock }
    );
    const res = await relayer.buildOnboard({ publicKey: G_FROM });
    expect(res).toEqual({ xdr: "" });
  });

  it("submitOnboard POSTs /stellar/onboard/submit and returns { ok }", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true, txHash: "h", ledger: 5 }));
    const relayer = buckspayFacilitator(
      { url: "https://fac.test", network: "testnet", apiKey: "k" },
      { fetch: fetchMock }
    );
    const res = await relayer.submitOnboard({ publicKey: G_FROM, signedTxXdr: "SIGNED" });
    expect(res).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://fac.test/stellar/onboard/submit");
    expect(JSON.parse(init.body as string)).toEqual({
      publicKey: G_FROM,
      chain: "stellar-testnet",
      signedTxXdr: "SIGNED"
    });
  });
});

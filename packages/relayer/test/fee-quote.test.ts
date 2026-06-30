import { describe, expect, it, vi } from "vitest";
import { Address, Keypair, StrKey, nativeToScVal } from "@stellar/stellar-sdk";
import { buckspayFacilitator } from "../src/buckspay-facilitator";
import type { Call } from "@buckspay/core";

const FROM = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 11)).publicKey();
const TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 22)).publicKey();
const USDC = StrKey.encodeContract(Buffer.alloc(32, 33));
const FORWARDER = StrKey.encodeContract(Buffer.alloc(32, 44));
const COLLECTOR = StrKey.encodeContract(Buffer.alloc(32, 55));

const transferCall: Call = {
  contract: USDC,
  fn: "transfer",
  args: [
    new Address(FROM).toScVal(),
    new Address(TO).toScVal(),
    nativeToScVal(10_000_000n, { type: "i128" })
  ]
};

describe("buckspayFacilitator.feeQuote (POST /fee/quote)", () => {
  it("POSTs from/token/chain + base64-serialized calls and parses a FeeQuote (with collector)", async () => {
    const fetchDouble = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        ({
          ok: true,
          json: async () => ({
            forwarder: FORWARDER,
            collector: COLLECTOR,
            token: USDC,
            estimatedXlmFee: "1000000",
            tokenAmount: "132000",
            expiresAtLedger: 99999
          })
        }) as Response
    );
    const relayer = buckspayFacilitator({ url: "https://fac.example", network: "testnet" }, { fetch: fetchDouble });

    const quote = await relayer.feeQuote({ from: FROM, token: USDC, calls: [transferCall] });
    expect(quote).toEqual({
      forwarder: FORWARDER,
      collector: COLLECTOR,
      token: USDC,
      estimatedXlmFee: "1000000",
      tokenAmount: "132000",
      expiresAtLedger: 99999
    });

    const call0 = fetchDouble.mock.calls[0]!;
    expect(call0[0]).toBe("https://fac.example/fee/quote");
    const body = JSON.parse((call0[1] as RequestInit).body as string) as {
      chain: string;
      from: string;
      token: string;
      calls: { contract: string; fn: string; args: string[] }[];
    };
    expect(body.chain).toBe("stellar-testnet");
    expect(body.from).toBe(FROM);
    expect(body.token).toBe(USDC);
    expect(body.calls[0]!.fn).toBe("transfer");
    expect(body.calls[0]!.args).toHaveLength(3);
    expect(typeof body.calls[0]!.args[0]).toBe("string"); // base64 ScVal, JSON-safe
  });

  it("maps a malformed quote (missing collector) to RELAYER_REJECTED", async () => {
    const fetchDouble = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        ({
          ok: true,
          json: async () => ({
            forwarder: FORWARDER,
            token: USDC,
            estimatedXlmFee: "1",
            tokenAmount: "1",
            expiresAtLedger: 1
          })
        }) as Response
    );
    const relayer = buckspayFacilitator({ url: "https://fac.example", network: "testnet" }, { fetch: fetchDouble });
    await expect(relayer.feeQuote({ from: FROM, token: USDC, calls: [transferCall] })).rejects.toMatchObject({
      code: "RELAYER_REJECTED"
    });
  });
});

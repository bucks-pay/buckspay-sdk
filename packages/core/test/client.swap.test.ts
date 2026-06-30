import { describe, expect, it, vi } from "vitest";
import { BuckspayClient } from "../src/client";
import { BuckspayError } from "../src/errors";
import type { BuckspayConfig, Receipt, SwapQuote } from "../src/types";
import { makeMockConfig } from "./helpers/mocks";

const QUOTE: SwapQuote = { tokenIn: "CIN", tokenOut: "COUT", amountIn: "1000000", amountOut: "990000" };
const RECEIPT: Receipt = {
  ok: true,
  via: "calibur_7702",
  token: "COUT",
  chain: "base-sepolia",
  transferTx: "0x" + "a".repeat(64),
  status: "success"
};

/** A connected client whose relayer is a swap-capable mock. */
async function connectedClient(over: Partial<BuckspayConfig["relayer"]> = {}) {
  const { config } = makeMockConfig();
  const relayer = {
    ...config.relayer,
    quoteSwap: vi.fn(async () => QUOTE),
    swap: vi.fn(async () => RECEIPT),
    ...over
  };
  const client = new BuckspayClient({ ...config, relayer });
  await client.connect();
  return { client, relayer };
}

describe("BuckspayClient.quoteSwap / swap (stretch, delegates to relayer)", () => {
  it("quoteSwap delegates to the relayer with the connected payer", async () => {
    const { client, relayer } = await connectedClient();
    const q = await client.quoteSwap({ tokenIn: "CIN", tokenOut: "COUT", amount: "1000000" });
    expect(q).toEqual(QUOTE);
    expect(relayer.quoteSwap).toHaveBeenCalledWith(
      expect.objectContaining({ tokenIn: "CIN", tokenOut: "COUT", amount: "1000000" })
    );
  });

  it("swap enforces minOut BEFORE submitting (refuses a below-floor quote)", async () => {
    const { client, relayer } = await connectedClient();
    await expect(
      client.swap({ tokenIn: "CIN", tokenOut: "COUT", amount: "1000000", minOut: "1000000" })
    ).rejects.toMatchObject({ code: "SWAP_FAILED" });
    expect(relayer.swap).not.toHaveBeenCalled(); // never submitted
  });

  it("swap submits when the live quote meets minOut", async () => {
    const { client, relayer } = await connectedClient();
    const r = await client.swap({ tokenIn: "CIN", tokenOut: "COUT", amount: "1000000", minOut: "990000" });
    expect(r.ok).toBe(true);
    expect(relayer.swap).toHaveBeenCalledOnce();
  });

  it("maps a relayer throw to SWAP_FAILED", async () => {
    const { client } = await connectedClient({
      swap: vi.fn(async () => {
        throw new Error("dex_quote_failed");
      })
    });
    await expect(client.swap({ tokenIn: "CIN", tokenOut: "COUT", amount: "1000000" })).rejects.toMatchObject({
      code: "SWAP_FAILED"
    });
  });

  it("fails closed with SWAP_FAILED when the relayer has no swap support", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config); // mock relayer without quoteSwap/swap
    await client.connect();
    await expect(
      client.quoteSwap({ tokenIn: "CIN", tokenOut: "COUT", amount: "1000000" })
    ).rejects.toBeInstanceOf(BuckspayError);
  });
});

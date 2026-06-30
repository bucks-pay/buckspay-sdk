import { describe, expect, it, vi } from "vitest";
import { buckspayFacilitator } from "../src/buckspay-facilitator/index";

const QUOTE_RES = {
  quoteId: "11111111-1111-1111-1111-111111111111",
  typedData: "{}",
  needsAuthorization: false,
  authorizationPayload: null,
  sellAmount: "1000000",
  expectedBuyAmount: "990000",
  minBuyAmount: "985000",
  slippageBps: 50,
  source: "univ3-direct",
  expiresAt: new Date(Date.now() + 60_000).toISOString()
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("buckspayFacilitator swap delegation (existing /swap/* rail)", () => {
  it("quoteSwap maps /swap/quote to a SwapQuote", async () => {
    const fetch = vi.fn(async (_url: string) => jsonResponse(QUOTE_RES));
    const relayer = buckspayFacilitator(
      { url: "http://f", apiKey: "k".repeat(16), network: "testnet", swapChain: "base-sepolia" },
      { fetch }
    );
    const q = await relayer.quoteSwap!({ payer: "0xpayer", tokenIn: "0xin", tokenOut: "0xout", amount: "1000000" });
    expect(q).toEqual({ tokenIn: "0xin", tokenOut: "0xout", amountIn: "1000000", amountOut: "990000" });
    const [path] = fetch.mock.calls[0]!;
    expect(path).toBe("http://f/swap/quote");
  });

  it("maps a non-2xx /swap/quote to SWAP_FAILED", async () => {
    const fetch = vi.fn(async () => jsonResponse({ error: "dex_quote_failed", message: "no_liquidity" }, 400));
    const relayer = buckspayFacilitator(
      { url: "http://f", apiKey: "k".repeat(16), network: "testnet", swapChain: "base-sepolia" },
      { fetch }
    );
    await expect(
      relayer.quoteSwap!({ payer: "0xp", tokenIn: "0xi", tokenOut: "0xo", amount: "1" })
    ).rejects.toMatchObject({ code: "SWAP_FAILED" });
  });

  it("omits quoteSwap/swap when no swapChain is configured (fails closed)", () => {
    const relayer = buckspayFacilitator({ url: "http://f", network: "testnet" });
    expect(relayer.quoteSwap).toBeUndefined();
    expect(relayer.swap).toBeUndefined();
  });
});

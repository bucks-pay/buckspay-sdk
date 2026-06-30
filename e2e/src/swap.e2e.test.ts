import { describe, it, expect } from "vitest";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";
import { SWAP_ENABLED, e2eEnv } from "./env.js";

// Quote-only: hits the real /swap/quote (Uniswap-V3-direct on base-sepolia per directDex.ts).
// No submit leg here — that needs the EVM wallet signature (see the plan's stretch note).
describe.skipIf(!SWAP_ENABLED)("swap quote (STRETCH smoke, no funds)", () => {
  it("quotes a swap via the facilitator /swap rail and maps to SwapQuote", async () => {
    const relayer = buckspayFacilitator({
      url: e2eEnv.FACILITATOR_URL,
      ...(e2eEnv.FACILITATOR_API_KEY ? { apiKey: e2eEnv.FACILITATOR_API_KEY } : {}),
      network: "testnet",
      swapChain: e2eEnv.SWAP_CHAIN!
    });
    const q = await relayer.quoteSwap!({
      payer: e2eEnv.SWAP_PAYER_EVM!,
      tokenIn: e2eEnv.SWAP_SELL_TOKEN!,
      tokenOut: e2eEnv.SWAP_BUY_TOKEN!,
      amount: e2eEnv.SWAP_SELL_AMOUNT!
    });
    expect(q.tokenIn).toBe(e2eEnv.SWAP_SELL_TOKEN);
    expect(q.tokenOut).toBe(e2eEnv.SWAP_BUY_TOKEN);
    expect(BigInt(q.amountIn)).toBe(BigInt(e2eEnv.SWAP_SELL_AMOUNT!));
    expect(BigInt(q.amountOut)).toBeGreaterThan(0n);
  });
});

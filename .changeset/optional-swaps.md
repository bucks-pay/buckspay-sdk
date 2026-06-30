---
"@buckspay/core": patch
"@buckspay/relayer": patch
---

**Optional gasless swaps (stretch).** `BuckspayClient` gains `quoteSwap({ tokenIn, tokenOut, amount })`
and `swap({ tokenIn, tokenOut, amount, minOut? })`, delegating to the facilitator's existing `/swap/*`
rail via two new optional `Relayer` methods (`quoteSwap?` / `swap?`). The `minOut` slippage floor is
enforced before any submit, and every swap-rail failure maps to `BuckspayError("SWAP_FAILED")`.
`buckspayFacilitator({ swapChain })` exposes the swap methods (mapping `/swap/quote` to `SwapQuote`);
without `swapChain` they are omitted and `swap` fails closed. `Receipt.chain` is widened additively to
accept the EVM swap chain. `quoteSwap` works end-to-end; the EVM submit leg goes through the app BFF.

# Feature coverage

> This page is completed by the GA docs pass. For now it carries the swaps cut decision.

## Swaps — cut decision

**Swaps is a STRETCH feature and the first item cut to a later cycle.** The core surface
(connect, gasless pay, gas-in-token, batch, sessions, social/email onboarding, React Native) does
**not** depend on it — GA closes regardless.

**The EVM/Stellar seam.** The facilitator's existing `/swap/*` rail is the EVM Calibur (EIP-7702)
path: `/swap/submit` consumes an EIP-712 `batchSignature` from the payer's **EVM wallet**, not the
SDK's Soroban `BuckspaySigner`. `quoteSwap` is signer-agnostic and ships end-to-end; the `swap`
**submit** leg needs the EVM wallet path (the app BFF → `/swap/submit`).

> **Decided: KEEP — 2026-06-30**

**As KEPT (current state):**
- `BuckspayClient.quoteSwap` ships end-to-end (delegates to `/swap/quote`, maps to `SwapQuote`).
- `BuckspayClient.swap` enforces the `minOut` floor before submit and fails closed (`SWAP_FAILED`)
  until the EVM wallet submit path (app BFF → `/swap/submit`) is wired; the full submit leg / a
  native Stellar (Soroswap) rail is the future swap work.
- `buckspayFacilitator({ swapChain })` exposes `quoteSwap`/`swap`; without `swapChain` both are
  omitted. `docs/examples/14-swap.ts` and the gated `swap.e2e.test.ts` cover the quote path.

**If later CUT:** revert this surface — the `Receipt.chain` widening, `Relayer.quoteSwap?`/`swap?`,
the `BuckspayClient.quoteSwap`/`swap` methods, the `swapChain` option, `docs/examples/14-swap.ts`,
the gated `swap.e2e.test.ts`, and this section's KEEP detail — and move swaps to a native DEX /
Soroswap rail on the Stellar side (removing the EVM seam).

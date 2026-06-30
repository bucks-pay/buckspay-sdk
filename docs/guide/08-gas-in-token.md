# Gas in stablecoin (pay fees in USDC)

`gas: { mode: "token", token }` lets the payer settle the Soroban fee **in USDC** instead of
holding XLM. It is the opt-in for "the user has stablecoins but no native gas token". Sponsored
mode (see [Gasless modes](./03-gasless-modes.md)) needs none of this — pick `token` only when
*you* want the user, not your sponsor, to cover the fee, paid in the asset they already hold.

```ts
import type { BuckspayConfig } from "@buckspay/core";

const config: BuckspayConfig = {
  network: "testnet",
  account: classicAccount(),
  signer: walletsKit({ network: "testnet" }),
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  // Pay gas in USDC; refuse any quote above the ceiling (stroops).
  gas: { mode: "token", token: USDC_SAC, maxFee: "2000000" } // 0.2 USDC ceiling
};
```

## How it settles — one signature

`prepare()` calls `POST /fee/quote`, which returns a `FeeQuote`:

```ts
interface FeeQuote {
  forwarder: string;        // FeeForwarder contract that pulls the fee
  collector: string;        // where the relayer's reimbursement lands
  token: string;            // the fee token (echoes your config)
  estimatedXlmFee: string;  // the XLM the relayer fronts
  tokenAmount: string;      // what the payer owes in `token`
  expiresAtLedger: number;  // quote validity window
}
```

The engine does **not** relay the bare transfer. It builds a **single** `FeeForwarder.forward(payer,
token, merchant, payment, collector, fee)` invocation — one auth entry that pays the merchant **and**
reimburses the relayer's XLM gas in the token at once. The payer signs **once**; there is no second
entry to approve.

## The `maxFee` ceiling

`maxFee` (stroops, optional) is a hard cap. If the quote's `tokenAmount` exceeds it, `prepare()`
throws `BuckspayError("TOKEN_GAS_REJECTED")` **before** anything is signed — a fee surge can never
surprise the user. Omit `maxFee` to accept the facilitator's quote as-is.

Compiled example: `docs/examples/09-gas-in-token.ts`.

Prev: [Migrating from direct facilitator calls](./07-migrating-from-facilitator.md) · Next: [Atomic batch](./09-atomic-batch.md)

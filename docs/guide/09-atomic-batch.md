# Atomic batch

`sendCalls([...])` settles N calls **all-or-nothing in one transaction**, authorized with a
**single** signature. It is the EIP-5792-style alias of `pay` — same input, same `Receipt` — with
the atomicity guarantee made explicit. A batch of one is exactly `pay([call])`.

```ts
import { batch, MAX_BATCH_CALLS, BuckspayError } from "@buckspay/core";

// The pure builder collects calls and enforces the cap on build().
const calls = batch()
  .add(client.transfer({ token: USDC_SAC, to: A, amount: "1.00" }))
  .add(client.transfer({ token: USDC_SAC, to: B, amount: "2.50" }))
  .build();

const receipt = await client.sendCalls(calls); // both land or neither does
```

## The native mechanism

- **Classic (`G…`) accounts** — a multi-operation Stellar transaction: the operations share one
  envelope, so the network applies all or none.
- **Contract (`C…`) accounts** — the pinned **Multicall** router's `batch_transfer`: the smart
  account authorizes the whole batch in `__check_auth` with one signature.

Either way the atomic unit is the *transaction*, so partial application is impossible at the
protocol level — not enforced by retry logic in the SDK.

## The size cap

`MAX_BATCH_CALLS` is `16`. The builder's `build()` (and `sendCalls` directly) reject an oversized
batch with `BuckspayError("BATCH_TOO_LARGE")`. Keep batches bounded so a single auth entry stays
within simulation and fee limits.

## Parity invariant

A **batch of one is byte-identical to the single-call entry** — the same auth entry the SDK has
always produced for `pay([call])`. Batching adds a wrapper for N > 1; it never changes the
one-call path. This is pinned by a regression golden so the core path can't drift.

Compiled example: `docs/examples/10-batch.ts`.

> **Throughput note.** Settling many *independent* payments fast is a separate concern from
> atomic batching: the facilitator spreads them across a pool of channel accounts with
> non-sequential nonces, transparently — no API surface, no change to how you call `pay`.

Prev: [Gas in stablecoin](./08-gas-in-token.md) · Next: [Sessions](./10-sessions.md)

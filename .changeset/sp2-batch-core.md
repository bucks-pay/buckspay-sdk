---
"@buckspay/core": minor
"@buckspay/accounts": minor
---

SP-2 sprint-2 atomic batch: `client.sendCalls(calls)` (EIP-5792-style) and `client.prepare(calls)` settle
N USDC transfers **all-or-nothing in ONE tx** via the pinned Multicall router's
`batch_transfer(payer, token, Vec<(to, amount)>)` — one nonce, one signature for the whole batch, the
same shape for classic (`G…`) and contract (`C…`) accounts. Adds the **required**
`AccountAdapter.buildUnsignedBatchEntry` (both first-party account models implement it; a batch of 1 is
byte-identical to the SP-1 single-call entry — the sponsored path is unchanged) plus `BuildBatchEntryInput`.
`MAX_BATCH_CALLS` (16) is enforced fail-closed at `batch().build()`, `prepare`, and `sendCalls`
(`BATCH_TOO_LARGE`). Proven on testnet with real Circle USDC (the Multicall router is the sprint-0/03
spike deploy, wasm-hash-pinned).

Adding a required member to the public `AccountAdapter` interface is a breaking interface change →
**minor** (pre-1.0). Batch is a universal account capability (every account that authorizes a single
transfer authorizes a batch), so it belongs in the contract as required, not optional.

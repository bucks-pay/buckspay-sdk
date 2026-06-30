---
"@buckspay/core": patch
"@buckspay/relayer": patch
---

SP-2 gas-in-token (core): `gas: { mode: "token", token }` pays Soroban gas in a stablecoin. The SDK
quotes the fee via the **optional** `Relayer.feeQuote` (`POST /fee/quote`) and relays a single FeeForwarder
`forward(payer, token, merchant, payment, collector, fee)` invocation (one auth entry) instead of the direct
transfer, enforcing a `gas.maxFee` ceiling (`TOKEN_GAS_REJECTED`). Adds `FeeQuote.collector` and the generic
`buildUnsignedCallEntry`. `feeQuote` is optional on `Relayer` (additive — a relayer without it refuses token
mode with `INVALID_CONFIG`); sponsored mode is byte-identical to before.

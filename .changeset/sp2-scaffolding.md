---
"@buckspay/core": patch
"@buckspay/accounts": patch
"@buckspay/signers": patch
"@buckspay/react": patch
"@buckspay/relayer": patch
"@buckspay/nextjs": patch
"@buckspay/react-native": patch
---

SP-2 scaffolding: additive type surface (the `sponsored | token` gas union, `FeeQuote` /
`AuthDetails` / session / `SwapQuote` types, six new `BuckspayError` codes, the optional
`BuckspaySigner.authenticate`, optional fee fields on the intents/relay payload), the pure
`batch()` builder + `MAX_BATCH_CALLS`, and buildable skeletons for the new `@buckspay/nextjs`
and `@buckspay/react-native` packages plus the `signers/social`, `signers/email`, and
`accounts/policy` subpaths. No behavior change to existing paths — `gas: { mode: "token" }`
fails closed with `TOKEN_GAS_REJECTED` until SP-2 sprint-1 wires the FeeForwarder.

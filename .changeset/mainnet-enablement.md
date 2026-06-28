---
"@buckspay/core": patch
---

Enable mainnet from the browser. `BuckspayConfig` gains an optional `allowMainnet`
flag — a deliberate, reviewable opt-in for environments with no `process.env`
(browsers) that is ORed with the existing Node `BUCKSPAY_ALLOW_MAINNET=1` env.
Pubnet stays refused unless one of the two signals is present; `resolveNetwork`
remains the single gate.

Adds the `mainnetSimContext(rpcUrl, { sponsorAddress })` preset: a thin wrapper over
`createRpcSimContext` that forces the funded sponsor G-address as the recording sim's
`simSource`, so the contract/passkey account model on pubnet can never omit it (a
missing source otherwise resolves the SAC balance footprint to zero). `sponsorAddress`
is the sponsor's PUBLIC key only — no secret enters the SDK.

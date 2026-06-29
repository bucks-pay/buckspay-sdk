---
"@buckspay/core": patch
"@buckspay/accounts": patch
"@buckspay/signers": patch
"@buckspay/relayer": patch
"@buckspay/react": patch
---

Mainnet (Stellar pubnet) is now supported via explicit opt-in.

Gasless USDC payments — both the classic (G-account + Wallets Kit) and the
contract/passkey (C-account, OpenZeppelin Smart Account) flows — run on pubnet
when the caller explicitly opts in (`allowMainnet: true` in the browser config /
`BUCKSPAY_ALLOW_MAINNET=1` in Node). Mainnet is OFF by default: without the opt-in,
`resolveNetwork("pubnet", …)` throws `INVALID_CONFIG`, so no default or forgotten
configuration can move real funds. The real pubnet path is proven by a guarded e2e
smoke (tiny 0.0001 USDC transfers) and gated behind the mainnet cutover runbook.

No breaking changes: testnet behavior and the public API surface (README §4) are
unchanged. Pre-1.0 → patch per VERSIONING.md §4.1.

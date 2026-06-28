# buckspay SDK — Audit Prep (v1 / M2)

Scopes a v1 audit and the release-blocker gate. Every blocker maps to a verification command.

## Scope (in)

The SDK packages — `core`, `accounts/oz-contract`, `signers/passkey`,
`relayer/buckspay-facilitator`, `react` — and the facilitator's new `contract` endpoints +
the relay `from`=C-address path. **Focus areas:** auth-entry construction, the `__check_auth`
secp256r1 signature format, expiration/nonce handling, the relayer trust boundary, and the
BFF key boundary.

## Scope (out / deferred)

The audited **OpenZeppelin Smart Account contract** itself (we pin its Wasm hash, we do not
re-audit OZ's code), the wallet/authenticator implementations (Freighter, platform WebAuthn),
and SP-2 features (token-gas, batch, sessions, social login).

## Contracts vs SDK boundary

buckspay **deploys + authorizes against** OZ contracts but does **not author the contract
logic**. The SDK's security responsibility ends at producing correct, bounded, validated auth
entries and never holding secrets. The on-chain `__check_auth` is the sole signature verifier.

## Known accepted risks (tracked, not blockers for testnet v1)

- **Transitive advisories + copyleft via `@creit.tech/stellar-wallets-kit`.** Its multi-wallet
  connectors pull Trezor/xBull/LOBSTR/Near/Hot/WalletConnect/ethereumjs, which carry
  `pnpm audit` advisories (high/critical) and copyleft/Unknown licenses (AGPL `ua-parser-js`,
  LGPL `rpc-websockets`, GPL `@lobstrco/*`, MPL `@ethereumjs/*`). These are **not buckspay code**
  and the copyleft is confined to connector modules the Stellar gasless path never exercises.
  **Before mainnet:** resolve via `pnpm overrides` / upstream fixes, or narrow the wallets-kit
  connector surface. The license gate exempts them explicitly (`scripts/check-licenses.mjs`).

## Release-blocker checklist

| Blocker | Verification command |
|---|---|
| Threat model present | `bash scripts/check-threat-model.sh` |
| No secrets in src | `bash scripts/check-no-secrets-in-src.sh` |
| No secret in react bundle | `pnpm --filter @buckspay/react exec vitest run no-secret-in-bundle` |
| Expiration bounded | `pnpm --filter @buckspay/core exec vitest run expiration-bounded` |
| Licenses within allow-list | `pnpm licenses` |
| OZ Wasm hash pinned (real spike value) | `pnpm --filter @buckspay/accounts exec vitest run oz-wasm-pin` |
| Mainnet gated | `pnpm --filter @buckspay/core exec vitest run network-gate` |
| e2e green on testnet (plan 01) | `BUCKSPAY_E2E=1 pnpm e2e` |
| `pnpm audit` reviewed (transitive advisories accepted/resolved) | `pnpm audit --audit-level=high --prod` |

Run all at once: `bash scripts/release-gate.sh`.

## Sign-off

| Auditor | Date | Scope hash | Result |
|---|---|---|---|
| _(pending)_ | | | |

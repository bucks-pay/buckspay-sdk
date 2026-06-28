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

## Transitive risks from `@creit.tech/stellar-wallets-kit` (status)

Its multi-wallet connectors (Trezor/xBull/LOBSTR/Near/Hot/WalletConnect/ethereumjs) pull deps
that are **not buckspay code**:

- **Advisories — RESOLVED (high + critical).** All 5 high + 1 critical were `protobufjs <7.6.1`.
  Pinned to the patched `>=7.6.1 <8` via a `pnpm overrides` entry in `pnpm-workspace.yaml`
  (kept on the 7.x line to avoid a major bump). `pnpm audit --audit-level=high --prod` is now
  clean; the full workspace suite stays green. Remaining: **1 low + 1 moderate**, accepted —
  not high-severity, no patch path that doesn't churn the connector tree; re-checked weekly by CI.
- **Copyleft/Unknown licenses — accepted.** AGPL `ua-parser-js`, LGPL `rpc-websockets`,
  GPL `@lobstrco/*`, MPL `@ethereumjs/*`, plus several `Unknown`. The copyleft is confined to
  connector modules the Stellar gasless path never exercises; they are not redistributed as
  part of any `@buckspay/*` package. The license gate exempts them explicitly, with a per-package
  reason (`scripts/check-licenses.mjs`). **Before mainnet:** narrow the wallets-kit connector
  surface (or vendor a minimal connector) to drop the copyleft tree entirely.

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
| e2e green on testnet (classic + contract/passkey flows) | `BUCKSPAY_E2E=1 pnpm e2e` |
| `pnpm audit` reviewed (transitive advisories accepted/resolved) | `pnpm audit --audit-level=high --prod` |

Run all at once: `bash scripts/release-gate.sh`.

## Sign-off

| Auditor | Date | Scope hash | Result |
|---|---|---|---|
| _(pending)_ | | | |

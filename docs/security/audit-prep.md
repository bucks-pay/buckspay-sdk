# buckspay SDK — Audit Prep (v1)

Scopes a v1 audit and the release-blocker gate. Every blocker maps to a verification command.

## Scope (in)

The SDK packages — `core`, `accounts/oz-contract`, `signers/passkey`,
`relayer/buckspay-facilitator`, `react` — and the facilitator's new `contract` endpoints +
the relay `from`=C-address path. **Focus areas:** auth-entry construction, the `__check_auth`
secp256r1 signature format, expiration/nonce handling, the relayer trust boundary, and the
BFF key boundary. Also **in scope: the deployed `minimal-passkey-account` smart-account wrapper**
(`spikes/passkey-contract/contract/src/lib.rs`) — buckspay-authored `__constructor`/`__check_auth`
around OZ's audited verifier; see `contract-provenance.md`.

## Scope (out / deferred)

OpenZeppelin's audited WebAuthn/secp256r1 **verifier** (`stellar_accounts::verifiers::webauthn::verify`)
— we pin the wasm that calls it and do not re-audit OZ's verifier; the buckspay wrapper around it
is **in** scope (above). Also out of scope: the wallet/authenticator implementations (Freighter,
platform WebAuthn) and the gasless features (token-gas, batch, sessions, social login).

## Contracts vs SDK boundary

buckspay **deploys + authorizes against** a smart-account contract. It does **not** author the
cryptographic verifier (OZ's audited `verify`), but it **does** author the thin
`minimal-passkey-account` wrapper around it (`__constructor`/`__check_auth`) — that wrapper is in
audit scope (see `contract-provenance.md`). The SDK's off-chain responsibility ends at producing
correct, bounded, validated auth entries and never holding secrets. The on-chain `__check_auth`
(wrapper) → `verify` (OZ) is the sole signature verifier.

## Transitive risks from `@creit.tech/stellar-wallets-kit` (status)

Its multi-wallet connectors (Trezor/xBull/LOBSTR/Near/Hot/WalletConnect/ethereumjs) pull deps
that are **not buckspay code**:

- **Advisories — RESOLVED (high + critical).** All 5 high + 1 critical were `protobufjs <7.6.1`.
  Pinned to the patched `>=7.6.1 <8` via a `pnpm overrides` entry in `pnpm-workspace.yaml`
  (kept on the 7.x line to avoid a major bump). `pnpm audit --audit-level=high --prod` is now
  clean; the full workspace suite stays green. Remaining: **1 low + 1 moderate**, accepted —
  not high-severity, no patch path that doesn't churn the connector tree; re-checked weekly by CI.
- **Copyleft/Unknown licenses — ACCEPTED (confined + CI-locked).** AGPL `ua-parser-js`, LGPL
  `rpc-websockets`, GPL `@lobstrco/*`, MPL `@ethereumjs/*`, plus several `Unknown` (Trezor/Near/
  Hot/xBull connectors). All are **hard transitive deps of `@creit.tech/stellar-wallets-kit`** —
  connector modules the Stellar gasless path never exercises; they are not redistributed as part
  of any `@buckspay/*` package. **Finding:** narrowing the runtime module set does
  **not** remove them — they are declared by the umbrella package, so importing it pulls the whole
  tree regardless of which modules are instantiated (the signer already wires only Freighter/xBull/
  LOBSTR). The license gate exempts exactly this set with a per-package reason
  (`scripts/check-licenses.mjs`), and a guard locks the acceptance: any copyleft/Unknown dep
  **outside** the known wallets-kit set fails CI
  (`pnpm --filter @buckspay/signers exec vitest run no-unexpected-copyleft`). **Clean-slate fix
  (deferred, deliberate product decision):** vendor a Freighter-only connector via
  `@stellar/freighter-api` and drop `@creit.tech/stellar-wallets-kit` entirely — this removes the
  copyleft tree but loses multi-wallet (xBull/LOBSTR) support, so it was not taken.

## Release-blocker checklist

| Blocker | Verification command |
|---|---|
| Threat model present | `bash scripts/check-threat-model.sh` |
| No secrets in src | `bash scripts/check-no-secrets-in-src.sh` |
| No secret in react bundle | `pnpm --filter @buckspay/react exec vitest run no-secret-in-bundle` |
| Expiration bounded | `pnpm --filter @buckspay/core exec vitest run expiration-bounded` |
| Licenses within allow-list | `pnpm licenses` |
| OZ Wasm hash pinned (real pinned value) | `pnpm --filter @buckspay/accounts exec vitest run oz-wasm-pin` |
| Mainnet gated | `pnpm --filter @buckspay/core exec vitest run network-gate` |
| e2e green on testnet (classic + contract/passkey flows) | `BUCKSPAY_E2E=1 pnpm e2e` |
| `pnpm audit` reviewed (transitive advisories accepted/resolved) | `pnpm audit --audit-level=high --prod` |

Run all at once: `bash scripts/release-gate.sh`.

## Mainnet release blockers

Extends the checklist above with the mainnet-cutover items. Each maps 1:1 to a line in
`scripts/release-gate.sh`.

| Blocker | Verification command | Status |
|---|---|---|
| Secrets rotated (no tracked `.env*`, sponsor ≠ leaked `G`) | `bash scripts/check-no-committed-env.sh` | guard |
| Secret-rotation runbook present | `test -f docs/security/secret-rotation.md` | doc |
| Licenses within allow-list (copyleft confined to wallets-kit) | `node scripts/check-licenses.mjs` | guard |
| No **unexpected** copyleft in prod tree | `pnpm --filter @buckspay/signers exec vitest run no-unexpected-copyleft` | guard |
| OZ wasm-hash pin reproducible | `node scripts/verify-wasm-hash.mjs` | guard |
| Cross-repo wasm-pin parity | `bash scripts/check-pin-parity.sh` | guard |
| Mainnet cutover runbook present | `bash scripts/check-cutover-runbook.sh` | guard |
| Gated mainnet smoke | `BUCKSPAY_E2E_MAINNET=1 BUCKSPAY_E2E=1 pnpm e2e` | gated (skips when unset) |

> **Copyleft note:** this gate enforces "no copyleft **outside** the accepted wallets-kit tree",
> not "zero copyleft" — the multi-wallet connectors are an accepted, confined risk (see the
> transitive-risks section above). Flipping to zero-copyleft requires the deferred Freighter-only
> vendoring.

## Sign-off

The audit sign-off is filled by the auditor once `bash scripts/release-gate.sh` is green
end-to-end. The **scope hash** ties a specific audit to a specific tree state — recompute with
`bash scripts/audit-scope-hash.sh`; if it no longer matches, in-scope code changed after sign-off
and the audit must be re-validated.

| Auditor | Date | Scope hash | Result |
|---|---|---|---|
| _(pending — engagement not yet run)_ | | `963d5e9e36f38dcb16719da305372ae6af2ea0cb981ff96fbe8a506637f944d9` | _(pending)_ |

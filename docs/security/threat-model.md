# buckspay SDK — Threat Model (v1)

STRIDE-style rows for the six surfaces. Status ∈ {mitigated · accepted · deferred-to-audit}.
Verified present by `scripts/check-threat-model.sh`.

## 1. Signer custody

**Threat:** key extraction / unauthorized signing.
**Mitigation:** keys live only in the wallet (Wallets Kit) or the authenticator (WebAuthn
secp256r1). `BuckspaySigner` (§4.1) returns **only** public keys + signatures — there is no
code path that reads a secret. The Ed25519 signer used in tests is a test-only double under
`e2e/`. **Status: mitigated by design.**

## 2. Relayer trust

**Threat:** a malicious/compromised facilitator returns a fake receipt or substitutes the transfer.
**Mitigation:** the facilitator can only *submit* what the payer signed — the on-chain auth
entry binds `from/to/amount/contract` (`facilitator/src/stellarSubmit.ts validateInvocation`),
so the relayer **cannot alter** the transfer. The SDK validates the `Receipt` shape with zod
before trusting `transferTx`. `Relayer` is an interface, so a neutral relayer is droppable later.
**Status: mitigated** (single-provider risk **accepted** for v1; SP-3 adds neutrality).

## 3. Sponsor-key exposure

**Threat:** the facilitator's sponsor secret (`STELLAR_SPONSOR_SECRET_*`) leaks.
**Mitigation:** the sponsor secret lives only in the facilitator env — never in the SDK or any
client; the SDK never references it. Onboarding/deploy txs are sponsor-sandwich validated
server-side (`facilitator/src/stellar.ts ALLOWED_ONBOARD_OPS`). **Status: mitigated**; key
rotation + spend caps tracked in [key-handling](./key-handling.md).

## 4. Replay / expiration

**Threat:** a captured signed auth entry is replayed.
**Mitigation:** each entry carries a random `nonce` and a `signatureExpirationLedger`; the
facilitator rejects expired entries (`stellarSubmit.ts`) and the network rejects nonce reuse.
The SDK **caps** the expiration ledger to `MAX_EXPIRATION_LEDGERS` (`core/src/expiration.ts`,
guard test `expiration-bounded.test.ts`), so the replay window can't be widened.
**Status: mitigated.**

## 5. Passkey phishing (rpId binding)

**Threat:** a phishing origin tries to drive the user's passkey.
**Mitigation:** WebAuthn binds credentials to the `rpId`; the SDK requires `passkey({ rpId })`
and the demo derives `rpId` from `window.location.hostname`. A credential created for
`app.buckspay.dev` **cannot** be asserted from `evil.example`. Rule: never accept a
caller-supplied `rpId` that doesn't match the page origin. **Status: mitigated** by WebAuthn +
correct rpId usage.

## 6. Tenant isolation

**Threat:** one tenant's payment/intent leaks into another's flow.
**Mitigation:** the SDK is stateless per `BuckspayClient` instance (one config = one
network/account/relayer); there is no shared module-level mutable state across tenants. The
dashboard BFF scopes intents per tenant (out of SDK scope, but the integrator's
responsibility). **Status: mitigated in SDK**; integrator-responsibility boundary stated.

## Out of scope for v1 / deferred to audit

The audited OpenZeppelin Smart Account *contract* (we pin its Wasm, we don't re-audit OZ),
the wallet/authenticator implementations, and the gasless features (token-gas, batch, sessions,
social login). See [audit-prep](./audit-prep.md).

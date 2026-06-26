# Passkey Contract Spike — GO / NO-GO DECISION (GATE for Sprint 4 / M2)

> **Status: ✅ GO — all of Q1/Q2/Q3 proven on-chain (testnet). Sprint 4 is UNBLOCKED.**
> Run date: 2026-06-26. Contract: minimal secp256r1 smart account on OZ's audited WebAuthn verifier.

## Evidence (live testnet)
- **Passkey contract account (C-address):** `CDVBZNFAHAT2JJQFZCZP4OWSPO7WWI3A5G63KGFUATQ6NL36J7E2KM75`
  ([explorer](https://stellar.expert/explorer/testnet/contract/CDVBZNFAHAT2JJQFZCZP4OWSPO7WWI3A5G63KGFUATQ6NL36J7E2KM75))
- **Transfer tx (from = C-address, secp256r1-authorized):**
  `5e04834dde106e6e2a32122b533f249fd1535b7c6234edae7c92b35179d853a7`
  ([explorer](https://stellar.expert/explorer/testnet/tx/5e04834dde106e6e2a32122b533f249fd1535b7c6234edae7c92b35179d853a7)) —
  Horizon `successful:true`, ledger 3299428.
- **Gasless proof:** fee (`23629` stroops) paid by the **sponsor** `GDKAC…4RPI` (tx source/fee account), NOT the
  passkey account. The C-account holds no XLM.

## Resolved open questions
### Q1 — OZ Wasm versioning / install  ✅
- Contract: `minimal-passkey-account` (single-signer; uses `stellar_accounts::verifiers::webauthn::verify`,
  stellar-accounts 0.7.1, soroban-sdk 26.1.0, `stellar` CLI 25.2.0). Source committed under `contract/`.
- **Installed Wasm hash (hex):** `bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69`
- Install model: **one-time per network** (`uploadContractWasm` once → `createCustomContract` per instance). ✓
- Deploy is **sponsor-paid** via `createCustomContract` with `constructorArgs = [scvBytes(pubkey65)]` → `BytesN<65>`.

### Q2 — USDC SAC balances for a C-address  ✅
- The `C…` account holds USDC with **NO classic `changeTrust`** — the SAC tracks the contract balance directly.
- Funded by a SAC `transfer(funder_G, C, 0.1 USDC)`; read back via SAC `balance(C…)` = `1000000` stroops. ✓
- Implication: contract accounts don't consume per-trustline base reserves → cheap to onboard many passkey users.

### Q3 — Exact `__check_auth` secp256r1 signature format  ✅ (the primary risk — resolved)
- The account's `Self::Signature` is OZ's `WebAuthnSigData`:
  `{ signature: BytesN<64>, authenticator_data: Bytes, client_data: Bytes }` — built as a Soroban map with
  **canonical sorted keys** `authenticator_data < client_data < signature`.
- The contract verifies: `secp256r1_verify(pubkey, sha256(authenticator_data || sha256(client_data)), signature)`,
  with `client_data.challenge == base64url(signature_payload[0..32])` and the authenticatorData **UP|UV** flag
  bits set (`0x05`).
- **Hashing resolved:** with the WebAuthn envelope there is **no double-hash** — WebCrypto's ECDSA+SHA-256
  signs `sha256(message)`, which is exactly the digest the contract checks. The earlier naive "sign the raw
  preimage hash" approach (and its `{public_key, signature}` map) was WRONG and is replaced.
- **Signature must be low-S** normalized (Soroban `secp256r1_verify` rejects high-S). Implemented in `secp256r1.ts`.
- Verified on-chain: the enforcing simulation RAN `__check_auth` and accepted the signature before submit.

## Cross-cutting findings
- `signatureExpirationLedger` window +60 ledgers — ample.
- **Gotcha:** Soroban deploys/invokes can be dropped as `TRY_AGAIN_LATER` with a low inclusion fee → use a
  generous inclusion fee (`INCLUSION_FEE = 1000000` stroops) + retry (`sendAndConfirm`). Carry this into the SDK.
- Toolchain present locally: `stellar` 25.2.0, `cargo`/`rustc` 1.93 → the OZ wasm is buildable on demand.

## Facilitator implications for Sprint 4 (validated)
- `/stellar/contract/deploy`: `uploadContractWasm` (once) + `createCustomContract(pubkey)` → return C-address.
- `/relay` (soroban): relax `from` to allow `C…` (today `stellarSorobanSchema.from` is G-only); validate the
  contract-credential auth entry (signature = `WebAuthnSigData` scval) — the host's `__check_auth` does the crypto.
- `/stellar/contract/:address`: existence + SAC `balance(C…)`.
- `@buckspay/signers/passkey` (Sprint 4): swap the software P-256 for real WebAuthn — build authenticatorData +
  clientDataJSON (challenge = base64url(payload)), DER→raw r||s + low-S; the on-chain check is identical (`WEBAUTHN.md`).

## DECISION
- [x] **GO** — Q1/Q2/Q3 proven on-chain; Sprint 4 unblocked.
- [ ] NO-GO
- [ ] PENDING

Signed-off: Claude (gate runner) · Date: 2026-06-26 · (countersign: David)

# Passkey Contract Spike — OPEN QUESTIONS (RESOLVED ✅)

All three resolved on testnet on 2026-06-26. Full evidence in `DECISION.md`.

## Q1 — OZ Smart Account Wasm versioning / install  ✅
- Contract: `minimal-passkey-account` (single secp256r1 signer on OZ's audited `verifiers::webauthn::verify`;
  stellar-accounts 0.7.1, soroban-sdk 26.1.0). Source under `contract/`; sha256
  `bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69`.
- **Answer:** install is **one-time per network** (`uploadContractWasm` → hash; reuse via `createCustomContract`).
  Deploy bound to the key via `constructorArgs = [scvBytes(pubkey65)]`. Sponsored. ✓

## Q2 — USDC SAC balances for a C… account vs classic changeTrust  ✅
- **Answer:** the SAC tracks the `C…` contract balance **directly — no classic `changeTrust`**. Funded via SAC
  `transfer` to the C-address; read back via SAC `balance(C…)` = 1000000 stroops (0.1 USDC). ✓

## Q3 — Exact `__check_auth` secp256r1 signature format  ✅
- **Answer:** `WebAuthnSigData { signature: BytesN<64>, authenticator_data: Bytes, client_data: Bytes }`
  (Soroban map, sorted keys), verified as
  `secp256r1_verify(pubkey, sha256(authenticator_data || sha256(client_data)), signature)` with
  `challenge = base64url(signature_payload)`, UP|UV flags set, and **low-S** signature. WebCrypto ECDSA+SHA-256
  produces exactly this digest (no double-hash with the envelope). Verified on-chain. ✓

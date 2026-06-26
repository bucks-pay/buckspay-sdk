# minimal-passkey-account (Fase 0 gate contract)

A minimal single-signer **secp256r1 / WebAuthn smart account** used to prove the passkey/contract path
on testnet. It binds the account to ONE secp256r1 public key at construction and verifies each
authorization with **OpenZeppelin's audited WebAuthn verifier**
(`stellar_accounts::verifiers::webauthn::verify`), deliberately skipping the OZ composable framework
(context rules / policies / external verifier contracts) so the gate needs a single deploy.

- `src/lib.rs` — the contract. `__constructor(pubkey: BytesN<65>)`; `__check_auth(payload, WebAuthnSigData, ctx)`.
- `Cargo.toml` — inherits the OZ `stellar-contracts` workspace (`*.workspace = true`).

## Build

This crate inherits the OpenZeppelin `stellar-contracts` workspace. To reproduce the wasm:

```bash
git clone --depth 1 https://github.com/OpenZeppelin/stellar-contracts.git
# drop this crate in so the examples/* glob picks it up:
cp -r contract stellar-contracts/examples/multisig-smart-account/minimal-passkey
cd stellar-contracts/examples/multisig-smart-account/minimal-passkey
stellar contract build
# -> target/wasm32v1-none/release/minimal_passkey_account.wasm
```

Toolchain used: `stellar` 25.2.0, `cargo`/`rustc` 1.93, soroban-sdk 26.1.0, stellar-accounts 0.7.1.

## Pinned wasm

- **sha256 / on-chain Wasm hash:** `bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69`
- Prebuilt copy committed at `../wasm/minimal_passkey_account.wasm` (the spike installs/verifies this).

## __check_auth signature format (Q3, resolved on-chain)

`Self::Signature = WebAuthnSigData { signature: BytesN<64>, authenticator_data: Bytes, client_data: Bytes }`,
verified as `secp256r1_verify(pubkey, sha256(authenticator_data || sha256(client_data)), signature)` with
`client_data.challenge == base64url(signature_payload)` and the UP|UV flag bits set. Signature must be
**low-S** normalized. See `../check-auth.ts` (assembler) and `../WEBAUTHN.md`.

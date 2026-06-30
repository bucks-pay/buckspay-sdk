# Contract Provenance — OZ Smart Account Wasm

> Records exactly **which** contract wasm buckspay deploys/authorizes against, **where it
> comes from**, **how to reproduce it byte-for-byte**, and **what that means for the audit
> scope**. The wasm IS the on-chain `__check_auth` authorizer, so "the code we deploy == the
> code we audited" must be a checkable fact — enforced by `scripts/verify-wasm-hash.mjs`
> (Task 1), `scripts/check-pin-parity.sh` (Task 4), and this document.

**Status:** active · **Pinned hash:** `bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69` · **Last reviewed:** 2026-06-28

---

## Deployed wasm

The deployed contract is the **custom `minimal-passkey-account` wrapper** — single-signer,
buckspay-authored, built locally. **It is NOT the official OpenZeppelin Smart Account release.**

It binds the account to **one** secp256r1 (WebAuthn) public key (`pubkey: BytesN<65>`, the
65-byte uncompressed `0x04‖x‖y`) at construction, and on every authorization it calls
OpenZeppelin's **audited** WebAuthn/secp256r1 verifier `stellar_accounts::verifiers::webauthn::verify`
(stellar-accounts 0.7.1) for the cryptography. The `__constructor` + `__check_auth` wrapper around
that verifier is buckspay code (`spikes/passkey-contract/contract/src/lib.rs`). It deliberately
skips the OZ composable framework (context rules / policies / external verifier contracts) — the
initial gate only needed to prove the `secp256r1 → __check_auth → relay` path with a single deploy.

- **Pinned hash:** `bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69`
- The hash is the **sha256 of the wasm bytes**, so it is **network-independent** — identical on
  testnet and pubnet. The bytes must be **installed once per network** (`uploadContractWasm`);
  see `## Pin & install`.

## Source & commit

- **Crate:** `spikes/passkey-contract/contract` — package `minimal-passkey-account`,
  `crate-type = ["cdylib"]`, `publish = false`.
- **Dependencies:** `soroban-sdk 26.1.0`, `stellar-accounts 0.7.1` (both via the build
  workspace; the workspace `Cargo.lock` is the determinism anchor — do **not** bump these
  without re-pinning per Task 1).
- **Source files:** `src/lib.rs` (the `__constructor` + `CustomAccountInterface::__check_auth`
  impl) and `Cargo.toml`.
- **Git commit of the artifact build:** `77d7b4327cc8870c36f64312bb74ad6bdba96256`
  (`git -C buckspay-sdk rev-parse HEAD` at the time the installed/pinned wasm was produced).
- **Pre-built artifact:** `spikes/passkey-contract/wasm/minimal_passkey_account.wasm`
  (14,897 bytes) — byte-identical to the installed wasm; committed as the reproducibility
  fixture at `packages/accounts/test/fixtures/oz-smart-account.wasm`.

## Reproducible build

Anyone with the toolchain + commit reproduces the **byte-identical** wasm and the same hash.

- **Toolchain:** `stellar` CLI **25.2.0**, `cargo`/`rustc` **1.93**.
- **Commands** (from the crate root):
  ```bash
  cd spikes/passkey-contract/contract
  stellar contract build
  # → target/wasm32v1-none/release/minimal_passkey_account.wasm
  stellar contract optimize --wasm target/wasm32v1-none/release/minimal_passkey_account.wasm
  # → target/wasm32v1-none/release/minimal_passkey_account.optimized.wasm
  shasum -a 256 target/wasm32v1-none/release/minimal_passkey_account.optimized.wasm
  # → bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69
  ```
- **Verify without a Rust toolchain:** `node scripts/verify-wasm-hash.mjs` hashes the committed
  fixture and asserts it equals the pin (`pnpm --filter @buckspay/accounts exec vitest run
  test/wasm-hash-bytes.test.ts` does the same in CI).

## Audit-scope consequence

Because the deployed wasm is a **custom wrapper** (not the official audited OZ Smart Account
release), the wrapper's logic **IS in audit scope**. Be precise about what is and isn't inherited:

- **Inherited as audited (out of buckspay scope):** only OZ's `stellar_accounts::verifiers::webauthn::verify`
  — the WebAuthn/secp256r1 verifier. We pin the wasm that calls it; we do not re-audit OZ's verifier.
- **In scope (the auditor MUST review `src/lib.rs`):**
  1. **Single-signer storage** — `pubkey: BytesN<65>` set once in `__constructor`, read in
     `__check_auth`; there is **no key-rotation, multi-sig, recovery, or admin/upgrade path**.
  2. **Payload conversion** — `signature_payload: Hash<32>` → `to_bytes().to_bytes()` → the
     `payload` passed to `verify`. Confirm it matches what the verifier expects.
  3. **No in-contract replay protection** — the wrapper relies on the **Soroban host nonce** +
     the SDK-bounded `signatureExpirationLedger` for anti-replay, not on contract-side state.
     Confirm that boundary is sound.
  4. **Failure = panic** — `verify` panics on a bad signature (auth rejected); confirm there is
     no path that returns `Ok(())` without a successful verify.
- **Residual risk / re-scope trigger:** adopting a future "real OZ Smart Account release" (or any
  wasm change) **re-scopes** this — it re-runs Task 1 (build + hash), re-pins, updates this doc,
  and re-audits the new bytes.

## Pin & install

- **SDK pin:** `packages/accounts/src/oz-contract/wasm-pin.ts` — `OZ_SMART_ACCOUNT_WASM_HASH`
  (single value; network-independent) + `assertPinnedWasmHash`.
- **Facilitator config:** `facilitator/src/stellarContract.ts` — `OZ_SMART_ACCOUNT_WASM_HASH`
  (`Record<StellarChainKey, string>`, both `stellar-testnet` and `stellar-pubnet` = the pin) +
  `isPinnedWasm`. The cross-repo guard `scripts/check-pin-parity.sh` (and
  `packages/accounts/test/pin-parity.test.ts`, Task 4) asserts the SDK pin === the facilitator's
  pubnet hash byte-for-byte.
- **Per-network install:** the wasm is installed once per network via `uploadContractWasm`.
  Testnet is already installed + proven (`spikes/passkey-contract/DECISION.md` = GO). The pubnet
  install is `facilitator/scripts/install-wasm-pubnet.ts` (Task 3) — gated by
  `BUCKSPAY_ALLOW_MAINNET=1` + a funded sponsor, idempotent, asserts the installed hash == the pin.

## Sign-off

| Auditor | Date | Wasm hash | Commit |
|---|---|---|---|
| _(pending)_ | | `bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69` | `77d7b4327cc8870c36f64312bb74ad6bdba96256` |

#![no_std]
//! Minimal single-signer passkey smart account for the buckspay Fase 0 gate.
//!
//! Binds the account to ONE secp256r1 (WebAuthn) public key at construction and
//! verifies each authorization with OpenZeppelin's audited WebAuthn verifier
//! (`stellar_accounts::verifiers::webauthn::verify`). This deliberately skips the
//! OZ composable framework (context rules / policies / external verifier contracts)
//! so the gate can prove the secp256r1 -> __check_auth -> relay path with one deploy.
use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contracterror, contractimpl,
    crypto::Hash,
    symbol_short, BytesN, Env, Vec,
};
use stellar_accounts::verifiers::webauthn::{verify, WebAuthnSigData};

#[contracterror]
#[repr(u32)]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Error {
    NotInitialized = 1,
}

#[contract]
pub struct PasskeyAccount;

#[contractimpl]
impl PasskeyAccount {
    /// Bind the account to one secp256r1 (WebAuthn) public key (65-byte uncompressed 0x04||x||y).
    pub fn __constructor(e: &Env, pubkey: BytesN<65>) {
        e.storage().instance().set(&symbol_short!("pk"), &pubkey);
    }
}

#[contractimpl]
impl CustomAccountInterface for PasskeyAccount {
    type Error = Error;
    type Signature = WebAuthnSigData;

    fn __check_auth(
        e: Env,
        signature_payload: Hash<32>,
        signature: WebAuthnSigData,
        _auth_contexts: Vec<Context>,
    ) -> Result<(), Error> {
        let pubkey: BytesN<65> = e
            .storage()
            .instance()
            .get(&symbol_short!("pk"))
            .ok_or(Error::NotInitialized)?;
        // Hash<32> -> BytesN<32> -> Bytes (same conversion OZ uses before the verifier).
        let payload = signature_payload.to_bytes().to_bytes();
        // OZ's audited WebAuthn verifier; panics on a bad signature (= auth rejected).
        verify(&e, &payload, &pubkey, &signature);
        Ok(())
    }
}

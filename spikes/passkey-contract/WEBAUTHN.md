# Real WebAuthn path (production) vs spike emulator

The spike signs with a **software** P-256 key (`crypto.subtle`) so it is scriptable.
The production `@buckspay/signers/passkey` (Sprint 4/03) uses WebAuthn. The differences
the SDK must absorb:

1. **Key creation** — `navigator.credentials.create({ publicKey: { pubKeyCredParams: [{ alg: -7 }] } })`
   yields a COSE-encoded EC2 P-256 key. The SDK extracts x/y and rebuilds the 65-byte `0x04||x||y`
   used as `SignerKey.publicKey` (secp256r1, hex).
2. **Signing message** — WebAuthn does NOT sign the raw preimage hash. It signs
   `sha256(authenticatorData || sha256(clientDataJSON))`, where `clientDataJSON.challenge`
   is the base64url of our preimage hash. So `__check_auth` for a WebAuthn account must be given
   `authenticatorData` + `clientDataJSON` (or the assembled message) ALONGSIDE the signature, and
   the contract re-derives the signed message. The spike's map omits these because the software
   signer signs a hash directly.
3. **Signature encoding** — WebAuthn returns DER; the SDK must convert DER → raw 64-byte r||s
   (and low-S normalize) for Soroban's `secp256r1_verify`. WebCrypto already returns raw r||s,
   so the spike skips this conversion (flagged for Sprint 4).

## ✅ Hashing subtlety — RESOLVED on-chain (Q3)

> The gate proved this live: with the proper WebAuthn envelope there is **no double-hash**, because the contract
> verifies `secp256r1_verify(pk, sha256(authData‖sha256(clientData)), sig)` and WebCrypto's ECDSA+SHA-256 signs
> exactly `sha256(message)`. The naive "sign the raw preimage hash" approach below is what would have failed.

Soroban hands `__check_auth` a 32-byte `signature_payload` (the host's hash of the auth preimage) and
the contract's `secp256r1_verify(pubkey, signature_payload, sig)` verifies the ECDSA signature against
that digest **directly** (ECDSA verifies a digest, not a message). But `crypto.subtle.sign({name:"ECDSA",
hash:"SHA-256"}, …)` hashes its input AGAIN, so signing `preimageHash(preimage)` produces a signature over
`sha256(sha256(preimage))` — a **double hash** that will NOT verify against `signature_payload`.

Two consequences for production:
- The **software emulator** (this spike) must sign the digest WITHOUT WebCrypto's extra hash — e.g. use
  `@noble/curves/p256` `sign(payload, privKey, { prehash:false })` over the raw 32-byte payload.
- The **real WebAuthn** account contract sidesteps this because it re-derives
  `sha256(authData || sha256(clientData))` on-chain and verifies against that — the authenticator's own
  single hash. The OZ WebAuthn smart account is built for exactly this; a "raw secp256r1" smart account
  variant (no WebAuthn envelope) would instead expect a signature over the bare payload.

**Spike scope:** prove the secp256r1 → `__check_auth` → on-chain verify path works at all with a
known-good signature. **Sprint 4 scope:** swap the software signer for WebAuthn and add the
authenticatorData/clientDataJSON + DER→raw handling, validated by the same on-chain check.

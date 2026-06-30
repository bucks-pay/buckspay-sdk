# `@buckspay/signers/passkey`

WebAuthn/secp256r1 passkey `BuckspaySigner` for the **contract (`C…`) account model**. The
private key never leaves the authenticator; the SDK only ever holds the 65-byte public key
and the assertion bytes. Signature verification happens **on-chain** in the OpenZeppelin Smart
Account `__check_auth` — neither the SDK nor the facilitator ever check it.

```ts
import { passkey } from "@buckspay/signers/passkey";

const signer = passkey({ rpId: "buckspay.app" });   // RP id = your registrable domain
const key = await signer.getPublicKey();             // { type: "secp256r1", publicKey: "04…" }  (WebAuthn create)
const sig = await signer.signAuthEntry(payload);     // { signature: <WebAuthnSigData scval>, publicKey }  (WebAuthn get)
```

## How it works

- **`getPublicKey()`** → `navigator.credentials.create({ pubKeyCredParams: [{ alg: -7 }] })` (ES256 =
  secp256r1), parses the COSE EC2 key out of `authenticatorData`, and returns `0x04‖X‖Y` as hex.
- **`signAuthEntry(payload)`** → the WebAuthn **challenge is `sha256(preimage)`**, so the assertion is
  cryptographically bound to the exact Soroban auth payload (a relayer can't replay it elsewhere).
  `navigator.credentials.get` returns `authenticatorData`, `clientDataJSON`, and a **DER** signature; the
  signer converts DER → raw 64-byte `r‖s`, **low-S normalizes** it, and packs the three into the OZ
  `WebAuthnSigData` scval set on `Signature.signature`.
- The OZ account re-derives `sha256(authenticatorData ‖ sha256(clientDataJSON))` on-chain and runs
  `secp256r1_verify(pubkey, that, r‖s)` — exactly what the WebAuthn assertion signed (no double-hash).

## Testing vs production

- **Tests** inject a deterministic software P-256 authenticator via `passkey({ webauthn: softwareWebAuthn({ seed }) })`.
  It is seed-derived, **test-only**, and tree-shaken out of the production bundle (nothing in the entry
  graph imports it). `@noble/curves`/`@noble/hashes` are runtime deps because the **real** path needs
  DER→raw + low-S (and sha256).
- **Production** uses `defaultWebAuthn()` → `navigator.credentials.{create,get}`. Requires a browser, a
  **secure context** (https), and a registered `rpId`. The COSE parse in `defaultWebAuthn().create()` runs
  only in a browser and is covered by manual QA (the passkey hero e2e).

## ⚠️ The load-bearing contract: `formatCheckAuthSignature`

The `WebAuthnSigData` scval is a Soroban **map** with **canonical sorted keys**
`authenticator_data` < `client_data` < `signature` (note `client_data`, **not** `client_data_json`),
each value an `scvBytes`, with `signature` a raw 64-byte `r‖s`. This is **byte-identical** to the
structure the contract validates on-chain (`assembleWebAuthnSigData`) and is asserted by
`test/passkey/checkauth-parity.test.ts`.

**These field names/order are the single value to keep in lock-step with the OZ
`__check_auth`.** If the OZ Smart Account version changes the struct, update `formatCheckAuthSignature`
(and the parity test) to match — divergence by a single byte makes the contract reject the signature.

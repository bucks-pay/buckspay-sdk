/**
 * WebAuthn/secp256r1 passkey signer (`@buckspay/signers/passkey`).
 *
 * `passkey({ rpId })` returns a `BuckspaySigner` (type "passkey") whose private key
 * never leaves the authenticator. `getPublicKey()` registers a credential and returns
 * the 65-byte secp256r1 pubkey; `signAuthEntry()` produces the OZ `__check_auth`
 * WebAuthnSigData signature over the auth-entry preimage hash. Verification is on-chain.
 */
import { BuckspayError } from "@buckspay/core";
import type { BuckspaySigner } from "@buckspay/core";
import { passkeyGetPublicKey } from "./getPublicKey.js";
import { passkeySignAuthEntry } from "./signAuthEntry.js";
import { defaultWebAuthn } from "./webauthn.js";
import type { WebAuthnLike } from "./webauthn.js";

export type { WebAuthnLike, CreateInput, CreateOutput, GetInput, GetOutput } from "./webauthn.js";
export { formatCheckAuthSignature, decodeCheckAuthSignature } from "./signAuthEntry.js";
export type { CheckAuthParts } from "./signAuthEntry.js";

export interface PasskeyOptions {
  rpId: string;
  rpName?: string;
  /** Test seam: inject a deterministic WebAuthn impl. Defaults to navigator.credentials. */
  webauthn?: WebAuthnLike;
}

export function passkey(opts: PasskeyOptions): BuckspaySigner {
  if (!opts.rpId || opts.rpId.trim() === "") {
    throw new BuckspayError("INVALID_CONFIG", "passkey: rpId is required");
  }
  const wa = opts.webauthn ?? defaultWebAuthn();
  const rpName = opts.rpName ?? opts.rpId;
  // signAuthEntry can't re-derive the pubkey from an assertion, so cache it from
  // getPublicKey() and echo it on Signature.publicKey (BuckspaySigner contract).
  let cachedKey: string | null = null;
  return {
    type: "passkey",
    async getPublicKey() {
      const key = await passkeyGetPublicKey(wa, opts.rpId, rpName);
      cachedKey = key.publicKey;
      return key;
    },
    signAuthEntry: (payload) =>
      passkeySignAuthEntry(wa, opts.rpId, payload, () => {
        if (!cachedKey) {
          throw new BuckspayError("INVALID_CONFIG", "passkey: call getPublicKey() before signAuthEntry()");
        }
        return cachedKey;
      })
  };
}

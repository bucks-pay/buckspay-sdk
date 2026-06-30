/**
 * Native (iOS/Android) WebAuthn passkey signer for React Native.
 *
 * This is NOT a second WebAuthn implementation. `@buckspay/signers/passkey` owns the whole
 * cryptographic pipeline (challenge = sha256(preimage), DER→raw r‖s low-S, the OZ
 * `WebAuthnSigData` __check_auth scval, COSE→65-byte pubkey). `nativePasskey` supplies a
 * `WebAuthnLike` backed by `react-native-passkey` and delegates to `passkey({ webauthn })`, so
 * the signer the OZ contract account binds is byte-for-byte the web one — only the authenticator
 * transport differs. The private key never leaves the device secure enclave.
 *
 * iOS vs Android divergence is absorbed by `react-native-passkey` (the native module) and the
 * shared COSE extractor (which handles both attestation envelopes), not by JS branching here.
 */
import { Passkey } from "react-native-passkey";
import { passkey, extractCoseKey, coseToUncompressed } from "@buckspay/signers/passkey";
import type { WebAuthnLike } from "@buckspay/signers/passkey";
import { BuckspayError } from "@buckspay/core";
import type { BuckspaySigner } from "@buckspay/core";

export interface NativePasskeyOptions {
  rpId: string;
  rpName?: string;
}

/** base64url (RFC 4648 §5, no padding) → bytes. */
function fromB64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return new Uint8Array(Buffer.from(b64, "base64"));
}
/** bytes → base64url, no padding (the challenge react-native-passkey expects). */
function toB64Url(b: Uint8Array): string {
  return Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * `WebAuthnLike` over react-native-passkey. `create()` returns the attested authenticatorData,
 * which carries the COSE_Key — fed to the SHARED `extractCoseKey`/`coseToUncompressed`. `get()`
 * returns the assertion fields the shared `passkeySignAuthEntry` consumes (it does the DER→raw work).
 */
function reactNativePasskeyWebAuthn(): WebAuthnLike {
  return {
    async create({ rpId, rpName, userName, challenge }) {
      let res: { rawId: string; response: { authenticatorData: string } };
      try {
        res = (await Passkey.create({
          challenge: toB64Url(challenge),
          rp: { id: rpId, name: rpName },
          user: { id: toB64Url(new TextEncoder().encode(userName)), name: userName, displayName: userName },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { residentKey: "required", userVerification: "required" }
        })) as never;
      } catch (err) {
        if (err instanceof BuckspayError) throw err;
        throw new BuckspayError("SIGNATURE_REJECTED", "nativePasskey: credential creation rejected", { cause: err });
      }
      const authData = fromB64Url(res.response.authenticatorData);
      return { publicKey: coseToUncompressed(extractCoseKey(authData)), credentialId: fromB64Url(res.rawId) };
    },
    async get({ rpId, challenge, credentialId }) {
      let res: { rawId: string; response: { authenticatorData: string; clientDataJSON: string; signature: string } };
      try {
        res = (await Passkey.get({
          rpId,
          challenge: toB64Url(challenge),
          userVerification: "required",
          ...(credentialId ? { allowCredentials: [{ type: "public-key", id: toB64Url(credentialId) }] } : {})
        })) as never;
      } catch (err) {
        if (err instanceof BuckspayError) throw err;
        throw new BuckspayError("SIGNATURE_REJECTED", "nativePasskey: assertion rejected", { cause: err });
      }
      return {
        authenticatorData: fromB64Url(res.response.authenticatorData),
        clientDataJSON: fromB64Url(res.response.clientDataJSON),
        signature: fromB64Url(res.response.signature),
        credentialId: fromB64Url(res.rawId)
      };
    }
  };
}

export function nativePasskey(opts: NativePasskeyOptions): BuckspaySigner {
  if (!opts.rpId || opts.rpId.trim() === "") {
    throw new BuckspayError("INVALID_CONFIG", "nativePasskey: rpId is required");
  }
  return passkey({
    rpId: opts.rpId,
    ...(opts.rpName ? { rpName: opts.rpName } : {}),
    webauthn: reactNativePasskeyWebAuthn()
  });
}

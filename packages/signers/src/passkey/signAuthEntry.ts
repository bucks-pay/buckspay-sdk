import { nativeToScVal, scValToNative, xdr } from "@stellar/stellar-sdk";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { BuckspayError } from "@buckspay/core";
import type { AuthEntryPayload, Signature } from "@buckspay/core";
import type { WebAuthnLike } from "./webauthn.js";

export interface CheckAuthParts {
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  signature: Uint8Array; // raw r‖s, 64 bytes, low-S
}

/**
 * Sign a Soroban auth-entry with a passkey. The WebAuthn challenge is sha256(preimage),
 * binding the assertion to the exact invocation. The result's `signature` is the OZ
 * `WebAuthnSigData` scval (the value `__check_auth` verifies on-chain); the facilitator
 * and SDK never check the signature themselves.
 */
export async function passkeySignAuthEntry(
  wa: WebAuthnLike,
  rpId: string,
  payload: AuthEntryPayload,
  getCachedPubKey: () => string
): Promise<Signature> {
  // 1. Decode the preimage and hash it — this is the WebAuthn challenge.
  let preimage: xdr.HashIdPreimage;
  try {
    preimage = xdr.HashIdPreimage.fromXDR(payload.preimageXdr, "base64");
  } catch (err) {
    throw new BuckspayError("INVALID_CONFIG", "passkey: could not decode preimageXdr", { cause: err });
  }
  const challenge = sha256(preimage.toXDR());

  // 2. WebAuthn assertion over the challenge. Any failure (user cancel, unavailable)
  //    maps to SIGNATURE_REJECTED unless the impl already raised a typed BuckspayError.
  let assertion;
  try {
    assertion = await wa.get({ rpId, challenge });
  } catch (err) {
    if (err instanceof BuckspayError) throw err;
    throw new BuckspayError("SIGNATURE_REJECTED", "passkey: assertion rejected", { cause: err });
  }

  // 3. Normalize the authenticator signature to raw r‖s low-S (DER → raw if needed).
  const rs = toRawLowS(assertion.signature);

  // 4. Pack into the OZ __check_auth signature struct (scval).
  const scval = formatCheckAuthSignature({
    authenticatorData: assertion.authenticatorData,
    clientDataJSON: assertion.clientDataJSON,
    signature: rs
  });

  // 5. Echo the bound pubkey (cached from getPublicKey(); a signer can't re-derive it).
  return { signature: scval.toXDR(), publicKey: getCachedPubKey() };
}

/**
 * OZ Smart Account `WebAuthnSigData` scval — the value `__check_auth` receives as
 * `Self::Signature`. BYTE-IDENTICAL to the structure the contract validates on-chain:
 * a Soroban map with canonical sorted keys `authenticator_data` < `client_data` <
 * `signature`, each value an `scvBytes`. The signature MUST be raw 64-byte r‖s (low-S).
 *
 * LOCK-STEP: these field names are the single value to keep in sync with the OZ
 * `__check_auth`. Note `client_data` (NOT `client_data_json`).
 */
export function formatCheckAuthSignature(parts: CheckAuthParts): xdr.ScVal {
  if (parts.signature.length !== 64) {
    throw new BuckspayError(
      "SIGNATURE_REJECTED",
      `passkey: signature must be 64 bytes (raw r‖s), got ${parts.signature.length}`
    );
  }
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: nativeToScVal("authenticator_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(parts.authenticatorData))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("client_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(parts.clientDataJSON))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("signature", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(parts.signature))
    })
  ]);
}

/** Inverse of formatCheckAuthSignature, for tests + the account adapter assembly check. */
export function decodeCheckAuthSignature(sigBytes: Uint8Array): CheckAuthParts {
  const scval = xdr.ScVal.fromXDR(Buffer.from(sigBytes));
  const native = scValToNative(scval) as {
    authenticator_data: Uint8Array;
    client_data: Uint8Array;
    signature: Uint8Array;
  };
  return {
    authenticatorData: Uint8Array.from(native.authenticator_data),
    clientDataJSON: Uint8Array.from(native.client_data),
    signature: Uint8Array.from(native.signature)
  };
}

/** DER or raw → raw 64-byte r‖s, low-S normalized (Soroban's secp256r1_verify rejects high-S). */
function toRawLowS(sig: Uint8Array): Uint8Array {
  const raw = sig.length === 64 ? sig : p256.Signature.fromDER(sig).toCompactRawBytes();
  return p256.Signature.fromCompact(raw).normalizeS().toCompactRawBytes();
}

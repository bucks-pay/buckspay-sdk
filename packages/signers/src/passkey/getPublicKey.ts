import type { SignerKey } from "@buckspay/core";
import { BuckspayError } from "@buckspay/core";
import type { WebAuthnLike } from "./webauthn.js";

/**
 * Register a passkey (WebAuthn `create`) and return its secp256r1 public key as the
 * 65-byte uncompressed hex the OZ Smart Account binds. The private key never leaves
 * the authenticator - we only ever see the public key.
 */
export async function passkeyGetPublicKey(
  wa: WebAuthnLike,
  rpId: string,
  rpName: string
): Promise<SignerKey> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = await wa.create({ rpId, rpName, userName: `buckspay-${rpId}`, challenge });
  if (cred.publicKey.length !== 65 || cred.publicKey[0] !== 0x04) {
    throw new BuckspayError("INVALID_CONFIG", "passkey: expected 65-byte uncompressed secp256r1 key");
  }
  return { type: "secp256r1", publicKey: toHex(cred.publicKey) };
}

function toHex(b: Uint8Array): string {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

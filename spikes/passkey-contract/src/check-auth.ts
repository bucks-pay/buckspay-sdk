import { nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { signP256 } from "./secp256r1.js";

/** sha256 over the SorobanAuthorization preimage XDR bytes — the host's `signature_payload`. */
export async function preimageHash(preimageXdrBytes: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(preimageXdrBytes));
  return new Uint8Array(digest);
}

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes)));
}

/** RFC4648 base64url without padding (WebAuthn clientDataJSON challenge encoding). */
export function base64UrlNoPad(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** clientDataJSON for a `webauthn.get` assertion; the OZ verifier reads only `type` + `challenge`. */
export function buildClientDataJSON(challengeB64Url: string): Uint8Array {
  const json = `{"type":"webauthn.get","challenge":"${challengeB64Url}","origin":"https://buckspay.dev"}`;
  return new TextEncoder().encode(json);
}

/** authenticatorData: sha256(rpId)(32) || flags(1) || signCount(4). flags=UP|UV (0x05); BE/BS=0. */
export async function buildAuthenticatorData(rpId: string): Promise<Uint8Array> {
  const rpIdHash = await sha256(new TextEncoder().encode(rpId));
  const out = new Uint8Array(37);
  out.set(rpIdHash, 0);
  out[32] = 0x05; // User Present | User Verified
  // bytes 33..37 (signCount) stay 0
  return out;
}

export interface WebAuthnAssertion {
  signature64: Uint8Array;
  authenticatorData: Uint8Array;
  clientData: Uint8Array;
}

/**
 * Produce a WebAuthn assertion over the Soroban `signature_payload` (32-byte auth digest),
 * exactly as the OZ WebAuthn verifier checks it:
 *   secp256r1_verify(pubkey, sha256(authenticatorData || sha256(clientDataJSON)), signature)
 * with challenge = base64url(signature_payload). WebCrypto's ECDSA+SHA-256 signs sha256(message),
 * which is precisely the digest the contract verifies — no double hash.
 */
export async function signWebAuthnAssertion(input: {
  privateKey: CryptoKey;
  signaturePayload: Uint8Array; // 32-byte host auth digest
  rpId: string;
}): Promise<WebAuthnAssertion> {
  const challenge = base64UrlNoPad(input.signaturePayload);
  const clientData = buildClientDataJSON(challenge);
  const authenticatorData = await buildAuthenticatorData(input.rpId);
  const message = new Uint8Array(authenticatorData.length + 32);
  message.set(authenticatorData, 0);
  message.set(await sha256(clientData), authenticatorData.length);
  const signature64 = await signP256(input.privateKey, message);
  return { signature64, authenticatorData, clientData };
}

/**
 * Assemble the OZ `WebAuthnSigData` contracttype scval (the value `__check_auth` receives as
 * `Self::Signature`): a Soroban map with keys in canonical (sorted) order
 * `authenticator_data` < `client_data` < `signature`.
 */
export function assembleWebAuthnSigData(a: WebAuthnAssertion): xdr.ScVal {
  if (a.signature64.length !== 64) throw new Error(`signature must be 64 bytes, got ${a.signature64.length}`);
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: nativeToScVal("authenticator_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(a.authenticatorData))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("client_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(a.clientData))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("signature", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(a.signature64))
    })
  ]);
}

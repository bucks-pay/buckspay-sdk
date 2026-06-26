/**
 * Software secp256r1 (P-256) signer. EMULATES the WebAuthn authenticator for the
 * spike so the path is scriptable. The REAL signer (Sprint 4 @buckspay/signers/passkey)
 * uses navigator.credentials WebAuthn; see WEBAUTHN.md for the production preimage path.
 * Soroban's secp256r1_verify requires a raw 64-byte r||s signature, LOW-S normalized.
 */

const ALGO = { name: "ECDSA", namedCurve: "P-256" } as const;
const SIGN_ALGO = { name: "ECDSA", hash: "SHA-256" } as const;

/** P-256 group order n and n/2 (for low-S normalization). */
const P256_N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
const P256_HALF_N = P256_N >> 1n;

export async function generateP256Key(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(ALGO, true, ["sign", "verify"]);
}

/** 65-byte uncompressed point 0x04 || X(32) || Y(32) — matches SignerKey.publicKey (secp256r1, hex). */
export async function exportUncompressedPubkey(publicKey: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey("raw", publicKey);
  return new Uint8Array(raw);
}

/** Raw 64-byte r||s signature (WebCrypto returns r||s, not DER), LOW-S normalized for Soroban. */
export async function signP256(privateKey: CryptoKey, message: Uint8Array): Promise<Uint8Array> {
  const sig = new Uint8Array(await crypto.subtle.sign(SIGN_ALGO, privateKey, new Uint8Array(message)));
  if (sig.length !== 64) throw new Error(`expected 64-byte r||s signature, got ${sig.length}`);
  return lowSNormalize(sig);
}

export async function verifyP256(
  publicKey: CryptoKey,
  message: Uint8Array,
  signature: Uint8Array
): Promise<boolean> {
  return crypto.subtle.verify(SIGN_ALGO, publicKey, new Uint8Array(signature), new Uint8Array(message));
}

/** Soroban's secp256r1_verify rejects high-S signatures; fold s to the lower half of the curve order. */
export function lowSNormalize(sig64: Uint8Array): Uint8Array {
  if (sig64.length !== 64) throw new Error(`expected 64-byte signature, got ${sig64.length}`);
  const s = bytesToBigInt(sig64.subarray(32, 64));
  if (s <= P256_HALF_N) return sig64;
  const out = new Uint8Array(64);
  out.set(sig64.subarray(0, 32), 0);
  out.set(bigIntTo32Bytes(P256_N - s), 32);
  return out;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let v = 0n;
  for (const b of bytes) v = (v << 8n) | BigInt(b);
  return v;
}

function bigIntTo32Bytes(v: bigint): Uint8Array {
  const out = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

export function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

import { BuckspayError } from "@buckspay/core";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Normalize the signature returned by Wallets Kit to the 64-byte Ed25519 value.
 *
 * The FreighterModule double-encodes (`Buffer.from(string)` without `'base64'`),
 * so a 64-byte signature can come back as 88 bytes - the ASCII of its own base64.
 * We detect that case (the bytes decode to a valid base64 string whose inner
 * decode is exactly 64 bytes) and unwrap it. Anything else is a hard failure:
 * shipping a malformed signature to the relayer fails far downstream with a
 * cryptic error, so we fail loudly here as `SIGNATURE_REJECTED`.
 *
 * Ported from the dashboard's `web3-stellar/sign.ts` (verified against real
 * wallet-captured fixtures); the dashboard's silent `return decoded` fallback is
 * replaced by the assertion below so no consumer ever sees a non-64-byte value.
 */
export function normalizeSignature(signedAuthEntryB64: string): Uint8Array {
  const decoded = base64ToBytes(signedAuthEntryB64);
  if (decoded.length === 64) return decoded;

  const asAscii = new TextDecoder().decode(decoded);
  if (/^[A-Za-z0-9+/]+=*$/.test(asAscii)) {
    const inner = base64ToBytes(asAscii);
    if (inner.length === 64) return inner;
  }

  throw new BuckspayError(
    "SIGNATURE_REJECTED",
    `wallet returned a ${String(decoded.length)}-byte signature; expected 64-byte ed25519`
  );
}

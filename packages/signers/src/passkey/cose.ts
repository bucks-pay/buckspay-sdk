import { BuckspayError } from "@buckspay/core";

/**
 * Minimal CBOR reader - only what a COSE_Key EC2 P-256 needs: maps, (un)signed
 * ints (the COSE labels), and byte strings (the x/y coordinates). Deliberately not
 * a general CBOR decoder; it rejects anything outside that subset.
 */
class CborCursor {
  private p = 0;
  constructor(private readonly b: Uint8Array) {}

  private readHead(): { major: number; len: number } {
    if (this.p >= this.b.length) {
      throw new BuckspayError("INVALID_CONFIG", "passkey: truncated CBOR");
    }
    const first = this.b[this.p++]!;
    const major = first >> 5;
    const info = first & 0x1f;
    let len = info;
    if (info === 24) len = this.b[this.p++]!;
    else if (info === 25) {
      len = (this.b[this.p]! << 8) | this.b[this.p + 1]!;
      this.p += 2;
    } else if (info === 26) {
      len =
        ((this.b[this.p]! << 24) |
          (this.b[this.p + 1]! << 16) |
          (this.b[this.p + 2]! << 8) |
          this.b[this.p + 3]!) >>>
        0;
      this.p += 4;
    } else if (info >= 28) {
      throw new BuckspayError("INVALID_CONFIG", "passkey: unsupported CBOR length encoding");
    }
    return { major, len };
  }

  readMapLength(): number {
    const h = this.readHead();
    if (h.major !== 5) throw new BuckspayError("INVALID_CONFIG", "passkey: expected a CBOR map (COSE_Key)");
    return h.len;
  }

  readInt(): number {
    const h = this.readHead();
    if (h.major === 0) return h.len; // unsigned
    if (h.major === 1) return -1 - h.len; // negative
    throw new BuckspayError("INVALID_CONFIG", "passkey: expected a CBOR integer label");
  }

  readBytes(): Uint8Array {
    const h = this.readHead();
    if (h.major !== 2) throw new BuckspayError("INVALID_CONFIG", "passkey: expected CBOR bytes");
    const out = this.b.subarray(this.p, this.p + h.len);
    this.p += h.len;
    return new Uint8Array(out);
  }

  /** Consume and discard the next value (any supported major type). */
  skipValue(): void {
    const h = this.readHead();
    switch (h.major) {
      case 0:
      case 1:
        return; // int fully consumed in the head
      case 2:
      case 3:
        this.p += h.len; // bytes / text
        return;
      case 4:
        for (let i = 0; i < h.len; i++) this.skipValue();
        return;
      case 5:
        for (let i = 0; i < h.len; i++) {
          this.skipValue();
          this.skipValue();
        }
        return;
      default:
        throw new BuckspayError("INVALID_CONFIG", "passkey: unsupported CBOR value");
    }
  }
}

/** Decode a COSE_Key EC2 (P-256) CBOR map, returning the 32-byte x and y coordinates. */
function decodeCoseEc2(bytes: Uint8Array): { x: Uint8Array; y: Uint8Array } {
  const cur = new CborCursor(bytes);
  const n = cur.readMapLength();
  let x: Uint8Array | undefined;
  let y: Uint8Array | undefined;
  for (let i = 0; i < n; i++) {
    const label = cur.readInt();
    if (label === -2) x = cur.readBytes();
    else if (label === -3) y = cur.readBytes();
    else cur.skipValue();
  }
  if (!x || !y) throw new BuckspayError("INVALID_CONFIG", "passkey: COSE_Key missing EC2 x/y coordinates");
  return { x, y };
}

/**
 * Extract the secp256r1 (P-256) x/y from a WebAuthn attestation's authenticatorData:
 *   rpIdHash(32) | flags(1) | signCount(4) | aaguid(16) | credIdLen(2) | credId | COSE_Key(CBOR)
 * Requires the AT (attested-credential-data) flag set.
 */
export function extractCoseKey(authData: Uint8Array): { x: Uint8Array; y: Uint8Array } {
  if (authData.length < 37) {
    throw new BuckspayError("INVALID_CONFIG", "passkey: authenticatorData too short");
  }
  const flags = authData[32]!;
  if ((flags & 0x40) === 0) {
    throw new BuckspayError("INVALID_CONFIG", "passkey: no attested credential data (AT flag unset)");
  }
  let off = 37 + 16; // skip rpIdHash(32)+flags(1)+signCount(4) + aaguid(16)
  if (authData.length < off + 2) {
    throw new BuckspayError("INVALID_CONFIG", "passkey: authenticatorData missing credentialId length");
  }
  const credIdLen = (authData[off]! << 8) | authData[off + 1]!;
  off += 2 + credIdLen;
  return decodeCoseEc2(authData.subarray(off));
}

/** Rebuild the 65-byte uncompressed point `0x04 ‖ X(32) ‖ Y(32)` from COSE x/y. */
export function coseToUncompressed(cose: { x: Uint8Array; y: Uint8Array }): Uint8Array {
  if (cose.x.length !== 32 || cose.y.length !== 32) {
    throw new BuckspayError("INVALID_CONFIG", "passkey: COSE x/y must be 32 bytes each");
  }
  const out = new Uint8Array(65);
  out[0] = 0x04;
  out.set(cose.x, 1);
  out.set(cose.y, 33);
  return out;
}

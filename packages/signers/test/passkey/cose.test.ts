import { describe, it, expect } from "vitest";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { extractCoseKey, coseToUncompressed } from "../../src/passkey/cose.js";

/**
 * Build a WebAuthn authenticatorData with attested credential data carrying a
 * COSE_Key EC2 P-256 public key (x, y). Layout:
 *   rpIdHash(32) | flags(1) | signCount(4) | aaguid(16) | credIdLen(2) | credId | COSEKey(CBOR)
 * COSE_Key EC2 P-256 CBOR map: { 1:2(kty), 3:-7(alg), -1:1(crv), -2:bstr(x), -3:bstr(y) }.
 */
function buildAuthData(x: Uint8Array, y: Uint8Array, credId = new Uint8Array(0)): Uint8Array {
  const cose = [
    0xa5, // map(5)
    0x01, 0x02, // 1: 2
    0x03, 0x26, // 3: -7
    0x20, 0x01, // -1: 1
    0x21, 0x58, 0x20, ...x, // -2: bytes(32)
    0x22, 0x58, 0x20, ...y // -3: bytes(32)
  ];
  const head = new Uint8Array(37 + 16 + 2 + credId.length);
  head[32] = 0x40 | 0x05; // AT | UP | UV
  head[53] = (credId.length >> 8) & 0xff;
  head[54] = credId.length & 0xff;
  head.set(credId, 55);
  return new Uint8Array([...head, ...cose]);
}

describe("COSE EC2 parse", () => {
  it("extracts x/y and rebuilds the 65-byte uncompressed key", () => {
    const priv = sha256(new Uint8Array([42]));
    const pub = p256.getPublicKey(priv, false); // 0x04 || x || y
    const x = pub.slice(1, 33);
    const y = pub.slice(33, 65);
    const cose = extractCoseKey(buildAuthData(x, y));
    expect(Buffer.from(coseToUncompressed(cose))).toEqual(Buffer.from(pub));
  });

  it("works with a non-empty credentialId", () => {
    const priv = sha256(new Uint8Array([43]));
    const pub = p256.getPublicKey(priv, false);
    const cose = extractCoseKey(buildAuthData(pub.slice(1, 33), pub.slice(33, 65), new Uint8Array(20).fill(7)));
    expect(Buffer.from(coseToUncompressed(cose))).toEqual(Buffer.from(pub));
  });

  it("throws when the AT (attested credential) flag is unset", () => {
    const bad = new Uint8Array(37);
    expect(() => extractCoseKey(bad)).toThrow(/attested credential/);
  });
});

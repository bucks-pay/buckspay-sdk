import { describe, it, expect } from "vitest";
import { normalizeSignature } from "../src/wallets-kit/normalize-signature.js";

/** Deterministic 64-byte signature used across fixtures. */
const SIG_64 = new Uint8Array(64).map((_, i) => (i * 7 + 3) & 0xff);

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return Buffer.from(bin, "binary").toString("base64");
}

function asciiToBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

describe("normalizeSignature", () => {
  it("returns the 64 bytes unchanged for a clean base64 signature", () => {
    const clean = bytesToBase64(SIG_64); // decodes straight to 64 bytes
    const out = normalizeSignature(clean);
    expect(out).toBeInstanceOf(Uint8Array);
    expect(out.length).toBe(64);
    expect(Array.from(out)).toEqual(Array.from(SIG_64));
  });

  it("unwraps the Freighter 88-byte double-encoded signature", () => {
    const innerB64 = bytesToBase64(SIG_64); // 88-char base64 of the 64 bytes
    expect(innerB64.length).toBe(88);
    // FreighterModule did Buffer.from(innerB64) (ASCII) then base64-encoded => double-encode.
    const doubleEncoded = bytesToBase64(asciiToBytes(innerB64));
    const out = normalizeSignature(doubleEncoded);
    expect(out.length).toBe(64);
    expect(Array.from(out)).toEqual(Array.from(SIG_64));
  });

  it("throws BuckspayError SIGNATURE_REJECTED when the result is not 64 bytes", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const junk = bytesToBase64(new Uint8Array(32)); // 32 bytes, not a valid ed25519 sig
    try {
      normalizeSignature(junk);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BuckspayError);
      expect((e as InstanceType<typeof BuckspayError>).code).toBe("SIGNATURE_REJECTED");
    }
  });
});

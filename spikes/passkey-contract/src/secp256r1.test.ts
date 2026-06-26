import { describe, it, expect } from "vitest";
import { generateP256Key, exportUncompressedPubkey, signP256, verifyP256 } from "./secp256r1.js";

describe("software secp256r1 authenticator (WebAuthn emulator)", () => {
  it("exports a 65-byte uncompressed pubkey starting with 0x04", async () => {
    const kp = await generateP256Key();
    const pub = await exportUncompressedPubkey(kp.publicKey);
    expect(pub.length).toBe(65);
    expect(pub[0]).toBe(0x04);
  });

  it("signs a message and produces a 64-byte raw r||s signature that verifies", async () => {
    const kp = await generateP256Key();
    const msg = new TextEncoder().encode("soroban auth preimage hash");
    const sig = await signP256(kp.privateKey, msg);
    expect(sig.length).toBe(64);
    expect(await verifyP256(kp.publicKey, msg, sig)).toBe(true);
  });

  it("rejects a tampered message", async () => {
    const kp = await generateP256Key();
    const sig = await signP256(kp.privateKey, new TextEncoder().encode("a"));
    expect(await verifyP256(kp.publicKey, new TextEncoder().encode("b"), sig)).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { softwareWebAuthn } from "../../src/passkey/webauthn.js";

describe("softwareWebAuthn (test impl)", () => {
  it("create() yields a 65-byte uncompressed secp256r1 pubkey", async () => {
    const wa = softwareWebAuthn();
    const cred = await wa.create({ rpId: "x", rpName: "x", userName: "u", challenge: new Uint8Array(32) });
    expect(cred.publicKey.length).toBe(65);
    expect(cred.publicKey[0]).toBe(0x04);
  });
  it("get() over a challenge returns deterministic r,s for the same key+challenge", async () => {
    const wa = softwareWebAuthn({ seed: 7 });
    const challenge = new Uint8Array(32).fill(9);
    const a = await wa.get({ rpId: "x", challenge });
    const b = await wa.get({ rpId: "x", challenge });
    expect(Buffer.from(a.signature)).toEqual(Buffer.from(b.signature));
    expect(a.signature.length).toBe(64);
    expect(a.authenticatorData.length).toBeGreaterThan(0);
    expect(a.clientDataJSON.length).toBeGreaterThan(0);
  });
});

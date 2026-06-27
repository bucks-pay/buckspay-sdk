import { describe, it, expect } from "vitest";
import { passkeyGetPublicKey } from "../../src/passkey/getPublicKey.js";
import { softwareWebAuthn } from "../../src/passkey/webauthn.js";

describe("passkeyGetPublicKey", () => {
  it("returns a secp256r1 SignerKey with 65-byte hex pubkey", async () => {
    const key = await passkeyGetPublicKey(softwareWebAuthn({ seed: 3 }), "buckspay.local", "buckspay.local");
    expect(key.type).toBe("secp256r1");
    expect(key.publicKey).toMatch(/^04[0-9a-f]{128}$/);
  });
});

import { describe, it, expect } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { generateP256Key, verifyP256 } from "./secp256r1.js";
import {
  assembleWebAuthnSigData,
  base64UrlNoPad,
  preimageHash,
  signWebAuthnAssertion
} from "./check-auth.js";

async function sha256(b: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(b)));
}

describe("WebAuthn assertion + WebAuthnSigData assembly (matches OZ verifier)", () => {
  it("preimageHash returns a 32-byte sha256 of the preimage XDR bytes", async () => {
    const hash = await preimageHash(new Uint8Array([1, 2, 3, 4, 5]));
    expect(hash.length).toBe(32);
  });

  it("base64UrlNoPad encodes 32 bytes as 43 url-safe chars without padding", () => {
    const s = base64UrlNoPad(new Uint8Array(32).fill(0xab));
    expect(s.length).toBe(43);
    expect(s).not.toContain("=");
    expect(s).not.toMatch(/[+/]/);
  });

  it("signWebAuthnAssertion produces a signature the OZ verifier's digest accepts", async () => {
    const kp = await generateP256Key();
    const payload = new Uint8Array(32).fill(7);
    const a = await signWebAuthnAssertion({
      privateKey: kp.privateKey,
      signaturePayload: payload,
      rpId: "buckspay.dev"
    });

    // The OZ verifier checks secp256r1_verify(pk, sha256(authData || sha256(clientData)), sig).
    const message = new Uint8Array(a.authenticatorData.length + 32);
    message.set(a.authenticatorData, 0);
    message.set(await sha256(a.clientData), a.authenticatorData.length);
    expect(await verifyP256(kp.publicKey, message, a.signature64)).toBe(true);

    // challenge embedded in clientData == base64url(signature_payload)
    expect(new TextDecoder().decode(a.clientData)).toContain(base64UrlNoPad(payload));
    // authenticatorData has UP|UV flags set and is >= 37 bytes
    expect(a.authenticatorData.length).toBe(37);
    expect(a.authenticatorData[32]).toBe(0x05);
  });

  it("assembleWebAuthnSigData builds a sorted-key map scval that round-trips XDR", async () => {
    const kp = await generateP256Key();
    const a = await signWebAuthnAssertion({
      privateKey: kp.privateKey,
      signaturePayload: new Uint8Array(32).fill(1),
      rpId: "buckspay.dev"
    });
    const scval = assembleWebAuthnSigData(a);
    expect(scval.switch().name).toBe("scvMap");
    const keys = scval
      .map()!
      .map((e) => e.key().sym().toString());
    expect(keys).toEqual(["authenticator_data", "client_data", "signature"]);
    const back = xdr.ScVal.fromXDR(scval.toXDR("base64"), "base64");
    expect(back.switch().name).toBe("scvMap");
  });
});

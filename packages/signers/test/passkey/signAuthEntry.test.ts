import { describe, it, expect } from "vitest";
import { xdr, hash, Address, StrKey } from "@stellar/stellar-sdk";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { passkey } from "../../src/passkey/index.js";
import { softwareWebAuthn } from "../../src/passkey/webauthn.js";
import { decodeCheckAuthSignature } from "../../src/passkey/signAuthEntry.js";

const C = StrKey.encodeContract(Buffer.alloc(32, 1)); // valid contract address

// Build a minimal but real HashIDPreimage so preimageXdr decodes.
function preimageXdr(): string {
  const pre = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId: hash(Buffer.from("Test SDF Network ; September 2015")),
      nonce: xdr.Int64.fromString("7"),
      signatureExpirationLedger: 999999,
      invocation: new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.InvokeContractArgs({
            contractAddress: new Address(C).toScAddress(),
            functionName: "transfer",
            args: []
          })
        ),
        subInvocations: []
      })
    })
  );
  return pre.toXDR("base64");
}

describe("passkey.signAuthEntry", () => {
  it("returns a Signature whose scval decodes to authData/clientData/r‖s and echoes the pubkey", async () => {
    const wa = softwareWebAuthn({ seed: 5 });
    const signer = passkey({ rpId: "buckspay.local", webauthn: wa });
    const key = await signer.getPublicKey();

    const sig = await signer.signAuthEntry({
      preimageXdr: preimageXdr(),
      network: "testnet",
      signatureExpirationLedger: 999999
    });

    expect(sig.publicKey).toBe(key.publicKey);
    const parts = decodeCheckAuthSignature(sig.signature);
    expect(parts.signature.length).toBe(64); // raw r‖s
    expect(parts.authenticatorData.length).toBeGreaterThan(0);
    expect(parts.clientDataJSON.length).toBeGreaterThan(0);

    // The packed signature must verify against the derived pubkey over the WebAuthn signed bytes.
    const signed = new Uint8Array(parts.authenticatorData.length + 32);
    signed.set(parts.authenticatorData, 0);
    signed.set(sha256(parts.clientDataJSON), parts.authenticatorData.length);
    const ok = p256.verify(parts.signature, sha256(signed), Buffer.from(key.publicKey, "hex"));
    expect(ok).toBe(true);
  });

  it("maps a WebAuthn cancel to SIGNATURE_REJECTED", async () => {
    const wa = {
      ...softwareWebAuthn(),
      get: async () => {
        throw new Error("cancelled");
      }
    } as unknown as ReturnType<typeof softwareWebAuthn>;
    const signer = passkey({ rpId: "buckspay.local", webauthn: wa });
    // getPublicKey first so the cache is set (cancel must surface from get, not the cache guard).
    await signer.getPublicKey();
    await expect(
      signer.signAuthEntry({ preimageXdr: preimageXdr(), network: "testnet", signatureExpirationLedger: 999999 })
    ).rejects.toMatchObject({ code: "SIGNATURE_REJECTED" });
  });
});

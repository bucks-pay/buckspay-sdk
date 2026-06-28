import { describe, it, expect } from "vitest";
import { Address, hash, StrKey, xdr } from "@stellar/stellar-sdk";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { decodeCheckAuthSignature } from "@buckspay/signers/passkey";
import { softwarePasskeySigner } from "./software-passkey.js";

function preimageXdr(): string {
  const pre = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId: hash(Buffer.from("Test SDF Network ; September 2015")),
      nonce: xdr.Int64.fromString("7"),
      signatureExpirationLedger: 999999,
      invocation: new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.InvokeContractArgs({
            contractAddress: new Address(StrKey.encodeContract(Buffer.alloc(32, 1))).toScAddress(),
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

describe("softwarePasskeySigner (e2e harness double)", () => {
  it("is a passkey BuckspaySigner with a 65-byte secp256r1 key", async () => {
    const signer = await softwarePasskeySigner("buckspay.local");
    expect(signer.type).toBe("passkey");
    const key = await signer.getPublicKey();
    expect(key.type).toBe("secp256r1");
    expect(key.publicKey).toMatch(/^04[0-9a-f]{128}$/);
  });

  it("produces a WebAuthnSigData signature that verifies — what __check_auth checks on-chain", async () => {
    const signer = await softwarePasskeySigner("buckspay.local");
    const key = await signer.getPublicKey();
    const sig = await signer.signAuthEntry({
      preimageXdr: preimageXdr(),
      network: "testnet",
      signatureExpirationLedger: 999999
    });
    expect(sig.publicKey).toBe(key.publicKey);

    const parts = decodeCheckAuthSignature(sig.signature);
    expect(parts.signature.length).toBe(64); // raw r‖s, low-S
    const signed = new Uint8Array(parts.authenticatorData.length + 32);
    signed.set(parts.authenticatorData, 0);
    signed.set(sha256(parts.clientDataJSON), parts.authenticatorData.length);
    expect(p256.verify(parts.signature, sha256(signed), Buffer.from(key.publicKey, "hex"))).toBe(true);
  });
});

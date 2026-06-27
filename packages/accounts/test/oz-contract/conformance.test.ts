import { describe, it, expect } from "vitest";
import { Address, Keypair, Networks, StrKey, hash, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { decodeCheckAuthSignature } from "@buckspay/signers/passkey";
import { ozContractAccount } from "../../src/oz-contract/index.js";

const RP_ID = "buckspay.local";

function b64url(b: Uint8Array): string {
  return Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * A passkey-like signer (software P-256) that emits the exact plan-03 WebAuthnSigData
 * scval. Mirrors `@buckspay/signers/passkey` softwareWebAuthn (which is test-only and not
 * publicly exported), so the conformance test stays self-contained in @buckspay/accounts.
 */
function softwarePasskeySigner(seed: number) {
  const priv = sha256(new Uint8Array([seed]));
  const pub = p256.getPublicKey(priv, false);
  const pubHex = Buffer.from(pub).toString("hex");
  return {
    type: "passkey" as const,
    async getPublicKey() {
      return { type: "secp256r1" as const, publicKey: pubHex };
    },
    async signAuthEntry(payload: { preimageXdr: string }) {
      const preimage = xdr.HashIdPreimage.fromXDR(payload.preimageXdr, "base64");
      const challenge = sha256(preimage.toXDR());
      const authData = new Uint8Array(37);
      authData.set(sha256(new TextEncoder().encode(RP_ID)), 0);
      authData[32] = 0x05; // UP|UV
      const clientData = new TextEncoder().encode(
        JSON.stringify({ type: "webauthn.get", challenge: b64url(challenge), origin: `https://${RP_ID}` })
      );
      const message = new Uint8Array(authData.length + 32);
      message.set(authData, 0);
      message.set(sha256(clientData), authData.length);
      const rs = p256.sign(sha256(message), priv, { lowS: true }).toCompactRawBytes();
      const scval = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: nativeToScVal("authenticator_data", { type: "symbol" }),
          val: xdr.ScVal.scvBytes(Buffer.from(authData))
        }),
        new xdr.ScMapEntry({
          key: nativeToScVal("client_data", { type: "symbol" }),
          val: xdr.ScVal.scvBytes(Buffer.from(clientData))
        }),
        new xdr.ScMapEntry({
          key: nativeToScVal("signature", { type: "symbol" }),
          val: xdr.ScVal.scvBytes(Buffer.from(rs))
        })
      ]);
      return { signature: scval.toXDR(), publicKey: pubHex };
    }
  };
}

describe("ozContractAccount — end-to-end conformance (resolve → build → assemble)", () => {
  it("produces a __check_auth entry whose passkey signature would verify on-chain", async () => {
    const sponsor = Keypair.random().publicKey();
    const signer = softwarePasskeySigner(11);
    const account = ozContractAccount({ sponsorAddress: sponsor, network: "testnet" });

    // 1. resolveAddress → deterministic C-address (deployer-bound).
    const from = await account.resolveAddress(signer);
    expect(from).toMatch(/^C[A-Z2-7]{55}$/);

    // 2. buildUnsignedEntry — a transfer from the contract account.
    const SAC = StrKey.encodeContract(Buffer.alloc(32, 9));
    const to = Keypair.random().publicKey();
    const call = {
      contract: SAC,
      fn: "transfer",
      args: [new Address(from).toScVal(), new Address(to).toScVal(), nativeToScVal(10000000n, { type: "i128" })]
    };
    const unsigned = account.buildUnsignedEntry({ from, call, nonce: 42n });

    // 3. assembleSignedEntry — sign + inject.
    const sigExp = 987654;
    const b64 = await account.assembleSignedEntry({ unsigned, signer, signatureExpirationLedger: sigExp, network: "testnet" });

    // 4. Decode and verify the on-chain contract: the WebAuthnSigData r‖s must verify
    //    against the passkey pubkey over sha256(authData ‖ sha256(clientData)), and the
    //    clientData.challenge must equal base64url(sha256(the signed preimage)).
    const entry = xdr.SorobanAuthorizationEntry.fromXDR(b64, "base64");
    const creds = entry.credentials().address();
    expect(creds.signatureExpirationLedger()).toBe(sigExp);

    const parts = decodeCheckAuthSignature(creds.signature().toXDR());
    const signed = new Uint8Array(parts.authenticatorData.length + 32);
    signed.set(parts.authenticatorData, 0);
    signed.set(sha256(parts.clientDataJSON), parts.authenticatorData.length);
    const key = await signer.getPublicKey();
    expect(p256.verify(parts.signature, sha256(signed), Buffer.from(key.publicKey, "hex"))).toBe(true);

    // 5. Challenge binding: clientData.challenge == base64url(sha256(reconstructed preimage)).
    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId: hash(Buffer.from(Networks.TESTNET)),
        nonce: creds.nonce(),
        signatureExpirationLedger: sigExp,
        invocation: entry.rootInvocation()
      })
    );
    const expectedChallenge = b64url(sha256(preimage.toXDR()));
    const clientData = JSON.parse(Buffer.from(parts.clientDataJSON).toString()) as { challenge: string };
    expect(clientData.challenge).toBe(expectedChallenge);
  });
});

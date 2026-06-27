import { describe, it, expect } from "vitest";
import { Address, Keypair, nativeToScVal, StrKey, xdr } from "@stellar/stellar-sdk";
import { buildContractEntry } from "../../src/oz-contract/buildEntry.js";
import { assembleContractEntry } from "../../src/oz-contract/assemble.js";

const C = StrKey.encodeContract(Buffer.alloc(32, 1));
const SAC = StrKey.encodeContract(Buffer.alloc(32, 2));
const TO = Keypair.random().publicKey();
const PUBKEY = "04" + "ab".repeat(64);

function call() {
  return {
    contract: SAC,
    fn: "transfer",
    args: [new Address(C).toScVal(), new Address(TO).toScVal(), nativeToScVal(10000000n, { type: "i128" })]
  };
}

/** A plan-03-shaped passkey signature scval (WebAuthnSigData). */
function sigScval(): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: nativeToScVal("authenticator_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from([1]))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("client_data", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from([2]))
    }),
    new xdr.ScMapEntry({
      key: nativeToScVal("signature", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.alloc(64))
    })
  ]);
}

describe("buildContractEntry", () => {
  it("builds an entry with Address(C…) credentials and the transfer invocation", () => {
    const entry = buildContractEntry({ from: C, call: call(), nonce: 7n });
    expect(entry.credentials().switch().name).toBe("sorobanCredentialsAddress");
    expect(Address.fromScAddress(entry.credentials().address().address()).toString()).toBe(C);
    expect(entry.rootInvocation().function().contractFn().functionName().toString()).toBe("transfer");
  });
});

describe("assembleContractEntry", () => {
  it("injects the passkey signature scval + expiration and returns base64 XDR", async () => {
    const unsigned = buildContractEntry({ from: C, call: call(), nonce: 7n });
    const signer = {
      type: "passkey" as const,
      async getPublicKey() {
        return { type: "secp256r1" as const, publicKey: PUBKEY };
      },
      async signAuthEntry() {
        return { signature: sigScval().toXDR(), publicKey: PUBKEY };
      }
    };
    const b64 = await assembleContractEntry({ unsigned, signer, signatureExpirationLedger: 999999, network: "testnet" });
    const decoded = xdr.SorobanAuthorizationEntry.fromXDR(b64, "base64");
    expect(decoded.credentials().address().signatureExpirationLedger()).toBe(999999);
    expect(decoded.credentials().address().signature().switch().name).not.toBe("scvVoid");
  });

  it("hands the signer the network-scoped preimage over this entry's nonce+invocation+expiration", async () => {
    const unsigned = buildContractEntry({ from: C, call: call(), nonce: 7n });
    let seenPreimage = "";
    const signer = {
      type: "passkey" as const,
      async getPublicKey() {
        return { type: "secp256r1" as const, publicKey: PUBKEY };
      },
      async signAuthEntry(p: { preimageXdr: string }) {
        seenPreimage = p.preimageXdr;
        return { signature: xdr.ScVal.scvBytes(Buffer.alloc(4)).toXDR(), publicKey: PUBKEY };
      }
    };
    await assembleContractEntry({ unsigned, signer, signatureExpirationLedger: 555, network: "testnet" });
    const pre = xdr.HashIdPreimage.fromXDR(seenPreimage, "base64");
    expect(pre.switch().name).toBe("envelopeTypeSorobanAuthorization");
    expect(pre.sorobanAuthorization().signatureExpirationLedger()).toBe(555);
    expect(pre.sorobanAuthorization().nonce().toString()).toBe("7");
  });

  it("rejects a non-passkey signer", async () => {
    const unsigned = buildContractEntry({ from: C, call: call(), nonce: 7n });
    const badSigner = {
      type: "wallets-kit" as const,
      async getPublicKey() {
        return { type: "ed25519" as const, publicKey: Keypair.random().publicKey() };
      },
      async signAuthEntry() {
        return { signature: new Uint8Array(0), publicKey: "" };
      }
    };
    await expect(
      assembleContractEntry({ unsigned, signer: badSigner, signatureExpirationLedger: 1, network: "testnet" })
    ).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });
});

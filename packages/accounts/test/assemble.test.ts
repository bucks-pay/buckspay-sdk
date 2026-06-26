import { describe, it, expect, vi } from "vitest";
import { Address, hash, Keypair, nativeToScVal, StrKey, xdr } from "@stellar/stellar-sdk";
import { classicAccount } from "../src/classic/classic-account.js";
import type { AssembleInput, AuthEntryPayload, BuckspaySigner, Signature } from "@buckspay/core";

const SAC = StrKey.encodeContract(Buffer.alloc(32, 33));
// A real keypair so authorizeEntry's signature structure is well-formed.
const kp = Keypair.random();
const G_FROM = kp.publicKey();
const G_TO = Keypair.random().publicKey();

function unsignedEntry(): xdr.SorobanAuthorizationEntry {
  const args = [
    new Address(G_FROM).toScVal(),
    new Address(G_TO).toScVal(),
    nativeToScVal(15_000_000n, { type: "i128" })
  ];
  const fn = new xdr.InvokeContractArgs({
    contractAddress: new Address(SAC).toScAddress(),
    functionName: "transfer",
    args
  });
  const invocation = new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(fn),
    subInvocations: []
  });
  const creds = new xdr.SorobanAddressCredentials({
    address: new Address(G_FROM).toScAddress(),
    nonce: xdr.Int64.fromString("7"),
    signatureExpirationLedger: 0,
    signature: xdr.ScVal.scvVoid()
  });
  return new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(creds),
    rootInvocation: invocation
  });
}

/** Signer whose signAuthEntry produces a REAL ed25519 signature over the preimage. */
function realSigner(): BuckspaySigner {
  return {
    type: "wallets-kit",
    getPublicKey: vi.fn().mockResolvedValue({ type: "ed25519", publicKey: G_FROM }),
    signAuthEntry: vi.fn(
      // eslint-disable-next-line @typescript-eslint/require-await
      async (p: AuthEntryPayload): Promise<Signature> => {
        const preimage = xdr.HashIdPreimage.fromXDR(p.preimageXdr, "base64");
        const payloadHash = hash(preimage.toXDR());
        const signature = new Uint8Array(kp.sign(payloadHash));
        return { signature, publicKey: G_FROM };
      }
    )
  };
}

describe("classicAccount assembleSignedEntry", () => {
  it("delegates the SigningCallback to signer.signAuthEntry and returns base64 XDR", async () => {
    const signer = realSigner();
    const adapter = classicAccount();
    const input: AssembleInput = {
      unsigned: unsignedEntry(),
      signer,
      signatureExpirationLedger: 5_000_000,
      network: "testnet"
    };
    const signedB64 = await adapter.assembleSignedEntry(input);
    expect(typeof signedB64).toBe("string");
    expect(signedB64.length).toBeGreaterThan(0);
    // It round-trips as a valid SorobanAuthorizationEntry with an address credential.
    const back = xdr.SorobanAuthorizationEntry.fromXDR(signedB64, "base64");
    expect(back.credentials().switch().name).toBe("sorobanCredentialsAddress");
    expect(back.credentials().address().signatureExpirationLedger()).toBe(5_000_000);
    // The signer was called with the testnet network and the expiration ledger.
    const callArg = (signer.signAuthEntry as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as
      | AuthEntryPayload
      | undefined;
    expect(callArg?.network).toBe("testnet");
    expect(callArg?.signatureExpirationLedger).toBe(5_000_000);
    expect(callArg?.preimageXdr.length).toBeGreaterThan(0);
  });

  it("propagates a SIGNATURE_REJECTED from the signer", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const signer = realSigner();
    (signer.signAuthEntry as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new BuckspayError("SIGNATURE_REJECTED", "user declined")
    );
    const adapter = classicAccount();
    await expect(
      adapter.assembleSignedEntry({
        unsigned: unsignedEntry(),
        signer,
        signatureExpirationLedger: 5_000_000,
        network: "testnet"
      })
    ).rejects.toMatchObject({ code: "SIGNATURE_REJECTED" });
  });
});

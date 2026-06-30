import { describe, it, expect } from "vitest";
import { xdr, hash, Address, StrKey } from "@stellar/stellar-sdk";
import type { BuckspaySigner, AuthDetails } from "@buckspay/core";

const C = StrKey.encodeContract(Buffer.alloc(32, 7));

/** A minimal but real Soroban-auth HashIdPreimage so `preimageXdr` decodes. */
export function conformancePreimageXdr(): string {
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

export interface ConformanceOpts {
  label: string;
  /** Build a FRESH, un-authenticated signer for each case. */
  makeSigner: () => BuckspaySigner;
  expectedType: BuckspaySigner["type"];
  expectedKeyType: "ed25519" | "secp256r1";
  expectedProvider: string;
  /** Params that make the test double's authenticate() succeed. */
  authenticateParams: Record<string, unknown>;
  /** The G-address the test double resolves. */
  expectedPublicKey: string;
}

/** Pins the BuckspaySigner contract for an onboarding (authenticate-bearing) signer. */
export function runBuckspaySignerConformance(opts: ConformanceOpts): void {
  describe(`BuckspaySigner conformance — ${opts.label}`, () => {
    it("declares the expected signer type", () => {
      expect(opts.makeSigner().type).toBe(opts.expectedType);
    });

    it("exposes authenticate() resolving AuthDetails with a G-address publicKey", async () => {
      const signer = opts.makeSigner();
      expect(typeof signer.authenticate).toBe("function");
      const details = (await signer.authenticate?.(opts.authenticateParams)) as AuthDetails;
      expect(details.publicKey).toBe(opts.expectedPublicKey);
      expect(details.provider).toBe(opts.expectedProvider);
    });

    it("getPublicKey() before authenticate() throws ACCOUNT_NOT_READY", async () => {
      await expect(opts.makeSigner().getPublicKey()).rejects.toMatchObject({ code: "ACCOUNT_NOT_READY" });
    });

    it("signAuthEntry() before authenticate() throws ACCOUNT_NOT_READY", async () => {
      await expect(
        opts.makeSigner().signAuthEntry({
          preimageXdr: conformancePreimageXdr(),
          network: "testnet",
          signatureExpirationLedger: 999999
        })
      ).rejects.toMatchObject({ code: "ACCOUNT_NOT_READY" });
    });

    it("after authenticate(), getPublicKey() returns the provider key", async () => {
      const signer = opts.makeSigner();
      await signer.authenticate?.(opts.authenticateParams);
      expect(await signer.getPublicKey()).toEqual({
        type: opts.expectedKeyType,
        publicKey: opts.expectedPublicKey
      });
    });

    it("after authenticate(), signAuthEntry() returns a 64-byte signature echoing the key", async () => {
      const signer = opts.makeSigner();
      await signer.authenticate?.(opts.authenticateParams);
      const sig = await signer.signAuthEntry({
        preimageXdr: conformancePreimageXdr(),
        network: "testnet",
        signatureExpirationLedger: 999999
      });
      expect(sig.signature).toBeInstanceOf(Uint8Array);
      expect(sig.signature.length).toBe(64);
      expect(sig.publicKey).toBe(opts.expectedPublicKey);
    });
  });
}

import { describe, expectTypeOf, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import type {
  AuthEntryPayload,
  BuckspaySigner,
  Call,
  FacilitatorChain,
  Network,
  Signature,
  SignerKey,
  SignerType
} from "../src/types";

describe("§4.1 identity/signing/call types", () => {
  it("Network is the testnet|pubnet union", () => {
    expectTypeOf<Network>().toEqualTypeOf<"testnet" | "pubnet">();
  });

  it("FacilitatorChain is the stellar-* union", () => {
    expectTypeOf<FacilitatorChain>().toEqualTypeOf<"stellar-testnet" | "stellar-pubnet">();
  });

  it("SignerType is wallets-kit|passkey", () => {
    expectTypeOf<SignerType>().toEqualTypeOf<"wallets-kit" | "passkey">();
  });

  it("SignerKey carries a crypto type and a publicKey string", () => {
    expectTypeOf<SignerKey>().toMatchTypeOf<{
      type: "ed25519" | "secp256r1";
      publicKey: string;
    }>();
  });

  it("AuthEntryPayload carries preimageXdr + network + expiry ledger", () => {
    expectTypeOf<AuthEntryPayload>().toMatchTypeOf<{
      preimageXdr: string;
      network: Network;
      signatureExpirationLedger: number;
    }>();
  });

  it("Signature carries raw bytes + echoed publicKey", () => {
    expectTypeOf<Signature["signature"]>().toEqualTypeOf<Uint8Array>();
    expectTypeOf<Signature["publicKey"]>().toEqualTypeOf<string>();
  });

  it("BuckspaySigner has type + getPublicKey + signAuthEntry", () => {
    expectTypeOf<BuckspaySigner["type"]>().toEqualTypeOf<SignerType>();
    expectTypeOf<BuckspaySigner["getPublicKey"]>().returns.resolves.toEqualTypeOf<SignerKey>();
    expectTypeOf<BuckspaySigner["signAuthEntry"]>().parameter(0).toEqualTypeOf<AuthEntryPayload>();
    expectTypeOf<BuckspaySigner["signAuthEntry"]>().returns.resolves.toEqualTypeOf<Signature>();
  });

  it("Call carries contract + fn + xdr.ScVal[] args", () => {
    expectTypeOf<Call["contract"]>().toEqualTypeOf<string>();
    expectTypeOf<Call["fn"]>().toEqualTypeOf<string>();
    expectTypeOf<Call["args"]>().toEqualTypeOf<xdr.ScVal[]>();
  });
});

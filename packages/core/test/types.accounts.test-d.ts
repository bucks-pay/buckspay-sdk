import { describe, expectTypeOf, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import type {
  AccountAdapter,
  AccountModel,
  AssembleInput,
  BuckspaySigner,
  BuildEntryInput,
  Call,
  EnsureReadyInput,
  Network,
  Relayer
} from "../src/types";

describe("§4.2 account types", () => {
  it("AccountModel is classic|contract", () => {
    expectTypeOf<AccountModel>().toEqualTypeOf<"classic" | "contract">();
  });

  it("EnsureReadyInput carries address + relayer + signer + network", () => {
    expectTypeOf<EnsureReadyInput>().toMatchTypeOf<{
      address: string;
      relayer: Relayer;
      signer: BuckspaySigner;
      network: Network;
    }>();
  });

  it("BuildEntryInput carries from + call + bigint nonce", () => {
    expectTypeOf<BuildEntryInput["from"]>().toEqualTypeOf<string>();
    expectTypeOf<BuildEntryInput["call"]>().toEqualTypeOf<Call>();
    expectTypeOf<BuildEntryInput["nonce"]>().toEqualTypeOf<bigint>();
  });

  it("AssembleInput carries unsigned entry + signer + expiry + network", () => {
    expectTypeOf<AssembleInput["unsigned"]>().toEqualTypeOf<xdr.SorobanAuthorizationEntry>();
    expectTypeOf<AssembleInput["signer"]>().toEqualTypeOf<BuckspaySigner>();
    expectTypeOf<AssembleInput["signatureExpirationLedger"]>().toEqualTypeOf<number>();
    expectTypeOf<AssembleInput["network"]>().toEqualTypeOf<Network>();
  });

  it("AccountAdapter has model + the four documented methods", () => {
    expectTypeOf<AccountAdapter["model"]>().toEqualTypeOf<AccountModel>();
    expectTypeOf<AccountAdapter["resolveAddress"]>().returns.resolves.toEqualTypeOf<string>();
    expectTypeOf<AccountAdapter["ensureReady"]>().parameter(0).toEqualTypeOf<EnsureReadyInput>();
    expectTypeOf<AccountAdapter["buildUnsignedEntry"]>().returns.toEqualTypeOf<xdr.SorobanAuthorizationEntry>();
    expectTypeOf<AccountAdapter["assembleSignedEntry"]>().returns.resolves.toEqualTypeOf<string>();
  });
});

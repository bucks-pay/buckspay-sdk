import { describe, expectTypeOf, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import type { BuckspayError } from "../src/errors";
import type {
  AccountAdapter,
  AccountModel,
  AccountState,
  BuckspayConfig,
  BuckspaySigner,
  BuckspayState,
  BuckspayWallet,
  GasConfig,
  Network,
  PreparedIntent,
  Receipt,
  Relayer,
  SignedIntent
} from "../src/types";

describe("§4.4 engine/intents/client/config/state types", () => {
  it("GasConfig is the sponsored | token discriminated union", () => {
    expectTypeOf<GasConfig>().toEqualTypeOf<
      { mode: "sponsored" } | { mode: "token"; token: string; maxFee?: string }
    >();
  });

  it("PreparedIntent carries the unsigned entry and preimage", () => {
    expectTypeOf<PreparedIntent["unsignedEntry"]>().toEqualTypeOf<xdr.SorobanAuthorizationEntry>();
    expectTypeOf<PreparedIntent["preimageXdr"]>().toEqualTypeOf<string>();
    expectTypeOf<PreparedIntent>().toMatchTypeOf<{
      from: string;
      to: string;
      token: string;
      value: string;
      nonce: string;
      signatureExpirationLedger: number;
      network: Network;
    }>();
  });

  it("SignedIntent carries the signed authorizationEntryXdr", () => {
    expectTypeOf<SignedIntent["authorizationEntryXdr"]>().toEqualTypeOf<string>();
    expectTypeOf<SignedIntent>().toMatchTypeOf<{
      from: string;
      to: string;
      token: string;
      value: string;
      nonce: string;
      signatureExpirationLedger: number;
      network: Network;
    }>();
  });

  it("BuckspayWallet carries address + model + getState", () => {
    expectTypeOf<BuckspayWallet["address"]>().toEqualTypeOf<string>();
    expectTypeOf<BuckspayWallet["model"]>().toEqualTypeOf<AccountModel>();
    expectTypeOf<BuckspayWallet["getState"]>().returns.resolves.toEqualTypeOf<AccountState>();
  });

  it("BuckspayConfig wires network + account + signer + relayer + gas", () => {
    expectTypeOf<BuckspayConfig["network"]>().toEqualTypeOf<Network>();
    expectTypeOf<BuckspayConfig["account"]>().toEqualTypeOf<AccountAdapter>();
    expectTypeOf<BuckspayConfig["signer"]>().toEqualTypeOf<BuckspaySigner>();
    expectTypeOf<BuckspayConfig["relayer"]>().toEqualTypeOf<Relayer>();
    expectTypeOf<BuckspayConfig["gas"]>().toEqualTypeOf<GasConfig>();
  });

  it("BuckspayState is the documented status machine", () => {
    expectTypeOf<BuckspayState["status"]>().toEqualTypeOf<
      "idle" | "connecting" | "ready" | "signing" | "relaying" | "success" | "error"
    >();
    expectTypeOf<BuckspayState["address"]>().toEqualTypeOf<string | null>();
    expectTypeOf<BuckspayState["receipt"]>().toEqualTypeOf<Receipt | null>();
    expectTypeOf<BuckspayState["error"]>().toEqualTypeOf<BuckspayError | null>();
  });
});

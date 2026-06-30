import { describe, expectTypeOf, it } from "vitest";
import type { AccountState, FacilitatorChain, Receipt, RelayPayload, Relayer } from "../src/types";

describe("§4.3 relayer types", () => {
  it("AccountState carries existence + trustline + optional balances", () => {
    expectTypeOf<AccountState["exists"]>().toEqualTypeOf<boolean>();
    expectTypeOf<AccountState["hasUsdcTrustline"]>().toEqualTypeOf<boolean>();
    expectTypeOf<AccountState["xlmBalance"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<AccountState["usdcBalance"]>().toEqualTypeOf<string | undefined>();
  });

  it("RelayPayload matches facilitator stellarSorobanSchema fields (+ optional SP-2 fee fields)", () => {
    expectTypeOf<RelayPayload>().toEqualTypeOf<{
      token: string;
      from: string;
      to: string;
      value: string;
      authorizationEntryXdr: string;
      nonce: string;
      signatureExpirationLedger: number;
      feeToken?: string;
    }>();
  });

  it("Receipt matches facilitator /relay soroban response shape", () => {
    expectTypeOf<Receipt["ok"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Receipt["via"]>().toEqualTypeOf<string>();
    expectTypeOf<Receipt["token"]>().toEqualTypeOf<string>();
    expectTypeOf<Receipt["chain"]>().toEqualTypeOf<FacilitatorChain>();
    expectTypeOf<Receipt["transferTx"]>().toEqualTypeOf<string>();
    expectTypeOf<Receipt["ledger"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Receipt["status"]>().toEqualTypeOf<string>();
  });

  it("Relayer exposes the five documented endpoints", () => {
    expectTypeOf<Relayer["relay"]>().parameter(0).toEqualTypeOf<RelayPayload>();
    expectTypeOf<Relayer["relay"]>().returns.resolves.toEqualTypeOf<Receipt>();
    expectTypeOf<Relayer["getAccountState"]>().parameter(0).toEqualTypeOf<string>();
    expectTypeOf<Relayer["getAccountState"]>().returns.resolves.toEqualTypeOf<AccountState>();
    expectTypeOf<Relayer["buildOnboard"]>().parameter(0).toEqualTypeOf<{ publicKey: string }>();
    expectTypeOf<Relayer["buildOnboard"]>().returns.resolves.toEqualTypeOf<{ xdr: string }>();
    expectTypeOf<Relayer["submitOnboard"]>()
      .parameter(0)
      .toEqualTypeOf<{ publicKey: string; signedTxXdr: string }>();
    expectTypeOf<Relayer["submitOnboard"]>().returns.resolves.toEqualTypeOf<{ ok: boolean }>();
    expectTypeOf<Relayer["deployContract"]>().parameter(0).toEqualTypeOf<{ passkeyPublicKey: string }>();
    expectTypeOf<Relayer["deployContract"]>().returns.resolves.toEqualTypeOf<{ address: string }>();
  });
});

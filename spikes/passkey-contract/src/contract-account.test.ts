import { describe, it, expect } from "vitest";
import { Address } from "@stellar/stellar-sdk";
import { buildTransferArgs, buildBalanceArgs } from "./contract-account.js";

const C_ADDR = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const G_ADDR = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

describe("contract account SAC arg builders (Q2: C-address has no classic trustline)", () => {
  it("buildBalanceArgs encodes balance(address) for a C-address owner", () => {
    const args = buildBalanceArgs(C_ADDR);
    expect(args.length).toBe(1);
    expect(Address.fromScVal(args[0]!).toString()).toBe(C_ADDR);
  });

  it("buildTransferArgs encodes transfer(C-from, G-to, i128 amount)", () => {
    const args = buildTransferArgs({ from: C_ADDR, to: G_ADDR, stroops: 1000000n });
    expect(args.length).toBe(3);
    expect(Address.fromScVal(args[0]!).toString()).toBe(C_ADDR);
    expect(Address.fromScVal(args[1]!).toString()).toBe(G_ADDR);
    expect(args[2]!.switch().name).toBe("scvI128");
  });
});

import { describe, it, expect } from "vitest";
import { StrKey, xdr } from "@stellar/stellar-sdk";
import { BuckspayError } from "@buckspay/core";
import { spendLimit, allowlist, compilePolicies } from "../src/policy/index";

const USDC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const APP = StrKey.encodeContract(Buffer.alloc(32, 9));
const EXPIRES = 1_900_000_000; // unix seconds

describe("@buckspay/accounts/policy — factories + compile", () => {
  it("spendLimit() defaults period to 'day' and coerces max (bigint) to a decimal string", () => {
    expect(spendLimit({ token: USDC, max: 1_000_000_000n })).toEqual({
      kind: "spendLimit",
      token: USDC,
      max: "1000000000",
      period: "day"
    });
  });

  it("spendLimit() keeps a string max and honors an explicit period", () => {
    expect(spendLimit({ token: USDC, max: "5000000", period: "week" })).toEqual({
      kind: "spendLimit",
      token: USDC,
      max: "5000000",
      period: "week"
    });
  });

  it("allowlist() yields the SessionPolicy shape", () => {
    expect(allowlist([APP])).toEqual({ kind: "allowlist", contracts: [APP] });
  });

  it("compilePolicies() produces a Policy struct (scvMap) that round-trips through XDR", () => {
    const sv = compilePolicies([spendLimit({ token: USDC, max: "1000000000" }), allowlist([APP])], EXPIRES);
    expect(sv).toBeInstanceOf(xdr.ScVal);
    expect(sv.switch().name).toBe("scvMap");
    // The struct carries the five canonical keys in sorted order.
    expect(sv.map()!.map((e) => e.key().sym().toString())).toEqual([
      "allowlist",
      "expiration",
      "spend_max",
      "spend_period",
      "spend_token"
    ]);
    const back = xdr.ScVal.fromXDR(sv.toXDR("base64"), "base64");
    expect(back.toXDR("base64")).toBe(sv.toXDR("base64"));
  });

  it("compilePolicies() refuses a session with no spend limit (unbounded)", () => {
    try {
      compilePolicies([allowlist([APP])], EXPIRES);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BuckspayError);
      expect((e as BuckspayError).code).toBe("INVALID_CONFIG");
      expect((e as BuckspayError).message).toMatch(/spend limit/i);
    }
  });

  it("compilePolicies() refuses a session with no (or empty) allowlist", () => {
    expect(() => compilePolicies([spendLimit({ token: USDC, max: "1000000" })], EXPIRES)).toThrowError(/allowlist/i);
    expect(() => compilePolicies([spendLimit({ token: USDC, max: "1" }), allowlist([])], EXPIRES)).toThrowError(
      /allowlist/i
    );
  });
});

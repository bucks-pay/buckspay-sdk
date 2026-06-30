import { describe, it, expect } from "vitest";
import { StrKey } from "@stellar/stellar-sdk";
import { BuckspayError } from "@buckspay/core";
import { allowlist, spendLimit, buildInstallArgs, buildRevokeArgs } from "../src/policy/index";

const SESSION_KEY = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 11));
const USDC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const APP = StrKey.encodeContract(Buffer.alloc(32, 9));
const EXPIRES = 1_900_000_000;

describe("@buckspay/accounts/policy — install/revoke arg builders", () => {
  it("buildInstallArgs() encodes [BytesN(sessionKey), Policy] (2 args)", () => {
    const args = buildInstallArgs({
      sessionKey: SESSION_KEY,
      policies: [spendLimit({ token: USDC, max: "1000000" }), allowlist([APP])],
      expiresAt: EXPIRES
    });
    expect(args.length).toBe(2);
    // arg[0] is the raw 32-byte ed25519 public key; it re-encodes to the session G-address.
    expect(args[0]!.switch().name).toBe("scvBytes");
    expect(args[0]!.bytes()).toHaveLength(32);
    expect(StrKey.encodeEd25519PublicKey(args[0]!.bytes())).toBe(SESSION_KEY);
    // arg[1] is the compiled Policy struct.
    expect(args[1]!.switch().name).toBe("scvMap");
  });

  it("buildInstallArgs() refuses a session without both a spend limit and an allowlist", () => {
    try {
      buildInstallArgs({ sessionKey: SESSION_KEY, policies: [allowlist([APP])], expiresAt: EXPIRES });
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BuckspayError);
      expect((e as BuckspayError).code).toBe("INVALID_CONFIG");
    }
  });

  it("buildInstallArgs() rejects a sessionKey that is not an ed25519 G-address", () => {
    expect(() =>
      buildInstallArgs({
        sessionKey: "not-a-key",
        policies: [spendLimit({ token: USDC, max: "1" }), allowlist([APP])],
        expiresAt: EXPIRES
      })
    ).toThrowError(/ed25519|session key/i);
  });

  it("buildRevokeArgs() encodes [BytesN(sessionKey)]", () => {
    const args = buildRevokeArgs({ sessionKey: SESSION_KEY });
    expect(args.length).toBe(1);
    expect(args[0]!.switch().name).toBe("scvBytes");
    expect(StrKey.encodeEd25519PublicKey(args[0]!.bytes())).toBe(SESSION_KEY);
  });
});

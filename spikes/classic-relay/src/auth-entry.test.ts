import { describe, it, expect } from "vitest";
import { Address, scValToNative } from "@stellar/stellar-sdk";
import { toStroops, randomNonce, buildUnsignedEntry } from "./auth-entry.js";

const SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const FROM = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const TO = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

describe("auth-entry primitives", () => {
  it("toStroops converts human USDC to 7-decimal stroops", () => {
    expect(toStroops("1.5", 7)).toBe(15000000n);
    expect(toStroops("1", 7)).toBe(10000000n);
    expect(toStroops("0.0000001", 7)).toBe(1n);
  });

  it("randomNonce stays within the facilitator's 52-bit Number() ceiling", () => {
    for (let i = 0; i < 200; i++) {
      const n = randomNonce();
      expect(n >= 0n).toBe(true);
      expect(n <= 0x000fffffffffffffn).toBe(true);
      expect(Number.isSafeInteger(Number(n))).toBe(true);
    }
  });

  it("buildUnsignedEntry encodes a transfer(from,to,amount) invocation on the SAC", () => {
    const entry = buildUnsignedEntry({ sac: SAC, from: FROM, to: TO, stroops: 15000000n, nonce: 42n });
    const fn = entry.rootInvocation().function();
    expect(fn.switch().name).toBe("sorobanAuthorizedFunctionTypeContractFn");
    const invoke = fn.contractFn();
    expect(Address.fromScAddress(invoke.contractAddress()).toString()).toBe(SAC);
    expect(invoke.functionName().toString()).toBe("transfer");
    const args = invoke.args();
    expect(args.length).toBe(3);
    expect(Address.fromScVal(args[0]!).toString()).toBe(FROM);
    expect(Address.fromScVal(args[1]!).toString()).toBe(TO);
    expect(BigInt(scValToNative(args[2]!) as bigint)).toBe(15000000n);
    // credentials must be SorobanAddressCredentials carrying the nonce
    const creds = entry.credentials();
    expect(creds.switch().name).toBe("sorobanCredentialsAddress");
    expect(creds.address().nonce().toString()).toBe("42");
  });
});

import { describe, expect, it } from "vitest";
import { Address, Keypair, StrKey, xdr } from "@stellar/stellar-sdk";
import { buildUnsignedEntry } from "../src/auth-entry-builder";

// Deterministic fixtures (no network).
const FROM = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1)).publicKey(); // G…
const TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 2)).publicKey(); // G…
const SAC = StrKey.encodeContract(Buffer.alloc(32, 9)); // C… USDC SAC

describe("buildUnsignedEntry", () => {
  const entry = buildUnsignedEntry({ sac: SAC, from: FROM, to: TO, stroops: 15_000_000n, nonce: 42n });

  it("returns a SorobanAuthorizationEntry with address credentials", () => {
    expect(entry).toBeInstanceOf(xdr.SorobanAuthorizationEntry);
    expect(entry.credentials().switch()).toBe(xdr.SorobanCredentialsType.sorobanCredentialsAddress());
  });

  it("binds credentials to the `from` address with the given nonce and a zero expiry", () => {
    const creds = entry.credentials().address();
    expect(Address.fromScAddress(creds.address()).toString()).toBe(FROM);
    expect(creds.nonce().toString()).toBe("42");
    expect(creds.signatureExpirationLedger()).toBe(0);
    expect(creds.signature().switch()).toBe(xdr.ScValType.scvVoid());
  });

  it("invokes transfer(from, to, i128 amount) on the SAC contract", () => {
    const fn = entry.rootInvocation().function().contractFn();
    expect(fn.functionName().toString()).toBe("transfer");
    expect(Address.fromScAddress(fn.contractAddress()).toString()).toBe(SAC);
    const args = fn.args();
    expect(args).toHaveLength(3);
    expect(Address.fromScAddress(args[0]!.address()).toString()).toBe(FROM);
    expect(Address.fromScAddress(args[1]!.address()).toString()).toBe(TO);
    // 15000000 fits in the lo 64 bits of the i128.
    expect(args[2]!.i128().lo().toString()).toBe("15000000");
  });

  it("has no sub-invocations", () => {
    expect(entry.rootInvocation().subInvocations()).toHaveLength(0);
  });

  it("round-trips through base64 XDR unchanged", () => {
    const b64 = entry.toXDR("base64");
    const back = xdr.SorobanAuthorizationEntry.fromXDR(b64, "base64");
    expect(back.toXDR("base64")).toBe(b64);
  });
});

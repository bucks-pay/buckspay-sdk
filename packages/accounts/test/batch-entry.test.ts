import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Address, nativeToScVal, StrKey, xdr } from "@stellar/stellar-sdk";
import { classicAccount } from "../src/classic/classic-account";
import { ozContractAccount } from "../src/oz-contract";
import type { Call } from "@buckspay/core";

const USDC = StrKey.encodeContract(Buffer.alloc(32, 7));
const FROM_G = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const FROM_C = StrKey.encodeContract(Buffer.alloc(32, 11));
const TO_1 = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const TO_2 = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 22));
const NONCE = 123456789n;
const ROUTER = StrKey.encodeContract(Buffer.alloc(32, 99));

const transfer = (from: string, to: string, amt: bigint): Call => ({
  contract: USDC,
  fn: "transfer",
  args: [new Address(from).toScVal(), new Address(to).toScVal(), nativeToScVal(amt, { type: "i128" })]
});

describe("buildUnsignedBatchEntry — golden batch-of-1 parity (CRITICAL INVARIANT)", () => {
  it("classic: a 1-call batch is byte-identical to the single-call buildUnsignedEntry", () => {
    const a = classicAccount();
    const call = transfer(FROM_G, TO_1, 1500000n);
    const single = a.buildUnsignedEntry({ from: FROM_G, call, nonce: NONCE });
    const batched = a.buildUnsignedBatchEntry({ from: FROM_G, calls: [call], nonce: NONCE, network: "testnet" });
    expect(batched.toXDR("base64")).toBe(single.toXDR("base64"));
  });

  it("oz-contract: a 1-call batch is byte-identical to the single-call buildUnsignedEntry", () => {
    const a = ozContractAccount({ network: "testnet" });
    const call = transfer(FROM_C, TO_1, 1500000n);
    const single = a.buildUnsignedEntry({ from: FROM_C, call, nonce: NONCE });
    const batched = a.buildUnsignedBatchEntry({ from: FROM_C, calls: [call], nonce: NONCE, network: "testnet" });
    expect(batched.toXDR("base64")).toBe(single.toXDR("base64"));
  });
});

describe("buildUnsignedBatchEntry — N>1 (Multicall batch_transfer)", () => {
  it("classic N>1: root = router.batch_transfer(payer, token, Vec<[to,amount]>) + N transfer subs", () => {
    const a = classicAccount({ multicallContract: ROUTER });
    const calls = [transfer(FROM_G, TO_1, 1n), transfer(FROM_G, TO_2, 2n)];
    const e = a.buildUnsignedBatchEntry({ from: FROM_G, calls, nonce: NONCE, network: "testnet" });
    const creds = e.credentials();
    expect(creds.switch().name).toBe("sorobanCredentialsAddress");
    expect(Address.fromScAddress(creds.address().address()).toString()).toBe(FROM_G);
    expect(creds.address().nonce().toString()).toBe(NONCE.toString());
    const fn = e.rootInvocation().function().contractFn();
    expect(Address.fromScAddress(fn.contractAddress()).toString()).toBe(ROUTER);
    expect(fn.functionName().toString()).toBe("batch_transfer");
    const args = fn.args();
    expect(args).toHaveLength(3);
    expect(Address.fromScVal(args[0]!).toString()).toBe(FROM_G); // payer
    expect(Address.fromScVal(args[1]!).toString()).toBe(USDC); // token
    expect(args[2]!.vec()!).toHaveLength(2); // two (to, amount) tuples
    expect(Address.fromScVal(args[2]!.vec()![1]!.vec()![0]!).toString()).toBe(TO_2);
    expect(e.rootInvocation().subInvocations()).toHaveLength(2); // one transfer per call
  });

  it("oz-contract N>1: same shape, credentials bind the C-address", () => {
    const a = ozContractAccount({ network: "testnet", multicallContract: ROUTER });
    const calls = [transfer(FROM_C, TO_1, 1n), transfer(FROM_C, TO_2, 2n)];
    const e = a.buildUnsignedBatchEntry({ from: FROM_C, calls, nonce: NONCE, network: "testnet" });
    expect(Address.fromScAddress(e.credentials().address().address()).toString()).toBe(FROM_C);
    const fn = e.rootInvocation().function().contractFn();
    expect(Address.fromScAddress(fn.contractAddress()).toString()).toBe(ROUTER);
    expect(fn.functionName().toString()).toBe("batch_transfer");
    expect(e.rootInvocation().subInvocations()).toHaveLength(2);
  });

  it("rejects an empty batch", () => {
    const a = classicAccount();
    expect(() => a.buildUnsignedBatchEntry({ from: FROM_G, calls: [], nonce: NONCE, network: "testnet" })).toThrowError(
      /at least one/i
    );
  });

  it("rejects a batch mixing tokens (batch_transfer is single-token)", () => {
    const a = classicAccount({ multicallContract: ROUTER });
    const OTHER = StrKey.encodeContract(Buffer.alloc(32, 8));
    const calls = [transfer(FROM_G, TO_1, 1n), { ...transfer(FROM_G, TO_2, 2n), contract: OTHER }];
    expect(() => a.buildUnsignedBatchEntry({ from: FROM_G, calls, nonce: NONCE, network: "testnet" })).toThrowError(
      /same token|single-token/i
    );
  });
});

describe("buildUnsignedBatchEntry — fixture golden (REAL on-chain entry)", () => {
  // The multicall-batch.json fixture is the on-chain-proven batch entry. The SDK
  // encoder must reproduce it byte-for-byte (unsigned). We reconstruct its inputs and rebuild.
  const here = dirname(fileURLToPath(import.meta.url));
  const fixturePath = join(here, "..", "..", "..", "spikes", "sp2-multicall", "fixtures", "multicall-batch.json");

  it("classic reproduces multicall-batch.json byte-for-byte (unsigned)", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8")) as {
      authorizationEntryXdr: string;
      multicall: string;
    };
    const signed = xdr.SorobanAuthorizationEntry.fromXDR(raw.authorizationEntryXdr, "base64");
    // Normalize to UNSIGNED: zero expiration + void signature.
    const fc = signed.credentials().address();
    fc.signatureExpirationLedger(0);
    fc.signature(xdr.ScVal.scvVoid());
    const expectedUnsigned = signed.toXDR("base64");

    // Reconstruct (from, token, nonce, calls) from the fixture's batch_transfer invocation.
    const fn = signed.rootInvocation().function().contractFn();
    const payer = Address.fromScVal(fn.args()[0]!).toString();
    const token = Address.fromScVal(fn.args()[1]!).toString();
    const nonce = BigInt(signed.credentials().address().nonce().toString());
    const calls: Call[] = fn.args()[2]!.vec()!.map((t) => ({
      contract: token,
      fn: "transfer",
      args: [new Address(payer).toScVal(), t.vec()![0]!, t.vec()![1]!]
    }));

    const a = classicAccount({ multicallContract: raw.multicall });
    const built = a.buildUnsignedBatchEntry({ from: payer, calls, nonce, network: "testnet" });
    expect(built.toXDR("base64")).toBe(expectedUnsigned);
  });
});

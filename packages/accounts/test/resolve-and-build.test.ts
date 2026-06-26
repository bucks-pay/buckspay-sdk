import { describe, it, expect, vi } from "vitest";
import { Address, Keypair, nativeToScVal, StrKey } from "@stellar/stellar-sdk";
import { classicAccount } from "../src/classic/classic-account.js";
import type { BuckspaySigner, BuildEntryInput, Call } from "@buckspay/core";

// Build valid StrKeys programmatically (the same approach as core's test mocks) —
// hardcoded address literals fail StrKey checksum validation in `new Address(...)`.
const G_FROM = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 11)).publicKey();
const G_TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 22)).publicKey();
const SAC = StrKey.encodeContract(Buffer.alloc(32, 33));

function mockSigner(): BuckspaySigner {
  return {
    type: "wallets-kit",
    getPublicKey: vi.fn().mockResolvedValue({ type: "ed25519", publicKey: G_FROM }),
    signAuthEntry: vi.fn()
  };
}

const call: Call = {
  contract: SAC,
  fn: "transfer",
  args: [
    new Address(G_FROM).toScVal(),
    new Address(G_TO).toScVal(),
    nativeToScVal(15_000_000n, { type: "i128" })
  ]
};

describe("classicAccount resolveAddress + buildUnsignedEntry", () => {
  it("resolveAddress returns the G-address from the signer", async () => {
    const adapter = classicAccount();
    const addr = await adapter.resolveAddress(mockSigner());
    expect(addr).toBe(G_FROM);
  });

  it("buildUnsignedEntry binds credentials to `from` (G-address) and carries the nonce", () => {
    const adapter = classicAccount();
    const input: BuildEntryInput = { from: G_FROM, call, nonce: 42n };
    const entry = adapter.buildUnsignedEntry(input);
    // SorobanAddressCredentials.address must equal the `from` account.
    const creds = entry.credentials().address();
    const credAddr = Address.fromScAddress(creds.address()).toString();
    expect(credAddr).toBe(G_FROM);
    expect(creds.nonce().toString()).toBe("42");
  });

  it("buildUnsignedEntry translates the Call to the SAC transfer invocation", () => {
    const adapter = classicAccount();
    const entry = adapter.buildUnsignedEntry({ from: G_FROM, call, nonce: 7n });
    const invocation = entry.rootInvocation();
    const fn = invocation.function().contractFn();
    expect(fn.functionName().toString()).toBe("transfer");
    expect(Address.fromScAddress(fn.contractAddress()).toString()).toBe(SAC);
    // args: [from, to, amount(i128)]
    const args = fn.args();
    expect(args).toHaveLength(3);
    const toScVal = args[1];
    const amountScVal = args[2];
    if (!toScVal || !amountScVal) throw new Error("missing args");
    expect(Address.fromScVal(toScVal).toString()).toBe(G_TO);
    expect(amountScVal.i128().lo().toString()).toBe("15000000");
  });

  it("buildUnsignedEntry throws INVALID_CONFIG when the call lacks (to, amount) args", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const adapter = classicAccount();
    const bad: Call = { contract: SAC, fn: "transfer", args: [new Address(G_FROM).toScVal()] };
    expect(() => adapter.buildUnsignedEntry({ from: G_FROM, call: bad, nonce: 1n })).toThrow(
      BuckspayError
    );
  });
});

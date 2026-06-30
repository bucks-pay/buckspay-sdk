import { describe, expect, it } from "vitest";
import { Address, StrKey } from "@stellar/stellar-sdk";
import { BuckspayClient } from "../src/client";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";
import type { AccountSimContext } from "../src/client";

function fakeSim(): AccountSimContext {
  // A valid recorded entry — prepare's revert check decodes it; the forward() entry is built manually.
  const recorded = buildUnsignedEntry({ sac: MOCK_SAC, from: MOCK_FROM, to: MOCK_TO, stroops: 15_000_000n, nonce: 42n });
  return {
    simulator: {
      async simulate() {
        return { auth: [recorded.toXDR("base64")], minResourceFee: "1000000" };
      }
    },
    getLatestLedger: async () => 1_000_000,
    randomNonce: () => 42n
  };
}

const FORWARDER = StrKey.encodeContract(Buffer.alloc(32, 55));
const COLLECTOR = StrKey.encodeContract(Buffer.alloc(32, 66));

function tokenQuote() {
  return {
    forwarder: FORWARDER,
    collector: COLLECTOR,
    token: MOCK_SAC,
    estimatedXlmFee: "1000000",
    tokenAmount: "132000",
    expiresAtLedger: 1_000_120
  };
}

describe("BuckspayClient.prepare — gas mode token (single forward() entry)", () => {
  it("builds ONE forward(payer, token, merchant, payment, collector, fee) entry with 2 sub-transfers", async () => {
    const { config, relayer } = makeMockConfig();
    relayer.nextFeeQuote = tokenQuote();
    const client = new BuckspayClient({ ...config, gas: { mode: "token", token: MOCK_SAC } }, fakeSim());
    await client.connect();

    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "0.01" });
    const intent = await client.prepare([call]);

    const root = intent.unsignedEntry.rootInvocation();
    const fn = root.function().contractFn();
    expect(fn.functionName().toString()).toBe("forward");
    expect(Address.fromScAddress(fn.contractAddress()).toString()).toBe(FORWARDER);
    const args = fn.args();
    expect(args).toHaveLength(6);
    expect(Address.fromScVal(args[2]!).toString()).toBe(MOCK_TO); // merchant
    expect(Address.fromScVal(args[4]!).toString()).toBe(COLLECTOR); // collector
    expect(args[5]!.i128().lo().toString()).toBe("132000"); // fee
    // the auth tree declares the forwarder's two sub-transfers (merchant + collector).
    expect(root.subInvocations()).toHaveLength(2);

    expect(intent.feeQuote?.tokenAmount).toBe("132000");
    expect(relayer.feeQuoteCalls).toHaveLength(1);
  });

  it("sponsored mode attaches NO feeQuote (byte-identical to SP-1)", async () => {
    const { config } = makeMockConfig(); // gas: sponsored
    const client = new BuckspayClient(config, fakeSim());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "0.01" });
    const intent = await client.prepare([call]);
    expect(intent.feeQuote).toBeUndefined();
    expect("feeToken" in intent).toBe(false);
  });

  it("throws TOKEN_GAS_REJECTED when the quote exceeds gas.maxFee", async () => {
    const { config, relayer } = makeMockConfig();
    relayer.nextFeeQuote = tokenQuote(); // tokenAmount 132000
    const client = new BuckspayClient(
      { ...config, gas: { mode: "token", token: MOCK_SAC, maxFee: "100000" } },
      fakeSim()
    );
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "0.01" });
    await expect(client.prepare([call])).rejects.toMatchObject({ code: "TOKEN_GAS_REJECTED" });
  });
});

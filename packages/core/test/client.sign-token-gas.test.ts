import { describe, expect, it } from "vitest";
import { StrKey } from "@stellar/stellar-sdk";
import { BuckspayClient } from "../src/client";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";
import type { AccountSimContext } from "../src/client";

function fakeSim(): AccountSimContext {
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

const quote = () => ({
  forwarder: StrKey.encodeContract(Buffer.alloc(32, 55)),
  collector: StrKey.encodeContract(Buffer.alloc(32, 66)),
  token: MOCK_SAC,
  estimatedXlmFee: "1000000",
  tokenAmount: "132000",
  expiresAtLedger: 1_000_120
});

describe("BuckspayClient.sign — gas mode token", () => {
  it("signs ONE entry (the forward()) and sets feeToken", async () => {
    const { config, relayer, signer } = makeMockConfig();
    relayer.nextFeeQuote = quote();
    const client = new BuckspayClient({ ...config, gas: { mode: "token", token: MOCK_SAC } }, fakeSim());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "0.01" });
    const signed = await client.sign(await client.prepare([call]));

    expect(typeof signed.authorizationEntryXdr).toBe("string");
    expect(signed.feeToken).toBe(MOCK_SAC);
    expect(signer.signCalls).toBe(1); // single forward() entry → one signature
  });

  it("sponsored intent signs once and carries no feeToken", async () => {
    const { config, signer } = makeMockConfig();
    const client = new BuckspayClient(config, fakeSim());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "0.01" });
    const signed = await client.sign(await client.prepare([call]));
    expect("feeToken" in signed).toBe(false);
    expect(signer.signCalls).toBe(1);
  });
});

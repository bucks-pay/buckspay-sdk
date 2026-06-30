import { describe, expect, it } from "vitest";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import { BuckspayClient } from "../src/client";
import { GasAbstractionEngine } from "../src/gas-abstraction-engine";
import { batch } from "../src/batch";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";
import type { AccountSimContext } from "../src/client";
import type { Call, SignedIntent } from "../src/types";

const transfer: Call = {
  contract: MOCK_SAC,
  fn: "transfer",
  args: [new Address(MOCK_FROM).toScVal(), new Address(MOCK_TO).toScVal(), nativeToScVal(1_500_000n, { type: "i128" })]
};

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

describe("no-regression parity (sponsored payload + batch-of-1)", () => {
  it("(a) a sponsored toRelayPayload carries no fee-token / session fields", () => {
    const engine = new GasAbstractionEngine({ mode: "sponsored" });
    const signed: SignedIntent = {
      from: "GFROM",
      to: "GTO",
      token: "CUSDC",
      value: "1000",
      nonce: "7",
      signatureExpirationLedger: 100,
      network: "testnet",
      authorizationEntryXdr: "AAAA"
    };
    const payload = engine.toRelayPayload(signed);
    // The sponsored payload carries NO fee-token / session markers; token mode adds feeToken.
    expect("feeToken" in payload).toBe(false);
    expect("sessionOp" in payload).toBe(false);
    // And the intent fields carry through verbatim.
    expect(payload).toMatchObject({
      from: "GFROM",
      to: "GTO",
      token: "CUSDC",
      value: "1000",
      nonce: "7",
      signatureExpirationLedger: 100,
      authorizationEntryXdr: "AAAA"
    });
  });

  it("(b) a batch of 1 produces the SAME unsigned entry as the single-call path", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config, fakeSim());
    await client.connect();

    // Single-call path: prepare([call]) builds one entry via buildUnsignedEntry.
    const single = await client.prepare([transfer]);
    // Batch path: a batch of exactly one must converge on the identical entry (a golden).
    const oneBatch = batch(transfer).build();
    const batched = await client.prepare(oneBatch);

    expect(oneBatch).toHaveLength(1);
    expect(batched.unsignedEntry.toXDR("base64")).toBe(single.unsignedEntry.toXDR("base64"));
    expect(batched.preimageXdr).toBe(single.preimageXdr);
  });
});

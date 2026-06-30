import { describe, expect, it, vi } from "vitest";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import { BuckspayClient } from "../src/client";
import { MAX_BATCH_CALLS } from "../src/batch";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";
import type { AccountSimContext } from "../src/client";
import type { Call } from "../src/types";

const tx = (amt: bigint): Call => ({
  contract: MOCK_SAC,
  fn: "transfer",
  args: [new Address(MOCK_FROM).toScVal(), new Address(MOCK_TO).toScVal(), nativeToScVal(amt, { type: "i128" })]
});

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

describe("BuckspayClient.sendCalls (EIP-5792 alias of pay)", () => {
  it("delegates to pay() for an in-range batch", async () => {
    const { config } = makeMockConfig();
    const c = new BuckspayClient(config, fakeSim());
    await c.connect();
    const paySpy = vi.spyOn(c, "pay");
    await c.sendCalls([tx(1n), tx(2n)]);
    expect(paySpy).toHaveBeenCalledOnce();
  });

  it("throws BATCH_TOO_LARGE over the ceiling, before pay()", async () => {
    const { config } = makeMockConfig();
    const c = new BuckspayClient(config, fakeSim());
    await c.connect();
    const paySpy = vi.spyOn(c, "pay");
    const tooMany = Array.from({ length: MAX_BATCH_CALLS + 1 }, (_, i) => tx(BigInt(i + 1)));
    await expect(c.sendCalls(tooMany)).rejects.toMatchObject({ code: "BATCH_TOO_LARGE" });
    expect(paySpy).not.toHaveBeenCalled();
  });
});

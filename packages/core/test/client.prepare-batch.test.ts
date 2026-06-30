import { describe, expect, it, vi } from "vitest";
import { Address, nativeToScVal, StrKey } from "@stellar/stellar-sdk";
import { BuckspayClient } from "../src/client";
import { MAX_BATCH_CALLS } from "../src/batch";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";
import type { AccountSimContext } from "../src/client";
import type { Call } from "../src/types";

const TO_1 = MOCK_TO;
const TO_2 = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 44));

const tx = (to: string, amt: bigint): Call => ({
  contract: MOCK_SAC,
  fn: "transfer",
  args: [new Address(MOCK_FROM).toScVal(), new Address(to).toScVal(), nativeToScVal(amt, { type: "i128" })]
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

describe("BuckspayClient.prepare — batch path", () => {
  it("calls.length === 1 produces the SAME intent as the single-call path (byte-identical entry, no batch wrapping)", async () => {
    const { config } = makeMockConfig();
    const c = new BuckspayClient(config, fakeSim());
    await c.connect();
    const single = await c.prepare([tx(TO_1, 1500000n)]);
    const direct = config.account.buildUnsignedEntry({
      from: single.from,
      call: tx(TO_1, 1500000n),
      nonce: BigInt(single.nonce)
    });
    expect(single.unsignedEntry.toXDR("base64")).toBe(direct.toXDR("base64"));
  });

  it("calls.length > 1 builds ONE batched entry via buildUnsignedBatchEntry (value = aggregate)", async () => {
    const { config } = makeMockConfig();
    const spy = vi.spyOn(config.account, "buildUnsignedBatchEntry");
    const c = new BuckspayClient(config, fakeSim());
    await c.connect();
    const intent = await c.prepare([tx(TO_1, 1n), tx(TO_2, 2n)]);
    expect(spy).toHaveBeenCalledOnce();
    expect(intent.unsignedEntry.credentials().switch().name).toBe("sorobanCredentialsAddress");
    expect(intent.value).toBe("3"); // aggregate of the two transfers
  });

  it("over the ceiling throws BATCH_TOO_LARGE before any simulation or entry build", async () => {
    const { config } = makeMockConfig();
    const spy = vi.spyOn(config.account, "buildUnsignedBatchEntry");
    const c = new BuckspayClient(config, fakeSim());
    await c.connect();
    const tooMany = Array.from({ length: MAX_BATCH_CALLS + 1 }, (_, i) => tx(TO_1, BigInt(i + 1)));
    await expect(c.prepare(tooMany)).rejects.toMatchObject({ code: "BATCH_TOO_LARGE" });
    expect(spy).not.toHaveBeenCalled();
  });
});
